# Google Apps Script Webhook - Quick Setup Guide

## 🚀 Quick Start (15 Minutes) - Now Fully Automatic!

**✨ NEW:** No more manual event configuration! Set up once, use forever.

The certificate template is now stored in your database. You'll never need to add Event IDs to Google Sheets again!

### Step 1: Generate API Key (1 minute)
```bash
node -e "console.log('prod_sk_' + require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output - you'll need it in Step 4 and Step 6.
prod_sk_8d9c798b50670c2784dc11890b5c4c0d0d8e53ede244e62d91ee77f149bbe6e2
---

### Step 2: Create Google Sheet (1 minute) - Logs Only!

**🎉 Config sheet NO LONGER NEEDED!**

1. Open Google Sheets with your **.edu account**
2. Create new spreadsheet: "AATCC Certificate System"
3. Create 3 sheets (not 4!) with exact names:
   - **Logs** (webhook request logs)
   - **Security** (failed auth attempts)
   - **Errors** (error tracking)

**Config sheet is deprecated** - certificate config now comes from database automatically!

---

### Step 3: Create Certificate Template (3 minutes)
1. Open Google Slides
2. Design certificate with placeholders:
   - `{{name}}`
   - `{{event}}`
   - `{{date}}`
3. Get template ID from URL:
   ```
   https://docs.google.com/presentation/d/[THIS-IS-THE-ID]/edit
   ```
   1__fQ2Nt-FlBzb0xsabGEZRm0HxhVLBlN0JqorT3msnY

---

### Step 4: Deploy Apps Script (3 minutes)

1. From Google Sheet: **Extensions → Apps Script**
2. Delete default code
3. Copy entire `google-apps-script/certificate-system.gs` file
4. **Paste into editor**
5. **Update Line 17-20 with your generated API key:**
   ```javascript
   const API_KEYS = {
     production: 'paste-your-generated-key-here',
     staging: 'staging_sk_...'
   };
   ```
6. **Update Line 26-29 with your domain:**
   ```javascript
   const ALLOWED_ORIGINS = [
     'https://aatcc.vercel.app',  // Your actual domain
   ];
   ```
7. **Update Line 47-49 with your email:**
   ```javascript
   const EMAIL_CONFIG = {
     senderName: 'AATCC AUST Student Chapter',
     replyTo: 'your-email@aust.edu',
   };
   ```
8. Click **Deploy → New deployment**
9. Settings:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
10. Click **Deploy**
11. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/AKfycbx.../exec`)
https://script.google.com/macros/s/AKfycbwmHFXy62cAtjHz1eTfrg3-UbqZlFyKc5jMeZJGcMjlsddnFTv8qpfdvYxkNWHkQAD2/exec
12. Click **Authorize** and grant permissions

---

### Step 5: Create Email Template (Optional - 2 minutes)
1. Open Google Docs
2. Write email body with:
   ```
   Dear {{name}},
   
   Congratulations on completing {{event}}!
   
   Certificate attached.
   ```
3. Get doc ID from URL

---

### Step 6: Add to Next.js Environment Variables

**For Local Development (.env.local):**
```bash
GOOGLE_APPS_SCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbxXXXXXXXX/exec
GOOGLE_APPS_SCRIPT_API_KEY=prod_sk_paste_your_generated_key_here
```

**For Vercel Production:**
1. Go to Project Settings → Environment Variables
2. Add both variables
3. Redeploy

---

### Step 7: Test Your First Event (2 minutes)

**No Config Sheet Setup Needed!** 🎉

1. Login to admin dashboard
2. Go to **View Reports**
3. Click a completed event
4. Click **Send Certificates**
5. System automatically:
   - Fetches template from database
   - Generates certificates
   - Sends emails
---

## ✅ Test It!

1. Login to admin dashboard
2. Go to **View Reports**
3. Click a completed event
4. Click **Send Certificates** (no Config sheet setup needed!)
5. Check Gmail "Sent" folder
6. Check Google Sheet "Logs" tab

---

## 🎯 For Each New Event

**Nothing!** Just click "Send Certificates" and it works. 🚀

The system automatically:
- Uses the default template from database
- Interpolates event name into subject: "Certificate of Completion: {{event}}"
- Generates and sends certificates

**Want a different template for a specific event?**  
1. Add new template to `certificate_templates` table
2. Add `certificate_template_id` column to events table (future enhancement)
3. Or manually override in Google Sheets Config (legacy mode still supported) (from database)
- Template ID (can reuse same template)
- Email subject
- Email body doc ID

That's it!

---

## 📧 Email Limits

## 🔧 Troubleshooting

**"Certificate template not configured"**
→ Run database migration: `003_certificate_templates.sql`

**"Event configuration not found"** (Legacy error)
→ System now uses database templates automatically. Update your Apps Script if you see this.

**"Unauthorized"**
→ Check API key matches in both places

**Emails not sending**
→ Check Apps Script "Executions" log

**Certificate broken**
→ Check placeholders are exactly: `{{name}}`, `{{event}}`, `{{date}}`

---

## 🆕 What Changed?

### Old Way (Manual):
1. Create event
2. **Open Google Sheets**
3. **Copy Event ID from database**
4. **Paste into Config sheet with template IDs**
5. Go to dashboard → Send certificates

### New Way (Automatic):
1. Create event
2. Go to dashboard → Send certificates ✅

**Result:** 3 fewer steps, zero manual configuration!

**"Unauthorized"**
→ Check API key matches in both places

**Emails not sending**
→ Check Apps Script "Executions" log

**Certificate broken**
→ Check placeholders are exactly: `{{name}}`, `{{event}}`, `{{date}}`

---

## 📚 Full Documentation

See `VIEW_REPORTS.md` for complete guide with:
- Detailed setup instructions
- Security best practices
- Troubleshooting
- Customization options
- Monitoring & logs

---

**Questions?** Check Apps Script execution logs or VIEW_REPORTS.md
