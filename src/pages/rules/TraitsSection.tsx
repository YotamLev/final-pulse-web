import { useState } from "react"
import { MORTAL_TRAITS, VAMPIRE_TRAITS, type TraitDef } from "../../data/traits"
import { costStr, MORTAL_CATEGORY_OPTIONS } from "./ruleText"

function TraitRow({ t }: { t: TraitDef }) {
  let desc = t.description
  const extras: string[] = []
  if (t.variableCost && t.costOptions) {
    extras.push(t.costOptions.map(([c, d]) => `${c >= 0 ? "+" : ""}${c}: ${d}`).join("; "))
  }
  if (t.requiresSubChoice && t.subOptions) {
    extras.push("Choose one: " + t.subOptions.join(", "))
  }
  return (
    <tr>
      <td>
        <b>{t.name}</b>
        {(t.maxTimes ?? 1) > 1 && <span className="pill" style={{ display: "inline", marginLeft: "0.4rem", fontSize: "0.75rem" }}>up to {t.maxTimes}x</span>}
      </td>
      <td>{costStr(t)}</td>
      <td>
        {desc}
        {extras.map((e, i) => (
          <div key={i} className="caption">
            {e}
          </div>
        ))}
      </td>
    </tr>
  )
}

export function TraitsSection() {
  const [category, setCategory] = useState("all")
  const filteredMortal = category === "all" ? MORTAL_TRAITS : MORTAL_TRAITS.filter((t) => (t.category ?? "other") === category)

  return (
    <div className="panel" id="traits" style={{ marginBottom: "1.5rem" }}>
      <h2>Traits</h2>
      <p>
        Every Trait has a cost (some, like curses, have <em>negative</em> cost). <strong>Total cost of all Mortal + Vampire Traits combined cannot exceed +2.</strong>{" "}
        You may take up to <strong>8 Traits</strong> total; 6 or fewer is recommended.
      </p>

      <h3>Mortal Traits</h3>
      <label>
        Category:{" "}
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All</option>
          {MORTAL_CATEGORY_OPTIONS.map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <table className="data-table" style={{ marginTop: "0.5rem" }}>
        <thead>
          <tr>
            <th>Trait</th>
            <th>Cost</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {filteredMortal.map((t) => (
            <TraitRow key={t.key} t={t} />
          ))}
        </tbody>
      </table>

      <h3>Vampire Traits</h3>
      <p className="caption">Vampire Traits aren't grouped into categories in the character builder — shown as a single list.</p>
      <table className="data-table">
        <thead>
          <tr>
            <th>Trait</th>
            <th>Cost</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {VAMPIRE_TRAITS.map((t) => (
            <TraitRow key={t.key} t={t} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
