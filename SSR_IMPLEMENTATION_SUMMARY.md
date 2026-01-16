# SSR Implementation Summary

## ✅ Completed

### 1. Server-Side API Helper
- **File**: `src/lib/api-server.ts`
- **Status**: ✅ Complete
- **Features**:
  - Server-side fetch utility
  - No window/localStorage dependencies
  - Optional token support from cookies
  - Same interface as client-side API

### 2. Home Page
- **File**: `src/pages/index.tsx`
- **Status**: ✅ Complete
- **Changes**:
  - Removed `dynamic` import with `ssr: false`
  - Added `getServerSideProps` to fetch banner data
  - Component receives `heroBanner` as prop
  - Added SEO metadata with `next/head`

## 📋 Implementation Pattern

### For List Pages (Experts, Insights, Education)
```typescript
// Hybrid approach: SSR for initial data, CSR for interactions
export const getServerSideProps: GetServerSideProps = async (context) => {
  // Fetch initial/SEO-critical data
  const response = await get(API_ENDPOINTS.ENDPOINT);
  
  return {
    props: {
      initialData: response.data || [],
    },
  };
};

// Component uses initialData for SSR, useEffect for interactions
const Page = ({ initialData }) => {
  const [data, setData] = useState(initialData);
  
  // Client-side for search/filter/pagination
  useEffect(() => {
    // Interactive features
  }, []);
};
```

### For Detail Pages (Expert, Insight, Education, Business Area)
```typescript
// SSR for main content, CSR for related/secondary content
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  
  // Fetch main content server-side
  const response = await get(`${API_ENDPOINTS.ENDPOINT}/${id}`);
  
  return {
    props: {
      data: response.data || null,
    },
  };
};

// Component receives main data, fetches related content client-side
const DetailPage = ({ data }) => {
  const [relatedData, setRelatedData] = useState([]);
  
  useEffect(() => {
    // Fetch related/secondary content
  }, [data]);
};
```

## 🎯 Next Steps

### Priority 1: Content-Driven Detail Pages
1. **Expert Detail** (`src/pages/experts/[id].tsx`)
   - SSR: Main expert data
   - CSR: Related experts, related news

2. **Insight Detail** (`src/pages/insights/[id].tsx`)
   - SSR: Main insight content
   - CSR: Comments, view increment

3. **Education Detail** (`src/pages/education/[id].tsx`)
   - SSR: Education detail
   - CSR: Application form

4. **Business Area Detail** (`src/pages/business-areas/[id].tsx`)
   - SSR: Main business area data
   - CSR: Related experts, related news

### Priority 2: List Pages
5. **Insights List** (`src/pages/insights/index.tsx`)
   - SSR: Initial insights based on active tab
   - CSR: Search, filtering, pagination

6. **Education List** (`src/pages/education/index.tsx`)
   - SSR: Education list
   - CSR: Search, filtering

7. **Experts List** (`src/pages/experts/index.tsx`)
   - SSR: Categories (for dropdown)
   - CSR: Experts list (when field selected)

### Priority 3: Static/Semi-Static Pages
8. **Business Areas Hierarchical** (`src/pages/business-areas/hierarchical.tsx`)
   - SSR: All hierarchical data

9. **History** (`src/pages/history/index.tsx`)
   - SSR: History, awards, branches, customers data

## 🔍 Testing Checklist

For each refactored page:
- [ ] View page source - data visible in HTML
- [ ] Network tab - no duplicate API calls on initial load
- [ ] SEO metadata present in `<head>`
- [ ] Error handling works (API failure)
- [ ] Client-side interactions still work
- [ ] Page loads faster (initial render)

## 📝 Notes

- **Hybrid Approach**: Use SSR for SEO-critical/initial content, CSR for interactive features
- **Error Handling**: Never break page on server-side errors, return null/empty data
- **SEO**: Always add metadata with `next/head` for SSR pages
- **Performance**: Avoid fetching data client-side if already available from SSR
