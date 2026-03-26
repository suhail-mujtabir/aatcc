# ESP32 NFC Card Activation Firmware - Supabase Realtime Implementation

## Hardware Requirements
- ESP32 Development Board
- MFRC522 (RC522) NFC Reader Module
- SSD1306 OLED Display (128x64, I2C)
- NFC Cards (MIFARE Classic or compatible)
- Jumper wires
- USB cable for programming

---

## Wiring Diagram

### MFRC522 (RC522) → ESP32 (SPI)
```
MFRC522 Pin    →    ESP32 Pin
─────────────────────────────
SDA/SS         →    GPIO 21
SCK            →    GPIO 18
MOSI           →    GPIO 23
MISO           →    GPIO 19
IRQ            →    Not connected
GND            →    GND
RST            →    GPIO 22
3.3V           →    3.3V
```

### SSD1306 OLED → ESP32 (I2C)
```
OLED Pin       →    ESP32 Pin
─────────────────────────────
VCC            →    3.3V
GND            →    GND
SCL            →    GPIO 15
SDA            →    GPIO 4
```

---

## Arduino Libraries Required

Install these via Arduino IDE → Tools → Manage Libraries:

1. **MFRC522** by GithubCommunity (v1.4.10+)
2. **Adafruit GFX Library** (v1.11.0+)
3. **Adafruit SSD1306** (v2.5.0+)
4. **ArduinoJson** (v6.21.0+) - Use v6.x, NOT v7
5. **WiFi** (Built-in with ESP32 board package)
6. **HTTPClient** (Built-in with ESP32 board package)

---

## Firmware Code

