/**
 * /api/projects
 *
 * Full CRUD for CraftCode portfolio projects.
 * Stack: Next.js 14 App Router + Supabase
 * Auth: getSession() — same as settings route (JWT cookie)
 *
 * GET    /api/projects            → all published projects (public)
 * GET    /api/projects?all=true   → all projects incl. drafts (admin)
 * GET    /api/projects?id=xxx     → single project by id (admin/edit page)
 * POST   /api/projects            → create project (admin only)
 * PUT    /api/projects            → update project (admin only)
 * DELETE /api/projects?id=xxx     → delete project (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { projectDB } from '@/lib/db'
import { getSession } from '@/lib/auth'

// ─── GET — Fetch Projects ─────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id       = searchParams.get('id')
    const showAll  = searchParams.get('all') === 'true'

    // Single project fetch (used by the edit page)
    if (id) {
      const project = await projectDB.getById(id)
      if (!project) {
        return NextResponse.json(
          { success: false, error: 'Project not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: project })
    }

    // Get all projects
    const projects = await projectDB.getAll()
    
    // Filter if not showing all
    let filteredProjects = projects
    if (!showAll) {
      filteredProjects = projects.filter(p => p.status === 'published')
    }

    return NextResponse.json({ success: true, data: filteredProjects })
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
      technologies = [],
      tags = [],
      githubLink = '',
      liveLink = '',
      status = 'draft',
      featured = false,
      icon = '📄',
      thumbnail = '',
      images = [],
      order = 0,
    } = body

    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'title, description and category are required' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const finalSlug = slug || title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check for duplicate slug
    const allProjects = await projectDB.getAll()
    const existing = allProjects.find(p => p.slug === finalSlug)
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists — choose a different title or provide a custom slug' },
        { status: 409 }
      )
    }

    // Create project
    const newProject = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      featured: featured || false,
      icon: icon || '📄',
      thumbnail: thumbnail || (images.length > 0 ? images[0].url || images[0].imageData || '' : ''),
      images: images || [],
      order: order || 0,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await projectDB.save(newProject)

    return NextResponse.json({ success: true, data: newProject }, { status: 201 })
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
      return NextResponse.json(
        { success: false, error: 'Project id required' },
        { status: 400 }
      )
    }

    // Check if project exists
    const existing = await projectDB.getById(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    // Update project
    const updatedProject = {
      ...existing,
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    await projectDB.save(updatedProject)

    return NextResponse.json({ success: true, data: updatedProject })
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
      return NextResponse.json(
        { success: false, error: 'Project id required' },
        { status: 400 }
      )
    }

    // Check if project exists
    const existing = await projectDB.getById(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    await projectDB.delete(id)

    return NextResponse.json({ success: true, message: 'Project deleted' })
  } catch (error) {
    console.error('[Projects DELETE]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}






// /**
//  * /api/projects
//  *
//  * Full CRUD for CraftCode portfolio projects.
//  * Stack: Next.js 14 App Router + Supabase
//  * Auth: getSession() — same as settings route (JWT cookie)
//  *
//  * GET    /api/projects            → all published projects (public)
//  * GET    /api/projects?all=true   → all projects incl. drafts (admin)
//  * GET    /api/projects?id=xxx     → single project by id (admin/edit page)
//  * POST   /api/projects            → create project (admin only)
//  * PUT    /api/projects            → update project (admin only)
//  * DELETE /api/projects?id=xxx     → delete project (admin only)
//  */

// import { NextRequest, NextResponse } from 'next/server'
// import { supabase } from '@/lib/supabase/client'
// import { getSession } from '@/lib/auth'

// // ─── GET — Fetch Projects ─────────────────────────────────────────────────────

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url)
//     const id       = searchParams.get('id')
//     const showAll  = searchParams.get('all') === 'true'
//     const featured = searchParams.get('featured') === 'true'
//     const category = searchParams.get('category')

//     // Single project fetch (used by the edit page)
//     if (id) {
//       const { data: project, error } = await supabase
//         .from('projects')
//         .select('*')
//         .eq('id', id)
//         .single()

//       if (error || !project) {
//         return NextResponse.json(
//           { success: false, error: 'Project not found' },
//           { status: 404 }
//         )
//       }

//       // Map Supabase fields to match frontend expectations
//       const mappedProject = {
//         id: project.id,
//         title: project.title,
//         slug: project.slug,
//         description: project.description,
//         longDescription: project.long_description,
//         category: project.category,
//         technologies: project.technologies || [],
//         tags: project.tags || [],
//         githubLink: project.github_link,
//         liveLink: project.live_link,
//         status: project.status,
//         featured: false,
//         projectNumber: 0,
//         icon: '📄',
//         thumbnail: project.thumbnail_url || (project.image_urls && project.image_urls[0]) || '',
//         images: (project.image_urls || []).map((url: string) => ({ url, imageData: url })),
//         order: project.sort_order || 0,
//         createdAt: project.created_at,
//         updatedAt: project.updated_at,
//       }

