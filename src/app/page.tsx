"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'ngo') {
        router.replace('/dashboard/ngo');
      } else if (user.role === 'government') {
        router.replace('/dashboard/government');
      }
    }
  }, [user, isLoading, router]);
  
  // Optional: Redirect to login if not loading and no user
  useEffect(() => {
    if (!isLoading && !user) {
        router.replace('/login');
    }
  }, [user, isLoading, router])

  return (
    <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-10 w-10 text-primary fill-current"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
              <h1 className="text-4xl font-semibold font-headline">SlumLink</h1>
            </div>
            <p className="text-muted-foreground">Redirecting to your dashboard...</p>
            <Skeleton className="h-4 w-48 mt-2" />
        </div>
    </div>
  );
}
