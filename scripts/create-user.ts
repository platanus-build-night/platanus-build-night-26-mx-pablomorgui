/**
 * Script para crear usuarios en la tabla users
 *
 * Uso:
 *   pnpm create-user <email> <name> [role]
 *
 * Ejemplos:
 *   pnpm create-user pablo@test.com Pablo buyer
 *   pnpm create-user seller@test.com "Juan Vendedor" seller
 */

import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { createClient } from '@supabase/supabase-js';
import * as readline from 'node:readline';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const [email, name, role = 'buyer'] = process.argv.slice(2);

  if (!email || !name) {
    console.error('Uso: pnpm create-user <email> <name> [role]');
    console.error('Roles: buyer, seller, both');
    process.exit(1);
  }

  if (!['buyer', 'seller', 'both'].includes(role)) {
    console.error('Role debe ser: buyer, seller, o both');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const password = await prompt('Password: ');
  if (!password || password.length < 6) {
    console.error('Password debe tener al menos 6 caracteres');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const passwordHash = await hashPassword(password);

  const { data, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      name,
      role,
    })
    .select('id, email, name, role')
    .single();

  if (error) {
    if (error.code === '23505') {
      console.error('Error: ya existe un usuario con ese email');
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }

  console.log('Usuario creado:');
  console.log(data);
}

main().catch(console.error);
