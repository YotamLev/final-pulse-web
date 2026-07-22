// Skill tree definitions and branching-logic helpers for Final Pulse 2E.
//
// branchesFrom: null | [parent, threshold] | [parent, threshold][] (OR condition, branchesOr: true)
// Skill ordering inside each tree matters for display (parents before children).

export interface SkillDef {
  description: string
  maxDots: number
  branchesFrom: null | [string, number] | [string, number][]
  branchesOr?: boolean
}

export type SkillTree = Record<string, SkillDef>

export const SKILL_TREES: Record<string, SkillTree> = {
  Scheming: {
    "Basic Analytical": {
      description: "Inferring secrets, planning ambushes, investigating crime scenes.",
      maxDots: 2,
      branchesFrom: null,
    },
    Finance: {
      description: "Manage money, embezzle, launder, follow money trails.",
      maxDots: 5,
      branchesFrom: ["Basic Analytical", 2],
    },
    Logistics: {
      description: "Supplying, smuggling, organizing.",
      maxDots: 5,
      branchesFrom: ["Basic Analytical", 2],
    },
    Investigation: {
      description: "Interrogate, pick up clues, scan vast text sources.",
      maxDots: 5,
      branchesFrom: ["Basic Analytical", 2],
    },
    "Social Academics": {
      description: "History, Archeology, Sociology, Anthropology, Philosophy, Literature.",
      maxDots: 5,
      branchesFrom: ["Basic Analytical", 2],
    },
    "Mortal Politics": {
      description: "Organize large institutions, find who holds sway in mortal society, understand mortal laws.",
      maxDots: 5,
      branchesFrom: ["Basic Analytical", 2],
    },
    "Undead Politics": {
      description: "Find out who holds sway and makes decisions in vampiric society.",
      maxDots: 2,
      branchesFrom: ["Mortal Politics", 3],
    },
  },
  Manipulation: {
    "Basic Manipulation": {
      description: "Push people's buttons, convince, convert.",
      maxDots: 2,
      branchesFrom: null,
    },
    Insight: {
      description: "See through lies, uncover motives and emotions.",
      maxDots: 5,
      branchesFrom: null,
    },
    "Court Etiquette": {
      description: "Rules of Vampiric society, traditions, proper forms of address.",
      maxDots: 5,
      branchesFrom: ["Basic Manipulation", 2],
    },
    "Boon Economy": {
      description: "Understand how Boons and Debts amongst Vampires work and use them to your advantage.",
      maxDots: 2,
      branchesFrom: ["Court Etiquette", 3],
    },
    "Social Chameleon": {
      description: "Integrate in mortal society and circles, understand and perform mortal culture.",
      maxDots: 5,
      branchesFrom: ["Basic Manipulation", 2],
    },
    "Mortal Society Status": {
      description: "Learn to rise in Status and recognition, and wield them over mortals.",
      maxDots: 2,
      branchesFrom: ["Social Chameleon", 1],
    },
    Deception: {
      description: "Learn to lie and deceive.",
      maxDots: 5,
      branchesFrom: ["Basic Manipulation", 2],
    },
    Persuasion: {
      description: "Learn to convince and corrupt.",
      maxDots: 5,
      branchesFrom: ["Basic Manipulation", 2],
    },
    Intimidation: {
      description: "Learn to frighten and strong-arm your lessers.",
      maxDots: 5,
      branchesFrom: ["Basic Manipulation", 2],
    },
  },
  Thrashing: {
    Brawl: {
      description: "Up-close and personal fighting. Battle-awareness, willingness to suffer and impose pain.",
      maxDots: 2,
      branchesFrom: null,
    },
    "Martial Arts": {
      description: "Fighting face-to-face using fists, kicks, chokeholds etc.",
      maxDots: 5,
      branchesFrom: ["Brawl", 2],
    },
    Swordsmanship: {
      description: "Fighting using bladed weapons: swords, scimitars, rapiers, katanas.",
      maxDots: 5,
      branchesFrom: ["Brawl", 2],
    },
    Bludgeoning: {
      description: "Adept at blunt-force trauma: maces, baseball bats, rocks.",
      maxDots: 5,
      branchesFrom: ["Brawl", 2],
    },
    Guns: {
      description: "Can shoot, clean, reload guns. Knows how to handle them.",
      maxDots: 5,
      branchesFrom: null,
    },
    Projectiles: {
      description: "Can shoot bows, throw knives, and use other long-range weapons.",
      maxDots: 5,
      branchesFrom: null,
    },
    Marksmanship: {
      description: "Can shoot long range, picking up targets as a sniper.",
      maxDots: 2,
      branchesFrom: [
        ["Guns", 5],
        ["Projectiles", 5],
      ],
      branchesOr: true,
    },
    Dodge: {
      description: "Dodge physical attacks. Roll if actively dodging, or take half rounded-down as difficulty to hit you.",
      maxDots: 5,
      branchesFrom: null,
    },
    Athletics: {
      description: "Can jump, climb, crawl, and stay upright.",
      maxDots: 5,
      branchesFrom: null,
    },
  },
  Resourcefulness: {
    Awareness: {
      description: "Notice threats, recognize surroundings.",
      maxDots: 5,
      branchesFrom: null,
    },
    Stealth: {
      description: "Can hide, sneak, skulk, notice gazes.",
      maxDots: 5,
      branchesFrom: null,
    },
    Larceny: {
      description: "Can picklock, pickpocket, carjack, break & enter.",
      maxDots: 5,
      branchesFrom: ["Stealth", 2],
    },
    Streetwise: {
      description: "Can get drugs, understand gang territory, notice weird looks, survive in urban areas.",
      maxDots: 5,
      branchesFrom: ["Awareness", 2],
    },
    Survival: {
      description: "Understand terrain, navigation, find sanctuary from the sun, survive in non-urban areas.",
      maxDots: 5,
      branchesFrom: ["Awareness", 2],
    },
    Technology: {
      description: "Understand common technology as something to use and manipulate.",
      maxDots: 5,
      branchesFrom: null,
    },
    Hacking: {
      description: "Understand operating systems, cryptography, and communication well enough to abuse, infiltrate, and distort.",
      maxDots: 5,
      branchesFrom: ["Technology", 2],
    },
    Medicine: {
      description: "Understand the mortal body, disease symptoms, treatments. (Mastery level — up to 7 dots)",
      maxDots: 7,
      branchesFrom: null,
    },
    "Medical Forensics": {
      description: "Understand evidence collection methods, DNA, how to make deaths look natural.",
      maxDots: 5,
      branchesFrom: ["Medicine", 2],
    },
    Poisons: {
      description: "Understand dosages, poisons, drug overdoses.",
      maxDots: 5,
      branchesFrom: ["Medicine", 2],
    },
  },
  Experimentation: {
    Curiosity: {
      description: "Morbid interest in pushing the limits of what current society can do and is willing to do.",
      maxDots: 2,
      branchesFrom: null,
    },
    Science: {
      description: "Understand the scientific method and current mainstream science.",
      maxDots: 5,
      branchesFrom: ["Curiosity", 2],
    },
    Biology: {
      description: "Understand biological processes in mortals, animals, bacteria, viruses.",
      maxDots: 5,
      branchesFrom: ["Science", 2],
    },
    Chemistry: {
      description: "Understand compounds, can create chemical reactions, acids, explosives.",
      maxDots: 5,
      branchesFrom: ["Science", 2],
    },
    "Weird Science": {
      description: "Willing to experiment on unwilling mortals; can create mutants, targeted viruses. Uses are specific, unstable, and often unreproducible.",
      maxDots: 5,
      branchesFrom: ["Biology", 2],
    },
    Alchemy: {
      description: "Can create new materials, potions and elixirs with limited-time effects. Uses are specific, unstable, and require exotic ingredients.",
      maxDots: 5,
      branchesFrom: ["Chemistry", 2],
    },
    Occult: {
      description: "Research forbidden lore, secret weaknesses, and rituals.",
      maxDots: 5,
      branchesFrom: ["Curiosity", 2],
    },
    Demonology: {
      description: "Research demons and means of summoning them.",
      maxDots: 5,
      branchesFrom: ["Occult", 3],
    },
  },
}

