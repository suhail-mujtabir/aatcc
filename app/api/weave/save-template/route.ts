import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const template = await req.json();

    // Validate template structure
    if (!template.name || !template.pattern || !template.width || !template.height) {
      return NextResponse.json(
        { error: 'Invalid template structure' },
        { status: 400 }
      );
    }

    // Read current templates.ts file
    const templatesPath = path.join(process.cwd(), 'app', 'weave', 'templates.ts');
    const fileContent = await fs.readFile(templatesPath, 'utf-8');

    // Generate new template code
    const newTemplateCode = generateTemplateCode(template);

    // Find the position to insert (before the closing bracket of weaveTemplates array)
    const insertMarker = '];';
    const insertPosition = fileContent.lastIndexOf(insertMarker);

    if (insertPosition === -1) {
      return NextResponse.json(
        { error: 'Could not find insertion point in templates.ts' },
        { status: 500 }
      );
    }

    // Insert new template (add comma before if needed)
    const beforeInsert = fileContent.substring(0, insertPosition);
    const afterInsert = fileContent.substring(insertPosition);
    
    // Check if we need a comma (if there's content before the closing bracket)
    const needsComma = beforeInsert.trim().endsWith('}');
    const separator = needsComma ? ',\n' : '\n';

    const newContent = beforeInsert + separator + newTemplateCode + '\n' + afterInsert;

    // Write back to file
    await fs.writeFile(templatesPath, newContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Template "${template.name}" saved to templates.ts`
    });

  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json(
      { error: 'Failed to save template', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// New PUT endpoint for updating existing templates
export async function PUT(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const template = await req.json();

    // Validate template structure
    if (!template.id || !template.name || !template.pattern || !template.width || !template.height) {
      return NextResponse.json(
        { error: 'Invalid template structure. ID is required for updates.' },
        { status: 400 }
      );
    }

    // Read current templates.ts file
    const templatesPath = path.join(process.cwd(), 'app', 'weave', 'templates.ts');
    let fileContent = await fs.readFile(templatesPath, 'utf-8');

    // Generate updated template code
    const updatedTemplateCode = generateTemplateCode(template);

    // Find the template by ID using regex
    const templateRegex = new RegExp(
      `\\{\\s*id:\\s*['"\`]${template.id}['"\`][^}]*?\\}(?=\\s*[,\\]])`,
      'gs'
    );

    // More robust: Find the template object including nested arrays
    const findTemplatePattern = new RegExp(
      `(\\{\\s*id:\\s*['"]${template.id}['"][\\s\\S]*?pattern:\\s*\\[)[\\s\\S]*?(\\][\\s\\S]*?\\})`,
      'g'
    );

    if (!findTemplatePattern.test(fileContent)) {
      return NextResponse.json(
        { error: `Template with id "${template.id}" not found in templates.ts` },
        { status: 404 }
      );
    }

    // Reset regex lastIndex
    fileContent = fileContent.replace(
      new RegExp(
        `\\{\\s*id:\\s*['"]${template.id}['"][\\s\\S]*?pattern:\\s*\\[[\\s\\S]*?\\][\\s\\S]*?\\}`,
        'g'
      ),
      updatedTemplateCode
    );

    // Write back to file
    await fs.writeFile(templatesPath, fileContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Template "${template.name}" updated in templates.ts`
    });

  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateTemplateCode(template: any): string {
  const { id, name, category, difficulty, width, height, pattern, description, applications, warpColor, weftColor } = template;

  // Format pattern array with proper indentation
  const patternStr = pattern.map((row: number[]) => 
    `    [${row.join(', ')}]`
  ).join(',\n');

  return `  {
    id: '${id}',
    name: '${name}',
    category: '${category}',
    difficulty: '${difficulty}',
    width: ${width},
    height: ${height},
    pattern: [
${patternStr}
    ],
    description: '${description.replace(/'/g, "\\'")}',
    applications: '${applications.replace(/'/g, "\\'")}',
    warpColor: '${warpColor}',
    weftColor: '${weftColor}'
  }`;
}
