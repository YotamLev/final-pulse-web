import { create } from "zustand"

export type NavPage = "wizard" | "sheet" | "struggle" | "rules"

interface NavState {
  page: NavPage
  goTo: (page: NavPage) => void
}

export const useNavStore = create<NavState>((set) => ({
  page: "wizard",
  goTo: (page) => set({ page }),
}))
