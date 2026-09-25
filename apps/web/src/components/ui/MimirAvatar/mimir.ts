export type MimirState = 'idle' | 'listening' | 'thinking' | 'processing' | 'responding' | 'success'

export type AvatarMedia =
  | { kind: 'placeholder' }
  | { kind: 'image'; src: string }

export interface MimirAvatarProps {
  state: MimirState
  amplitude?: number
  intensity?: number
  media?: AvatarMedia
  size?: 'stage' | 'hero' | 'companion' | 'presence'
  className?: string
  'aria-hidden'?: boolean
}
