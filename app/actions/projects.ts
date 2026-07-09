// app/actions/projects.ts

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        order: 'asc',
      },
    })
    return projects
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

export async function getProject(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
    })
    return project
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
}

export async function createProject(data: any) {
  try {
    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: data.category,
        description: data.description,
        longDescription: data.longDescription,
        technologies: data.technologies,
        tags: data.tags,
        githubLink: data.githubLink,
        liveLink: data.liveLink,
        status: data.status,
        featured: data.featured,
        projectNumber: data.projectNumber,
        icon: data.icon,
        thumbnail: data.thumbnail,
        images: data.images || [],
        order: data.order || 0,
      },
    })
    revalidatePath('/admin/projects')
    revalidatePath('/work')
    return { success: true, data: project }
  } catch (error) {
    console.error('Error creating project:', error)
    return { success: false, error: 'Failed to create project' }
  }
}

export async function updateProject(id: string, data: any) {
  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        category: data.category,
        description: data.description,
        longDescription: data.longDescription,
        technologies: data.technologies,
        tags: data.tags,
        githubLink: data.githubLink,
        liveLink: data.liveLink,
        status: data.status,
        featured: data.featured,
        projectNumber: data.projectNumber,
        icon: data.icon,
        thumbnail: data.thumbnail,
        images: data.images || [],
        order: data.order,
      },
    })
    revalidatePath('/admin/projects')
    revalidatePath('/work')
    return { success: true, data: project }
  } catch (error) {
    console.error('Error updating project:', error)
    return { success: false, error: 'Failed to update project' }
  }
}

export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({
      where: { id },
    })
    revalidatePath('/admin/projects')
    revalidatePath('/work')
    return { success: true }
  } catch (error) {
    console.error('Error deleting project:', error)
    return { success: false, error: 'Failed to delete project' }
  }
}

export async function reorderProjects(projectIds: string[]) {
  try {
    for (let i = 0; i < projectIds.length; i++) {
      await prisma.project.update({
        where: { id: projectIds[i] },
        data: { order: i },
      })
    }
    revalidatePath('/admin/projects')
    revalidatePath('/work')
    return { success: true }
  } catch (error) {
    console.error('Error reordering projects:', error)
    return { success: false, error: 'Failed to reorder projects' }
  }
}