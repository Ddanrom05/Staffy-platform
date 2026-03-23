export type UserRole = 'voluntario' | 'empresa' | 'admin';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignUpPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  passwordHash: string;
}

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  phone: string | null;
  location: string | null;
  bio: string | null;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfilePayload {
  phone: string | null;
  location: string | null;
  bio: string | null;
  photoUrl: string | null;
}

export interface UserSkill {
  id: number;
  skillName: string;
  createdAt: Date;
}

export interface VolunteerHistoryItem {
  id: number;
  title: string;
  organization: string;
  date: string;
  hours: number;
  status: 'completado' | 'proximo';
  createdAt: Date;
}

export interface UserBadge {
  id: number;
  badgeName: string;
  status: 'earned' | 'locked';
  createdAt: Date;
}
