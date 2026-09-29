import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MimirAvatar from '@/components/ui/MimirAvatar/MimirAvatar'
import { Input } from '@/components/ui/input'
import Chip from '@/components/ui/Chip'
import ProgressBar from '@/components/pages/Onboarding/ProgressBar'
import { ONBOARDING_STEPS } from '@/data/onboarding'

const TOTAL_STEPS = ONBOARDING_STEPS.length

export default function Onboarding() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [textValues, setTextValues] = useState<Record<number, string>>({})
  const [selectedChips, setSelectedChips] = useState<Record<number, string[]>>(
    {},
  )

  const step = ONBOARDING_STEPS[currentStep]
  const isLastStep = currentStep === TOTAL_STEPS - 1

  function handleNext() {
    if (isLastStep) {
      navigate('/mimir')
    } else {
      setCurrentStep((s) => s + 1)
    }
  }

  function handleToggleChip(label: string) {
    setSelectedChips((prev) => {
      const current = prev[currentStep] ?? []
      const next = current.includes(label)
        ? current.filter((c) => c !== label)
        : [...current, label]
      return { ...prev, [currentStep]: next }
    })
  }

  return (
    <div
      className="grid min-h-dvh items-center"
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 'clamp(24px, 4vw, 64px)',
        padding: 'clamp(32px, 6vh, 72px) clamp(24px, 5vw, 80px)',
      }}
    >
      <div className="flex flex-col items-center gap-7">
        <MimirAvatar
          state={step.avatarState}
          size="companion"
          aria-hidden
          className="h-[clamp(160px,30vh,290px)]"
        />
        <div className="max-w-[300px] text-center">
          <div className="font-display text-[22px] tracking-[.3em] text-[var(--ink-strong)]">
            MÍMIR
          </div>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-[var(--ink-3)]">
            Quelques repères suffisent pour commencer. Vous pourrez tout ajuster
            plus tard.
          </p>
        </div>
      </div>

      <div className="flex w-full max-w-[560px] flex-col gap-7">
        <ProgressBar current={currentStep} total={TOTAL_STEPS} />

        <div key={currentStep}>
          <span className="mb-4 block font-mono text-[10.5px] tracking-[.22em] uppercase text-[var(--ink-3)]">
            {step.kicker}
          </span>
          <h2
            className="text-[var(--ink-strong)]"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(28px, 3.4vw, 42px)',
              lineHeight: 1.12,
              fontWeight: 400,
            }}
          >
            {step.question}
          </h2>
          <p className="mt-3.5 text-[15px] leading-relaxed text-[var(--ink-2)]">
            {step.help}
          </p>
        </div>

        {step.type === 'text' && (
          <Input
            value={textValues[currentStep] ?? ''}
            onChange={(e) =>
              setTextValues((prev) => ({
                ...prev,
                [currentStep]: e.target.value,
              }))
            }
            placeholder={step.placeholder}
            data-testid="onboarding-input"
          />
        )}

        {step.type === 'choice' && step.options && (
          <div className="flex flex-wrap gap-2.5" data-testid="onboarding-chips">
            {step.options.map((option) => (
              <Chip
                key={option}
                active={(selectedChips[currentStep] ?? []).includes(option)}
                onToggle={() => handleToggleChip(option)}
              >
                {option}
              </Chip>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-1.5">
          <button
            onClick={handleNext}
            className="cursor-pointer rounded-full border-none px-7 py-3.5 text-sm font-medium text-[var(--on-light)]"
            style={{
              background:
                'linear-gradient(180deg, rgba(206,244,248,.95), rgba(176,226,232,.82))',
            }}
            data-testid="onboarding-continue"
          >
            {isLastStep ? 'Entrer dans Mímir' : 'Continuer'}
          </button>
          {!isLastStep && (
            <button
              onClick={handleNext}
              className="cursor-pointer border-none bg-transparent text-[13.5px] text-[var(--ink-3)] underline underline-offset-4"
              data-testid="onboarding-skip"
            >
              Passer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
