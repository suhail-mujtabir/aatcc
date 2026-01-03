/**
 * ========================================
 * AATCC AUST - Automated Certificate Distribution System
 * Google Apps Script - Web App
 * ========================================
 * 
 * This script receives webhook calls from the AATCC admin dashboard,
 * generates personalized certificates from Google Slides templates,
 * and sends them via email to event attendees.
 * 
 * Setup Instructions: See VIEW_REPORTS.md
 * 
 * IMPORTANT: Deploy this script from your .edu email account
 * to benefit from unlimited email sending (no 100/day limit)
 */

// ========================================
// CONFIGURATION
// ========================================

/**
 * API Keys for webhook authentication
 * Generate secure keys using: node -e "console.log('prod_sk_' + require('crypto').randomBytes(32).toString('hex'))"
 */
const API_KEYS = {
  production: 'prod_sk_8d9c798b50670c2784dc11890b5c4c0d0d8e53ede244e62d91ee77f149bbe6e2',
  staging: 'YOUR_STAGING_API_KEY_HERE'
};

/**
 * Allowed origins (domains that can call this webhook)
 */
const ALLOWED_ORIGINS = [
  'https://aatcc.vercel.app',
  'https://aatccaust.org',
  'http://localhost:3000' // Remove in production
];

/**
 * Rate limiting configuration
 */
const RATE_LIMIT = {
  maxRequestsPerHour: 10,
  maxAttendeesPerRequest: 500
};

/**
 * Email sending configuration
 */
const EMAIL_CONFIG = {
  senderName: 'AATCC AUST Student Chapter',
  replyTo: 'austaatcc@aust.edu', // Your chapter email
  // Gmail daily limit: 100 for regular, 1500 for .edu accounts
  maxEmailsPerMinute: 50 // Stay under limit with buffer
};

// ========================================
// MAIN WEBHOOK HANDLER
// ========================================

/**
 * Main entry point for POST requests (webhook)
 * This function is called when your Next.js app sends a certificate request
 */
function doPost(e) {
  try {
    // 1. Parse incoming request
    const data = JSON.parse(e.postData.contents);
    const { apiKey, eventId, eventName, eventDate, attendees, origin, certificateConfig } = data;
    
    // 2. Security validations
    if (!isValidApiKey(apiKey)) {
      return createErrorResponse('Unauthorized: Invalid API key', 401);
    }
    
    if (!isAllowedOrigin(origin)) {
      logSuspiciousActivity(origin, apiKey);
      return createErrorResponse('Forbidden: Origin not allowed', 403);
    }
    
    if (isRateLimited(apiKey)) {
      return createErrorResponse('Too many requests. Try again later.', 429);
    }
    
    // 3. Validate input data
    if (!eventId || !eventName || !attendees || !Array.isArray(attendees)) {
      return createErrorResponse('Invalid request data', 400);
    }
    
    if (attendees.length === 0) {
      return createErrorResponse('No attendees provided', 400);
    }
    
    if (attendees.length > RATE_LIMIT.maxAttendeesPerRequest) {
      return createErrorResponse(`Max ${RATE_LIMIT.maxAttendeesPerRequest} attendees per request`, 400);
    }
    
    // 4. Validate all email addresses
    const invalidEmails = attendees.filter(a => !isValidEmail(a.email));
    if (invalidEmails.length > 0) {
      return createErrorResponse('Invalid email addresses detected', 400);
    }
    
    // 5. Get certificate configuration
    // NEW: Prefer certificateConfig from payload (automatic mode)
    // FALLBACK: Query Config sheet if certificateConfig not provided (legacy mode)
    let config;
    if (certificateConfig && certificateConfig.slidesTemplateId && certificateConfig.emailSubject) {
      // Automatic mode: Use config from database (passed via Next.js)
      config = certificateConfig;
      Logger.log('Using automatic certificate config from payload');
    } else {
      // Legacy mode: Query Config sheet (backward compatible)
      Logger.log('⚠️ No certificateConfig in payload, falling back to Config sheet (legacy mode)');
      const sheetConfig = getEventConfig(eventId);
      if (!sheetConfig) {
        return createErrorResponse(
          `Event configuration not found. Please either:\n` +
          `1. Configure default template in Supabase (recommended), OR\n` +
          `2. Add event ${eventId} to the Config sheet (legacy)`,
          404
        );
      }
      // Map legacy config format to new format
      config = {
        slidesTemplateId: sheetConfig.certificateTemplateId,
        emailSubject: sheetConfig.emailSubject,
        emailBodyDocId: sheetConfig.emailBodyDocId,
        emailBodyHtml: null
      };
    }
    
    // 6. Log request
    logRequest(apiKey, eventId, eventName, attendees.length);
    
    // 7. Process certificates and send emails
    const results = processCertificates(attendees, config, eventName, eventDate);
    
    // 8. Return success response
    return createSuccessResponse({
      success: true,
      sent: results.sent,
      failed: results.failed,
      details: results.details
    });
    
  } catch (error) {
    logError('doPost', error);
    return createErrorResponse(error.toString(), 500);
  }
}

