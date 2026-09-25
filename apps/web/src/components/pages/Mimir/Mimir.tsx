import { useState } from 'react'
import MimirAvatar from '@/components/ui/MimirAvatar/MimirAvatar'
import MimirPresence from '@/components/ui/MimirAvatar/MimirPresence'
import StateLabel from '@/components/ui/MimirAvatar/StateLabel'
import VoiceBars from '@/components/ui/MimirAvatar/VoiceBars'
import type { MimirState } from '@/components/ui/MimirAvatar/mimir'

const STATES: MimirState[] = ['idle', 'listening', 'thinking', 'processing', 'responding', 'success']
const SIZES = ['stage', 'hero', 'companion', 'presence'] as const

export default function Mimir() {
  const [state, setState] = useState<MimirState>('idle')

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-white">
      <h1 className="mb-6 text-2xl font-bold">MimirAvatar Playground</h1>

      <div className="mb-8 flex flex-wrap gap-2">
        {STATES.map((s) => (
          <button
            key={s}
            onClick={() => setState(s)}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              state === s
                ? 'bg-white text-zinc-950'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-12">
        {SIZES.map((size) => (
          <div key={size} className="flex flex-col items-center gap-3">
            <div
              style={{
                width: size === 'stage' ? 320 : size === 'hero' ? 200 : size === 'companion' ? 120 : 56,
              }}
            >
              <MimirAvatar state={state} size={size} aria-hidden={false} />
            </div>
            <span className="text-sm text-zinc-500">{size}</span>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-8">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-400">StateLabel</h2>
          <StateLabel state={state} className="text-zinc-300" />
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-400">VoiceBars</h2>
          <VoiceBars state={state} className="h-6 text-cyan-400" />
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-400">MimirPresence</h2>
          <div className="flex items-center gap-4">
            <MimirPresence state={state} size={22} />
            <MimirPresence state={state} size={32} />
            <MimirPresence state={state} size={50} />
          </div>
        </div>
      </div>
    </div>
  )
}
