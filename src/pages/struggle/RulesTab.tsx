import { useState } from "react"
import { SectionHeader } from "../../components/SectionHeader"

function Box({ children, borderColor = "#4a2030" }: { children: React.ReactNode; borderColor?: string }) {
  return (
    <div style={{ background: "var(--card-bg)", border: `1px solid ${borderColor}`, borderRadius: "4px", padding: "0.9rem 1.2rem", margin: "0.5rem 0" }}>
      {children}
    </div>
  )
}

function Expander({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="panel" style={{ marginBottom: "0.5rem" }}>
      <button type="button" className="btn btn-secondary" style={{ width: "100%", textAlign: "left" }} onClick={() => setOpen((o) => !o)}>
        {open ? "▾" : "▸"} {title}
      </button>
      {open && <div style={{ marginTop: "0.5rem" }}>{children}</div>}
    </div>
  )
}

const ASSET_TYPE_LABELS = ["🏛 Institutions", "👤 Servants", "📦 Objects", "📜 Debts", "🏠 Haven", "🐑 Herd", "🗺️ Territory"]

export function RulesTab() {
  return (
    <div>
      <SectionHeader>Struggle Rules</SectionHeader>

      <h4>Each Turn</h4>
      <Box borderColor="#5c2a1a">
        <ol style={{ margin: 0, paddingLeft: "1.4rem", lineHeight: 2 }}>
          <li>
            <b>Draw a card.</b> If you now hold more than 3, discard down to 3.
          </li>
          <li>
            <b>Scheme action</b> (choose one): <em>Start a new scheme</em> or <em>Advance an existing scheme</em>.
          </li>
          <li>
            <b>Direct action</b> (choose one): <em>Bolster</em>, <em>Investigate</em>, <em>Attack</em>, or <em>Feed</em>.
          </li>
        </ol>
      </Box>

      <h4>Assets</h4>
      <p>
        Each side starts with their assets. Assets range from <b>1 to 5 dots</b> and fall into one of seven types:
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.3rem" }}>
        {ASSET_TYPE_LABELS.map((label) => (
          <div key={label}>- {label}</div>
        ))}
      </div>

      <hr />

      <h4>Schemes</h4>
      <p>
        Schemes are represented as pieces of paper. A <b>secret scheme</b> is placed face-down (harder to advance).
        Other players may contribute to your schemes.
      </p>

      <Expander title="Creating or Reforming an Asset">
        <p>
          Place red tokens on the scheme to track progress. The Storyteller sets the number of <b>required tasks</b>{" "}
          based on the desired asset size and control. Tasks can be assigned to different domains.
        </p>
        <p>
          When enough tokens are placed, the scheme resolves and the asset enters play. Dot value reflects size and
          control — agree with the Storyteller before starting.
        </p>
        <Box borderColor="#2a3a1a">
          <em>
            Example: A vampire wants to create a 'cult of the faithful' — medium size, strong control, roughly 6
            families. The Storyteller rules this a 2-dot Institution and requires 3 tasks: 1 for recruitment, 2 for
            incentive / dogma / resources.
          </em>
        </Box>
      </Expander>

      <Expander title="Schemes Against a Rival Asset">
        <p>
          Describe the plan and the desired damage. The Storyteller sets the number of tasks. As the scheme
          advances, <b>cards</b> equal to the desired damage are placed on it. When complete, those cards slide
          under the target asset — damaging it. A small scheme can be a single card.
        </p>
        <p>
          A <b>Trap</b> is a secret scheme that, when triggered, joins a battle as though it were an asset.
        </p>
      </Expander>

      <Expander title="Advancing a Scheme">
        <p>
          Spend your scheme action to define a task and roll against a difficulty. Success places a red token. Once
          the required number of tokens is reached, the scheme resolves.
        </p>
      </Expander>

      <hr />

      <h4>Direct Actions</h4>

      <Expander title="⬆ Bolster an Asset">
        <p>
          Grant a temporary advantage to one asset — extra weapons, a surge of cash, etc. The bonus lasts until that
          asset's <b>next roll</b>. Bolstering can also <b>repair one point of damage</b>. For a <em>permanent</em>{" "}
          improvement, start a scheme to reform the asset instead.
        </p>
      </Expander>

      <Expander title="🔍 Investigate a Rival">
        <p>
          Roll to <b>reveal a hidden (face-down) scheme</b>.
        </p>
      </Expander>

      <Expander title="⚔ Attack a Rival Asset">
        <p>
          The only way to <b>destroy</b> an asset. Attacks can be Mental, Social, Physical, or a combination — and
          must be described concretely. You use a <b>primary asset</b> to lead the attack, and may add supporting
          assets if relevant. Adding irrelevant assets gives diminishing returns. Attacking alone is possible but
          dangerous.
        </p>
        <Box borderColor="#1a2838">
          <b>Mental:</b> tipping off police, lawsuits, covert money siphoning
          <br />
          <b>Social:</b> persuading people to quit or boycott, bribing guards
          <br />
          <b>Physical:</b> showing up and blowing it up
        </Box>
        <p>The defender may add assets under the same relevance rules.</p>
      </Expander>

      <Expander title="🩸 Feed">
        <p>Seek out prey to replenish Blood.</p>
      </Expander>

      <hr />

      <h4>Combat Resolution (Attacking an Asset)</h4>
      <Box borderColor="#5c1a28">
        <ol style={{ margin: 0, paddingLeft: "1.4rem", lineHeight: 2.1 }}>
          <li>
            Each side sums: <b>main asset dots</b> + helper asset bonuses + bolstering − damage cards already on the
            asset.
          </li>
          <li>Both sides roll.</li>
          <li>
            The <b>margin</b> of the winning roll is inflicted as damage on the loser's primary asset.
          </li>
          <li>Remaining damage spills to other assets that participated, in order.</li>
          <li>
            An asset is <b>destroyed</b> when its damage equals its dots.
          </li>
        </ol>
      </Box>
    </div>
  )
}
