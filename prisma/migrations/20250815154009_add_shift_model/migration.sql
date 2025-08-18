-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cashierId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "startBalance" REAL NOT NULL DEFAULT 0,
    "finalBalance" REAL,
    "totalSales" REAL NOT NULL DEFAULT 0,
    "totalCommission" REAL NOT NULL DEFAULT 0,
    "commissionRate" REAL NOT NULL DEFAULT 0.02,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "shifts_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
