'use server'

import { createClient } from "@/lib/supabase/server"

export async function getProfile(userId: string){
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if(error){
    throw new Error(error.message)
  } ;
  return data;
}