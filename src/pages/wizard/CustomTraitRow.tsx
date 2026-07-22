import { useState } from "react"
import { useCharacterStore } from "../../state/characterStore"
import type { Character } from "../../models/character"

type TraitListKey = "mortal_traits" | "vampire_traits"

export function CustomTraitRow({ traitListKey, index }: { traitListKey: TraitListKey; index: number }) {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const t = character[traitListKey][index]

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(t.name)
  const [cost, setCost] = useState(t.cost)
  const [detail, setDetail] = useState(t.detail ?? "")
  const [warning, setWarning] = useState("")

  if (editing) {
    return (
      <div className="panel" style={{ marginBottom: "0.4rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "0.4rem", marginBottom: "0.4rem" }}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="number" min={-5} max={5} value={cost} onChange={(e) => setCost(Number(e.target.value))} />
        </div>
        <input
          type="text"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="Any clarifying notes"
          style={{ width: "100%", marginBottom: "0.4rem" }}
        />
        {warning && <div className="alert alert-error">{warning}</div>}
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={() => {
              if (!name.trim()) {
                setWarning("Enter a trait name.")
                return
              }
              updateCharacter((c: Character) => {
                const trait = c[traitListKey][index]
                trait.name = name.trim()
                trait.cost = Math.trunc(cost)
                trait.detail = detail.trim() || null
                trait.key = `custom_${name.trim().toLowerCase().replace(/ /g, "_")}`
              })
              setEditing(false)
            }}
          >
            ✓ Save
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  const s = t.cost >= 0 ? "+" : ""
  return (
    <div style={{ display: "grid", gridTemplateColumns: "5fr 1fr 1fr", gap: "0.4rem", alignItems: "center", marginBottom: "0.3rem" }}>
      <div className="pill">
        <b>{t.name}</b> ({s}
        {t.cost}){t.detail ? ` — ${t.detail}` : ""}
      </div>
      <button className="btn btn-secondary btn-icon" onClick={() => setEditing(true)}>
        ✎
      </button>
      <button
        className="btn btn-secondary btn-icon"
        onClick={() =>
          updateCharacter((c: Character) => {
            c[traitListKey].splice(index, 1)
          })
        }
      >
        ✕
      </button>
    </div>
  )
}
