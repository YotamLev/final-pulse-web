import { useState } from "react"
import { SectionHeader } from "../../components/SectionHeader"
import { InfoBox } from "../../components/InfoBox"
import { CARD_EVENTS, VALUE_TIERS } from "./cardEvents"

export function CardEventsTab() {
  const [suitSel, setSuitSel] = useState<string | null>(null)
  const [tierSel, setTierSel] = useState<number | null>(null)

  const suitKeys = Object.keys(CARD_EVENTS)
  const tier = tierSel !== null ? VALUE_TIERS[tierSel] : null

  return (
    <div>
      <SectionHeader>Card Events</SectionHeader>
      <InfoBox>Pick a suit, then pick a value tier to read the event.</InfoBox>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${suitKeys.length}, 1fr)`, gap: "0.5rem", marginTop: "0.75rem" }}>
        {suitKeys.map((s) => {
          const ev = CARD_EVENTS[s]
          const sel = suitSel === s
          return (
            <button
              key={s}
              className={sel ? "btn btn-primary" : "btn btn-secondary"}
              onClick={() => {
                setSuitSel(s)
                setTierSel(null)
              }}
            >
              {ev.icon} {s}
            </button>
          )
        })}
      </div>

      {suitSel ? (
        (() => {
          const ev = CARD_EVENTS[suitSel]
          return (
            <div className="panel" style={{ background: "var(--panel-alt-bg)", padding: "1.2rem 1.5rem", margin: "0.9rem 0" }}>
              <div style={{ fontSize: "3rem", textAlign: "center", letterSpacing: "0.15em" }}>
                {ev.icon} <span style={{ color: "var(--text-muted)" }}>{tier ? tier.icon : "?"}</span>
              </div>
              <h3 style={{ textAlign: "center", margin: "0.3rem 0" }}>
                {suitSel} — {ev.theme}
              </h3>
              <p style={{ textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
                {tier ? tier.label : "—"} · {tier ? tier.meaning : "Choose a value below"}
              </p>
              <hr />
              <p>{ev.description}</p>
              <ul>
                {ev.examples.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )
        })()
      ) : (
        <div
          style={{
            background: "#0e080c",
            border: "1px dashed #3d2030",
            borderRadius: "4px",
            padding: "2rem",
            textAlign: "center",
            color: "var(--btn-secondary-border)",
            margin: "0.9rem 0",
          }}
        >
          Pick a suit above
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${VALUE_TIERS.length}, 1fr)`, gap: "0.5rem" }}>
        {VALUE_TIERS.map((t, i) => (
          <button
            key={i}
            className={tierSel === i ? "btn btn-primary" : "btn btn-secondary"}
            disabled={suitSel === null}
            onClick={() => setTierSel(i)}
            style={{ whiteSpace: "pre-line", textAlign: "center" }}
          >
            {t.icon}
            {"\n"}
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
