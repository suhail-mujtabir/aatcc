# Weave Studio - Feature Documentation

## Version History
- **v1.0** (March 9, 2026) - Initial zoom implementation
- **v1.1** (March 9, 2026) - Fixed: Only fabric pattern zooms, color bars excluded
- **v2.0** (March 9, 2026) - Added: Template system with 12 classic weave patterns
- **v2.1** (March 10, 2026) - Added: Save custom templates to templates.ts (dev only)
- **v2.2** (March 10, 2026) - Added: Mouse wheel zoom, template thumbnails, weaving animation, pattern tutorial
- **v2.3** (March 10, 2026) - Added: Visual Tutorial Editor for custom pattern-specific tutorials

---

## 🎨 Version 2.0: Weave Templates (March 2026)

### Overview
Template library providing instant access to 12 classic textile weave patterns, organized by category and difficulty level. Allows users to learn weaving fundamentals and experiment with professional patterns.

### Template Categories

**1. Basic Weaves (Beginner)**
- Plain Weave (4×4) - The fundamental structure
- Basket Weave 2×2 (8×8) - Checkerboard texture
- Rib Weave 2×1 (8×8) - Horizontal ribs

**2. Twills (Beginner-Intermediate)**
- Twill 2/2 (8×8) - Classic 45° diagonal
- Twill 3/1 (8×8) - Warp-faced twill
- Herringbone (8×8) - V-shaped zigzag
- Diamond Twill (8×8) - Diamond shapes

**3. Satins (Intermediate)**
- Satin 5-Shaft (10×10) - Lustrous smooth surface

**4. Pattern Weaves (Intermediate-Advanced)**
- Houndstooth (8×8) - Classic check pattern
- Bird's Eye (8×8) - Small diamond motifs
- Honeycomb (8×8) - 3D hexagonal cells
- Monk's Belt (8×8) - Traditional colonial pattern

### Implementation Details

**Template Data Structure:**
```typescript
interface WeaveTemplate {
  id: string;
  name: string;
  category: 'basic' | 'twills' | 'satins' | 'patterns';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  width: number;
  height: number;
  pattern: number[][];
  description: string;
  applications: string;
  warpColor?: string;
  weftColor?: string;
}
```

**User Interface:**
- Desktop: Dropdown button in header bar between zoom and action buttons
- Mobile: Scrollable list in drawer menu
- Visual indicators: Difficulty badges, grid dimensions, category icons
- Hover descriptions showing pattern use cases

**Loading Behavior:**
1. Template selected → Grid dimensions adjusted automatically
2. Pattern array loaded into grid
3. Colors set to template defaults (e.g., black/white, indigo/white)
4. Zoom reset to 100% for optimal viewing
5. No confirmation dialog (instant load)

### Files Modified
- `app/weave/templates.ts` (new) - Template data and utilities
- `app/weave/page.tsx` - `loadTemplate()` function
- `app/weave/WeaveHeader.tsx` - Template dropdown UI

---

## 💾 Version 2.1: Save Custom Templates (March 10, 2026)

### Overview
Development-only feature that allows saving the current canvas directly to `templates.ts` file, making custom patterns persist in production and available to all users.

### How It Works

**Development Mode Only:**
- 💾 Save button appears only when `NODE_ENV === 'development'`
- Disabled in production builds for security
- Uses API route to write to filesystem

**Saving Process:**
1. Click "💾 Save" button in header (desktop) or drawer (mobile)
2. Enter template details via prompts:
   - Name (required)
   - Description (required)
   - Category: `basic`/`twills`/`satins`/`patterns`
   - Difficulty: `beginner`/`intermediate`/`advanced`
   - Applications: Real-world uses
3. API writes template to `templates.ts`
4. Template appears in dropdown after page refresh

**What Gets Saved:**
- Grid dimensions (width × height)
- Pattern array (complete 2D grid state)
- First warp color (applied to all warp threads)
- First weft color (applied to all weft threads)
- Metadata (name, category, difficulty, description, applications)

**File Structure:**
```typescript
// New template appended to weaveTemplates array
{
  id: 'custom-name',
  name: 'Custom Name',
  category: 'patterns',
  difficulty: 'intermediate',
  width: 12,
  height: 12,
  pattern: [
    [1, 0, 1, ...],
    [0, 1, 0, ...],
    ...
  ],
  description: 'Your description',
  applications: 'Your applications',
  warpColor: '#6366f1',
  weftColor: '#020617'
}
```

