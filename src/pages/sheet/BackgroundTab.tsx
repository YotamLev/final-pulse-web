import { useCharacterStore } from "../../state/characterStore"
import { SectionHeader } from "../../components/SectionHeader"
import { MEMORIES_PLACEHOLDER, DEFAULT_VAMPIRE_POWERS } from "../../data/constants"

export function BackgroundTab() {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)

  return (
    <div>
      <SectionHeader>Background & History</SectionHeader>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <label>
          Name
          <input
            type="text"
            value={character.name}
            placeholder="Character name"
            onChange={(e) => updateCharacter((c) => { c.name = e.target.value })}
            style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
          />
        </label>
        <label>
          Tagline
          <input
            type="text"
            value={character.tagline}
            placeholder="e.g. Former NSA analyst"
            onChange={(e) => updateCharacter((c) => { c.tagline = e.target.value })}
            style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
          />
        </label>
      </div>

      <label>
        Memories
        <textarea
          value={character.memories}
          placeholder={MEMORIES_PLACEHOLDER}
          rows={10}
          onChange={(e) => updateCharacter((c) => { c.memories = e.target.value })}
          style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
        />
      </label>

      <hr />
      <SectionHeader>Default Vampire Powers</SectionHeader>
      {DEFAULT_VAMPIRE_POWERS.map((p) => (
        <div key={p.name}>
          <strong>{p.name}</strong> — {p.description}
        </div>
      ))}

      <hr />
      <SectionHeader>Dangers</SectionHeader>
      <ul>
        <li>
          <strong>Sunlight & Fire</strong> cause damage
        </li>
        <li>
          <strong>Reaching 0 HP</strong> → Torpor (can be days; for ancients — years)
        </li>
        <li>
          <strong>Wood through heart</strong> → paralyzed
        </li>
      </ul>
    </div>
  )
}
