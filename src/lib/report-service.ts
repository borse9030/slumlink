import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { Report, ReportSeverity, ReportType } from './types';
import { useUser } from '@/hooks/useUser';

const reportsCollectionRef = collection(db, 'reports');

// Fetch all reports from Firestore
export const getReports = async (): Promise<Report[]> => {
    try {
        const q = query(reportsCollectionRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const reports = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamp to ISO string if needed
                createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
            } as Report;
        });
        return reports;
    } catch (error) {
        console.error("Error fetching reports: ", error);
        return [];
    }
};

// Add a new report to Firestore
export const addReport = async (reportData: {
    title: string;
    description: string;
    type: ReportType;
    severity: ReportSeverity;
    location: { lat: number; lng: number };
    zone: string; // You might want to determine this dynamically
    imageUrl?: string;
    user: { id: string; name: string; avatarUrl: string; };
}) => {
    try {
        await addDoc(reportsCollectionRef, {
            ...reportData,
            status: 'Pending',
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding report: ", error);
        throw error;
    }
};
