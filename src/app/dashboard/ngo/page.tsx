"use client";

import { NgoDashboard } from "@/components/ngo-dashboard";
import { useUser } from "@/hooks/useUser";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function NgoDashboardPage() {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return <div className="p-6"><Skeleton className="h-20 w-full" /></div>
    }

    if (user?.role !== 'ngo') {
        return (
            <div className="flex h-screen w-full items-center justify-center p-8">
                <Alert variant="destructive" className="max-w-lg">
                    <AlertTriangle />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You do not have permission to view this page. Please log in with an NGO account.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return <NgoDashboard />;
}
