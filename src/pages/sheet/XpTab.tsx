import { useState } from "react"
import { useCharacterStore } from "../../state/characterStore"
import { SectionHeader } from "../../components/SectionHeader"
import { totalSkillXp } from "../../data/skillTrees"
import { totalDiscXp } from "../../data/disciplines"
import { CREATION_SKILL_XP, CREATION_DISC_XP, getEarnedXpAvailable } from "../../models/character"

export function XpTab() {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)

  const [amount, setAmount] = useState(1)
  const [note, setNote] = useState("")

  const skillXp = totalSkillXp(character.skill_dots, character.custom_skills)
  const discXp = totalDiscXp(character.discipline_levels)
  const earnedAvail = getEarnedXpAvailable(character)

  const totalXp = CREATION_SKILL_XP + CREATION_DISC_XP + character.earned_xp
  const spentXp = skillXp + discXp
  const over = spentXp > totalXp

  return (
    <div>
      <SectionHeader>Experience Points</SectionHeader>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="metric">
          <div className="metric-label">Total XP</div>
          <div className="metric-value">{totalXp}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Spent XP</div>
          <div className="metric-value">
            {spentXp} / {totalXp}
          </div>
          <div style={{ color: over ? "var(--accent)" : "#4a9a6a", fontSize: "0.85rem" }}>
            {over ? `${spentXp - totalXp} over budget` : `${totalXp - spentXp} remaining`}
          </div>
        </div>
      </div>

      <div className="caption" style={{ marginTop: "0.5rem" }}>
        Creation pools: {Math.min(skillXp, CREATION_SKILL_XP)}/{CREATION_SKILL_XP} skill ·{" "}
        {Math.min(discXp, CREATION_DISC_XP)}/{CREATION_DISC_XP} disc · Earned available: {Math.max(0, earnedAvail)}
      </div>

      <hr />
      <strong>Storyteller: Award Earned XP</strong>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr 2fr", gap: "0.5rem", marginTop: "0.5rem" }}>
        <input type="number" min={1} max={100} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        <input
          type="text"
          placeholder="e.g., Session reward"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={() => {
            const award = Math.max(1, Math.min(100, amount))
            updateCharacter((c) => {
              c.earned_xp += award
              c.xp_log.push({ description: `[Award] ${note || "Earned XP"}`, cost: -award })
            })
            setAmount(1)
            setNote("")
          }}
        >
          Award XP
        </button>
      </div>

      <hr />
      <SectionHeader>XP Log</SectionHeader>
      {character.xp_log.length === 0 ? (
        <div className="caption">No XP activity yet.</div>
      ) : (
        character.xp_log.map((e, i) => (
          <div key={i}>{e.cost > 0 ? `− ${e.cost} XP  ${e.description}` : `＋ ${-e.cost} XP  ${e.description}`}</div>
        ))
      )}
    </div>
  )
}
