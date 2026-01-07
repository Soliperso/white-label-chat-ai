# White-Label AI Chat Widget – Wireframes & UI Specifications

**Date:** January 2026  
**Version:** v1.0 (MVP Design)

---

## 1. Overview

This document outlines the wireframes and UI specifications for the White-Label AI Chat Widget admin dashboard and chat widget. These wireframes represent the MVP design and should guide frontend development.

---

## 2. Design System Foundation

### 2.1 Color Palette

**Primary Colors**
- Teal Primary: `#2196F3` (actions, links, highlights)
- Teal Dark: `#1976D2` (hover state)
- Teal Light: `#E3F2FD` (backgrounds, subtle highlights)

**Neutral Colors**
- Background: `#FAFAFA` (light mode) / `#121212` (dark mode)
- Surface: `#FFFFFF` (light mode) / `#1E1E1E` (dark mode)
- Text Primary: `#212121` (light mode) / `#FFFFFF` (dark mode)
- Text Secondary: `#757575` (light mode) / `#BDBDBD` (dark mode)
- Border: `#E0E0E0` (light mode) / `#424242` (dark mode)

**Status Colors**
- Success: `#4CAF50`
- Error: `#F44336`
- Warning: `#FF9800`
- Info: `#2196F3`

### 2.2 Typography

- **Primary Font:** Inter, Segoe UI, -apple-system (system font stack)
- **Headings (H1):** 32px, 600 weight, -0.5px letter-spacing
- **Headings (H2):** 24px, 600 weight, -0.3px letter-spacing
- **Body:** 14px, 400 weight, 1.5 line-height
- **Small/Caption:** 12px, 400 weight, 0.4px letter-spacing

### 2.3 Spacing & Layout

- Grid: 8px base unit (8, 16, 24, 32, 48, 64px)
- Card padding: 16px or 24px
- Border radius: 8px (standard), 4px (compact)
- Sidebar width: 256px
- Main content max-width: 1200px

---

## 3. Dashboard Structure

### 3.1 Main Layout (All Pages)

```
┌─────────────────────────────────────────┐
│  Logo  |  Organization Switcher  | User │
├──────┬─────────────────────────────────┤
│      │  Breadcrumb                     │
│ Nav  ├─────────────────────────────────┤
│ Bar  │                                 │
│      │         Main Content Area       │
│      │                                 │
└──────┴─────────────────────────────────┘
```

**Header (56px)**
- Left: Logo and "White-Label AI Chat Widget" text (optional)
- Center: Organization name with dropdown to switch between managed organizations
- Right: Bell icon (notifications), User avatar with dropdown (profile, settings, logout)

**Sidebar (256px, collapsible)**
- Logo at top (40px)
- Navigation items (Widgets, Training, Analytics, Team, Billing, Settings)
- Active state: teal background with teal left border
- Hover state: light teal background
- Collapsed state: shows icon only, tooltip on hover

**Main Content Area**
- 16px padding on all sides
- Max-width: 1200px (centered if wider)
- Responsive: full-width on tablets/mobile

---

## 4. Key Pages & Wireframes

### 4.1 Widgets Management Page

**Purpose:** View, create, edit, and manage all deployed chat widgets.

**Sections:**

1. **Header (64px)**
   - H2: "Chat Widgets"
   - Button: "+ Create Widget" (primary, teal)

2. **Filter Bar (48px)**
   - Search input: "Search widgets…" (200px)
   - Dropdown filter: "Status: All" (options: All, Active, Draft, Paused)
   - Dropdown filter: "Sort: Recently Updated" (options: Recently Updated, Oldest, Most Messages)

3. **Widgets Table**
   - Columns: Widget Name | Status | Messages (This Month) | Last Updated | Actions
   - Rows: 10 per page (paginated)
   - Row height: 56px
   - Hover state: light gray background
   
   **Sample data:**
   - Widget Name: "Support Chat v1" | Status: 🟢 Active | Messages: 324 | Last Updated: Jan 3, 2026 | Actions: [Edit] [View Chats] [Copy Code] [Delete]
   - Widget Name: "Sales Assistant" | Status: 🟡 Draft | Messages: 0 | Last Updated: Jan 2, 2026 | Actions: [Edit] [View Chats] [Copy Code] [Delete]

