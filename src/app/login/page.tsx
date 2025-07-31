"use client";

import Link from "next/link"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Building, Landmark } from "lucide-react";

export default function RoleSelectionPage() {
    const router = useRouter();
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome to SlumLink</CardTitle>
          <CardDescription>
            Please select your role to login or sign up.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
            <Button size="lg" className="w-full justify-start py-6" onClick={() => router.push('/login/ngo')}>
                <Building className="mr-4 h-5 w-5"/>
                <div className="text-left">
                    <p className="font-semibold">NGO User</p>
                    <p className="text-xs text-primary-foreground/80">Login or Sign Up</p>
                </div>
            </Button>
             <Button size="lg" className="w-full justify-start py-6" onClick={() => router.push('/login/government')}>
                <Landmark className="mr-4 h-5 w-5"/>
                <div className="text-left">
                    <p className="font-semibold">Government User</p>
                    <p className="text-xs text-primary-foreground/80">Login or Sign Up</p>
                </div>
            </Button>
        </CardContent>
      </Card>
    </div>
  )
}