### Implementation Details

**API Route:** `/api/weave/save-template/route.ts`
- POST endpoint protected by `NODE_ENV` check
- Reads `templates.ts` using Node.js `fs.promises`
- Generates properly formatted TypeScript code
- Appends new template before closing bracket `];`
- Preserves file formatting and indentation

**Security:**
- Only accessible in development mode
- Returns 403 Forbidden in production
- Validates template structure before writing
- Error handling for file operations

**Limitations:**
- No undo functionality (manual Git revert needed)
- Overwrites are not possible (creates duplicates)
- Requires manual code review before Git commit
- Template ID must be unique (uses kebab-case name)

### Files Created/Modified
- `app/api/weave/save-template/route.ts` (new) - API endpoint for file writing
- `app/weave/page.tsx` - `saveAsTemplate()` function with fetch
- `app/weave/WeaveHeader.tsx` - Save button UI (desktop + mobile)

---

## 🎯 Version 2.2: Enhanced Features (March 10, 2026)

### Overview
Four major enhancements: mouse wheel zoom, template visual previews, animated weaving process, and interactive pattern tutorial system.

### 1. Mouse Wheel Zoom

**Controls:**
- **Ctrl + Scroll Up** - Zoom in (10% increments)
- **Ctrl + Scroll Down** - Zoom out (10% increments)
- Range: 25% to 300%
- Only works when cursor is over the fabric canvas area

**Implementation:**
- Event listener attached to `#fabric-canvas-container`
- Checks `e.ctrlKey` before zooming
- Prevents default browser zoom behavior with `e.preventDefault()`
- Smooth 10% steps (finer control than +/- buttons which use 25% steps)

**Benefits:**
- Faster zoom control for precise adjustments
- Industry-standard interaction (Ctrl+wheel)
- Doesn't interfere with page scrolling

### 2. Template Preview Thumbnails

**Visual Previews:**
- 40×40px miniature canvas renders of each template
- Shows actual pattern colors (warp/weft)
- Pixelated rendering for crisp weave structure
- Desktop dropdown: 40px thumbnails on left
- Mobile drawer: 32px thumbnails on left

**Implementation:**
- `generateThumbnail()` function creates canvas preview
- Cached in state to avoid re-rendering (Record<id, dataUrl>)
- Renders pattern.map() with proper color mapping
- Uses `imageRendering: 'pixelated'` CSS for clarity

**Benefits:**
- Visual recognition of patterns at a glance
- Faster template selection
- Educational - see structure before loading

### 3. Weaving Animation

**Features:**
- Row-by-row weaving simulation
- Adjustable speed (100ms - 1000ms per row)
- Play/Pause/Reset controls
- Highlights current row being woven (blue border)
- Progress indicator (Row X / Y)

**Access:**
- Click "Animate" button (🎮 Play icon) in header
- Opens full-screen modal overlay

**Implementation:**
- `WeavingAnimation.tsx` component
- Interval-based row progression
- 30px cells for clear visualization
- Canvas redraws on each row update
- Speed slider for pacing control

**Educational Value:**
- Demonstrates weaving sequence
- Shows how pattern builds row by row
- Helps understand weft thread insertion process

### 4. Pattern Tutorial Mode

**Interactive Guide:**
- 5-step tutorial for each template
  1. Pattern Overview
  2. Warp Threads (Vertical) - highlights column
  3. Weft Threads (Horizontal) - highlights row
  4. Thread Interlacement - explains 1s and 0s
  5. Repeating Pattern - shows tiling concept

**Controls:**
- Previous/Next navigation buttons
- Step indicator dots (clickable)
- Progress: "Step X of 5"
- Close button (X)

**Access:**
- Click 📖 BookOpen icon next to any template
- Loads template and opens tutorial automatically

**Visual Highlights:**
- Dimmed non-relevant areas (30% opacity)
- Blue border for warp threads
- Green border for weft threads
- Orange border for cell interlacement
- 40px cells for detailed view

**Implementation:**
- `PatternTutorial.tsx` component
- Dynamic highlighting based on current step
- Canvas redraws with overlays
- Step-by-step descriptions

**Educational Benefits:**
- Explains weaving terminology
- Visual reinforcement of concepts
- Self-paced learning
- Accessible for beginners

