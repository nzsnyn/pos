# POS System (Point of Sale)

A comprehensive Point of Sale system built with Next.js 15, TypeScript, Prisma, and SQLite. This system provides complete inventory management, sales tracking, user management, and analytics for retail businesses.

## 🚀 Features

- **🛒 Point of Sale Interface** - Modern, intuitive checkout system
- **📦 Inventory Management** - Product, category, and stock management
- **👥 User Management** - Role-based access control (Admin/Cashier)
- **💰 Sales Tracking** - Transaction history and reporting
- **⏰ Shift Management** - Cashier shift tracking and history
- **📊 Analytics Dashboard** - Sales analytics and performance metrics
- **🏪 Multi-supplier Support** - Supplier and procurement management
- **📱 Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT with secure cookies
- **Icons**: Lucide React
- **Charts**: Recharts

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** or **pnpm**
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/nzsnyn/pos.git
cd pos
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (change this to a secure random string in production)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Next.js Environment
NODE_ENV="development"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push database schema (creates SQLite database)
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🔑 Default Login Credentials

After seeding the database, you can log in with these default accounts:

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@tokosaya.com`
- **Role**: Administrator (full access)

### Cashier Account
- **Username**: `kasir1`
- **Password**: `kasir123`
- **Email**: `kasir1@tokosaya.com`
- **Role**: Cashier (limited access)

## 📚 Available Scripts

### Development Scripts
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Scripts
```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio (database GUI)
```

### Database Cleanup Scripts
```bash
npm run db:clear         # Interactive database cleanup (preserves admin)
npm run db:clear-auto    # Automatic database cleanup (preserves admin)
npm run db:clear-force   # Force database cleanup (legacy)
```

## 🏗️ Project Structure

```
pos/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # Page components
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── pos/              # POS-specific components
│   └── ui/               # UI components (shadcn/ui)
├── contexts/             # React contexts
├── lib/                  # Utility functions
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding script
├── scripts/              # Utility scripts
└── public/               # Static assets
```

## 🔐 User Roles & Permissions

### Admin Role
- Full system access
- User management
- Product and inventory management
- Supplier management
- Reports and analytics
- System settings
- All POS functions

### Cashier Role
- POS system access
- View own transaction history
- View own shift history
- Stock opname (view only)
- Limited dashboard access

## 🗄️ Database Information

- **Database**: SQLite (stored as `prisma/dev.db`)
- **ORM**: Prisma
- **Migrations**: Automatic with Prisma

### Key Database Tables
- `users` - System users (admin/cashier)
- `products` - Product inventory
- `categories` - Product categories
- `orders` - Sales transactions
- `shifts` - Cashier shift tracking
- `suppliers` - Supplier information
- `customers` - Customer database

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `JWT_SECRET` | JWT signing secret | Required |
| `NODE_ENV` | Environment mode | `development` |

### JWT Configuration
- **Algorithm**: HS256
- **Expiration**: Session-based (no expiration)
- **Storage**: HTTP-only secure cookies

## 🚀 Production Deployment

### 1. Build the Application
```bash
npm run build
```

### 2. Environment Setup
Create a production `.env` file with:
- Strong `JWT_SECRET`
- Appropriate `DATABASE_URL`
- `NODE_ENV=production`

### 3. Database Setup
```bash
npm run db:push
npm run db:seed
```

### 4. Start Production Server
```bash
npm run start
```

## 🧪 Development Tips

### Database Management
- Use `npm run db:studio` to visually manage your database
- Run `npm run db:clear-auto` to reset database while keeping admin account
- Always backup your database before major changes

### Adding New Features
1. Update Prisma schema if needed (`prisma/schema.prisma`)
2. Run `npm run db:push` to apply schema changes
3. Regenerate Prisma client: `npm run db:generate`
4. Add API routes in `app/api/`
5. Create UI components as needed

### Debugging
- Check browser console for frontend errors
- Check terminal output for backend/API errors
- Use Prisma Studio to inspect database state
- Enable Next.js debug mode in development

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🆘 Troubleshooting

### Common Issues

**Database connection errors:**
```bash
npm run db:push
npm run db:generate
```

**Missing dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build errors:**
```bash
npm run lint
npm run build
```

**Port already in use:**
```bash
# Kill process on port 3000 (Windows)
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### Database Reset
If you encounter database issues:
```bash
# Backup important data first!
npm run db:clear-auto  # Clears all data except admin
npm run db:seed        # Restores sample data
```

## 📞 Support

For support or questions:
1. Check the troubleshooting section above
2. Review the database and API logs
3. Ensure all environment variables are set correctly
4. Verify Node.js version compatibility

---

**Happy coding! 🎉**
