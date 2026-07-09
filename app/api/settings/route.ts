import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const settings = await prisma.setting.findMany()
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value
      return acc
    }, {} as Record<string, string>)
    return NextResponse.json(settingsMap)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const updates = await Promise.all(
      Object.entries(data).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), type: 'text' },
        })
      )
    )

    return NextResponse.json({ success: true, count: updates.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}