import { useCharacterStore } from "../../state/characterStore"
import { SectionHeader } from "../../components/SectionHeader"
import { InfoBox } from "../../components/InfoBox"
import { Dots } from "../../components/Dots"
import { DISCIPLINES, getAvailablePowers, totalDiscXp, xpCostForDiscLevel, type Discipline } from "../../data/disciplines"
import { CREATION_DISC_XP, canSpendDiscXp, getEarnedXpAvailable, logXpSpend, logXpRefund } from "../../models/character"

function PowerSelector({ discName, disc, level, powers }: { discName: string; disc: Discipline; level: number; powers: string[] }) {
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)

  const powersByLevel = new Map<number, typeof disc.powers>()
  for (const p of disc.powers) {
    const list = powersByLevel.get(p.level) ?? []
    list.push(p)
    powersByLevel.set(p.level, list)
  }
  const levels = [...powersByLevel.keys()].sort((a, b) => a - b).filter((lvl) => lvl <= level)

  return (
    <div>
      {levels.map((lvl) => (
        <div key={lvl}>
          <small style={{ color: "var(--text-muted)" }}>Level {lvl} powers:</small>
          {powersByLevel.get(lvl)!.map((power) => {
            const acquired = powers.includes(power.name)
            const req = power.requires
            const reqMet = req === null || powers.includes(req)
            const canAcquire = !acquired && reqMet && powers.length < level
            const dependents = disc.powers.filter((p2) => p2.requires === power.name && powers.includes(p2.name))
            const canRelease = acquired && dependents.length === 0

            return (
              <div key={power.name} style={{ display: "grid", gridTemplateColumns: "1fr 7fr", gap: "0.5rem", padding: "0.25rem 0" }}>
                <div>
                  {acquired ? (
                    <button
                      className="btn btn-secondary btn-icon"
                      disabled={!canRelease}
                      onClick={() =>
                        updateCharacter((c) => {
                          const list = c.discipline_powers[discName]
                          const idx = list.indexOf(power.name)
                          if (idx >= 0) list.splice(idx, 1)
                        })
                      }
                    >
                      ■
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary btn-icon"
                      disabled={!canAcquire}
                      onClick={() =>
                        updateCharacter((c) => {
                          c.discipline_powers[discName].push(power.name)
                        })
                      }
                    >
                      □
                    </button>
                  )}
                </div>
                <div>
                  <strong>{power.name}</strong>
                  {req && !reqMet && <em> (requires {req})</em>}
                  <div className="caption">{power.description}</div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function DisciplineEditor({ discName }: { discName: string }) {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)

  const disc = DISCIPLINES[discName]
  const level = character.discipline_levels[discName] ?? 0
  const powers = character.discipline_powers[discName] ?? []
  const xpUp = xpCostForDiscLevel(level)
  const canUp = level < 5 && canSpendDiscXp(character, xpUp)

  return (
    <div>
      <h3>{discName}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "4fr 1fr 1fr", gap: "0.5rem", alignItems: "center" }}>
        <div>
          <div>
            Level: <strong>{level} / 5</strong> <Dots current={level} max={5} />
          </div>
          {canUp && <div className="caption">Next level: {xpUp} XP</div>}
        </div>
        <button
          className="btn btn-secondary btn-icon"
          disabled={level === 0}
          onClick={() =>
            updateCharacter((c) => {
              const refund = level
              c.discipline_levels[discName] = level - 1
              const list = c.discipline_powers[discName] ?? []
              if (list.length) list.pop()
              c.discipline_powers[discName] = list
              logXpRefund(c, `${discName} level ${level} → ${level - 1}`, refund, {
                disc: discName,
                from_level: level - 1,
                to_level: level,
              })
            })
          }
        >
          −
        </button>
        <button
          className="btn btn-secondary btn-icon"
          disabled={!canUp}
          onClick={() =>
            updateCharacter((c) => {
              const newLv = level + 1
              c.discipline_levels[discName] = newLv
              const list = c.discipline_powers[discName] ?? []
              c.discipline_powers[discName] = list
              logXpSpend(c, `${discName} level ${level} → ${newLv}`, xpUp, {
                disc: discName,
                from_level: level,
                to_level: newLv,
              })
              const available = getAvailablePowers(discName, newLv, list)
              if (available.length === 1) {
                list.push(available[0].name)
              }
            })
          }
        >
          +
        </button>
      </div>

      {level > 0 && (
        <div className="panel" style={{ marginTop: "0.5rem" }}>
          <strong>
            Powers ({powers.length}/{level})
          </strong>
          <PowerSelector discName={discName} disc={disc} level={level} powers={powers} />
        </div>
      )}
    </div>
  )
}

export function DisciplinesTab() {
  const character = useCharacterStore((s) => s.character)

  const discXp = totalDiscXp(character.discipline_levels)
  const earnedAvail = getEarnedXpAvailable(character)
  const unlocked = character.unlocked_disciplines

  return (
    <div>
      <SectionHeader>Disciplines</SectionHeader>
      <div>
        Creation disc XP: <strong>{Math.min(discXp, CREATION_DISC_XP)} / {CREATION_DISC_XP}</strong> | Earned XP
        available: <strong>{Math.max(0, earnedAvail)}</strong>
      </div>

      {unlocked.length === 0 ? (
        <InfoBox>No Disciplines unlocked yet. Complete the Character Creator first.</InfoBox>
      ) : (
        unlocked.map((discName) => (
          <div key={discName}>
            <DisciplineEditor discName={discName} />
            <hr />
          </div>
        ))
      )}
    </div>
  )
}
