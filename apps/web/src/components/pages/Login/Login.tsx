import AuthForm from "@/components/ui/AuthForm/AuthForm"
import { signIn } from "@/lib/authClient"

export default function Login() {
  return (
    <AuthForm
      idPrefix="login"
      submitLabel="Se connecter"
      onSubmit={({ email, password }) => signIn.email({ email, password })}
    />
  )
}
