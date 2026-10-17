import { Link } from "react-router-dom"
import AuthForm from "@/components/ui/AuthForm/AuthForm"
import { signUp } from "@/lib/authClient"

export default function Signup() {
  return (
    <>
      <AuthForm
        idPrefix="signup"
        submitLabel="Créer un compte"
        onSubmit={({ email, password }) => {
          // Better Auth exige un name ; on dérive de la partie locale de l'email
          const name = email.split("@")[0]
          return signUp.email({ email, password, name })
        }}
      />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link to="/login" className="text-primary underline hover:text-primary/80">
          Se connecter
        </Link>
      </p>
    </>
  )
}
