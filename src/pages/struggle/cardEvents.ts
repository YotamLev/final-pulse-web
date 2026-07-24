// Card Events data — ported verbatim from struggle.py.

export interface CardSuit {
  icon: string
  theme: string
  description: string
  examples: string[]
}

export const CARD_EVENTS: Record<string, CardSuit> = {
  Clubs: {
    icon: "♣",
    theme: "Conflict",
    description: "Matters of conflict: territorial transgressions, rivalries, violence.",
    examples: [
      "A rival vampire transgressed into another's territory",
      "You find a lead to a rival's herd",
      "A rival recently frenzied in the presence of others",
      "A mortal close to a vampire recently had a falling-out with them",
    ],
  },
  Hearts: {
    icon: "♥",
    theme: "Passion",
    description: "Matters of passion: events, opportunities, emotional currents.",
    examples: [
      "A festival, holiday, or sports event brings lots of excited mortals",
      "A local movement is gaining momentum",
      "A capable mortal is available for recruitment",
      "A mortal you care about is in danger",
    ],
  },
  Diamonds: {
    icon: "♦",
    theme: "Prudence",
    description: "Matters of prudence: deals, resources, practical opportunities.",
    examples: [
      "A vampire needs something you can provide (safe haven, feeding permission) — willing to do a small Boon",
      "A company went bankrupt; selling cheaply",
      "The local drug supply runs dry",
      "A mortal institution is vulnerable to infiltration",
    ],
  },
  Spades: {
    icon: "♠",
    theme: "Whispers",
    description: "Matters of whispers: secrets, hidden things, supernatural events.",
    examples: [
      "An ancient and valuable item is discovered hiding in plain sight, but not freely available",
      "Vampire hunters are searching for targets",
      "A witch is active in the area",
      "You find an old Kindred Boon debt, if you can navigate Vampire politics subtly enough to purchase it",
    ],
  },
}

export interface ValueTier {
  icon: string
  label: string
  meaning: string
}

export const VALUE_TIERS: ValueTier[] = [
  { icon: "♟", label: "2 – 4", meaning: "Moderate opportunity" },
  { icon: "♞", label: "5 – 7", meaning: "Great opportunity" },
  { icon: "♝", label: "8 – 10", meaning: "Rare opportunity" },
  { icon: "♜", label: "Jack", meaning: "Less risk than usual" },
  { icon: "♛", label: "Queen", meaning: "Can add another card (even another player's) for a great bonus" },
  { icon: "♚", label: "King", meaning: "Can add a dot to an asset" },
  { icon: "🂡", label: "Ace", meaning: "Can interrupt a rival's action" },
]

export const ASSET_TYPES = ["Institution", "Servants", "Object", "Haven", "Herd", "Debts", "Territory"]
