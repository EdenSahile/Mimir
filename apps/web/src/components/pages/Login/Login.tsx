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
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link to="/signup" className="text-primary underline hover:text-primary/80">
          Créer un compte
        </Link>
      </p>
    </>
  )
}
