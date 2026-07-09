// app/actions/categories.ts

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        order: 'asc',
      },
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function createCategory(data: any) {
  try {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: data.description,
        icon: data.icon,
        order: data.order || 0,
      },
    })
    revalidatePath('/admin/categories')
    return { success: true, data: category }
  } catch (error) {
    console.error('Error creating category:', error)
    return { success: false, error: 'Failed to create category' }
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    })
    revalidatePath('/admin/categories')
    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: 'Failed to delete category' }
  }
}