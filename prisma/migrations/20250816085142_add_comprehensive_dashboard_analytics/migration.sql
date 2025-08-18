-- CreateTable
CREATE TABLE "daily_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "shiftId" TEXT,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "totalSales" REAL NOT NULL DEFAULT 0,
    "totalProfit" REAL NOT NULL DEFAULT 0,
    "totalCustomers" INTEGER NOT NULL DEFAULT 0,
    "totalItemsSold" INTEGER NOT NULL DEFAULT 0,
    "averageOrderValue" REAL NOT NULL DEFAULT 0,
    "cashSales" REAL NOT NULL DEFAULT 0,
    "cardSales" REAL NOT NULL DEFAULT 0,
    "mobilePaymentSales" REAL NOT NULL DEFAULT 0,
    "topSellingProductId" TEXT,
    "topSellingProductQty" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "daily_stats_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "daily_stats_topSellingProductId_fkey" FOREIGN KEY ("topSellingProductId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "weekly_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekStart" DATETIME NOT NULL,
    "weekEnd" DATETIME NOT NULL,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "totalSales" REAL NOT NULL DEFAULT 0,
    "totalProfit" REAL NOT NULL DEFAULT 0,
    "totalCustomers" INTEGER NOT NULL DEFAULT 0,
    "totalItemsSold" INTEGER NOT NULL DEFAULT 0,
    "averageOrderValue" REAL NOT NULL DEFAULT 0,
    "bestSalesDay" DATETIME,
    "bestSalesDayAmount" REAL NOT NULL DEFAULT 0,
    "topSellingProductId" TEXT,
    "topSellingProductQty" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "weekly_stats_topSellingProductId_fkey" FOREIGN KEY ("topSellingProductId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "monthly_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "totalSales" REAL NOT NULL DEFAULT 0,
    "totalProfit" REAL NOT NULL DEFAULT 0,
    "totalCustomers" INTEGER NOT NULL DEFAULT 0,
    "totalItemsSold" INTEGER NOT NULL DEFAULT 0,
    "averageOrderValue" REAL NOT NULL DEFAULT 0,
    "bestSalesDay" DATETIME,
    "bestSalesDayAmount" REAL NOT NULL DEFAULT 0,
    "topSellingProductId" TEXT,
    "topSellingProductQty" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "monthly_stats_topSellingProductId_fkey" FOREIGN KEY ("topSellingProductId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "quantitySold" INTEGER NOT NULL DEFAULT 0,
    "revenue" REAL NOT NULL DEFAULT 0,
    "profit" REAL NOT NULL DEFAULT 0,
    "averagePrice" REAL NOT NULL DEFAULT 0,
    "stockAtStart" INTEGER NOT NULL DEFAULT 0,
    "stockAtEnd" INTEGER NOT NULL DEFAULT 0,
    "reorderAlert" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_stats_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customer_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" REAL NOT NULL DEFAULT 0,
    "averageOrderValue" REAL NOT NULL DEFAULT 0,
    "lastOrderDate" DATETIME,
    "firstOrderDate" DATETIME,
    "favoriteProductId" TEXT,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "customerType" TEXT NOT NULL DEFAULT 'REGULAR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "customer_stats_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "customer_stats_favoriteProductId_fkey" FOREIGN KEY ("favoriteProductId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cashier_performance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cashierId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "totalSales" REAL NOT NULL DEFAULT 0,
    "averageTransactionTime" REAL NOT NULL DEFAULT 0,
    "customerSatisfaction" REAL,
    "errorsCount" INTEGER NOT NULL DEFAULT 0,
    "hoursWorked" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cashier_performance_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sales_targets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetType" TEXT NOT NULL,
    "targetPeriod" TEXT NOT NULL,
    "targetValue" REAL NOT NULL,
    "currentValue" REAL NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "cashierId" TEXT,
    "productId" TEXT,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sales_targets_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "sales_targets_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "sales_targets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "inventory_alerts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_stats_date_key" ON "daily_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_stats_weekStart_key" ON "weekly_stats"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_stats_month_year_key" ON "monthly_stats"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "product_stats_productId_date_key" ON "product_stats"("productId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "customer_stats_customerId_key" ON "customer_stats"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "cashier_performance_cashierId_date_key" ON "cashier_performance"("cashierId", "date");