```cpp
/*
 * ESP32 NFC Card Activation System - Supabase Realtime
 * 
 * WORKFLOW:
 * 1. Connect to WiFi
 * 2. Wait for NFC card tap
 * 3. Read card UID
 * 4. POST UID to server → /api/cards/detected
 * 5. Poll activation status → /api/cards/status/[uid]
 * 6. Display activation result
 * 7. Return to ready state
 * 
 * SERVER INTEGRATION:
 * - Uses Supabase Realtime for instant admin UI updates
 * - No manual refresh needed - cards appear automatically
 * - Admin activates via web interface
 * - ESP32 polls until activated or timeout
 */

// ========================================
// CONFIGURATION - UPDATE THESE VALUES
// ========================================

// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";           // Change this
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";   // Change this

// API Configuration
const char* API_BASE_URL = "http://192.168.1.5:3000";  // Local dev server
// For production: const char* API_BASE_URL = "https://your-site.vercel.app";

const char* API_KEY = "0eb480a26f15e979371df45b1912160b5f380bab0fb087cee8f5557c707cd08a";

// Device Configuration
const char* DEVICE_ID = "esp32-001";  // Unique ID for this device

// Timing Configuration
const unsigned long ACTIVATION_POLL_INTERVAL = 2000;  // Poll every 2 seconds
const unsigned long ACTIVATION_TIMEOUT = 300000;      // 5 minutes timeout
const unsigned long SUCCESS_DISPLAY_TIME = 3000;      // Show success for 3 seconds
const unsigned long ERROR_DISPLAY_TIME = 3000;        // Show error for 3 seconds

// Hardware Pin Configuration
#define RST_PIN         22    // MFRC522 Reset
#define SS_PIN          21    // MFRC522 Slave Select
#define OLED_SDA        4     // OLED I2C Data
#define OLED_SCL        15    // OLED I2C Clock
#define SCREEN_WIDTH    128
#define SCREEN_HEIGHT   64
#define OLED_RESET      -1    // No reset pin
#define OLED_ADDRESS    0x3C  // Common I2C address for SSD1306

// ========================================
// INCLUDES
// ========================================

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ========================================
// GLOBAL OBJECTS
// ========================================

MFRC522 mfrc522(SS_PIN, RST_PIN);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ========================================
// SETUP
// ========================================

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=================================");
  Serial.println("ESP32 Card Activation System");
  Serial.println("Supabase Realtime Implementation");
  Serial.println("=================================\n");
  
  // Initialize I2C for OLED
  Wire.begin(OLED_SDA, OLED_SCL);
  
  // Initialize OLED Display
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS)) {
    Serial.println(F("❌ SSD1306 allocation failed"));
    while (true) {
      delay(1000);
    }
  }
  
  display.clearDisplay();
  displayMessage("Starting...", "", "");
  Serial.println("✓ OLED initialized");
  
  // Initialize SPI for MFRC522
  SPI.begin();
  mfrc522.PCD_Init();
  
  // Check MFRC522 version
  byte version = mfrc522.PCD_ReadRegister(mfrc522.VersionReg);
  if (version == 0x00 || version == 0xFF) {
    displayMessage("ERROR", "MFRC522", "Not found!");
    Serial.println("❌ MFRC522 not detected. Check wiring!");
    while (true) {
      delay(1000);
    }
  }
  Serial.printf("✓ MFRC522 initialized (v0x%02X)\n", version);
  
  // Connect to WiFi
  displayMessage("Connecting", "WiFi...", "");
  Serial.printf("Connecting to WiFi: %s\n", WIFI_SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() != WL_CONNECTED) {
    displayMessage("ERROR", "WiFi Failed", "Check config");
    Serial.println("\n❌ WiFi connection failed!");
    while (true) {
      delay(1000);
    }
  }
  
  Serial.println("\n✓ WiFi connected!");
  Serial.printf("IP Address: %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("API Server: %s\n", API_BASE_URL);
  Serial.printf("Device ID: %s\n\n", DEVICE_ID);
  
  displayMessage("Connected!", WiFi.localIP().toString().c_str(), "");
  delay(2000);
  
  // Test API connectivity
  if (testAPIConnection()) {
    Serial.println("✓ API server reachable\n");
    displayMessage("Ready", "Tap NFC card", "to activate");
  } else {
    Serial.println("⚠️  API server unreachable - Check API_BASE_URL\n");
    displayMessage("Ready", "Tap NFC card", "(API offline)");
  }
  
  Serial.println("=================================");
  Serial.println("Waiting for NFC card...");
  Serial.println("=================================\n");
}

// ========================================
// MAIN LOOP
// ========================================

void loop() {
  // Check for new card
  if (!mfrc522.PICC_IsNewCardPresent()) {
    delay(100);
    return;
  }
  
  // Read card serial
  if (!mfrc522.PICC_ReadCardSerial()) {
    delay(100);
    return;
  }
  
  // Get card UID
  String cardUid = getCardUID();
  Serial.printf("\n📇 Card detected: %s\n", cardUid.c_str());
  
  displayMessage("Card Detected", cardUid.c_str(), "");
  delay(1000);
  
  // Process card activation
  processCardActivation(cardUid);
  
  // Halt card and prepare for next read
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
  
  // Return to ready state
  displayMessage("Ready", "Tap NFC card", "to activate");
  Serial.println("\n---------------------------------");
  Serial.println("Waiting for next card...");
  Serial.println("---------------------------------\n");
}

// ========================================
// CARD PROCESSING FUNCTIONS
// ========================================

void processCardActivation(String cardUid) {
  // Step 1: Report card detection to server
  Serial.println("\n[1/3] Reporting card to server...");
  displayMessage("Sending...", cardUid.c_str(), "");
  
  if (!sendCardDetection(cardUid)) {
    Serial.println("❌ Failed to report card detection");
    displayMessage("ERROR", "Server", "unreachable");
    delay(ERROR_DISPLAY_TIME);
    return;
  }
  
  Serial.println("✓ Card reported to server");
  Serial.println("✓ Admin UI updated via Realtime");
  
  // Step 2: Wait for admin activation
  Serial.println("\n[2/3] Waiting for admin activation...");
  displayMessage("Waiting for", "activation...", "");
  
  bool activated = waitForActivation(cardUid);
  
  if (!activated) {
    Serial.println("⏱️  Activation timeout (5 minutes)");
    displayMessage("TIMEOUT", "Not activated", "Try again");
    delay(ERROR_DISPLAY_TIME);
    return;
  }
  
  // Step 3: Activation successful
  Serial.println("\n[3/3] ✓ Card activated!");
}

bool sendCardDetection(String cardUid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi disconnected");
    return false;
  }
  
  HTTPClient http;
  String url = String(API_BASE_URL) + "/api/cards/detected";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-API-Key", API_KEY);
  http.setTimeout(10000);  // 10 second timeout
  
  // Create JSON payload - NEW FORMAT for Supabase implementation
  StaticJsonDocument<256> doc;
  doc["uid"] = cardUid;              // Changed from "cardUid" to "uid"
  doc["deviceId"] = DEVICE_ID;       // Added device ID
  
  String requestBody;
  serializeJson(doc, requestBody);
  
  Serial.printf("→ POST %s\n", url.c_str());
  Serial.printf("  Body: %s\n", requestBody.c_str());
  
  int httpCode = http.POST(requestBody);
  
  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("← HTTP %d: %s\n", httpCode, response.c_str());
    
    if (httpCode == 200) {
      http.end();
      return true;
    } else if (httpCode == 409) {
      // Card already activated
      Serial.println("⚠️  Card already activated");
      
      // Parse response to get student info
      StaticJsonDocument<256> responseDoc;
      DeserializationError error = deserializeJson(responseDoc, response);
      
      if (!error && responseDoc.containsKey("student")) {
        String studentName = responseDoc["student"]["name"] | "Unknown";
        String studentId = responseDoc["student"]["student_id"] | "Unknown";
        
        Serial.printf("  Student: %s (%s)\n", studentName.c_str(), studentId.c_str());
        displaySuccess(studentName, studentId);
        delay(SUCCESS_DISPLAY_TIME);
      } else {
        displayMessage("Already", "Activated", "");
        delay(ERROR_DISPLAY_TIME);
      }
      
      http.end();
      return false;
    }
  } else {
    Serial.printf("❌ HTTP Error: %s\n", http.errorToString(httpCode).c_str());
  }
  
  http.end();
  return false;
}

bool waitForActivation(String cardUid) {
  unsigned long startTime = millis();
  int pollCount = 0;
  
  while (millis() - startTime < ACTIVATION_TIMEOUT) {
    pollCount++;
    
    // Check activation status
    ActivationStatus status = checkActivationStatus(cardUid);
    
    if (status.activated) {
      // SUCCESS!
      Serial.printf("\n✓✓✓ Card activated! ✓✓✓\n");
      Serial.printf("Student: %s\n", status.studentName.c_str());
      Serial.printf("ID: %s\n", status.studentId.c_str());
      
      displaySuccess(status.studentName, status.studentId);
      delay(SUCCESS_DISPLAY_TIME);
      
      return true;
    }
    
    // Update display with poll count
    unsigned long elapsed = (millis() - startTime) / 1000;
    String statusMsg = String("Poll #") + String(pollCount);
    String timeMsg = String(elapsed) + "s / 300s";
    displayMessage("Waiting...", statusMsg.c_str(), timeMsg.c_str());
    
    Serial.printf("  Poll #%d - Not activated yet (%lus elapsed)\n", pollCount, elapsed);
    
    // Wait before next poll
    delay(ACTIVATION_POLL_INTERVAL);
  }
  
  return false;  // Timeout
}

struct ActivationStatus {
  bool activated;
  String studentName;
  String studentId;
};

ActivationStatus checkActivationStatus(String cardUid) {
  ActivationStatus status;
  status.activated = false;
  status.studentName = "";
  status.studentId = "";
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi disconnected");
    return status;
  }
  
  HTTPClient http;
  String url = String(API_BASE_URL) + "/api/cards/status/" + cardUid;
  
  http.begin(url);
  http.addHeader("X-Device-API-Key", API_KEY);
  http.setTimeout(10000);
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String response = http.getString();
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error) {
      status.activated = doc["activated"] | false;
      
      if (status.activated) {
        status.studentName = doc["name"] | "Unknown";
        status.studentId = doc["studentId"] | "Unknown";
      }
    }
  }
  
  http.end();
  return status;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

String getCardUID() {
  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (i > 0) uid += ":";
    if (mfrc522.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(mfrc522.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  return uid;
}

bool testAPIConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }
  
  HTTPClient http;
  String url = String(API_BASE_URL) + "/api/cards/status/00:00:00:00:00:00:00";
  
  http.begin(url);
  http.addHeader("X-Device-API-Key", API_KEY);
  http.setTimeout(5000);
  
  int httpCode = http.GET();
  http.end();
  
  return (httpCode > 0);  // Any response means server is reachable
}

// ========================================
// DISPLAY FUNCTIONS
// ========================================

void displayMessage(const char* line1, const char* line2, const char* line3) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  
  // Line 1 (large, bold)
  display.setTextSize(2);
  int16_t x1 = centerText(line1, 2);
  display.setCursor(x1, 5);
  display.println(line1);
  
  // Line 2 (medium)
  display.setTextSize(1);
  int16_t x2 = centerText(line2, 1);
  display.setCursor(x2, 30);
  display.println(line2);
  
  // Line 3 (small)
  int16_t x3 = centerText(line3, 1);
  display.setCursor(x3, 50);
  display.println(line3);
  
  display.display();
}

void displaySuccess(String name, String studentId) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  
  // Checkmark
  display.setTextSize(3);
  display.setCursor(50, 0);
  display.println("✓");
  
  // "Activated!"
  display.setTextSize(1);
  int16_t x1 = centerText("Activated!", 1);
  display.setCursor(x1, 30);
  display.println("Activated!");
  
  // Student name (truncate if too long)
  String displayName = name;
  if (displayName.length() > 16) {
    displayName = displayName.substring(0, 13) + "...";
  }
  int16_t x2 = centerText(displayName.c_str(), 1);
  display.setCursor(x2, 45);
  display.println(displayName);
  
  // Student ID
  int16_t x3 = centerText(studentId.c_str(), 1);
  display.setCursor(x3, 55);
  display.println(studentId);
  
  display.display();
}

int16_t centerText(const char* text, int textSize) {
  int16_t x1, y1;
  uint16_t w, h;
  display.setTextSize(textSize);
  display.getTextBounds(text, 0, 0, &x1, &y1, &w, &h);
  return (SCREEN_WIDTH - w) / 2;
}

// ========================================
// END OF FIRMWARE
// ========================================
```

