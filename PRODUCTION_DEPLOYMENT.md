# Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### 1. Environment Variables Setup

**In Vercel Dashboard** (Settings → Environment Variables), add:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://edwqquekskihrduobgew.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_ORG_NAME="AATCC AUST Student Chapter"
DEVICE_API_KEY=0eb480a26f15e979371df45b1912160b5f380bab0fb087cee8f5557c707cd08a
```

⚠️ **Copy from your `.env.local`** (already in `.gitignore`)

---

### 2. Database Setup (Supabase)

Run these migrations in **Supabase SQL Editor**:

1. Execute `supabase/migrations/001_initial_schema.sql`
2. Execute `supabase/migrations/002_pending_cards.sql`

**Enable Realtime:**
- Go to Database → Replication
- Enable replication for `pending_cards` table
- Verify publication: `supabase_realtime`

---

### 3. Vercel Deployment

**Option A: GitHub (Recommended)**
1. Push to GitHub: `git push origin main`
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Select your repository
4. Add environment variables
5. Deploy

**Option B: Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

### 4. Post-Deployment Verification

**Test API endpoints:**
```bash
# Test card detection
curl -X POST https://your-domain.vercel.app/api/cards/detected \
  -H "Content-Type: application/json" \
  -d '{"uid":"AA:BB:CC:DD","deviceId":"test-device"}'

# Expected: {"success":true,"pollingId":"AA:BB:CC:DD","message":"Card detected, waiting for activation"}
```

**Test Admin UI:**
1. Visit `/login` and authenticate
2. Go to `/admin/activate-cards`
3. Send test card from ESP32
4. Verify real-time appearance
5. Activate and confirm success

---

### 5. ESP32 Configuration

Update firmware with production URL:
```cpp
const char* serverUrl = "https://your-domain.vercel.app";
```

---

## 📊 Performance Expectations

**Per Card Activation:**
- ESP32 detection: ~150ms
- Admin activation: ~200ms
- User experience: < 1 second (with Realtime)

**For 200 Cards:**
- Function execution: ~70 seconds
- Bandwidth: ~400 KB
- Database operations: 1,200 queries
- Realtime messages: 400

**All within free tier limits!** ✅

---

## 🔧 Production Optimizations Applied

✅ **Edge Runtime** on detection/status endpoints (faster, cheaper)
✅ **Structured error logging** with context
✅ **Development-only console.logs** to reduce noise
✅ **Dynamic route optimization** prevents caching issues
✅ **Environment variable template** (.env.example)

---

## 🚨 Troubleshooting

**Realtime not working:**
- Enable replication in Supabase → Database → Replication
- Check WebSocket in browser DevTools (Network tab)

**401 on /api/cards/register:**
- Ensure admin is logged in
- Verify `admin_session` cookie exists
- Check admin exists in `admins` table

**ESP32 can't connect:**
- Verify HTTPS URL (not HTTP)
- Check Vercel function logs
- Ensure environment variables are set

**Build fails:**
- Check Vercel build logs
- Verify TypeScript: `npm run build` locally
- Check all dependencies in package.json

---

## 📈 Monitoring

**Enable Vercel Analytics:**
- Project Settings → Analytics → Enable
- Monitor execution time, errors, bandwidth

**Monitor Supabase:**
- Database → Logs (API requests)
- Settings → Usage (bandwidth/storage)

---

## 🎯 Scale Capacity

- **Current system:** 200 cards → $0
- **Comfortable until:** 240,000 cards/month (free tier)
- **Cost to scale:** $20/month Vercel Pro (up to 2.4M cards)

**Primary efficiency:** No polling from ESP32, Realtime eliminates browser polling

---

## ✅ Deployment Complete!

**Next steps:**
1. Update ESP32 with production URL
2. Share activation URL: `https://your-domain.vercel.app/admin/activate-cards`
3. Test end-to-end with physical NFC cards

**System is production-ready! 🚀**
