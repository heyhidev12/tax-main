# SSR Refactoring Guide

This document outlines the SSR refactoring strategy for the Next.js project.

## Overview

The project is being refactored from CSR-first to proper Next.js SSR architecture for SEO-critical and content-driven pages.

## Architecture

### Server-Side API Helper
- **File**: `src/lib/api-server.ts`
- **Purpose**: Server-side API client for use in `getServerSideProps` and `getStaticProps`
- **Key Features**:
  - No dependency on `window` or `localStorage`
  - Supports optional token from cookies/headers
  - Same interface as client-side API helper

### Page Structure Pattern

```typescript
// pages/[page].tsx
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import PageComponent from '@/components/PageComponent';

interface PageProps {
  // Data fetched server-side
  initialData: DataType;
}

export default function Page({ initialData }: PageProps) {
  return (
    <>
      <Head>
        <title>Page Title</title>
        <meta name="description" content="..." />
      </Head>
      <PageComponent initialData={initialData} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  try {
    const response = await get<DataType>(API_ENDPOINTS.ENDPOINT);
    
    return {
      props: {
        initialData: response.data || null,
      },
    };
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return {
      props: {
        initialData: null,
      },
    };
  }
};
```

## Pages to Refactor

### ✅ Completed
1. **Home Page** (`src/pages/index.tsx`)
   - Fetches banner data server-side
   - Component receives `heroBanner` as prop

### 🔄 In Progress / To Do

2. **Experts List** (`src/pages/experts/index.tsx`)
   - **SSR**: Categories list (for dropdown)
   - **CSR**: Experts list (fetched when field selected - interactive)
   - **Reason**: Categories are static, experts are dynamic based on user selection

3. **Expert Detail** (`src/pages/experts/[id].tsx`)
   - **SSR**: Main expert data
   - **CSR**: Related experts, related news (can be client-side for better UX)

4. **Insights List** (`src/pages/insights/index.tsx`)
   - **SSR**: Initial insights data based on active tab
   - **CSR**: Search, filtering, pagination (interactive features)

5. **Insight Detail** (`src/pages/insights/[id].tsx`)
   - **SSR**: Main insight content
   - **CSR**: Comments (requires auth), view increment

6. **Business Areas Hierarchical** (`src/pages/business-areas/hierarchical.tsx`)
   - **SSR**: All hierarchical data
   - **Reason**: Content-driven, SEO-critical

7. **Business Area Detail** (`src/pages/business-areas/[id].tsx`)
   - **SSR**: Main business area data
   - **CSR**: Related experts, related news

8. **Education List** (`src/pages/education/index.tsx`)
   - **SSR**: Education list data
   - **CSR**: Search, filtering (interactive)

9. **Education Detail** (`src/pages/education/[id].tsx`)
   - **SSR**: Education detail data
   - **CSR**: Application form (requires auth)

10. **History** (`src/pages/history/index.tsx`)
    - **SSR**: History data, awards, branches, customers
    - **Reason**: Static/semi-static content

## Pages to Keep CSR

- `/my` - User-specific, requires authentication
- `/consultation/apply` - Form submission, requires authentication
- `/login`, `/signup`, `/find-username`, `/find-password`, `/reset-password` - Auth pages
- `/auth/callback` - OAuth callback

## Implementation Strategy

### Hybrid Approach
For pages with both static content and interactive features:
1. **SSR**: Fetch initial/SEO-critical data
2. **CSR**: Fetch dynamic/interactive data in `useEffect`
3. **Avoid duplication**: Check if data exists before fetching client-side

### Error Handling
- Server-side errors should not break the page
- Return `null` or empty data, let client handle gracefully
- Log errors for debugging

### SEO Metadata
- Use `next/head` for page-specific metadata
- Include: title, description, og:title, og:description, og:type
- Dynamic metadata based on content when applicable

## Migration Checklist

For each page:
- [ ] Identify data that must be SSR (SEO-critical, initial content)
- [ ] Identify data that can stay CSR (interactive, user-specific)
- [ ] Create/update component to accept props
- [ ] Move data fetching from `useEffect` to `getServerSideProps`
- [ ] Add SEO metadata with `next/head`
- [ ] Test page loads with data in initial HTML
- [ ] Verify no duplicate API calls on initial render
- [ ] Test error handling
- [ ] Verify client-side interactions still work

## Testing

1. **View Page Source**: Verify data is in initial HTML
2. **Network Tab**: Check no duplicate API calls on initial load
3. **SEO Tools**: Verify metadata is correct
4. **Error Scenarios**: Test with API failures
5. **Client Interactions**: Verify interactive features still work
