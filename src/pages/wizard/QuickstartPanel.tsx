import { useState } from "react"
import { useCharacterStore } from "../../state/characterStore"
import { QUICKSTARTS, applyQuickstart } from "./quickstarts"
import { dotsString } from "../../components/Dots"

export function QuickstartPanel() {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)

  const [open, setOpen] = useState(!character.clan)
  const [selected, setSelected] = useState<string | null>(() => {
    const match = Object.entries(QUICKSTARTS).find(([, v]) => v.clan === character.clan)
    return match ? match[0] : null
  })

  const qsKeys = Object.keys(QUICKSTARTS)
  const qs = selected ? QUICKSTARTS[selected] : null
  const alreadyApplied = qs ? character.clan === qs.clan : false

  return (
    <div className="panel" style={{ marginBottom: "1rem" }}>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ width: "100%", textAlign: "left" }}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "▾" : "▸"} ⚡ Quick Start — know your clan? Begin here
      </button>

      {open && (
        <div style={{ marginTop: "0.75rem" }}>
          <div className="caption">
            Pick an archetype to pre-fill name, backstory, clan, traits, disciplines with starting powers, and a
            full skill package. Everything can be edited afterwards.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "0.75rem" }}>
            {qsKeys.map((key) => (
              <button
                key={key}
                type="button"
                className={selected === key ? "btn btn-primary" : "btn btn-secondary"}
                onClick={() => setSelected(key)}
              >
                {QUICKSTARTS[key].label}
              </button>
            ))}
          </div>

          {qs && (
            <>
              <hr />
              <div
                className="panel"
                style={{ background: "var(--panel-alt-bg)", borderColor: "var(--card-border)", lineHeight: 1.7 }}
              >
                <b style={{ color: "var(--accent)", fontSize: "1.1rem" }}>{qs.label}</b>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  {" "}
                  — {qs.name}, {qs.clan}, Chicago 1999
                </span>
                <br />
                <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.92rem" }}>
                  {qs.tagline}
                </span>
                <br />
                <span style={{ fontSize: "0.88rem" }}>{qs.backstory}</span>
                <br />
                <br />
                <b>Disciplines:</b>{" "}
                {qs.disciplines.map((d) => `${d} ${dotsString(qs.discipline_levels[d] ?? 1, qs.discipline_levels[d] ?? 1)}`).join(", ")}
                <br />
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {Object.entries(qs.discipline_powers)
                    .map(([d, ps]) => `${d}: ${ps.join(", ")}`)
                    .join(" · ")}
                </span>
                <br />
                <b>Trait:</b>{" "}
                {[
                  qs.mortal_trait ? `${qs.mortal_trait.name} (${qs.mortal_trait.cost >= 0 ? "+" : ""}${qs.mortal_trait.cost}) [mortal]` : null,
                  qs.vampire_trait
                    ? `${qs.vampire_trait.name}${qs.vampire_trait.detail ? " — " + qs.vampire_trait.detail : ""} (${qs.vampire_trait.cost >= 0 ? "+" : ""}${qs.vampire_trait.cost}) [vampire]`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" / ") || "—"}
                <br />
                <b>Skills:</b>{" "}
                <span style={{ fontSize: "0.85rem" }}>
                  {Object.entries(qs.skill_dots)
                    .map(([s, d]) => `${s} ${dotsString(d, d)}`)
                    .join(", ")}
                </span>
              </div>

              {alreadyApplied && <div className="alert">{qs.label} already applied.</div>}
              <button
                className="btn btn-primary"
                disabled={alreadyApplied}
                onClick={() => {
                  updateCharacter((c) => applyQuickstart(c, selected!))
                }}
              >
                {alreadyApplied ? "Re-apply" : "Apply"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
