import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting to seed database...')

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.unit.deleteMany()
  await prisma.category.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()
  await prisma.shift.deleteMany()
  await prisma.setting.deleteMany()
  
  // Clear analytics data
  await prisma.dailyStats.deleteMany()
  await prisma.weeklyStats.deleteMany()
  await prisma.monthlyStats.deleteMany()
  await prisma.productStats.deleteMany()
  await prisma.customerStats.deleteMany()
  await prisma.cashierPerformance.deleteMany()
  await prisma.salesTarget.deleteMany()
  await prisma.inventoryAlert.deleteMany()

  // 1. Create Categories
  console.log('📂 Creating categories...')
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Minuman',
        description: 'Berbagai macam minuman segar'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Makanan Ringan',
        description: 'Snack dan cemilan'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Roti & Kue',
        description: 'Roti tawar, kue, dan pastry'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Kebutuhan Harian',
        description: 'Produk kebutuhan sehari-hari'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Elektronik',
        description: 'Aksesoris elektronik dan gadget'
      }
    })
  ])

  // 2. Create Units
  console.log('📏 Creating units...')
  const units = await Promise.all([
    prisma.unit.create({
      data: {
        name: 'Piece',
        symbol: 'pcs',
        description: 'Individual piece/item'
      }
    }),
    prisma.unit.create({
      data: {
        name: 'Kilogram',
        symbol: 'kg',
        description: 'Weight measurement in kilograms'
      }
    }),
    prisma.unit.create({
      data: {
        name: 'Gram',
        symbol: 'g',
        description: 'Weight measurement in grams'
      }
    }),
    prisma.unit.create({
      data: {
        name: 'Liter',
        symbol: 'L',
        description: 'Volume measurement in liters'
      }
    }),
    prisma.unit.create({
      data: {
        name: 'Mililiter',
        symbol: 'ml',
        description: 'Volume measurement in milliliters'
      }
    }),
    prisma.unit.create({
      data: {
        name: 'Box',
        symbol: 'box',
        description: 'Product sold by box'
      }
    }),
    prisma.unit.create({
      data: {
        name: 'Pack',
        symbol: 'pack',
        description: 'Product sold by pack'
      }
    })
  ])

  // 3. Create Suppliers
  console.log('🏪 Creating suppliers...')
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'CV Maju Bersama',
        phone: '021-12345678',
        address: 'Jl. Raya Kemang No. 123, Jakarta Selatan',
        storeName: 'Maju Bersama Distributor',
        isActive: true
      }
    }),
    prisma.supplier.create({
      data: {
        name: 'PT Sumber Rezeki',
        phone: '022-98765432',
        address: 'Jl. Asia Afrika No. 456, Bandung',
        storeName: 'Sumber Rezeki Trading',
        isActive: true
      }
    }),
    prisma.supplier.create({
      data: {
        name: 'Toko Serba Ada',
        phone: '031-11223344',
        address: 'Jl. Pemuda No. 789, Surabaya',
        storeName: 'Serba Ada Wholesale',
        isActive: true
      }
    }),
    prisma.supplier.create({
      data: {
        name: 'UD Berkah Jaya',
        phone: '0274-556677',
        address: 'Jl. Malioboro No. 321, Yogyakarta',
        storeName: 'Berkah Jaya Supplier',
        isActive: false
      }
    })
  ])

  // 4. Create Products
  console.log('📦 Creating products...')
  const products = [
    // Minuman
    { name: 'Kopi Arabica Premium', description: 'Kopi premium dengan kualitas terbaik', price: 25000, wholesalePrice: 18000, stock: 45, minStock: 10, categoryId: categories[0].id, unitId: units[6].id, barcode: '8901234567890', sku: 'KAP001' },
    { name: 'Teh Hijau Melati', description: 'Teh hijau dengan aroma melati yang menyegarkan', price: 15000, wholesalePrice: 11000, stock: 60, minStock: 15, categoryId: categories[0].id, unitId: units[6].id, barcode: '8901234567891', sku: 'THM001' },
    { name: 'Jus Jeruk Segar', description: 'Jus jeruk segar tanpa pengawet', price: 18000, wholesalePrice: 13000, stock: 35, minStock: 10, categoryId: categories[0].id, unitId: units[0].id, barcode: '8901234567892', sku: 'JJS001' },
    { name: 'Air Mineral 600ml', description: 'Air mineral murni dalam kemasan 600ml', price: 3000, wholesalePrice: 2200, stock: 150, minStock: 50, categoryId: categories[0].id, unitId: units[0].id, barcode: '8901234567893', sku: 'AM600' },
    { name: 'Susu UHT Coklat', description: 'Susu UHT rasa coklat yang lezat', price: 8000, wholesalePrice: 6000, stock: 80, minStock: 20, categoryId: categories[0].id, unitId: units[0].id, barcode: '8901234567894', sku: 'SUC001' },
    
    // Makanan Ringan
    { name: 'Keripik Kentang Original', description: 'Keripik kentang rasa original yang renyah', price: 12000, wholesalePrice: 8500, stock: 25, minStock: 8, categoryId: categories[1].id, unitId: units[6].id, barcode: '8901234567895', sku: 'KKO001' },
    { name: 'Biskuit Coklat', description: 'Biskuit dengan rasa coklat yang manis', price: 15000, wholesalePrice: 11000, stock: 40, minStock: 12, categoryId: categories[1].id, unitId: units[6].id, barcode: '8901234567896', sku: 'BC001' },
    { name: 'Kacang Tanah Asin', description: 'Kacang tanah goreng dengan rasa asin', price: 10000, wholesalePrice: 7500, stock: 30, minStock: 10, categoryId: categories[1].id, unitId: units[6].id, barcode: '8901234567897', sku: 'KTA001' },
    { name: 'Permen Mint', description: 'Permen dengan rasa mint yang menyegarkan', price: 5000, wholesalePrice: 3500, stock: 100, minStock: 25, categoryId: categories[1].id, unitId: units[6].id, barcode: '8901234567898', sku: 'PM001' },
    
    // Roti & Kue
    { name: 'Roti Tawar Gandum', description: 'Roti tawar dari gandum berkualitas', price: 8000, wholesalePrice: 6000, stock: 20, minStock: 5, categoryId: categories[2].id, unitId: units[0].id, barcode: '8901234567899', sku: 'RTG001' },
    { name: 'Donat Glazur', description: 'Donat manis dengan lapisan glazur', price: 6000, wholesalePrice: 4000, stock: 15, minStock: 5, categoryId: categories[2].id, unitId: units[0].id, barcode: '8901234567900', sku: 'DG001' },
    { name: 'Croissant Butter', description: 'Croissant dengan butter yang lembut', price: 12000, wholesalePrice: 8500, stock: 18, minStock: 6, categoryId: categories[2].id, unitId: units[0].id, barcode: '8901234567901', sku: 'CB001' },
    
    // Kebutuhan Harian
    { name: 'Sabun Mandi Herbal', description: 'Sabun mandi herbal dengan bahan alami', price: 15000, wholesalePrice: 11500, stock: 50, minStock: 15, categoryId: categories[3].id, unitId: units[0].id, barcode: '8901234567902', sku: 'SMH001' },
    { name: 'Shampoo Anti Ketombe', description: 'Shampoo khusus untuk mengatasi ketombe', price: 25000, wholesalePrice: 19000, stock: 35, minStock: 10, categoryId: categories[3].id, unitId: units[0].id, barcode: '8901234567903', sku: 'SAK001' },
    { name: 'Pasta Gigi Mint', description: 'Pasta gigi dengan rasa mint yang segar', price: 12000, wholesalePrice: 9000, stock: 45, minStock: 15, categoryId: categories[3].id, unitId: units[0].id, barcode: '8901234567904', sku: 'PGM001' },
    { name: 'Tissue Wajah', description: 'Tissue wajah lembut untuk kebutuhan harian', price: 8000, wholesalePrice: 6000, stock: 7, minStock: 10, categoryId: categories[3].id, unitId: units[5].id, barcode: '8901234567905', sku: 'TW001' },
    
    // Elektronik
    { name: 'Kabel USB-C 1m', description: 'Kabel USB-C berkualitas tinggi panjang 1 meter', price: 35000, wholesalePrice: 25000, stock: 22, minStock: 8, categoryId: categories[4].id, unitId: units[0].id, barcode: '8901234567906', sku: 'KUC001' },
    { name: 'Powerbank 10000mAh', description: 'Powerbank dengan kapasitas 10000mAh', price: 150000, wholesalePrice: 120000, stock: 8, minStock: 3, categoryId: categories[4].id, unitId: units[0].id, barcode: '8901234567907', sku: 'PB10K' },
    { name: 'Earphone Bluetooth', description: 'Earphone wireless dengan teknologi Bluetooth', price: 85000, wholesalePrice: 65000, stock: 12, minStock: 5, categoryId: categories[4].id, unitId: units[0].id, barcode: '8901234567908', sku: 'EBT001' },
    { name: 'Charger Quick Charge', description: 'Charger dengan teknologi fast charging', price: 45000, wholesalePrice: 32000, stock: 3, minStock: 5, categoryId: categories[4].id, unitId: units[0].id, barcode: '8901234567909', sku: 'CQC001' }
  ]

  const createdProducts: Array<{id: string, name: string, price: number}> = []
  for (const product of products) {
    const createdProduct = await prisma.product.create({
      data: product
    })
    createdProducts.push(createdProduct)
  }

  // 3. Create Users (Admin, Manager, Cashiers)
  console.log('👥 Creating users...')
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@tokosaya.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'System',
        role: 'ADMIN'
      }
    }),
    prisma.user.create({
      data: {
        username: 'manager1',
        email: 'manager@tokosaya.com',
        password: hashedPassword,
        firstName: 'Budi',
        lastName: 'Manager',
        role: 'MANAGER'
      }
    }),
    prisma.user.create({
      data: {
        username: 'kasir1',
        email: 'kasir1@tokosaya.com',
        password: hashedPassword,
        firstName: 'Siti',
        lastName: 'Nurhaliza',
        role: 'CASHIER'
      }
    }),
    prisma.user.create({
      data: {
        username: 'kasir2',
        email: 'kasir2@tokosaya.com',
        password: hashedPassword,
        firstName: 'Ahmad',
        lastName: 'Yusuf',
        role: 'CASHIER'
      }
    }),
    prisma.user.create({
      data: {
        username: 'kasir3',
        email: 'kasir3@tokosaya.com',
        password: hashedPassword,
        firstName: 'Maya',
        lastName: 'Sari',
        role: 'CASHIER'
      }
    })
  ])

  // 4. Create Customers
  console.log('👤 Creating customers...')
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Indra Pratama',
        email: 'indra@email.com',
        phone: '081234567890',
        address: 'Jl. Sudirman No. 123, Jakarta'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Dewi Lestari',
        email: 'dewi@email.com',
        phone: '081234567891',
        address: 'Jl. Thamrin No. 456, Jakarta'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Rudi Hartono',
        email: 'rudi@email.com',
        phone: '081234567892',
        address: 'Jl. Gatot Subroto No. 789, Jakarta'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Aisyah Putri',
        email: 'aisyah@email.com',
        phone: '081234567893',
        address: 'Jl. Kuningan No. 321, Jakarta'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Bambang Wijaya',
        email: 'bambang@email.com',
        phone: '081234567894',
        address: 'Jl. Senayan No. 654, Jakarta'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Sari Melati',
        phone: '081234567895',
        address: 'Jl. Kemang No. 987, Jakarta'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Doni Setiawan',
        phone: '081234567896',
        address: 'Jl. Blok M No. 147, Jakarta'
      }
    })
  ])

  // 5. Create realistic orders for testing
  console.log('🛒 Creating orders...')
  const paymentMethods = ['CASH', 'CARD', 'MOBILE_PAYMENT'] as const
  const today = new Date()
  
  // Helper function to create orders
  const createOrders = async (orderDate: Date, numOrders: number) => {
    for (let i = 0; i < numOrders; i++) {
      const hour = Math.floor(Math.random() * 12) + 8 // 8 AM to 8 PM
      const minute = Math.floor(Math.random() * 60)
      const orderTime = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate(), hour, minute)
      
      const orderNumber = `ORD-${orderTime.getFullYear()}${String(orderTime.getMonth() + 1).padStart(2, '0')}${String(orderTime.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
      
      // Random products (1-4 items per order)
      const numItems = Math.floor(Math.random() * 4) + 1
      const orderItems = []
      let subtotal = 0
      
      for (let j = 0; j < numItems; j++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)]
        const quantity = Math.floor(Math.random() * 3) + 1
        const itemSubtotal = product.price * quantity
        
        orderItems.push({
          productId: product.id,
          quantity: quantity,
          price: product.price,
          subtotal: itemSubtotal
        })
        
        subtotal += itemSubtotal
      }
      
      const tax = Math.round(subtotal * 0.1)
      const discount = Math.random() < 0.2 ? Math.round(subtotal * 0.05) : 0
      const total = subtotal + tax - discount
      
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: Math.random() < 0.6 ? customers[Math.floor(Math.random() * customers.length)].id : null,
          cashierId: users[Math.floor(Math.random() * 3) + 2].id, // Random cashier
          subtotal,
          tax,
          discount,
          total,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          paymentStatus: 'COMPLETED',
          status: 'COMPLETED',
          createdAt: orderTime
        }
      })

      // Create order items
      for (const item of orderItems) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            ...item
          }
        })
      }
    }
  }

  // Create orders for different periods
  // Today: 15 orders
  await createOrders(today, 15)
  
  // Yesterday: 20 orders
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  await createOrders(yesterday, 20)
  
  // Last 7 days: 10 orders per day
  for (let i = 2; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    await createOrders(date, 10)
  }
  
  // Last 30 days: 8 orders per day
  for (let i = 7; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    await createOrders(date, 8)
  }

  // 6. Create Settings
  console.log('⚙️  Creating settings...')
  await Promise.all([
    prisma.setting.create({
      data: { key: 'store_name', value: 'Toko Saya POS' }
    }),
    prisma.setting.create({
      data: { key: 'tax_rate', value: '10' }
    }),
    prisma.setting.create({
      data: { key: 'currency', value: 'IDR' }
    }),
    prisma.setting.create({
      data: { key: 'low_stock_threshold', value: '10' }
    })
  ])

  console.log('✅ Database seeded successfully!')
  console.log(`
📊 Summary:
- ${categories.length} categories created
- ${createdProducts.length} products created  
- ${users.length} users created
- ${customers.length} customers created
- ~400 orders created across 30 days
- Settings configured

🔐 Login credentials:
- Admin: admin / password123
- Manager: manager1 / password123  
- Cashier: kasir1 / password123
- Cashier: kasir2 / password123
- Cashier: kasir3 / password123

📈 Ready to test dashboard features:
- Transaction statistics by period
- Sales revenue tracking  
- Profit calculations
- Product performance
- Low stock alerts (some products have stock < 10)
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
