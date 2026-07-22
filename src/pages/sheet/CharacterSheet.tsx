import { useCharacterStore } from "../../state/characterStore"
import { Tabs, type TabItem } from "../../components/Tabs"
import { Dots } from "../../components/Dots"
import { InfoBox } from "../../components/InfoBox"
import { getHpMax, BASE_WILLPOWER, BASE_BLOOD } from "../../models/character"
import { SummaryTab } from "./SummaryTab"
import { BackgroundTab } from "./BackgroundTab"
import { TraitsTab } from "./TraitsTab"
import { SkillsTab } from "./SkillsTab"
import { DisciplinesTab } from "./DisciplinesTab"
import { XpTab } from "./XpTab"
import { NotesTab } from "./NotesTab"
import { ExportTab } from "./ExportTab"

export function CharacterSheet() {
  const character = useCharacterStore((s) => s.character)

  const name = character.name || "Unnamed Vampire"
  const clan = character.clan || "Clanless"
  const tagline = character.tagline || ""
  const hpMax = getHpMax(character)
  const hpCur = character.hp_current
  const wpCur = character.willpower_current
  const blCur = character.blood_current

  const tabs: TabItem[] = [
    { id: "summary", label: "📋 Summary", render: () => <SummaryTab /> },
    { id: "background", label: "📖 Background", render: () => <BackgroundTab /> },
    { id: "traits", label: "🩸 Traits", render: () => <TraitsTab /> },
    { id: "skills", label: "⚔ Skills", render: () => <SkillsTab /> },
    { id: "disciplines", label: "🌑 Disciplines", render: () => <DisciplinesTab /> },
    { id: "xp", label: "⚡ XP", render: () => <XpTab /> },
    { id: "notes", label: "📝 Notes", render: () => <NotesTab /> },
    { id: "export", label: "💾 Export", render: () => <ExportTab /> },
  ]

  return (
    <div>
      {!character.wizard_complete && !character.name && (
        <InfoBox>Complete the Character Creator to populate the sheet, or upload a saved character below.</InfoBox>
      )}

      <div
        className="card"
        style={{
          background: "linear-gradient(135deg,#0c080e,#1a0812)",
          padding: "1rem 1.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <h2 style={{ margin: 0 }}>{name}</h2>
        <div style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
          {clan}
          {tagline ? ` · ${tagline}` : ""}
        </div>
        <div style={{ marginTop: "0.6rem", fontSize: "1.2rem", letterSpacing: "0.06em" }}>
          HP <Dots current={Math.max(0, hpCur)} max={hpMax} />{"  "}
          WP <Dots current={Math.max(0, wpCur)} max={BASE_WILLPOWER} />{"  "}
          Blood <Dots current={Math.max(0, blCur)} max={BASE_BLOOD} />
          {blCur < 0 && <span style={{ color: "var(--accent)" }}> (Blood {blCur})</span>}
        </div>
      </div>
      <hr />

      <Tabs tabs={tabs} />
    </div>
  )
}
