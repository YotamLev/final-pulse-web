// Printable HTML export — ported verbatim from character_sheet.py's _generate_html.
// Computed on demand (button click), never on render — the original app's #2 root
// cause of unresponsiveness was regenerating this on every single interaction.

import { MORTAL_TRAITS, VAMPIRE_TRAITS, type TraitInstance } from "../../data/traits"
import { SKILL_TREES, getStaticBase, totalSkillXp } from "../../data/skillTrees"
import { DISCIPLINES, totalDiscXp } from "../../data/disciplines"
import { getHpMax, CREATION_SKILL_XP, CREATION_DISC_XP, charToDict, type Character } from "../../models/character"

function dotHtml(current: number, maximum: number): string {
  const c = Math.max(0, Math.min(current, maximum))
  return "●".repeat(c) + "○".repeat(maximum - c)
}

const ALL_TRAITS = new Map([...MORTAL_TRAITS, ...VAMPIRE_TRAITS].map((t) => [t.key, t]))

function traitLi(t: TraitInstance): string {
  const sign = t.cost >= 0 ? "+" : ""
  const extra = t.detail || t.sub_choice || ""
  const desc = t.custom ? "" : ALL_TRAITS.get(t.key)?.description ?? ""
  let parts = `<b>${t.name}</b> (${sign}${t.cost})`
  if (extra) parts += ` — ${extra}`
  if (desc) parts += `<br><small style='color:#9a8f82'>${desc}</small>`
  return `<li>${parts}</li>`
}

