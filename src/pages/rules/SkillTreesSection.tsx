import { SKILL_TREES, type SkillDef } from "../../data/skillTrees"

function branchNote(skill: SkillDef): string {
  const branch = skill.branchesFrom
  if (!branch) return ""
  if (Array.isArray(branch[0])) {
    const parts = (branch as [string, number][]).map(([p, t]) => `${p} ${t} dots`).join(" or ")
    return `branches from ${parts}`
  }
  const [parent, th] = branch as [string, number]
  return `branches from ${parent} ${th} dots`
}

function SkillNode({ name, tree, children }: { name: string; tree: Record<string, SkillDef>; children: Record<string, string[]> }) {
  const skill = tree[name]
  const note = branchNote(skill)
  const kids = children[name] ?? []
  return (
    <li>
      <b>{name}</b> <span className="pill" style={{ display: "inline", fontSize: "0.75rem" }}>up to {skill.maxDots} dots</span>{" "}
      {note && <span className="pill" style={{ display: "inline", fontSize: "0.75rem" }}>{note}</span>}
      <div className="caption">{skill.description}</div>
      {kids.length > 0 && (
        <ul>
          {kids.map((k) => (
            <SkillNode key={k} name={k} tree={tree} children={children} />
          ))}
        </ul>
      )}
    </li>
  )
}

function SkillTree({ skills }: { skills: Record<string, SkillDef> }) {
  const children: Record<string, string[]> = Object.fromEntries(Object.keys(skills).map((name) => [name, []]))
  const roots: string[] = []
  for (const [name, s] of Object.entries(skills)) {
    const branch = s.branchesFrom
    if (branch === null) {
      roots.push(name)
    } else if (Array.isArray(branch[0])) {
      const parent = (branch as [string, number][])[0][0]
      children[parent] = children[parent] ?? []
      children[parent].push(name)
    } else {
      const parent = (branch as [string, number])[0]
      children[parent] = children[parent] ?? []
      children[parent].push(name)
    }
  }

  return (
    <ul>
      {roots.map((r) => (
        <SkillNode key={r} name={r} tree={skills} children={children} />
      ))}
    </ul>
  )
}

export function SkillTreesSection() {
  return (
    <div className="panel" id="skills" style={{ marginBottom: "1.5rem" }}>
      <h2>Skill Trees</h2>
      <p>
        Skills are grouped into 5 trees. When a skill <em>branches from</em> a parent skill at a given dot threshold, the parent's dots up to that threshold
        count as a static base added on top of the dots you invest directly in the child — so a skill's effective (practical) level is{" "}
        <code>parent's static base + your own dots</code>. This chains: a skill three branches deep inherits the accumulated base of everything above it.
      </p>
      <p>Below, indentation shows the branching hierarchy — a nested skill branches from the skill directly above it at the dot count noted.</p>

      {Object.entries(SKILL_TREES).map(([treeName, skills]) => (
        <div key={treeName}>
          <h3>{treeName}</h3>
          <SkillTree skills={skills} />
        </div>
      ))}

      <h3>Custom Skills</h3>
      <p>
        Players may invent their own skill (e.g. Dance, Chess, Agriculture) with a Storyteller-set max dots. Custom skills have no parent/base — cost
        follows the same <code>1, 2, 3…</code> curve from 0.
      </p>
    </div>
  )
}
