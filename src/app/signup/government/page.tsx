
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
import { Landmark } from "lucide-react"
import { ClientOnly } from "@/components/client-only"

export default function GovernmentSignupPage() {
  // In a real app, you would have a form submission handler here
  // that would call a function to create a new government user account.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submitted");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
            <div className="flex items-center gap-2 text-primary">
                <Landmark/>
                <CardTitle className="text-xl font-headline">Government Account Signup</CardTitle>
            </div>
          <CardDescription>
            Enter your information to create an official account.
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
                <Label htmlFor="email">Official Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.gov"
                  required
                />
              </div>
               <div className="grid gap-2">
                  <Label htmlFor="department">Department/Agency</Label>
                  <Input id="department" placeholder="e.g. Municipal Corporation" required />
                </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
              </div>
              <Button type="submit" className="w-full">
                Create an account
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login/government" className="underline">
                Login
              </Link>
            </div>
          </ClientOnly>
        </CardContent>
      </Card>
    </div>
  )
}
