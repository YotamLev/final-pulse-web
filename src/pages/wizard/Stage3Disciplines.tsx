import { useCharacterStore } from "../../state/characterStore"
import { SectionHeader } from "../../components/SectionHeader"
import { Dots } from "../../components/Dots"
import {
  DISCIPLINES,
  ALL_DISCIPLINE_NAMES,
  MAX_DISCIPLINES,
  DISC_SHORT_DESC,
  getAvailablePowers,
  totalDiscXp,
  xpCostForDiscLevel,
  type Discipline,
} from "../../data/disciplines"
import { CREATION_DISC_XP, logXpSpend, logXpRefund } from "../../models/character"
import { NavButtons } from "./WizardNav"

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

function DisciplineEditor({ discName, budgetRemaining }: { discName: string; budgetRemaining: number }) {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)

  const disc = DISCIPLINES[discName]
  const level = character.discipline_levels[discName] ?? 0
  const powers = character.discipline_powers[discName] ?? []
  const xpUp = xpCostForDiscLevel(level)
  const canUp = level < 5 && budgetRemaining >= xpUp

  return (
    <div>
      <h3>{discName}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "4fr 1fr 1fr", gap: "0.5rem", alignItems: "center" }}>
        <div>
          Level: {level} / 5 <Dots current={level} max={5} />
        </div>
        <button
          className="btn btn-secondary btn-icon"
          disabled={level === 0}
          onClick={() =>
            updateCharacter((c) => {
              const list = c.discipline_powers[discName] ?? []
              if (list.length) list.pop()
              c.discipline_powers[discName] = list
              const refund = level
              c.discipline_levels[discName] = level - 1
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
              const newLevel = level + 1
              c.discipline_levels[discName] = newLevel
              logXpSpend(c, `${discName} level ${level} → ${newLevel}`, xpUp, {
                disc: discName,
                from_level: level,
                to_level: newLevel,
              })
              const list = c.discipline_powers[discName] ?? []
              c.discipline_powers[discName] = list
              const available = getAvailablePowers(discName, newLevel, list)
              if (available.length === 1) list.push(available[0].name)
            })
          }
        >
          +
        </button>
      </div>

      {level > 0 && (
        <>
          <div>
            <strong>
              Acquired powers ({powers.length} / {level}):
            </strong>
          </div>
          <PowerSelector discName={discName} disc={disc} level={level} powers={powers} />
        </>
      )}
    </div>
  )
}

function SelectDisciplines() {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const unlocked = character.unlocked_disciplines
  const remainingSlots = MAX_DISCIPLINES - unlocked.length

  return (
    <div>
      <div>
        Choose <strong>{MAX_DISCIPLINES} Disciplines</strong> to unlock. Currently selected:{" "}
        <strong>
          {unlocked.length} / {MAX_DISCIPLINES}
        </strong>
      </div>
      {unlocked.length > 0 && (
        <div>
          <strong>Selected:</strong> {unlocked.map((d) => `\`${d}\``).join(", ")}
        </div>
      )}

      <hr />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
        {ALL_DISCIPLINE_NAMES.map((discName) => {
          const already = unlocked.includes(discName)
          const desc = DISC_SHORT_DESC[discName] ?? ""
          if (already) {
            return (
              <button
                key={discName}
                className="btn btn-secondary"
                title={desc}
                onClick={() =>
                  updateCharacter((c) => {
                    c.unlocked_disciplines = c.unlocked_disciplines.filter((d) => d !== discName)
                    delete c.discipline_levels[discName]
                    delete c.discipline_powers[discName]
                    c.xp_log = c.xp_log.filter((e) => !e.description.startsWith(`${discName} level `))
                  })
                }
              >
                ✓ {discName}
              </button>
            )
          }
          return (
            <button
              key={discName}
              className="btn btn-secondary"
              title={desc}
              disabled={remainingSlots === 0}
              onClick={() =>
                updateCharacter((c) => {
                  c.unlocked_disciplines.push(discName)
                  c.discipline_levels[discName] = 0
                  c.discipline_powers[discName] = []
                })
              }
            >
              {discName}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SpendDiscXp() {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)

  const discSpent = totalDiscXp(character.discipline_levels)
  const remaining = CREATION_DISC_XP - discSpent

  return (
    <div>
      <div>
        <strong>Creation XP:</strong> {discSpent} / {CREATION_DISC_XP} spent{" "}
        {remaining > 0 ? <strong>{remaining} remaining</strong> : "✓ budget used"}
      </div>
      {remaining < 0 && <div className="alert alert-error">Over budget by {-remaining} XP!</div>}

      <button
        className="btn btn-secondary"
        onClick={() =>
          updateCharacter((c) => {
            const discNames = [...c.unlocked_disciplines]
            c.xp_log = c.xp_log.filter((e) => !discNames.some((d) => e.description.startsWith(`${d} level `)))
            c.unlocked_disciplines = []
            c.discipline_levels = {}
            c.discipline_powers = {}
          })
        }
      >
        ← Change Discipline Selection
      </button>

      <hr />
      {character.unlocked_disciplines.map((discName) => (
        <div key={discName}>
          <DisciplineEditor discName={discName} budgetRemaining={remaining} />
          <hr />
        </div>
      ))}
    </div>
  )
}

export function Stage3Disciplines() {
  const character = useCharacterStore((s) => s.character)
  const showSelection = character.unlocked_disciplines.length < MAX_DISCIPLINES

  return (
    <div>
      <SectionHeader>Stage 3 — Disciplines</SectionHeader>
      {showSelection ? <SelectDisciplines /> : <SpendDiscXp />}
      <hr />
      <NavButtons stage={3} />
    </div>
  )
}
