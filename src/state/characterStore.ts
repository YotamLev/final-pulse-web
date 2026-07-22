import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { charFromDict, charToDict, defaultCharacter, normalizeCharacter, type Character } from "../models/character"

interface CharacterStore {
  character: Character
  /** Apply a mutating updater to a fresh clone of the character, then commit it. */
  updateCharacter: (fn: (char: Character) => void) => void
  resetCharacter: () => void
}

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set) => ({
      character: defaultCharacter(),

      updateCharacter: (fn) =>
        set((state) => {
          const next = structuredClone(state.character)
          fn(next)
          normalizeCharacter(next)
          return { character: next }
        }),

      resetCharacter: () => set({ character: defaultCharacter() }),
    }),
    {
      name: "fp_character",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ character: charToDict(state.character) }),
      merge: (persisted, current) => {
        const persistedCharacter = (persisted as { character?: unknown } | undefined)?.character
        return {
          ...current,
          character: persistedCharacter
            ? charFromDict(persistedCharacter as Partial<Character> & Record<string, unknown>)
            : current.character,
        }
      },
    },
  ),
)
