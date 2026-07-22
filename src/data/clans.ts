// Clan definitions and eligibility checker for Final Pulse 2E.

import { MENTAL_ILLNESS_KEYS } from "./traits"
import type { TraitInstance } from "./traits"

// requirements keys:
//   trait_any: at least one of these trait keys must be present (mortal or vampire)
//   discipline_any: at least one of these disciplines must be unlocked
//   discipline_all: all of these disciplines must be unlocked
//   trait_any_malkavian: special handling — at least one mental-illness-flagged trait

export interface ClanRequirements {
  trait_any?: string[]
  discipline_all?: string[]
  discipline_any?: string[]
  trait_any_malkavian?: boolean
}

export interface Clan {
  image: string
  description: string
  recruitment: string
  requirements: ClanRequirements
  bonus: string
  suggested_disciplines: string[]
}

// Minimal shape needed for eligibility checks (a subset of the full Character).
export interface EligibilityCharacter {
  mortal_traits: TraitInstance[]
  vampire_traits: TraitInstance[]
  unlocked_disciplines: string[]
}

export const CLANS: Record<string, Clan> = {
  Ventrue: {
    image: "/images/Ventrue_symbol.png",
    description: "The self-styled rulers of vampire society, masters of control, who believe it is their birthright to lead.",
    recruitment: "Generals, Lords, Gang Leaders",
    requirements: {
      trait_any: ["selective_taste"],
      discipline_all: ["Dominate"],
    },
    bonus: "Connected — you gain significant advantages to find useful vampires and advance your status. In a social scene, for one target, if you ask for and recieve respect (in the form of proper addressing, a bow, etc.), you gain +2 on rolls to convince, intimidate, or strong-arm the target. If you do not recieve the respect you asked for, you gain +2 on all attack rolls gainst target.",
    suggested_disciplines: ["Fortitude", "Presence"],
  },
  Dracul: {
    image: "/images/Tzimisce_symbol.png",
    description: "The main competitors of the Ventrue, fiercely stubborn. Known to ruin potential Embracees' lives to 'test' whether they are cut out for the Clan.",
    recruitment: "Crusaders, Fierce Nationalists, Merchant Princes",
    requirements: {
      trait_any: ["territorial", "archaic", "folkloric_bane"],
    },
    bonus: "Vengeful — you can Blood Surge and pay only half when pursuing vengeance against one target at a time, once per scene.",
    suggested_disciplines: ["Dominate", "Protean", "Potence"],
  },
  Toreador: {
    image: "/images/Toreador_symbol.png",
    description: "Connoisseurs of ascendant beauty and emotion, drawn irresistibly to the artistic and the sublime.",
    recruitment: "Artists, Diplomats, Charismatic Clergy",
    requirements: {
      trait_any: ["infatuation", "beautiful", "rare_specialist", "world_renowned_specialist"],
      discipline_all: ["Presence"],
    },
    bonus: "Gentle Touch — gain +2 on rolls to blood-bond others, and you can Blood Surge and pay only half when convincing or manipulating others.",
    suggested_disciplines: ["Auspex", "Celerity"],
  },
  Nosferatu: {
    image: "/images/Nosferatu_symbol.png",
    description: "Hidden eyes and ears of the vampire world, cursed with a grotesque appearance that separates them from mortal society.",
    recruitment: "Spymasters, Assassins, Mercenaries",
    requirements: {
      trait_any: ["ugly", "corpse_like", "monstrous"],
      discipline_all: ["Obfuscate"],
    },
    bonus: "Cryptomania — you heal Willpower when finding hidden information or things due to a focused, unnerving curiosity. Gain an advantage convincing Vampires to share information via trade.",
    suggested_disciplines: ["Nightmare", "Shadow Sorcery", "Animalism"],
  },
  Brujah: {
    image: "/images/Brujah_symbol.png",
    description: "Philosophers, fighters, rebels, gladiators. A history of great thinkers, generals, and revolutionaries.",
    recruitment: "Anarchists, Soldiers, Disloyal Knights",
    requirements: {
      trait_any: ["prone_to_rage"],
      discipline_any: ["Potence", "Celerity"],
    },
    bonus: "Freedom — heals Willpower twice as fast.",
    suggested_disciplines: ["Presence", "Potence", "Celerity"],
  },
  Gangrel: {
    image: "/images/Gangrel_symbol.png",
    description: "Wild vampires described as closest to their Beast, who maintain they are simply best at interacting with it.",
    recruitment: "Survivalists, Conquistadors, Raiders",
    requirements: {
      trait_any: ["ravenous", "territorial"],
      discipline_any: ["Animalism", "Protean"],
    },
    bonus: "Can stay awake an hour after dawn and wake up half an hour before sunset.",
    suggested_disciplines: ["Animalism", "Protean", "Fortitude"],
  },
  Malkavian: {
    image: "/images/Malkavian_symbol.png",
    description: "Afflicted by a supernatural madness — the clan of seers and oracles. The most heterogeneous clan.",
    recruitment: "Odd Scientists, Genius Detectives, Shamans",
    requirements: {
      trait_any_malkavian: true, // special handling: mental illness traits
    },
    bonus: "Prophetic — you can make a cryptic, vague, or riddle prophecy and have it be fulfilled. Only one prophecy active at a time.",
    suggested_disciplines: ["Auspex", "Nightmare", "Arrete"],
  },
  Tremere: {
    image: "/images/Tremere_symbol.png",
    description: "Mages who sought immortality. In their greed, they instigated a terrifying magical experiment, damning themselves to a hell of their own making.",
    recruitment: "Occultists, Pagans, Academics",
    requirements: {
      trait_any: ["rare_specialist", "world_renowned_specialist"],
      discipline_all: ["Blood Sorcery"],
    },
    bonus: "Ritual Magic — can find other Tremere to cast spells together; Somewhat tolerated by other mages.",
    suggested_disciplines: ["Auspex", "Arrete"],
  },
  Hecata: {
    image: "/images/Hecata_symbol.png",
    description: "A strange clan steeped in death, practising the arts of necromancy. Favors Embracing from their own mortal family or those with useful outside connections.",
    recruitment: "Bankers, Arms Dealers, Monks",
    requirements: {
      trait_any: ["painful_bite", "selective_mutism"],
      discipline_all: ["Necromancy"],
    },
    bonus: "Private — spend 1 Willpower to automatically succeed against Insight, Aura Reading, or Dominate.",
    suggested_disciplines: ["Fortitude", "Potence"],
  },
}

/** Return true if the character meets all requirements for the given clan. */
export function checkClanEligibility(clanName: string, char: EligibilityCharacter): boolean {
  const clan = CLANS[clanName]
  if (!clan) return false

  const reqs = clan.requirements
  const allTraitKeys = new Set<string>([
    ...char.mortal_traits.map((t) => t.key),
    ...char.vampire_traits.map((t) => t.key),
  ])
  const discNames = new Set(char.unlocked_disciplines)

  // Special Malkavian requirement: at least one mental illness trait
  if (reqs.trait_any_malkavian) {
    if (![...allTraitKeys].some((k) => MENTAL_ILLNESS_KEYS.has(k))) return false
  }

  if (reqs.trait_any) {
    if (!reqs.trait_any.some((k) => allTraitKeys.has(k))) return false
  }

  if (reqs.discipline_all) {
    if (!reqs.discipline_all.every((d) => discNames.has(d))) return false
  }

  if (reqs.discipline_any) {
    if (!reqs.discipline_any.some((d) => discNames.has(d))) return false
  }

  return true
}

/** Return the list of clan names the character currently qualifies for. */
export function getEligibleClans(char: EligibilityCharacter): string[] {
  return Object.keys(CLANS).filter((name) => checkClanEligibility(name, char))
}