// ========================================
// SECURITY & VALIDATION
// ========================================

function isValidApiKey(providedKey) {
  return Object.values(API_KEYS).includes(providedKey);
}

function isAllowedOrigin(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
}

function isRateLimited(apiKey) {
  const cache = CacheService.getScriptCache();
  const key = `ratelimit_${apiKey}_${new Date().getHours()}`;
  const count = parseInt(cache.get(key) || '0');
  
  if (count >= RATE_LIMIT.maxRequestsPerHour) {
    return true;
  }
  
  cache.put(key, (count + 1).toString(), 3600); // Expires in 1 hour
  return false;
}

function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ========================================
// CONFIGURATION MANAGEMENT
// ========================================

/**
 * Get event configuration from "Config" sheet
 * 
 * ⚠️ LEGACY MODE: This function is now optional!
 * The new automatic mode passes certificateConfig in the webhook payload,
 * eliminating the need for manual Config sheet management.
 * 
 * This function remains for backward compatibility and manual override scenarios.
 * 
 * Expected sheet structure:
 * | Event ID | Certificate Template ID | Email Subject | Email Body Doc ID |
 * | event-uuid | google-slides-id | Subject text | google-doc-id |
 */
function getEventConfig(eventId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
    if (!sheet) {
      Logger.log('⚠️ Config sheet not found (this is OK if using automatic mode)');
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Skip header row, find matching event ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === eventId) {
        return {
          certificateTemplateId: data[i][1],
          emailSubject: data[i][2],
          emailBodyDocId: data[i][3]
        };
      }
    }
    
    return null;
  } catch (error) {
    logError('getEventConfig', error);
    throw error;
  }
}

// ========================================
// CERTIFICATE PROCESSING
// ========================================

/**
 * Process all certificates for attendees
 * This is the main processing function that:
 * 1. Gets email template
 * 2. Loops through each attendee
 * 3. Generates certificate PDF
 * 4. Sends email with attachment
 * 5. Implements rate limiting
 */
function processCertificates(attendees, config, eventName, eventDate) {
  const results = {
    sent: 0,
    failed: 0,
    details: []
  };
  
  try {
    // Get email template
    let emailBodyTemplate;
    
    if (config.emailBodyHtml) {
      // NEW: Use inline HTML from payload (automatic mode)
      emailBodyTemplate = config.emailBodyHtml;
      Logger.log('Using inline HTML email template from payload');
    } else if (config.emailBodyDocId) {
      // LEGACY: Load from Google Doc (manual mode or custom override)
      emailBodyTemplate = getEmailTemplate(config.emailBodyDocId, eventName);
      Logger.log(`Using email template from Google Doc: ${config.emailBodyDocId}`);
    } else {
      throw new Error('No email template provided (neither emailBodyHtml nor emailBodyDocId)');
    }
    
    // Process each attendee
    attendees.forEach((attendee, index) => {
      try {
        // Rate limiting: Gmail allows 50 emails per minute for .edu accounts
        // Add delay every 40 emails to stay safe
        if (index > 0 && index % 40 === 0) {
          Logger.log(`Rate limiting: Processed ${index} emails, waiting 60 seconds...`);
          Utilities.sleep(60000); // Wait 1 minute
        }
        
        // Generate certificate PDF
        const pdfBlob = generateCertificate(
          config.slidesTemplateId || config.certificateTemplateId, // Support both formats
          attendee.name,
          eventName,
          eventDate || attendee.checkedInAt
        );
        
        // Personalize email body
        const personalizedBody = emailBodyTemplate
          .replace(/\{\{name\}\}/g, attendee.name)
          .replace(/\{\{studentId\}\}/g, attendee.studentId || '');
        
        // Send email
        GmailApp.sendEmail(
          attendee.email,
          config.emailSubject,
          '', // Plain text version (optional)
          {
            htmlBody: personalizedBody,
            attachments: [pdfBlob],
            name: EMAIL_CONFIG.senderName,
            replyTo: EMAIL_CONFIG.replyTo
          }
        );
        
        results.sent++;
        results.details.push({
          email: attendee.email,
          name: attendee.name,
          status: 'sent'
        });
        
        Logger.log(`✓ Sent certificate to ${attendee.name} (${attendee.email})`);
        
      } catch (error) {
        results.failed++;
        results.details.push({
          email: attendee.email,
          name: attendee.name,
          status: 'failed',
          error: error.toString()
        });
        
        Logger.log(`✗ Failed to send to ${attendee.name}: ${error.toString()}`);
      }
    });
    
    Logger.log(`Certificate distribution complete: ${results.sent} sent, ${results.failed} failed`);
    
  } catch (error) {
    logError('processCertificates', error);
    throw error;
  }
  
  return results;
}

