# LifeLog AI Design Guidelines

## Design Approach

**Selected Approach:** Design System - Material Design with Privacy-Focused Adaptations

**Justification:** LifeLog AI is a utility-focused productivity tool managing sensitive personal data. Users need efficiency, consistency, and trust. Material Design provides robust patterns for data-heavy interfaces while allowing customization for privacy-centric experiences.

**Key Design Principles:**
1. **Trust Through Clarity:** Transparent data organization with clear categorization
2. **Frictionless Input:** Minimal steps from upload to insight
3. **Information Hierarchy:** Dense data presented without overwhelming users
4. **Privacy by Design:** Visual cues reinforcing security and personal ownership

---

## Typography System

**Font Families:**
- Primary: Inter (headings, UI elements, data labels)
- Secondary: IBM Plex Mono (numerical data, timestamps, categories)

**Type Scale:**
- Hero/Dashboard Headers: text-4xl font-bold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-base font-normal (16px)
- Metadata/Timestamps: text-sm font-normal (14px)
- Labels/Tags: text-xs font-medium uppercase tracking-wide (12px)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, 8, 12, 16**
- Tight spacing (tags, inline elements): space-x-2, gap-2
- Standard spacing (cards, forms): p-4, gap-4, space-y-6
- Section spacing: py-8, my-12
- Page margins: px-4 (mobile), px-8 (tablet), px-16 (desktop)

**Grid System:**
- Dashboard: 3-column grid (lg:grid-cols-3) for stat cards
- Timeline: Single column with max-w-4xl centering
- Upload area: 2-column (md:grid-cols-2) for multi-modal inputs
- Insights cards: 2-column (md:grid-cols-2) for comparisons

**Container Widths:**
- Full-width dashboards: max-w-7xl mx-auto
- Content areas: max-w-4xl mx-auto
- Forms/inputs: max-w-2xl mx-auto

---

## Component Library

### Navigation
**Top App Bar (Desktop/Tablet):**
- Fixed position with backdrop blur
- Left: Logo + App name (text-xl font-bold)
- Center: Primary navigation links (Dashboard, Timeline, Upload, Insights, Profile)
- Right: Quick upload button + user avatar
- Height: h-16, padding: px-8

**Bottom Navigation (Mobile):**
- Fixed bottom bar with 5 icons
- Active state: filled icon with label
- Inactive: outline icon only
- Height: h-16

### Dashboard Cards
**Stat Cards (3-column grid):**
- Card structure: rounded-lg border with p-6
- Icon top-left (24px, category-specific)
- Label: text-sm uppercase tracking-wide
- Value: text-3xl font-bold
- Change indicator: text-sm with trend arrow (↑↓)
- Subtle background pattern/gradient per category

**Chart Cards:**
- Full-width or 2-column
- Card header with title (text-xl) + date range selector
- Chart area with padding p-6
- Use recharts or similar for visualizations
- Legend bottom-aligned

### Timeline/Feed
**Entry Cards (chronological list):**
- Each entry: rounded-lg border mb-4 p-4
- Header row: Category badge (left) + timestamp (right)
- Content area varies by type:
  - **Receipt:** Thumbnail (left), merchant/amount/extracted data (right)
  - **Life Incident:** Title + emotion tags + collapsible full entry
  - **Car Log:** Odometer icon + reading + mileage calculation
- Footer: AI-generated tags (rounded-full badges text-xs gap-2)

### Upload Interface
**Multi-Modal Upload Grid (2-column on desktop):**
- Upload Card 1: Image/Receipt Upload
  - Large drop zone with dashed border
  - Camera icon + "Tap to upload or drag receipt"
  - File type indicators
- Upload Card 2: Quick Text Entry
  - Textarea with placeholder
  - Voice note button (bottom-right)
- Upload Card 3: Life Incident Journal
  - Structured form fields
  - Emotion selector (chip buttons)
- Upload Card 4: Car Data Entry
  - Number input for odometer
  - Fuel amount/cost fields

