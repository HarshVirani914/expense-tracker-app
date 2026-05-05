# Expense Tracker App - Product Requirements Document

## Project Overview

A multi-user web application for personal expense tracking with group expense splitting capabilities, inspired by Splitwise. The app focuses on providing comprehensive individual expense management while enabling users to track and split expenses with friends, family, and groups.

**Target Completion:** Mid-June 2026  
**Platform:** Web Application  
**Database:** PostgreSQL

---

## Core Principles

1. **Progressive Enhancement**: Build core features first, then layer advanced features
2. **Extensibility**: Design architecture to support future AI integration without major refactoring
3. **User-Centric**: Prioritize better individual tracking over complex group features
4. **Data Integrity**: Maintain accurate balances and calculations across all features

---

## Feature Priority Matrix

### P0 - Must-Have (Core MVP)

Essential features required for app to be functional and valuable.

### P1 - Important

Enhance user experience significantly but app works without them.

### P2 - Nice-to-Have

Polish features that can be added post-launch.

### Future

Features planned for post-June implementation.

---

## Detailed Feature Specifications

## 1. Authentication & User Management

**Implementation:** Using **Clerk** for authentication and user management

### P0 - User Authentication (Provided by Clerk)

- **Sign up** with multiple options:
  - Email and password
  - Social OAuth (Google, GitHub, etc.)
  - Email magic links
- **Login** with same authentication methods
- **Logout** functionality
- **Password reset** flow (handled by Clerk)
- **Email verification**
- **Session management** and security
- Basic user profile (name, email, profile picture)

### P0 - Profile Management (Provided by Clerk)

- Pre-built user profile component
- Edit profile information (name, email, username)
- Change password
- Profile picture upload and management
- Manage connected accounts
- Two-factor authentication (optional for users)

**Benefits of Using Clerk:**

- Production-ready authentication out of the box
- Secure session management
- Beautiful pre-built UI components
- Multi-factor authentication support
- User management dashboard
- Webhook support for user events
- Reduces development time significantly

---

## 2. Expense Management (Individual)

### P0 - Basic Expense CRUD

- **Add Expense**
  - Amount (required)
  - Category selection (required)
  - Date (default: today)
  - Description/notes (optional)
  - Payment account selection (optional)
- **View Expenses**
  - List view of all expenses
  - Sort by date (newest first default)
  - Display: amount, category, date, description
- **Edit Expense**
  - Update any expense field
- **Delete Expense**
  - Remove expense with confirmation

### P0 - Category Management

- **Default Categories**
  - Family
  - Friends
  - Lifestyle
  - Food
  - Transportation
  - Entertainment
  - Shopping
  - Bills & Utilities
  - Healthcare
  - Other
- **Custom Categories**
  - Create new categories
  - Edit category names
  - Delete categories (with expense reassignment or prevention if in use)
  - Category color coding

### P1 - Income/Positive Entries

- Add income/money received entries
- Mark as positive expense (credit)
- Track income sources
- Distinguish from expenses in views

### P1 - Search & Filters

- **Search by:**
  - Description/notes
  - Amount range (min-max)
  - Merchant/payee name
- **Filter by:**
  - Category (single or multiple)
  - Date range (from-to)
  - Account used
  - Amount range
  - Expense type (debit/credit)
- **Save filter combinations** for quick access

### P2 - Payment Methods

- Track payment method per expense
  - Cash
  - Card
  - UPI
  - Bank Transfer
  - Other

---

## 3. Account Tracking

### P0 - Manual Account Management

- **Add Account**
  - Account name (required)
  - Account type (Savings, Current, Wallet, Cash, Credit Card)
  - Initial balance (optional)
- **View Accounts**
  - List of all accounts with current balances
  - Balance calculated from linked expenses
- **Edit Account**
  - Update account name, type
  - Manual balance adjustment (with reason/note)
- **Delete Account**
  - Only if no expenses linked, or reassign expenses

### P0 - Account Balance Tracking

- Automatic balance calculation based on expenses
- Track debits (expenses) and credits (income)
- Display current balance per account
- Show transaction history per account

---

## 4. Group Expense Management

### P0 - Group Creation & Management

