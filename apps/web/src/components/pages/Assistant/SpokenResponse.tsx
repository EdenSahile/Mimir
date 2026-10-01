export default function SpokenResponse({ text }: { text: string }) {
  return (
    <div
      data-testid="spoken-response"
      className="font-serif"
      style={{
        maxHeight: '34vh',
        overflowY: 'auto',
        maskImage:
          'linear-gradient(180deg, black 60%, transparent 100%)',
      }}
    >
      {text}
    </div>
  )
}
