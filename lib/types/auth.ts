export type UserRole = 'admin' | 'user'

export interface AuthUser {
  userId: string
  role: UserRole
  email?: string
}
