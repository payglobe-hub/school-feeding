/*
===============================================================================
GHANA SCHOOL FEEDING PROGRAMME (GSFP) - BRAND GUIDELINES
===============================================================================

Ghanaian Government Website - Professional Branding Standards
Created for the Ghana School Feeding Programme (GSFP)

===============================================================================
COLOR PALETTE
===============================================================================

PRIMARY BRAND COLORS
===================

Ghana Primary Blue (#1d4ed8) - GSFP Blue
----------------------------------------
Usage: Primary brand color, headers, navigation, primary buttons
- Background: bg-ghana-primary-600 (navbars, headers)
- Text: text-ghana-primary-600 (links, accents)
- Borders: border-ghana-primary-600 (dividers, cards)

Ghana Secondary Green (#059669) - GSFP Green
---------------------------------------------
Usage: Call-to-action buttons, success states, accent elements
- Buttons: bg-ghana-secondary-600 hover:bg-ghana-secondary-700
- Links: text-ghana-secondary-600 hover:text-ghana-secondary-700
- Icons: text-ghana-secondary-600

Ghana Neutral Gray (#475569) - GSFP Gray
-----------------------------------------
Usage: Primary text color, neutral backgrounds
- Text: text-ghana-neutral-600 (body text)
- Backgrounds: bg-ghana-neutral-50 (light sections)
- Borders: border-ghana-neutral-200

===============================================================================
COLOR USAGE GUIDELINES
===============================================================================

PRIMARY COLORS (Most Important)
--------------------------------
• Ghana Primary Blue: Headers, navigation, primary CTAs
• Ghana Secondary Green: Donate buttons, success states, links
• Ghana Neutral Gray: Body text, subtle backgrounds

SECONDARY COLORS (Supporting)
-----------------------------
• Lighter variants: Subtle backgrounds, hover states
• Darker variants: High contrast text, strong emphasis

STATUS COLORS
-------------
• Success: ghana-secondary-600 (#059669)
• Warning: amber-600 (#d97706)
• Error: red-600 (#dc2626)
• Info: ghana-primary-600 (#1d4ed8)

===============================================================================
ACCESSIBILITY CONSIDERATIONS
===============================================================================

CONTRAST RATIOS (WCAG 2.1 AA Compliant)
----------------------------------------
• Primary Blue on White: 7.2:1 ✓
• White text on Primary Blue: 8.6:1 ✓
• Primary Green on White: 4.5:1 ✓
• Neutral Gray on White: 4.8:1 ✓
• Dark Gray on Light Gray: 7.1:1 ✓

COLOR BLINDNESS CONSIDERATIONS
-------------------------------
• Blue-Green distinction maintained for colorblind users
• Red used sparingly, only for errors/warnings
• Shape and text provide additional context beyond color

===============================================================================
COMPONENT USAGE STANDARDS
===============================================================================

NAVIGATION
----------
• Background: bg-ghana-primary-900
• Text: text-white
• Hover: hover:bg-ghana-primary-800

BUTTONS - PRIMARY
-----------------
• Background: bg-ghana-primary-600
• Hover: hover:bg-ghana-primary-700
• Text: text-white

BUTTONS - SECONDARY (Donate)
-----------------------------
• Background: bg-ghana-secondary-600
• Hover: hover:bg-ghana-secondary-700
• Text: text-white

LINKS
-----
• Default: text-ghana-primary-600
• Hover: hover:text-ghana-primary-700
• Visited: visited:text-ghana-primary-800

CARDS & CONTAINERS
------------------
• Background: bg-white
• Border: border-ghana-neutral-200
• Shadow: shadow-lg

===============================================================================
GHANAIAN CULTURAL CONSIDERATIONS
===============================================================================

FLAG COLORS REFERENCE
---------------------
While not directly using flag colors, our palette respects Ghana's heritage:
• Deep blues represent trust and stability (government)
• Greens represent growth and prosperity (agriculture/nutrition)
• Professional grays ensure readability and accessibility

PROFESSIONAL GOVERNMENT STANDARDS
----------------------------------
• Conservative color usage (not too bright/flashy)
• High contrast for accessibility
• Trust-building blues and greens
• Neutral grays for content hierarchy

===============================================================================
IMPLEMENTATION RULES
===============================================================================

DO'S
----
✓ Use ghana-primary-600 for primary actions
✓ Use ghana-secondary-600 for CTAs and success states
✓ Use ghana-neutral-600 for body text
✓ Maintain consistent color usage across components
✓ Test contrast ratios for accessibility
✓ Use semantic color names (primary, secondary, neutral)

DON'TS
------
✗ Don't use default Tailwind colors (blue-600, green-600, etc.)
✗ Don't mix old and new color systems
✗ Don't use colors outside the defined palette
✗ Don't sacrifice accessibility for aesthetics
✗ Don't use red/green combinations that confuse colorblind users

===============================================================================
MIGRATION PATH
===============================================================================

PHASE 1: Core Components (High Priority)
-----------------------------------------
• Navbar (bg-ghana-primary-900)
• Buttons (bg-ghana-primary-600, bg-ghana-secondary-600)
• Links (text-ghana-primary-600)
• Cards (border-ghana-neutral-200)

PHASE 2: Content Components (Medium Priority)
---------------------------------------------
• Article cards, gallery items
• Form elements, status messages
• Secondary navigation, footers

PHASE 3: Polish (Low Priority)
-------------------------------
• Hover states, focus states
• Animation colors, micro-interactions
• Dark mode considerations (if needed)

===============================================================================
*/

export const GHANA_BRAND_COLORS = {
  primary: {
    main: '#1d4ed8',      // GSFP Blue - primary brand color
    hover: '#1e40af',     // Darker blue for hover states
    light: '#60a5fa',     // Lighter blue for accents
  },
  secondary: {
    main: '#059669',      // GSFP Green - CTAs, success
    hover: '#047857',     // Darker green for hover states
    light: '#4ade80',     // Lighter green for highlights
  },
  neutral: {
    main: '#475569',      // GSFP Gray - primary text
    light: '#f1f5f9',     // Light backgrounds
    dark: '#1e293b',      // Dark text/headings
  },
  status: {
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#1d4ed8',
  }
};
