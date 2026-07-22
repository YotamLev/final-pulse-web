import { useState } from "react"
import { useCharacterStore } from "./state/characterStore"
import { useNavStore, type NavPage } from "./state/navStore"
import { CharacterSheet } from "./pages/sheet/CharacterSheet"
import { Wizard } from "./pages/wizard/Wizard"
import { STAGES } from "./pages/wizard/WizardNav"
import { Struggle } from "./pages/struggle/Struggle"
import { RulesPage } from "./pages/rules/RulesPage"

const NAV_OPTIONS: { id: NavPage; label: string }[] = [
  { id: "wizard", label: "⚡ Character Creator" },
  { id: "sheet", label: "📜 Character Sheet" },
  { id: "struggle", label: "♟ Struggle" },
  { id: "rules", label: "📖 Rules" },
]

function Sidebar() {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const resetCharacter = useCharacterStore((s) => s.resetCharacter)
  const page = useNavStore((s) => s.page)
  const goTo = useNavStore((s) => s.goTo)
  const [resetOpen, setResetOpen] = useState(false)

  return (
    <aside className="app-sidebar">
      <div style={{ textAlign: "center", padding: "0.5rem 0 1rem" }}>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "var(--accent)" }}>
          Final Pulse
        </span>
        <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontStyle: "italic" }}>Second Edition</div>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <strong>{character.name || "Unnamed"}</strong>
        <div style={{ fontStyle: "italic", color: "var(--text-muted)" }}>{character.clan || "Clanless"}</div>
      </div>
      <hr />

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {NAV_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={opt.id === page ? "btn btn-primary" : "btn btn-secondary"}
            style={{ textAlign: "left" }}
            onClick={() => goTo(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </nav>

      {page === "wizard" && (
        <>
          <hr />
          <small style={{ color: "var(--text-muted)" }}>Creator Stages</small>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.25rem" }}>
            {Object.entries(STAGES).map(([numStr, label]) => {
              const num = Number(numStr)
              const icon = num === character.wizard_stage ? "●" : num < character.wizard_stage ? "✓" : "○"
              return (
                <button
                  key={num}
                  className="btn btn-secondary"
                  style={{ textAlign: "left" }}
                  onClick={() => updateCharacter((c) => { c.wizard_stage = num })}
                >
                  {icon} {num}. {label}
                </button>
              )
            })}
          </div>
        </>
      )}

      <hr />
      <div className="panel">
        <button type="button" className="btn btn-secondary" style={{ width: "100%" }} onClick={() => setResetOpen((o) => !o)}>
          ⚠ Reset Character
        </button>
        {resetOpen && (
          <div style={{ marginTop: "0.5rem" }}>
            <div className="alert alert-error">This will erase all character data.</div>
            <button
              className="btn btn-secondary"
              onClick={() => {
                resetCharacter()
                goTo("wizard")
                setResetOpen(false)
              }}
            >
              Reset to blank
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

function Hero() {
  return (
    <div className="pulse-hero">
      <h1>Final Pulse</h1>
      <div className="subtitle">Character Creation — World of Darkness</div>
    </div>
  )
}

function App() {
  const page = useNavStore((s) => s.page)

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <Hero />
        {page === "wizard" && <Wizard />}
        {page === "sheet" && <CharacterSheet />}
        {page === "struggle" && <Struggle />}
        {page === "rules" && <RulesPage />}
      </main>
    </div>
  )
}

export default App
