/*
  Warnings:

  - You are about to drop the column `commissionRate` on the `shifts` table. All the data in the column will be lost.
  - You are about to drop the column `totalCommission` on the `shifts` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_shifts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cashierId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "startBalance" REAL NOT NULL DEFAULT 0,
    "finalBalance" REAL,
    "totalSales" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "shifts_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_shifts" ("cashierId", "createdAt", "endTime", "finalBalance", "id", "isActive", "notes", "startBalance", "startTime", "totalSales", "updatedAt") SELECT "cashierId", "createdAt", "endTime", "finalBalance", "id", "isActive", "notes", "startBalance", "startTime", "totalSales", "updatedAt" FROM "shifts";
DROP TABLE "shifts";
ALTER TABLE "new_shifts" RENAME TO "shifts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
