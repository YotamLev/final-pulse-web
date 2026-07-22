// Character state management for Final Pulse 2E.

import { totalSkillXp, type CustomSkill } from "../data/skillTrees"
import { totalDiscXp } from "../data/disciplines"
import type { TraitInstance } from "../data/traits"

export const CREATION_SKILL_XP = 15
export const CREATION_DISC_XP = 10
export const MAX_TRAITS = 8
export const MAX_TRAIT_COST = 2
export const BASE_HP = 10
export const BASE_WILLPOWER = 10
export const BASE_BLOOD = 10

export interface XpLogEntry {
  description: string
  cost: number
  skill?: string
  disc?: string
  from_level?: number
  to_level?: number
}

export interface StruggleScheme {
  id: string
  name: string
  goal: string
  notes: string
  dots_acquired: number
  dots_required: number
  is_secret: boolean
  in_graveyard: boolean
}

export interface StruggleAsset {
  id: string
  name: string
  asset_type: string
  description: string
  dots: number
  damage: number
  is_bolstered: boolean
  bolster_note: string
  is_secret: boolean
  in_graveyard: boolean
}

export interface Character {
  // Wizard progress
  wizard_stage: number
  wizard_complete: boolean

  // Stage 1: Origins & Traits
  name: string
  tagline: string
  memories: string
  mortal_traits: TraitInstance[]
  vampire_traits: TraitInstance[]

  // Stage 2: Skills
  skill_dots: Record<string, number>
  custom_skills: CustomSkill[]

  // Stage 3: Disciplines
  unlocked_disciplines: string[]
  discipline_levels: Record<string, number>
  discipline_powers: Record<string, string[]>

  // Stage 4: Clan
  clan: string | null

  // Character sheet trackers
  hp_current: number
  willpower_current: number
  blood_current: number

  // Post-creation XP
  earned_xp: number

  // XP log
  xp_log: XpLogEntry[]

  // Notes
  notes: string

  // Struggle
  struggle_schemes: StruggleScheme[]
  struggle_assets: StruggleAsset[]
}

export function defaultCharacter(): Character {
  return {
    wizard_stage: 1,
    wizard_complete: false,

    name: "",
    tagline: "",
    memories: "",
    mortal_traits: [],
    vampire_traits: [],

    skill_dots: {},
    custom_skills: [],

    unlocked_disciplines: [],
    discipline_levels: {},
    discipline_powers: {},

    clan: null,

    hp_current: BASE_HP,
    willpower_current: BASE_WILLPOWER,
    blood_current: BASE_BLOOD,

    earned_xp: 0,

    xp_log: [],

    notes: "",

    struggle_schemes: [],
    struggle_assets: [],
  }
}

// ── Computed properties ─────────────────────────────────────────────────────

/** Max HP = 10 + 1 (Iron Constitution) + 2 × Fortitude level (if Toughness acquired). */
export function getHpMax(char: Character): number {
  let hp = BASE_HP
  if (char.mortal_traits.some((t) => t.key === "iron_constitution")) {
    hp += 1
  }
  const fortLevel = char.discipline_levels["Fortitude"] ?? 0
  if (fortLevel > 0 && (char.discipline_powers["Fortitude"] ?? []).includes("Toughness")) {
    hp += 2 * fortLevel
  }
  return hp
}

/** Sum of all mortal + vampire trait costs. */
export function getTotalTraitCost(char: Character): number {
  let total = 0
  for (const t of char.mortal_traits) total += t.cost || 0
  for (const t of char.vampire_traits) total += t.cost || 0
  return total
}

export function getTraitCount(char: Character): number {
  return char.mortal_traits.length + char.vampire_traits.length
}

export function getCreationSkillXpSpent(char: Character): number {
  return totalSkillXp(char.skill_dots, char.custom_skills)
}

export function getCreationDiscXpSpent(char: Character): number {
  return totalDiscXp(char.discipline_levels)
}

/** Earned XP not yet spoken for by post-creation spending. */
export function getEarnedXpAvailable(char: Character): number {
  const skillSpent = getCreationSkillXpSpent(char)
  const discSpent = getCreationDiscXpSpent(char)
  const overflow = Math.max(0, skillSpent - CREATION_SKILL_XP) + Math.max(0, discSpent - CREATION_DISC_XP)
  return char.earned_xp - overflow
}

/** True if creation remainder + earned XP can cover the cost. */
export function canSpendSkillXp(char: Character, cost: number): boolean {
  const skillSpent = getCreationSkillXpSpent(char)
  const creationRemaining = Math.max(0, CREATION_SKILL_XP - skillSpent)
  const earned = Math.max(0, getEarnedXpAvailable(char))
  return cost <= creationRemaining + earned
}

