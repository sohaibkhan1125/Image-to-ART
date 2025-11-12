# Firebase Authentication Setup Guide

## 🔥 Current Issue
The error `auth/configuration-not-found` indicates that Firebase Authentication is not properly configured in your Firebase project.

## 🛠️ Steps to Fix

### 1. Enable Authentication in Firebase Console

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `image-to-art-30258`
3. **Navigate to Authentication**:
   - Click on "Authentication" in the left sidebar
   - If you see "Get started", click it
   - If Authentication is already enabled, proceed to step 2

### 2. Enable Email/Password Sign-in Method

1. **In the Authentication section**:
   - Click on the "Sign-in method" tab
   - Find "Email/Password" in the list
   - Click on "Email/Password"
   - **Enable the first option**: "Email/Password" (not "Email link (passwordless sign-in)")
   - Click "Save"

### 3. Configure Authorized Domains

1. **In Authentication > Settings**:
   - Click on "Settings" tab
   - Scroll down to "Authorized domains"
   - Add your domains:
     - `localhost` (for development)
     - Your production domain (e.g., `yourdomain.com`)

### 4. Verify Project Configuration

Make sure your Firebase project has the correct configuration:

```javascript
// Your current config (should be correct)
const firebaseConfig = {
  apiKey: "AIzaSyACBr9jiKX8MLMUcOkeNZElYhlm6n9UhwE",
  authDomain: "image-to-art-30258.firebaseapp.com",
  projectId: "image-to-art-30258",
  storageBucket: "image-to-art-30258.firebasestorage.app",
  messagingSenderId: "65507259149",
  appId: "1:65507259149:web:4ac53e3e0be7a6165bf644",
  measurementId: "G-H18W1ZJDQ1"
};
```

## 🧪 Testing the Fix

1. **Start your development server**: `npm start`
2. **Navigate to**: `http://localhost:3000/admin/login`
3. **Check the debug info** displayed on the login page
4. **Try to sign up** with a test email
5. **Check browser console** for detailed error messages

## 🔍 Debug Information

The login page now includes a debug component that shows:
- Firebase configuration status
- Authentication state
- Project details

## 🚨 Common Issues & Solutions

### Issue 1: "Authentication is not enabled"
**Solution**: Enable Authentication in Firebase Console (Step 1 above)

### Issue 2: "Email/Password sign-in is not enabled"
**Solution**: Enable Email/Password in Sign-in methods (Step 2 above)

### Issue 3: "Domain not authorized"
**Solution**: Add your domain to authorized domains (Step 3 above)

### Issue 4: "Invalid API key"
**Solution**: Verify the API key in your Firebase project settings

## 📋 Verification Checklist

- [ ] Authentication is enabled in Firebase Console
- [ ] Email/Password sign-in method is enabled
- [ ] localhost is in authorized domains
- [ ] Firebase config is correct
- [ ] No console errors in browser
- [ ] Debug component shows correct info

## 🆘 If Still Not Working

1. **Check Firebase Console**:
   - Go to Project Settings > General
   - Verify the Web App configuration matches your code

2. **Test with Firebase Emulator**:
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Run: `firebase emulators:start --only auth`
   - Update your code to use emulator (already included)

3. **Create a new Firebase project** if the current one has issues

## 📞 Support

If you're still having issues, the debug component on the login page will show exactly what's wrong with your Firebase configuration.
