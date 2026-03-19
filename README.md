# ScholarSync
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

**Project Type**: Scholarship Management Platform

**Technology Stack**:
- Frontend Framework: Next.js 15.3.2 (React-based)
- Language: TypeScript
- Styling: Tailwind CSS
- UI Components: ShadCN UI Component Library, Radix UI components with custom styling
- Backend/Database: Supabase (PostgreSQL + authentication)
- Authentication: Supabase Auth with Next.js integration

**Core Purpose**:
- This is a scholarship discovery and application platform that helps students:
- Search for scholarships by name and category
- View AI-curated scholarship recommendations
- Filter scholarships by different categories (AI, Data Science, Computer Engineering)
- Manage their scholarship applications
- Create and maintain user profiles

**Key Features**:
- Smart Scholarship Search - Users can search and filter scholarships
- AI-Powered Recommendations - Curated scholarship suggestions
- User Authentication - Login/register system with protected routes
- Profile Management - User profile creation and management
- Modern UI/UX - Clean, responsive design with Tailwind CSS

**Architecture**:
- Uses Next.js App Router (new file-based routing system)
- Protected routes for authenticated users ((protected) folder)
- Server-side rendering capabilities
- Database integration with Supabase
- Component-based architecture with reusable UI components


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