/** True if creation remainder + earned XP can cover the cost. */
export function canSpendDiscXp(char: Character, cost: number): boolean {
  const discSpent = getCreationDiscXpSpent(char)
  const creationRemaining = Math.max(0, CREATION_DISC_XP - discSpent)
  const earned = Math.max(0, getEarnedXpAvailable(char))
  return cost <= creationRemaining + earned
}

// ── XP log helpers ──────────────────────────────────────────────────────────
//
// Each spend entry has at minimum {description, cost}. Structured fields are
// added when the caller supplies them: skill (skill-dot spends), disc/from_level/
// to_level (discipline-level spends). log_xp_refund matches structurally first
// (immune to description string changes), then falls back to cancel_description
// for legacy entries, then appends a "[Refund] ..." entry.

export function logXpSpend(
  char: Character,
  description: string,
  cost: number,
  opts: { skill?: string; disc?: string; from_level?: number; to_level?: number } = {},
): void {
  const entry: XpLogEntry = { description, cost }
  if (opts.skill !== undefined) entry.skill = opts.skill
  if (opts.disc !== undefined) entry.disc = opts.disc
  if (opts.from_level !== undefined) entry.from_level = opts.from_level
  if (opts.to_level !== undefined) entry.to_level = opts.to_level
  char.xp_log.push(entry)
}

export function logXpRefund(
  char: Character,
  description: string,
  refund: number,
  opts: {
    skill?: string
    disc?: string
    from_level?: number
    to_level?: number
    cancel_description?: string
  } = {},
): void {
  const log = char.xp_log

  // 1. Structural match: skill dot
  if (opts.skill !== undefined) {
    for (let i = log.length - 1; i >= 0; i--) {
      const e = log[i]
      if (e.skill === opts.skill && (e.cost ?? 0) > 0) {
        log.splice(i, 1)
        return
      }
    }
  }

  // 2. Structural match: discipline level transition
  if (opts.disc !== undefined && opts.from_level !== undefined && opts.to_level !== undefined) {
    for (let i = log.length - 1; i >= 0; i--) {
      const e = log[i]
      if (
        e.disc === opts.disc &&
        e.from_level === opts.from_level &&
        e.to_level === opts.to_level &&
        (e.cost ?? 0) > 0
      ) {
        log.splice(i, 1)
        return
      }
    }
  }

  // 3. Legacy description-string fallback (old save files / untagged entries)
  if (opts.cancel_description !== undefined) {
    for (let i = log.length - 1; i >= 0; i--) {
      const e = log[i]
      if (e.description === opts.cancel_description && (e.cost ?? 0) > 0) {
        log.splice(i, 1)
        return
      }
    }
  }

  log.push({ description: `[Refund] ${description}`, cost: -refund })
}

// ── Normalization ────────────────────────────────────────────────────────────

/** Enforce hard invariants on the character in-place. Safe to call every render — idempotent. */
export function normalizeCharacter(char: Character): void {
  const hpMax = getHpMax(char)
  char.hp_current = Math.max(0, Math.min(char.hp_current ?? hpMax, hpMax))
  char.willpower_current = Math.max(0, Math.min(char.willpower_current ?? BASE_WILLPOWER, BASE_WILLPOWER))
  // blood_current is intentionally unclamped (goes negative = Hunger)
}

// ── Serialisation helpers ───────────────────────────────────────────────────

export function charToDict(char: Character): Character {
  return structuredClone(char)
}

export function charFromDict(data: Partial<Character> & Record<string, unknown>): Character {
  const base = defaultCharacter() as Character & Record<string, unknown>
  Object.assign(base, data)

  // Migrate old separate text fields into the unified memories field
  if (!base.memories) {
    const oldParts = ["mortal_history", "beliefs", "connections", "embrace_backstory"].map((k) => {
      const v = base[k]
      delete base[k]
      return typeof v === "string" ? v : ""
    })
    const merged = oldParts.filter(Boolean).join("\n\n")
    if (merged) base.memories = merged
  }

  // Migrate old 5-stage numbering (2=Vampire,3=Skills,4=Disciplines,5=Clan)
  // to new 4-stage numbering (1=Origins&Traits,2=Skills,3=Disciplines,4=Clan)
  const oldStageMap: Record<number, number> = { 2: 1, 3: 2, 4: 3, 5: 4 }
  const savedStage = base.wizard_stage ?? 1
  if (savedStage in oldStageMap) {
    base.wizard_stage = oldStageMap[savedStage]
  }

  // Migrate renamed discipline powers (name-only changes in data/disciplines.ts)
  const powerRenames: Record<string, string> = {
    "The Still World": "Blink",
    Whirlwind: "Fast Strike",
  }
  for (const powers of Object.values(base.discipline_powers)) {
    for (let i = 0; i < powers.length; i++) {
      const renamed = powerRenames[powers[i]]
      if (renamed) powers[i] = renamed
    }
  }

  normalizeCharacter(base)
  return base
}
