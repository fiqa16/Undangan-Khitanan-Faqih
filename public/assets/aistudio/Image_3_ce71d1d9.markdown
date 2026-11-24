---
name: Choo-Choo Khitan Adventure
colors:
  surface: '#fbf8ff'
  surface-dim: '#d7d8f4'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2ff'
  surface-container: '#edecff'
  surface-container-high: '#e6e6ff'
  surface-container-highest: '#e0e0fc'
  on-surface: '#181a2e'
  on-surface-variant: '#5c403d'
  inverse-surface: '#2d2f44'
  inverse-on-surface: '#f1efff'
  outline: '#906f6b'
  outline-variant: '#e5bdb9'
  surface-tint: '#bd1119'
  primary: '#b20112'
  on-primary: '#ffffff'
  primary-container: '#d62828'
  on-primary-container: '#fff1ef'
  inverse-primary: '#ffb4ab'
  secondary: '#7d5800'
  on-secondary: '#ffffff'
  secondary-container: '#ffc24c'
  on-secondary-container: '#725000'
  tertiary: '#005f76'
  on-tertiary: '#ffffff'
  tertiary-container: '#007995'
  on-tertiary-container: '#e4f6ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000d'
  secondary-fixed: '#ffdea9'
  secondary-fixed-dim: '#f9bc47'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4100'
  tertiary-fixed: '#b7eaff'
  tertiary-fixed-dim: '#5bd5fc'
  on-tertiary-fixed: '#001f28'
  on-tertiary-fixed-variant: '#004e61'
  background: '#fbf8ff'
  on-background: '#181a2e'
  surface-variant: '#e0e0fc'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system celebrates an Indonesian *Walimatul Khitan* (boy's circumcision rite-of-passage) framed through a joyful storybook expedition: a cheerful little red steam train journeying through fluffy clouds, golden stars, and celebratory pennant banners. 

The emotional tone balances warmth, cultural gratitude (*syukuran khidmat*), and high-spirited childhood wonder. It reframes an intimidating traditional milestone into a brave explorer's proud triumph. The target audience comprises extended family members, neighborhood peers, and parents viewing on smartphones via chat apps (WhatsApp/Telegram). 

The visual movement blends **Playful Tactile Pop** with **Whimsical Storybook Minimalism**:
- Warm cloud-cream surfaces overlaid with ticket stubs, scalloped edges, and rail-track motifs.
- Soft dimensional layers using low-contrast pillowy shadows, rounded badges, and brass/gold accents.
- Cheerful visual metaphors: invitations styled as commemorative steam train golden-foil tickets, countdown modules shaped like station master pocket watches, and photo galleries laid out as connected passenger carriages.

## Colors

The palette radiates festive Indonesian warmth, drawing from celebration canopies, brass bells, and storybook locomotives:

- **Primary (`#D62828` - Engine Red):** Anchor color used for key interactive actions, main call-to-action buttons, the lead locomotive motifs, and festive bunting pennants. A lighter bright red (`#E63946`) functions as a lively hover/active accent.
- **Secondary (`#FCBF49` - Golden Lantern / Star Yellow):** Warm sunburst hue for celebratory sparkles, brass tickets, countdown timer highlights, and badge emblems.
- **Tertiary (`#4CC9F0` - Clear Morning Sky):** Crisp, optimistic blue representing the vast open sky, steam cloud tints, and informational notice cards.
- **Neutral (`#2B2D42` - Locomotive Charcoal):** Deep midnight slate for high-legibility body text, railway track ties, and structural borders, replacing harsh jet blacks.
- **Backdrop Surfaces:** Rooted in warm fluffy cloud white (`#FFF9F2` and `#F8F9FA`) with delicate dotted or striped train track textures.

## Typography

The typographic hierarchy prioritizes friendliness, character, and immediate readability across generations:

- **Headlines & Titles:** Set in **Plus Jakarta Sans** with extra-bold weight (700/800). Its rounded geometry delivers the soft, welcoming cheer of children's storybooks while maintaining crisp clarity on ultra-compact mobile viewports.
- **Body & Cultural Greetings:** Set in **Plus Jakarta Sans** with regular (400) and medium (500) weights. Arabic basmalah inscriptions, Quranic verses (*QS. An-Nahl*), and formal parental blessings retain dignity with generous line heights (`1.6` to `1.7`).
- **Ticket Stubs & Badges:** Monospace-inspired spacing using `label-sm` with slight tracking creates the tactile impression of embossed train tickets, station departure stamps, and QRIS payment receipts.

## Layout & Spacing

- **Form Factor & Viewport Constraint:** Built exclusively as a centered, mobile-first experience clamped to a maximum width of `430px`. On larger screens (tablets and desktop monitors), the canvas remains centered within a playful cream backdrop patterned with floating cloud silhouettes and subtle miniature stars.
- **Vertical Rhythm:** Sections are stacked vertically like stops on a railway line. Section transitions feature dynamic visual dividers: dashed sleeper tracks (`- - - -`), scalloped cloud billows, or hanging pennant bunting.
- **Rhythm Multiplier:** Uses a base-4/base-8 vertical cadence. `space-md` (16px) governs standard inner card padding; `space-xl` (40px) spaces distinct stops on the event timeline (e.g., Welcome → Ticket → Schedule → Map → Gallery → Digital Envelope → RSVP).

## Elevation & Depth

Visual depth avoids rigid corporate shadows in favor of soft, luminous layers that evoke cut-out papercraft and toy blocks:

- **Surface Ground (`#FFF9F2`):** Base canvas surface tinted with warm vanilla cream.
- **Level 1 (Carriage Cards & Cloud Tiles):** Pure white `#FFFFFF` surface elevated by a gentle ambient drop: `0px 6px 16px rgba(214, 40, 40, 0.06), 0px 1px 3px rgba(43, 45, 66, 0.04)`. Outlines use an ultra-soft border (`1.5px solid rgba(252, 191, 73, 0.25)`).
- **Level 2 (Boarding Pass & Interactive Trays):** Floating ticket stubs use a slightly deeper shadow: `0px 10px 24px rgba(43, 45, 66, 0.08)`. Boarding passes feature perforated notched circles on both lateral edges.
- **Level 3 (Modal Dialogs & Floating Music Toggle):** `0px 16px 36px rgba(43, 45, 66, 0.16)`. Accented with a tiny gold specular top edge glow.
- **Button Tactility:** Buttons use a solid bottom bevel offset (a physical 3D "press" effect: `box-shadow: 0 4px 0 #9E1C1C`) that compresses on active tap (`translateY(2px)` with `box-shadow: 0 2px 0 #9E1C1C`).

## Shapes

The design uses `roundedness: 2` (16px default border radius, expanding to 24px for major cards), reinforcing the soft-edged safety and playfulness of toy trains:

- **Buttons & Tags:** Generous pill shapes (`rounded-full` / 9999px) for RSVP actions, navigation buttons, and status chips.
- **Ticket Stubs:** `16px` corner radius punctuated with symmetrical circular cutouts (`12px` radius) at the ticket folds to simulate perforated tearing edges.
- **Station Pocket Watch Counters:** Circular discs (`rounded-full`) housed within rounded rectangular steam cloud pods.
- **Carriage Photo Windows:** Rounded frames (`16px`) with top arch cues mimicking locomotive cabin windows.

## Components

### 1. Boarding Pass Event Ticket (The Invitation Hero)
- **Structure:** Split-card pattern (Event Name / Date & Destination) separated by a dashed perforation line and circular cutout notches.
- **Header:** Features the child's hero title (e.g., *"Tiket Keberangkatan Walimatul Khitan Sang Masinis Cilik"*), golden star emblems, and steam cloud badges.
- **Action:** A prominent primary button with a "Save to Calendar" link styled like an embossed station stamp.

### 2. Station Master Countdown Clock
- **Appearance:** Circular modular countdown pods (Days, Hours, Minutes, Seconds) styled like vintage brass railway station clocks.
- **Styling:** Secondary Gold (`#FCBF49`) numerals over Locomotive Charcoal (`#2B2D42`) or Engine Red (`#D62828`) backgrounds with bold miniature labels below.

### 3. Railway Carriage Photo Gallery
- **Structure:** Horizontal snap-scrolling cards or a 2-column alternating grid designed as passenger cars connected by graphic railway couplings (`-o-o-`).
- **Details:** Each carriage carries a candid portrait of the boy, topped with a mini steam puff or locomotive wheel accent at the base.

### 4. Interactive Bank Transfer & QRIS "Ticket Booth" Card
- **Structure:** Clean white card with copyable banking info (*BCA / Mandiri / Bank Syariah*) and an expandable QRIS code modal.
- **Interaction:** Copy button triggers an instant micro-toast notification (*"Nomor rekening tersalin!"*) with a playful steam whistle icon.

### 5. Touch-Friendly Train Master RSVP Form
- **Form Controls:** Full-width input fields with 48px minimum touch height, light-blue focus rings, and friendly placeholder instructions.
- **Attendance Selector:** Big segmented radio buttons shaped like tickets: *"Hadir Siap Berangkat!"* (Attending) vs. *"Titip Doa Restu"* (Unable to attend).
- **Wishes Feed:** Scrollable guestbook cards styled as telegrams sent to the young train conductor.

### 6. Track Section Dividers
- Whimsical dividers featuring mini animated red steam trains chugging across dashed brown railway sleepers, separating cultural greetings, venue maps, and closing family credits.