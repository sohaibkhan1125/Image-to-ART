# 🚀 Fix Firestore Index Error

The error `failed-precondition` means the database needs a **Composite Index** to handle filtering by `published` and sorting by `createdAt` at the same time.

## ✅ Easy Fix
Simply click the link already provided in your error message:
[👉 Create Index for image-to-art-30258](https://console.firebase.google.com/v1/r/project/image-to-art-30258/firestore/indexes?create_composite=ClBwcm9qZWN0cy9pbWFnZS10by1hcnQtMzAyNTgvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2Jsb2dzL2luZGV4ZXMvXxABGg0KCXB1Ymxpc2hlZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI)

## 🔧 Manual Fix (if link doesn't work)
If you can't use the link, follow these steps in your [Firebase Console](https://console.firebase.google.com):

1.  Go to **Firestore Database** → **Indexes** → **Composite**.
2.  Click **Create Index**.
3.  Set **Collection ID** to: `blogs`.
4.  Add **Fields**:
    -   `published` (Ascending)
    -   `createdAt` (Descending)
5.  Click **Create**.

> [!IMPORTANT]
> It usually takes 2-5 minutes for the index to be ready. Once "Building" changes to "Enabled", the error will disappear and your blogs will show up on the website!
