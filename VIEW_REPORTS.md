# View Reports & Automated Certificate Distribution System

## 📋 Overview

This system enables administrators to view attendance reports for completed events and automatically send personalized digital certificates to attendees via email. **The system is now fully automatic** - certificate templates are configured once in the database, and admins never need to touch Google Sheets!

**✨ NEW: Zero-Config Mode** - Just set up once and send certificates with one click forever!

**Last Updated:** January 3, 2026 (Updated with automatic certificate configuration)

---

## 🎯 Features

✅ **View Attendance Reports** - See detailed list of attendees for completed events  
✅ **Download CSV** - Export attendance data for records/analysis  
✅ **Automated Certificates** - Generate personalized certificates from Google Slides templates  
✅ **Bulk Email Sending** - Send certificates to all attendees with one click  
✅ **🆕 Zero Google Sheets Management** - Template configured once in database, no manual event setup  
✅ **🆕 Same Template for All Events** - Consistent branding, automatic event name interpolation  
✅ **No Storage Costs** - Certificates generated on-the-fly, not stored  
✅ **Edu Email Benefits** - Use .edu account for unlimited email sending  
✅ **Secure Webhook** - API key authentication prevents unauthorized access  
✅ **Rate Limiting** - Prevents abuse and stays within Gmail limits  

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN WORKFLOW                                              │
├─────────────────────────────────────────────────────────────┤
│ 1. Admin goes to "View Reports" in dashboard               │
│ 2. Clicks on completed event                                │
│ 3. Views attendance list (with emails highlighted)          │
│ 4. Options:                                                  │
│    A. Download CSV for records                              │
│    B. Click "Send Certificates" button                      │
┌─────────────────────────────────────────────────────────────┐
│ BACKEND PROCESSING                                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Next.js API fetches event & attendee data from Supabase │
│ 2. Queries default certificate template from database      │
│ 3. Interpolates event name into email subject              │
│ 4. Validates all emails are present                         │
│ 5. Calls Google Apps Script webhook with:                  │
│    - Attendee data                                          │
│    - Certificate configuration (template IDs, subject)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ GOOGLE APPS SCRIPT AUTOMATION                               │
├─────────────────────────────────────────────────────────────┤
│ 1. Verifies API key (security)                             │
│ 2. Uses certificateConfig from payload (no Sheet needed!)  │
│ 3. For each attendee:                                       │
│    - Copy certificate template (Google Slides)              │
│    - Replace {{name}}, {{event}}, {{date}} placeholders    │
│    - Convert to PDF                                         │
│    - Send email with PDF attachment                         │
│    - Delete temporary slide                                 │
│ 4. Returns results (sent/failed counts)                     │
└─────────────────────────────────────────────────────────────┘
│ 4. Returns results (sent/failed counts)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ ADMIN FEEDBACK                                              │
├─────────────────────────────────────────────────────────────┤
│ "✓ Successfully sent 150 certificates"                      │
│ Sent: 148 | Failed: 2                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Guide (One-Time Configuration)

### **Prerequisites**

Before starting, complete the database migration:
```bash
# Run in Supabase SQL Editor or via CLI
# File: supabase/migrations/003_certificate_templates.sql
```

This creates the `certificate_templates` table and seeds your default template configuration.

**⚠️ UPDATE YOUR TEMPLATE ID:** Edit the migration file to replace `1__fQ2Nt-FlBzb0xsabGEZRm0HxhVLBlN0JqorT3msnY` with your actual Google Slides template ID before running!

---

### **Part 1: Google Apps Script Setup (20 minutes)**

#### Step 1: Create Google Sheet for Logs (Optional but Recommended)

1. Open Google Sheets (using your .edu account for unlimited emails)
2. Create a new spreadsheet: "AATCC Certificate System"
3. Create 3 sheets for monitoring (Config sheet no longer needed!):

**Sheet 1: "Logs"**
```
| Timestamp | API Key | Event ID | Event Name | Attendee Count | Status |
|-----------|---------|----------|------------|----------------|--------|
```

**Sheet 2: "Security"**
```
| Timestamp | Origin | API Key | Alert Type |
|-----------|--------|---------|------------|
```

