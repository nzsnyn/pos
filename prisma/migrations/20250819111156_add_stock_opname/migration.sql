-- CreateTable
CREATE TABLE "stock_opnames" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opnameNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "checkedItems" INTEGER NOT NULL DEFAULT 0,
    "totalDifference" INTEGER NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL,
    "completedDate" DATETIME,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stock_opnames_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stock_opname_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stockOpnameId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "systemStock" INTEGER NOT NULL,
    "physicalStock" INTEGER,
    "difference" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "checkedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stock_opname_items_stockOpnameId_fkey" FOREIGN KEY ("stockOpnameId") REFERENCES "stock_opnames" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "stock_opname_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_opnames_opnameNumber_key" ON "stock_opnames"("opnameNumber");
