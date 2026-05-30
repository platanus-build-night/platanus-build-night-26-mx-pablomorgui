import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const sellerId = process.argv[2];
  const userEmail = process.argv[3];

  if (!sellerId || !userEmail) {
    console.error('Uso: npx tsx scripts/link-user-seller.ts <seller_id> <user_email>');
    process.exit(1);
  }

  const { data, error } = await supabase
    .from('users')
    .update({
      premium_seller_id: sellerId,
      role: 'both',
    })
    .eq('email', userEmail.toLowerCase())
    .select('id, email, role, premium_seller_id');

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('Usuario actualizado:', data);
}

main();