**Sheet 3: "Errors"**
```
| Timestamp | Function Name | Error Message | Stack Trace |
|-----------|--------------|---------------|-------------|
```

#### Step 2: Create Certificate Template (Google Slides)

1. Open Google Slides
2. Create a new presentation
3. Design your certificate with these placeholders:
   - `{{name}}` - Will be replaced with student name
   - `{{event}}` - Will be replaced with event name
   - `{{date}}` - Will be replaced with event date
4. Example layout:
   ```
   ┌─────────────────────────────────────┐
   │     CERTIFICATE OF PARTICIPATION    │
   │                                      │
   │     This is to certify that         │
   │            {{name}}                  │
   │     has successfully participated    │
   │     in the event:                   │
   │            {{event}}                 │
   │     held on {{date}}                │
   │                                      │
   │     [Signatures]                     │
   └─────────────────────────────────────┘
   ```
5. **Save and get Template ID:**
   - File → Share → Copy link
   - Extract ID from URL: `https://docs.google.com/presentation/d/[THIS-IS-THE-ID]/edit`

#### Step 3: Create Email Template (Google Docs)

1. Open Google Docs
2. Create email template with HTML formatting:
   ```html
   Dear {{name}},

   Congratulations on successfully completing {{event}}!

   We are pleased to present you with your certificate of participation. 
   Please find it attached to this email.

   Your contribution and participation made this event a success.

   Best regards,
   AATCC AUST Student Chapter

   ---
   Student ID: {{studentId}}
   ```
3. **Get Document ID** from URL: `https://docs.google.com/document/d/[THIS-IS-THE-ID]/edit`

#### Step 4: Deploy Apps Script

1. From your Google Sheet, go to: **Extensions → Apps Script**
2. Delete default `Code.gs` content
3. Copy entire content from `google-apps-script/certificate-system.gs`
4. Paste into Apps Script editor
5. **Configure API Keys:**
   ```javascript
   const API_KEYS = {
     production: 'prod_sk_YOUR_GENERATED_KEY_HERE',
     staging: 'staging_sk_YOUR_GENERATED_KEY_HERE'
   };
   ```
   
   **Generate secure API key:**
   - Open terminal
   - Run: `node -e "console.log('prod_sk_' + require('crypto').randomBytes(32).toString('hex'))"`
   - Copy the output
   - Paste into `API_KEYS.production`

6. **Update Configuration:**
   ```javascript
   const ALLOWED_ORIGINS = [
     'https://aatcc.vercel.app',  // Your production domain
     'https://your-custom-domain.com',
     // 'http://localhost:3000'  // Remove in production
   ];

   const EMAIL_CONFIG = {
     senderName: 'AATCC AUST Student Chapter',
     replyTo: 'aatcc@aust.edu',  // Your chapter email
     maxEmailsPerMinute: 50
   };
   ```

