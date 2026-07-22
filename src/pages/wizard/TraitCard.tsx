import { useState } from "react"
import { useCharacterStore } from "../../state/characterStore"
import { getTraitCount, MAX_TRAITS, type Character } from "../../models/character"
import type { TraitDef } from "../../data/traits"

function costBadgeStyle(cost: number | null): React.CSSProperties {
  if (cost === null) return { background: "#2a2010", color: "#9a8060" }
  if (cost > 0) return { background: "var(--cost-positive-bg)", color: "var(--cost-positive-text)" }
  if (cost < 0) return { background: "var(--cost-negative-bg)", color: "var(--cost-negative-text)" }
  return { background: "var(--cost-zero-bg)", color: "var(--cost-zero-text)" }
}

function CostBadge({ cost }: { cost: number | null }) {
  const style: React.CSSProperties = {
    ...costBadgeStyle(cost),
    padding: "0.1rem 0.4rem",
    borderRadius: "2px",
    fontSize: "0.75rem",
    fontWeight: "bold",
  }
  if (cost === null) return <span style={style}>variable</span>
  const sign = cost >= 0 ? "+" : ""
  return <span style={style}>{sign}{cost}</span>
}

type TraitListKey = "mortal_traits" | "vampire_traits"

export function TraitCard({ traitListKey, traitDef }: { traitListKey: TraitListKey; traitDef: TraitDef }) {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const [expanded, setExpanded] = useState(false)
  const [chosenCostIdx, setChosenCostIdx] = useState(0)
  const [subChoice, setSubChoice] = useState(traitDef.subOptions?.[0] ?? "")
  const [detail, setDetail] = useState("")
  const [warning, setWarning] = useState("")

  const { key, name, description, cost, variableCost, requiresDetail, requiresSubChoice, maxTimes = 1 } = traitDef
  const isSimple = !variableCost && !requiresDetail && !requiresSubChoice

  const selectedList = character[traitListKey]
  const timesTaken = selectedList.filter((t) => t.key === key).length
  const isSelected = timesTaken > 0
  const canAddMore = timesTaken < maxTimes && getTraitCount(character) < MAX_TRAITS

  const border = expanded ? "#7a5a20" : isSelected ? ((cost ?? 0) < 0 ? "#5a2a2a" : "#2a5a2a") : "#2a1a24"
  const nameColor = !isSelected ? "var(--text-label)" : (cost ?? 0) < 0 ? "#cf8a8a" : "#8acf8a"

  function confirm() {
    if (requiresDetail && !detail.trim()) {
      setWarning(`${traitDef.detailPrompt ?? "Detail"} is required.`)
      return
    }
    const chosenCost = variableCost ? traitDef.costOptions![chosenCostIdx][0] : (cost as number)
    updateCharacter((c: Character) => {
      c[traitListKey].push({
        key,
        name,
        cost: chosenCost,
        detail: detail.trim() || null,
        sub_choice: requiresSubChoice ? subChoice : null,
      })
    })
    setExpanded(false)
    setDetail("")
    setWarning("")
  }

  return (
    <div style={{ background: "var(--card-bg)", border: `1px solid ${border}`, borderRadius: "4px", padding: "0.6rem 0.8rem", marginBottom: "0.4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.4rem" }}>
        <b style={{ color: nameColor, fontSize: "0.88rem" }}>{name}</b>
        <CostBadge cost={cost} />
      </div>
      <div style={{ fontSize: "0.77rem", color: "#8a7f78", marginTop: "0.2rem", lineHeight: 1.35 }}>{description}</div>

      {expanded ? (
        <div style={{ marginTop: "0.5rem" }}>
          {variableCost && traitDef.costOptions && (
            <select value={chosenCostIdx} onChange={(e) => setChosenCostIdx(Number(e.target.value))} style={{ width: "100%", marginBottom: "0.4rem" }}>
              {traitDef.costOptions.map(([c, d], i) => (
                <option key={i} value={i}>
                  {c >= 0 ? "+" : ""}
                  {c} — {d}
                </option>
              ))}
            </select>
          )}
          {requiresSubChoice && traitDef.subOptions && (
            <select value={subChoice} onChange={(e) => setSubChoice(e.target.value)} style={{ width: "100%", marginBottom: "0.4rem" }}>
              {traitDef.subOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          )}
          {requiresDetail && (
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={traitDef.detailPrompt ?? ""}
              style={{ width: "100%", marginBottom: "0.4rem" }}
            />
          )}
          {warning && <div className="alert alert-error">{warning}</div>}
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirm}>
              ✓ Confirm
            </button>
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => {
                setExpanded(false)
                setWarning("")
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem" }}>
          {canAddMore && (
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => {
                if (isSimple) {
                  updateCharacter((c: Character) => {
                    c[traitListKey].push({ key, name, cost: cost as number, detail: null, sub_choice: null })
                  })
                } else {
                  setExpanded(true)
                }
              }}
            >
              {timesTaken === 0 ? "+ Add" : `+ Again (${timesTaken}/${maxTimes})`}
            </button>
          )}
          {isSelected && (
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() =>
                updateCharacter((c: Character) => {
                  const list = c[traitListKey]
                  const idx = list.findIndex((t) => t.key === key)
                  if (idx >= 0) list.splice(idx, 1)
                })
              }
            >
              ✕ Remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}
