import { useState } from "react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/authClient"

export default function SignOutButton() {
  const [errorMessage, setErrorMessage] = useState("")

  async function handleClick() {
    setErrorMessage("")
    const { error } = await signOut()
    if (error) setErrorMessage("La déconnexion a échoué, réessaie.")
  }

  return (
    <div>
      <Button type="button" variant="secondary" onClick={handleClick}>
        Se déconnecter
      </Button>
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </div>
  )
}
