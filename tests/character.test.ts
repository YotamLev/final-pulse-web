// Port of tests/test_character.py — locks in the same business rules.

import { describe, expect, it } from "vitest"
import {
  getStaticBase,
  getEffectiveLevel,
  canInvest,
  canAddDot,
  canRemoveDot,
  xpCostForNextDot,
  xpCostForNOwnDots,
  totalSkillXp,
  SKILL_TREES,
} from "../src/data/skillTrees"
import {
  DISCIPLINES,
  getAvailablePowers,
  totalDiscXp,
  xpCostForDiscLevel,
} from "../src/data/disciplines"
import { checkClanEligibility, getEligibleClans } from "../src/data/clans"
import { MORTAL_TRAITS, VAMPIRE_TRAITS, MENTAL_ILLNESS_KEYS } from "../src/data/traits"
import {
  defaultCharacter,
  getHpMax,
  getTotalTraitCost,
  getTraitCount,
  getCreationSkillXpSpent,
  getCreationDiscXpSpent,
  canSpendSkillXp,
  canSpendDiscXp,
  MAX_TRAITS,
  type Character,
} from "../src/models/character"

// ── Fixtures ─────────────────────────────────────────────────────────────────

function char(overrides: Partial<Character> = {}): Character {
  return { ...defaultCharacter(), ...overrides }
}

