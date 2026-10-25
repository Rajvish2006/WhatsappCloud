
import { supabase } from "./supabase";

export async function testSupabaseConnection() {
  const { error } = await supabase
    .from("templates")
    .select("id")
    .limit(1);

  if (error) {
    console.error(
      "Supabase connection test failed:",
      error.message
    );
    return false;
  }

  console.log("Supabase connection successful");
  return true;
}
