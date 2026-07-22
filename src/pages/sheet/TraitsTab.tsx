import { useCharacterStore } from "../../state/characterStore"
import { useNavStore } from "../../state/navStore"
import { SectionHeader } from "../../components/SectionHeader"
import { InfoBox } from "../../components/InfoBox"
import { getTotalTraitCost } from "../../models/character"

export function TraitsTab() {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const goTo = useNavStore((s) => s.goTo)

  const total = getTotalTraitCost(character)
  const sign = total >= 0 ? "+" : ""

  return (
    <div>
      <SectionHeader>Character Traits</SectionHeader>
      <div>
        <strong>Total trait cost:</strong> {sign}
        {total} / +2 max
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
        <div>
          <strong>Mortal Traits</strong>
          {character.mortal_traits.length === 0 && <div className="caption">None selected.</div>}
          {character.mortal_traits.map((t, i) => {
            const c = t.cost
            const s = c >= 0 ? "+" : ""
            const det = t.detail || t.sub_choice || ""
            return (
              <div key={i} className="pill">
                <strong>{t.name}</strong> ({s}
                {c}){det ? ` — ${det}` : ""}
              </div>
            )
          })}
        </div>
        <div>
          <strong>Vampire Traits</strong>
          {character.vampire_traits.length === 0 && <div className="caption">None selected.</div>}
          {character.vampire_traits.map((t, i) => {
            const c = t.cost
            const s = c >= 0 ? "+" : ""
            const det = t.detail || t.sub_choice || ""
            return (
              <div key={i} className="pill">
                <strong>{t.name}</strong> ({s}
                {c}){det ? ` — ${det}` : ""}
              </div>
            )
          })}
        </div>
      </div>

      <hr />
      <InfoBox>Both mortal and vampire traits are on Stage 1 of the Character Creator.</InfoBox>
      <button
        className="btn btn-secondary"
        onClick={() => {
          updateCharacter((c) => {
            c.wizard_stage = 1
          })
          goTo("wizard")
        }}
      >
        → Stage 1: Origins & Traits
      </button>
    </div>
  )
}
