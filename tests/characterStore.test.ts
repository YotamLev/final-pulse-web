import { beforeEach, describe, expect, it } from "vitest"
import { useCharacterStore } from "../src/state/characterStore"

describe("useCharacterStore", () => {
  beforeEach(() => {
    localStorage.clear()
    useCharacterStore.setState({ character: useCharacterStore.getState().character })
    useCharacterStore.persist.clearStorage()
    useCharacterStore.getState().resetCharacter()
  })

  it("starts with a default character", () => {
    const char = useCharacterStore.getState().character
    expect(char.name).toBe("")
    expect(char.hp_current).toBe(10)
  })

  it("updateCharacter mutates a clone and commits a new reference", () => {
    const before = useCharacterStore.getState().character
    useCharacterStore.getState().updateCharacter((char) => {
      char.name = "Dracula"
      char.hp_current = 7
    })
    const after = useCharacterStore.getState().character
    expect(after).not.toBe(before)
    expect(after.name).toBe("Dracula")
    expect(after.hp_current).toBe(7)
    expect(before.name).toBe("") // original untouched
  })

  it("persists to localStorage under the fp_character key", async () => {
    useCharacterStore.getState().updateCharacter((char) => {
      char.name = "Nosferatu"
    })
    // persist middleware writes synchronously via localStorage
    const raw = localStorage.getItem("fp_character")
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!)
    expect(parsed.state.character.name).toBe("Nosferatu")
  })

  it("resetCharacter restores defaults", () => {
    useCharacterStore.getState().updateCharacter((char) => {
      char.name = "Temporary"
    })
    useCharacterStore.getState().resetCharacter()
    expect(useCharacterStore.getState().character.name).toBe("")
  })
})