### Files Created
- `app/weave/WeavingAnimation.tsx` - Row-by-row animation component
- `app/weave/PatternTutorial.tsx` - Interactive 5-step tutorial system

### Files Modified
- `app/weave/page.tsx` - Added `handleWheelZoom`, passed grid/colors to header
- `app/weave/FabricCanvas.tsx` - Added wheel event listener, `onWheelZoom` prop
- `app/weave/WeaveHeader.tsx` - Thumbnail generation, animation/tutorial buttons, modal renders

---

## 🎓 Version 2.3: Tutorial Editor System (March 10, 2026)

### Overview
Visual tutorial editor allowing developers to create pattern-specific interactive tutorials directly in the browser during development. Tutorials are saved to `tutorials.json` and deployed to production, providing customized educational experiences for each weave pattern.

### Problem Solved
- **Before v2.3:** All patterns shared the same generic 5-step tutorial
- **After v2.3:** Each pattern can have custom tutorials highlighting unique characteristics (twill diagonals, satin floats, basket groupings, etc.)
- **Developer Experience:** No manual JSON editing - visual interface with live preview

### Key Features

#### 1. **Visual Tutorial Editor (Dev Only)**
- Opens in modal overlay with 3-panel layout:
  - **Left Panel:** Step list with add/delete/reorder controls
  - **Center Panel:** Live canvas preview with interactive cell selection
  - **Right Panel:** Step editor (title, description, highlight type)
- Click canvas cells to set highlight positions
- Real-time preview shows exactly what users will see

#### 2. **Enhanced Highlight Types**
- `none` - No highlighting (overview steps)
- `warp` - Blue column highlight (vertical threads)
- `weft` - Green row highlight (horizontal threads)  
- `cell` - Single orange cell (specific intersection)
- `cells` - **NEW:** Multiple orange cells (complex patterns, diagonals, floats)

#### 3. **Tutorial Data Management**
- **Development:** Edit tutorials in browser, save to `tutorials.json`
- **Production:** Load tutorials from committed `tutorials.json`
- **Fallback:** Default 5-step generic tutorial if no custom tutorial exists
- **Git Workflow:** Commit `tutorials.json` → Deploy to production

#### 4. **Pattern-Specific Tutorials**
Default tutorials created for:
- **Plain Weave:** Checkerboard structure, maximum interlacement
- **Twill 2/2:** Diagonal line formation, 2-thread grouping
- **Basket Weave 2×2:** Block patterns, thread grouping
- **Satin 5-Shaft:** Long floats, offset interlacement

### Implementation Details

**Files Created:**
```
public/tutorials.json                 # Tutorial configurations
app/weave/TutorialEditor.tsx          # Visual editor component
app/api/tutorials/save/route.ts       # Save API endpoint
```

**Files Modified:**
```
app/weave/PatternTutorial.tsx     # Enhanced: 'cells' highlight type, load from JSON
app/weave/WeaveHeader.tsx         # Added: Edit Tutorial button, tutorial loading
```

**Tutorial JSON Structure:**
```json
{
  "pattern-id": {
    "steps": [
      {
        "title": "Step Title",
        "description": "Detailed explanation...",
        "highlightType": "cells",
        "highlightCells": [
          {"row": 0, "col": 0},
          {"row": 1, "col": 1}
        ]
      }
    ]
  }
}
```

### User Interface

**Development Mode:**
- **Edit Tutorial Button:** Amber/yellow Edit2 icon next to each template's Tutorial button
- **Tutorial Editor Modal:**
  - Three-panel layout (step list, canvas, editor)
  - "Add Step" button to create new steps
  - Drag-and-drop step reordering (up/down arrows)
  - Delete step button (red trash icon)
  - Click canvas cells to set highlights
  - "Save Tutorial" button → Writes to `tutorials.json`
  - "Export JSON" button → Downloads tutorial for sharing

**Production Mode:**
- No Edit Tutorial buttons visible
- Tutorials load from `tutorials.json`
- Falls back to default tutorial if not found

### Developer Workflow

1. **Start Dev Server:** `npm run dev`
2. **Open Template:** Select pattern from dropdown
3. **Click Edit Tutorial:** Amber Edit2 icon (dev only)
4. **Create Tutorial:**
   - Add/remove/reorder steps
   - Write title and description
   - Select highlight type (warp/weft/cell/cells)
   - Click canvas cells to set highlights
