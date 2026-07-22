import { useCharacterStore } from "../../state/characterStore"
import { useNavStore } from "../../state/navStore"
import { SectionHeader } from "../../components/SectionHeader"
import { InfoBox } from "../../components/InfoBox"
import { CLANS, getEligibleClans } from "../../data/clans"
import { Icon } from "../../components/Icon"

export function Stage4Clan() {
  const character = useCharacterStore((s) => s.character)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const goTo = useNavStore((s) => s.goTo)

  const eligible = getEligibleClans(character)
  const currentClan = character.clan

  return (
    <div>
      <SectionHeader>Stage 4 — Clan</SectionHeader>
      <InfoBox>
        Clans are optional. Check if you meet a Clan's requirements. You can qualify for at most one Clan. Your
        Traits and Disciplines determine eligibility.
      </InfoBox>

      {eligible.length === 0 && (
        <div className="alert alert-error">
          Your current Traits and Disciplines don't qualify you for any Clan. You may continue without one, or go
          back and adjust your choices.
        </div>
      )}

      {currentClan && (
        <div className="alert">
          <strong>Clan:</strong> {currentClan}
          <div>
            <button className="btn btn-secondary" onClick={() => updateCharacter((c) => { c.clan = null })}>
              Leave Clan
            </button>
          </div>
        </div>
      )}

      <hr />

      {Object.entries(CLANS).map(([clanName, clan]) => {
        const isEligible = eligible.includes(clanName)
        const isJoined = clanName === currentClan
        const reqs = clan.requirements

        return (
          <details key={clanName} open={isJoined} className="panel" style={{ marginBottom: "0.5rem" }}>
            <summary style={{ cursor: "pointer" }}>
              {isJoined ? "✓ " : isEligible ? "🩸 " : "🔒 "}
              {clanName}
            </summary>
            <div style={{ marginTop: "0.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 4fr", gap: "0.75rem", alignItems: "start" }}>
                <Icon src={clan.image} size={64} />
                <div>
                  <em>{clan.description}</em>
                  <div>
                    <strong>Recruitment:</strong> {clan.recruitment}
                  </div>
                  <div>
                    <strong>Bonus:</strong> {clan.bonus}
                  </div>
                  <div>
                    <strong>Suggested Disciplines:</strong> {clan.suggested_disciplines.join(", ")}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "0.5rem" }}>
                <strong>Requirements:</strong>
                <ul>
                  {reqs.trait_any_malkavian && (
                    <li>
                      Must have at least one mental illness trait (Paranoid, Dissociative Episodes, Depressive
                      Episodes, Manic Episodes, Psychotic Episodes, Panic Disorder, Post-Traumatic Stress,
                      Delusional Belief, Selective Mutism)
                    </li>
                  )}
                  {reqs.trait_any && <li>Must have one of these traits: {reqs.trait_any.join(", ")}</li>}
                  {reqs.discipline_all && <li>Must have unlocked: {reqs.discipline_all.join(", ")}</li>}
                  {reqs.discipline_any && <li>Must have unlocked one of: {reqs.discipline_any.join(", ")}</li>}
                </ul>
              </div>

              {isEligible && !isJoined && (
                <button className="btn btn-primary" onClick={() => updateCharacter((c) => { c.clan = clanName })}>
                  Join {clanName}
                </button>
              )}
              {!isEligible && <div className="alert alert-error">Requirements not met.</div>}
            </div>
          </details>
        )
      })}

      <hr />

      {character.wizard_complete ? (
        <div className="alert">Character creation complete! Head to the Character Sheet.</div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button className="btn btn-secondary" onClick={() => updateCharacter((c) => { c.wizard_stage = 3 })}>
            ← Back
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              updateCharacter((c) => { c.wizard_complete = true })
              goTo("sheet")
            }}
          >
            Complete Character ✓
          </button>
        </div>
      )}
    </div>
  )
}
