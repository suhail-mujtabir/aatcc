# NFC Attendance System - Database Schema Reference

## Quick Reference

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://edwqquekskihrduobgew.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (⚠️ Keep secret!)
DEVICE_API_KEY=0eb480a2... (⚠️ Keep secret!)
```

---

## Tables Overview

### 1. `students`
**Purpose:** Student accounts and profiles

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `student_id` | TEXT | Unique student ID (e.g., "23-01-002") |
| `name` | TEXT | Full name |
| `email` | TEXT | Email address (optional) |
| `password_hash` | TEXT | Hashed password |
| `card_uid` | TEXT | NFC card UID (unique) |
| `bio` | TEXT | Student bio |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- `idx_students_card_uid` - Fast NFC lookups
- `idx_students_student_id` - Fast login lookups

---

### 2. `admins`
**Purpose:** Admin accounts (separate from students)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `admin_id` | TEXT | Admin username |
| `password_hash` | TEXT | Hashed password |
| `name` | TEXT | Full name |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

---

### 3. `events`
**Purpose:** Events that students can attend

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Event name |
| `description` | TEXT | Event description |
| `start_time` | TIMESTAMPTZ | Start time |
| `end_time` | TIMESTAMPTZ | End time |
| `status` | TEXT | 'upcoming', 'active', 'completed' |
| `created_by` | UUID | Admin who created it (FK) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `deleted_at` | TIMESTAMPTZ | Soft delete timestamp |

**Indexes:**
- `idx_events_status` - Filter by status
- `idx_events_start_time` - Sort by time
- `idx_one_active_event` - Only one active event allowed

---

### 4. `registrations`
**Purpose:** Track which students registered for which events

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `student_id` | UUID | Student (FK) |
| `event_id` | UUID | Event (FK) |
| `registered_at` | TIMESTAMPTZ | Registration timestamp |

**Constraints:**
- UNIQUE(`student_id`, `event_id`) - No duplicate registrations

**Indexes:**
- `idx_registrations_student_event` - Fast lookups

---

### 5. `attendance`
**Purpose:** Track actual attendance via NFC check-in

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `student_id` | UUID | Student (FK) |
| `event_id` | UUID | Event (FK) |
| `checked_in_at` | TIMESTAMPTZ | Check-in timestamp |

**Constraints:**
- UNIQUE(`student_id`, `event_id`) - No duplicate check-ins

**Indexes:**
- `idx_attendance_student_event` - Fast lookups
- `idx_attendance_event` - Count attendees per event

---

## Row Level Security (RLS) Policies

### Students Table
- ✅ Students can view/update their own profile
- ✅ Admins can view all (via service role key)

### Events Table
- ✅ Anyone can view non-deleted events
- ✅ Only admins can create/update/delete (via service role key)

### Registrations Table
- ✅ Students can view/create/delete their own registrations
- ✅ Admins can view all (via service role key)

### Attendance Table
- ✅ Students can view their own attendance
- ✅ Only NFC device can create records (via service role key + DEVICE_API_KEY)

### Admins Table
- ✅ Only accessible via service role key

---

## Common Queries

### Get all events
```sql
SELECT * FROM events 
WHERE deleted_at IS NULL 
ORDER BY start_time DESC;
```

### Get student by card UID
```sql
SELECT * FROM students 
WHERE card_uid = 'A1B2C3D4';
```

### Get attendance count for an event
```sql
SELECT COUNT(*) FROM attendance 
WHERE event_id = 'event-uuid-here';
```

### Get registered students for an event
```sql
SELECT s.* 
FROM students s
JOIN registrations r ON s.id = r.student_id
WHERE r.event_id = 'event-uuid-here';
```

### Get students who registered but didn't attend
```sql
SELECT s.* 
FROM students s
JOIN registrations r ON s.id = r.student_id
LEFT JOIN attendance a ON s.id = a.student_id AND r.event_id = a.event_id
WHERE r.event_id = 'event-uuid-here' 
  AND a.id IS NULL;
```

---

## Helper Functions in `/lib/supabase.ts`

### For Client Components
```typescript
import { createClient } from '@/lib/supabase'
const supabase = createClient()
```

### For Server Components/Actions
```typescript
import { createServerSupabaseClient } from '@/lib/supabase'
const supabase = await createServerSupabaseClient()
```

### For Admin Operations
```typescript
import { createAdminClient } from '@/lib/supabase'
const supabase = createAdminClient() // ⚠️ Full access!
```

---

## Status Flow

### Event Status
```
upcoming → active → completed
```

### Student Journey
```
1. Register account (students table)
2. Activate NFC card (update card_uid)
3. Register for event (registrations table)
4. Check in with NFC (attendance table)
```

---

## Important Notes

1. **Password Hashing:** Always use bcrypt or Argon2 for password hashing
2. **Service Role Key:** Never expose in client-side code
3. **DEVICE_API_KEY:** Used to authenticate NFC device requests
4. **Soft Deletes:** Events use `deleted_at` instead of hard deletes
5. **Unique Constraints:** Prevent duplicate registrations and check-ins

---

## API Endpoints (to be implemented)

- `POST /api/auth/login` - Student login
- `POST /api/auth/admin-login` - Admin login
- `POST /api/students/activate-card` - Link NFC card to student
- `POST /api/events/register` - Register for event
- `POST /api/attendance/check-in` - NFC check-in (requires DEVICE_API_KEY)
- `GET /api/events` - List events
- `GET /api/events/[id]/attendance` - Get attendance for event

---

**Ready to build! 🎉**
