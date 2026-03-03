# PDF Tools

## Current State

A full PDF + Image tools platform with 60+ tools, multi-role user system (normal, creator, sponsor, admin), marketplace, dashboards, mobile-optimized UI with bottom nav and sidebar, AI tools, and admin panel. The existing `/edit` page is a basic text annotation overlay tool. No advanced visual PDF editor exists.

## Requested Changes (Diff)

### Add

- New page `AdvancedPDFEditor` at route `/edit-advanced` -- a full Canva/Word-like visual PDF editor
- Top toolbar with: File (New/Open/Save/Export), Undo/Redo, Zoom In/Out, Page View Toggle, Preview Mode, Share, AI Assistant, Download
- Tool mode buttons in top bar: Selection, Edit PDF, Sign, Text, Erase, Highlight, Redact, Image, Arrow, Draw, Cross, Check, Sticky, More
- Left sidebar with tabs: Pages (thumbnail), Text, Elements, Uploads, Templates, Forms, Comments, Layers
- Central canvas area: renders uploaded PDF page, drag-and-drop annotation objects, resize handles, snap grid, alignment guides
- Right sidebar (properties panel): changes dynamically based on selected element -- Font Settings, Size, Color, Alignment, Spacing, Position X/Y, Layer Order, Opacity, Border, Shadow, Effects
- Text tools: Heading/Subheading/Body/Custom Text Box, font family, size, bold/italic/underline, text color, alignment, line height, text effects (shadow, outline, gradient)
- Elements panel: shapes (rect, circle, line, arrow), QR Code generator, dividers
- Image handling: upload image, drag onto canvas, brightness/contrast/saturation, filters
- Page control: page thumbnail strip, add/delete/duplicate/reorder pages, multi-select
- Template system: Resume, Invoice, Certificate, Brochure, Poster -- each pre-fills canvas
- Forms panel: drag-to-add Text Field, Checkbox, Signature, Date Field
- Security panel: Protect PDF (password), Redact mode, Lock elements
- AI panel: AI Summarize Page, AI Rewrite Selected, AI Translate, AI Grammar Check
- Layers panel: show/rename/lock/hide/reorder layers
- Export: PDF (standard), PDF (print), JPG, selected pages, compressed
- Sign panel (right side, inspired by uploaded screenshot): Signature, Initials, Text field, Date field, Check -- each with a "Create" button
- Route added to App.tsx and linked from Home page under "Edit PDF" in the Editing Tools section
- Galaxy animated background header consistent with other tool pages

### Modify

- `App.tsx`: add import and route `/edit-advanced` for `AdvancedPDFEditor`
- `Home.tsx`: add "Advanced PDF Editor" card with its own icon in the Editing Tools section

### Remove

- Nothing removed

## Implementation Plan

1. Create `src/frontend/src/pages/AdvancedPDFEditor.tsx` -- full Canva-like editor with:
   - Top toolbar (file, tool modes, zoom, download, AI)
   - Left sidebar with 8 tabs (Pages, Text, Elements, Uploads, Templates, Forms, Comments, Layers)
   - Center canvas (PDF.js rendering, draggable annotation layer using React state)
   - Right properties panel (dynamic by selection type)
   - Sign panel (Signature, Initials, Text field, Date field, Check)
   - PDF upload and page thumbnail strip
   - Export to PDF using pdf-lib
   - All operations in-browser (no server needed)
2. Add route `/edit-advanced` in `App.tsx`
3. Add card on `Home.tsx` under Editing Tools
