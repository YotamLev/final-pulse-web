import { useState } from "react"
import { useCharacterStore } from "../../state/characterStore"
import { SectionHeader } from "../../components/SectionHeader"
import { Dots } from "../../components/Dots"
import type { StruggleScheme } from "../../models/character"

function NewSchemeForm() {
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const [name, setName] = useState("")
  const [dotsRequired, setDotsRequired] = useState(3)
  const [goal, setGoal] = useState("")
  const [isSecret, setIsSecret] = useState(false)
  const [notes, setNotes] = useState("")

  function submit() {
    if (!name.trim()) return
    updateCharacter((c) => {
      c.struggle_schemes.push({
        id: crypto.randomUUID(),
        name: name.trim(),
        goal: goal.trim(),
        notes: notes.trim(),
        dots_acquired: 0,
        dots_required: dotsRequired,
        is_secret: isSecret,
        in_graveyard: false,
      })
    })
    setName("")
    setDotsRequired(3)
    setGoal("")
    setIsSecret(false)
    setNotes("")
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <input type="text" placeholder="e.g., Infiltrate Police Department" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
          <input
            type="number"
            min={1}
            max={10}
            value={dotsRequired}
            onChange={(e) => setDotsRequired(Number(e.target.value))}
            style={{ width: "100%", marginTop: "0.4rem" }}
          />
        </div>
        <div>
          <input type="text" placeholder="e.g., Install a loyal informant" value={goal} onChange={(e) => setGoal(e.target.value)} style={{ width: "100%" }} />
          <label style={{ display: "block", marginTop: "0.4rem" }}>
            <input type="checkbox" checked={isSecret} onChange={(e) => setIsSecret(e.target.checked)} /> Secret (face-down)
          </label>
        </div>
      </div>
      <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ width: "100%", marginTop: "0.4rem" }} />
      <button className="btn btn-primary" style={{ marginTop: "0.4rem" }} onClick={submit}>
        Create Scheme
      </button>
    </div>
  )
}

function SchemeCard({ scheme }: { scheme: StruggleScheme }) {
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(scheme.name)
  const [goal, setGoal] = useState(scheme.goal)
  const [notes, setNotes] = useState(scheme.notes)
  const [dotsRequired, setDotsRequired] = useState(scheme.dots_required)

  const sid = scheme.id
  const acquired = scheme.dots_acquired
  const required = scheme.dots_required
  const progress = Math.min(acquired, required)

  return (
    <div style={{ marginBottom: "0.6rem" }}>
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--scheme-card-border)", borderRadius: "4px", padding: "0.8rem 1rem" }}>
        <b>{scheme.name}</b> {scheme.is_secret && "🔒 SECRET"}
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{scheme.goal}</div>
        <div style={{ margin: "0.3rem 0" }}>
          Progress: <Dots current={progress} max={required} /> ({acquired}/{required} dots)
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.3rem", marginTop: "0.3rem" }}>
        <button
          className="btn btn-secondary"
          onClick={() => updateCharacter((c) => {
            const s = c.struggle_schemes.find((x) => x.id === sid)
            if (s && s.dots_acquired > 0) s.dots_acquired -= 1
          })}
        >
          −dot
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => updateCharacter((c) => {
            const s = c.struggle_schemes.find((x) => x.id === sid)
            if (s && s.dots_acquired < s.dots_required) s.dots_acquired += 1
          })}
        >
          +dot
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => updateCharacter((c) => {
            const s = c.struggle_schemes.find((x) => x.id === sid)
            if (s) s.is_secret = !s.is_secret
          })}
        >
          {scheme.is_secret ? "🔓 Reveal" : "🔒 Secret"}
        </button>
        <button className="btn btn-secondary" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => updateCharacter((c) => {
            const s = c.struggle_schemes.find((x) => x.id === sid)
            if (s) s.in_graveyard = true
          })}
        >
          ⚰ Bury
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => updateCharacter((c) => {
            c.struggle_schemes = c.struggle_schemes.filter((x) => x.id !== sid)
          })}
        >
          🗑 Delete
        </button>
      </div>

      {editing && (
        <div className="panel" style={{ marginTop: "0.4rem" }}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={{ width: "100%", marginBottom: "0.4rem" }} />
          <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Goal" style={{ width: "100%", marginBottom: "0.4rem" }} />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" rows={3} style={{ width: "100%", marginBottom: "0.4rem" }} />
          <input
            type="number"
            min={1}
            value={dotsRequired}
            onChange={(e) => setDotsRequired(Number(e.target.value))}
            style={{ width: "100%", marginBottom: "0.4rem" }}
          />
          <button
            className="btn btn-primary"
            onClick={() => {
              updateCharacter((c) => {
                const s = c.struggle_schemes.find((x) => x.id === sid)
                if (s) {
                  s.name = name
                  s.goal = goal
                  s.notes = notes
                  s.dots_required = dotsRequired
                }
              })
              setEditing(false)
            }}
          >
            Save
          </button>
        </div>
      )}

      {scheme.notes && <div className="caption">Notes: {scheme.notes}</div>}
    </div>
  )
}

export function SchemesTab() {
  const character = useCharacterStore((s) => s.character)
  const [newOpen, setNewOpen] = useState(false)

  const active = character.struggle_schemes.filter((s) => !s.in_graveyard)

  return (
    <div>
      <SectionHeader>Active Schemes ({active.length})</SectionHeader>

      <div className="panel" style={{ marginBottom: "0.75rem" }}>
        <button type="button" className="btn btn-secondary" style={{ width: "100%", textAlign: "left" }} onClick={() => setNewOpen((o) => !o)}>
          {newOpen ? "▾" : "▸"} ➕ New Scheme
        </button>
        {newOpen && (
          <div style={{ marginTop: "0.75rem" }}>
            <NewSchemeForm />
          </div>
        )}
      </div>

      {active.map((scheme) => (
        <SchemeCard key={scheme.id} scheme={scheme} />
      ))}

      {active.length === 0 && <div className="caption">No active schemes.</div>}
    </div>
  )
}