4. **Pagination (40px)**
   - "Showing 1–10 of 47 widgets"
   - Previous / Next buttons, page number input

---

### 4.2 Training & AI Page

**Purpose:** Manage training data (URLs, documents, Q&A) and test AI responses.

**Sections:**

1. **Header (64px)**
   - H2: "Train Your AI"
   - Subtitle: "Add training data to improve your chatbot's accuracy"

2. **Three-Tab Interface**

   **Tab 1: Add URLs**
   - Input field: "Website URL (e.g., https://example.com)"
   - Info: "We'll crawl your website and index all content"
   - Button: "+ Add URL"
   - List of added URLs with status badges (✓ Indexed, ⏳ Processing, ⚠ Error)
   - Button: "Re-index" per URL
   - Button: Delete (trash icon) per URL

   **Tab 2: Upload Documents**
   - Drag-and-drop area (200px height, dashed border)
   - Supported formats: PDF, DOCX, TXT (with file size limits)
   - Or "Browse files" button
   - List of uploaded files with status, file size, upload date
   - Delete button per file

   **Tab 3: Manual Q&A**
   - Two-column input: Question | Answer
   - Button: "+ Add Q&A Pair"
   - List of Q&A pairs with edit/delete actions
   - Limit: Show 5 at a time, "Load more" button

3. **Training Status**
   - Progress bar: "Training in progress: 75% complete"
   - Estimated time: "~30 seconds remaining"
   - Cancel button (if actively training)

4. **Preview Chat (Right Sidebar, 350px width)**
   - H3: "Test Your Bot"
   - Chat interface with sample conversation
   - Input field: "Ask a test question…"
   - Show bot's response with confidence score and source citations
   - Allows multiple test queries

---

### 4.3 Branding & Customization Page

**Purpose:** Customize widget appearance to match brand guidelines.

**Left Column (50% width, 350px on desktop)**

1. **Logo Upload**
   - Heading: "Logo"
   - Upload area: "Click to upload or drag and drop" (200px × 100px preview)
   - Supported formats: PNG, SVG (max 2MB)
   - Delete button if logo exists