- **Create Group**
  - Group name (required)
  - Group description (optional)
  - Add members (as contacts/names, no account required)
- **View Groups**
  - List of all groups
  - Member list per group
  - Outstanding balances summary
- **Edit Group**
  - Update name, description
  - Add/remove members
- **Delete Group**
  - Archive group with expense history preserved

### P0 - Group Members (Contacts)

- Add members by name (no account required)
- Each member has:
  - Name
  - Optional: email, phone (for reference)
- Members can be used across multiple groups
- Contact management (add, edit, delete contacts globally)

### P0 - Group Expense Creation

- **Add Group Expense**
  - Amount (required)
  - Category (required)
  - Date (default: today)
  - Description (optional)
  - Select group (required)
  - Select members involved (subset of group)
- **Who Paid**
  - Select payer(s) from involved members
  - If multiple payers: specify amount each paid
  - Current user can be a payer
- **Split Configuration** (Splitwise-style)
  - **Equal Split**: Divide equally among selected members
  - **Exact Amounts**: Specify exact amount for each member
  - **Percentages**: Split by percentage shares
  - **Shares/Ratios**: Split by shares (e.g., 1:2:3)
  - Visual display of who owes what to whom

### P0 - Group Balance Calculations

- Calculate net balance per member in each group
- Display who owes whom how much
- Running balance across all group expenses
- Settlement tracking

### P1 - Debt Simplification

- Optional view: simplify debts to minimize transactions
- Example: A→B $10, B→C $10 simplifies to A→C $10
- Toggle between actual debts and simplified debts

### P1 - Settlement/Payment Recording

- **Mark as Settled**
  - Record when member pays back debt
  - Partial payment support
  - Full payment support
  - Payment date and method
- **Settlement History**
  - View all settlements
  - Filter by member, date

### P2 - Group Expense Edit/Delete

- Edit group expense (recalculates balances)
- Delete group expense (with confirmation, recalculates)

---

## 5. Recurring Expenses

### P1 - Recurring Expense Setup

- Create recurring expense template
- Set frequency:
  - Daily
  - Weekly
  - Monthly
  - Yearly
  - Custom interval
- Start date and optional end date
- All expense fields (amount, category, account, etc.)

### P1 - Recurring Expense Automation

- Auto-create expenses based on schedule
- Preview upcoming recurring expenses
- Edit upcoming occurrences
- Skip/pause recurring expense

### P2 - Recurring Reminders

- Notification/reminder before recurring expense is due
- Useful for manual bills that need action

---

## 6. Budgets

### P1 - Budget Creation

- **Create Budget**
  - Category (required)
  - Amount limit (required)
  - Time period: Monthly or Weekly
  - Budget type: Fixed (resets each period)
- **View Budgets**
  - List of all active budgets
  - Current spending vs budget
  - Progress bars or indicators
- **Edit Budget**
  - Update amount, category, period
- **Delete Budget**
  - Remove budget tracking

### P1 - Budget Alerts

- Visual warning when approaching limit (e.g., 80% spent)
- Visual alert when exceeded
- Optional: email/notification alerts

---

## 7. Analytics & Insights

### P0 - Basic Statistics

- Total expenses this month
- Total income this month
- Net balance (income - expenses)
- Top spending categories

### P1 - Charts & Visualizations

- **Spending Trends Over Time**
  - Line chart: expenses over months
  - Selectable time range
- **Category Breakdown**
  - Pie/Donut chart: spending by category
  - Percentage and amount display
- **Monthly Comparisons**
  - Bar chart: month-over-month comparison
  - Year-over-year comparison
- **Budget vs Actual**
  - Bar chart: budgeted vs actual per category
  - Variance indicators

### P1 - Time Range Selection

- Custom date range picker for all analytics
- Quick filters: This Month, Last Month, This Year, Last Year, All Time

### P2 - Insights Summary

- Largest expense this period
- Most frequent category
- Average daily/weekly/monthly spending
- Spending increase/decrease trends

---

## 8. Data Import/Export

### P1 - CSV Template & Import

- **Download Template**
  - Provide standardized CSV template
  - Fields: Date, Amount, Category, Description, Account, Type (Expense/Income)
