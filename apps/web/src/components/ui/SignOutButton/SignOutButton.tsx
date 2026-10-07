import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/authClient"

export default function SignOutButton() {
  return (
    <Button type="button" variant="secondary" onClick={() => signOut()}>
      Se déconnecter
    </Button>
  )
}
