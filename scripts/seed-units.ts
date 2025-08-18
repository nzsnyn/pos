import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const seedUnits = async () => {
  console.log('🌱 Seeding units...')

  const defaultUnits = [
    {
      name: "Kilogram",
      symbol: "kg",
      description: "Unit berat standar internasional",
      isActive: true
    },
    {
      name: "Gram", 
      symbol: "g",
      description: "Unit berat dalam gram",
      isActive: true
    },
    {
      name: "Liter",
      symbol: "L", 
      description: "Unit volume untuk cairan",
      isActive: true
    },
    {
      name: "Mililiter",
      symbol: "ml",
      description: "Unit volume kecil untuk cairan",
      isActive: true
    },
    {
      name: "Pieces",
      symbol: "pcs",
      description: "Unit satuan buah/potong",
      isActive: true
    },
    {
      name: "Pack",
      symbol: "pack",
      description: "Unit kemasan",
      isActive: true
    },
    {
      name: "Box",
      symbol: "box", 
      description: "Unit kotak/dus",
      isActive: true
    },
    {
      name: "Meter",
      symbol: "m",
      description: "Unit panjang standar",
      isActive: true
    },
    {
      name: "Centimeter",
      symbol: "cm",
      description: "Unit panjang dalam sentimeter", 
      isActive: true
    },
    {
      name: "Lusin",
      symbol: "dzn",
      description: "Unit 12 buah",
      isActive: true
    }
  ]

  for (const unit of defaultUnits) {
    try {
      // Check if unit already exists
      const existing = await prisma.unit.findFirst({
        where: {
          OR: [
            { name: unit.name },
            { symbol: unit.symbol }
          ]
        }
      })

      if (!existing) {
        await prisma.unit.create({
          data: unit
        })
        console.log(`✅ Created unit: ${unit.name} (${unit.symbol})`)
      } else {
        console.log(`⚠️ Unit already exists: ${unit.name} (${unit.symbol})`)
      }
    } catch (error) {
      console.error(`❌ Error creating unit ${unit.name}:`, error)
    }
  }

  console.log('🎉 Units seeding completed!')
}

seedUnits()
  .catch((error) => {
    console.error('❌ Error seeding units:', error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
