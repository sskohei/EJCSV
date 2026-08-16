import { createClient } from "@/lib/supabase/server";

export type AuthenticatedSupabase = Awaited<ReturnType<typeof createClient>>;

export async function getAuthenticatedClient(): Promise<{
  client: AuthenticatedSupabase;
  userId: string;
} | null> {
  const client = await createClient();
  const { data, error } = await client.auth.getUser();

  if (error || !data.user) return null;

  return { client, userId: data.user.id };
}
