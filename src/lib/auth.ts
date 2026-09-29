import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { ProfileRow } from "@/lib/database.types";

export type AppUser = {
  id: string;
  email: string;
  name: string;
};

export async function getAuthUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("id", user.id)
    .maybeSingle();

  const row = profile as Pick<ProfileRow, "id" | "name" | "email"> | null;

  return {
    id: user.id,
    email: row?.email || user.email || "",
    name:
      row?.name ||
      (typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "") ||
      user.email ||
      "",
  };
}
