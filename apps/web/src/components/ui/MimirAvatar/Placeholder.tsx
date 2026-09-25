export default function Placeholder() {
  return (
    <>
      <div
        data-testid="placeholder-head"
        style={{
          position: 'absolute',
          width: '46%',
          height: '40%',
          top: '34%',
          left: '27%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--light-rgb), 0.08), transparent)',
          filter: 'blur(2px)',
        }}
      />
      <div
        data-testid="placeholder-neck"
        style={{
          position: 'absolute',
          width: '16%',
          height: '12%',
          top: '68%',
          left: '42%',
          background: 'linear-gradient(180deg, rgba(var(--light-rgb), 0.06), transparent)',
        }}
      />
      <div
        data-testid="placeholder-shoulders"
        style={{
          position: 'absolute',
          width: '90%',
          height: '40%',
          bottom: '-26%',
          left: '5%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(var(--light-rgb), 0.06), transparent)',
        }}
      />
      <div
        data-testid="placeholder-seam"
        style={{
          position: 'absolute',
          width: '1px',
          height: '40%',
          top: '16%',
          left: '50%',
          background: 'rgba(var(--light-rgb), 0.08)',
        }}
      />
    </>
  )
}
