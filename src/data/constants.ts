// Shared copy used by both the wizard (Stage 1) and the Character Sheet (Background tab).

export const MEMORIES_PLACEHOLDER = [
  "Where were you born, and in what era? What did you do for a living?",
  "What shaped you — events, losses, turning points? What did you believe in?",
  "Who matters to you?",
  "",
  "Who was your Sire, and when and how did they Embrace you?",
  "Were you recruited, seduced, or taken by surprise?",
  "What were you told — and what weren't you told?",
].join("\n")

export const DEFAULT_VAMPIRE_POWERS: { name: string; description: string }[] = [
  { name: "Blood Surge", description: "Pay 1 or more Blood, add 1 red die per Blood spent to a roll." },
  { name: "Blood Heal", description: "Pay 1 Blood, heal 1 HP. Max once per turn." },
  { name: "Blush of Life", description: "Pay 1 Blood, become warm and able to blush for a scene." },
  { name: "Blood Bond", description: "Makes mortals Ghouls, makes vampires supernaturally like you." },
  { name: "The Kiss", description: "Mortals experience ecstasy when bitten. You can close wounds by licking." },
  { name: "Willpower Reroll", description: "Spend 1 Willpower to reroll up to 3 black dice." },
]
