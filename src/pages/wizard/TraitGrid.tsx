import { useState } from "react"
import { useCharacterStore } from "../../state/characterStore"
import { getTraitCount, MAX_TRAITS, type Character } from "../../models/character"
import type { TraitDef, MortalCategory } from "../../data/traits"
import { TraitCard } from "./TraitCard"
import { CustomTraitRow } from "./CustomTraitRow"

type TraitListKey = "mortal_traits" | "vampire_traits"

const MORTAL_CATEGORIES: [MortalCategory, string][] = [
  ["personality", "🎭 Personality"],
  ["mental", "🧠 Mental"],
  ["body", "💪 Body"],
  ["sensory", "👁 Sensory"],
]

function TraitCardGroup({ traitListKey, group }: { traitListKey: TraitListKey; group: TraitDef[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
      {group.map((t) => (
        <TraitCard key={t.key} traitListKey={traitListKey} traitDef={t} />
      ))}
    </div>
  )
}

export function TraitGrid({
  traitListKey,
  traitsSource,
  categorized,
}: {
  traitListKey: TraitListKey
  traitsSource: TraitDef[]
  categorized?: boolean
}) {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)

  const [customOpen, setCustomOpen] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customCost, setCustomCost] = useState(-1)
  const [customDetail, setCustomDetail] = useState("")
  const [warning, setWarning] = useState("")

  const customTraits = character[traitListKey]
    .map((t, i) => [i, t] as const)
    .filter(([, t]) => t.custom)

  return (
    <div>
      {categorized ? (
        MORTAL_CATEGORIES.map(([catKey, catLabel]) => {
          const group = traitsSource.filter((t) => t.category === catKey)
          if (group.length === 0) return null
          return (
            <div key={catKey} style={{ marginBottom: "1rem" }}>
              <strong>{catLabel}</strong>
              <div style={{ marginTop: "0.4rem" }}>
                <TraitCardGroup traitListKey={traitListKey} group={group} />
              </div>
            </div>
          )
        })
      ) : (
        <TraitCardGroup traitListKey={traitListKey} group={traitsSource} />
      )}

      <div className="panel" style={{ marginTop: "1rem" }}>
        <button type="button" className="btn btn-secondary" style={{ width: "100%", textAlign: "left" }} onClick={() => setCustomOpen((o) => !o)}>
          {customOpen ? "▾" : "▸"} ✏️ Add a Custom Trait
        </button>

        {customOpen && (
          <div style={{ marginTop: "0.75rem" }}>
            {customTraits.length > 0 && (
              <>
                <strong>Your Custom Traits</strong>
                <div style={{ marginTop: "0.4rem" }}>
                  {customTraits.map(([i]) => (
                    <CustomTraitRow key={i} traitListKey={traitListKey} index={i} />
                  ))}
                </div>
                <hr />
              </>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "0.4rem", marginBottom: "0.4rem" }}>
              <input
                type="text"
                placeholder="e.g., Notorious Criminal"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
              <input type="number" min={-5} max={5} value={customCost} onChange={(e) => setCustomCost(Number(e.target.value))} />
            </div>
            <input
              type="text"
              placeholder="Any clarifying notes"
              value={customDetail}
              onChange={(e) => setCustomDetail(e.target.value)}
              style={{ width: "100%", marginBottom: "0.4rem" }}
            />
            {warning && <div className="alert alert-error">{warning}</div>}
            <button
              className="btn btn-primary"
              onClick={() => {
                if (getTraitCount(character) >= MAX_TRAITS) {
                  setWarning(`Maximum ${MAX_TRAITS} traits reached.`)
                  return
                }
                if (!customName.trim()) {
                  setWarning("Enter a trait name.")
                  return
                }
                updateCharacter((c: Character) => {
                  c[traitListKey].push({
                    key: `custom_${customName.trim().toLowerCase().replace(/ /g, "_")}`,
                    name: customName.trim(),
                    cost: Math.trunc(customCost),
                    detail: customDetail.trim() || null,
                    sub_choice: null,
                    custom: true,
                  })
                })
                setCustomName("")
                setCustomCost(-1)
                setCustomDetail("")
                setWarning("")
              }}
            >
              Add Custom Trait
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
