import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn } from "@/lib/authClient"
import { authErrorMessage } from "@/logic/auth/errorMessage/errorMessage"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email || !password) return

    setErrorMessage("")
    const { error } = await signIn.email({ email, password })
    if (error) {
      setErrorMessage(authErrorMessage(error))
      return
    }
    navigate("/mimir")
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="login-email">Email</label>
      <Input
        id="login-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <label htmlFor="login-password">Mot de passe</label>
      <Input
        id="login-password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      {errorMessage && <p role="alert">{errorMessage}</p>}

      <Button type="submit">Se connecter</Button>
    </form>
  )
}
