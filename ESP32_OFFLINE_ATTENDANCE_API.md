# ESP32 Offline Attendance System - API Reference

## Overview

This document provides complete API specifications for implementing the ESP32 firmware with **offline-first attendance tracking**. The device downloads event data once, validates cards locally, and bulk-uploads attendance after the event.

**Last Updated:** January 3, 2026

---

## System Architecture

### Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ESP32 BOOT & EVENT SYNC                                  │
├─────────────────────────────────────────────────────────────┤
│ • Connect to WiFi                                            │
│ • GET /api/events/active → Fetch active event               │
│ • GET /api/events/{id}/registrations → Download UIDs list   │
│ • Store UIDs in local memory (HashSet for O(1) lookup)      │
│ • Display: "Ready - Event: {name}"                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. OFFLINE CARD VALIDATION (No Network Required)            │
├─────────────────────────────────────────────────────────────┤
│ • Card tapped → Read UID                                     │
│ • Check if UID exists in local HashSet                       │
│   ├─ Found & not duplicate → Add to attendance array        │
│   │   Display: "✓ Attendance Counted - {Name}"             │
│   ├─ Found but already in array → Reject duplicate          │
│   │   Display: "Already Checked In"                         │
│   └─ Not found → Not registered                             │
│       Display: "✗ Not Registered for Event"                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. BULK UPLOAD (Physical Button Press)                      │
├─────────────────────────────────────────────────────────────┤
│ • Button pressed → Display "Uploading..."                    │
│ • POST /api/check-in → Send all collected UIDs              │
│ • Server validates & bulk inserts to database               │
│ • Display: "✓ Uploaded {count} records"                     │
│ • Clear local attendance array                               │
│ • Keep registration list (for more check-ins)                │
└─────────────────────────────────────────────────────────────┘
```

### Key Benefits
- **No per-tap latency** - Instant feedback (local validation only)
- **Works offline** - No network needed during event
- **Database efficiency** - Single bulk insert vs hundreds of queries
- **Idempotent** - Safe to retry uploads, duplicates are ignored

---

## Authentication

All API requests require device authentication via API key header.

### Required Header
```
X-Device-API-Key: <your-device-api-key>
```

### API Key
```
0eb480a26f15e979371df45b1912160b5f380bab0fb087cee8f5557c707cd08a
```

**Important:** Never hardcode API keys in production. Store in secure config.

---

## API Endpoints

### 1. Get Active Event

**Endpoint:** `GET /api/events/active`

**Purpose:** Fetch currently active event information

**Request:**
```http
GET /api/events/active HTTP/1.1
Host: your-domain.com
X-Device-API-Key: <api-key>
```

**Response (Success - 200):**
```json
{
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Workshop: Web Development",
    "description": "Learn React and Next.js",
    "startTime": "2026-01-03T14:00:00Z",
    "endTime": "2026-01-03T17:00:00Z"
  }
}
```

**Response (No Active Event - 200):**
```json
{
  "event": null
}
```

**Response (Unauthorized - 401):**
```json
{
  "error": "Unauthorized"
}
```

**ESP32 Implementation Notes:**
- Call this endpoint on boot after WiFi connects
- If `event` is `null`, display "No Active Event" and retry periodically
- Store `event.id` for next API call
- Display `event.name` on OLED

---

### 2. Get Registered Students for Event

**Endpoint:** `GET /api/events/{eventId}/registrations`

**Purpose:** Download list of registered students (with card UIDs) for offline validation

**Request:**
```http
GET /api/events/550e8400-e29b-41d4-a716-446655440000/registrations HTTP/1.1
Host: your-domain.com
X-Device-API-Key: <api-key>
```

**Response (Success - 200):**
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "eventName": "Workshop: Web Development",
  "registrations": [
    {
      "studentId": "550e8400-1111-41d4-a716-446655440001",
      "studentNumber": "23-01-001",
      "name": "Alice Johnson",
      "cardUid": "A1:B2:C3:D4"
    },
    {
      "studentId": "550e8400-2222-41d4-a716-446655440002",
      "studentNumber": "23-01-002",
      "name": "Bob Smith",
      "cardUid": "E5:F6:07:08"
    }
  ],
  "totalRegistrations": 2
}
```

