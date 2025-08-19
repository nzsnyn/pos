# Database Cleanup Scripts

This directory contains scripts to safely clean the database while preserving admin accounts.

## Available Scripts

### 1. `clear-database-safe.ts` (Interactive)
- **Usage**: `npm run db:clear`
- **Description**: Interactive script that asks for confirmation before proceeding
- **Features**: 
  - Shows admin accounts that will be preserved
  - Lists data to be deleted
  - Requires explicit confirmation steps
  - Safe for production use

### 2. `clear-database-auto.ts` (Automatic)
- **Usage**: `npm run db:clear-auto`
- **Description**: Automatic script that runs without user interaction
- **Features**: 
  - Shows admin accounts that will be preserved
  - Lists data to be deleted
  - Proceeds automatically without confirmation
  - Good for development environments

### 3. `clear-database.ts` (Force)
- **Usage**: `npm run db:clear-force`
- **Description**: Basic cleanup script (legacy)
- **Features**: 
  - Simple cleanup without detailed logging
  - Less comprehensive than other scripts

## What Gets Deleted

The cleanup scripts remove:
- ✅ All orders and order items
- ✅ All products and categories
- ✅ All suppliers and customers
- ✅ All shifts (cashier shifts)
- ✅ All procurement records
- ✅ All stock opname records
- ✅ All analytics data (daily/weekly/monthly stats)
- ✅ All non-admin users (cashiers, etc.)

## What Gets Preserved

The cleanup scripts preserve:
- ✅ Admin users (role: 'ADMIN')
- ✅ Database schema and structure

## Safety Features

1. **Admin Protection**: Scripts will not run if no admin users are found
2. **Foreign Key Handling**: Deletes data in correct order to avoid constraint violations
3. **Logging**: Comprehensive logging of what is being deleted
4. **Count Verification**: Shows before/after counts to verify cleanup

## Usage Examples

```bash
# Interactive cleanup (recommended for production)
npm run db:clear

# Automatic cleanup (good for development)
npm run db:clear-auto

# Force cleanup (legacy)
npm run db:clear-force
```

## After Cleanup

After running the cleanup:
1. Only admin user(s) remain in the database
2. Database is in a clean state for fresh data
3. You may want to seed new data: `npm run db:seed`
4. All relationships and constraints are intact

## Security Notes

- These scripts are destructive and cannot be undone
- Always backup your database before running in production
- Test on development environment first
- Ensure at least one admin user exists before running

## Error Handling

The scripts handle:
- Foreign key constraint violations
- Missing admin users
- Database connection issues
- Partial cleanup failures

If a script fails partway through, you may need to:
1. Check the error message
2. Fix any constraint issues
3. Re-run the script
