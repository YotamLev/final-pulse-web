import { CLANS } from "../../data/clans"
import { reqText } from "./ruleText"

export function ClansSection() {
  return (
    <div className="panel" id="clans" style={{ marginBottom: "1.5rem" }}>
      <h2>Clans</h2>
      <p>
        Clans are optional. Each has requirements built from your Traits and unlocked Disciplines —{" "}
        <strong>you may qualify for and join at most one Clan.</strong>
      </p>

      {Object.entries(CLANS).map(([name, c]) => (
        <div key={name} className="card" style={{ marginBottom: "1rem" }}>
          <h3>{name}</h3>
          <p>
            <em>{c.description}</em>
          </p>
          <p>
            <strong>Recruitment:</strong> {c.recruitment}
          </p>
          <p>
            <strong>Requirements:</strong> {reqText(c.requirements)}
          </p>
          <p>
            <strong>Bonus:</strong> {c.bonus}
          </p>
          <p>
            <strong>Suggested Disciplines:</strong> {c.suggested_disciplines.join(", ")}
          </p>
        </div>
      ))}
    </div>
  )
}