**Response (Event Not Found - 404):**
```json
{
  "error": "Event not found"
}
```

**Response (No Registrations - 200):**
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "eventName": "Workshop: Web Development",
  "registrations": [],
  "totalRegistrations": 0
}
```

**ESP32 Implementation Notes:**
- Call this immediately after getting active event
- Parse the `registrations` array
- Store only `cardUid` values in a HashSet/array for fast lookup
- Optionally store `name` for OLED display (memory permitting)
- If `totalRegistrations > 500`, display warning (memory limit)
- Format: UIDs are uppercase with colons (e.g., "A1:B2:C3:D4")

**Example ESP32 Data Structure:**
```cpp
// Option 1: Array (simple, O(n) lookup)
String registeredUIDs[500];
int registeredCount = 0;

// Option 2: HashMap (faster, O(1) lookup, requires library)
std::unordered_set<String> registeredUIDs;
std::unordered_map<String, String> uidToName; // For OLED display
```

---

### 3. Bulk Attendance Upload

**Endpoint:** `POST /api/check-in`

**Purpose:** Upload collected attendance UIDs after event (triggered by physical button)

**Request:**
```http
POST /api/check-in HTTP/1.1
Host: your-domain.com
X-Device-API-Key: <api-key>
Content-Type: application/json

{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "uids": [
    "A1:B2:C3:D4",
    "E5:F6:07:08",
    "09:0A:0B:0C"
  ],
  "deviceId": "esp32-001"
}
```

**Request Body Fields:**
- `eventId` (required, string) - UUID of the event
- `uids` (required, array of strings) - Card UIDs that tapped during event
- `deviceId` (optional, string) - Unique identifier of ESP32 device

**Response (Success - 200):**
```json
{
  "success": true,
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "eventName": "Workshop: Web Development",
  "results": {
    "total": 3,
    "inserted": 2,
    "skipped": 1,
    "failed": 0
  },
  "details": [
    {
      "uid": "A1:B2:C3:D4",
      "status": "inserted",
      "studentName": "Alice Johnson"
    },
    {
      "uid": "E5:F6:07:08",
      "status": "skipped",
      "reason": "Already checked in",
      "studentName": "Bob Smith"
    },
    {
      "uid": "09:0A:0B:0C",
      "status": "inserted",
      "studentName": "Charlie Davis"
    }
  ]
}
```

**Response (Validation Error - 400):**
```json
{
  "error": "Invalid request",
  "details": "UIDs array is required"
}
```

**Response (Event Not Active - 404):**
```json
{
  "error": "Event not found or not active"
}
```

**Response (Partial Success - 200):**
```json
{
  "success": true,
  "results": {
    "total": 3,
    "inserted": 1,
    "skipped": 1,
    "failed": 1
  },
  "details": [
    {
      "uid": "A1:B2:C3:D4",
      "status": "inserted",
      "studentName": "Alice Johnson"
    },
    {
      "uid": "E5:F6:07:08",
      "status": "skipped",
      "reason": "Already checked in"
    },
    {
      "uid": "INVALID:UID",
      "status": "failed",
      "reason": "Student not found or not registered"
    }
  ]
}
```

**ESP32 Implementation Notes:**
- Only call this when physical button is pressed
- Display "Uploading..." during request
- Request may take 2-5 seconds for large batches
- Display success count: "✓ Uploaded: {inserted}/{total}"
- If `failed > 0`, display warning but don't retry automatically
- After successful upload, clear the attendance array
- Keep the registration list (don't re-download) for more check-ins
- Support retry on network failure (endpoint is idempotent)

**Server-Side Processing:**
1. Validate `eventId` exists and is active
2. For each UID in `uids` array:
   - Lookup student by `card_uid`
   - Verify student is registered for event
   - Insert to `attendance` table (with duplicate handling)
3. Return detailed results for each UID

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response data |
| 400 | Bad Request | Check request format, fix and retry |
| 401 | Unauthorized | Check API key header |
| 404 | Not Found | Event/resource doesn't exist |
| 409 | Conflict | Duplicate record (safe to ignore) |
| 500 | Server Error | Retry after delay |

### Network Failure Strategy

```cpp
// Example retry logic
int maxRetries = 3;
int retryDelay = 5000; // 5 seconds

