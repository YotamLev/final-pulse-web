export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h3 style={{ margin: "0 0 0.3rem" }}>{children}</h3>
      <hr style={{ margin: "0.3rem 0 1rem" }} />
    </>
  )
}