function addTrait(
  character: Character,
  traitList: "mortal_traits" | "vampire_traits",
  key: string,
  cost: number,
  opts: { detail?: string; sub_choice?: string } = {},
): void {
  character[traitList].push({
    key,
    name: key,
    cost,
    detail: opts.detail || null,
    sub_choice: opts.sub_choice || null,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILL TREE TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("getStaticBase", () => {
  it("standalone skill has zero base", () => {
    expect(getStaticBase("Guns", "Thrashing")).toBe(0)
  })

  it("first level branch base", () => {
    // Finance branches from Basic Analytical at threshold 2; base = 0 + 2 = 2
    expect(getStaticBase("Finance", "Scheming")).toBe(2)
  })

  it("deep branch base", () => {
    // Undead Politics ← Mortal Politics@3 ← Basic Analytical@2; base = (0+2)+3 = 5
    expect(getStaticBase("Undead Politics", "Scheming")).toBe(5)
  })

  it("experimentation deep chain", () => {
    // Demonology ← Occult@3 ← Curiosity@2; base = (0+2)+3 = 5
    expect(getStaticBase("Demonology", "Experimentation")).toBe(5)
  })

  it("OR branch base uses first parent", () => {
    // Marksmanship ← [Guns@5 OR Projectiles@5]; base = 0 + 5 = 5
    expect(getStaticBase("Marksmanship", "Thrashing")).toBe(5)
  })

  it("standalone Insight in Manipulation", () => {
    expect(getStaticBase("Insight", "Manipulation")).toBe(0)
  })
})

describe("getEffectiveLevel", () => {
  it("standalone skill", () => {
    expect(getEffectiveLevel("Guns", "Thrashing", { Guns: 3 })).toBe(3)
  })

  it("branching skill one dot", () => {
    expect(getEffectiveLevel("Finance", "Scheming", { "Basic Analytical": 2, Finance: 1 })).toBe(3)
  })

  it("branching skill two dots", () => {
    expect(getEffectiveLevel("Finance", "Scheming", { "Basic Analytical": 2, Finance: 2 })).toBe(4)
  })

  it("instructions example chain", () => {
    const dots = { "Basic Analytical": 2, "Mortal Politics": 2, "Undead Politics": 1 }
    expect(getEffectiveLevel("Undead Politics", "Scheming", dots)).toBe(6)
  })

  it("no own dots gives zero for standalone", () => {
    expect(getEffectiveLevel("Dodge", "Thrashing", {})).toBe(0)
  })

  it("branching with no own dots gives only base", () => {
    expect(getEffectiveLevel("Finance", "Scheming", { "Basic Analytical": 2 })).toBe(2)
  })
})

describe("canInvest", () => {
  it("standalone always investable", () => {
    expect(canInvest("Guns", "Thrashing", {})).toBe(true)
  })

  it("branch needs parent dots", () => {
    expect(canInvest("Finance", "Scheming", { "Basic Analytical": 1 })).toBe(false)
    expect(canInvest("Finance", "Scheming", { "Basic Analytical": 2 })).toBe(true)
  })

  it("OR branch either parent qualifies", () => {
    expect(canInvest("Marksmanship", "Thrashing", { Guns: 5 })).toBe(true)
    expect(canInvest("Marksmanship", "Thrashing", { Projectiles: 5 })).toBe(true)
    expect(canInvest("Marksmanship", "Thrashing", { Guns: 4 })).toBe(false)
    expect(canInvest("Marksmanship", "Thrashing", { Guns: 4, Projectiles: 5 })).toBe(true)
  })

  it("deep branch needs direct parent", () => {
    const dotsA = { "Basic Analytical": 2, "Mortal Politics": 2 }
    const dotsB = { "Basic Analytical": 2, "Mortal Politics": 3 }
    expect(canInvest("Undead Politics", "Scheming", dotsA)).toBe(false)
    expect(canInvest("Undead Politics", "Scheming", dotsB)).toBe(true)
  })
})

describe("canAddDot", () => {
  it("cannot add beyond max", () => {
    expect(canAddDot("Basic Analytical", "Scheming", { "Basic Analytical": 2 })).toBe(false)
  })

  it("can add if below max and prereq met", () => {
    expect(canAddDot("Basic Analytical", "Scheming", { "Basic Analytical": 1 })).toBe(true)
  })

  it("cannot add if prereq not met", () => {
    expect(canAddDot("Finance", "Scheming", { "Basic Analytical": 1 })).toBe(false)
  })
})

describe("canRemoveDot", () => {
  it("cannot remove if no dots", () => {
    expect(canRemoveDot("Guns", "Thrashing", { Guns: 0 })).toBe(false)
  })

  it("can remove standalone", () => {
    expect(canRemoveDot("Guns", "Thrashing", { Guns: 3 })).toBe(true)
  })

  it("cannot remove if child depends", () => {
    const dots = { "Basic Analytical": 2, Finance: 1 }
    expect(canRemoveDot("Basic Analytical", "Scheming", dots)).toBe(false)
  })

  it("can remove parent if child is empty", () => {
    const dots = { "Basic Analytical": 2, Finance: 0 }
    expect(canRemoveDot("Basic Analytical", "Scheming", dots)).toBe(true)
  })

  it("OR branch can remove one parent if other qualifies", () => {
    const dots = { Guns: 5, Projectiles: 5, Marksmanship: 1 }
    expect(canRemoveDot("Guns", "Thrashing", dots)).toBe(true)
  })

  it("OR branch cannot remove last qualifying parent", () => {
    const dots = { Guns: 5, Projectiles: 4, Marksmanship: 1 }
    expect(canRemoveDot("Guns", "Thrashing", dots)).toBe(false)
  })
})

describe("XP cost", () => {
  it("standalone first dot", () => {
    expect(xpCostForNextDot("Guns", "Thrashing", {})).toBe(1)
  })

  it("standalone third dot", () => {
    expect(xpCostForNextDot("Guns", "Thrashing", { Guns: 2 })).toBe(3)
  })

  it("Finance first dot", () => {
    expect(xpCostForNextDot("Finance", "Scheming", { "Basic Analytical": 2 })).toBe(3)
  })

  it("Finance second dot", () => {
    expect(xpCostForNextDot("Finance", "Scheming", { "Basic Analytical": 2, Finance: 1 })).toBe(4)
  })

  it("instructions example finance total", () => {
    const baCost = xpCostForNOwnDots("Basic Analytical", "Scheming", 2)
    const finCost = xpCostForNOwnDots("Finance", "Scheming", 2)
    expect(baCost).toBe(3) // 1+2
    expect(finCost).toBe(7) // (2+1)+(2+2) = 3+4
    expect(baCost + finCost).toBe(10)
  })

  it("marksmanship first dot xp", () => {
    const dots = { Guns: 5 }
    expect(xpCostForNextDot("Marksmanship", "Thrashing", dots)).toBe(6)
  })
})

describe("totalSkillXp", () => {
  it("empty dots", () => {
    expect(totalSkillXp({}, [])).toBe(0)
  })

  it("Basic Analytical two dots", () => {
    expect(totalSkillXp({ "Basic Analytical": 2 }, [])).toBe(3)
  })

  it("Finance with prereq", () => {
    expect(totalSkillXp({ "Basic Analytical": 2, Finance: 2 }, [])).toBe(10)
  })

  it("custom skill xp", () => {
    const custom = [{ name: "Dance", maxDots: 5 }]
    expect(totalSkillXp({ Dance: 3 }, custom)).toBe(6)
  })

  it("known budget scenario", () => {
    const dots = { "Basic Analytical": 2, Brawl: 2 }
    expect(totalSkillXp(dots, [])).toBe(6)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TRAIT TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("traits", () => {
  it("empty trait cost", () => {
    expect(getTotalTraitCost(char())).toBe(0)
  })

  it("positive trait cost", () => {
    const c = char()
    addTrait(c, "mortal_traits", "brave", 2)
    expect(getTotalTraitCost(c)).toBe(2)
  })

  it("negative trait cost", () => {
    const c = char()
    addTrait(c, "mortal_traits", "cowardly", -2)
    expect(getTotalTraitCost(c)).toBe(-2)
  })

  it("mixed trait cost", () => {
    const c = char()
    addTrait(c, "mortal_traits", "brave", 2)
    addTrait(c, "mortal_traits", "cowardly", -2)
    expect(getTotalTraitCost(c)).toBe(0)
  })

  it("trait cost across both lists", () => {
    const c = char()
    addTrait(c, "mortal_traits", "beautiful", 2)
    addTrait(c, "vampire_traits", "ravenous", -3)
    expect(getTotalTraitCost(c)).toBe(-1)
  })

  it("at max cost exactly two", () => {
    const c2 = char()
    addTrait(c2, "mortal_traits", "genius", 3)
    addTrait(c2, "vampire_traits", "territorial", -2)
    addTrait(c2, "mortal_traits", "famous", 1)
    expect(getTotalTraitCost(c2)).toBe(2)
  })

  it("trait count", () => {
    const c = char()
    addTrait(c, "mortal_traits", "brave", 2)
    addTrait(c, "mortal_traits", "cowardly", -2)
    addTrait(c, "vampire_traits", "ravenous", -3)
    expect(getTraitCount(c)).toBe(3)
  })

  it("mental illness keys in set", () => {
    expect(MENTAL_ILLNESS_KEYS.has("paranoid")).toBe(true)
    expect(MENTAL_ILLNESS_KEYS.has("dissociative_episodes")).toBe(true)
    expect(MENTAL_ILLNESS_KEYS.has("brave")).toBe(false)
  })

  it("all mortal traits have valid cost", () => {
    for (const t of MORTAL_TRAITS) {
      expect("cost" in t).toBe(true)
      if (t.variableCost) {
        expect(t.costOptions).toBeDefined()
      }
    }
  })

  it("all vampire traits have valid cost", () => {
    for (const t of VAMPIRE_TRAITS) {
      expect("cost" in t).toBe(true)
      if (t.variableCost) {
        expect(t.costOptions).toBeDefined()
      }
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DISCIPLINE TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("disciplines", () => {
  it("xp cost per level", () => {
    expect(xpCostForDiscLevel(0)).toBe(1)
    expect(xpCostForDiscLevel(1)).toBe(2)
    expect(xpCostForDiscLevel(4)).toBe(5)
  })

  it("total disc xp single", () => {
    expect(totalDiscXp({ Auspex: 4 })).toBe(10)
  })

  it("total disc xp multiple", () => {
    expect(totalDiscXp({ Auspex: 2, Celerity: 1 })).toBe(4)
  })

  it("total disc xp zero", () => {
    expect(totalDiscXp({})).toBe(0)
    expect(totalDiscXp({ Auspex: 0 })).toBe(0)
  })

  it("available powers level 1", () => {
    const powers = getAvailablePowers("Auspex", 1, [])
    const names = new Set(powers.map((p) => p.name))
    expect(names.has("Enhance Senses")).toBe(true)
    expect(names.has("Sense The Unseen")).toBe(true)
    expect(names.has("Impulse")).toBe(true)
    expect(names.has("Read Aura")).toBe(false)
  })

  it("available powers excludes acquired", () => {
    const powers = getAvailablePowers("Auspex", 1, ["Enhance Senses"])
    const names = new Set(powers.map((p) => p.name))
    expect(names.has("Enhance Senses")).toBe(false)
  })

  it("power requires prerequisite", () => {
    const without = getAvailablePowers("Auspex", 4, ["Read Aura"])
    expect(without.some((p) => p.name === "Scry")).toBe(false)

    const withTelepathy = getAvailablePowers("Auspex", 4, ["Telepathy"])
    expect(withTelepathy.some((p) => p.name === "Scry")).toBe(true)
  })

  it("Fortitude Toughness is level 1", () => {
    const toughness = DISCIPLINES["Fortitude"].powers.find((p) => p.name === "Toughness")
    expect(toughness?.level).toBe(1)
  })

  it("all disciplines have at least one level 1 power", () => {
    for (const [discName, disc] of Object.entries(DISCIPLINES)) {
      const level1 = disc.powers.filter((p) => p.level === 1)
      expect(level1.length, `${discName} has no level 1 powers`).toBeGreaterThanOrEqual(1)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// HP MAX TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("getHpMax", () => {
  it("base hp", () => {
    expect(getHpMax(char())).toBe(10)
  })

  it("iron constitution adds one", () => {
    const c = char()
    addTrait(c, "mortal_traits", "iron_constitution", 2)
    expect(getHpMax(c)).toBe(11)
  })

  it("fortitude toughness adds two per level", () => {
    const c = char()
    c.discipline_levels["Fortitude"] = 2
    c.discipline_powers["Fortitude"] = ["Toughness"]
    expect(getHpMax(c)).toBe(10 + 2 * 2)
  })

  it("fortitude without toughness no bonus", () => {
    const c = char()
    c.discipline_levels["Fortitude"] = 3
    c.discipline_powers["Fortitude"] = ["Rapid Healing"]
    expect(getHpMax(c)).toBe(10)
  })

  it("iron constitution plus fortitude toughness", () => {
    const c = char()
    addTrait(c, "mortal_traits", "iron_constitution", 2)
    c.discipline_levels["Fortitude"] = 3
    c.discipline_powers["Fortitude"] = ["Toughness"]
    expect(getHpMax(c)).toBe(10 + 1 + 2 * 3)
  })

  it("fortitude level 5 toughness", () => {
    const c = char()
    c.discipline_levels["Fortitude"] = 5
    c.discipline_powers["Fortitude"] = ["Toughness"]
    expect(getHpMax(c)).toBe(10 + 2 * 5)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CLAN ELIGIBILITY TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("clan eligibility", () => {
  it("no eligible clans fresh character", () => {
    expect(getEligibleClans(char())).toEqual([])
  })

  it("Ventrue requires selective_taste and Dominate", () => {
    const c = char()
    addTrait(c, "vampire_traits", "selective_taste", -1)
    expect(checkClanEligibility("Ventrue", c)).toBe(false)
    c.unlocked_disciplines = ["Dominate"]
    expect(checkClanEligibility("Ventrue", c)).toBe(true)
  })

  it("Dracul requires territorial or archaic", () => {
    const c = char()
    expect(checkClanEligibility("Dracul", c)).toBe(false)
    addTrait(c, "vampire_traits", "territorial", -2)
    expect(checkClanEligibility("Dracul", c)).toBe(true)
  })

  it("Dracul archaic also works", () => {
    const c = char()
    addTrait(c, "vampire_traits", "archaic", -3)
    expect(checkClanEligibility("Dracul", c)).toBe(true)
  })

  it("Toreador requires trait and Presence (list-agnostic trait matching)", () => {
    const c = char()
    addTrait(c, "mortal_traits", "infatuation", -1)
    expect(checkClanEligibility("Toreador", c)).toBe(false)
    c.unlocked_disciplines = ["Presence"]
    expect(checkClanEligibility("Toreador", c)).toBe(true)
  })

  it("Nosferatu ugly or corpse_like", () => {
    const c = char()
    c.unlocked_disciplines = ["Obfuscate"]
    addTrait(c, "mortal_traits", "ugly", -2)
    expect(checkClanEligibility("Nosferatu", c)).toBe(true)
  })

  it("Nosferatu corpse_like also works", () => {
    const c = char()
    c.unlocked_disciplines = ["Obfuscate"]
    addTrait(c, "vampire_traits", "corpse_like", -2)
    expect(checkClanEligibility("Nosferatu", c)).toBe(true)
  })

  it("Brujah needs prone_to_rage and Potence or Celerity", () => {
    const c = char()
    addTrait(c, "vampire_traits", "prone_to_rage", -2)
    expect(checkClanEligibility("Brujah", c)).toBe(false)
    c.unlocked_disciplines = ["Potence"]
    expect(checkClanEligibility("Brujah", c)).toBe(true)
  })

  it("Brujah Celerity also works", () => {
    const c = char()
    addTrait(c, "vampire_traits", "prone_to_rage", -2)
    c.unlocked_disciplines = ["Celerity"]
    expect(checkClanEligibility("Brujah", c)).toBe(true)
  })

  it("Gangrel needs ravenous and Animalism or Protean", () => {
    const c = char()
    addTrait(c, "vampire_traits", "ravenous", -3)
    expect(checkClanEligibility("Gangrel", c)).toBe(false)
    c.unlocked_disciplines = ["Animalism"]
    expect(checkClanEligibility("Gangrel", c)).toBe(true)
  })

  it("Malkavian mortal mental illness", () => {
    const c = char()
    addTrait(c, "mortal_traits", "paranoid", -2)
    expect(checkClanEligibility("Malkavian", c)).toBe(true)
  })

  it("Malkavian vampire mental illness", () => {
    const c = char()
    addTrait(c, "vampire_traits", "psychotic_episodes", -3)
    expect(checkClanEligibility("Malkavian", c)).toBe(true)
  })

  it("Malkavian no mental illness fails", () => {
    const c = char()
    addTrait(c, "mortal_traits", "brave", 2)
    expect(checkClanEligibility("Malkavian", c)).toBe(false)
  })

  it("Tremere needs specific traits and Blood Sorcery", () => {
    const c = char()
    addTrait(c, "mortal_traits", "rare_specialist", 2, { detail: "Alchemy" })
    c.unlocked_disciplines = ["Blood Sorcery"]
    expect(checkClanEligibility("Tremere", c)).toBe(true)
  })

  it("Hecata painful_bite or selective_mutism", () => {
    const c = char()
    c.unlocked_disciplines = ["Necromancy"]
    addTrait(c, "vampire_traits", "painful_bite", -2)
    expect(checkClanEligibility("Hecata", c)).toBe(true)
  })

  it("multiple eligible clans simultaneously", () => {
    const c = char()
    addTrait(c, "mortal_traits", "rare_specialist", 2, { detail: "Opera" })
    c.unlocked_disciplines = ["Presence", "Blood Sorcery"]
    const eligible = getEligibleClans(c)
    expect(eligible).toContain("Toreador")
    expect(eligible).toContain("Tremere")
  })

  it("unknown clan returns false", () => {
    expect(checkClanEligibility("Unknown Clan", char())).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// XP BUDGET TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("XP budget", () => {
  it("creation skill xp starts zero", () => {
    expect(getCreationSkillXpSpent(char())).toBe(0)
  })

  it("creation disc xp starts zero", () => {
    expect(getCreationDiscXpSpent(char())).toBe(0)
  })

  it("can spend skill xp within budget", () => {
    expect(canSpendSkillXp(char(), 5)).toBe(true)
  })

  it("cannot overspend creation skill budget", () => {
    const c = char()
    c.skill_dots = { Brawl: 2, Guns: 3 } // 3 + 6 = 9 XP
    c.earned_xp = 0
    expect(canSpendSkillXp(c, 7)).toBe(false) // 9+7=16 > 15
    expect(canSpendSkillXp(c, 6)).toBe(true) // 9+6=15 exactly
  })

  it("earned xp extends budget", () => {
    const c = char()
    c.skill_dots = { Awareness: 5 } // 1+2+3+4+5 = 15 XP
    c.earned_xp = 5
    expect(canSpendSkillXp(c, 1)).toBe(true)
  })

  it("creation disc xp limit", () => {
    const c = char()
    c.discipline_levels = { Auspex: 4 } // 10 XP
    c.earned_xp = 0
    expect(canSpendDiscXp(c, 1)).toBe(false)
  })

  it("creation disc xp within budget", () => {
    const c = char()
    c.discipline_levels = { Auspex: 2 } // 3 XP spent
    expect(canSpendDiscXp(c, 3)).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// EDGE CASES
// ─────────────────────────────────────────────────────────────────────────────

describe("edge cases", () => {
  it("spend exactly 15 skill xp", () => {
    const c = char()
    c.skill_dots = { Brawl: 2, Dodge: 3, Guns: 2, Awareness: 1, Stealth: 1, Medicine: 1 }
    expect(totalSkillXp(c.skill_dots, [])).toBe(15)
  })

  it("cannot invest in child without parent", () => {
    expect(canAddDot("Finance", "Scheming", {})).toBe(false)
    expect(canAddDot("Finance", "Scheming", { "Basic Analytical": 1 })).toBe(false)
  })

  it("removing dots bottom up", () => {
    const dots = { "Basic Analytical": 2, Finance: 2 }
    expect(canRemoveDot("Finance", "Scheming", dots)).toBe(true)
    expect(canRemoveDot("Basic Analytical", "Scheming", dots)).toBe(false)
    const dotsNoFinance = { "Basic Analytical": 2 }
    expect(canRemoveDot("Basic Analytical", "Scheming", dotsNoFinance)).toBe(true)
  })

  it("max trait count 8", () => {
    const c = char()
    for (let i = 0; i < MAX_TRAITS; i++) {
      addTrait(c, "mortal_traits", `trait_${i}`, 0)
    }
    expect(getTraitCount(c)).toBe(MAX_TRAITS)
  })

  it("max creation disc xp level 4 one discipline", () => {
    expect(totalDiscXp({ Auspex: 4 })).toBe(10)
  })

  it("three disciplines at level 1 costs 3", () => {
    expect(totalDiscXp({ Auspex: 1, Celerity: 1, Dominate: 1 })).toBe(3)
  })

  it("character default state", () => {
    const c = defaultCharacter()
    expect(c.wizard_stage).toBe(1)
    expect(c.wizard_complete).toBe(false)
    expect(c.skill_dots).toEqual({})
    expect(c.unlocked_disciplines).toEqual([])
    expect(c.hp_current).toBe(10)
    expect(c.willpower_current).toBe(10)
    expect(c.blood_current).toBe(10)
    expect(c.earned_xp).toBe(0)
  })

  it("Medicine max dots 7", () => {
    expect(SKILL_TREES["Resourcefulness"]["Medicine"].maxDots).toBe(7)
  })

  it("Marksmanship requires max Guns or Projectiles", () => {
    const dots: Record<string, number> = { Guns: 4 }
    expect(canAddDot("Marksmanship", "Thrashing", dots)).toBe(false)
    dots["Guns"] = 5
    expect(canAddDot("Marksmanship", "Thrashing", dots)).toBe(true)
  })

  it("discipline powers list grows with level", () => {
    const c = char()
    c.unlocked_disciplines = ["Auspex"]
    c.discipline_levels["Auspex"] = 2
    c.discipline_powers["Auspex"] = ["Enhance Senses", "Read Aura"]
    expect(c.discipline_powers["Auspex"].length).toBeLessThanOrEqual(c.discipline_levels["Auspex"])
  })

  it("Scry requires Telepathy at level 4", () => {
    const without = getAvailablePowers("Auspex", 4, ["Enhance Senses"])
    expect(without.some((p) => p.name === "Scry")).toBe(false)

    const withTelepathy = getAvailablePowers("Auspex", 4, ["Enhance Senses", "Telepathy"])
    expect(withTelepathy.some((p) => p.name === "Scry")).toBe(true)
  })

  it("Boon Economy requires Court Etiquette 3", () => {
    expect(canInvest("Boon Economy", "Manipulation", { "Basic Manipulation": 2, "Court Etiquette": 2 })).toBe(false)
    expect(canInvest("Boon Economy", "Manipulation", { "Basic Manipulation": 2, "Court Etiquette": 3 })).toBe(true)
  })

  it("Occult and Science both branch from Curiosity 2", () => {
    const dotsOk = { Curiosity: 2 }
    const dotsFail = { Curiosity: 1 }
    expect(canInvest("Science", "Experimentation", dotsOk)).toBe(true)
    expect(canInvest("Science", "Experimentation", dotsFail)).toBe(false)
    expect(canInvest("Occult", "Experimentation", dotsOk)).toBe(true)
    expect(canInvest("Occult", "Experimentation", dotsFail)).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// COMPREHENSIVE WIZARD FLOW SCENARIOS
// ─────────────────────────────────────────────────────────────────────────────

describe("wizard flow scenarios", () => {
  it("scholar vampire flow", () => {
    const c = char()
    addTrait(c, "mortal_traits", "genius", 3)
    addTrait(c, "mortal_traits", "cowardly", -2)
    expect(getTotalTraitCost(c)).toBe(1)

    addTrait(c, "vampire_traits", "selective_taste", -1)
    expect(getTotalTraitCost(c)).toBe(0)

    c.skill_dots = {
      "Basic Analytical": 2, // 3 XP
      Investigation: 3, // base 2, own 3 -> 3+4+5 = 12 XP
    }
    expect(totalSkillXp(c.skill_dots, [])).toBe(15)

    c.unlocked_disciplines = ["Auspex", "Arrete"]
    expect(checkClanEligibility("Ventrue", c)).toBe(false)

    c.unlocked_disciplines = ["Auspex", "Arrete", "Dominate"]
    c.discipline_levels = { Auspex: 3, Arrete: 1, Dominate: 0 }
    expect(totalDiscXp(c.discipline_levels)).toBe(7)

    expect(checkClanEligibility("Ventrue", c)).toBe(true)
  })

  it("Brujah warrior flow", () => {
    const c = char()
    addTrait(c, "vampire_traits", "prone_to_rage", -2)
    addTrait(c, "mortal_traits", "large", 1)
    addTrait(c, "vampire_traits", "ravenous", -3)
    addTrait(c, "mortal_traits", "brave", 2)
    expect(getTotalTraitCost(c)).toBe(-2)

    c.skill_dots = {
      Brawl: 2, // 3 XP
      "Martial Arts": 3, // base 2, own 3 -> 3+4+5=12 -> total 15
    }
    expect(totalSkillXp(c.skill_dots, [])).toBe(15)

    c.unlocked_disciplines = ["Potence", "Celerity", "Fortitude"]
    c.discipline_levels = { Potence: 2, Celerity: 2, Fortitude: 1 }
    c.discipline_powers["Fortitude"] = ["Toughness"]
    expect(totalDiscXp(c.discipline_levels)).toBe(7)

    expect(getHpMax(c)).toBe(12)

    expect(checkClanEligibility("Brujah", c)).toBe(true)
  })

  it("Gangrel with Fortitude 5 flow", () => {
    const c = char()
    addTrait(c, "vampire_traits", "ravenous", -3)
    c.unlocked_disciplines = ["Animalism", "Protean", "Fortitude"]
    c.discipline_levels["Fortitude"] = 5
    c.discipline_powers["Fortitude"] = ["Toughness"]
    expect(getHpMax(c)).toBe(20)

    c.earned_xp = 5
    expect(totalDiscXp(c.discipline_levels)).toBe(15)

    expect(checkClanEligibility("Gangrel", c)).toBe(true)
  })

  it("Nosferatu spy flow", () => {
    const c = char()
    addTrait(c, "mortal_traits", "ugly", -2)
    addTrait(c, "mortal_traits", "amnesiac", -2)
    addTrait(c, "mortal_traits", "brave", 2)
    expect(getTotalTraitCost(c)).toBe(-2)

    c.unlocked_disciplines = ["Obfuscate", "Auspex", "Animalism"]
    c.discipline_levels = { Obfuscate: 2, Auspex: 2, Animalism: 1 }
    expect(totalDiscXp(c.discipline_levels)).toBe(7)
    expect(checkClanEligibility("Nosferatu", c)).toBe(true)
  })

  it("no-discipline character flow is valid", () => {
    const c = char()
    c.unlocked_disciplines = ["Auspex", "Celerity", "Potence"]
    expect(totalDiscXp({})).toBe(0)
  })

  it("trait cost cap exactly at 2", () => {
    const c = char()
    addTrait(c, "mortal_traits", "genius", 3)
    addTrait(c, "mortal_traits", "lightning_reflexes", 3)
    addTrait(c, "vampire_traits", "archaic", -3)
    addTrait(c, "vampire_traits", "ravenous", -3)
    expect(getTotalTraitCost(c)).toBe(0)
  })

  it("Malkavian with multiple mental illnesses", () => {
    const c = char()
    addTrait(c, "mortal_traits", "paranoid", -2)
    addTrait(c, "mortal_traits", "depressive_episodes", -2)
    addTrait(c, "mortal_traits", "beautiful", 2)
    addTrait(c, "vampire_traits", "morph", 2)
    expect(getTotalTraitCost(c)).toBe(0)
    expect(checkClanEligibility("Malkavian", c)).toBe(true)
  })
})
