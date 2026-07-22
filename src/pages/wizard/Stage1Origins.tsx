import { useCharacterStore } from "../../state/characterStore"
import { SectionHeader } from "../../components/SectionHeader"
import { InfoBox } from "../../components/InfoBox"
import { Tabs, type TabItem } from "../../components/Tabs"
import { MEMORIES_PLACEHOLDER } from "../../data/constants"
import { MORTAL_TRAITS, VAMPIRE_TRAITS } from "../../data/traits"
import { getTotalTraitCost, getTraitCount, MAX_TRAITS, MAX_TRAIT_COST } from "../../models/character"
import { QuickstartPanel } from "./QuickstartPanel"
import { TraitGrid } from "./TraitGrid"
import { NavButtons } from "./WizardNav"

export function Stage1Origins() {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)

  const totalCost = getTotalTraitCost(character)
  const count = getTraitCount(character)
  const overBudget = totalCost > MAX_TRAIT_COST
  const sign = totalCost >= 0 ? "+" : ""
  const budgetColor = overBudget ? "var(--accent)" : totalCost <= 0 ? "#4a9a6a" : "var(--text-label)"

  const tabs: TabItem[] = [
    { id: "mortal", label: "Mortal Traits", render: () => <TraitGrid traitListKey="mortal_traits" traitsSource={MORTAL_TRAITS} categorized /> },
    { id: "vampire", label: "Vampire Traits", render: () => <TraitGrid traitListKey="vampire_traits" traitsSource={VAMPIRE_TRAITS} /> },
  ]

  return (
    <div>
      <SectionHeader>Stage 1 — Origins &amp; Traits</SectionHeader>
      <InfoBox>All fields are optional — fill in what inspires you. Everything can be edited later.</InfoBox>

      <QuickstartPanel />

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <label>
          Name
          <input
            type="text"
            value={character.name}
            placeholder="Character name"
            onChange={(e) => updateCharacter((c) => { c.name = e.target.value })}
            style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
          />
        </label>
        <label>
          Tagline
          <input
            type="text"
            value={character.tagline}
            placeholder="e.g. Former NSA analyst"
            onChange={(e) => updateCharacter((c) => { c.tagline = e.target.value })}
            style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
          />
        </label>
      </div>

      <label>
        Memories
        <textarea
          value={character.memories}
          placeholder={MEMORIES_PLACEHOLDER}
          rows={8}
          onChange={(e) => updateCharacter((c) => { c.memories = e.target.value })}
          style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
        />
      </label>

      <hr />

      <div style={{ fontSize: "0.95rem" }}>
        Trait cost: <b style={{ color: budgetColor }}>{sign}{totalCost} / +{MAX_TRAIT_COST}</b> · {count} / {MAX_TRAITS} traits
      </div>
      {overBudget && (
        <div className="alert alert-error">
          Combined cost exceeds +{MAX_TRAIT_COST}. Add negative vampire traits or remove positive mortal traits to continue.
        </div>
      )}

      <Tabs tabs={tabs} />

      <hr />
      <NavButtons stage={1} nextDisabled={overBudget} />
    </div>
  )
}