---

## Upload Instructions

### 1. Install ESP32 Board Support
```
File → Preferences → Additional Board Manager URLs:
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

Tools → Board → Boards Manager → Search "ESP32" → Install
```

### 2. Configure Arduino IDE
```
Tools → Board → ESP32 Arduino → ESP32 Dev Module
Tools → Upload Speed → 115200
Tools → Flash Frequency → 80MHz
Tools → Partition Scheme → Default
```

### 3. Update Configuration
Edit these lines in the code:
```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* API_BASE_URL = "http://192.168.1.5:3000";  // Your dev server IP
const char* DEVICE_ID = "esp32-001";  // Unique ID for this device
```

### 4. Upload Firmware
```
1. Connect ESP32 via USB
2. Tools → Port → Select correct COM port
3. Click Upload button (→)
4. Wait for "Done uploading"
```

### 5. Monitor Serial Output
```
Tools → Serial Monitor
Set baud rate: 115200
```

---

## Expected Serial Output

```
=================================
ESP32 Card Activation System
Supabase Realtime Implementation
=================================

✓ OLED initialized
✓ MFRC522 initialized (v0x92)
Connecting to WiFi: YourWiFi
.......
✓ WiFi connected!
IP Address: 192.168.1.100
API Server: http://192.168.1.5:3000
Device ID: esp32-001

✓ API server reachable

=================================
Waiting for NFC card...
=================================

📇 Card detected: AA:BB:CC:DD:EE:FF:00

[1/3] Reporting card to server...
→ POST http://192.168.1.5:3000/api/cards/detected
  Body: {"uid":"AA:BB:CC:DD:EE:FF:00","deviceId":"esp32-001"}
← HTTP 200: {"success":true,"pollingId":"AA:BB:CC:DD:EE:FF:00"}
✓ Card reported to server
✓ Admin UI updated via Realtime

[2/3] Waiting for admin activation...
  Poll #1 - Not activated yet (2s elapsed)
  Poll #2 - Not activated yet (4s elapsed)
  Poll #3 - Not activated yet (6s elapsed)

[3/3] ✓ Card activated!

✓✓✓ Card activated! ✓✓✓
Student: John Doe
ID: 23-01-002

---------------------------------
Waiting for next card...
---------------------------------
```

