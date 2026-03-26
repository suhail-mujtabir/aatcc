# Automatic Certificate System Upgrade Guide

## 🎉 What's New?

Your certificate distribution system has been upgraded to **fully automatic mode**!

### Before (Manual Configuration):
```
For EACH event:
1. Create event in dashboard
2. Open Google Sheets "Config" tab
3. Copy Event UUID from database
4. Paste row: Event ID | Template ID | Subject | Body Doc ID
5. Go back to dashboard → Send certificates
```

### After (Zero Configuration):
```
For EACH event:
1. Create event in dashboard
2. Dashboard → Send certificates ✅
```

**Result:** Certificate template configured once, works for all events automatically!

---

## 📋 What Changed?

### Database
- **NEW:** `certificate_templates` table stores template configuration
- Template includes: Slides ID, email subject template, email body doc ID
- One default template applies to all events
- Event name automatically interpolated into subject: `Certificate of Completion: {{event}}`

### Backend (Next.js API)
- Queries `certificate_templates` table on every certificate send
- Passes `certificateConfig` object to Google Apps Script webhook
- No need to manage Google Sheets Config anymore

### Google Apps Script
- Accepts `certificateConfig` from webhook payload
- Falls back to Config sheet if `certificateConfig` not provided (backward compatible)
- Legacy mode: Config sheet still works for manual overrides

### Documentation
- `WEBHOOK_SETUP_QUICK_START.md` updated (15 min vs 30 min setup)
- `VIEW_REPORTS.md` updated with new architecture
- Config sheet marked as optional/deprecated

---

## 🚀 Migration Steps

### Step 1: Run Database Migration (5 minutes)

1. **Update Template ID in Migration:**
   ```bash
   # Edit: supabase/migrations/003_certificate_templates.sql
   # Line 42: Replace with YOUR actual Google Slides template ID
   slides_template_id: '1__fQ2Nt-FlBzb0xsabGEZRm0HxhVLBlN0JqorT3msnY'
   ```

2. **Get Your Template ID:**
   - Open your certificate template in Google Slides
   - Copy ID from URL: `https://docs.google.com/presentation/d/[THIS-PART]/edit`

3. **Run Migration:**
   ```bash
   # Option A: Supabase Dashboard
   # SQL Editor → Paste migration → Run

   # Option B: Supabase CLI
   supabase db push
   ```

4. **Verify:**
   ```sql
   SELECT * FROM certificate_templates WHERE is_default = true;
   -- Should return 1 row with your template ID
   ```

---

### Step 2: Update Google Apps Script (5 minutes)

The Apps Script code has already been updated in `google-apps-script/certificate-system.gs`.

1. Open your Google Apps Script project
2. Replace entire code with updated version from the file
3. **Key changes:**
   - `doPost()` now extracts `certificateConfig` from payload
   - Falls back to `getEventConfig()` if config not in payload
   - `processCertificates()` supports both `emailBodyHtml` and `emailBodyDocId`

4. **Test changes:**
   - Click **Run** → Select `doPost`
   - Check for syntax errors
   - **Deploy new version:** Deploy → Manage deployments → Edit → Version: New version

---

### Step 3: Verify Environment Variables (2 minutes)

Ensure these are set in Vercel:

```bash
GOOGLE_APPS_SCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbx.../exec
GOOGLE_APPS_SCRIPT_API_KEY=prod_sk_8d9c798b50670c2784dc11890b5c4c0d0d8e53ede244e62d91ee77f149bbe6e2
```

**No changes needed** - same variables as before.

---

### Step 4: Test End-to-End (5 minutes)

1. **Create Test Event:**
   - Dashboard → Create Event: "Test Certificate System"
   - Add a few registrations with valid emails
   - Mark event as "Completed"

2. **Send Test Certificates:**
   - Dashboard → View Reports
   - Click "Test Certificate System"
   - Review attendance list
   - Click **"Send Certificates"**

3. **Verify Success:**
   - Check dashboard shows: "✓ Successfully sent X certificates"
   - Check Gmail "Sent" folder for emails
   - Open certificate PDF attachment
   - Verify {{name}}, {{event}}, {{date}} replaced correctly

4. **Check Logs:**
   - Open Google Sheets → "Logs" tab
   - Verify request logged with event ID and attendee count

---

## ✅ Success Checklist

