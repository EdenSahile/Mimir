import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authErrorMessage } from "@/logic/auth/errorMessage/errorMessage"

type Credentials = { email: string; password: string }
type AuthResult = { error: { code?: string } | null }

type AuthFormProps = {
  idPrefix: string
  submitLabel: string
  onSubmit: (credentials: Credentials) => Promise<AuthResult>
}

export default function AuthForm({ idPrefix, submitLabel, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [pending, setPending] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email || !password) return

    setErrorMessage("")
    setPending(true)
    const { error } = await onSubmit({ email, password })
    setPending(false)
    if (error) {
      setErrorMessage(authErrorMessage(error))
      return
    }
    navigate("/mimir")
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor={`${idPrefix}-email`}>Email</label>
      <Input
        id={`${idPrefix}-email`}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <label htmlFor={`${idPrefix}-password`}>Mot de passe</label>
      <Input
        id={`${idPrefix}-password`}
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      {errorMessage && <p role="alert">{errorMessage}</p>}

      <Button type="submit" disabled={pending}>
        {submitLabel}
      </Button>
    </form>
  )
}
