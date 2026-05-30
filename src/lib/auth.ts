import { scrypt, timingSafeEqual, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getSupabase } from './supabase';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production',
);
const COOKIE_NAME = 'mundialin_session';
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days

export type UserRole = 'buyer' | 'seller' | 'both';

export type User = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  whatsapp_number: string | null;
  premium_seller_id: string | null;
};

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  premiumSellerId: string | null;
};

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;

  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  const storedKey = Buffer.from(hash, 'hex');

  if (derivedKey.length !== storedKey.length) return false;
  return timingSafeEqual(derivedKey, storedKey);
}

async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);
}

async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await getSupabase()
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error || !data) return null;
  return data as User;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await getSupabase()
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return data as User;
}

export async function login(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await getUserByEmail(email);

  if (!user || !user.password_hash) {
    return { success: false, error: 'Email o contrasena incorrectos' };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { success: false, error: 'Email o contrasena incorrectos' };
  }

  const token = await createToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    premiumSellerId: user.premium_seller_id,
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });

  return { success: true };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const user = await getUserById(payload.userId);
  if (!user) return null;

  return payload;
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export async function signup(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { success: false, error: 'Este email ya esta registrado' };
  }

  const passwordHash = await hashPassword(password);

  const { data, error } = await getSupabase()
    .from('users')
    .insert({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      name: email.split('@')[0],
      role: 'buyer' as UserRole,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: 'Error al crear la cuenta' };
  }

  const user = data as User;
  const token = await createToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    premiumSellerId: user.premium_seller_id,
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });

  return { success: true };
}