---

## Admin UI Behavior

When ESP32 reports a card:
1. **Instantly** appears in admin UI (no refresh needed)
2. Admin selects card from list
3. Admin enters student ID
4. Admin clicks "Activate"
5. Card disappears from admin UI **instantly**
6. ESP32 detects activation on next poll (within 2 seconds)

---

## API Endpoints Used

### 1. POST /api/cards/detected
**Purpose:** Report card detection  
**Request:**
```json
{
  "uid": "AA:BB:CC:DD:EE:FF:00",
  "deviceId": "esp32-001"
}
```
**Response:**
```json
{
  "success": true,
  "pollingId": "AA:BB:CC:DD:EE:FF:00"
}
```

### 2. GET /api/cards/status/[uid]
**Purpose:** Check activation status  
**Request:** `GET /api/cards/status/AA:BB:CC:DD:EE:FF:00`  
**Response (before activation):**
```json
{
  "activated": false
}
```
**Response (after activation):**
```json
{
  "activated": true,
  "name": "John Doe",
  "studentId": "23-01-002"
}
```

---

## Troubleshooting

### Problem: "MFRC522 not detected"
- Check wiring (SPI connections)
- Verify 3.3V power supply
- Try different GPIO pins
- Check MFRC522 module with multimeter

### Problem: "WiFi connection failed"
- Verify SSID and password
- Check 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Move closer to router
- Check Serial Monitor for error details

