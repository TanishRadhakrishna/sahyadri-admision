# Sahyadri Admission Portal – Next.js Frontend Prototype

This is the Next.js App Router version of the Sahyadri B.E. admission workflow prototype.

## Requirements

- Node.js 20.9 or later
- npm

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build and run

```bash
npm run build
npm start
```

## Main structure

```text
app/
  layout.jsx       # Root layout and metadata
  page.jsx         # Application entry page
  globals.css      # Global UI styles
src/
  App.jsx          # Interactive student + staff prototype
```

## Included prototype flow

- Public admission enquiry form
- Simulated confirmation email/SMS and application-link handoff
- Student multi-step application
- Management, CET / KEA, COMEDK and DCET route selection
- Route-dependent entrance fields
- Local draft progress and mock document selection
- Application submission
- Counter payment / simulated online payment
- Admission staff dashboard and application tracking
- Fee confirmation and admission number generation

## Frontend-only limitations

There is no backend, API, real authentication, email/SMS provider, payment gateway or server-side file upload. Demo records and form state are stored in browser localStorage. Do not enter real student personal data.

## Backend integration later

The UI is separated from the future backend concerns. In a later phase, replace localStorage and local state operations with authenticated Next.js server actions or API routes, a database, secure file storage, notification providers and payment reconciliation.
