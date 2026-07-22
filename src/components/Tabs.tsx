import { useState } from "react"

export interface TabItem {
  id: string
  label: string
  render: () => React.ReactNode
}

/**
 * Only the active tab's render() is invoked — unlike Streamlit's st.tabs,
 * which executes every tab's body on every rerun regardless of which is
 * visible. This was the single biggest cause of the original app's
 * unresponsiveness on the Character Sheet page.
 */
export function Tabs({ tabs, initialId }: { tabs: TabItem[]; initialId?: string }) {
  const [activeId, setActiveId] = useState(initialId ?? tabs[0]?.id)
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0]

  return (
    <div>
      <div className="tab-list" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className="tab"
            role="tab"
            aria-selected={t.id === active?.id}
            onClick={() => setActiveId(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{active?.render()}</div>
    </div>
  )
}
