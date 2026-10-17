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
          const name = email.split("@")[0]
          return signUp.email({ email, password, name })
        }}
      />
      <p>
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </>
  )
}