2. **Brand Colors**
   - Heading: "Brand Colors"
   - Primary Color picker with hex input (#2196F3)
   - Secondary Color picker with hex input (#FF9800)
   - "Reset to defaults" button

3. **Widget Name**
   - Label: "Widget Name"
   - Input field: "Support Assistant" (255 char limit)
   - Placeholder: "Enter a name for your widget"

4. **Welcome Message**
   - Label: "Welcome Message"
   - Text area: Multi-line input (supports markdown)
   - Placeholder: "Hi! How can I help you today?"
   - Character count: "125/500"

5. **Theme & Position**
   - Heading: "Appearance"
   - Radio buttons: Light | Dark (auto-detect option)
   - Heading: "Widget Position"
   - Radio buttons: Bottom-Right | Bottom-Left | Top-Right | Top-Left
   - Checkbox: "Auto-hide on mobile" (checked by default)

6. **Advanced Options (Collapsible)**
   - Checkbox: "Remove 'Powered by' branding" (grayed out, tooltip: "Available on Pro plan")
   - Checkbox: "Show sources in responses" (checked by default)
   - Slider: "Confidence threshold" (0–100%, default 70%)

7. **Actions (Fixed bottom)**
   - Button: "Save Changes" (primary, teal)
   - Button: "Preview on Test Site" (secondary)

**Right Column (50% width, 350px on desktop)**

- H3: "Live Preview"
- Website mockup showing floating widget with custom logo, colors, and welcome message
- Updates in real-time as user changes settings
- Mobile preview toggle

**Plan Indicator Banner (top)**
- "Upgrade to Pro to unlock custom domain and remove all branding"
- "Upgrade" button

---

### 4.4 Analytics Dashboard

**Purpose:** View key metrics, trends, and insights about widget performance.

**Sections:**

1. **Key Metrics (Top Row, 4 cards)**
   - Card 1: "Total Conversations" | 1,250 | 📈 +12% vs. last month
   - Card 2: "Success Rate" | 78% | 📈 +5% vs. last month
   - Card 3: "Avg. Response Time" | 1.8s | 📉 -0.3s vs. last month
   - Card 4: "Leads Captured" | 89 | 📈 +22% vs. last month

2. **Conversation Volume Chart (800px height)**
   - Line chart: X-axis (dates, last 30 days) | Y-axis (conversation count)
   - Title: "Conversation Volume (Last 30 Days)"
   - Hover: Show exact count for each day
   - Date range selector: "Last 7 days | Last 30 days | Last 90 days | Custom"

3. **Two-Column Section (Lower area)**

   **Left Column: Top Questions Asked**
   - H3: "Top Questions Asked"
   - Table with columns: Question | Count | % of Total
   - Show top 10 questions
   - Example: "What's your return policy?" | 245 | 19%
   - "View full list" link

   **Right Column: Lead Capture Trends**
   - H3: "Lead Capture Trends"
   - Stat: "89 leads this month"
   - Stat: "Avg. conversion rate: 7.1%"
   - "View leads" button (links to Chat History → Leads tab)

4. **Export Actions (Bottom-right)**
   - Button: "Export to CSV"
   - Button: "Export to JSON"
   - Tooltip: "Export leads and conversations for your records"

---

### 4.5 Chat History & Leads Page

**Purpose:** View and manage past conversations and captured leads.

**Sections:**

1. **Tab Navigation**
   - Tab 1: "Chat History" (active by default)
   - Tab 2: "Leads"

2. **Chat History Tab**
   - Search input: "Search conversations…" (400px)
   - Date range filter: "From [date picker] To [date picker]"
   - Filter dropdown: "Status: All" (options: All, Resolved, Escalated)
   
   **Table Columns:** Date | Visitor | Question | Bot Response | Status | Actions
   - Row height: 64px
   - Show 20 per page (paginated)
   - Example row: Jan 3, 2026 | John D. | "What's your return policy?" | "Our return policy allows 30 days for unopened items..." | 🟢 Resolved | [View]
   - Click "View" to see full conversation in a modal/side panel

3. **Leads Tab**
   - Similar layout to Chat History
   - Columns: Date Captured | Name | Email | Source Widget | Source Page | Actions
   - Filter by date range
   - "Download Leads" button (CSV or JSON)
   - Example row: Jan 3, 2026 | john@example.com | "Support Chat v1" | "/pricing" | [View Conversation]

4. **Pagination**
   - "Showing 1–20 of 245 conversations"
   - Previous / Next buttons

---

### 4.6 Team & Access Page

**Purpose:** Manage team members, roles, and permissions.

**Sections:**

1. **Header (64px)**
   - H2: "Team Members"
   - Button: "+ Invite Team Member" (primary, teal)

2. **Team Members Table**
   - Columns: Name | Email | Role | Joined Date | Actions
   - Rows (examples):
     - Admin | alice@company.com | Admin | Jan 1, 2026 | [Edit] [Remove]
     - Manager | bob@company.com | Manager | Jan 2, 2026 | [Edit] [Remove]
     - Viewer | carol@company.com | Viewer | Jan 3, 2026 | [Edit] [Remove]

3. **Role Definitions (Collapsible Card)**
   - Admin: Full access to all features, billing, and team management
   - Manager: Can manage widgets, training, and analytics; no billing access
   - Viewer: Read-only access to chats and analytics

4. **Invite Modal (Triggered by "+ Invite Team Member")**
   - Input: Email address
   - Dropdown: Role (Admin | Manager | Viewer)
   - Button: "Send Invite"
   - Pending invites list below

---

### 4.7 Billing Page

**Purpose:** Manage subscription, usage, and payments.

**Sections:**

1. **Current Plan Card**
   - Plan name: "Professional Plan"
   - Price: "$29/month + usage"
   - Features: Up to 3 widgets, 10K messages/month included
   - Renewal date: "Next billing: Feb 1, 2026"
   - Button: "Upgrade Plan" or "Manage Subscription"

2. **Usage Summary (Current Month)**
   - Card 1: Messages Used | 7,250 / 10,000 (73% used)
   - Card 2: Widgets Active | 2 / 3
   - Card 3: Team Seats Used | 1 / 5
   - Progress bars for each

3. **Billing History Table**
   - Columns: Date | Description | Amount | Status | Invoice
   - Example rows:
     - Jan 1, 2026 | Professional Plan | $29.00 | Paid | [Download]
     - Dec 1, 2025 | Professional Plan | $29.00 | Paid | [Download]
   - Show last 12 months
   - Pagination if needed

4. **Payment Method**
   - Heading: "Payment Method"
   - Display: "Visa ending in 4242"
   - Button: "Update Payment Method"

5. **Upcoming Charges**
   - Card: "Next Billing Cycle"
   - Estimate: Subscription ($29) + Overages ($12.50) = $41.50
   - Estimated date: Feb 1, 2026

---

## 5. Chat Widget Specifications

### 5.1 Widget Container

- **Dimensions:** 380px wide × 600px tall (responsive, scales on mobile)
- **Position:** Floating in bottom-right corner (customizable)
- **Z-index:** 9999 (floats above all website content)
- **Shadow:** `0 4px 12px rgba(0, 0, 0, 0.15)`
- **Border-radius:** 12px
- **Animation:** Smooth slide-in from bottom-right

### 5.2 Widget Header (56px)

- Background: Brand color (e.g., teal)
- Logo: 32px square left-aligned
- Title: "Support Chat" or custom name
- Close button (X): right-aligned
- Color: White/light text on dark background

### 5.3 Chat Message Area

- Background: Light gray or white (#F5F5F5 or #FFFFFF)
- Scrollable with auto-scroll to latest message
- Max-height: 450px (adjustable)
- Message padding: 12px per message

**User Message (Right-aligned)**
- Background: Teal (#2196F3)
- Text color: White
- Border-radius: 12px (top-left, bottom-right sharp)
- Padding: 8px 12px
- Font-size: 14px

**Bot Message (Left-aligned)**
- Background: Light gray (#EEEEEE)
- Text color: Dark (#212121)
- Border-radius: 12px (top-right, bottom-left sharp)
- Padding: 8px 12px
- Font-size: 14px
- Citations: Display as inline links or [Source] tags

### 5.4 Message Input Area (64px)

- Input field: "Ask me anything…" placeholder
- Background: White
- Border: 1px solid light gray
- Border-radius: 8px
- Padding: 8px 12px
- Font-size: 14px
- Send button: Teal primary button (arrow icon or "Send" text)
- Grows on focus, shows character count (if limit applied)

### 5.5 Lead Capture Optional Component (Triggered)

- Message from bot: "Want me to send you that info via email?"
- Inline form with two fields:
  - Input: Name (placeholder: "Your name")
  - Input: Email (placeholder: "your@email.com")
- Button: "Send" (primary, teal)
- Message on success: "✓ Thanks! We'll be in touch."

### 5.6 Mobile Responsive (< 600px)

- Widget expands to full screen overlay (100% width, 100vh height)
- Header sticky (always visible)
- Close button always accessible
- Input area sticky at bottom
- Messages scale appropriately

---

## 6. Onboarding Flow (5-Step Wizard)

### Step 1: Sign Up (2 minutes)

**Form:**
- Email input (validation: valid email format)
- Password input (validation: 8+ chars, 1 uppercase, 1 number)
- "Create Account" button (primary, teal)
- Link: "Already have an account? Sign In"

---

### Step 2: Create Organization (1 minute)

**Form:**
- Organization name input (e.g., "Acme Agency")
- Company size dropdown (Sole proprietor, 2–10, 11–50, 50–200, 200+)
- Industry dropdown (optional)
- "Create Organization" button

---

### Step 3: Create First Widget (5 minutes)

**Form:**
- Widget name input (e.g., "Support Chat")
- Client name input (e.g., "Acme Corp")
- Website URL input (e.g., "https://acmecorp.com")
- Widget position selector (radio buttons: Bottom-Right, Bottom-Left, Top-Right, Top-Left)
- Theme selector (radio buttons or toggle: Light, Dark)
- "Create Widget" button
- Message: "Your widget has been created! Next: add training data."

---

### Step 4: Add Training Data (5–15 minutes)

**Options (pick one):**
- Option 1: Upload a PDF (file picker)
- Option 2: Add a website URL (text input + button)
- Option 3: Manual Q&A (two inputs: Question + Answer)
- For each, show progress: "Training… 45% complete"
- "Next" button when ready

---

### Step 5: Get Embed Code (2 minutes)

**Sections:**
- Code block with JavaScript snippet:
  ```
  <script src="https://widget.example.com/loader.js"></script>
  <script>
    WidgetLoader.init({
      organizationId: 'org_abc123',
      widgetId: 'widget_xyz789'
    });
  </script>
  ```
- "Copy to Clipboard" button
- Link: "Preview on Test Site" (opens widget demo in new tab)
- Button: "Done" (completes onboarding, redirects to dashboard)

---

## 7. Responsive Breakpoints

- **Desktop:** 1200px+ (full sidebar, full-width tables)
- **Tablet:** 768px–1199px (collapsible sidebar, cards stack)
- **Mobile:** < 768px (hamburger menu, full-width content, simplified tables)

---

## 8. Accessibility Standards

- **WCAG 2.1 AA Compliance**
- Color contrast: 4.5:1 for all text
- Focus states: Visible 2px outline on all interactive elements
- Alt text: All images and icons have descriptive alt text
- Keyboard navigation: All features accessible via keyboard
- Screen reader support: Semantic HTML, ARIA labels where needed

---

## 9. Animation & Transitions

- **Duration:** 150–250ms (standard)
- **Easing:** Cubic-bezier(0.4, 0, 0.2, 1) (material motion)
- Widget open/close: Smooth slide animation
- Hover states: 150ms color/shadow transition
- Page transitions: Fade-in (100ms)
- Loading states: Pulse or spinner animation

---

## 10. Dark Mode

All pages and components should support dark mode via CSS media query or manual toggle:
- Background: Darker gray (#1E1E1E)
- Surface: Slightly lighter (#2A2A2A)
- Text: Light gray (#FFFFFF or #E0E0E0)
- Borders: Lighter gray (#424242)
- Accents: Same teal (#2196F3)

---

## 11. Development Handoff Notes

### Frontend Framework
- React / Next.js for dashboard
- Vanilla JS for widget (framework-agnostic)

### Component Library
- Use custom components or UI library (e.g., Material UI, Chakra UI, Shadcn/ui)
- Ensure consistent styling across all pages

### State Management
- Zustand or Redux for dashboard state
- Context API for widget state

### API Integration
- Endpoints for widgets, training, analytics, team, billing
- Real-time updates for analytics (WebSocket or polling)
- Error handling and loading states

### Testing
- Unit tests for key components
- Integration tests for main user flows
- E2E tests for onboarding and widget embed

---

## 12. Future Enhancements

- Multi-language support for dashboard and widget
- Custom CSS per widget (for advanced users)
- Widget preview mode (test on live website without full embed)
- Bulk actions (e.g., pause multiple widgets at once)
- Mobile app for dashboard (iOS/Android)

---