**Upload Flow Modal:**
- Full-screen on mobile, centered modal on desktop
- Step indicator (1/3, 2/3, 3/3)
- Preview extracted data
- Category auto-selection with manual override
- Save button: w-full on mobile, inline on desktop

### Insights & AI Q&A
**Insight Cards:**
- Gradient border accent (subtle)
- AI sparkle icon (top-left)
- Insight title: text-lg font-semibold
- Supporting data visualization or comparison
- "Learn more" expansion for details

**Q&A Interface:**
- Chat-style layout (max-w-3xl centered)
- User questions: right-aligned, rounded-2xl
- AI responses: left-aligned with analysis cards
- Input bar: fixed bottom with rounded-full input + send button

### Forms & Inputs
**Input Fields:**
- Standard height: h-12
- Border: rounded-lg with focus ring
- Label: text-sm font-medium mb-2
- Helper text: text-xs below input
- Error state: red accent with icon

**Buttons:**
- Primary CTA: rounded-lg px-6 py-3 font-medium
- Secondary: border variant
- Icon buttons: rounded-full p-3
- Upload buttons: dashed border, larger hit area

**Category Badges:**
- Small pills: rounded-full px-3 py-1 text-xs font-medium
- Each category has distinct treatment
- Fuel: with fuel pump icon
- Groceries: cart icon
- Life Event: calendar icon
- Emotions: heart/mood icon

### Data Display
**Comparison Tables:**
- Responsive table with sticky header
- Zebra striping for readability
- Mobile: cards instead of table rows
- Sortable columns with arrow indicators

**Progress Indicators:**
- Linear progress bars for budget tracking
- Circular progress for completion metrics
- Percentage displays with trend context

---

## Responsive Behavior

**Breakpoints:**
- Mobile: < 768px (single column, bottom nav, full-width cards)
- Tablet: 768px - 1024px (2-column grids, top nav)
- Desktop: > 1024px (3-column grids, sidebar option)

**Mobile Optimizations:**
- Large touch targets (min 44px)
- Sticky bottom upload FAB (floating action button)
- Swipe gestures for timeline navigation
- Collapsible sections for dense data

---

## Micro-interactions

**Minimal, Purposeful Animations:**
- Card hover: subtle lift (translate-y-1) + shadow increase
- Upload success: checkmark fade-in
- Data refresh: subtle pulse on stat cards
- Category badge assignment: slide-in from categorizer
- NO scroll-triggered animations
- NO complex transitions

---

## Privacy-Centric Visual Elements

**Security Indicators:**
- Lock icon on sensitive entries
- "Local only" badge for encrypted data
- Privacy mode toggle (top-right)
- Visual encryption indicator on upload confirmation

**Data Ownership Reinforcement:**
- "Your Data" heading on dashboard
- Personal pronouns throughout ("Your spending", "Your insights")
- Export/download always visible
- Deletion options clearly accessible

---

## Images

**Hero Image:** NO traditional hero section. This is a utility app that leads directly into the dashboard upon login.

**Receipt/Document Thumbnails:**
- Small thumbnails in timeline (64px × 64px, rounded)
- Expandable to full-size modal on click
- Placeholder for processing state

**Illustration Usage:**
- Empty states: Simple line illustrations (e.g., empty timeline, no data yet)
- Onboarding: 3-4 screens with minimal illustrations explaining upload → categorize → insights flow
- Error states: Friendly illustration with actionable message

**Icon System:**
- Material Icons via CDN for consistency
- Category-specific icons (24px standard, 20px for badges)
- Maintain visual weight across icon set

---

## Special Considerations

**Dashboard Entry Point:** First screen shows overview stats, recent activity preview, quick upload options. Information-dense but organized.

**Timeline Filtering:** Sticky filter bar with category chips, date range picker, search input.

**AI Transparency:** All AI-generated insights clearly labeled with sparkle icon and "AI Insight" badge.

**Accessibility:** ARIA labels on all interactive elements, keyboard navigation for power users, consistent focus states throughout.