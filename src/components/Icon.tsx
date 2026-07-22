// Renders an image inside a fixed-size box, preserving aspect ratio — ported from
// components.py's render_icon. Source images have different native aspect ratios
// (some square, some tall/wide); this scales each to fit a uniform box with no distortion.

export function Icon({ src, size = 56 }: { src: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
        flexShrink: 0,
      }}
    >
      <img src={src} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
    </div>
  )
}