for (int attempt = 1; attempt <= maxRetries; attempt++) {
  int httpCode = makeAPIRequest();
  
  if (httpCode == 200) {
    // Success
    break;
  } else if (httpCode >= 500) {
    // Server error - retry
    display.println("Retry " + String(attempt) + "/" + String(maxRetries));
    delay(retryDelay);
  } else {
    // Client error - don't retry
    display.println("Error: " + String(httpCode));
    break;
  }
}
```

---

## Local Validation Logic

### Card Tap Handler (Offline)

```cpp
void onCardDetected(String uid) {
  // 1. Check if UID is in registered list
  bool isRegistered = registeredUIDs.find(uid) != registeredUIDs.end();
  
  if (!isRegistered) {
    displayMessage("Not Registered", "for Event", 3000);
    playErrorSound();
    return;
  }
  
  // 2. Check for local duplicate
  bool alreadyCheckedIn = attendanceUIDs.find(uid) != attendanceUIDs.end();
  
  if (alreadyCheckedIn) {
    displayMessage("Already", "Checked In", 3000);
    playWarningSound();
    return;
  }
  
  // 3. Add to attendance array
  attendanceUIDs.insert(uid);
  
  // 4. Display success
  String name = uidToName[uid]; // Optional, if stored
  displayMessage("Attendance ✓", name, 2000);
  playSuccessSound();
  
  // 5. Log locally
  Serial.println("Checked in: " + uid + " (" + name + ")");
  Serial.println("Total: " + String(attendanceUIDs.size()));
}
```

### Button Press Handler (Upload)

```cpp
void onButtonPressed() {
  if (attendanceUIDs.size() == 0) {
    displayMessage("No Data", "to Upload", 2000);
    return;
  }
  
  displayMessage("Uploading...", String(attendanceUIDs.size()) + " records", 0);
  
  // Build JSON array
  String jsonBody = "{\"eventId\":\"" + currentEventId + "\",\"uids\":[";
  bool first = true;
  for (const String& uid : attendanceUIDs) {
    if (!first) jsonBody += ",";
    jsonBody += "\"" + uid + "\"";
    first = false;
  }
  jsonBody += "],\"deviceId\":\"" + DEVICE_ID + "\"}";
  
  // POST to API
  bool success = postBulkAttendance(jsonBody);
  
  if (success) {
    displayMessage("Upload ✓", String(attendanceUIDs.size()) + " records", 3000);
    attendanceUIDs.clear(); // Clear after success
  } else {
    displayMessage("Upload Failed", "Press to Retry", 5000);
    // DON'T clear - allow retry
  }
}
```

---

## Memory Considerations

### ESP32 Memory Limits
- **RAM:** ~520 KB total, ~200 KB usable for application
- **UID Storage:** Each UID string ~15 bytes (incl. overhead)
- **Max Registrations:** 500 UIDs × 15 bytes = ~7.5 KB
- **Max Attendance:** 500 UIDs × 15 bytes = ~7.5 KB
- **Safety Margin:** Keep total data structures under 50 KB

### Optimization Tips
1. **Store UIDs only** - Don't store full student objects
2. **Use HashSet** - O(1) lookup vs O(n) array search
3. **Dynamic allocation** - Reserve memory only when needed
4. **Cleanup** - Free memory after upload
5. **Monitor heap** - Log `ESP.getFreeHeap()` periodically

---

## Testing Checklist

### Phase 1: API Integration
- [ ] WiFi connection successful
- [ ] `/api/events/active` returns event data
- [ ] `/api/events/{id}/registrations` returns UID list
- [ ] API key authentication works
- [ ] Parse JSON responses correctly

### Phase 2: Offline Validation
- [ ] Store registrations in HashSet
- [ ] Registered card → Show success message
- [ ] Unregistered card → Show "Not Registered"
- [ ] Duplicate tap → Show "Already Checked In"
- [ ] OLED displays correct messages

### Phase 3: Bulk Upload
- [ ] Button press triggers upload
- [ ] JSON array builds correctly
- [ ] `/api/check-in` accepts bulk data
- [ ] Response shows inserted/skipped counts
- [ ] Local array clears after success
- [ ] Can continue checking in after upload

### Phase 4: Edge Cases
- [ ] No active event → Display message, retry
- [ ] Empty registration list → Allow (0 registrations)
- [ ] Empty attendance array → Don't upload
- [ ] Network failure during upload → Retry logic
- [ ] Event changes mid-session → Re-download data

---

## Example: Complete ESP32 Flow

```cpp
// ============ SETUP ============
void setup() {
  Serial.begin(115200);
  initOLED();
  initNFC();
  connectWiFi();
  
  // Fetch active event
  Event event = getActiveEvent();
  if (event.id == "") {
    displayMessage("No Active", "Event", 0);
    return;
  }
  
  currentEventId = event.id;
  displayMessage(event.name, "Loading...", 0);
  
  // Download registrations
  int count = downloadRegistrations(event.id);
  displayMessage("Ready", String(count) + " registered", 2000);
  delay(2000);
  displayMessage("Tap Card", event.name, 0);
}

