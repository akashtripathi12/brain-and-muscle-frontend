// app/api/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getURL } from '@/utils/url'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  
  const siteUrl = getURL()

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log(`[auth] Successfully exchanged code. Redirecting to ${siteUrl}${next}`)
      return NextResponse.redirect(`${siteUrl}dashboard`)
    } else {
      console.error(`[auth] Error exchanging code: ${error.message}`)
    }
  }

  // Handle errors or missing codes
  console.warn(`[auth] Auth failed or no code provided. Redirecting back to login.`)
  return NextResponse.redirect(`${siteUrl}login?error=auth_failed`)
}