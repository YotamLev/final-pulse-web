import { useState } from "react"
import { useCharacterStore } from "../../state/characterStore"
import { SectionHeader } from "../../components/SectionHeader"
import { Tabs, type TabItem } from "../../components/Tabs"
import { dotsString } from "../../components/Dots"
import {
  SKILL_TREES,
  type SkillDef,
  getStaticBase,
  getAchievedBase,
  canAddDot,
  canRemoveDot,
  xpCostForNextDot,
  totalSkillXp,
} from "../../data/skillTrees"
import { CREATION_SKILL_XP, getEarnedXpAvailable, logXpSpend, logXpRefund, type Character } from "../../models/character"

function branchDepth(skill: SkillDef, tree: Record<string, SkillDef>): number {
  const branch = skill.branchesFrom
  if (!branch) return 0
  let depth = 1
  if (!Array.isArray(branch[0])) {
    const [parentName] = branch as [string, number]
    const parentSkill = tree[parentName]
    if (parentSkill?.branchesFrom != null) depth = 2
  }
  return depth
}

function branchInfo(skill: SkillDef): string {
  const branch = skill.branchesFrom
  if (!branch) return ""
  if (Array.isArray(branch[0])) {
    const parts = (branch as [string, number][]).map(([p, t]) => `${p} ${t}●`).join(" or ")
    return `← ${parts}`
  }
  const [p, t] = branch as [string, number]
  return `← ${p} ${t}●`
}

function SkillRow({
  skillName,
  skill,
  treeName,
  tree,
  earnedAvail,
  creationRemaining,
}: {
  skillName: string
  skill: SkillDef
  treeName: string
  tree: Record<string, SkillDef>
  earnedAvail: number
  creationRemaining: number
}) {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const own = character.skill_dots

  const d = own[skillName] ?? 0
  const xpNext = xpCostForNextDot(skillName, treeName, own)
  const canAdd = canAddDot(skillName, treeName, own) && xpNext <= creationRemaining + Math.max(0, earnedAvail)
  const canRem = canRemoveDot(skillName, treeName, own)

  const depth = branchDepth(skill, tree)
  const indent = "　".repeat(depth)
  const bInfo = branchInfo(skill)

  const unlocked = canAddDot(skillName, treeName, own) || d > 0
  const lockIcon = unlocked ? "" : "🔒 "

  const base = getStaticBase(skillName, treeName)
  const ownStr = dotsString(d, skill.maxDots)
  let levelStr: string
  if (base > 0) {
    const achieved = getAchievedBase(skillName, treeName, own)
    const baseStr = "●".repeat(achieved) + "○".repeat(base - achieved)
    levelStr = `${baseStr} + ${ownStr}  /${skill.maxDots}`
  } else {
    levelStr = `${ownStr}  /${skill.maxDots}`
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "5fr 3fr 2fr", gap: "0.5rem", alignItems: "start", padding: "0.4rem 0" }}>
      <div>
        <div>
          {indent}
          {lockIcon}
          <strong>{skillName}</strong>
          {bInfo && <small style={{ color: "var(--text-muted)" }}> {bInfo}</small>}
        </div>
        <div className="caption">{skill.description}</div>
      </div>
      <div>
        <div>{levelStr}</div>
        {canAdd && <div className="caption">Next: {xpNext} XP</div>}
      </div>
      <div style={{ display: "flex", gap: "0.4rem" }}>
        <button
          className="btn btn-secondary btn-icon"
          disabled={!canRem}
          onClick={() =>
            updateCharacter((c) => {
              const refund = getStaticBase(skillName, treeName) + d
              c.skill_dots[skillName] = d - 1
              logXpRefund(c, `${skillName} −1 dot`, refund, { skill: skillName })
            })
          }
        >
          −
        </button>
        <button
          className="btn btn-secondary btn-icon"
          disabled={!canAdd}
          onClick={() =>
            updateCharacter((c) => {
              c.skill_dots[skillName] = d + 1
              logXpSpend(c, `${skillName} +1 dot`, xpNext, { skill: skillName })
            })
          }
        >
          +
        </button>
      </div>
    </div>
  )
}

function SkillTreePanel({ treeName, earnedAvail }: { treeName: string; earnedAvail: number }) {
  const character = useCharacterStore((s) => s.character)
  const tree = SKILL_TREES[treeName]
  const creationRemaining = Math.max(0, CREATION_SKILL_XP - totalSkillXp(character.skill_dots, character.custom_skills))

  return (
    <div>
      {Object.entries(tree).map(([skillName, skill]) => (
        <SkillRow
          key={skillName}
          skillName={skillName}
          skill={skill}
          treeName={treeName}
          tree={tree}
          earnedAvail={earnedAvail}
          creationRemaining={creationRemaining}
        />
      ))}
    </div>
  )
}