//       return NextResponse.json({ success: true, data: mappedProject })
//     }

//     // Build query
//     let query = supabase
//       .from('projects')
//       .select('*')

//     // Apply filters
//     if (!showAll) {
//       query = query.eq('status', 'published')
//     }

//     if (category) {
//       query = query.eq('category', category)
//     }

//     // Note: Supabase doesn't have a 'featured' column by default
//     // If you need featured, add it to your table
//     if (featured) {
//       // You would need a 'featured' column in Supabase
//       // query = query.eq('featured', true)
//       console.warn('Featured filter is not implemented in Supabase yet')
//     }

//     // Order by sort_order
//     query = query.order('sort_order', { ascending: true })

//     const { data: projects, error } = await query

//     if (error) {
//       console.error('[Projects GET] Supabase error:', error)
//       throw error
//     }

//     // Map Supabase fields to match frontend expectations
//     const mappedProjects = (projects || []).map((project: any) => ({
//       id: project.id,
//       title: project.title,
//       slug: project.slug,
//       description: project.description,
//       longDescription: project.long_description,
//       category: project.category,
//       technologies: project.technologies || [],
//       tags: project.tags || [],
//       githubLink: project.github_link,
//       liveLink: project.live_link,
//       status: project.status,
//       featured: false,
//       projectNumber: 0,
//       icon: '📄',
//       thumbnail: project.thumbnail_url || (project.image_urls && project.image_urls[0]) || '',
//       images: (project.image_urls || []).map((url: string) => ({ url, imageData: url })),
//       order: project.sort_order || 0,
//       createdAt: project.created_at,
//       updatedAt: project.updated_at,
//     }))

//     return NextResponse.json({ success: true, data: mappedProjects })
//   } catch (error) {
//     console.error('[Projects GET]', error)
//     return NextResponse.json(
//       { success: false, error: 'Failed to fetch projects' },
//       { status: 500 }
//     )
//   }
// }

// // ─── POST — Create Project ────────────────────────────────────────────────────

// export async function POST(req: NextRequest) {
//   try {
//     const session = await getSession()
//     if (!session) {
//       return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
//     }

//     const body = await req.json()
//     const {
//       title,
//       slug,
//       description,
//       longDescription = '',
//       category,
//       technologies = [],
//       tags = [],
//       githubLink = '',
//       liveLink = '',
//       status = 'draft',
//       featured = false,
//       projectNumber = 0,
//       icon = '📄',
//       thumbnail = '',
//       images = [],
//       order = 0,
//     } = body

//     if (!title || !description || !category) {
//       return NextResponse.json(
//         { success: false, error: 'title, description and category are required' },
//         { status: 400 }
//       )
//     }

//     // Generate slug if not provided
//     const finalSlug = slug || title
//       .toLowerCase()
//       .trim()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/(^-|-$)/g, '')

//     // Check for duplicate slug
//     const { data: existing, error: checkError } = await supabase
//       .from('projects')
//       .select('slug')
//       .eq('slug', finalSlug)
//       .maybeSingle()

//     if (checkError && checkError.code !== 'PGRST116') {
//       console.error('[Projects POST] Slug check error:', checkError)
//     }

//     if (existing) {
//       return NextResponse.json(
//         { success: false, error: 'Slug already exists — choose a different title or provide a custom slug' },
//         { status: 409 }
//       )
//     }

//     // Prepare image URLs
//     const imageUrls = images.map((img: any) => img.url || img.imageData || img).filter(Boolean)
//     const thumbnailUrl = thumbnail || imageUrls[0] || ''

//     // Prepare data for Supabase
//     const supabaseData = {
//       title,
//       slug: finalSlug,
//       description,
//       long_description: longDescription,
//       category,
//       technologies,
//       tags,
//       github_link: githubLink,
//       live_link: liveLink,
//       status,
//       image_urls: imageUrls,
//       thumbnail_url: thumbnailUrl,
//       sort_order: order || 0,
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//     }

//     const { data: project, error } = await supabase
//       .from('projects')
//       .insert([supabaseData])
//       .select()
//       .single()

//     if (error) {
//       console.error('[Projects POST] Supabase error:', error)
//       throw error
//     }

//     // Map back to frontend format
//     const mappedProject = {
//       id: project.id,
//       title: project.title,
//       slug: project.slug,
//       description: project.description,
//       longDescription: project.long_description,
//       category: project.category,
//       technologies: project.technologies || [],
//       tags: project.tags || [],
//       githubLink: project.github_link,
//       liveLink: project.live_link,
//       status: project.status,
//       featured: false,
//       projectNumber: 0,
//       icon: '📄',
//       thumbnail: project.thumbnail_url || (project.image_urls && project.image_urls[0]) || '',
//       images: (project.image_urls || []).map((url: string) => ({ url, imageData: url })),
//       order: project.sort_order || 0,
//       createdAt: project.created_at,
//       updatedAt: project.updated_at,
//     }

