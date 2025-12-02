import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for use in browser components
 * Use this in Client Components
 * 
 * @example
 * ```typescript
 * 'use client'
 * import { createClient } from '@/lib/supabase'
 * 
 * const supabase = createClient()
 * const { data } = await supabase.from('events').select('*')
 * ```
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Create a Supabase client for use in server components and server actions
 * Use this in Server Components, Server Actions, and Route Handlers
 * 
 * @example
 * ```typescript
 * import { createServerSupabaseClient } from '@/lib/supabase'
 * 
 * export async function GET() {
 *   const supabase = await createServerSupabaseClient()
 *   const { data } = await supabase.from('events').select('*')
 *   return Response.json(data)
 * }
 * ```
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Create an admin Supabase client with service role key
 * ⚠️ WARNING: This client has full database access and bypasses RLS policies
 * Only use this in secure server-side contexts (API routes, server actions)
 * Never expose service role key to client-side code
 * 
 * Use cases:
 * - Admin operations (create/update/delete events)
 * - NFC device authentication and attendance recording
 * - Bulk operations on student data
 * 
 * @example
 * ```typescript
 * import { createAdminClient } from '@/lib/supabase'
 * 
 * export async function POST(request: Request) {
 *   // Verify device API key first!
 *   const supabase = createAdminClient()
 *   
 *   // Admin operations
 *   const { data } = await supabase
 *     .from('students')
 *     .select('*') // Can access all students
 *   
 *   return Response.json(data)
 * }
 * ```
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables')
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
