import type { ReactNode, CSSProperties } from "react"
import { useCharacterStore } from "../../state/characterStore"
import { SectionHeader } from "../../components/SectionHeader"
import { Dots, dotsString } from "../../components/Dots"
import { SKILL_TREES, getStaticBase, totalSkillXp } from "../../data/skillTrees"
import { totalDiscXp } from "../../data/disciplines"
import { getHpMax, BASE_WILLPOWER, BASE_BLOOD, CREATION_SKILL_XP, CREATION_DISC_XP } from "../../models/character"

function Tracker({
  display,
  caption,
  captionStyle,
  onMinus,
  onPlus,
  minusDisabled,
}: {
  display: ReactNode
  caption: string
  captionStyle?: CSSProperties
  onMinus: () => void
  onPlus: () => void
  minusDisabled: boolean
}) {
  return (
    <div className="tracker-row">
      <div style={{ flex: 1 }}>
        {display}
        <div className="caption" style={captionStyle}>
          {caption}
        </div>
      </div>
      <button className="btn btn-secondary btn-icon" onClick={onMinus} disabled={minusDisabled}>
        −
      </button>
      <button className="btn btn-secondary btn-icon" onClick={onPlus}>
        +
      </button>
    </div>
  )
}

export function SummaryTab() {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)

  const hpMax = getHpMax(character)
  const hpCur = Math.max(0, character.hp_current)
  const wpCur = Math.max(0, character.willpower_current)
  const blCur = character.blood_current
  const inHunger = blCur < 0
  const hungerColor = "#ff3030"

  const skillXp = totalSkillXp(character.skill_dots, character.custom_skills)
  const discXp = totalDiscXp(character.discipline_levels)
  const totalXp = CREATION_SKILL_XP + CREATION_DISC_XP + character.earned_xp
  const spentXp = skillXp + discXp

  const skillRows: ReactNode[] = []
  for (const [treeName, tree] of Object.entries(SKILL_TREES)) {
    for (const [skillName, skill] of Object.entries(tree)) {
      const d = character.skill_dots[skillName] ?? 0
      if (!d) continue
      const base = getStaticBase(skillName, treeName)
      skillRows.push(
        <tr key={skillName}>
          <td style={{ color: "var(--text-muted)" }}>{treeName}</td>
          <td>
            <strong>{skillName}</strong>
          </td>
          <td>
            {base > 0 ? `${dotsString(base, base)} + ` : ""}
            {dotsString(d, skill.maxDots)}
          </td>
        </tr>,
      )
    }
  }
  for (const cs of character.custom_skills) {
    const d = character.skill_dots[cs.name] ?? 0
    if (d) {
      skillRows.push(
        <tr key={cs.name}>
          <td style={{ color: "var(--text-muted)" }}>Custom</td>
          <td>
            <strong>{cs.name}</strong>
          </td>
          <td>{dotsString(d, cs.maxDots)}</td>
        </tr>,
      )
    }
  }

  return (
    <div>
      <SectionHeader>Status Trackers</SectionHeader>

      <h4>Hit Points</h4>
      <Tracker
        display={<Dots current={hpCur} max={hpMax} style={{ fontSize: "1.4rem" }} />}
        caption={`${hpCur} / ${hpMax}`}
        onMinus={() =>
          updateCharacter((c) => {
            c.hp_current = Math.max(0, c.hp_current - 1)
          })
        }
        onPlus={() =>
          updateCharacter((c) => {
            c.hp_current = Math.min(hpMax, c.hp_current + 1)
          })
        }
        minusDisabled={hpCur <= 0}
      />

      <h4>Willpower</h4>
      <Tracker
        display={<Dots current={wpCur} max={BASE_WILLPOWER} style={{ fontSize: "1.4rem" }} />}
        caption={`${wpCur} / ${BASE_WILLPOWER}`}
        onMinus={() =>
          updateCharacter((c) => {
            c.willpower_current = Math.max(0, c.willpower_current - 1)
          })
        }
        onPlus={() =>
          updateCharacter((c) => {
            c.willpower_current = Math.min(BASE_WILLPOWER, c.willpower_current + 1)
          })
        }
        minusDisabled={wpCur <= 0}
      />

      <h4 style={inHunger ? { color: hungerColor } : undefined}>{inHunger ? "Hunger" : "Blood"}</h4>
      <Tracker
        display={
          blCur > 0 ? (
            <Dots current={blCur} max={BASE_BLOOD} style={{ fontSize: "1.4rem" }} />
          ) : blCur === 0 ? (
            <span style={{ fontSize: "1.4rem", letterSpacing: "0.06em" }}>{"○".repeat(BASE_BLOOD)}</span>
          ) : (
            <span style={{ fontSize: "1.4rem", letterSpacing: "0.06em", color: hungerColor }}>
              {"○".repeat(BASE_BLOOD)} +{Math.abs(blCur)}
            </span>
          )
        }
        caption={`${blCur} / ${BASE_BLOOD}`}
        captionStyle={inHunger ? { color: hungerColor } : undefined}
        onMinus={() =>
          updateCharacter((c) => {
            c.blood_current -= 1
          })
        }
        onPlus={() =>
          updateCharacter((c) => {
            c.blood_current = Math.min(BASE_BLOOD, c.blood_current + 1)
          })
        }
        minusDisabled={false}
      />
      {blCur <= -4 && <div className="alert">Stigmata threshold reached (if that trait is active).</div>}

      <hr />
      <button
        className="btn btn-secondary"
        onClick={() =>
          updateCharacter((c) => {
            c.hp_current = getHpMax(c)
            c.willpower_current = BASE_WILLPOWER
            c.blood_current = BASE_BLOOD
          })
        }
      >
        Full Restore (HP + WP + Blood to max)
      </button>

      <hr />
      <SectionHeader>Traits</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <strong>Mortal Traits</strong>
          {character.mortal_traits.length === 0 && <div className="caption">None</div>}
          {character.mortal_traits.map((t, i) => (
            <div key={i}>
              <strong>{t.name}</strong> ({t.cost >= 0 ? "+" : ""}
              {t.cost}){t.detail || t.sub_choice ? ` — ${t.detail || t.sub_choice}` : ""}
            </div>
          ))}
        </div>
        <div>
          <strong>Vampire Traits</strong>
          {character.vampire_traits.length === 0 && <div className="caption">None</div>}
          {character.vampire_traits.map((t, i) => (
            <div key={i}>
              <strong>{t.name}</strong> ({t.cost >= 0 ? "+" : ""}
              {t.cost}){t.detail || t.sub_choice ? ` — ${t.detail || t.sub_choice}` : ""}
            </div>
          ))}
        </div>
      </div>

      <hr />
      <SectionHeader>Skills</SectionHeader>
      {skillRows.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ color: "var(--text-muted)" }}>Tree</th>
              <th>Skill</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>{skillRows}</tbody>
        </table>
      ) : (
        <div className="caption">No skills invested.</div>
      )}

      <hr />
      <SectionHeader>Disciplines</SectionHeader>
      {character.unlocked_disciplines.length === 0 && <div className="caption">No disciplines unlocked.</div>}
      {character.unlocked_disciplines.map((discName) => {
        const level = character.discipline_levels[discName] ?? 0
        const powers = character.discipline_powers[discName] ?? []
        return (
          <div key={discName} style={{ marginBottom: "0.4rem" }}>
            <strong>{discName}</strong> — Level {level} <Dots current={level} max={5} />
            {powers.length > 0 && <div className="caption">{powers.join(", ")}</div>}
          </div>
        )
      })}

      {character.memories && (
        <>
          <hr />
          <SectionHeader>Memories</SectionHeader>
          <div style={{ whiteSpace: "pre-wrap" }}>{character.memories}</div>
        </>
      )}

      {character.notes && (
        <>
          <hr />
          <SectionHeader>Notes</SectionHeader>
          <div style={{ whiteSpace: "pre-wrap" }}>{character.notes}</div>
        </>
      )}

      <hr />
      <SectionHeader>Experience Points</SectionHeader>
      <div>
        <strong>Total XP:</strong> {totalXp} · <strong>Spent:</strong> {spentXp} / {totalXp}
      </div>
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
