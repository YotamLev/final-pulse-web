export function InfoBox({ children }: { children: React.ReactNode }) {
  return <div className="alert">{children}</div>
}

export function ErrorBox({ children }: { children: React.ReactNode }) {
  return <div className="alert alert-error">{children}</div>
}
