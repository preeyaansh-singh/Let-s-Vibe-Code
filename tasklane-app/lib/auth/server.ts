// lib/auth/server.ts
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) return null

    const verified = await jwtVerify(token, secret)
    return verified.payload as any
  } catch (error) {
    console.error('Failed to verify token:', error)
    return null
  }
}
