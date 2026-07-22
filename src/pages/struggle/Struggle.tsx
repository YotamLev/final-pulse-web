import { SectionHeader } from "../../components/SectionHeader"
import { InfoBox } from "../../components/InfoBox"
import { Tabs, type TabItem } from "../../components/Tabs"
import { CardEventsTab } from "./CardEventsTab"
import { SchemesTab } from "./SchemesTab"
import { AssetsTab } from "./AssetsTab"
import { GraveyardTab } from "./GraveyardTab"
import { RulesTab } from "./RulesTab"

export function Struggle() {
  const tabs: TabItem[] = [
    { id: "cards", label: "🃏 Card Events", render: () => <CardEventsTab /> },
    { id: "schemes", label: "📋 Schemes", render: () => <SchemesTab /> },
    { id: "assets", label: "🏛 Assets", render: () => <AssetsTab /> },
    { id: "graveyard", label: "⚰ Graveyard", render: () => <GraveyardTab /> },
    { id: "rules", label: "📖 Rules", render: () => <RulesTab /> },
  ]

  return (
    <div>
      <SectionHeader>Struggle</SectionHeader>
      <InfoBox>
        The Struggle screen tracks your Schemes and Assets during political conflict. Draw a card to see what the
        session brings.
      </InfoBox>
      <Tabs tabs={tabs} />
    </div>
  )
}
