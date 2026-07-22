import { CLANS } from "../../data/clans"
import { reqText } from "./ruleText"
import { Icon } from "../../components/Icon"

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
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Icon src={c.image} size={48} />
            <h3 style={{ margin: 0 }}>{name}</h3>
          </div>
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
