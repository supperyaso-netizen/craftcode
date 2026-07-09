import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin user create பண்றோம்
  const hashedPassword = await bcrypt.hash('Admin', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@craftcode.com' },
    update: {},
    create: {
      email: 'admin@craftcode.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Default settings
  const defaultSettings = [
    { key: 'siteName', value: 'CraftCode', type: 'text' },
    { key: 'siteTitle', value: 'CraftCode - Premium Digital Studio', type: 'text' },
    { key: 'siteDescription', value: 'Crafting brands people remember', type: 'text' },
    { key: 'email', value: 'hello@craftcode.com', type: 'text' },
    { key: 'phone', value: '+1 234 567 890', type: 'text' },
    { key: 'address', value: '123 Design Street, Creative City', type: 'text' },
    { key: 'instagram', value: 'https://instagram.com/craftcode', type: 'url' },
    { key: 'twitter', value: 'https://twitter.com/craftcode', type: 'url' },
    { key: 'linkedin', value: 'https://linkedin.com/company/craftcode', type: 'url' },
    { key: 'youtube', value: 'https://youtube.com/craftcode', type: 'url' },
  ]

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('✅ Default settings created')

  // Sample projects
  const projects = [
    {
      title: 'Brand Identity Design',
      slug: 'brand-identity-design',
      category: 'Graphic Design',
      description: 'Complete branding package with modern design',
      technologies: ['Figma', 'Illustrator', 'Photoshop'],
      tags: ['branding', 'design'],
      status: 'published',
      featured: true,
      order: 0,
    },
    {
      title: 'Full Stack E-commerce',
      slug: 'full-stack-ecommerce',
      category: 'Web Development',
      description: 'Complete e-commerce platform with payment integration',
      technologies: ['Next.js', 'TypeScript', 'MongoDB', 'Stripe'],
      tags: ['fullstack', 'ecommerce'],
      status: 'published',
      featured: true,
      order: 1,
    },
    {
      title: 'Portfolio Website',
      slug: 'portfolio-website',
      category: 'Full Stack',
      description: 'Modern portfolio website with CMS integration',
      technologies: ['React', 'Tailwind', 'Prisma'],
      tags: ['portfolio', 'web'],
      status: 'draft',
      featured: false,
      order: 2,
    },
  ]

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: project,
    })
  }

  console.log('✅ Sample projects created')
  console.log('\n🎉 Seeding complete!')
  console.log('📧 Login: admin@craftcode.com')
  console.log('🔑 Password: admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())