const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting to seed database...')

  // Check if data already exists
  const existingCategories = await prisma.category.count()
  if (existingCategories > 0) {
    console.log('📊 Database already contains data. Skipping seeding.')
    console.log('Use "npx prisma migrate reset --force" to clear and reseed')
    return
  }

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

  console.log(`✅ Created ${categories.length} categories`)

  // 2. Create Products
  console.log('📦 Creating products...')
  const products = [
    // Minuman
    { name: 'Kopi Arabica Premium', price: 25000, wholesalePrice: 18000, stock: 45, categoryId: categories[0].id, barcode: '8901234567890' },
    { name: 'Teh Hijau Melati', price: 15000, wholesalePrice: 11000, stock: 60, categoryId: categories[0].id, barcode: '8901234567891' },
    { name: 'Jus Jeruk Segar', price: 18000, wholesalePrice: 13000, stock: 35, categoryId: categories[0].id, barcode: '8901234567892' },
    { name: 'Air Mineral 600ml', price: 3000, wholesalePrice: 2200, stock: 150, categoryId: categories[0].id, barcode: '8901234567893' },
    { name: 'Susu UHT Coklat', price: 8000, wholesalePrice: 6000, stock: 80, categoryId: categories[0].id, barcode: '8901234567894' },
    
    // Makanan Ringan
    { name: 'Keripik Kentang Original', price: 12000, wholesalePrice: 8500, stock: 25, categoryId: categories[1].id, barcode: '8901234567895' },
    { name: 'Biskuit Coklat', price: 15000, wholesalePrice: 11000, stock: 40, categoryId: categories[1].id, barcode: '8901234567896' },
    { name: 'Kacang Tanah Asin', price: 10000, wholesalePrice: 7500, stock: 30, categoryId: categories[1].id, barcode: '8901234567897' },
    { name: 'Permen Mint', price: 5000, wholesalePrice: 3500, stock: 100, categoryId: categories[1].id, barcode: '8901234567898' },
    
    // Roti & Kue
    { name: 'Roti Tawar Gandum', price: 8000, wholesalePrice: 6000, stock: 20, categoryId: categories[2].id, barcode: '8901234567899' },
    { name: 'Donat Glazur', price: 6000, wholesalePrice: 4000, stock: 15, categoryId: categories[2].id, barcode: '8901234567900' },
    { name: 'Croissant Butter', price: 12000, wholesalePrice: 8500, stock: 18, categoryId: categories[2].id, barcode: '8901234567901' },
    
    // Kebutuhan Harian
    { name: 'Sabun Mandi Herbal', price: 15000, wholesalePrice: 11500, stock: 50, categoryId: categories[3].id, barcode: '8901234567902' },
    { name: 'Shampoo Anti Ketombe', price: 25000, wholesalePrice: 19000, stock: 35, categoryId: categories[3].id, barcode: '8901234567903' },
    { name: 'Pasta Gigi Mint', price: 12000, wholesalePrice: 9000, stock: 45, categoryId: categories[3].id, barcode: '8901234567904' },
    { name: 'Tissue Wajah', price: 8000, wholesalePrice: 6000, stock: 7, categoryId: categories[3].id, barcode: '8901234567905' },
    
    // Elektronik
    { name: 'Kabel USB-C 1m', price: 35000, wholesalePrice: 25000, stock: 22, categoryId: categories[4].id, barcode: '8901234567906' },
    { name: 'Powerbank 10000mAh', price: 150000, wholesalePrice: 120000, stock: 8, categoryId: categories[4].id, barcode: '8901234567907' },
    { name: 'Earphone Bluetooth', price: 85000, wholesalePrice: 65000, stock: 12, categoryId: categories[4].id, barcode: '8901234567908' },
    { name: 'Charger Quick Charge', price: 45000, wholesalePrice: 32000, stock: 3, categoryId: categories[4].id, barcode: '8901234567909' }
  ]

  const createdProducts = []
  for (const product of products) {
    const createdProduct = await prisma.product.create({
      data: {
        ...product,
        description: `Produk berkualitas tinggi - ${product.name}`
      }
    })
    createdProducts.push(createdProduct)
  }

  console.log(`✅ Created ${createdProducts.length} products`)

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

  console.log(`✅ Created ${users.length} users`)

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

  console.log(`✅ Created ${customers.length} customers`)

  // 5. Create orders
  console.log('🛒 Creating orders...')
  const paymentMethods = ['CASH', 'CARD', 'MOBILE_PAYMENT']
  const today = new Date()
  let totalOrders = 0
  
  // Helper function to create orders
  const createOrders = async (orderDate, numOrders) => {
    for (let i = 0; i < numOrders; i++) {
      const hour = Math.floor(Math.random() * 12) + 8 // 8 AM to 8 PM
      const minute = Math.floor(Math.random() * 60)
      const orderTime = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate(), hour, minute)
      
      const orderNumber = `ORD-${orderTime.getFullYear()}${String(orderTime.getMonth() + 1).padStart(2, '0')}${String(orderTime.getDate()).padStart(2, '0')}-${String(orderTime.getHours()).padStart(2, '0')}${String(orderTime.getMinutes()).padStart(2, '0')}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`
      
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
      
      totalOrders++
    }
    console.log(`   📅 Created ${numOrders} orders for ${orderDate.toDateString()}`)
  }

  // Create orders for different periods
  await createOrders(today, 15)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  await createOrders(yesterday, 20)
  
  // Last 7 days
  for (let i = 2; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    await createOrders(date, 10)
  }
  
  // Last 30 days
  for (let i = 7; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    await createOrders(date, 8)
  }

  console.log(`✅ Created total ${totalOrders} orders`)

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
- ${totalOrders} orders created across 30 days
- 4 settings configured

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
