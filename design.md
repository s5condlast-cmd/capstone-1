# Azure Scholar Design System

 

### 1. Overview & Creative North Star

**Creative North Star: The Academic Architect.**

The Azure Scholar system is designed for high-stakes educational management, where clarity, authority, and progress are paramount. It breaks from standard SaaS templates by utilizing "Functional Asymmetry"—using a fixed, grounded sidebar contrasted with a fluid, editorial main content area. The system prioritizes focus through generous whitespace and a sophisticated "Professional Blue" palette, ensuring that complex data feels approachable and structured.

 

### 2. Colors

Azure Scholar utilizes a high-contrast foundation for maximum readability.

- **Primary Authority:** `#00529B` (Azure) is used for primary actions and brand presence.

- **The "No-Line" Rule:** Sectioning is primarily achieved through background shifts (e.g., `#F8FAFC` background vs. `#FFFFFF` cards). Avoid 1px borders for interior layouts; use them only for global structural containers like the Sidebar or Header.

- **Surface Hierarchy:** 

  - `Base`: `#F8FAFC` (The canvas)

  - `Card`: `#FFFFFF` (The focus area)

  - `Active/Hover`: `#F0F7FF` (Subtle indication of presence)

- **Glass & Gradient:** The top navigation utilizes a `white/80` backdrop-blur (12px) to maintain a sense of layered depth without blocking content flow.

 

### 3. Typography

The system relies exclusively on **Inter**, a typeface chosen for its mathematical precision and neutral tone.

- **Display/Headline (1.875rem / 30px):** Extra Bold (800) with tight tracking (-0.025em). Used for page titles to establish a strong "Editorial" anchor.

- **Sub-headers (1.125rem / 18px):** Bold (700). Used for card titles.

- **Body (0.875rem / 14px):** Medium (500) for standard reading, Regular (400) for secondary descriptions.

- **Utility/Labels (10px - 11px):** Bold (700) with uppercase tracking (0.1em). Used for table headers and status tags to provide a "Blueprint" aesthetic.

 

### 4. Elevation & Depth

Depth is created through "Tonal Stacking" rather than aggressive drop shadows.

- **The Layering Principle:** 

  - Level 0: Background (`#F8FAFC`)

  - Level 1: Sidebar/Header (`#FFFFFF` with `#E2E8F0` border)

  - Level 2: Content Cards (Shadow-sm: `0 1px 2px 0 rgb(0 0 0 / 0.05)`)

- **Ambient Shadows:** Primary buttons use a custom "Azure Glow" (`shadow-lg shadow-primary/20`) to signify the primary call-to-action without looking "heavy."

- **Interaction Depth:** Elements should scale down (`active:scale-95`) on click to provide tactile feedback in a flat digital environment.

 

### 5. Components

- **Buttons:** 

  - *Action:* Sharp `12px` (xl) or `16px` (2xl) corners. Bold text.

  - *Ghost:* Transparent with border-color, switching to slate-50 on hover.

- **Status Tags:** Pills with high-chroma text on low-chroma backgrounds (e.g., Green-700 on Green-100).

- **Navigation:** Vertical sidebar with a 4px left-accent border (`#00529B`) for the active state to provide a clear "You Are Here" indicator.

- **Dropzones:** Dashed borders (`2px`) in `#E2E8F0` that transition to `primary` on hover, accompanied by a subtle scale-up of the icon.

 

### 6. Do's and Don'ts

- **Do:** Use uppercase tracking for table headers to differentiate from data.

- **Do:** Use icons with a consistent `22px` size for navigation.

- **Don't:** Use pure black (`#000000`) for text. Stick to the Slate-800 (`#1E293B`) for a softer, more professional look.

- **Don't:** Use rounded-full (pills) for large cards; keep containers at `1rem` (2xl) to maintain the "Architectural" feel.

- **Do:** Reserve the Secondary Yellow (`#FFD200`) strictly for informational highlights (AI suggestions, warnings) to prevent visual noise.