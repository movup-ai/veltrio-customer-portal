# General guideline

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Comment

**Don't make multi-sentences comment unless necessary**

Just write one-line comment of concise and brief explanation.


## 6. Git

**Human verification is required.**

After finish your task, don't make a commit automatically. I will audit all changes and make a commit on my own

---

# Project: Car Rental Marketplace

---

## 1. Project Overview
This repository contains the customer-facing car rental marketplace for a larger car-rental SaaS platform.

The platform has two distinct products:
- Rental Operating System (B2B SaaS)
    Used by independent and small-to-medium professional car rental companies.
    Manages fleets, vehicles, availability, pricing, bookings, customers, payments, inspections, agreements, etc.
- Car Rental Marketplace (B2C) — this repository
    Used by renters/customers.
    Allows unauthenticated users to discover available rental vehicles across multiple independent rental companies.
    Customers can search, compare, inspect, and book vehicles.
    The marketplace does not charge rental companies a booking commission.
    Revenue comes from rental-company SaaS subscriptions.

This repository is responsible only for the customer-facing marketplace experience.

Do not introduce owner/admin functionality into this application unless explicitly requested.

## 2. Design System
Design system follows airbnb styles. Made pre-built html files under __design/ directory. 
You can check the color, typography, spacing and other details about design system.

Please make sure you define these variables under tailwindcss variables and make them 100% configurable and easily changable.

## 3. Tailwind CSS
Use Tailwind consistently.
Prefer semantic component-level patterns over huge unreadable class strings.
When repeated styling patterns emerge, extract reusable components or appropriate utilities.
Do not mix several styling systems without a strong reason.
Avoid arbitrary values unless they solve a real design requirement.

Maintain consistent:
- Spacing
- Typography
- Border radius
- Shadows
- Breakpoints
- Colors

## 4. Component Guidelines
Components should be:
- Small enough to understand
- Reusable
- Typed
- Accessible
- Composable

Avoid giant components containing the entire page.

Bad:
VehiclePage.tsx
  └── 1,500 lines

Prefer:
VehiclePage
├── VehicleGallery
├── VehicleHeader
├── VehiclePricing
├── VehicleSpecs
├── VehicleCondition
├── RentalCompanyCard
├── RentalPolicies
└── BookingPanel

Do not abstract components prematurely.
Extract components when reuse or complexity justifies it.

## 4. Loading States
Use skeleton loading states for major content areas.
Avoid showing blank screens while data is loading.
Vehicle cards should have an appropriate skeleton.

Vehicle detail pages should progressively load:
- Page shell
- Main vehicle image
- Vehicle information
- Pricing
- Additional images

## 5. State Management
Do not introduce global state unless the state genuinely needs to be shared.

Prefer:

URL state for search/filter state
Server state for server data
Local component state for UI state

Search parameters should generally be reflected in the URL so users can:

Refresh
Bookmark
Share
Navigate backward/forward

without losing search context.

## 6. URL Design
Prefer human-readable URLs.

Examples:
/search?location=miami&pickup=2026-10-10&return=2026-10-13
/vehicles/bmw-m4-competition-abc123
/cars/miami/luxury

Do not expose unnecessary database implementation details in URLs.

Multi-tenant should be implemented. 
So https://abc-rental.veltrio.io/vehicles/bmw-m4-xx is likely the vehicle detaill page url

## 7. SEO
The marketplace should be search-engine friendly. THIS IS VERY IMPORTANT

Vehicle detail pages and location/category pages should have appropriate:
- Metadata
- Titles
- Descriptions
- Canonical URLs
- Open Graph data
- Structured data where appropriate

Potential SEO pages may include:
/cars/miami
/cars/miami/suv
/cars/miami/luxury
/vehicles/{vehicle-slug}
{company-slug}.veltrio.io/vehicles

Do not generate large numbers of low-value SEO pages without a deliberate content strategy.


## 8. Accessibility

Follow WCAG principles.

Requirements include:
 - Keyboard navigation
 - Proper semantic HTML
 - Visible focus states
 - Accessible labels
 - Sufficient color contrast
 - Screen-reader-friendly controls
 - Accessible dialogs
 - Accessible image alternatives
 - Reduced-motion support

Do not sacrifice accessibility for visual effects.

## 9. Responsive Design
The marketplace must work exceptionally well on:
 - Desktop
 - Tablet
 - Mobile

Mobile is not simply a scaled-down desktop. Images are saved in several demensions. SO only appropriate image should be loaded according to device size automatically.

Mobile should prioritize:
 - Vehicle imagery
 - Search
 - Filters
 - Essential specifications
 - Price
 - Booking CTA

Consider sticky mobile booking controls.

## 10. Reuse before you build

- Check components folder before writing a component. 
- No native `<select>`, `<table>`, date or time inputs in modules or pages; the `ui/` versions
  carry focus handling and styling the native ones lack.
- A pattern appearing a second time in a module is the moment to extract it, not the third.

---
