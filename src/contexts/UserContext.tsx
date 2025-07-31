"use client";

import { User } from '@/lib/types';
import React, { createContext, useState, useEffect } from 'react';

// For demonstration, we'll have a mock user object.
// In a real app, this would come from an authentication provider.
const mockNgoUser: User = {
    id: 'user-ngo-123',
    name: 'Jane Doe (NGO)',
    email: 'jane.doe@ngo.org',
    role: 'ngo',
    avatarUrl: 'https://placehold.co/100x100'
};

const mockGovUser: User = {
    id: 'user-gov-789',
    name: 'John Smith (Gov)',
    email: 'john.smith@gov.in',
    role: 'government',
    avatarUrl: 'https://placehold.co/100x100'
};


// To switch between users for testing, change this value
const MOCK_USER_TYPE: 'ngo' | 'government' = 'ngo';


type UserContextType = {
  user: User | null;
  isLoading: boolean;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user data
    setTimeout(() => {
      if (MOCK_USER_TYPE === 'ngo') {
        setUser(mockNgoUser);
      } else {
        setUser(mockGovUser);
      }
      setIsLoading(false);
    }, 500); // Simulate network delay
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};
