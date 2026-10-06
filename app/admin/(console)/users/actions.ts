'use server'

import crypto from 'node:crypto'
import { promisify } from 'node:util'
import { revalidatePath } from 'next/cache'

const scryptAsync = promisify(crypto.scrypt)

import { sql } from '@/lib/db'

export async function listAdminUsers() {
  try {
    const users = await sql`
      SELECT username, created_at 
      FROM admin_users 
      ORDER BY created_at ASC
    `
    return users.map(u => ({
      username: u.username,
      createdAt: u.created_at ? new Date(u.created_at).toISOString() : null,
    }))
  } catch (error) {
    console.error('Failed to list users:', error)
    return []
  }
}

export async function addAdminUserAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const username = (formData.get('username') as string || '').trim().toLowerCase()
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!username || username.length < 2) {
    return { error: 'Username must be at least 2 characters.' }
  }
  if (/[,:]/g.test(username)) {
    return { error: 'Username must not contain : or , characters.' }
  }
  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  if (password !== confirm) {
    return { error: 'Passwords do not match.' }
  }

  try {
    const existing = await sql`SELECT id FROM admin_users WHERE username = ${username}`
    if (existing.length > 0) {
      return { error: `User "${username}" already exists.` }
    }
  } catch (error) {
    console.error('Database query failed:', error)
    return { error: 'Database error occurred while checking if user exists.' }
  }

  // Hash the password securely on the server
  try {
    const salt = crypto.randomBytes(16)
    const hash = await scryptAsync(password, salt, 64) as Buffer
    const saltHex = salt.toString('hex')
    const hashHex = hash.toString('hex')

    await sql`
      INSERT INTO admin_users (username, salt, hash) 
      VALUES (${username}, ${saltHex}, ${hashHex})
    `

    revalidatePath('/admin/users')
    return {
      success: `User "${username}" has been successfully created and saved to the database!`
    }
  } catch (e) {
    console.error('addAdminUserAction error', e)
    return { error: 'An error occurred while creating the user. Please try again.' }
  }
}

export async function deleteAdminUserAction(username: string): Promise<{ error?: string; success?: string }> {
  try {
    await sql`DELETE FROM admin_users WHERE username = ${username}`
    revalidatePath('/admin/users')
    return {
      success: `User "${username}" has been successfully removed.`
    }
  } catch (error) {
    console.error('deleteAdminUserAction error:', error)
    return { error: 'Failed to delete user.' }
  }
}
