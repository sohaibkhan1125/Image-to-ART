# 🔐 Firestore Security Rules - Comparison & Update

Here are your old rules and the new ones that include the blog management support.

## ❌ Old Rules (Current)
These rules are blocking the `blogs` collection because of the catch-all `match /{document=**}` at the bottom.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow public read access to general settings (for website display)
    match /settings/general {
      allow read: if true; // Public read for website title display
      allow write: if request.auth != null; // Only authenticated admins can write
    }
    
    // Allow authenticated users to read/write other settings
    match /settings/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## ✅ New Rules (To Apply)
These rules add a specific section for the `blogs` collection, allowing public read for published posts and full access for admins.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 1. Website settings - public read, admin write
    match /settings/general {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 2. Other settings - admin only
    match /settings/{document} {
      allow read, write: if request.auth != null;
    }
    
    // 3. BLOGS COLLECTION
    match /blogs/{blogId} {
      // Allow public to read ONLY published posts
      // Admin can read everything (drafts + published)
      allow read: if (resource != null && resource.data.published == true) || request.auth != null;
      
      // Only authenticated admins can create, update, or delete
      allow write: if request.auth != null;
    }
    
    // 4. Default: Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🚀 How to Apply
1. Go to your [Firebase Console](https://console.firebase.google.com).
2. Navigate to **Firestore Database** → **Rules**.
3. Replace the entire content with the **New Rules** above.
4. Click **Publish**.
