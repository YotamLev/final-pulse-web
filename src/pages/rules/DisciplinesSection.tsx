import { useState } from "react"
import { DISCIPLINES, DISC_SHORT_DESC, ALL_DISCIPLINE_NAMES } from "../../data/disciplines"

export function DisciplinesSection() {
  const [filter, setFilter] = useState("all")
  const names = filter === "all" ? ALL_DISCIPLINE_NAMES : [filter]

  return (
    <div className="panel" id="disciplines" style={{ marginBottom: "1.5rem" }}>
      <h2>Discipline Trees</h2>
      <p>
        A vampire may unlock up to <strong>3 Disciplines</strong>. Each Discipline has a level from 0–5. Raising a Discipline's level lets you acquire that
        many powers total from it (one power slot per level), chosen from any power at or below your current level whose prerequisite (if any) you already
        hold.
      </p>
      <label>
        Discipline:{" "}
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          {ALL_DISCIPLINE_NAMES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      {names.map((discName) => {
        const disc = DISCIPLINES[discName]
        const byLevel = new Map<number, typeof disc.powers>()
        for (const p of disc.powers) {
          const list = byLevel.get(p.level) ?? []
          list.push(p)
          byLevel.set(p.level, list)
        }
        return (
          <div key={discName} style={{ marginTop: "1rem" }}>
            <h3>{discName}</h3>
            <p className="caption">{DISC_SHORT_DESC[discName]}</p>
            <ul>
              {[...byLevel.keys()].sort((a, b) => a - b).map((lvl) => (
                <li key={lvl}>
                  <i>Level {lvl}</i>
                  <ul>
                    {byLevel.get(lvl)!.map((p) => (
                      <li key={p.name}>
                        <b>{p.name}</b>
                        {p.requires && (
                          <span className="pill" style={{ display: "inline", fontSize: "0.75rem", color: "var(--accent)" }}>
                            requires {p.requires}
                          </span>
                        )}
                        <div className="caption">{p.description}</div>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
