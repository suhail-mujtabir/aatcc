# Supabase Database Migration Instructions

## Overview
This directory contains SQL migrations for the NFC Attendance System database schema.

## Migration: 001_initial_schema.sql
**Created:** December 2, 2025  
**Status:** Ready to execute

### What it creates:
- ✅ 5 tables: `students`, `admins`, `events`, `registrations`, `attendance`
- ✅ Indexes for optimized queries
- ✅ Triggers for auto-updating timestamps
- ✅ Row Level Security (RLS) policies
- ✅ Constraints and foreign keys

---

## How to Apply This Migration

### Option 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase project:**
   - Open https://supabase.com/dashboard
   - Select your project: `edwqquekskihrduobgew`

2. **Navigate to SQL Editor:**
   - Click on **SQL Editor** in the left sidebar

3. **Run the migration:**
   - Click **New Query**
   - Copy the entire contents of `001_initial_schema.sql`
   - Paste into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)

4. **Verify tables were created:**
   - Go to **Table Editor** in the left sidebar
   - You should see: `students`, `admins`, `events`, `registrations`, `attendance`

---

### Option 2: Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref edwqquekskihrduobgew

# Apply migration
supabase db push
```

---

## Verification Checklist

After running the migration, verify:

- [ ] All 5 tables exist in Table Editor
- [ ] Indexes are created (check Database → Indexes)
- [ ] RLS is enabled on all tables (Table Editor → RLS tab shows "Enabled")
- [ ] Policies are created (Table Editor → Policies tab)
- [ ] Trigger function `update_updated_at_column()` exists

---

## Next Steps After Migration

1. **Create an admin account** (via API route or SQL):
   ```sql
   -- Example: Create default admin (use bcrypt hash for password)
   INSERT INTO admins (admin_id, password_hash, name)
   VALUES ('admin', '$2b$10$YOUR_HASHED_PASSWORD_HERE', 'System Administrator');
   ```

2. **Test the database connection** in your Next.js app

3. **Import student data** (if you have existing student records)

4. **Create your first event** to test the system

---

## Rollback (if needed)

To undo this migration:

```sql
-- Drop all tables in reverse order (due to foreign keys)
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

---

## Database Schema Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   admins    │         │    events    │         │  students   │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ id (PK)     │◄────┐   │ id (PK)      │   ┌────►│ id (PK)     │
│ admin_id    │     │   │ name         │   │     │ student_id  │
│ password_hash│     └───│ created_by   │   │     │ name        │
│ name        │         │ start_time   │   │     │ card_uid    │
└─────────────┘         │ end_time     │   │     │ email       │
                        │ status       │   │     │ password_hash│
                        └──────────────┘   │     └─────────────┘
                               │           │            │
                               │           │            │
                        ┌──────▼───────────▼──────┐    │
                        │    registrations        │    │
                        ├─────────────────────────┤    │
                        │ id (PK)                 │    │
                        │ student_id (FK) ────────┼────┘
                        │ event_id (FK)           │
                        └─────────────────────────┘
                               │
                               │
                        ┌──────▼───────────────────┐
                        │      attendance          │
                        ├──────────────────────────┤
                        │ id (PK)                  │
                        │ student_id (FK)          │
                        │ event_id (FK)            │
                        │ checked_in_at            │
                        └──────────────────────────┘
```

---

## Support

If you encounter any issues:
1. Check Supabase logs in Dashboard → Logs
2. Verify environment variables in `.env.local`
3. Ensure service role key has proper permissions

---

**Happy coding! 🚀**
