function App() {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div style={{ textAlign: "center", padding: "0.5rem 0 1rem" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "var(--accent)" }}>
            Final Pulse
          </span>
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontStyle: "italic" }}>Second Edition</div>
        </div>
      </aside>
      <main className="app-main">
        <div className="pulse-hero">
          <h1>Final Pulse</h1>
          <div className="subtitle">Character Creation — World of Darkness</div>
        </div>
        <div className="pulse-step-badge">Scaffold deployed</div>
        <p>The character wizard, sheet, struggle screen, and rules page are being built here.</p>
      </main>
    </div>
  )
}

export default App
