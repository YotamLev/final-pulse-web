import { useState } from "react"
import { useCharacterStore } from "../../state/characterStore"
import { SectionHeader } from "../../components/SectionHeader"
import { Dots } from "../../components/Dots"
import { ASSET_TYPES } from "./cardEvents"
import type { StruggleAsset } from "../../models/character"

function NewAssetForm() {
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const [name, setName] = useState("")
  const [assetType, setAssetType] = useState(ASSET_TYPES[0])
  const [assetDots, setAssetDots] = useState(2)
  const [isSecret, setIsSecret] = useState(false)
  const [description, setDescription] = useState("")

  function submit() {
    if (!name.trim()) return
    updateCharacter((c) => {
      c.struggle_assets.push({
        id: crypto.randomUUID(),
        name: name.trim(),
        asset_type: assetType,
        description: description.trim(),
        dots: assetDots,
        damage: 0,
        is_bolstered: false,
        bolster_note: "",
        is_secret: isSecret,
        in_graveyard: false,
      })
    })
    setName("")
    setAssetType(ASSET_TYPES[0])
    setAssetDots(2)
    setIsSecret(false)
    setDescription("")
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <input type="text" placeholder="e.g., The Crimson Club" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
          <select value={assetType} onChange={(e) => setAssetType(e.target.value)} style={{ width: "100%", marginTop: "0.4rem" }}>
            {ASSET_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <input type="number" min={1} max={5} value={assetDots} onChange={(e) => setAssetDots(Number(e.target.value))} style={{ width: "100%" }} />
          <label style={{ display: "block", marginTop: "0.4rem" }}>
            <input type="checkbox" checked={isSecret} onChange={(e) => setIsSecret(e.target.checked)} /> Secret
          </label>
        </div>
      </div>
      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ width: "100%", marginTop: "0.4rem" }} />
      <button className="btn btn-primary" style={{ marginTop: "0.4rem" }} onClick={submit}>
        Create Asset
      </button>
    </div>
  )
}

function AssetCard({ asset }: { asset: StruggleAsset }) {
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const aid = asset.id
  const effectiveDots = asset.dots - asset.damage

  return (
    <div style={{ marginBottom: "0.6rem" }}>
      <div style={{ background: "var(--asset-card-bg)", border: "1px solid var(--asset-card-border)", borderRadius: "4px", padding: "0.8rem 1rem" }}>
        <b>{asset.name}</b> [{asset.asset_type}] {asset.is_secret && "🔒 SECRET"} {asset.is_bolstered && "⬆ BOLSTERED"}
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{asset.description}</div>
        <div style={{ margin: "0.3rem 0" }}>
          Dots: <Dots current={Math.max(0, effectiveDots)} max={asset.dots} /> ({effectiveDots}/{asset.dots}){asset.damage > 0 && " ⚠ Damaged"}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.3rem", marginTop: "0.3rem" }}>
        <button
          className="btn btn-secondary"
          onClick={() => updateCharacter((c) => {
            const a = c.struggle_assets.find((x) => x.id === aid)
            if (a) a.damage = Math.min(a.dots, a.damage + 1)
          })}
        >
          💥 Damage
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => updateCharacter((c) => {
            const a = c.struggle_assets.find((x) => x.id === aid)
            if (a && a.damage > 0) {
              a.damage -= 1
              a.is_bolstered = false
            }
          })}
        >
          🔧 Repair
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => updateCharacter((c) => {
            const a = c.struggle_assets.find((x) => x.id === aid)
            if (a) a.is_bolstered = !a.is_bolstered
          })}
        >
          {asset.is_bolstered ? "⬆ Bolstered" : "⬆ Bolster"}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => updateCharacter((c) => {
            const a = c.struggle_assets.find((x) => x.id === aid)
            if (a) a.is_secret = !a.is_secret
          })}
        >
          {asset.is_secret ? "🔓 Reveal" : "🔒 Secret"}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => updateCharacter((c) => {
            const a = c.struggle_assets.find((x) => x.id === aid)
            if (a) a.in_graveyard = true
          })}
        >
          ⚰ Bury
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => updateCharacter((c) => {
            c.struggle_assets = c.struggle_assets.filter((x) => x.id !== aid)
          })}
        >
          🗑 Delete
        </button>
      </div>
      {asset.damage >= asset.dots && <div className="alert alert-error">{asset.name} is destroyed!</div>}
    </div>
  )
}

export function AssetsTab() {
  const character = useCharacterStore((s) => s.character)
  const [newOpen, setNewOpen] = useState(false)

  const active = character.struggle_assets.filter((a) => !a.in_graveyard)

  return (
    <div>
      <SectionHeader>Active Assets ({active.length})</SectionHeader>

      <div className="panel" style={{ marginBottom: "0.75rem" }}>
        <button type="button" className="btn btn-secondary" style={{ width: "100%", textAlign: "left" }} onClick={() => setNewOpen((o) => !o)}>
          {newOpen ? "▾" : "▸"} ➕ New Asset
        </button>
        {newOpen && (
          <div style={{ marginTop: "0.75rem" }}>
            <NewAssetForm />
          </div>
        )}
      </div>

      {active.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}

      {active.length === 0 && <div className="caption">No active assets.</div>}
    </div>
  )
}
