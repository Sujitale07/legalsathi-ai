import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { UserRole } from './types/auth'

export function getRole(publicMetadata: Record<string, unknown> | null | undefined): UserRole {
  return publicMetadata?.role === 'admin' ? 'admin' : 'user'
}

/**
 * Asserts the request is authenticated. Throws a 401 Response on failure.
 * Use inside route handlers:
 *   const { userId, role } = await requireAuth()
 */
export async function requireAuth(): Promise<{ userId: string; role: UserRole }> {
  const { userId, sessionClaims } = await auth()
  if (!userId) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const role = getRole(sessionClaims?.publicMetadata as Record<string, unknown>)
  return { userId, role }
}

/**
 * Asserts the request is authenticated AND the user has the admin role.
 * Throws 401 for unauthenticated, 403 for non-admin.
 */
export async function requireAdmin(): Promise<{ userId: string; role: UserRole }> {
  const result = await requireAuth()
  if (result.role !== 'admin') {
    throw NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return result
}

/**
 * Safely catches thrown auth Responses. Use in the catch block of every route handler:
 *   } catch (err) {
 *     return handleAuthError(err)
 *   }
 */
export function handleAuthError(err: unknown): NextResponse {
  if (err instanceof Response) return err as NextResponse
  console.error('[auth] unexpected error:', err)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
