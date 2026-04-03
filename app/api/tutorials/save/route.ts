import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Tutorial editing is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { patternId, steps } = body;

    if (!patternId || !steps) {
      return NextResponse.json(
        { error: 'Missing patternId or steps' },
        { status: 400 }
      );
    }

    // Read existing tutorials
    const tutorialsPath = path.join(process.cwd(), 'public', 'tutorials.json');
    let tutorials: any = {};

    if (fs.existsSync(tutorialsPath)) {
      const fileContent = fs.readFileSync(tutorialsPath, 'utf-8');
      tutorials = JSON.parse(fileContent);
    }

    // Update the specific pattern's tutorial
    tutorials[patternId] = { steps };

    // Write back to file
    fs.writeFileSync(tutorialsPath, JSON.stringify(tutorials, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Tutorial for ${patternId} saved successfully`
    });
  } catch (error) {
    console.error('Error saving tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to save tutorial' },
      { status: 500 }
    );
  }
}
