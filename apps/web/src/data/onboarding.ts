import type { MimirState } from '@/components/ui/MimirAvatar/mimir'

export type OnboardingStepType = 'text' | 'choice'

export interface OnboardingStep {
  kicker: string
  question: string
  help: string
  type: OnboardingStepType
  placeholder?: string
  options?: string[]
  avatarState: MimirState
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    kicker: 'Étape 1 · Identité',
    question: 'Comment doit-on vous appeler ?',
    help: 'Mímir utilisera ce prénom dans ses réponses.',
    type: 'text',
    placeholder: 'Votre prénom',
    avatarState: 'idle',
  },
  {
    kicker: 'Étape 2 · Activité',
    question: 'Que faites-vous en ce moment ?',
    help: 'Une phrase suffit. Cela cadre le contexte de tous vos échanges.',
    type: 'text',
    placeholder: 'ex. product designer, freelance',
    avatarState: 'listening',
  },
  {
    kicker: 'Étape 3 · Objectifs',
    question: 'Sur quoi voulez-vous avancer ?',
    help: 'Choisissez ce qui compte cette saison. Vous pourrez en ajouter.',
    type: 'choice',
    options: [
      'Structurer mes projets',
      'Trouver un poste',
      'Apprendre',
      'Mieux gérer mon temps',
      'Développer mon activité',
      'Écrire davantage',
    ],
    avatarState: 'thinking',
  },
  {
    kicker: 'Étape 4 · Intérêts',
    question: 'Que doit suivre Mímir pour vous ?',
    help: 'Cela alimente votre veille.',
    type: 'choice',
    options: [
      'IA & modèles',
      'Design produit',
      'Outils dev',
      'Marché de l’emploi',
      'Startups',
      'Recherche',
    ],
    avatarState: 'processing',
  },
  {
    kicker: 'Étape 5 · Usage',
    question: 'Comment voulez-vous travailler avec Mímir ?',
    help: 'Le ton et le niveau d’initiative de Mímir s’ajustent.',
    type: 'choice',
    options: [
      'Il me résume la journée',
      'Il me propose des priorités',
      'Il attend mes demandes',
      'Il agit sur mes documents',
    ],
    avatarState: 'responding',
  },
]