5. **Preview:** Test tutorial flow with Preview button
6. **Save:** Click "Save Tutorial" → Updates `tutorials.json`
7. **Commit:** `git add app/weave/tutorials.json && git commit`
8. **Deploy:** Push to production

### Technical Features

**Enhanced TutorialStep Type:**
```typescript
export type TutorialStep = {
  title: string;
  description: string;
  highlightType: 'warp' | 'weft' | 'cell' | 'cells' | 'none';
  highlightIndex?: number;        // For warp/weft
  highlightRow?: number;          // For cell
  highlightCol?: number;          // For cell
  highlightCells?: {              // NEW: For cells
    row: number;
    col: number;
  }[];
};
```

**Multiple Cell Highlighting:**
- Click cells to toggle in/out of highlight array
- Orange borders drawn around all selected cells
- Perfect for showing diagonals, floats, grouped structures
- "Clear All Cells" button to reset selection

**API Endpoint:**
- `POST /api/tutorials/save`
- Dev-only (returns 403 in production)
- Reads/writes `app/weave/tutorials.json`
- Updates specific pattern, preserves others

### Educational Benefits

**Pattern-Specific Learning:**
- Plain Weave → Focus on checkerboard alternation
- Twill → Emphasize diagonal progression
- Satin → Highlight long floats and offset
- Basket → Show grouped thread blocks

**Enhanced Comprehension:**
- Multi-cell highlights for complex features
- Custom descriptions explaining unique characteristics
- Step-by-step progression tailored to pattern complexity

**Self-Service Tutorial Creation:**
- No manual JSON editing required
- Visual interface reduces errors
- Live preview ensures accuracy

---

## 🔍 Zoom Feature (v1.0-1.1)

### Overview
Zoom in/out functionality for the Fabric Canvas, allowing users to view weave patterns from far away (overall design) or close up (detailed inspection).

### ⚠️ Correction Note (March 9, 2026)

**Initial Mistake:** 
The first implementation incorrectly applied zoom to the entire canvas, including the weft (left) and warp (bottom) color bars. This made the color bars scale along with the fabric, which was not the intended behavior.

**What Was Corrected:**
- Split the canvas into three separate layers:
  1. Weft color bar (left, 20px wide) - stays at 100% zoom
  2. Fabric pattern area - zoomable from 25% to 300%
  3. Warp color bar (bottom, 20px high) - stays at 100% zoom
- Only the fabric weave pattern (middle area) is now affected by zoom
- Color bars remain fixed at their original size for consistent reference
- Used CSS absolute positioning with proper z-index layering

**Why This Matters:**
- Users need the color bars as a constant reference when examining zoomed fabric
- Color bars are UI controls - they should always be easily clickable at normal size
- The fabric pattern is what users want to examine closely, not the color selectors

## Implementation Details

### Current Implementation (March 2026 - Corrected)

**Zoom Range:** 25% to 300% (in 25% increments)
- 25% - Far view (overall pattern)
- 50%, 75% - Medium view
- 100% - Default view
- 125%, 150%, 175%, 200%, 225%, 250%, 275%, 300% - Close-up views

**Zoom Behavior:**
- **Transform Origin:** Top-left corner (anchored)
- When zooming in/out, the top-left corner of the fabric pattern stays fixed
- Fabric pattern expands/contracts from that corner point
- **Color bars remain at 100% zoom** - they do not scale
- Uses CSS `transform: scale()` with `transform-origin: top left`
- Three-layer canvas architecture:
  - Layer 1: Weft color bar (z-index: 2, fixed position left)
  - Layer 2: Fabric pattern (z-index: 1, zoomable, offset by 20px)
  - Layer 3: Warp color bar (z-index: 2, fixed position bottom)

**User Interface:**

1. **Desktop (WeaveHeader):**
   - Zoom Out button (−) with ZoomOut icon
   - Zoom percentage display (e.g., "100%")
   - Zoom In button (+) with ZoomIn icon
   - Reset Zoom button with Maximize2 icon
   - Buttons disabled when at min/max limits
   - Located in header bar between dimension controls and action buttons

2. **Mobile (Drawer):**
   - Same controls in mobile drawer
   - Stepper layout with +/− buttons
   - "Reset to 100%" link below

**Components Modified:**
- `app/weave/page.tsx` - Zoom state management
- `app/weave/WeaveHeader.tsx` - Zoom controls UI
- `app/weave/FabricCanvas.tsx` - Zoom transform application

