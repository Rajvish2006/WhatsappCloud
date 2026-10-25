import { checkSupabaseConnection } from './supabaseService';

export async function testSupabaseConnection() {
  const status = await checkSupabaseConnection();
  if (!status.isConnected) {
    console.warn("Supabase connection check warning:", status.error);
    return false;
  }
  console.log("Supabase connection successful! Project URL:", status.projectUrl);
  return true;
}
