const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Checking products with wholesale prices...')
  
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      wholesalePrice: true
    },
    take: 5
  })
  
  console.log('Products found:')
  products.forEach(product => {
    console.log(`${product.name}: retail=${product.price}, wholesale=${product.wholesalePrice}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
