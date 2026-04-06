import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error('Missing Supabase environment variables')
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(url!, key!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options)
          } catch {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Cookie set failed — likely Server Component:', name)
            }
          }
        })
      },
    },
  })
}