- **Import CSV**
  - Upload filled template
  - Validate data format
  - Preview before import
  - Show errors for invalid rows
  - Option to skip invalid rows or fix
  - Bulk import expenses

### P1 - CSV Export

- Export all expenses to CSV
- Customizable date range
- Include filters (export filtered results)
- Fields: Date, Amount, Category, Description, Account, Type, Group (if applicable)

---

## 9. User Interface & Experience

### P0 - Dashboard

- Overview of:
  - Recent expenses (last 10)
  - Current month spending summary
  - Account balances
  - Outstanding group balances
- Quick actions:
  - Add expense
  - Add group expense
  - View all expenses

### P0 - Navigation

- Clear menu structure:
  - Dashboard
  - Expenses (individual)
  - Groups
  - Accounts
  - Analytics
  - Settings

### P1 - Responsive Design

- Mobile-friendly interface
- Tablet optimization
- Desktop full experience

### P2 - Dark Mode

- Toggle between light and dark themes
- Persistent preference

---

## 10. Settings & Preferences

### P1 - App Settings

- Default currency
- Default category for quick add
- Date format preference
- First day of week (for monthly views)

### P1 - Notification Preferences

- Budget alerts on/off
- Recurring expense reminders on/off
- Settlement reminders on/off (if implemented)

---

## Future Features (Post-June)

### AI-Powered Features

1. **Auto-Categorization**
  - ML model to suggest/auto-assign categories based on description
  - Learn from user corrections
2. **Natural Language Expense Entry**
  - "Spent $50 on groceries yesterday" → parsed and added
  - Voice input support
3. **Budget Recommendations**
  - AI suggests budget amounts based on spending patterns
  - Anomaly detection for unusual spending
4. **Predictive Spending Forecasts**
  - Predict next month's spending per category
  - Alert for projected budget overruns
5. **Insights & Recommendations**
  - "You're spending 20% more on dining out this month"
  - "Consider reducing X category spending to meet savings goals"

### Advanced Features

1. **Receipt Management**
  - Upload receipt photos
  - OCR to extract amount, merchant, date
  - Attach receipts to expenses
2. **Bank API Integration**
  - Connect real bank accounts
  - Auto-sync transactions
  - Auto-categorize imported transactions
3. **Tags System**
  - Multiple tags per expense
  - Cross-category filtering
4. **Tax Reports**
  - Generate tax-ready expense reports
  - Mark expenses as tax-deductible
  - Category mapping for tax categories
5. **Shared Groups with Real Users**
  - Group members can create accounts
  - Shared expense visibility
  - In-app notifications for settlements
6. **Location Tracking**
  - Optional: add location to expenses
  - Map view of expenses
7. **Rolling Budgets**
  - Carry forward unused budget amounts

---

## Technical Considerations

### Architecture Design Principles

**For AI Integration Readiness:**

