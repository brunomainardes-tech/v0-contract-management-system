"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function login(formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  console.log("[v0] Attempting login for:", data.email)

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.log("[v0] Login error:", error.message)
    return { error: error.message }
  }

  console.log("[v0] Login successful")
  revalidatePath("/", "layout")
  redirect("/")
}

export async function signup(formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  console.log("[v0] Attempting signup for:", data.email)

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
    },
  })

  if (error) {
    console.log("[v0] Signup error:", error.message)
    return { error: error.message }
  }

  console.log("[v0] Signup successful")
  return { success: true }
}

export async function logout() {
  const supabase = await getSupabaseServerClient()
  console.log("[v0] Logging out")
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}
