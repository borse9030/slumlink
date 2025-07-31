
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building } from "lucide-react"
import { ClientOnly } from "@/components/client-only"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function NgoSignupPage() {
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // In a real app, you would handle user creation with Firebase Auth here.
    toast({
      title: "Account Created",
      description: "Your NGO account has been successfully created.",
    })
    // Redirect to login page after showing toast
    router.push('/login/ngo');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <Building/>
            <CardTitle className="text-xl font-headline">Sign Up for SlumLink</CardTitle>
          </div>
          <CardDescription>
            Enter your information to create an NGO account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientOnly>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input id="first-name" placeholder="Max" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last-name" placeholder="Robinson" required />
                </div>
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="ngo-name">NGO Name</Label>
                  <Input id="ngo-name" placeholder="e.g. Shelter Foundation" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Create an account
              </Button>
              <Button variant="outline" className="w-full">
                Sign up with Google
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login/ngo" className="underline">
                Login
              </Link>
            </div>
          </ClientOnly>
        </CardContent>
      </Card>
    </div>
  )
}
