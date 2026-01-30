# Simplified Onboarding Form - Changes Summary

## Overview
Replaced the complex 12-step onboarding wizard with a simple, single-page form focused on essential information.

## New Onboarding Form Fields

### 1. **Company Name** (Required)
- Text input
- First field to collect basic organization information

### 2. **Organization Type** (Required, Single-choice Radio Buttons)
- **Airline / Buyer** - Maps to `type: 'airline'`
- **SAF Producer** - Maps to `type: 'producer'`
- **Fuel Trader / Distributor** - Maps to `type: 'trader'`
- **Other** - With free text input field for specification

### 3. **What brings you here?** (Required, Dropdown)
- Explore SAF availability
- Sell or list SAF
- Understand compliance / regulations
- Just browsing

### 4. **Expected SAF Volume Range** (Optional, Dropdown)
- Low (< 1M gallons/year)
- Medium (1M - 10M gallons/year)
- High (> 10M gallons/year)

### 5. **Submit Button**
- Text: "Enter Dashboard"
- Redirects to `/dashboard` after successful submission

## Technical Changes

### Files Modified

#### 1. `components/onboarding/OnboardingWizard.tsx`
- Removed 12-step wizard with sidebar navigation
- Implemented single-page form with:
  - Radio button group for organization type
  - Dropdown for intent
  - Optional dropdown for volume range
  - Conditional "Other" text input
- Clean, modern UI with hover states

#### 2. `models/Organization.ts`
- Added new fields to interface:
  - `organizationType?: string`
  - `intent?: string`
  - `volumeRange?: string`
- Added to schema for MongoDB persistence

#### 3. `app/api/organization/profile/route.ts`
- **GET endpoint**: Returns organization with new fields
- **PUT endpoint**: 
  - Creates organization with selected type
  - Stores all onboarding data
  - Sets user as admin by default
  - Maps organization type to the `type` field

## User Experience

### Before
- 12 complex steps with extensive information collection
- Legal entity details, corporate structure, compliance, etc.
- Time-consuming and potentially overwhelming

### After
- Single page with 4 simple fields (3 required, 1 optional)
- Takes less than 1 minute to complete
- Focused on essential information to get started
- Clean, professional UI with clear visual hierarchy

## Validation
- Company Name: Required
- Organization Type: Required (radio selection)
- Intent: Required (dropdown selection)
- Volume Range: Optional
- Other specification: Required only if "Other" is selected

## Button States
- Disabled when required fields are empty
- Shows loading state with spinner during submission
- Text changes from "Enter Dashboard" to "Setting up..." when saving

## Next Steps
Users are immediately redirected to the dashboard where they can:
- Browse SAF lots
- Create listings (if producer/trader)
- Submit bids (if buyer)
- Manage their organization

## Backward Compatibility
- The `type` field is set based on organization type selection
- `legalEntity.legalName` is still populated with company name for existing integrations
- Organization model retains all previous fields (they're just optional now)




