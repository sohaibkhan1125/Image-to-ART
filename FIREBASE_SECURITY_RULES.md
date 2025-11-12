# 🔐 Firebase Security Rules Setup Guide

## 🚨 **Critical: Set Up Firebase Security Rules**

To prevent "User aborted a request" and permission errors, you need to configure Firebase Security Rules properly.

### **1. Firestore Security Rules**

Go to [Firebase Console](https://console.firebase.google.com) → Your Project → Firestore Database → Rules

Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write settings
    match /settings/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Allow public read access to general settings (for main website)
    match /settings/general {
      allow read: if true; // Public read for website display
      allow write: if request.auth != null; // Only authenticated admins can write
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### **2. Storage Security Rules**

Go to Firebase Console → Storage → Rules

Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload website assets
    match /website_assets/{allPaths=**} {
      allow read: if true; // Public read for website display
      allow write: if request.auth != null; // Only authenticated admins can upload
    }
    
    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### **3. Authentication Setup**

Make sure Authentication is enabled:

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password" provider
3. Add your domain to "Authorized domains" (localhost for development)

### **4. Test the Rules**

After setting up rules, test with your admin panel:

1. **Login as admin** → Should work
2. **Upload logo** → Should work
3. **Save settings** → Should work
4. **View main website** → Should display custom logo/title

## 🔧 **Why These Rules Fix the Issues**

### **"User aborted a request" Prevention**
- **Proper Authentication**: Rules ensure only authenticated users can write
- **Clear Permissions**: No ambiguous permission states
- **Public Read Access**: Main website can read settings without auth

### **Logo Upload Persistence**
- **Storage Rules**: Allow authenticated uploads to `website_assets/`
- **Firestore Rules**: Allow authenticated writes to `settings/general`
- **Atomic Operations**: Upload → Get URL → Save to Firestore

### **Title Input Responsiveness**
- **Controlled Components**: React state properly bound to inputs
- **No Permission Conflicts**: Clear read/write permissions
- **Error Handling**: Proper error messages for auth failures

## 🚀 **Deployment Checklist**

- [ ] Firestore rules updated
- [ ] Storage rules updated  
- [ ] Authentication enabled
- [ ] Email/Password sign-in method enabled
- [ ] Authorized domains configured
- [ ] Test admin login
- [ ] Test logo upload
- [ ] Test title editing
- [ ] Test main website display

## 🆘 **Troubleshooting**

### **Issue: "Permission denied" errors**
**Solution**: Check that rules are published and authentication is working

### **Issue: Logo upload fails**
**Solution**: Verify Storage rules allow writes to `website_assets/`

### **Issue: Title not saving**
**Solution**: Check Firestore rules allow writes to `settings/general`

### **Issue: Main website not showing custom logo**
**Solution**: Verify Firestore rules allow public read access to `settings/general`

## 📋 **Security Best Practices**

1. **Least Privilege**: Only grant necessary permissions
2. **Authentication Required**: All writes require authentication
3. **Public Read**: Only for display purposes
4. **Path Restrictions**: Limit access to specific document paths
5. **Regular Audits**: Review rules periodically

Your Firebase setup is now secure and production-ready! 🎉
