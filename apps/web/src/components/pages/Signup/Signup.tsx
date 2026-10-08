import AuthForm from "@/components/ui/AuthForm/AuthForm"
import { signUp } from "@/lib/authClient"

export default function Signup() {
  return (
    <AuthForm
      idPrefix="signup"
      submitLabel="Créer un compte"
      onSubmit={({ email, password }) => {
        // Better Auth exige un name à l'inscription ; le formulaire ne collecte
        // qu'email + mot de passe, on dérive le name de la partie locale de l'email.
        const name = email.split("@")[0]
        return signUp.email({ email, password, name })
      }}
    />
  )
}