### Code Structure

```tsx
// State in page.tsx
const [zoom, setZoom] = useState(100);

// Zoom functions
const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
const handleZoomReset = () => setZoom(100);

// Applied in FabricCanvas - Three separate canvases
// 1. Weft bar (left, 20px x 280px) - always 100%
<canvas ref={weftBarCanvasRef} className="absolute top-0 left-0" />

// 2. Fabric pattern (1260px x 280px) - zoomable
<div style={{
  transform: `scale(${zoom / 100})`,
  transformOrigin: 'top left',
  left: '20px' // offset for weft bar
}}>
  <canvas ref={fabricCanvasRef} />
</div>

// 3. Warp bar (bottom, 1280px x 20px) - always 100%
<canvas ref={warpBarCanvasRef} className="absolute bottom-0" />
```

---

## Future Considerations

### Zoom Enhancements
1. ~~**Mouse Wheel Zoom** - Scroll to zoom in/out (optional: Ctrl+scroll)~~ ✅ **IMPLEMENTED in v2.2** (Ctrl+wheel, 10% steps)
2. **Pan/Drag When Zoomed In** - Move canvas when zoom > 100%
3. **Keyboard Shortcuts** - +/- keys for zoom, 0 for reset
4. **Zoom to Fit** - Auto-calculate optimal zoom for current window
5. **Zoom Presets** - Quick buttons for 50%, 100%, 200%

### Template System Enhancements
6. ~~**Custom Template Saving** - Save current grid as user template with name/description to localStorage~~ ✅ **IMPLEMENTED in v2.1** (saves to templates.ts)
7. ~~**Template Preview Thumbnails** - Visual miniature preview in dropdown menu~~ ✅ **IMPLEMENTED in v2.2** (40×40px canvas renders)
8. **Template Export/Import** - Download/upload templates as JSON files for sharing
9. ~~**Animated Pattern Preview** - Weaving animation showing thread interlacement process~~ ✅ **IMPLEMENTED in v2.2** (row-by-row modal)
10. ~~**Pattern Tutorial Mode** - Interactive guide explaining structure, highlighting warp/weft movement~~ ✅ **IMPLEMENTED in v2.2** (5-step interactive guide)
11. **Search/Filter Templates** - Search by name, filter by category/difficulty/size
12. **Template Variations** - Generate color schemes for existing patterns (monochrome, complementary, etc.)
13. **Template Editing** - ~~Edit/update existing templates in templates.ts~~ ✅ **IMPLEMENTED in v2.1** (PUT endpoint)
14. **Template Deletion** - Remove templates from templates.ts (dev mode)

---

## Testing Checklist

### v1.0-1.1 Zoom Features
- [x] Zoom in works (up to 300%)
- [x] Zoom out works (down to 25%)
- [x] Reset zoom returns to 100%
- [x] Buttons disabled at limits (25% and 300%)
- [x] Mobile drawer has zoom controls
- [x] Canvas anchors at top-left corner
- [x] Overflow scrolling works when zoomed in
- [x] Color bars remain at 100% (not affected by zoom)
- [x] Fabric pattern tiles to fill viewport at all zoom levels
- [x] No performance lag at 25% zoom

### v2.0 Template Features
- [x] All 12 templates load correctly
- [x] Template categories display (basic, twills, satins, patterns)
- [x] Difficulty badges show correct colors (beginner/intermediate/advanced)
- [x] Grid dimensions displayed accurately
- [x] Template descriptions visible (line-clamped on hover)
- [x] Desktop dropdown menu functional
- [x] Mobile drawer template list scrollable
- [x] Template loading adjusts grid dimensions
- [x] Preset colors applied (e.g., indigo for Twill 2/2)
- [x] Pattern arrays loaded correctly

### v2.1 Save/Edit Template Features (Dev Only)
- [x] Save button visible only in development mode
- [x] Prompts collect all required metadata
- [x] API validates template structure
- [x] Template written to templates.ts with proper formatting
- [x] Pattern array preserved correctly
- [x] Colors captured from first thread
- [x] Template appears in dropdown after refresh
- [x] Production mode blocks API access (403 Forbidden)
- [x] Edit button appears next to each template
- [x] PUT endpoint updates existing templates
- [x] Edit loads template into canvas first
- [x] Prompts pre-filled with current values