export const ALL_TREE_NAMES: string[] = Object.keys(SKILL_TREES)

function isOrBranch(branch: NonNullable<SkillDef["branchesFrom"]>): branch is [string, number][] {
  return Array.isArray(branch[0])
}

function getSkill(skillName: string, treeName: string): SkillDef | undefined {
  return SKILL_TREES[treeName]?.[skillName]
}

/** Static contribution from parent skills at their branch threshold (structure-only, not investment). */
export function getStaticBase(skillName: string, treeName: string): number {
  const skill = getSkill(skillName, treeName)
  if (!skill) return 0
  const branch = skill.branchesFrom
  if (branch === null) return 0

  const [parentName, threshold] = isOrBranch(branch) ? branch[0] : branch
  return getStaticBase(parentName, treeName) + threshold
}

/** How many of the static base dots are currently filled by actual parent investment. */
export function getAchievedBase(skillName: string, treeName: string, ownDots: Record<string, number>): number {
  const skill = getSkill(skillName, treeName)
  if (!skill) return 0
  const branch = skill.branchesFrom
  if (branch === null) return 0

  if (isOrBranch(branch)) {
    let best = 0
    for (const [parentName, threshold] of branch) {
      const contrib = Math.min(ownDots[parentName] ?? 0, threshold)
      best = Math.max(best, getAchievedBase(parentName, treeName, ownDots) + contrib)
    }
    return best
  }
  const [parentName, threshold] = branch
  const contrib = Math.min(ownDots[parentName] ?? 0, threshold)
  return getAchievedBase(parentName, treeName, ownDots) + contrib
}

