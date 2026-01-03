import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-auth';
import bcrypt from 'bcryptjs';
// @ts-ignore - papaparse types may not be fully compatible
import Papa from 'papaparse';

interface CSVRow {
  student_id: string;
  name: string;
  pass: string;
  email: string;
}

/**
 * Hash passwords in batches to optimize performance
 * Process 15 passwords concurrently to balance speed and resource usage
 * Uses cost factor 8 for faster hashing while maintaining security
 * @param passwords - Array of plain text passwords
 * @returns Array of hashed passwords in same order
 */
async function hashPasswordsBatch(passwords: string[]): Promise<string[]> {
  const batchSize = 15; // Increased from 10 to 15 for better throughput
  const results: string[] = [];
  
  for (let i = 0; i < passwords.length; i += batchSize) {
    const batch = passwords.slice(i, i + batchSize);
    const hashed = await Promise.all(
      batch.map(pwd => bcrypt.hash(pwd, 8)) // Reduced from 10 to 8 for Vercel free tier
    );
    results.push(...hashed);
  }
  
  return results;
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();

    // Parse CSV with Papa Parse
    const parsed = Papa.parse<CSVRow>(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase()
    });

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid CSV format', details: parsed.errors },
        { status: 400 }
      );
    }

    // Validate required columns exist
    const requiredColumns = ['student_id', 'name', 'pass', 'email'];
    const headers = parsed.meta.fields || [];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing required columns: ${missingColumns.join(', ')}`,
          details: `Found columns: ${headers.join(', ')}`,
          hint: 'Column names are case-insensitive. Make sure headers match: student_id, name, pass, email'
        },
        { status: 400 }
      );
    }

    // Check for duplicate column names
    const duplicateColumns = headers.filter((col, index) => headers.indexOf(col) !== index);
    if (duplicateColumns.length > 0) {
      return NextResponse.json(
        { 
          error: `Duplicate column names found: ${[...new Set(duplicateColumns)].join(', ')}`,
          hint: 'Each column name must appear only once in the header row'
        },
        { status: 400 }
      );
    }

    const rows = parsed.data;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      );
    }

    if (rows.length > 1000) {
      return NextResponse.json(
        { error: 'Maximum 1000 students per upload. Please split into multiple files.' },
        { status: 400 }
      );
    }

    // Log progress for monitoring
    console.log(`📊 Processing ${rows.length} students from CSV...`);

    // Validate and prepare data
    const errors: string[] = [];
    const validRows: CSVRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineNum = i + 2; // +2 because: +1 for header, +1 for 0-index

      // Validate required fields
      if (!row.student_id || !row.name || !row.pass || !row.email) {
        errors.push(`Line ${lineNum}: Missing required fields (student_id, name, pass, email)`);
        continue;
      }

      // Trim whitespace
      row.student_id = row.student_id.trim();
      row.name = row.name.trim();
      row.pass = row.pass.trim();
      row.email = row.email.trim();

      // Basic validation
      if (row.student_id.length === 0 || row.name.length === 0 || row.pass.length === 0 || row.email.length === 0) {
        errors.push(`Line ${lineNum}: Empty values after trimming`);
        continue;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        errors.push(`Line ${lineNum}: Invalid email format`);
        continue;
      }

      validRows.push(row);
    }

    if (validRows.length === 0) {
      return NextResponse.json(
        { success: 0, errors },
        { status: 400 }
      );
    }

    // Check for existing student IDs in database
    console.log(`🔍 Checking for duplicate student IDs...`);
    const supabase = createAdminClient();
    const studentIds = validRows.map(row => row.student_id);
    
    const { data: existingStudents, error: lookupError } = await supabase
      .from('students')
      .select('student_id')
      .in('student_id', studentIds);
    
    if (lookupError) {
      console.error('Duplicate check error:', lookupError);
      return NextResponse.json(
        { error: 'Failed to check for duplicates', details: lookupError.message },
        { status: 500 }
      );
    }

    // Identify duplicates and separate new students
    const existingIds = new Set(existingStudents?.map(s => s.student_id) || []);
    const newRows: CSVRow[] = [];
    const duplicateCount = existingIds.size;

    validRows.forEach((row, index) => {
      const lineNum = index + 2;
      if (existingIds.has(row.student_id)) {
        errors.push(`Line ${lineNum}: Student ID '${row.student_id}' already exists in database`);
      } else {
        newRows.push(row);
      }
    });

    console.log(`✅ Found ${duplicateCount} duplicates, ${newRows.length} new students`);

    if (newRows.length === 0) {
      return NextResponse.json({
        success: 0,
        skipped: duplicateCount,
        errors: [...errors, 'All student IDs already exist in database']
      }, { status: 400 });
    }

    // OPTIMIZATION: Hash only NEW students' passwords (15 concurrent, cost factor 8)
    console.log(`🔐 Hashing ${newRows.length} passwords (skipped ${duplicateCount} duplicates)...`);
    const startHash = Date.now();
    const passwords = newRows.map(row => row.pass);
    const hashedPasswords = await hashPasswordsBatch(passwords);
    console.log(`✅ Hashing completed in ${Date.now() - startHash}ms`);

    // Prepare bulk insert data (only new students)
    const studentsData = newRows.map((row, index) => ({
      student_id: row.student_id,
      name: row.name,
      email: row.email,
      password_hash: hashedPasswords[index],
      card_uid: null,
      bio: ''
    }));

    // OPTIMIZATION: Single bulk INSERT using Supabase admin client
    console.log(`💾 Inserting ${studentsData.length} students into database...`);
    const startInsert = Date.now();
    
    const { data, error } = await supabase
      .from('students')
      .insert(studentsData)
      .select('student_id'); // Return inserted IDs for confirmation
    
    console.log(`✅ Database insert completed in ${Date.now() - startInsert}ms`);

    if (error) {
      console.error('Bulk insert error:', error);
      return NextResponse.json(
        { error: 'Database error during import', details: error.message },
        { status: 500 }
      );
    }

    console.log(`🎉 Import completed: ${data?.length || 0} students added, ${duplicateCount} skipped`);

    return NextResponse.json({
      success: data?.length || 0,
      skipped: duplicateCount,
      errors
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Configure route to handle larger file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};
