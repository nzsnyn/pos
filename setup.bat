@echo off
echo 🚀 Setting up POS System...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js version 18 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node -v

REM Check if .env file exists
if not exist ".env" (
    echo 📁 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env file and set your JWT_SECRET before proceeding.
    echo    You can generate a secure secret with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    echo.
    pause
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies.
    pause
    exit /b 1
)

REM Generate Prisma client
echo 🗄️  Generating Prisma client...
npm run db:generate
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to generate Prisma client.
    pause
    exit /b 1
)

REM Setup database
echo 🗄️  Setting up database...
npm run db:push
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to setup database.
    pause
    exit /b 1
)

REM Seed database
echo 🌱 Seeding database with sample data...
npm run db:seed
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to seed database.
    pause
    exit /b 1
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 🔐 Default login credentials:
echo    Admin - Username: admin, Password: admin123
echo    Cashier - Username: kasir1, Password: kasir123
echo.
echo 🚀 To start the development server, run:
echo    npm run dev
echo.
echo 📚 Open http://localhost:3000 in your browser
echo.
echo Happy coding! 🎉
pause
