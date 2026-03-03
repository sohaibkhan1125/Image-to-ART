# 🔐 Firestore Security Rules - Blogs Update

To fix the `permission-denied` error, you need to update your Firestore security rules to allow access to the new `blogs` collection.

## 📋 Updated Rules

Copy and replace your current rules in the **Firebase Console** with this version:

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
    
    // 3. BLOGS COLLECTION (New)
    match /blogs/{blogId} {
      // Allow public to read ONLY published posts
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

1.  Open [Firebase Console](https://console.firebase.google.com).
2.  Go to **Firestore Database** → **Rules**.
3.  Delete everything and paste the rules above.
4.  Click **Publish**.

## 💡 Why this fixes the error:
The previous rules explicitly denied any collection that wasn't `settings`. These new rules specifically allow:
- **Public**: Can read any blog document where `published` is `true`.
- **Admin**: Can read and write (create/edit/delete) ALL blogs since they are authenticated.
