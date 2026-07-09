require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const newPassword = process.argv[3]

  if (!email || !newPassword) {
    console.error('Usage: node update-password.js <email> <newPassword>')
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  const updatedUser = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  })

  console.log('Password updated for:', updatedUser.email)
}

main()
  .catch((e) => console.error('Error:', e))
  .finally(async () => {
    await prisma.$disconnect()
  })