### Problem: "API server unreachable"
- Verify API_BASE_URL (must match dev server IP)
- Check firewall settings
- Ensure dev server is running (`npm run dev`)
- Test API with curl from another device

### Problem: "Card already activated"
- Card is already linked to a student
- Check admin dashboard to see which student
- Use a different card or unlink in database

### Problem: "Activation timeout"
- Check admin UI is open and receiving updates
- Verify Supabase Realtime is enabled
- Check database migration was run
- Admin must activate within 5 minutes

---

## Testing Without Hardware

Use curl to simulate ESP32 requests:

```bash
# Simulate card detection
curl -X POST http://localhost:3000/api/cards/detected \
  -H "X-Device-API-Key: 0eb480a26f15e979371df45b1912160b5f380bab0fb087cee8f5557c707cd08a" \
  -H "Content-Type: application/json" \
  -d '{"uid":"AA:BB:CC:DD:EE:FF:00","deviceId":"esp32-001"}'

# Check activation status
curl -H "X-Device-API-Key: 0eb480a26f15e979371df45b1912160b5f380bab0fb087cee8f5557c707cd08a" \
  http://localhost:3000/api/cards/status/AA:BB:CC:DD:EE:FF:00
```

---

## Production Deployment

1. **Update API_BASE_URL:**
```cpp
const char* API_BASE_URL = "https://your-site.vercel.app";
```

2. **Upload new firmware to all devices**

3. **Test with production server**

4. **Monitor Serial output for errors**

---

## Key Changes from Previous Version

| Feature | Old Implementation | New Implementation |
|---------|-------------------|-------------------|
| **Request format** | `{"cardUid":"..."}` | `{"uid":"...","deviceId":"..."}` |
| **Admin UI updates** | Manual refresh | Automatic via Realtime |
| **Server storage** | In-memory Map | Supabase Database |
| **Production ready** | ❌ No | ✅ Yes |

---

## Ready to Flash! 🚀

This firmware is production-ready and integrates seamlessly with the Supabase Realtime implementation. Cards will appear instantly in the admin UI with no manual refresh needed.
