# Authentication Pages Setup Guide

## 🎨 Design Implementation

The authentication pages have been completely redesigned with a beautiful split-screen layout inspired by modern design systems.

## 📁 Image Setup

### Step 1: Add Your Background Image

Place your authentication background image in:
```
public/images/auth-bg.png
```

**Recommended specifications:**
- Format: PNG or JPG
- Dimensions: 1200x800px or higher
- Theme: Dark background with colorful geometric shapes (as shown in the design)
- File name: `auth-bg.png` (or update the path in the component)

### Alternative Image Names

If you want to use a different filename, update the `src` in both files:
- `app/sign-up/[[...sign-up]]/page.tsx`
- `app/sign-in/[[...sign-in]]/page.tsx`

Change this line:
```tsx
src="/images/auth-bg.png"
```

## ✨ Features

### Sign Up Page (`/sign-up`)
- ✅ Email input
- ✅ Username input
- ✅ Password with show/hide toggle
- ✅ Real-time password validation:
  - 8+ characters
  - 1 uppercase letter
  - 1 lowercase letter
  - 1 special character
  - 1 number
- ✅ Marketing opt-in checkbox
- ✅ Terms and Privacy Policy links
- ✅ Split-screen design with image on right
- ✅ Fully responsive (image hidden on mobile)

### Sign In Page (`/sign-in`)
- ✅ Email or Username input
- ✅ Password with show/hide toggle
- ✅ Forgot password link
- ✅ Social login buttons (Google, GitHub)
- ✅ Split-screen design with image on right
- ✅ Fully responsive

## 🎯 Design Elements

### Color Scheme
- Background: White / Dark Slate
- Primary: Blue (#0ea5e9)
- Accent: Slate gray
- Button: Slate 400-600 (matching the design)

### Typography
- Headings: Bold, large (3xl)
- Labels: Medium weight
- Body: Regular weight

### Components
- Rounded input fields with border
- Rounded-full buttons (pill shape)
- Password validation indicators
- Eye icon for password toggle
- Smooth transitions and hover states

## 🔧 Customization

### Change Button Color
Edit the button className in both pages:
```tsx
className="w-full py-3 px-4 bg-slate-400 hover:bg-slate-500..."
```

### Change Brand Name
Replace "Aeronomy" in the heading:
```tsx
<h1 className="...">Welcome to Your Brand</h1>
```

### Add More Social Logins
Add additional buttons in the social login section of `sign-in` page.

## 📱 Responsive Design

- **Desktop (lg+)**: Split-screen with image on right
- **Tablet & Mobile**: Full-width form, image hidden
- Form is always centered and readable

## 🚀 Testing

1. Navigate to `http://localhost:3004/sign-up`
2. Fill in the form fields
3. Watch password validation indicators
4. Submit to create account (redirects to `/onboarding`)

For sign in:
1. Navigate to `http://localhost:3004/sign-in`
2. Enter credentials
3. Submit (redirects to `/dashboard`)

## 🎨 Image Fallback

If the image is not found, the pages will display an animated geometric shape design as a fallback that matches the aesthetic of your reference design.

## 📝 Notes

- Uses Clerk React hooks (`useSignUp`, `useSignIn`)
- Client-side validation before submission
- Error handling with friendly messages
- Loading states during authentication
- Accessible form labels and inputs




















