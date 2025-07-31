
export type ReportType = "Water" | "Electricity" | "Education" | "Sanitation" | "Healthcare";
export type ReportSeverity = "Low" | "Medium" | "High";
export type ReportStatus = "Pending" | "In Progress" | "Resolved";

export type Report = {
  id: string;
  title: string;
  description: string;
  type: ReportType;
  severity: ReportSeverity;
  status: ReportStatus;
  location: {
    lat: number;
    lng: number;
  };
  zone: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  imageUrl?: string;
  createdAt: string; // ISO date string or Firestore Timestamp
};

export type UserRole = 'ngo' | 'government';

export type User = {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    role: UserRole;
    ngoName?: string;
    department?: string;
};