//     return NextResponse.json({ success: true, data: mappedProject }, { status: 201 })
//   } catch (error) {
//     console.error('[Projects POST]', error)
//     return NextResponse.json(
//       { success: false, error: 'Failed to create project' },
//       { status: 500 }
//     )
//   }
// }

// // ─── PUT — Update Project ─────────────────────────────────────────────────────

// export async function PUT(req: NextRequest) {
//   try {
//     const session = await getSession()
//     if (!session) {
//       return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
//     }

//     const body = await req.json()
//     const { id, ...updateData } = body

//     if (!id) {
//       return NextResponse.json(
//         { success: false, error: 'Project id required' },
//         { status: 400 }
//       )
//     }

//     // Check if project exists
//     const { data: existing, error: findError } = await supabase
//       .from('projects')
//       .select('id')
//       .eq('id', id)
//       .single()

//     if (findError || !existing) {
//       return NextResponse.json(
//         { success: false, error: 'Project not found' },
//         { status: 404 }
//       )
//     }

//     // Prepare update data
//     const supabaseUpdate: Record<string, any> = {
//       updated_at: new Date().toISOString(),
//     }

//     // Map fields to Supabase schema
//     if (updateData.title !== undefined) supabaseUpdate.title = updateData.title
//     if (updateData.slug !== undefined) supabaseUpdate.slug = updateData.slug
//     if (updateData.description !== undefined) supabaseUpdate.description = updateData.description
//     if (updateData.longDescription !== undefined) supabaseUpdate.long_description = updateData.longDescription
//     if (updateData.category !== undefined) supabaseUpdate.category = updateData.category
//     if (updateData.technologies !== undefined) supabaseUpdate.technologies = updateData.technologies
//     if (updateData.tags !== undefined) supabaseUpdate.tags = updateData.tags
//     if (updateData.githubLink !== undefined) supabaseUpdate.github_link = updateData.githubLink
//     if (updateData.liveLink !== undefined) supabaseUpdate.live_link = updateData.liveLink
//     if (updateData.status !== undefined) supabaseUpdate.status = updateData.status
//     if (updateData.order !== undefined) supabaseUpdate.sort_order = updateData.order

//     // Handle images
//     if (updateData.images !== undefined) {
//       const imageUrls = updateData.images.map((img: any) => img.url || img.imageData || img).filter(Boolean)
//       supabaseUpdate.image_urls = imageUrls
//       supabaseUpdate.thumbnail_url = updateData.thumbnail || imageUrls[0] || ''
//     }

//     if (updateData.thumbnail !== undefined) {
//       supabaseUpdate.thumbnail_url = updateData.thumbnail
//     }

//     const { data: project, error } = await supabase
//       .from('projects')
//       .update(supabaseUpdate)
//       .eq('id', id)
//       .select()
//       .single()

//     if (error) {
//       console.error('[Projects PUT] Supabase error:', error)
//       throw error
//     }

//     // Map back to frontend format
//     const mappedProject = {
//       id: project.id,
//       title: project.title,
//       slug: project.slug,
//       description: project.description,
//       longDescription: project.long_description,
//       category: project.category,
//       technologies: project.technologies || [],
//       tags: project.tags || [],
//       githubLink: project.github_link,
//       liveLink: project.live_link,
//       status: project.status,
//       featured: false,
//       projectNumber: 0,
//       icon: '📄',
//       thumbnail: project.thumbnail_url || (project.image_urls && project.image_urls[0]) || '',
//       images: (project.image_urls || []).map((url: string) => ({ url, imageData: url })),
//       order: project.sort_order || 0,
//       createdAt: project.created_at,
//       updatedAt: project.updated_at,
//     }

//     return NextResponse.json({ success: true, data: mappedProject })
//   } catch (error) {
//     console.error('[Projects PUT]', error)
//     return NextResponse.json(
//       { success: false, error: 'Failed to update project' },
//       { status: 500 }
//     )
//   }
// }

// // ─── DELETE — Delete Project ──────────────────────────────────────────────────

// export async function DELETE(req: NextRequest) {
//   try {
//     const session = await getSession()
//     if (!session) {
//       return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
//     }

//     const { searchParams } = new URL(req.url)
//     const id = searchParams.get('id')

//     if (!id) {
//       return NextResponse.json(
//         { success: false, error: 'Project id required' },
//         { status: 400 }
//       )
//     }

//     // Check if project exists
//     const { data: existing, error: findError } = await supabase
//       .from('projects')
//       .select('id')
//       .eq('id', id)
//       .single()

//     if (findError || !existing) {
//       return NextResponse.json(
//         { success: false, error: 'Project not found' },
//         { status: 404 }
//       )
//     }

//     const { error } = await supabase
//       .from('projects')
//       .delete()
//       .eq('id', id)

//     if (error) {
//       console.error('[Projects DELETE] Supabase error:', error)
//       throw error
//     }

//     return NextResponse.json({ success: true, message: 'Project deleted' })
//   } catch (error) {
//     console.error('[Projects DELETE]', error)
//     return NextResponse.json(
//       { success: false, error: 'Failed to delete project' },
//       { status: 500 }
//     )
//   }
// }