import { useCharacterStore } from "./state/characterStore"
import { useNavStore, type NavPage } from "./state/navStore"
import { CharacterSheet } from "./pages/sheet/CharacterSheet"

const NAV_OPTIONS: { id: NavPage; label: string }[] = [
  { id: "wizard", label: "⚡ Character Creator" },
  { id: "sheet", label: "📜 Character Sheet" },
  { id: "struggle", label: "♟ Struggle" },
  { id: "rules", label: "📖 Rules" },
]

function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <div className="pulse-hero">
        <h1>{title}</h1>
        <div className="subtitle">Coming soon</div>
      </div>
      <p>This section hasn't been built yet in the rebuild.</p>
    </div>
  )
}

function Sidebar() {
  const character = useCharacterStore((s) => s.character)
  const page = useNavStore((s) => s.page)
  const goTo = useNavStore((s) => s.goTo)

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
        {page === "wizard" && <ComingSoon title="Character Creator" />}
        {page === "sheet" && <CharacterSheet />}
        {page === "struggle" && <ComingSoon title="Struggle" />}
        {page === "rules" && <ComingSoon title="Rules" />}
      </main>
    </div>
  )
}

export default App
