import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase';
import Papa from 'papaparse';

interface CSVRow {
  student_id?: string;
  name?: string;
  email?: string;
  [key: string]: any; // Allow extra columns from Google Forms
}

interface ValidationError {
  line: number;
  student_id: string;
  error: string;
}

const MAX_REGISTRATIONS = 500;

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!eventId) {
      return NextResponse.json(
        { error: 'No event selected' },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();

    // Parse CSV
    const parseResult = Papa.parse<CSVRow>(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase(),
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parsing failed', details: parseResult.errors },
        { status: 400 }
      );
    }

    const rows = parseResult.data;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      );
    }

    if (rows.length > MAX_REGISTRATIONS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_REGISTRATIONS} registrations allowed per import` },
        { status: 400 }
      );
    }

    // Validate student_id column exists
    const firstRow = rows[0];
    if (!('student_id' in firstRow)) {
      return NextResponse.json(
        { error: 'CSV must contain "student_id" column' },
        { status: 400 }
      );
    }

    // Validate and collect student IDs
    const errors: ValidationError[] = [];
    const validStudentIds: string[] = [];

    rows.forEach((row, index) => {
      const lineNumber = index + 2; // +2 because index 0 is line 2 (after header)
      const studentId = row.student_id?.trim();

      if (!studentId) {
        errors.push({
          line: lineNumber,
          student_id: studentId || '(empty)',
          error: 'Missing student_id',
        });
        return;
      }

      validStudentIds.push(studentId);
    });

    if (errors.length > 0) {
      return NextResponse.json({
        success: 0,
        errors: errors.slice(0, 10), // Limit to first 10 errors for display
        totalErrors: errors.length,
        skipped: 0,
      });
    }

    const supabase = createAdminClient();

    // Verify event exists and is not deleted
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, status')
      .eq('id', eventId)
      .is('deleted_at', null)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found or has been deleted' },
        { status: 404 }
      );
    }

    // Batch lookup student UUIDs from student_ids (single query for performance)
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, student_id')
      .in('student_id', validStudentIds);

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return NextResponse.json(
        { error: 'Failed to lookup students' },
        { status: 500 }
      );
    }

    // Create lookup map: student_id (text) -> UUID
    const studentIdToUuid = new Map<string, string>();
    students?.forEach((student) => {
      studentIdToUuid.set(student.student_id, student.id);
    });

    // Identify invalid student IDs
    const invalidStudentIds: ValidationError[] = [];
    validStudentIds.forEach((studentId, index) => {
      if (!studentIdToUuid.has(studentId)) {
        invalidStudentIds.push({
          line: index + 2,
          student_id: studentId,
          error: 'Student ID not found in database',
        });
      }
    });

    if (invalidStudentIds.length > 0) {
      return NextResponse.json({
        success: 0,
        errors: invalidStudentIds.slice(0, 10),
        totalErrors: invalidStudentIds.length,
        skipped: 0,
      });
    }

    // Prepare registration data
    const registrationsData = validStudentIds.map((studentId) => ({
      student_id: studentIdToUuid.get(studentId)!,
      event_id: eventId,
      registered_at: new Date().toISOString(),
    }));

    // Bulk insert with duplicate handling (skip silently for idempotency)
    const { data: insertedRegistrations, error: insertError } = await supabase
      .from('registrations')
      .upsert(registrationsData, { 
        onConflict: 'student_id,event_id',
        ignoreDuplicates: true 
      })
      .select('id');

    if (insertError) {
      console.error('Error inserting registrations:', insertError);
      return NextResponse.json(
        { error: 'Failed to create registrations', details: insertError.message },
        { status: 500 }
      );
    }

    // Calculate skipped (duplicates)
    const inserted = insertedRegistrations?.length || 0;
    const skipped = validStudentIds.length - inserted;

    return NextResponse.json({
      success: inserted,
      errors: [],
      totalErrors: 0,
      skipped,
      eventName: event.name,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error in registration bulk import:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
