
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { Landmark } from "lucide-react"
import { ClientOnly } from "@/components/client-only"

export default function GovernmentLoginPage() {
  const router = useRouter()

  const handleLogin = () => {
    // In a real app, you'd handle authentication here
    router.push('/dashboard/government');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
            <div className="flex items-center gap-2 text-primary">
                <Landmark/>
                <CardTitle className="text-2xl font-headline">Government Login</CardTitle>
            </div>
          <CardDescription>
            Enter your credentials to access the government dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientOnly>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.gov"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full" onClick={handleLogin}>
                Login
              </Button>
              <Button variant="outline" className="w-full">
                Login with Official ID
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Need an account?{" "}
              <Link href="/signup/government" className="underline">
                Request Access
              </Link>
            </div>
          </ClientOnly>
        </CardContent>
      </Card>
    </div>
  )
}
