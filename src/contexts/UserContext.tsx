
"use client";

import { User } from '@/lib/types';
import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// This function will be used to create a user document in Firestore
// when a new user signs up.
export const createUserDocument = async (user: FirebaseUser, role: 'ngo' | 'government', details: any) => {
  if (!db) {
    console.error("Firestore is not initialized.");
    return;
  }
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const { email } = user;
    const { firstName, lastName, ngoName, department } = details;
    const name = `${firstName} ${lastName}`;
    
    let userData: User = {
      id: user.uid,
      name: name,
      email: email!,
      avatarUrl: `https://placehold.co/100x100?text=${name.charAt(0)}`,
      role: role
    };

    if(role === 'ngo' && ngoName) {
      (userData as any).ngoName = ngoName;
    }
    if(role === 'government' && department) {
      (userData as any).department = department;
    }

    await setDoc(userRef, userData);
    return userData;
  }
  return userDoc.data() as User;
};


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
    if (!auth || !db) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const userRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userRef);

        if(userDoc.exists()) {
            setUser(userDoc.data() as User);
        } else {
            // This is a fallback for users that might exist in Auth but not in Firestore.
            // A more robust solution might be needed depending on the app's logic.
            // For now, we'll create a basic user object.
             const newUser: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email || 'Anonymous',
                email: firebaseUser.email!,
                // This is a simplification. The role should be determined during signup.
                // We'll default to 'ngo' but this might need adjustment.
                role: 'ngo', 
                avatarUrl: firebaseUser.photoURL || `https://placehold.co/100x100?text=${(firebaseUser.email || 'A').charAt(0)}`
            };
            // This case might happen if a user is created in Auth but Firestore doc creation fails.
            // We can try creating it again here.
            await setDoc(userRef, newUser)
            setUser(newUser);
        }

      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};
