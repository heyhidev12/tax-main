# Education Visibility Filtering Implementation

## Overview
Implemented visibility filtering for Education & Seminar pages based on `targetMemberType` field. This ensures that seminars are shown only to appropriate users based on their membership type.

## Visibility Rules

### Rule 1: targetMemberType === "ALL"
- **Behavior**: Show seminar to everyone
- **Applies to**:
  - Logged-in users (any memberType)
  - Non-logged-in (guest) users
- **No restrictions**

### Rule 2: targetMemberType !== "ALL"
- **Behavior**: Show seminar ONLY when:
  1. User is logged in, AND
  2. `currentUser.memberType === targetMemberType`
- **Otherwise**:
  - Hide the item from the list
  - Prevent access to detail page (show error message)

## Implementation Details

### 1. Detail Page (`/src/pages/education/[id].tsx`)

#### Changes Made:
- Added `memberType` field to `UserProfile` interface
- Added `isLoadingAuth` state to track authentication loading
- Added `visibilityError` state to store visibility error messages
- Implemented visibility check in `useEffect` that runs after user profile is loaded

#### Visibility Check Logic:
```typescript
// If targetMemberType is "ALL", show to everyone
if (targetMemberType === "ALL") {
  setVisibilityError(null);
  return;
}

// If targetMemberType is not "ALL", check authentication and memberType
if (!userProfile) {
  // User is not logged in
  setVisibilityError("로그인이 필요한 교육입니다.");
  return;
}

// Check if user's memberType matches targetMemberType
if (userProfile.memberType !== targetMemberType) {
  setVisibilityError("이 교육은 " + education.targetMemberTypeLabel + " 전용입니다.");
  return;
}
```

#### User Experience:
- Shows loading state while checking authentication
- Shows appropriate error message if user doesn't have access:
  - "로그인이 필요한 교육입니다." (Login required)
  - "이 교육은 [회원유형] 전용입니다." (Restricted to specific member type)
- Prevents direct URL access to restricted seminars

### 2. List Page (`/src/pages/education/index.tsx`)

#### Changes Made:
- Added `UserProfile` interface with `memberType` field
- Added `userProfile` and `isLoadingAuth` states
- Implemented `fetchUserProfile()` function to get current user info
- Created `isItemVisible()` helper function for filtering
- Applied filtering to both "New Education" and "All Education" sections

#### Visibility Filter Helper:
```typescript
const isItemVisible = (item: EducationItem): boolean => {
  // If targetMemberType is "ALL", show to everyone
  if (item.targetMemberType === "ALL") {
    return true;
  }

  // If targetMemberType is not "ALL", check authentication and memberType
  if (!userProfile) {
    // User is not logged in, hide restricted items
    return false;
  }

  // Check if user's memberType matches targetMemberType
  return userProfile.memberType === item.targetMemberType;
};
```

#### Filtering Applied To:
1. **New Education Section** (Swiper carousel)
   - Filters by visibility first
   - Then applies search query filter
   
2. **All Education Section** (Grid with pagination)
   - Filters entire list by visibility
   - Renders only visible items

#### User Experience:
- Non-logged-in users only see seminars with `targetMemberType === "ALL"`
- Logged-in users see:
  - All seminars with `targetMemberType === "ALL"`
  - Seminars where `targetMemberType` matches their `memberType`
- Restricted items are completely hidden from the list (not just disabled)

## Authentication Flow

1. **Page Load**: Both pages fetch user profile via `/auth/me` API
2. **Loading State**: Shows loading indicator while fetching user data
3. **Visibility Check**: 
   - Detail page: Checks if user can access the specific seminar
   - List page: Filters all items based on user's access rights
4. **Rendering**: Only shows content user has permission to see

## Error Handling

### Detail Page:
- Shows loading state during auth check
- Shows error if education not found
- Shows visibility error if user lacks access
- All error states include Header, Menu, and Footer for consistent UX

### List Page:
- Silently filters items (no error messages)
- Shows empty state if no visible items exist
- Maintains search and filter functionality

## Testing Scenarios

### Scenario 1: Guest User (Not Logged In)
- **List Page**: Only sees seminars with `targetMemberType === "ALL"`
- **Detail Page**: 
  - Can access seminars with `targetMemberType === "ALL"`
  - Gets "로그인이 필요한 교육입니다." for restricted seminars

### Scenario 2: Logged-In User (memberType = "GENERAL")
- **List Page**: Sees seminars with `targetMemberType === "ALL"` or `targetMemberType === "GENERAL"`
- **Detail Page**:
  - Can access seminars with `targetMemberType === "ALL"` or `targetMemberType === "GENERAL"`
  - Gets "이 교육은 [다른 회원유형] 전용입니다." for other restricted seminars

### Scenario 3: Direct URL Access
- User cannot bypass visibility rules by accessing detail page directly
- Visibility check runs on every page load
- Appropriate error message shown if access denied

## Member Types

Based on the codebase, the following member types are used:
- `GENERAL`: 일반회원 (General members)
- `INSURANCE`: 보험사 직원 (Insurance company employees)
- `OTHER`: 기타 (Other)

## API Dependencies

- **GET /auth/me**: Returns user profile including `memberType`
- **GET /training-seminars**: Returns list of seminars with `targetMemberType` field
- **GET /training-seminars/:id**: Returns seminar detail with `targetMemberType` field

## Notes

- Filtering happens on the client-side after data is fetched
- Backend should also implement similar filtering for security
- The implementation assumes `targetMemberType` and `memberType` use the same enum values
- Error messages are in Korean to match the application's language
