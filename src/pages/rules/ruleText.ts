// Static prose ported verbatim from scripts/generate_rules_doc.py's TEMPLATE.
// The Traits/Skills/Disciplines/Clans sections are rendered live from data/*.ts
// instead (see RulesPage.tsx) so this page never drifts out of sync with the data,
// unlike the old app which needed a manual regeneration step.

import type { TraitDef } from "../../data/traits"
import type { ClanRequirements } from "../../data/clans"
import { MORTAL_TRAITS, VAMPIRE_TRAITS } from "../../data/traits"

const TRAIT_NAME = new Map([...MORTAL_TRAITS, ...VAMPIRE_TRAITS].map((t) => [t.key, t.name]))

export function costStr(t: TraitDef): string {
  if (t.variableCost && t.costOptions) {
    const values = t.costOptions.map(([c]) => c)
    const lo = Math.min(...values)
    const hi = Math.max(...values)
    return `${lo} to ${hi}`
  }
  const c = t.cost ?? 0
  const sign = c >= 0 ? "+" : ""
  return `${sign}${c}`
}

export function reqText(reqs: ClanRequirements): string {
  const parts: string[] = []
  if (reqs.trait_any_malkavian) {
    parts.push(
      "At least one qualifying mental-illness Trait (Paranoid, Dissociative Episodes, " +
        "Depressive Episodes, Manic Episodes, Psychotic Episodes, Panic Disorder, " +
        "Post-Traumatic Stress, Delusional Belief, or Selective Mutism), from before or " +
        "caused by the Embrace",
    )
  }
  if (reqs.trait_any) {
    parts.push("Trait: " + reqs.trait_any.map((k) => TRAIT_NAME.get(k) ?? k).join(" or "))
  }
  if (reqs.discipline_all) {
    parts.push("Discipline: " + reqs.discipline_all.join(" and "))
  }
  if (reqs.discipline_any) {
    parts.push("Discipline: " + reqs.discipline_any.join(" or "))
  }
  return parts.join("; ")
}

export const MORTAL_CATEGORY_OPTIONS: [string, string][] = [
  ["personality", "Personality"],
  ["mental", "Mental"],
  ["body", "Body"],
  ["sensory", "Sensory"],
  ["other", "Other"],
]
