/**
 * /api/projects
 *
 * Full CRUD for CraftCode portfolio projects.
 * Stack: Next.js 14 App Router + Prisma + MongoDB Atlas
 * Auth:  getSession() — same as settings route (JWT cookie)
 *
 * GET    /api/projects            → all published projects (public)
 * GET    /api/projects?all=true   → all projects incl. drafts (admin)
 * GET    /api/projects?id=xxx     → single project by id (admin/edit page)
 * POST   /api/projects            → create project (admin only)
 * PUT    /api/projects            → update project (admin only)
 * DELETE /api/projects?id=xxx     → delete project (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// ─── GET — Fetch Projects ─────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id       = searchParams.get('id')
    const showAll  = searchParams.get('all')      === 'true'
    const featured = searchParams.get('featured') === 'true'
    const category = searchParams.get('category')

    // Single project fetch (used by the edit page)
    if (id) {
      const project = await prisma.project.findUnique({ where: { id } })
      if (!project) {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: project })
    }

    const where: Record<string, unknown> = {}

    if (!showAll)  where.status   = 'published'
    if (category)  where.category = category
    if (featured)  where.featured = true

    const projects = await prisma.project.findMany({
      where,
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ success: true, data: projects })
  } catch (error) {
    console.error('[Projects GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// ─── POST — Create Project ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      slug,
      description,
      longDescription = '',
      category,
      technologies    = [],
      tags            = [],
      githubLink      = '',
      liveLink        = '',
      status          = 'draft',
      featured        = false,
      projectNumber   = 0,
      icon            = '📄',
      thumbnail       = '',
      images          = [],
      order           = 0,
    } = body

    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'title, description and category are required' },
        { status: 400 }
      )
    }

    const finalSlug = slug || title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const duplicate = await prisma.project.findUnique({ where: { slug: finalSlug } })
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists — choose a different title or provide a custom slug' },
        { status: 409 }
      )
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug: finalSlug,
        description,
        longDescription,
        category,
        technologies,
        tags,
        githubLink,
        liveLink,
        status,
        featured,
        projectNumber,
        icon,
        thumbnail: thumbnail || images?.[0]?.url || images?.[0]?.imageData || '',
        images,
        order,
      },
    })

    return NextResponse.json({ success: true, data: project }, { status: 201 })
  } catch (error) {
    console.error('[Projects POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

// ─── PUT — Update Project ─────────────────────────────────────────────────────

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Project id required' }, { status: 400 })
    }

    const existing = await prisma.project.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    // Never let the client overwrite id/createdAt through spread
    delete (updateData as any).id
    delete (updateData as any).createdAt

    const updated = await prisma.project.update({
      where: { id },
      data: { ...updateData, updatedAt: new Date() },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[Projects PUT]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// ─── DELETE — Delete Project ──────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Project id required' }, { status: 400 })
    }

    const existing = await prisma.project.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    await prisma.project.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Project deleted' })
  } catch (error) {
    console.error('[Projects DELETE]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}