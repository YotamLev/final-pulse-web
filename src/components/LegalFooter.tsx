import { useState } from "react"

// Required by the World of Darkness Dark Pack Agreement for fan-made content
// (https://www.paradoxinteractive.com/games/world-of-darkness/community/dark-pack-agreement):
// exact copyright notice text, a non-official disclaimer, and the Dark Pack logo.
export function LegalFooter() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
        onClick={() => setOpen((o) => !o)}
      >
        <img src="/images/DarkPack_Logo.png" alt="" style={{ width: 18, height: 18 }} />
        Legal
      </button>
      {open && (
        <div className="panel" style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          <p style={{ margin: "0 0 0.5rem" }}>
            This is unofficial, fan-made content. Final Pulse is not an official World of Darkness product and is
            not affiliated with or endorsed by Paradox Interactive.
          </p>
          <p style={{ margin: 0 }}>
            Portions of the materials are the copyrights and trademarks of Paradox Interactive AB, and are used
            with permission. All rights reserved. For more information please visit{" "}
            <a href="https://worldofdarkness.com" target="_blank" rel="noreferrer">
              worldofdarkness.com
            </a>
            .
          </p>
        </div>
      )}
    </div>
  )
}
