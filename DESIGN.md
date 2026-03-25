# Design System Document: The Sovereign Ledger

## 1. Overview & Creative North Star
**Creative North Star: The Architectural Minimalist**

This design system rejects the "cluttered dashboard" trope of traditional banking. Instead, it adopts an editorial, high-end aesthetic that treats financial data with the same reverence as a luxury gallery. We achieve "Trust" not through heavy borders and complex grids, but through **intentional asymmetry, expansive breathing room, and sophisticated tonal layering.**

The experience should feel like a series of "Financial Canvases." By breaking the rigid 12-column grid with overlapping elements and high-contrast typography scales (the interplay between the structural *Manrope* and the functional *Inter*), we create a signature identity that feels custom-built and premium.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep, authoritative blues (`primary`) and grounded by slate grays (`secondary`). The vibrant emerald (`tertiary`) acts as a surgical strike of positivity—used only for growth and success.

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To define boundaries, designers must use background color shifts. A `surface-container-low` section sitting on a `surface` background provides all the definition needed without the "cheapening" effect of 1px lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to create nested depth:
* **Base:** `surface` (#f7f9fb)
* **Structural Sections:** `surface-container-low` (#f2f4f6)
* **Interactive Cards:** `surface-container-lowest` (#ffffff)
* **Elevated Overlays:** `surface-bright` (#f7f9fb) with Glassmorphism.

### The "Glass & Gradient" Rule
To elevate the app beyond a standard SaaS template:
* **Floating Elements:** Use `surface` colors at 70% opacity with a `backdrop-blur` of 20px.
* **Signature Textures:** For primary CTAs and Hero Headers, use a subtle linear gradient from `primary` (#002045) to `primary_container` (#1a365d) at a 135-degree angle. This adds "soul" to the dark surfaces.

---

## 3. Typography
We utilize a dual-font strategy to balance editorial authority with transactional clarity.

* **Display & Headlines (Manrope):** Use these for account balances and section headers. The wider aperture of Manrope conveys a modern, open-banking feel.
* *Headline-LG (2rem):* For primary balance displays.
* **Body & Labels (Inter):** Use Inter for all data-heavy points, transaction descriptions, and input labels. Its high x-height ensures readability at small scales.
* *Body-MD (0.875rem):* The workhorse for transaction history.
* **Hierarchy Note:** Always pair a `display-sm` headline with `label-md` in `on-surface-variant` (#43474e) for a "Caption-over-Data" look that feels professional and curated.

---

## 4. Elevation & Depth
Depth in this system is a result of **Tonal Layering**, not structural shadows.

* **The Layering Principle:** Place a `surface-container-lowest` (White) card on a `surface-container-low` (Pale Blue-Grey) background. This creates a soft, natural "lift" that mimics fine stationery.
* **Ambient Shadows:** For floating elements (Modals/Dropdowns), use a shadow with a 40px blur, 0% spread, and 6% opacity. The shadow color must be a tint of `primary` (#002045) rather than pure black to maintain a premium "ink-bleed" feel.
* **The "Ghost Border" Fallback:** If accessibility requires a stroke, use the `outline-variant` (#c4c6cf) at **15% opacity**. A 100% opaque border is considered a design failure.

---

## 5. Components

### Buttons & Chips
* **Primary Action:** `primary` background with `on-primary` text. Use a `lg` (1rem) corner radius. For hover states, shift to `primary_container`.
* **Tertiary (Success) Chip:** Use `tertiary_container` (#003e28) with `on_tertiary_container` (#00b47d) text. This high-contrast, low-brightness pairing feels sophisticated, not neon.
* **Ghost Chips:** Use `surface-container-high` with no border for filter states.

### Transaction Tables & Lists
* **The No-Divider Rule:** Forbid 1px horizontal dividers. Separate transactions using `3` (1rem) spacing and subtle alternating background shifts (`surface` to `surface-container-low`).
* **Data Alignment:** Monetary values use `title-md` (Inter). Positive balances use `tertiary_fixed_variant` (#005236).

### Input Fields
* **Styling:** Use a `surface-container-highest` background with a `sm` (0.25rem) bottom-only "active" indicator in `primary`.
* **States:** On focus, the background should shift to `surface-container-lowest` with a "Ghost Border" of 20% `primary`.

### Specialized Banking Components
* **The "Wealth Card":** A large `xl` (1.5rem) rounded container using the signature `primary` gradient. Typography inside should be `on-primary-fixed` for maximum legibility against the dark silk background.
* **Balance Micro-Charts:** Minimalist sparklines using `tertiary` (#002617) with a 2px stroke width, nestled within `surface-container-low` cards.

---

## 6. Do’s and Don'ts

### Do:
* **Do** use asymmetrical margins (e.g., a wider left-side gutter) to create an editorial layout.
* **Do** use `16` (5.5rem) spacing between major functional blocks to allow the user's eyes to rest.
* **Do** use `surface-tint` (#455f88) for subtle icon backgrounds to create a cohesive blue-toned ecosystem.

### Don’t:
* **Don’t** use pure black (#000000) for text. Use `on_surface` (#191c1e) for high contrast or `on_surface_variant` (#43474e) for secondary info.
* **Don’t** use "Default" shadows. If it looks like a standard Material Design shadow, it is too heavy for this system.
* **Don’t** use sharp corners. Everything must adhere to the `DEFAULT` (0.5rem) to `xl` (1.5rem) scale to maintain the "Soft Security" brand pillar.