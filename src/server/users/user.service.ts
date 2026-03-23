import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { getDbPool } from '../db/mysql';
import {
  AuthUser,
  SignUpPayload,
  UpdateProfilePayload,
  UserBadge,
  UserProfile,
  UserRole,
  UserSkill,
  VolunteerHistoryItem,
} from './user.model';

interface UserRow extends RowDataPacket {
  id: number;
}

interface AuthUserRow extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  password_hash: string;
}

interface UserProfileRow extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  location: string | null;
  bio: string | null;
  photo_url: string | null;
  created_at: Date;
  updated_at: Date;
}

interface UserSkillRow extends RowDataPacket {
  id: number;
  skill_name: string;
  created_at: Date;
}

interface VolunteerHistoryRow extends RowDataPacket {
  id: number;
  title: string;
  organization: string;
  activity_date: Date | null;
  hours: number;
  status: 'completado' | 'proximo';
  created_at: Date;
}

interface UserBadgeRow extends RowDataPacket {
  id: number;
  badge_name: string;
  status: 'earned' | 'locked';
  created_at: Date;
}

export async function findUserIdByEmail(email: string): Promise<number | null> {
  const pool = getDbPool();
  const [rows] = await pool.query<UserRow[]>(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email],
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0].id;
}

export async function findAuthUserByEmail(email: string): Promise<AuthUser | null> {
  const pool = getDbPool();
  const [rows] = await pool.query<AuthUserRow[]>(
    `SELECT id, full_name, email, role, password_hash
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email],
  );

  if (rows.length === 0) {
    return null;
  }

  const user = rows[0];
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    passwordHash: user.password_hash,
  };
}

export async function createUser(
  payload: SignUpPayload & { passwordHash: string; role: UserRole },
): Promise<number> {
  const pool = getDbPool();
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES (?, ?, ?, ?)`,
    [payload.fullName, payload.email, payload.passwordHash, payload.role],
  );

  return result.insertId;
}

export async function findUserProfileByEmail(email: string): Promise<UserProfile | null> {
  const pool = getDbPool();
  const [rows] = await pool.query<UserProfileRow[]>(
    `SELECT u.id, u.full_name, u.email, u.role,
            up.phone, up.location, up.bio, up.photo_url,
            u.created_at, u.updated_at
     FROM users u
     LEFT JOIN user_profiles up ON up.user_email = u.email
     WHERE u.email = ?
     LIMIT 1`,
    [email],
  );

  if (rows.length === 0) {
    return null;
  }

  const user = rows[0];
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    location: user.location,
    bio: user.bio,
    photoUrl: user.photo_url,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export async function updateUserProfileByEmail(
  email: string,
  payload: UpdateProfilePayload,
): Promise<boolean> {
  const pool = getDbPool();
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO user_profiles (user_email, phone, location, bio, photo_url)
     SELECT email, ?, ?, ?, ?
     FROM users
     WHERE email = ?
     ON DUPLICATE KEY UPDATE
       phone = VALUES(phone),
       location = VALUES(location),
       bio = VALUES(bio),
       photo_url = VALUES(photo_url)`,
    [payload.phone, payload.location, payload.bio, payload.photoUrl, email],
  );

  return result.affectedRows > 0;
}

export async function findUserSkillsByEmail(email: string): Promise<UserSkill[]> {
  const pool = getDbPool();
  const [rows] = await pool.query<UserSkillRow[]>(
    `SELECT id, skill_name, created_at
     FROM user_skills
     WHERE user_email = ?
     ORDER BY created_at DESC`,
    [email],
  );

  return rows.map((row) => ({
    id: row.id,
    skillName: row.skill_name,
    createdAt: row.created_at,
  }));
}

export async function addUserSkillByEmail(email: string, skillName: string): Promise<boolean> {
  const pool = getDbPool();
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO user_skills (user_email, skill_name)
     SELECT email, ?
     FROM users
     WHERE email = ?
     ON DUPLICATE KEY UPDATE skill_name = VALUES(skill_name)`,
    [skillName, email],
  );

  return result.affectedRows > 0;
}

export async function deleteUserSkillByEmail(email: string, skillName: string): Promise<boolean> {
  const pool = getDbPool();
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM user_skills
     WHERE user_email = ? AND skill_name = ?`,
    [email, skillName],
  );

  return result.affectedRows > 0;
}

export async function findVolunteerHistoryByEmail(email: string): Promise<VolunteerHistoryItem[]> {
  const pool = getDbPool();
  const [rows] = await pool.query<VolunteerHistoryRow[]>(
    `SELECT id, title, organization, activity_date, hours, status, created_at
     FROM volunteer_history
     WHERE user_email = ?
     ORDER BY activity_date DESC, created_at DESC`,
    [email],
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    organization: row.organization,
    date: row.activity_date
      ? new Date(row.activity_date).toLocaleDateString('es-ES')
      : '',
    hours: row.hours,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function findUserBadgesByEmail(email: string): Promise<UserBadge[]> {
  const pool = getDbPool();
  const [rows] = await pool.query<UserBadgeRow[]>(
    `SELECT id, badge_name, status, created_at
     FROM user_badges
     WHERE user_email = ?
     ORDER BY created_at DESC`,
    [email],
  );

  return rows.map((row) => ({
    id: row.id,
    badgeName: row.badge_name,
    status: row.status,
    createdAt: row.created_at,
  }));
}