// ========================================
// CERTIFICATE GENERATION
// ========================================

/**
 * Generate certificate PDF from Google Slides template
 * 
 * Template placeholders:
 * - {{name}} - Student name
 * - {{event}} - Event name
 * - {{date}} - Event date
 */
function generateCertificate(templateId, studentName, eventName, eventDate) {
  try {
    // 1. Copy template
    const template = DriveApp.getFileById(templateId);
    const copyName = `Certificate_${studentName}_${Date.now()}`;
    const copy = template.makeCopy(copyName);
    const presentation = SlidesApp.openById(copy.getId());
    
    // 2. Format date
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    // 3. Replace placeholders in all slides
    const slides = presentation.getSlides();
    slides.forEach(slide => {
      slide.replaceAllText('{{name}}', studentName);
      slide.replaceAllText('{{event}}', eventName);
      slide.replaceAllText('{{date}}', formattedDate);
    });
    
    // Save changes
    presentation.saveAndClose();
    
    // 4. Convert to PDF
    const pdf = DriveApp.getFileById(copy.getId()).getAs('application/pdf');
    pdf.setName(`Certificate_${studentName}.pdf`);
    
    // 5. Delete temporary slide copy
    DriveApp.getFileById(copy.getId()).setTrashed(true);
    
    return pdf;
    
  } catch (error) {
    logError('generateCertificate', error);
    throw new Error(`Certificate generation failed: ${error.toString()}`);
  }
}

// ========================================
// EMAIL TEMPLATE
// ========================================

/**
 * Get email body template from Google Doc
 * 
 * Template placeholders:
 * - {{name}} - Will be replaced per attendee
 * - {{event}} - Event name (replaced once here)
 * - {{studentId}} - Student ID (replaced per attendee)
 */
function getEmailTemplate(docId, eventName) {
  try {
    const doc = DocumentApp.openById(docId);
    let body = doc.getBody().getText();
    
    // Replace event name (common for all attendees)
    body = body.replace(/\{\{event\}\}/g, eventName);
    
    return body;
    
  } catch (error) {
    logError('getEmailTemplate', error);
    throw new Error(`Email template error: ${error.toString()}`);
  }
}

// ========================================
// LOGGING & MONITORING
// ========================================

function logRequest(apiKey, eventId, eventName, attendeeCount) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Logs');
    if (!sheet) return;
    
    sheet.appendRow([
      new Date(),
      apiKey.substring(0, 10) + '...', // Truncate for security
      eventId,
      eventName,
      attendeeCount,
      'success'
    ]);
  } catch (error) {
    Logger.log(`Logging error: ${error.toString()}`);
  }
}

function logSuspiciousActivity(origin, apiKey) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Security');
    if (!sheet) return;
    
    sheet.appendRow([
      new Date(),
      origin,
      apiKey.substring(0, 10) + '...',
      'suspicious_origin'
    ]);
  } catch (error) {
    Logger.log(`Security logging error: ${error.toString()}`);
  }
}

function logError(functionName, error) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Errors');
    if (!sheet) {
      Logger.log(`Error in ${functionName}: ${error.toString()}`);
      return;
    }
    
    sheet.appendRow([
      new Date(),
      functionName,
      error.toString(),
      error.stack || 'N/A'
    ]);
  } catch (logError) {
    Logger.log(`Failed to log error: ${logError.toString()}`);
  }
}

// ========================================
// RESPONSE HELPERS
// ========================================

function createSuccessResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(message, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: false,
      error: message,
      statusCode: statusCode
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// TESTING FUNCTION (Optional)
// ========================================

/**
 * Test function for development
 * Run this from Apps Script editor to test certificate generation
 */
function testCertificateGeneration() {
  const testData = {
    apiKey: API_KEYS.production,
    eventId: 'test-event-123',
    eventName: 'Test Workshop',
    eventDate: new Date().toISOString(),
    attendees: [
      {
        name: 'Test Student',
        email: 'your-test-email@example.com',
        studentId: '23-01-001',
        checkedInAt: new Date().toISOString()
      }
    ],
    origin: 'http://localhost:3000'
  };
  
  const mockRequest = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockRequest);
  Logger.log(result.getContent());
}