// ============ LOOP ============
void loop() {
  // Check for card tap
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    String uid = getCardUID();
    onCardDetected(uid);
  }
  
  // Check for button press
  if (digitalRead(BUTTON_PIN) == LOW) {
    delay(50); // Debounce
    if (digitalRead(BUTTON_PIN) == LOW) {
      onButtonPressed();
    }
  }
}
```

---

## Troubleshooting

### Issue: "Not Registered" for valid card
- **Cause:** UID format mismatch (case sensitivity, colon placement)
- **Fix:** Ensure UIDs are uppercase with colons (e.g., "A1:B2:C3:D4")
- **Debug:** Print local UID and compare with registration list

### Issue: Upload fails with 401
- **Cause:** Missing or incorrect API key header
- **Fix:** Verify `X-Device-API-Key` header is set correctly
- **Debug:** Check HTTP request headers in Serial output

### Issue: All cards show "Already Checked In"
- **Cause:** Attendance array not cleared after upload
- **Fix:** Call `attendanceUIDs.clear()` after successful POST
- **Debug:** Print array size before/after upload

### Issue: ESP32 crashes during upload
- **Cause:** Out of memory (too many UIDs)
- **Fix:** Implement batch upload (e.g., 100 UIDs per request)
- **Debug:** Monitor `ESP.getFreeHeap()` before upload

---

## Migration from Real-Time Mode

### Old Flow (Per-Tap Database Queries)
```
Card Tap → API Call → 5 Database Queries → Insert → Response
Latency: 500-2000ms per tap
Network: Required for every tap
Database Load: High (5 queries × number of students)
```

### New Flow (Offline-First)
```
Boot → Download Data → Local Validation (instant) → Bulk Upload
Latency: <50ms per tap (local only)
Network: Only needed at start/end
Database Load: Low (1 bulk insert)
```

### Benefits
- **99% faster** card validation (local vs network)
- **95% fewer** database queries
- **Works offline** during entire event
- **Survives** network hiccups
- **Scalable** to 1000+ attendees

---

## API Endpoint Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/events/active` | GET | Get active event | Yes |
| `/api/events/{id}/registrations` | GET | Download registration list | Yes |
| `/api/check-in` | POST | Bulk upload attendance | Yes |

---

## Support & Updates

- **Repository:** [GitHub - suhail-mujtabir/aatcc](https://github.com/suhail-mujtabir/aatcc)
- **API Base URL (Dev):** `http://localhost:3000`
- **API Base URL (Prod):** `https://your-domain.vercel.app`
- **Last Updated:** January 3, 2026

---

**End of API Reference**
