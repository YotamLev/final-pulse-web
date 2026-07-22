import { useState } from "react"
import { useCharacterStore } from "../../state/characterStore"
import { SectionHeader } from "../../components/SectionHeader"
import { InfoBox } from "../../components/InfoBox"
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
import { CREATION_SKILL_XP, logXpSpend, logXpRefund } from "../../models/character"
import { NavButtons } from "./WizardNav"

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
  budgetRemaining,
}: {
  skillName: string
  skill: SkillDef
  treeName: string
  tree: Record<string, SkillDef>
  budgetRemaining: number
}) {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const own = character.skill_dots

  const d = own[skillName] ?? 0
  const xpNext = xpCostForNextDot(skillName, treeName, own)
  const canAdd = canAddDot(skillName, treeName, own) && budgetRemaining >= xpNext
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

function SkillTreePanel({ treeName, budgetRemaining }: { treeName: string; budgetRemaining: number }) {
  const tree = SKILL_TREES[treeName]
  return (
    <div>
      {Object.entries(tree).map(([skillName, skill]) => (
        <SkillRow key={skillName} skillName={skillName} skill={skill} treeName={treeName} tree={tree} budgetRemaining={budgetRemaining} />
      ))}
    </div>
  )
}

function CustomSkillsPanel({ budgetRemaining }: { budgetRemaining: number }) {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const own = character.skill_dots
  const customSkills = character.custom_skills

  const [newName, setNewName] = useState("")
  const [newMax, setNewMax] = useState(5)
  const [message, setMessage] = useState<{ kind: "error" | "warn"; text: string } | null>(null)

  return (
    <div>
      <SectionHeader>Custom Skills</SectionHeader>
      <InfoBox>Add custom skills like Dance, Chess, Agriculture — standalone skills with no branching.</InfoBox>

      {customSkills.map((cs, i) => {
        const d = own[cs.name] ?? 0
        const xpNext = d + 1
        const canAdd = d < cs.maxDots && budgetRemaining >= xpNext
        const canRem = d > 0
        return (
          <div key={cs.name} style={{ display: "grid", gridTemplateColumns: "3fr 2fr 2fr 1fr", gap: "0.5rem", alignItems: "center", padding: "0.4rem 0" }}>
            <strong>{cs.name}</strong>
            <div>
              {dotsString(d, cs.maxDots)} /{cs.maxDots}
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button
                className="btn btn-secondary btn-icon"
                disabled={!canRem}
                onClick={() =>
                  updateCharacter((c) => {
                    c.skill_dots[cs.name] = d - 1
                    logXpRefund(c, `${cs.name} −1 dot`, d, { skill: cs.name })
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
                    c.skill_dots[cs.name] = d + 1
                    logXpSpend(c, `${cs.name} +1 dot`, xpNext, { skill: cs.name })
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
        <input type="text" placeholder="e.g. Chess" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <input type="number" min={1} max={7} value={newMax} onChange={(e) => setNewMax(Number(e.target.value))} />
        <button
          className="btn btn-primary"
          onClick={() => {
            const name = newName.trim()
            if (!name) {
              setMessage({ kind: "warn", text: "Enter a skill name." })
              return
            }
            const existing = [...customSkills.map((cs) => cs.name), ...Object.keys(SKILL_TREES["Custom"] ?? {})]
            if (existing.includes(name)) {
              setMessage({ kind: "error", text: `Skill '${name}' already exists.` })
              return
            }
            updateCharacter((c) => {
              c.custom_skills.push({ name, maxDots: newMax })
            })
            setNewName("")
            setNewMax(5)
            setMessage(null)
          }}
        >
          Add Custom Skill
        </button>
      </div>
      {message && <div className="alert alert-error">{message.text}</div>}
    </div>
  )
}

export function Stage2Skills() {
  const character = useCharacterStore((s) => s.character)

  const skillXpSpent = totalSkillXp(character.skill_dots, character.custom_skills)
  const remaining = CREATION_SKILL_XP - skillXpSpent

  const tabs: TabItem[] = [
    ...Object.keys(SKILL_TREES).map((treeName) => ({
      id: treeName,
      label: treeName,
      render: () => <SkillTreePanel treeName={treeName} budgetRemaining={remaining} />,
    })),
    { id: "Custom", label: "Custom", render: () => <CustomSkillsPanel budgetRemaining={remaining} /> },
  ]

  return (
    <div>
      <SectionHeader>Stage 2 — Skills</SectionHeader>
      <div>
        <strong>Creation XP:</strong> {skillXpSpent} / {CREATION_SKILL_XP} spent{" "}
        {remaining > 0 ? <strong>{remaining} remaining</strong> : "✓ budget used"}
      </div>
      {remaining < 0 && <div className="alert alert-error">Over budget by {-remaining} XP! Remove some dots.</div>}

      <hr />
      <Tabs tabs={tabs} />

      <hr />
      <NavButtons stage={2} />
    </div>
  )
}