### v2.2 Enhanced Features
- [x] Ctrl+wheel zoom works on canvas area
- [x] Zoom doesn't interfere with page scroll
- [x] 10% increments for fine control
- [x] Template thumbnails render (40×40px)
- [x] Thumbnails show correct colors
- [x] Thumbnails cached for performance
- [x] Animation button opens modal
- [x] Row-by-row animation plays
- [x] Speed slider adjusts pace (100-1000ms)
- [x] Animation highlights current row
- [x] Tutorial button (📖) next to templates
- [x] 5-step tutorial navigates correctly
- [x] Warp/weft/cell highlighting works
- [x] Step indicator dots clickable
- [x] Modals close with X button

### v2.3 Tutorial Editor Features (Dev Only)
- [x] Edit Tutorial button visible in dev mode only
- [x] Tutorial editor modal opens with 3-panel layout
- [x] Step list shows all steps with reorder controls
- [x] Canvas preview updates in real-time
- [x] Click canvas cells to set highlights
- [x] Multiple cell selection works (cells type)
- [x] Title/description editors update state
- [x] Highlight type selector changes behavior
- [x] Add step creates new tutorial step
- [x] Delete step removes from list (min 1 step)
- [x] Up/down arrows reorder steps
- [x] Save button writes to tutorials.json
- [x] Export JSON downloads tutorial file
- [x] PatternTutorial loads custom steps from JSON
- [x] Fallback to default tutorial works
- [x] Production blocks tutorial editing (403)
- [x] tutorials.json created with 4 default patterns

### Future Testing (When Implemented)
- [ ] Keyboard shortcuts for zoom (±0 keys)
- [ ] Pan/drag when zoomed in
- [ ] Pinch gesture on mobile/trackpad
- [ ] Template export/import as JSON
- [ ] Template search/filter functionality
- [ ] Color scheme variations generator
- [ ] Template deletion (dev mode)

---

## Known Limitations

### Zoom System (v1.0-1.1)
1. **No pan/drag yet** - When zoomed in, users must use scrollbars to navigate
2. **Fixed increments** - Only 25% steps, no smooth slider yet
3. **No zoom animation** - Instant zoom change (could add CSS transition)
4. **No zoom memory** - Resets to 100% on page reload
5. **Canvas quality** - May appear pixelated at very high zoom levels (could render at higher resolution)
6. **Click handling complexity** - Color bar clicks work directly, fabric clicks require coordinate translation due to layered structure

### Template System (v2.0)
7. **No custom templates** - ~~Users cannot save their own creations yet~~ ✅ **FIXED in v2.1** (dev-only save to templates.ts)
8. **No template search** - Must browse all 12+ templates sequentially
9. **No preview** - ~~Dropdown shows text only, no visual thumbnail~~ ✅ **FIXED in v2.2** (40×40px thumbnails)
10. **No undo on load** - Template loading is instant and irreversible (overwrites current work)
11. **Limited patterns** - Only 12 classic templates available (can add more via Save feature in dev)
12. **Static colors** - Template colors are fixed (no color scheme variations)
13. **No template editing** - ~~Cannot update existing templates via UI~~ ✅ **FIXED in v2.1** (PUT endpoint)
14. **No template deletion** - Cannot remove templates via UI (manual file edit required)

### Tutorial System (v2.2-2.3)
15. **Generic tutorials** - ~~All patterns use same 5-step tutorial~~ ✅ **FIXED in v2.3** (pattern-specific tutorials)
16. **No tutorial editor** - ~~Must manually edit code to create tutorials~~ ✅ **FIXED in v2.3** (visual editor)
17. **Limited highlight types** - ~~Single cell only~~ ✅ **FIXED in v2.3** (multi-cell support)
18. **Incomplete tutorial library** - Only 4 patterns have custom tutorials (Plain, Twill, Basket, Satin)
19. **No tutorial versioning** - Cannot track tutorial changes over time
20. **No tutorial preview in list** - Must open tutorial to see content

---

## Related Files

