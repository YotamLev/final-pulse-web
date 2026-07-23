// Quick Start archetypes — ported verbatim from wizard.py's QUICKSTARTS + _apply_quickstart.
// Each entry pre-fills a clan, qualifying trait, discipline unlocks (with starting powers),
// and a full skill package, so the player can dive straight into the biography.

import { SKILL_TREES, xpCostForNextDot } from "../../data/skillTrees"
import { xpCostForDiscLevel } from "../../data/disciplines"
import { logXpSpend, type Character } from "../../models/character"
import type { TraitInstance } from "../../data/traits"

export interface Quickstart {
  label: string
  name: string
  clan: string
  tagline: string
  backstory: string
  mortal_trait: TraitInstance | null
  vampire_trait: TraitInstance | null
  disciplines: string[]
  discipline_levels: Record<string, number>
  discipline_powers: Record<string, string[]>
  skill_dots: Record<string, number>
}

export const QUICKSTARTS: Record<string, Quickstart> = {
  ventrue_commander: {
    label: "Ventrue Commander",
    name: "Marcus St. Claire",
    clan: "Ventrue",
    tagline: "Nobles of the night. Rule through command, wealth, and iron will.",
    backstory:
      "Chicago's most feared litigator, St. Claire dismantled corporations and careers " +
      "with equal precision from his Loop office. Annalise of Clan Ventrue watched him " +
      "destroy a rival's empire in court and made her offer — eternity in exchange for his talent.",
    mortal_trait: null,
    vampire_trait: { key: "selective_taste", name: "Selective Taste", cost: -1, detail: "The powerful and well-bred", sub_choice: null },
    disciplines: ["Dominate", "Fortitude", "Presence"],
    discipline_levels: { Dominate: 3, Fortitude: 1, Presence: 2 },
    discipline_powers: {
      Dominate: ["Draw On Instinct", "Mesmerize", "Implant Trigger"],
      Fortitude: ["Toughness"],
      Presence: ["Awe", "Midnight Command"],
    },
    skill_dots: {
      "Basic Analytical": 2, Finance: 1, "Mortal Politics": 1,
      "Basic Manipulation": 2, Persuasion: 1,
    },
  },
  dracul_warlord: {
    label: "Dracul Warlord",
    name: "Viktor Harken",
    clan: "Dracul",
    tagline: "Immovable and vengeful. No one trespasses on what is yours.",
    backstory:
      "A Balkan mercenary who made his name in post-war chaos, Harken arrived in " +
      "Chicago in '94 running private security contracts. His Sire found him useful — " +
      "and simply unwilling to die. An appropriate quality for the Clan.",
    mortal_trait: null,
    vampire_trait: { key: "territorial", name: "Territorial", cost: -2, detail: null, sub_choice: null },
    disciplines: ["Dominate", "Protean", "Potence"],
    discipline_levels: { Dominate: 1, Protean: 3, Potence: 2 },
    discipline_powers: {
      Dominate: ["Draw On Instinct"],
      Protean: ["Feral Weapons", "Bone Bullets", "Bone Armor"],
      Potence: ["Vigor", "Brutal Feed"],
    },
    skill_dots: {
      "Basic Manipulation": 2, Intimidation: 1,
      Brawl: 2, "Martial Arts": 1,
      Awareness: 2,
    },
  },
  toreador_manipulator: {
    label: "Toreador Manipulator",
    name: "Celeste Vane",
    clan: "Toreador",
    tagline: "Beauty as a weapon. Emotion as a lever. Every room is a stage.",
    backstory:
      "Celeste built Chicago's River North into a scene by sheer force of taste and charm. " +
      "She was Embraced in 1987 by a mid-century Toreador who grew obsessed with her eye " +
      "for beauty, and now navigates Elysium with the same precision as a gallery opening.",
    mortal_trait: null,
    vampire_trait: { key: "infatuation", name: "Infatuation", cost: -1, detail: null, sub_choice: null },
    disciplines: ["Presence", "Auspex", "Celerity"],
    discipline_levels: { Presence: 3, Auspex: 1, Celerity: 2 },
    discipline_powers: {
      Presence: ["Awe", "Affect Mood", "Hypnotize"],
      Auspex: ["Impulse"],
      Celerity: ["Speed", "Blink"],
    },
    skill_dots: {
      "Basic Manipulation": 2, Persuasion: 1, "Court Etiquette": 1,
      Insight: 2, Deception: 1,
    },
  },
  nosferatu_spymaster: {
    label: "Nosferatu Spymaster",
    name: "Grim",
    clan: "Nosferatu",
    tagline: "Unseen and unavoidable. The city's secrets flow through your hands.",
    backstory:
      "A disgraced NSA analyst who learned too much about the undead world and was " +
      "consequently Embraced rather than silenced. Grim runs intelligence from Chicago's " +
      "tunnel network, selling information to anyone worth knowing.",
    mortal_trait: null,
    vampire_trait: { key: "corpse_like", name: "Corpse-Like", cost: -2, detail: null, sub_choice: null },
    disciplines: ["Obfuscate", "Nightmare", "Shadow Sorcery"],
    discipline_levels: { Obfuscate: 3, Nightmare: 2, "Shadow Sorcery": 1 },
    discipline_powers: {
      Obfuscate: ["Fade", "Vanish", "Silent Hunter"],
      Nightmare: ["Haunting Dream", "Lullaby"],
      "Shadow Sorcery": ["Dim the Lights"],
    },
    skill_dots: {
      "Basic Analytical": 2, Investigation: 1,
      Awareness: 2, Stealth: 2, Streetwise: 1,
    },
  },
  brujah_rebel: {
    label: "Brujah Rebel",
    name: "Dex Malone",
    clan: "Brujah",
    tagline: "Passionate and explosive. Fight for the cause — or just fight.",
    backstory:
      "A union organizer and fixture of Chicago's punk circuit, Dex fought systems " +
      "before he had the strength to break them. His Brujah Sire caught him mid-brawl " +
      "outside a Bridgeport tavern and decided the city needed his fire.",
    mortal_trait: null,
    vampire_trait: { key: "prone_to_rage", name: "Prone to Rage", cost: -2, detail: null, sub_choice: null },
    disciplines: ["Potence", "Celerity", "Presence"],
    discipline_levels: { Potence: 3, Celerity: 2, Presence: 1 },
    discipline_powers: {
      Potence: ["Vigor", "Shockwave", "Bloody Strangle"],
      Celerity: ["Speed", "Blink"],
      Presence: ["Awe"],
    },
    skill_dots: {
      Brawl: 2, "Martial Arts": 1, Athletics: 1,
      Awareness: 1, "Basic Manipulation": 2, Guns: 1, Intimidation: 1,
    },
  },
  gangrel_wanderer: {
    label: "Gangrel Wanderer",
    name: "Reva",
    clan: "Gangrel",
    tagline: "Predator and survivor. The wild is your haven, the beast your compass.",
    backstory:
      "A wilderness guide from Minnesota who came south following a trail and found " +
      "something hunting her in return. The Embrace changed her direction but not her " +
      "nature. She haunts the forest preserves and Chicago's industrial edges.",
    mortal_trait: null,
    vampire_trait: { key: "ravenous", name: "Ravenous", cost: -3, detail: null, sub_choice: null },
    disciplines: ["Animalism", "Protean", "Fortitude"],
    discipline_levels: { Animalism: 3, Protean: 1, Fortitude: 2 },
    discipline_powers: {
      Animalism: ["Ghoul Animal", "Borrowed Wisdom", "Confront the Beast"],
      Protean: ["Feral Weapons"],
      Fortitude: ["Rapid Healing", "Toughness"],
    },
    skill_dots: {
      Awareness: 2, Survival: 1, Athletics: 2,
      Brawl: 2, Stealth: 2,
    },
  },
  malkavian_oracle: {
    label: "Malkavian Oracle",
    name: "Pip",
    clan: "Malkavian",
    tagline: "Madness and prophecy walk hand in hand. You see what others cannot.",
    backstory:
      "A behavioral economist at U of C whose gift for reading systems was simply too " +
      "unsettling to ignore. The Embrace fractured Pip's already-strange mind into " +
      "something genuinely prophetic — and genuinely difficult to follow in conversation.",
    mortal_trait: { key: "paranoid", name: "Paranoid", cost: -2, detail: null, sub_choice: null },
    vampire_trait: null,
    disciplines: ["Auspex", "Nightmare", "Arrete"],
    discipline_levels: { Auspex: 3, Nightmare: 1, Arrete: 2 },
    discipline_powers: {
      Auspex: ["Impulse", "Read Aura", "Telepathy"],
      Nightmare: ["Haunting Dream"],
      Arrete: ["Calculating", "Borrowed Knowledge"],
    },
    skill_dots: {
      "Basic Analytical": 2, Insight: 2,
      Curiosity: 2, Awareness: 1, "Basic Manipulation": 2, Dodge: 1, Stealth: 1,
    },
  },
  tremere_warlock: {
    label: "Tremere Warlock",
    name: "Adara Voss",
    clan: "Tremere",
    tagline: "Mages who sought eternity and found damnation. Power has a price.",
    backstory:
      "A rare books archivist recruited by Chicago's Emerald Circle Chantry with " +
      "promises of access to texts that don't exist in libraries. The blood bond " +
      "was not disclosed in the recruitment materials.",
    mortal_trait: null,
    vampire_trait: { key: "infatuation", name: "Infatuation", cost: -1, detail: null, sub_choice: null },
    disciplines: ["Blood Sorcery", "Auspex", "Arrete"],
    discipline_levels: { "Blood Sorcery": 3, Auspex: 2, Arrete: 1 },
    discipline_powers: {
      "Blood Sorcery": ["Bend Blood", "Bend Veins", "Telekinesis"],
      Auspex: ["Enhance Senses", "Sense The Unseen"],
      Arrete: ["Calculating"],
    },
    skill_dots: {
      "Basic Analytical": 2, "Social Academics": 1,
      Curiosity: 2, Occult: 1, Insight: 2,
    },
  },
  hecata_necromancer: {
    label: "Hecata Necromancer",
    name: "Father Ioseph",
    clan: "Hecata",
    tagline: "Death is a doorway. You hold the key — and the business card.",
    backstory:
      "A Catholic priest who ministered to a Hecata-affiliated family for a decade " +
      "before learning what they were. The Clan offered eternity when they realized " +
      "his networks of grief and trust were worth more than his silence.",
    mortal_trait: null,
    vampire_trait: { key: "painful_bite", name: "Painful Bite", cost: -2, detail: null, sub_choice: null },
    disciplines: ["Necromancy", "Fortitude", "Potence"],
    discipline_levels: { Necromancy: 3, Fortitude: 1, Potence: 2 },
    discipline_powers: {
      Necromancy: ["Touch of Oblivion", "Raise Corpse", "Kill the Vibe"],
      Fortitude: ["Rapid Healing"],
      Potence: ["Vigor", "Bloody Strangle"],
    },
    skill_dots: {
      Curiosity: 2, Occult: 1,
      "Basic Analytical": 2, Medicine: 2, Logistics: 1,
    },
  },
}

