import type { AvatarMedia, MimirState } from '@/components/ui/MimirAvatar/mimir'
import Placeholder from '@/components/ui/MimirAvatar/Placeholder'

const RIM_ALPHA: Record<MimirState, number> = {
  idle: 0.12,
  listening: 0.30,
  thinking: 0.20,
  processing: 0.26,
  responding: 0.24,
  success: 0.14,
}

interface FrameLayerProps {
  media: AvatarMedia
  state: MimirState
}

export default function FrameLayer({ media, state }: FrameLayerProps) {
  return (
    <div
      data-testid="layer-frame"
      style={{
        position: 'absolute',
        left: '13%',
        right: '13%',
        top: '5%',
        bottom: '3%',
        borderRadius: 'var(--r-avatar)',
        overflow: 'hidden',
        background: 'radial-gradient(120% 80% at 50% 30%, rgba(26, 40, 46, 0.9), rgba(8, 12, 16, 0.96) 70%)',
        boxShadow: `0 0 0 1px rgba(var(--light-rgb), ${RIM_ALPHA[state]}), var(--shadow-avatar)`,
        transition: 'box-shadow 600ms ease',
      }}
    >
      {media.kind === 'placeholder' && <Placeholder />}
      {media.kind === 'image' && (
        <img
          src={media.src}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  )
}