export function generateCharacterHtml(char: Character): string {
  const name = char.name || "Unnamed"
  const clan = char.clan || "Clanless"
  const tagline = char.tagline || ""
  const hpMax = getHpMax(char)
  const hpCur = char.hp_current ?? hpMax
  const wpCur = char.willpower_current ?? 10
  const blCur = char.blood_current ?? 10

  const mortalT = char.mortal_traits.map(traitLi).join("")
  const vampireT = char.vampire_traits.map(traitLi).join("")

  let skillRows = ""
  const own = char.skill_dots
  for (const [treeName, skills] of Object.entries(SKILL_TREES)) {
    for (const [skillName, skill] of Object.entries(skills)) {
      const d = own[skillName] ?? 0
      if (d === 0) continue
      const base = getStaticBase(skillName, treeName)
      let skillCell = skillName
      if (skill.description) skillCell += `<br><small style='color:#9a8f82'>${skill.description}</small>`
      const ownDotsHtml = dotHtml(d, skill.maxDots)
      const levelCell = base > 0 ? `${"●".repeat(base)} + ${ownDotsHtml}` : ownDotsHtml
      skillRows += `<tr><td>${treeName}</td><td>${skillCell}</td><td>${levelCell}</td></tr>`
    }
  }
  for (const cs of char.custom_skills) {
    const d = own[cs.name] ?? 0
    if (d > 0) {
      skillRows += `<tr><td>Custom</td><td>${cs.name}</td><td>${dotHtml(d, cs.maxDots)}</td></tr>`
    }
  }

  const powerLookup = new Map(
    Object.entries(DISCIPLINES).map(([discName, discData]) => [
      discName,
      new Map(discData.powers.map((p) => [p.name, p])),
    ]),
  )
  let discRows = ""
  for (const discName of char.unlocked_disciplines) {
    const level = char.discipline_levels[discName] ?? 0
    const powersList = char.discipline_powers[discName] ?? []
    let powersHtml = ""
    for (const pname of powersList) {
      const pdata = powerLookup.get(discName)?.get(pname)
      const desc = pdata?.description ?? ""
      powersHtml += `<li><b>${pname}</b>`
      if (desc) powersHtml += `<br><small style='color:#9a8f82'>${desc}</small>`
      powersHtml += "</li>"
    }
    discRows +=
      `<tr><td>${discName}</td><td>${dotHtml(level, 5)} (Level ${level})</td>` +
      `<td><ul style='margin:0;padding-left:1.2rem'>${powersHtml || "<li>—</li>"}</ul></td></tr>`
  }

  const skillXp = totalSkillXp(char.skill_dots, char.custom_skills)
  const discXp = totalDiscXp(char.discipline_levels)
  const totalXp = CREATION_SKILL_XP + CREATION_DISC_XP + char.earned_xp
  const spentXp = skillXp + discXp
  let xpLogRows = ""
  for (const entry of char.xp_log) {
    const { cost, description } = entry
    if (cost > 0) {
      xpLogRows += `<tr><td>${description}</td><td style='color:#c41e3a;text-align:right'>−${cost}</td></tr>`
    } else {
      xpLogRows += `<tr><td>${description}</td><td style='color:#4a9a6a;text-align:right'>+${-cost}</td></tr>`
    }
  }

  const charJson = JSON.stringify(charToDict(char), null, 2)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${name} — Final Pulse Character Sheet</title>
<style>
  body { font-family: Georgia, serif; background: #0a080c; color: #e8ddd0; margin: 2rem; }
  h1 { color: #c41e3a; font-family: 'Times New Roman', serif; font-size: 2.2rem; }
  h2 { color: #c41e3a; font-size: 1.3rem; border-bottom: 1px solid #4a2030; padding-bottom: 0.3rem; }
  h3 { color: #d4c8b8; font-size: 1rem; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; }
  th, td { padding: 0.4rem 0.8rem; border: 1px solid #4a2030; }
  th { background: #1a0a12; color: #c9bdb0; }
  .tracker { font-size: 1.5rem; letter-spacing: 0.1em; }
  ul { margin: 0.3rem 0; padding-left: 1.2rem; }
  .section { background: #12101a; border: 1px solid #3d2830; border-radius: 4px; padding: 1rem; margin-bottom: 1rem; }
  @media print { body { background: white; color: black; } .section { border: 1px solid #ccc; } }
</style>
</head>
<body>
<h1>${name}</h1>
<p><strong>Clan:</strong> ${clan}${tagline ? " &nbsp;·&nbsp; " + tagline : ""}</p>

<div class="section">
<h2>Trackers</h2>
<p><strong>HP:</strong> <span class="tracker">${dotHtml(Math.max(0, hpCur), hpMax)}</span> (${Math.max(0, hpCur)}/${hpMax})</p>
<p><strong>Willpower:</strong> <span class="tracker">${dotHtml(Math.max(0, wpCur), 10)}</span> (${Math.max(0, wpCur)}/10)</p>
<p><strong>${blCur < 0 ? "Hunger" : "Blood"}:</strong> <span class="tracker" ${blCur < 0 ? "style=\"color:#ff3030\"" : ""}>${dotHtml(Math.max(0, blCur), 10)}${blCur < 0 ? " +" + Math.abs(blCur) : ""}</span> (${blCur}/10)</p>
</div>

<div class="section">
<h2>Traits</h2>
<div style="display:flex;gap:2rem">
<div><h3>Mortal</h3><ul>${mortalT || "<li>None</li>"}</ul></div>
<div><h3>Vampire</h3><ul>${vampireT || "<li>None</li>"}</ul></div>
</div>
</div>

<div class="section">
<h2>Skills</h2>
<table><thead><tr><th>Tree</th><th>Skill &amp; Description</th><th>Level</th></tr></thead>
<tbody>${skillRows || "<tr><td colspan=3>No skills invested</td></tr>"}</tbody></table>
</div>

<div class="section">
<h2>Disciplines</h2>
<table><thead><tr><th>Discipline</th><th>Level</th><th>Powers &amp; Descriptions</th></tr></thead>
<tbody>${discRows || "<tr><td colspan=3>No disciplines</td></tr>"}</tbody></table>
</div>

<div class="section">
<h2>Memories</h2>
<p style="white-space:pre-wrap">${char.memories || "—"}</p>
</div>

<div class="section">
<h2>Notes</h2>
<p>${char.notes || "—"}</p>
</div>

<div class="section">
<h2>Experience Points</h2>
<p><strong>Total XP:</strong> ${totalXp} &nbsp;·&nbsp; <strong>Spent:</strong> ${spentXp} / ${totalXp}</p>
${xpLogRows ? "<table><thead><tr><th style='text-align:left'>Description</th><th style='text-align:right'>XP</th></tr></thead><tbody>" + xpLogRows + "</tbody></table>" : "<p style='color:#9a8f82'>No XP activity logged.</p>"}
</div>
<script type="application/json" id="fp-character-data">
${charJson}
</script>
</body>
</html>`
}
