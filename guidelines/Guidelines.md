**Add your own guidelines here**

# SYSTEM ROLE
Act as a Senior Full-Stack Developer and UI/UX Expert. Your task is to help me build "JastipFlow", a mobile-first Progressive Web App (PWA) designed for cross-border personal shoppers (Jastip). 

# System Guidelines

Use this file to provide the AI with rules and guidelines you want it to follow.
This template outlines a few examples of things you can add. You can add your own sections and format it to suit your needs

TIP: More context isn't always better. It can confuse the LLM. Try and add the most important rules you need

# General guidelines

Any general rules you want the AI to follow.
For example:

* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files.

--------------

# Design system guidelines
Rules for how the AI should make generations look like your company's design system

Additionally, if you select a design system to use in the prompt box, you can reference
your design system's components, tokens, variables and components.
For example:

* Use a base font-size of 14px
* Date formats should always be in the format “Jun 10”
* The bottom toolbar should only ever have a maximum of 4 items
* Never use the floating action button with the bottom toolbar
* Chips should always come in sets of 3 or more
* Don't use a dropdown if there are 2 or fewer options

You can also create sub sections and add more specific details
For example:


## Button
The Button component is a fundamental interactive element in our design system, designed to trigger actions or navigate
users through the application. It provides visual feedback and clear affordances to enhance user experience.

### Usage
Buttons should be used for important actions that users need to take, such as form submissions, confirming choices,
or initiating processes. They communicate interactivity and should have clear, action-oriented labels.

### Variants
* Primary Button
  * Purpose : Used for the main action in a section or page
  * Visual Style : Bold, filled with the primary brand color
  * Usage : One primary button per section to guide users toward the most important action
* Secondary Button
  * Purpose : Used for alternative or supporting actions
  * Visual Style : Outlined with the primary color, transparent background
  * Usage : Can appear alongside a primary button for less important actions
* Tertiary Button
  * Purpose : Used for the least important actions
  * Visual Style : Text-only with no border, using primary color
  * Usage : For actions that should be available but not emphasized



# TECH STACK ARCHITECTURE
- Frontend: HTML5, Tailwind CSS, Vanilla JS (or lightweight framework like Alpine.js).
- Backend / API: Google Apps Script (GAS) acting as a REST endpoint.
- Database: Google Sheets (to ensure rapid prototyping and easy reporting).
- Offline Storage: IndexedDB / LocalStorage (Local-first architecture).
- Image Processing: HTML5 Canvas API (Client-side rendering).


# CORE ARCHITECTURE & CONSTRAINTS
1. Local-First: The UI must load and function (calculator, forms, Canvas) without an internet connection. Data is saved locally and synced to GAS via background sync when online.
2. Cashflow Security (DP Logic): If 'Settings' dictate DP is "Mandatory", the "Found It" button in the Wishlist pipeline is strictly DISABLED until DP Amount > 0.
3. Canvas Rendering (Killer Feature): Before saving an item, the system uses HTML5 Canvas to overlay the Watermark Logo and Final Price onto the photo. The final image is downloadable to the device gallery.

# END-TO-END JOURNEY FLOW (WISHLIST & READY STOCK)
AI MUST strictly follow this exact data flow when building the logic and UI transitions:

JOURNEY 1: WISHLIST TO FULFILLMENT & INVENTORY SPLITTING
- Step 1 (Input): Admin adds to 'Wishlist' with a screenshot, Customer Name, Requested QTY (e.g., 2), and DP. Status = "Pending".
- Step 2 (Hunting): In-store, Jastiper opens Wishlist. If DP is valid, they tap "Found It".
- Step 3 (Capture & Calc): Camera opens. Jastiper takes a real photo, inputs Base Price. System auto-calculates Final IDR Price and renders the Canvas Image.
- Step 4 (The Split Logic): The system asks "Total QTY Bought?". If Jastiper bought 5 items (but requested was only 2):
   -> System saves a row in 'Sales' for the customer (QTY = 2, calculates Remaining Bill = Final Price - DP). Wishlist Status becomes "Fulfilled".
   -> System automatically saves a row in 'Items' (Ready Stock) for the excess (QTY = 3) using the same photo and price data.

JOURNEY 2: READY STOCK / LIVE CATALOG TO SALES
- Step 1 (Spontaneous Cataloging): Jastiper finds an item, snaps a photo, sets price, and saves it directly to the 'Items' tab (Ready Stock) with Available QTY. Rendered image is shared to IG.
- Step 2 (Claiming): A follower replies wanting to buy. Jastiper opens the "Ready Stock" UI.
- Step 3 (Conversion): Jastiper taps "Add to Sales" on that item.
- Step 4 (Checkout): System prompts for Customer Name, QTY to buy, and DP Amount. 
- Step 5 (Database Update): System deducts the QTY from the 'Items' tab. It then creates a new row in 'Sales' for this customer with the remaining bill calculated.

# INSTRUCTIONS FOR AI
When generating code, ALWAYS adhere to this Master Context. Do not invent new tech stacks. Write clean, modular code and prioritize the local-first mobile web experience.

-->
