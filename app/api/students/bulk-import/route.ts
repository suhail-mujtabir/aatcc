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
  email?: string;
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
      if (!row.student_id || !row.name || !row.pass) {
        errors.push(`Line ${lineNum}: Missing required fields (student_id, name, pass)`);
        continue;
      }

      // Trim whitespace
      row.student_id = row.student_id.trim();
      row.name = row.name.trim();
      row.pass = row.pass.trim();
      if (row.email) row.email = row.email.trim();

      // Basic validation
      if (row.student_id.length === 0 || row.name.length === 0 || row.pass.length === 0) {
        errors.push(`Line ${lineNum}: Empty values after trimming`);
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

    // OPTIMIZATION: Hash all passwords in batches (15 concurrent, cost factor 8)
    console.log(`🔐 Hashing ${validRows.length} passwords...`);
    const startHash = Date.now();
    const passwords = validRows.map(row => row.pass);
    const hashedPasswords = await hashPasswordsBatch(passwords);
    console.log(`✅ Hashing completed in ${Date.now() - startHash}ms`);

    // Prepare bulk insert data
    const studentsData = validRows.map((row, index) => ({
      student_id: row.student_id,
      name: row.name,
      email: row.email || null,
      password_hash: hashedPasswords[index],
      card_uid: null,
      bio: ''
    }));

    // OPTIMIZATION: Single bulk INSERT using Supabase admin client
    console.log(`💾 Inserting ${studentsData.length} students into database...`);
    const startInsert = Date.now();
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('students')
      .insert(studentsData)
      .select('student_id'); // Return inserted IDs for confirmation
    
    console.log(`✅ Database insert completed in ${Date.now() - startInsert}ms`);

    if (error) {
      // Handle duplicate student_id errors
      if (error.code === '23505') { // Postgres unique violation code
        errors.push('Some student IDs already exist in database');
        
        // Return partial success
        return NextResponse.json({
          success: 0,
          errors: [...errors, 'Duplicate student IDs found. Please remove duplicates and try again.']
        }, { status: 400 });
      } else {
        console.error('Bulk insert error:', error);
        return NextResponse.json(
          { error: 'Database error during import', details: error.message },
          { status: 500 }
        );
      }
    }

    console.log(`🎉 Import completed: ${data?.length || 0} students added successfully`);

    return NextResponse.json({
      success: data?.length || 0,
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
