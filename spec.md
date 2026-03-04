# PDF Tools

## Current State
Full PDF + Image tools platform with 60+ tools, multi-role user system (normal, creator, sponsor, admin), marketplace, dashboards, mobile-optimized UI with bottom nav and sidebar, AI tools, and admin panel. The existing `/edit` page is a basic text annotation overlay tool using pdf-lib. No advanced visual PDF editor exists.

## Requested Changes (Diff)

### Add
- New page `AdvancedPDFEditor` at route `/edit-advanced` -- a full Canva/Word-like visual PDF editor built entirely in-browser
- **Top toolbar**: File (New/Open/Save/Export dropdown), Undo/Redo, Zoom In/Out controls, Page View Toggle, Preview Mode, Share button, AI Assistant panel, Download button
- **Tool mode buttons in top bar**: Selection, Edit PDF, Sign, Text, Erase, Highlight, Redact, Image, Arrow, Draw, Cross, Check, Sticky, More
- **Left sidebar with 8 tabs**: Pages (page thumbnails), Text (add heading/subheading/body/text box), Elements (shapes, QR, dividers), Uploads (drag image), Templates (Resume/Invoice/Certificate/Brochure/Poster), Forms (text field, checkbox, signature, date), Comments, Layers
- **Central canvas area**: renders uploaded PDF page via pdf-lib, drag-and-drop annotation objects with mouse events, resize handles on selected elements, snap grid, alignment guides
- **Right sidebar (dynamic properties panel)**: changes based on selected element type -- Font Settings, Size, Color, Alignment, Spacing, Position X/Y, Layer Order, Opacity, Border, Shadow, Effects
- **Text tools**: Heading/Subheading/Body/Custom Text Box, font family picker, size, bold/italic/underline toggles, text color, alignment (L/C/R/J), line height, text effects (shadow, outline, gradient)
- **Elements panel**: shapes (rect, circle, line, arrow), QR Code generator input, dividers
- **Image handling**: file upload, drag onto canvas, brightness/contrast/saturation sliders, filters (none/vintage/grayscale/warm)
- **Page control**: page thumbnail strip at bottom or in Pages tab, add/delete/duplicate/reorder pages
- **Template system**: Resume, Invoice, Certificate, Brochure, Poster -- each pre-fills the canvas with placeholder annotation objects
- **Forms panel**: drag-to-add Text Field, Checkbox, Signature placeholder, Date Field
- **Security panel**: Protect PDF toggle, Redact mode, Lock elements
- **AI panel (collapsible)**: AI Summarize Page, AI Rewrite Selected, AI Translate, AI Grammar Check (calls Gemini API from config)
- **Layers panel**: list all objects, rename, lock/unlock, show/hide, drag to reorder
- **Export options**: PDF (standard), PDF (print-ready), JPG of current page, selected pages only, compressed
- **Sign panel (right side)**: Signature, Initials, Text field, Date field, Check -- each with a "Create" button; signature modal has Draw/Type/Upload tabs
- **Galaxy animated background header** consistent with other tool pages (stars, nebula glow, purple/cyan/indigo)
- Route `/edit-advanced` added to App.tsx

### Modify
- **App.tsx**: add import for `AdvancedPDFEditor` and add route `/edit-advanced`
- **Home.tsx**: add "Advanced PDF Editor" tool card in the "Edit PDF" category with a distinct colored SVG icon (Canva-style wand/layers icon)

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/pages/AdvancedPDFEditor.tsx` -- full Canva-like editor:
   - Galaxy header with animated stars/nebula
   - Top toolbar with tool mode buttons and file/zoom/download controls
   - Left sidebar panel with 8 tabs (Pages, Text, Elements, Uploads, Templates, Forms, Comments, Layers)
   - Central canvas using HTML5 canvas + React state for annotation objects (CanvasElement type with id, type, x, y, w, h, props)
   - Right properties panel that renders dynamic controls based on selected element type
   - Sign panel as a right-side collapsible section
   - PDF upload triggers canvas display; annotation layer drawn on top via absolute-positioned divs
   - Export using pdf-lib to bake annotations onto PDF pages
   - All state managed locally (no backend calls required)
   - Use `data-ocid` markers on all interactive controls
2. Add import and route in `App.tsx`
3. Add tool card in `Home.tsx` "Edit PDF" category
