export function dotsString(current: number, max: number): string {
  const c = Math.max(0, Math.min(current, max))
  return "●".repeat(c) + "○".repeat(Math.max(0, max - c))
}

export function Dots({ current, max, style }: { current: number; max: number; style?: React.CSSProperties }) {
  return (
    <span className="dots" style={style}>
      {dotsString(current, max)}
    </span>
  )
}
