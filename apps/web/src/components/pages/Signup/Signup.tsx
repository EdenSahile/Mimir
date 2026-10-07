import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signUp } from "@/lib/authClient"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email || !password) return

    // Better Auth exige un name à l'inscription ; le formulaire ne collecte
    // qu'email + mot de passe, on dérive le name de la partie locale de l'email.
    const name = email.split("@")[0]
    const { error } = await signUp.email({ email, password, name })
    if (!error) navigate("/mimir")
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="signup-email">E-mail</label>
      <Input
        id="signup-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <label htmlFor="signup-password">Mot de passe</label>
      <Input
        id="signup-password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <Button type="submit">Créer un compte</Button>
    </form>
  )
}