- Store raw expense descriptions (don't truncate)
- Include metadata fields (timestamp, location if added later)
- Design expense schema to accommodate confidence scores for auto-categorization
- Plan for audit trails (who/what changed category: user or AI)

**For Extensibility:**

- Modular service architecture
- Separate business logic from presentation
- Use feature flags for gradual rollout
- Design API-first (REST or GraphQL)

**Database Schema Considerations:**

- Users table (minimal - Clerk handles auth, we store user_id reference and app-specific data)
- Expenses table (with type: individual/group)
- Categories table
- Accounts table
- Groups table
- GroupMembers/Contacts table
- GroupExpenseParticipants (many-to-many)
- Settlements table
- Budgets table
- RecurringExpenses table

**Note:** Clerk manages user authentication data. Our database only stores Clerk user IDs as references and application-specific user data (preferences, settings, etc.)

**Key Relationships:**

- Users → Expenses (one-to-many)
- Users → Accounts (one-to-many)
- Users → Groups (many-to-many via membership)
- Expenses → Accounts (many-to-one, nullable)
- Expenses → Categories (many-to-one)
- GroupExpenses → Groups (many-to-one)
- GroupExpenses → Participants (many-to-many with split_amount)

---

## Development Phases

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Working individual expense tracker

- User authentication setup with Clerk
- Basic expense CRUD
- Category management (default + custom)
- Account creation and balance tracking
- Simple dashboard
- Basic filtering by date and category

**Deliverable:** Users can sign up, add/edit/delete expenses, see balances

---

### Phase 2: Group Features (Weeks 3-4)

**Goal:** Full group expense splitting

- Group creation and management
- Contact/member management
- Group expense creation with split types
- Balance calculations per group
- Settlement recording
- Debt simplification view

**Deliverable:** Users can create groups, split expenses, track who owes whom

---

### Phase 3: Analytics & Advanced Features (Week 5)

**Goal:** Insights and data management

- Charts and visualizations
- Budget creation and tracking
- CSV import/export with template
- Recurring expenses
- Advanced filters and search
- Income tracking

**Deliverable:** Users can analyze spending, set budgets, import/export data

---

### Phase 4: Polish & Testing (Final Days)

**Goal:** Production-ready app

- Bug fixes
- Performance optimization
- UI/UX polish
- Responsive design refinement
- User testing and feedback incorporation
- Documentation

**Deliverable:** Stable, tested application ready for use

---

## Success Metrics

### User Engagement

- Daily active users
- Average expenses added per user per week
- Group adoption rate (% of users using groups)

### Feature Usage

- Most used categories
- Most used split types
- Budget usage and effectiveness
- CSV import/export usage

### Technical

- Page load times
- API response times
- Error rates
- Database query performance

---

## Risks & Mitigations

### Risk: Timeline is Aggressive

**Mitigation:** 

- Strict prioritization (cut P2 features if needed)
- Use proven tech stack
- Use Clerk for authentication (saves significant development time)
- Minimal custom styling initially (use UI library)

### Risk: Complex Balance Calculations

**Mitigation:**

- Write comprehensive unit tests for split logic
- Start with equal splits, add complex splits incrementally
- Reference Splitwise algorithms

### Risk: Database Performance

**Mitigation:**

- Index key fields (user_id, date, category_id)
- Paginate expense lists
- Cache frequently accessed data (account balances)

### Risk: Scope Creep

**Mitigation:**

- This document serves as the scope boundary
- Any new features go to "Future" section
- Weekly scope review

### Risk: Third-Party Service Dependency (Clerk)

**Mitigation:**

- Clerk has excellent uptime and reliability
- Abstract Clerk integration behind our own auth layer for potential future migration
- Use Clerk webhooks to sync user data to our database

---

## Out of Scope (Explicitly Excluded for Now)

- Mobile native apps (iOS/Android)
- Real-time collaboration
- Payment gateway integration
- Bank API integration
- Receipt scanning/OCR
- Multi-language support
- Social features (friends, activity feed)
- Cryptocurrency tracking
- Investment tracking
- Email/SMS notifications

---

## Appendix

### Recommended Tech Stack

**Frontend:**

- Next.js (React framework)
- TypeScript
- TailwindCSS for styling
- Shadcn UI components
- Recharts or Chart.js for visualizations
- React Hook Form for forms
- Zod for validation

**Backend:**

- Next.js API routes or separate Node.js/Express server
- PostgreSQL database
- Prisma ORM
- Clerk for authentication and user management

**Deployment:**

- Vercel (frontend + API) or
- AWS/Railway (full stack)

**Development Tools:**

- Git for version control
- ESLint + Prettier
- Jest for testing

---

## Questions for Ongoing Development

1. Should we implement real-time updates (WebSockets) for group balances?
2. Email notifications for settlements or just in-app? (Note: Clerk can handle email sending)
3. Should deleted expenses be soft-deleted (archived) or hard-deleted?
4. Maximum file size for CSV import?
5. Rate limiting on API endpoints?
6. Should users be able to export a PDF summary report?
7. Which OAuth providers to enable in Clerk (Google, GitHub, etc.)?

---

## Next Steps

1. Review and approve this document
2. Finalize tech stack decisions
3. Set up Clerk account and configure authentication
4. Set up development environment
5. Create database schema design
6. Build wireframes/mockups for key screens
7. Begin Phase 1 development

---

**Document Version:** 1.1  
**Last Updated:** May 3, 2026  
**Changelog:**

- v1.1: Updated authentication to use Clerk instead of custom auth/NextAuth.js
- v1.0: Initial document