- [ ] Database migration ran successfully
- [ ] `certificate_templates` table has 1 default template
- [ ] Template ID matches your Google Slides template
- [ ] Apps Script updated with new code
- [ ] Apps Script deployed as new version
- [ ] Environment variables unchanged in Vercel
- [ ] Test event certificates sent successfully
- [ ] Email received with correct PDF
- [ ] Google Sheets Logs tab shows request

---

## 🔄 Backward Compatibility

### Config Sheet Still Works!

If you have events configured in Google Sheets Config:
- They will continue to work (legacy mode)
- Apps Script checks for `certificateConfig` in payload first
- Falls back to Config sheet if not found
- **Recommendation:** Migrate to automatic mode, delete Config rows

### Migration Path:
1. Run database migration (creates default template)
2. Update Apps Script (handles both modes)
3. Test new events work automatically
4. Optional: Delete Config sheet rows (no longer needed)

---

## 🎯 Benefits

### For Admins
✅ **Zero Google Sheets management** - Never open Config sheet again  
✅ **Consistent templates** - Same design for all events automatically  
✅ **Faster workflow** - 3 fewer steps per event  
✅ **Less errors** - No manual Event ID copy-paste  
✅ **Easy setup** - New admins don't need Google Sheets training  

### For Developers
✅ **Database-driven config** - Easy to add admin UI later  
✅ **Version controlled** - Template config in migrations  
✅ **Flexible architecture** - Easy to add per-event templates  
✅ **Backward compatible** - Legacy mode still supported  
✅ **Better logging** - Template usage tracked in database  

---

## 🚧 Future Enhancements

### Phase 2: Admin Template UI
Build admin page to manage templates without SQL:
- View all templates
- Create new templates (upload Slides URL)
- Set default template
- Per-event template override

### Phase 3: Event-Specific Templates
Add `certificate_template_id` to events table:
- Workshops use "Workshop Certificate" template
- Competitions use "Award Certificate" template
- Webinars use "Participation Certificate" template

### Phase 4: Dynamic Placeholders
Support custom placeholders beyond {{name}}, {{event}}, {{date}}:
- {{studentId}}, {{department}}, {{year}}
- {{rank}} for competitions
- {{instructor}} for workshops

---

## 🆘 Troubleshooting

### Error: "Certificate template not configured"

**Cause:** Migration not run or template not set as default

**Solution:**
```sql
-- Check if table exists
SELECT * FROM certificate_templates;

-- Check default template
SELECT * FROM certificate_templates WHERE is_default = true;

-- If empty, insert default template
INSERT INTO certificate_templates (
  name, slides_template_id, email_subject_template, is_default
) VALUES (
  'Default Event Certificate',
  'YOUR_SLIDES_TEMPLATE_ID',
  'Certificate of Completion: {{event}}',
  true
);
```

---

### Error: "Event configuration not found" (Legacy Error)

**Cause:** Apps Script not updated or webhook receiving old payload format

**Solution:**
1. Verify Apps Script code updated with `certificateConfig` handling
2. Deploy new version of Apps Script
3. Clear Vercel cache: Dashboard → Deployments → Redeploy

---

### Certificates Use Old Template

**Cause:** Migration ran but old template ID still in database

**Solution:**
```sql
-- Update default template ID
UPDATE certificate_templates
SET slides_template_id = 'YOUR_NEW_TEMPLATE_ID'
WHERE is_default = true;

-- Verify update
SELECT slides_template_id FROM certificate_templates WHERE is_default = true;
```

---

### Config Sheet Still Required

**Cause:** Apps Script not finding `certificateConfig` in payload

**Debug:**
1. Check Apps Script logs: Executions → View logs
2. Look for: "Using automatic certificate config from payload"
3. If you see "falling back to Config sheet (legacy mode)":
   - Next.js API not passing `certificateConfig`
   - Verify migration ran successfully
   - Check API logs for template query errors

---

## 📞 Support

**Documentation:**
- `WEBHOOK_SETUP_QUICK_START.md` - Quick setup guide
- `VIEW_REPORTS.md` - Full system documentation
- `supabase/migrations/003_certificate_templates.sql` - Database schema

**Logs:**
- Vercel: Dashboard → Functions → Logs
- Apps Script: Extensions → Apps Script → Executions
- Supabase: Dashboard → Logs → Postgres Logs

**Community:**
- GitHub Issues: Report bugs or feature requests
- Team Chat: Ask in #tech-support channel

---

**Upgrade completed! Enjoy your fully automatic certificate system! 🎉**
