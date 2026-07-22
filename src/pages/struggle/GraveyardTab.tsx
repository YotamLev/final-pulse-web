import { useCharacterStore } from "../../state/characterStore"
import { SectionHeader } from "../../components/SectionHeader"

export function GraveyardTab() {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)

  const deadSchemes = character.struggle_schemes.filter((s) => s.in_graveyard)
  const deadAssets = character.struggle_assets.filter((a) => a.in_graveyard)

  return (
    <div>
      <SectionHeader>Graveyard</SectionHeader>

      {deadSchemes.length === 0 && deadAssets.length === 0 && <div className="caption">Nothing in the graveyard yet.</div>}

      {deadSchemes.length > 0 && (
        <>
          <strong>Buried Schemes</strong>
          {deadSchemes.map((scheme) => (
            <div key={scheme.id} style={{ display: "grid", gridTemplateColumns: "5fr 1fr", gap: "0.5rem", alignItems: "center", marginTop: "0.3rem" }}>
              <div>
                <s>{scheme.name}</s> — <em>{scheme.goal}</em>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => updateCharacter((c) => {
                  const s = c.struggle_schemes.find((x) => x.id === scheme.id)
                  if (s) s.in_graveyard = false
                })}
              >
                ↩ Restore
              </button>
            </div>
          ))}
        </>
      )}

      {deadAssets.length > 0 && (
        <>
          <hr />
          <strong>Destroyed / Buried Assets</strong>
          {deadAssets.map((asset) => (
            <div key={asset.id} style={{ display: "grid", gridTemplateColumns: "5fr 1fr", gap: "0.5rem", alignItems: "center", marginTop: "0.3rem" }}>
              <div>
                <s>{asset.name}</s> [{asset.asset_type}] — {asset.dots}●
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => updateCharacter((c) => {
                  const a = c.struggle_assets.find((x) => x.id === asset.id)
                  if (a) {
                    a.in_graveyard = false
                    a.damage = 0
                  }
                })}
              >
                ↩ Restore
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