export function applyQuickstart(char: Character, key: string): void {
  const qs = QUICKSTARTS[key]
  char.name = qs.name ?? ""
  char.tagline = qs.tagline ?? ""
  char.memories = qs.backstory ?? ""
  char.clan = qs.clan
  char.unlocked_disciplines = [...qs.disciplines]
  char.discipline_levels = { ...qs.discipline_levels }
  char.discipline_powers = Object.fromEntries(
    Object.entries(qs.discipline_powers).map(([k, v]) => [k, [...v]]),
  )
  char.skill_dots = { ...qs.skill_dots }
  char.mortal_traits = []
  char.vampire_traits = []
  if (qs.mortal_trait) char.mortal_traits.push(qs.mortal_trait)
  if (qs.vampire_trait) char.vampire_traits.push(qs.vampire_trait)

  // Reset log and seed entries so refunds can cancel cleanly
  char.xp_log = []
  for (const [treeName, tree] of Object.entries(SKILL_TREES)) {
    for (const skillName of Object.keys(tree)) {
      const n = qs.skill_dots[skillName] ?? 0
      for (let d = 0; d < n; d++) {
        const cost = xpCostForNextDot(skillName, treeName, { [skillName]: d })
        logXpSpend(char, `${skillName} +1 dot`, cost, { skill: skillName })
      }
    }
  }
  for (const [discName, level] of Object.entries(qs.discipline_levels ?? {})) {
    for (let lv = 0; lv < level; lv++) {
      logXpSpend(char, `${discName} level ${lv} → ${lv + 1}`, xpCostForDiscLevel(lv), {
        disc: discName,
        from_level: lv,
        to_level: lv + 1,
      })
    }
  }
}
