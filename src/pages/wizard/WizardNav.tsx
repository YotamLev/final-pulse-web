import { useCharacterStore } from "../../state/characterStore"

export const STAGES: Record<number, string> = {
  1: "Origins & Traits",
  2: "Skills",
  3: "Disciplines",
  4: "Clan",
}

export function StageNav({ current }: { current: number }) {
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
      {Object.entries(STAGES).map(([numStr, label]) => {
        const num = Number(numStr)
        if (num === current) {
          return (
            <div
              key={num}
              style={{
                textAlign: "center",
                background: "#4a1520",
                padding: "0.4rem",
                borderRadius: "3px",
                border: "1px solid var(--accent)",
                fontFamily: "var(--font-heading)",
                fontSize: "0.8rem",
              }}
            >
              ● {num}. {label}
            </div>
          )
        }
        if (num < current) {
          return (
            <button
              key={num}
              className="btn btn-secondary"
              onClick={() => updateCharacter((c) => { c.wizard_stage = num })}
            >
              ✓ {num}. {label}
            </button>
          )
        }
        return (
          <div key={num} style={{ textAlign: "center", padding: "0.4rem", color: "var(--btn-secondary-border)", fontSize: "0.8rem" }}>
            ○ {num}. {label}
          </div>
        )
      })}
    </div>
  )
}

// Only used for stages 1-3; stage 4 (Clan) has its own finish flow in Stage4Clan.tsx.
export function NavButtons({ stage, nextDisabled = false }: { stage: 1 | 2 | 3; nextDisabled?: boolean }) {
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div>
        {stage > 1 && (
          <button className="btn btn-secondary" onClick={() => updateCharacter((c) => { c.wizard_stage = stage - 1 })}>
            ← Back
          </button>
        )}
      </div>
      <div>
        <button
          className="btn btn-primary"
          disabled={nextDisabled}
          onClick={() => updateCharacter((c) => { c.wizard_stage = stage + 1 })}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
