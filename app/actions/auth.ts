'use server'

import { db } from '@/db'
import { users } from '@/db/schema'
import { createSession, destroySession, hashPassword, verifyPassword } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function signUp(formData: FormData): Promise<void> {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const result = signUpSchema.safeParse(rawData)
  if (!result.success) {
    throw new Error(result.error.errors[0].message)
  }

  const { name, email, password } = result.data

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  // Create user
  const hashedPassword = await hashPassword(password)
  const [newUser] = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  }).returning()

  // Create session
  await createSession({
    userId: newUser.id,
    email: newUser.email,
    name: newUser.name,
  })

  redirect('/dashboard')
}

export async function signIn(formData: FormData): Promise<void> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const result = signInSchema.safeParse(rawData)
  if (!result.success) {
    throw new Error(result.error.errors[0].message)
  }

  const { email, password } = result.data

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (!user) {
    throw new Error('Invalid email or password')
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.password)
  if (!isValidPassword) {
    throw new Error('Invalid email or password')
  }

  // Create session
  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
  })

  redirect('/dashboard')
}

export async function signOut() {
  await destroySession()
  redirect('/')
}