function CustomSkillsPanel() {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const own = character.skill_dots
  const customSkills = character.custom_skills

  const [newName, setNewName] = useState("")
  const [newMax, setNewMax] = useState(5)
  const [error, setError] = useState("")

  function canSpendSkillXpLocal(c: Character, cost: number): boolean {
    const spent = totalSkillXp(c.skill_dots, c.custom_skills)
    const creationRemaining = Math.max(0, CREATION_SKILL_XP - spent)
    const earned = Math.max(0, getEarnedXpAvailable(c))
    return cost <= creationRemaining + earned
  }

  return (
    <div>
      {customSkills.length === 0 && <div className="caption">No custom skills yet.</div>}
      {customSkills.map((cs, i) => {
        const d = own[cs.name] ?? 0
        const xpNext = d + 1
        const canAdd = d < cs.maxDots && canSpendSkillXpLocal(character, xpNext)
        const canRem = d > 0
        return (
          <div key={cs.name} style={{ display: "grid", gridTemplateColumns: "4fr 3fr 2fr 1fr", gap: "0.5rem", alignItems: "center", padding: "0.4rem 0" }}>
            <div>
              <strong>{cs.name}</strong>
              {canAdd && <div className="caption">Next: {xpNext} XP</div>}
            </div>
            <div>
              {dotsString(d, cs.maxDots)} /{cs.maxDots}
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button
                className="btn btn-secondary btn-icon"
                disabled={!canRem}
                onClick={() =>
                  updateCharacter((c) => {
                    logXpRefund(c, `${cs.name} −1 dot`, d, { skill: cs.name })
                    c.skill_dots[cs.name] = d - 1
                  })
                }
              >
                −
              </button>
              <button
                className="btn btn-secondary btn-icon"
                disabled={!canAdd}
                onClick={() =>
                  updateCharacter((c) => {
                    logXpSpend(c, `${cs.name} +1 dot`, xpNext, { skill: cs.name })
                    c.skill_dots[cs.name] = d + 1
                  })
                }
              >
                +
              </button>
            </div>
            <button
              className="btn btn-secondary btn-icon"
              onClick={() =>
                updateCharacter((c) => {
                  delete c.skill_dots[cs.name]
                  c.custom_skills.splice(i, 1)
                })
              }
            >
              ✕
            </button>
          </div>
        )
      })}

      <hr />
      <strong>Add a Custom Skill</strong>
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr 2fr", gap: "0.5rem", marginTop: "0.5rem" }}>
        <input
          type="text"
          placeholder="e.g. Chess"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          type="number"
          min={1}
          max={7}
          value={newMax}
          onChange={(e) => setNewMax(Number(e.target.value))}
        />
        <button
          className="btn btn-primary"
          onClick={() => {
            const name = newName.trim()
            const existing = [
              ...customSkills.map((cs) => cs.name),
              ...Object.values(SKILL_TREES).flatMap((t) => Object.keys(t)),
            ]
            if (!name) {
              setError("Enter a skill name.")
            } else if (existing.includes(name)) {
              setError(`'${name}' already exists.`)
            } else {
              updateCharacter((c) => {
                c.custom_skills.push({ name, maxDots: newMax })
              })
              setNewName("")
              setNewMax(5)
              setError("")
            }
          }}
        >
          Add Skill
        </button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
    </div>
  )
}

export function SkillsTab() {
  const character = useCharacterStore((s) => s.character)

  const skillXp = totalSkillXp(character.skill_dots, character.custom_skills)
  const earnedAvail = getEarnedXpAvailable(character)
  const creationUsed = Math.min(skillXp, CREATION_SKILL_XP)

  const tabs: TabItem[] = [
    ...Object.keys(SKILL_TREES).map((treeName) => ({
      id: treeName,
      label: treeName,
      render: () => <SkillTreePanel treeName={treeName} earnedAvail={earnedAvail} />,
    })),
    { id: "Custom", label: "Custom", render: () => <CustomSkillsPanel /> },
  ]

  return (
    <div>
      <SectionHeader>Skill Trees</SectionHeader>
      <div>
        Creation skill XP: <strong>{creationUsed} / {CREATION_SKILL_XP}</strong> | Earned XP available:{" "}
        <strong>{Math.max(0, earnedAvail)}</strong>
      </div>
      <Tabs tabs={tabs} />
    </div>
  )
}
