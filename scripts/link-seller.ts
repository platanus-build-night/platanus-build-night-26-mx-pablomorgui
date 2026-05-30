import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const phoneNumber = process.argv[2];
  const userEmail = process.argv[3];

  if (!phoneNumber || !userEmail) {
    console.error('Uso: npx tsx scripts/link-seller.ts <phone_number> <user_email>');
    process.exit(1);
  }

  const { data: seller, error: sellerError } = await supabase
    .from('premium_sellers')
    .select('id, seller_name, phone_number')
    .eq('phone_number', phoneNumber)
    .single();

  if (sellerError || !seller) {
    console.error('Seller no encontrado:', sellerError?.message);
    process.exit(1);
  }

  console.log('Seller encontrado:', seller);

  const { data, error } = await supabase
    .from('users')
    .update({
      premium_seller_id: seller.id,
      role: 'both',
    })
    .eq('email', userEmail.toLowerCase())
    .select('id, email, role, premium_seller_id');

  if (error) {
    console.error('Error actualizando usuario:', error.message);
    process.exit(1);
  }

  console.log('Usuario actualizado:', data);
}

main();
