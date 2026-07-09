// app/actions/messages.ts

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getMessages() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return messages
  } catch (error) {
    console.error('Error fetching messages:', error)
    return []
  }
}

export async function markMessageRead(id: string) {
  try {
    await prisma.message.update({
      where: { id },
      data: { read: true },
    })
    revalidatePath('/admin/messages')
    return { success: true }
  } catch (error) {
    console.error('Error marking message as read:', error)
    return { success: false, error: 'Failed to update message' }
  }
}

export async function deleteMessage(id: string) {
  try {
    await prisma.message.delete({
      where: { id },
    })
    revalidatePath('/admin/messages')
    return { success: true }
  } catch (error) {
    console.error('Error deleting message:', error)
    return { success: false, error: 'Failed to delete message' }
  }
}