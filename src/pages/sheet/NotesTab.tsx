import { useCharacterStore } from "../../state/characterStore"

export function NotesTab() {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)

  return (
    <textarea
      value={character.notes}
      placeholder="Session notes, observations, contacts…"
      rows={16}
      onChange={(e) =>
        updateCharacter((c) => {
          c.notes = e.target.value
        })
      }
      style={{ display: "block", width: "100%" }}
    />
  )
}
