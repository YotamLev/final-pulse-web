import { useState } from "react"
import { useCharacterStore } from "../../state/characterStore"
import { SectionHeader } from "../../components/SectionHeader"
import { generateCharacterHtml } from "./generateHtml"
import { charFromDict } from "../../models/character"

export function ExportTab() {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null)

  const slug = (character.name || "character").replace(/ /g, "_")

  function handleExport() {
    // Generated on click only — never on render, unlike the original app's
    // Export tab, which rebuilt this whole document on every rerun.
    const html = generateCharacterHtml(character)
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${slug}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      const raw = await file.text()
      let data: Record<string, unknown>
      if (file.name.endsWith(".html")) {
        const marker = '<script type="application/json" id="fp-character-data">'
        const start = raw.indexOf(marker)
        if (start === -1) throw new Error("No character data found in file")
        const contentStart = start + marker.length
        const end = raw.indexOf("</script>", contentStart)
        data = JSON.parse(raw.slice(contentStart, end))
      } else {
        data = JSON.parse(raw)
      }
      updateCharacter((c) => Object.assign(c, charFromDict(data)))
      setMessage({ kind: "success", text: "Character loaded!" })
    } catch (err) {
      setMessage({ kind: "error", text: `Could not read character data: ${(err as Error).message}` })
    }
  }

  return (
    <div>
      <SectionHeader>Export & Save</SectionHeader>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div>
          <h4>Export Character File</h4>
          <div className="caption">One .html file — looks great in a browser and can be loaded back into the app.</div>
          <button className="btn btn-primary" onClick={handleExport} style={{ marginTop: "0.5rem" }}>
            ⬇ Export Character File
          </button>
        </div>
        <div>
          <h4>Load Character</h4>
          <div className="caption">Upload a previously exported .html file.</div>
          <input type="file" accept=".html,.json" onChange={handleUpload} style={{ marginTop: "0.5rem" }} />
        </div>
      </div>

      {message && (
        <div className={`alert ${message.kind === "error" ? "alert-error" : ""}`} style={{ marginTop: "1rem" }}>
          {message.text}
        </div>
      )}
    </div>
  )
}