7. **Deploy as Web App:**
   - Click "Deploy" → "New deployment"
   - Type: **Web app**
   - Description: "Certificate Distribution System"
   - Execute as: **Me** (your .edu account)
   - Who has access: **Anyone**
   - Click "Deploy"
   - **Copy the Web App URL** (you'll need this for Next.js)
   - Example: `https://script.google.com/macros/s/AKfycbx.../exec`

8. **Grant Permissions:**
   - Click "Authorize access"
   - Choose your .edu Google account
   - Click "Advanced" → "Go to [project name] (unsafe)"
   - Click "Allow"

---

### **Part 2: Next.js Configuration (5 minutes)**

#### Step 1: Add Environment Variables

Edit `.env.local` (or add to Vercel environment variables):

```bash
# Google Apps Script Webhook Configuration
GOOGLE_APPS_SCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbxXXXXXXXXXXX/exec
GOOGLE_APPS_SCRIPT_API_KEY=prod_sk_1a2b3c4d5e6f7g8h9i0j_your_generated_key_here
```

**For Vercel:**
1. Go to Project Settings → Environment Variables
2. Add both variables
3. Redeploy your project

#### Step 2: Verify Implementation

Files created in this implementation:
- ✅ `app/api/admin/events/[id]/attendance/route.ts` - Get attendance data
- ✅ `app/api/admin/events/[id]/send-certificates/route.ts` - Send certificates
- ✅ `app/admin/reports/page.tsx` - View reports list
- ✅ `app/admin/reports/[id]/page.tsx` - Individual event report
- ✅ `google-apps-script/certificate-system.gs` - Apps Script code

---

### **Part 3: Add Event Configuration (Per Event - 1 minute)**

For each event you want to send certificates for:

1. Get Event ID from database (UUID format)
2. Open your "Config" sheet
3. Add a new row:
   ```
   | Event ID (from DB) | Slides Template ID | Email Subject | Doc Template ID |
   | a83f8592-e3c0-... | 1abc123xyz...     | Congratulations! | 1def456uvw...  |
   ```

**Example:**
```
| Event ID | Certificate Template ID | Email Subject | Email Body Doc ID |
|----------|------------------------|---------------|-------------------|
| a83f8592-e3c0-4c8a-84aa-8ebb8df2e4ba | 1hG9x2Zy5Kw8Nq3Rp7Vt | Congratulations on Workshop Completion! | 1mL4j8Fd6Hs2Qw9Ex5Cy |
```

---

## 📱 Usage Workflow

### **For Admins:**

1. **Navigate to Reports:**
   - Login to admin dashboard
   - Click "View Reports" in sidebar

2. **View Completed Events:**
   - See grid of all completed events
   - Each card shows event name, date, duration

3. **Open Event Report:**
   - Click on an event card
   - View full attendance list in table format
   - See count of attendees with/without emails

4. **Download CSV (Optional):**
   - Click "Download CSV" button
   - CSV includes: Name, Email, Student ID, Event Name, Check-in Time
   - Use for records or external processing

5. **Send Certificates:**
   - Click "Send Certificates (150)" button
   - Confirm dialog appears
   - System processes in background
   - Progress shown: "Sending..."
   - Result displayed: "✓ Successfully sent 148 certificates (Sent: 148 | Failed: 2)"

---

## 🔧 Troubleshooting

### **Issue: "Certificate service not configured"**

**Cause:** Environment variables missing  
**Fix:**
- Verify `.env.local` has both variables
- Check Vercel environment variables
- Redeploy after adding variables

---

### **Issue: "Event configuration not found"**

**Cause:** Event not added to Config sheet  
**Fix:**
- Open Config sheet in Google Sheets
- Add row with Event ID and template IDs
- Make sure Event ID matches exactly (copy from database)

---

### **Issue: "Unauthorized: Invalid API key"**

**Cause:** API key mismatch  
**Fix:**
- Check `.env.local` API key matches Apps Script `API_KEYS.production`
- Regenerate key if needed
- Update in both places

---

### **Issue: Emails not sending**

**Possible Causes:**
1. **Gmail daily limit reached**
   - .edu accounts: 1500/day
   - Regular Gmail: 100/day
   - **Fix:** Wait 24 hours or use .edu account

2. **Invalid email addresses**
   - **Fix:** Check students table, ensure emails are valid

3. **Apps Script permissions revoked**
   - **Fix:** Redeploy Apps Script, re-authorize

4. **Template IDs incorrect**
   - **Fix:** Verify template IDs in Config sheet
   - Make sure they're accessible by the Apps Script account

---

### **Issue: "Request timeout"**

**Cause:** Large batch (500+ students) taking too long  
**Fix:**
- Apps Script runs in background, emails may still be sending
- Check Gmail "Sent" folder
- Check Apps Script "Logs" sheet
- For very large batches, consider splitting into multiple requests

---

### **Issue: Certificate formatting broken**

**Cause:** Placeholders not replaced correctly  
**Fix:**
- Ensure placeholders in template are exactly: `{{name}}`, `{{event}}`, `{{date}}`
- No extra spaces or formatting inside braces
- Use plain text boxes, not tables

---

## 📊 Monitoring & Logs

### **Apps Script Logs Sheet**

Check the "Logs" sheet to see:
- When certificates were sent
- How many attendees
- Which API key was used
- Success/failure status

### **Security Sheet**

Check for suspicious activity:
- Unauthorized origins
- Invalid API key attempts
- Rate limit violations

### **Errors Sheet**

See detailed error logs:
- Function where error occurred
- Error message
- Stack trace for debugging

### **Apps Script Execution Log**

View real-time logs:
1. Open Apps Script editor
2. Click "Executions" (clock icon)
3. See each webhook call with:
   - Timestamp
   - Duration
   - Success/failure
   - Detailed logs

---

## 🔒 Security Best Practices

1. **Never commit API keys to Git**
   - Use environment variables only
   - Add `.env.local` to `.gitignore`

2. **Rotate API keys regularly**
   - Generate new key every 3-6 months
   - Update in both Apps Script and Next.js

3. **Monitor Security sheet**
   - Check weekly for suspicious activity
   - Block origins if needed

4. **Use .edu account**
   - Higher email limits
   - Better deliverability
   - Institutional trust

5. **Review Apps Script permissions**
   - Only grant necessary scopes
   - Re-authorize if suspicious activity

---

## 💰 Cost Analysis

### **Free Tier Limits:**

| Service | Free Tier | Usage | Status |
|---------|-----------|-------|--------|
| Vercel Functions | 100 GB-hours/month | ~1s per request | ✅ Plenty |
| Supabase Database | Unlimited queries | 3 queries per request | ✅ No issue |
| Google Apps Script | Free (unlimited) | Certificate generation | ✅ Free |
| Gmail (.edu) | 1500 emails/day | Certificate sending | ✅ Ample |
| Google Drive | 15 GB storage | Temporary slides (deleted) | ✅ Zero impact |

**Conclusion:** System works perfectly on all free tiers!

---

## 📈 Scalability

| Attendees | Processing Time | Email Time | Total Time |
|-----------|----------------|------------|------------|
| 50 | ~30 seconds | ~1 minute | ~1.5 minutes |
| 100 | ~1 minute | ~2 minutes | ~3 minutes |
| 200 | ~2 minutes | ~4 minutes | ~6 minutes |
| 500 | ~5 minutes | ~10 minutes | ~15 minutes |

**Notes:**
- Apps Script has 6-minute execution limit for web apps
- For 500+ attendees, split into multiple batches
- System automatically implements rate limiting

---

## 🎨 Customization Guide

### **Multiple Certificate Templates:**

For different event types (workshops, competitions, etc.):

1. Create separate Google Slides templates
2. Add multiple rows in Config sheet with different template IDs
3. Each event can use its own template

Example:
```
| Event ID | Template ID (Workshop) | Subject | Body Doc |
| Event ID | Template ID (Competition) | Subject | Body Doc |
```

### **Custom Email Bodies:**

Create different Google Docs for different event types:
- Workshop completion email
- Competition winner email
- Participation certificate email

### **Branding:**

Update in Apps Script:
```javascript
const EMAIL_CONFIG = {
  senderName: 'Your Chapter Name',
  replyTo: 'your-email@domain.com'
};
```

---

## 🆘 Support & Maintenance

### **Regular Maintenance (Monthly):**

1. Check Logs sheet for trends
2. Review failed sends in Errors sheet
3. Verify template IDs still valid
4. Test with dummy event

### **Backup:**

- Config sheet: File → Make a copy
- Templates: File → Make a copy
- Apps Script: Manage deployments → Archive old

### **Updates:**

When updating system:
1. Test in staging environment
2. Update Apps Script code
3. Create new deployment (don't replace)
4. Update webhook URL in Vercel
5. Test with small batch
6. Switch production after verification

---

## 📚 Additional Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Gmail Service Limits](https://developers.google.com/apps-script/guides/services/quotas#current_quotas)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

## ✅ Implementation Checklist

### **Initial Setup:**
- [ ] Create Google Sheet with 4 sheets (Config, Logs, Security, Errors)
- [ ] Design certificate template in Google Slides with placeholders
- [ ] Create email template in Google Docs
- [ ] Deploy Apps Script as web app
- [ ] Generate and configure API keys
- [ ] Add environment variables to Next.js (.env.local or Vercel)
- [ ] Test with dummy event

### **Per Event:**
- [ ] Get event UUID from database
- [ ] Add row to Config sheet with template IDs
- [ ] Verify event status is "completed"
- [ ] Test send to yourself first
- [ ] Send certificates to all attendees
- [ ] Verify in Logs sheet

---

**End of Documentation**

For questions or issues, check the troubleshooting section or review Apps Script execution logs.