### Core Files
- `/app/weave/page.tsx` - Main page with zoom/template/save/animation state management
- `/app/weave/WeaveHeader.tsx` - Controls, templates dropdown, animation/tutorial buttons, thumbnail generation, tutorial editor integration
- `/app/weave/FabricCanvas.tsx` - Three-layer canvas with zoom transform + wheel event listener
- `/app/weave/templates.ts` - Template data, categories, utilities
- `/public/tutorials.json` - **NEW in v2.3:** Tutorial configurations for pattern-specific guides
- `/app/weave/ColorConfigModal.tsx` - Thread color customization (First/Last Thread UI)
- `/app/weave/DraftEditor.tsx` - Not affected by zoom (as intended)
- `/app/weave/WeavingAnimation.tsx` - Row-by-row weaving animation modal
- `/app/weave/PatternTutorial.tsx` - Interactive pattern tutorial with custom step support
- `/app/weave/TutorialEditor.tsx` - **NEW in v2.3:** Visual tutorial editor (dev only)
- `/app/api/weave/save-template/route.ts` - API endpoint for saving/updating templates (dev only)
- `/app/api/tutorials/save/route.ts` - **NEW in v2.3:** API endpoint for saving tutorials (dev only)

---

## Notes

### Zoom System (v1.0-2.2)
- **Only the fabric weave pattern zooms** - color bars stay at 100%
- Button controls: +25% increments (25%-300%)
- **Ctrl + Wheel**: 10% increments for fine control (v2.2)
- Weft bar (left) and Warp bar (bottom) remain fixed for easy color selection
- Zoom is visual only; doesn't affect underlying grid data
- Works on both desktop and mobile
- Color customization modal is unaffected by zoom
- Three-canvas architecture provides clean separation of concerns
- Performance optimized: constant canvas size (1260×280px), adjusts cell rendering

### Template System (v2.0-2.2)
- **12 classic weave patterns** based on textile industry research
- **4 categories**: Basic Weaves, Twills, Satins, Pattern Weaves
- **Difficulty levels**: Beginner (Plain, Basket, Rib), Intermediate (Twills, Satin, Houndstooth, Bird's Eye, Honeycomb), Advanced (Monk's Belt)
- **Visual previews (v2.2)**: 40×40px thumbnail renders in dropdown/drawer
- Templates include preset colors matching real-world applications (e.g., indigo/white for denim)
- Loading a template overwrites current grid (dimensions + pattern + colors)
- Grid sizes range from 4×4 to 10×10
- Each template includes description and real-world applications
- **Tutorial mode (v2.2)**: Click 📖 icon for 5-step interactive guide
- **Animation (v2.2)**: Click "Animate" button for row-by-row weaving simulation

### Save Template System (v2.1)
- **Development-only feature** - Disabled in production for security
- **Direct file writing** - Saves to `templates.ts` via API endpoint
- **Persistent** - Templates become part of codebase, available to all users after commit
- **Prompts for metadata** - Name, description, category, difficulty, applications
- **Captures current state** - Grid dimensions, pattern array, first thread colors
- **Proper formatting** - Generates valid TypeScript code with correct indentation
- **No undo** - Requires manual Git revert if mistake made
- **Security** - API validates structure and checks NODE_ENV
- **Edit existing (v2.1)**: Click ✏️ icon to update any template

### Enhanced Features (v2.2)
- **Mouse wheel zoom** - Ctrl+Scroll for 10% increments, only on canvas area
- **Visual thumbnails** - 40×40px canvas previews with cached rendering
- **Weaving animation** - Play/pause row-by-row simulation with speed control (100-1000ms)
- **Pattern tutorial** - 5-step interactive guide with warp/weft/cell highlighting
- **Educational focus** - Helps users understand weaving terminology and structure

### Tutorial Editor System (v2.3)
- **Visual editor (dev-only)** - Create pattern-specific tutorials in browser
- **3-panel interface** - Step list, canvas preview, step editor
- **Interactive cell selection** - Click canvas to set highlight positions
- **Enhanced highlight types** - Single cell, warp column, weft row, or multiple cells
- **Git-based workflow** - Save to `tutorials.json`, commit, deploy to production
- **Pattern-specific guides** - Twill diagonals, satin floats, basket groupings, etc.
- **Fallback system** - Default tutorial if no custom tutorial exists
- **JSON export** - Download tutorials for sharing or backup
- **Multi-cell highlighting** - Perfect for complex patterns (diagonals, floats)
- **Live preview** - See exactly what users will see while editing

---

**Last Updated:** March 10, 2026  
**Version:** 2.3  
**Status:** ✅ Implemented (Zoom + Templates + Save + Animation + Tutorial + Editor)


