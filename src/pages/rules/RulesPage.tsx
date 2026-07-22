import { SectionHeader } from "../../components/SectionHeader"
import { DEFAULT_VAMPIRE_POWERS } from "../../data/constants"
import { TraitsSection } from "./TraitsSection"
import { SkillTreesSection } from "./SkillTreesSection"
import { DisciplinesSection } from "./DisciplinesSection"
import { ClansSection } from "./ClansSection"

function TocLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} style={{ display: "block", padding: "0.15rem 0" }}>
      {children}
    </a>
  )
}

export function RulesPage() {
  return (
    <div>
      <SectionHeader>Final Pulse 2E — Character Building Rules</SectionHeader>
      <p className="caption">Rendered live from the app's own data — always in sync, no regeneration step.</p>

      <div className="panel" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", marginBottom: "1.5rem" }}>
        <TocLink href="#overview">Overview &amp; Creation Order</TocLink>
        <TocLink href="#xp">Experience Points</TocLink>
        <TocLink href="#traits">Traits</TocLink>
        <TocLink href="#skills">Skill Trees</TocLink>
        <TocLink href="#disciplines">Discipline Trees</TocLink>
        <TocLink href="#clans">Clans</TocLink>
        <TocLink href="#powers">Default Vampire Powers</TocLink>
        <TocLink href="#rolls">Rolls</TocLink>
        <TocLink href="#hunger">Hunger</TocLink>
      </div>

      <div className="panel" id="overview" style={{ marginBottom: "1.5rem" }}>
        <h2>Overview &amp; Creation Order</h2>
        <p>A character is built in four stages:</p>
        <ol>
          <li>
            <strong>Traits</strong> — choose Mortal and Vampire Traits (optional).
          </li>
          <li>
            <strong>Skills</strong> — spend 15 XP across the Skill Trees.
          </li>
          <li>
            <strong>Disciplines</strong> — unlock up to 3 Disciplines, then spend 10 XP raising their levels.
          </li>
          <li>
            <strong>Clan</strong> — optional; join the one Clan (if any) whose requirements your Traits and Disciplines satisfy.
          </li>
        </ol>
      </div>

      <div className="panel" id="xp" style={{ marginBottom: "1.5rem" }}>
        <h2>Experience Points</h2>
        <p>Skill XP and Discipline XP are separate pools and cannot be mixed:</p>
        <ul>
          <li>
            <strong>Creation Skill XP:</strong> 15, spent only on Skills.
          </li>
          <li>
            <strong>Creation Discipline XP:</strong> 10, spent only on Disciplines.
          </li>
        </ul>
        <p>
          After creation, the Storyteller awards <strong>Earned XP</strong>, which may be spent on either pool once its creation allotment is exhausted.
        </p>
        <h4>Skill cost</h4>
        <p>
          Each dot you personally invest in a skill costs XP equal to the <em>effective level it brings the skill to</em> — that is, its static base (dots
          inherited from a parent skill at the branch point, see below) plus the dot number you're buying. So the 1st own dot costs <code>base + 1</code>,
          the 2nd costs <code>base + 2</code>, and so on. A skill with no parent (base 0) costs 1 XP for its 1st dot, 2 for its 2nd, etc. — the classic{" "}
          <code>1, 2, 3, 4, 5</code> XP curve. Custom skills always have base 0.
        </p>
        <h4>Discipline cost</h4>
        <p>
          Raising a Discipline from level <em>L</em> to <em>L+1</em> costs <em>L+1</em> XP. So level 1 costs 1 XP, level 2 costs 2 more (3 total), up to
          level 5 costing 5 more (15 total).
        </p>
      </div>

      <TraitsSection />
      <SkillTreesSection />
      <DisciplinesSection />
      <ClansSection />

      <div className="panel" id="powers" style={{ marginBottom: "1.5rem" }}>
        <h2>Default Vampire Powers</h2>
        <p>Every vampire has access to these regardless of Discipline or Clan:</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Power</th>
              <th>Effect</th>
            </tr>
          </thead>
          <tbody>
            {DEFAULT_VAMPIRE_POWERS.map((p) => (
              <tr key={p.name}>
                <td>
                  <b>{p.name}</b>
                </td>
                <td>{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel" id="rolls" style={{ marginBottom: "1.5rem" }}>
        <h2>Rolls</h2>
        <p>
          We use dice when a result would be interesting and dramatic. We typically roll <strong>1 base die + skill</strong>. Sometimes, certain
          supernatural powers, Traits, situations, and other elements add or subtract from this pool. So, if your character has Awareness 3, they would
          roll a pool of 4 dice.
        </p>

        <h3>Tests &amp; Opposed Rolls</h3>
        <p>We have 2 kinds of rolls:</p>
        <ul>
          <li>
            <strong>Test</strong> — the character has to meet-or-beat a certain number of successes. For example: breaking into a bank might be a Larceny
            test of difficulty 4.
          </li>
          <li>
            <strong>Opposed</strong> — the character has to meet-or-beat the roll of an opponent. For example: two vampires are locked in combat, rolling
            Martial Arts and Swordsmanship against each other.
          </li>
        </ul>
        <p>
          <strong>Margins</strong> happen when the roll is over or under the difficulty or the opposition roll.
        </p>
        <ul>
          <li>
            A <strong>negative margin</strong> has consequences: failure to break into the bank and activating an alarm. In combat, negative margin can
            translate into damage, or a weaker position.
          </li>
          <li>
            A <strong>positive margin</strong> has advantages: a hunting roll yields more victims than expected, a combat roll causes extra damage, an
            Auspex roll allows extra questions.
          </li>
        </ul>

        <h3>Turns</h3>
        <p>In combat or other intense scenes where every moment matters, the game might use Turns. Each Turn looks like:</p>
        <ol>
          <li>Players who want to declare their intended actions for this turn.</li>
          <li>Rivals act their turn, sometimes clashing with the Players and rolling Opposed rolls, sometimes the players simply roll Test rolls.</li>
          <li>
            Players who have not acted yet may declare their action in reaction to the rival's actions. Waiting may have consequences, but can also be a
            smart move.
          </li>
          <li>After all Players &amp; Rivals actions are resolved, next Turn begins.</li>
        </ol>

        <h3>Dice</h3>
        <p>
          The dice used in the game look like these, or, if d10s are used, then "1" corresponds to blank on black dice and skull on red dice, "2-5"
          corresponds to blank on black &amp; red dice, "6-9" corresponds to success on black &amp; red dice, and "0" corresponds to critical success on
          black &amp; red dice.
        </p>
        <div style={{ textAlign: "center" }}>
          <img src="/images/dice_cheat_sheet.png" alt="Dice cheat sheet" style={{ maxWidth: "100%", width: 500, borderRadius: 4 }} />
        </div>
      </div>

      <div className="panel" id="hunger" style={{ marginBottom: "1.5rem" }}>
        <h2>Hunger</h2>
        <p>When you are at -1 Blood or less, you experience painful, supernatural Hunger. At all rolls, your Hunger is the amount of black dice you replace with red dice.</p>
        <p>
          For example: Dracula is at Hunger 3 (-3 Blood). He has Animalism 5, so when asked to roll Animalism, his pool is 6 — because of Hunger 3, he
          rolls 3 red dice and 3 black dice. If he chooses to use Blood Surge, he will add additional red dice to the pool, but his Hunger will increase.
        </p>
        <p>Later, Dracula has to roll Biology, but only has Curiosity 2. So, he simply rolls 2 red dice — Hunger does not enlarge the dice pool.</p>
        <p>Taking 1-2 Blood from a human will leave them only momentarily dizzy; 3-4 is anemia and possibly life-threatening; 5 is all the Blood a mortal has to give.</p>
      </div>
    </div>
  )
}