/** Effective (practical) level = static_base + own dots invested. */
export function getEffectiveLevel(skillName: string, treeName: string, ownDots: Record<string, number>): number {
  return getStaticBase(skillName, treeName) + (ownDots[skillName] ?? 0)
}

/** True if prerequisites are satisfied to invest any dot in this skill. */
export function canInvest(skillName: string, treeName: string, ownDots: Record<string, number>): boolean {
  const skill = getSkill(skillName, treeName)
  if (!skill) return false
  const branch = skill.branchesFrom
  if (branch === null) return true

  if (isOrBranch(branch)) {
    return branch.some(([p, t]) => (ownDots[p] ?? 0) >= t)
  }
  const [parent, threshold] = branch
  return (ownDots[parent] ?? 0) >= threshold
}

/** True if a dot can be added (prerequisites met and below max). */
export function canAddDot(skillName: string, treeName: string, ownDots: Record<string, number>): boolean {
  const skill = getSkill(skillName, treeName)
  if (!skill) return false
  if ((ownDots[skillName] ?? 0) >= skill.maxDots) return false
  return canInvest(skillName, treeName, ownDots)
}

/** True if a dot can be removed (has dots and no child skill depends on this level). */
export function canRemoveDot(skillName: string, treeName: string, ownDots: Record<string, number>): boolean {
  const current = ownDots[skillName] ?? 0
  if (current <= 0) return false

  const newOwn = current - 1
  const tree = SKILL_TREES[treeName] ?? {}

  for (const [childName, childSkill] of Object.entries(tree)) {
    const branch = childSkill.branchesFrom
    if (branch === null) continue
    if ((ownDots[childName] ?? 0) === 0) continue // child not invested

    if (isOrBranch(branch)) {
      for (const [parentName, threshold] of branch) {
        if (parentName === skillName && newOwn < threshold) {
          const otherQualifies = branch.some(
            ([p, t]) => p !== skillName && (ownDots[p] ?? 0) >= t,
          )
          if (!otherQualifies) return false
        }
      }
    } else {
      const [parentName, threshold] = branch
      if (parentName === skillName && newOwn < threshold) return false
    }
  }

  return true
}

/** XP cost to add the next dot = the effective level after adding it. */
export function xpCostForNextDot(skillName: string, treeName: string, ownDots: Record<string, number>): number {
  const base = getStaticBase(skillName, treeName)
  return base + (ownDots[skillName] ?? 0) + 1
}

/** Total XP cost to reach n own dots from 0 (not counting prerequisites). */
export function xpCostForNOwnDots(skillName: string, treeName: string, n: number): number {
  const base = getStaticBase(skillName, treeName)
  // XP = sum_{i=1}^{n} (base + i) = n*base + n*(n+1)/2
  return n * base + Math.floor((n * (n + 1)) / 2)
}

export interface CustomSkill {
  name: string
  maxDots: number
}

/** Total XP spent across all skill trees (standard + custom). */
export function totalSkillXp(ownDots: Record<string, number>, customSkills: CustomSkill[]): number {
  let total = 0
  for (const [treeName, skills] of Object.entries(SKILL_TREES)) {
    for (const skillName of Object.keys(skills)) {
      const n = ownDots[skillName] ?? 0
      if (n > 0) {
        total += xpCostForNOwnDots(skillName, treeName, n)
      }
    }
  }
  // Custom skills are standalone (base = 0)
  for (const cs of customSkills) {
    const n = ownDots[cs.name] ?? 0
    if (n > 0) {
      total += Math.floor((n * (n + 1)) / 2)
    }
  }
  return total
}

/** Return the tree name that contains this skill, or null. */
export function getTreeForSkill(skillName: string): string | null {
  for (const [treeName, skills] of Object.entries(SKILL_TREES)) {
    if (skillName in skills) return treeName
  }
  return null
}

/** Return [treeName, skillName, dots][] for all skills with dots > 0. */
export function investedSkills(ownDots: Record<string, number>): [string, string, number][] {
  const result: [string, string, number][] = []
  for (const [treeName, skills] of Object.entries(SKILL_TREES)) {
    for (const skillName of Object.keys(skills)) {
      const d = ownDots[skillName] ?? 0
      if (d > 0) result.push([treeName, skillName, d])
    }
  }
  return result
}
