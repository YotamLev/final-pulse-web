import { useCharacterStore } from "../../state/characterStore"
import { StageNav } from "./WizardNav"
import { Stage1Origins } from "./Stage1Origins"
import { Stage2Skills } from "./Stage2Skills"
import { Stage3Disciplines } from "./Stage3Disciplines"
import { Stage4Clan } from "./Stage4Clan"

export function Wizard() {
  const stage = useCharacterStore((s) => s.character.wizard_stage)

  return (
    <div>
      <StageNav current={stage} />
      <hr />
      {stage === 1 && <Stage1Origins />}
      {stage === 2 && <Stage2Skills />}
      {stage === 3 && <Stage3Disciplines />}
      {stage === 4 && <Stage4Clan />}
    </div>
  )
}
