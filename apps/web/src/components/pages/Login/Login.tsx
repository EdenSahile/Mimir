import { Link } from "react-router-dom"
import AuthForm from "@/components/ui/AuthForm/AuthForm"
import { signIn } from "@/lib/authClient"

export default function Login() {
  return (
    <>
      <AuthForm
        idPrefix="login"
        submitLabel="Se connecter"
        onSubmit={({ email, password }) => signIn.email({ email, password })}
      />
      <p>
        Pas encore de compte ? <Link to="/signup">Créer un compte</Link>
      </p>
    </>
  )
}
