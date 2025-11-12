# 🚀 Deployment Guide - Admin Panel with JSON Backend

## 📋 **Overview**

This admin panel uses:
- **Frontend**: React app (deploy to cPanel)
- **Backend**: Vercel serverless functions with JSON storage
- **Authentication**: Firebase (existing setup)

## 🔧 **Backend Deployment (Vercel)**

### **Step 1: Deploy to Vercel**

1. **Create Vercel Account**: Go to [vercel.com](https://vercel.com) and sign up
2. **Install Vercel CLI**: 
   ```bash
   npm i -g vercel
   ```
3. **Deploy Backend**:
   ```bash
   # In your project root
   vercel
   ```
4. **Follow prompts**:
   - Link to existing project: No
   - Project name: `your-admin-backend`
   - Framework: Other
   - Root directory: `./` (current directory)

### **Step 2: Configure Environment**

After deployment, you'll get a URL like: `https://your-admin-backend.vercel.app`

Update your React app's environment:

```bash
# Create .env file in your React app root
echo "REACT_APP_API_URL=https://your-admin-backend.vercel.app" > .env
```

### **Step 3: Test Backend**

Test your API endpoints:

```bash
# Test GET request
curl https://your-admin-backend.vercel.app/api/settings

# Test POST request
curl -X POST https://your-admin-backend.vercel.app/api/settings \
  -H "Content-Type: application/json" \
  -d '{"maintenance": true, "title": "Test Title"}'
```

## 🌐 **Frontend Deployment (cPanel)**

### **Step 1: Build React App**

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### **Step 2: Upload to cPanel**

1. **Access cPanel**: Login to your hosting cPanel
2. **File Manager**: Navigate to `public_html` or your domain folder
3. **Upload Files**: Upload all files from `build/` folder
4. **Set Permissions**: Ensure files are readable (644 for files, 755 for folders)

### **Step 3: Configure Environment**

Create `.env` file in your cPanel hosting:

```bash
# In your hosting root directory
echo "REACT_APP_API_URL=https://your-admin-backend.vercel.app" > .env
```

## 🔧 **API Endpoints**

### **GET /api/settings**
Returns current settings:
```json
{
  "maintenance": false,
  "title": "PixelArt Converter"
}
```

### **POST /api/settings**
Updates settings:
```json
{
  "maintenance": true,
  "title": "New Title"
}
```

## 📁 **File Structure**

```
your-project/
├── api/
│   ├── settings.json          # JSON data storage
│   └── settings.js            # Vercel serverless function
├── vercel.json                # Vercel configuration
├── src/
│   ├── contexts/
│   │   └── SettingsContext.jsx # React context for settings
│   ├── components/
│   │   ├── MaintenanceModeJSON.jsx
│   │   ├── TitleManagementJSON.jsx
│   │   └── MaintenanceModeDisplay.jsx
│   ├── hooks/
│   │   └── useTitleJSON.js    # Hook for title management
│   └── pages/
│       └── AdminPanelJSON.jsx  # Main admin panel
└── .env                       # Environment variables
```

## 🔒 **Security Considerations**

### **CORS Configuration**
The API includes CORS headers for cross-origin requests:

```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

### **Input Validation**
All inputs are validated:

```javascript
if (typeof maintenance !== 'boolean') {
  return res.status(400).json({ error: "Maintenance must be a boolean" });
}

if (typeof title !== 'string') {
  return res.status(400).json({ error: "Title must be a string" });
}
```

## 🧪 **Testing**

### **Test Maintenance Mode**
1. Login to admin panel
2. Go to General Settings → Maintenance Mode
3. Toggle maintenance mode ON
4. Visit main website - should show maintenance message
5. Toggle OFF - normal website should appear

### **Test Title Management**
1. Go to General Settings → Website Title Management
2. Enter new title
3. Click Save
4. Check main website header/footer - title should update

### **Test API Directly**
```bash
# Get current settings
curl https://your-vercel-app.vercel.app/api/settings

# Update settings
curl -X POST https://your-vercel-app.vercel.app/api/settings \
  -H "Content-Type: application/json" \
  -d '{"maintenance": false, "title": "My New Title"}'
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. CORS Errors**
- Ensure Vercel deployment includes CORS headers
- Check that API URL is correct in environment variables

#### **2. 404 Errors**
- Verify API endpoint URL is correct
- Check that Vercel deployment was successful

#### **3. Settings Not Persisting**
- Check Vercel function logs
- Ensure JSON file has correct permissions

#### **4. Frontend Not Loading**
- Verify build files are in correct directory
- Check file permissions in cPanel

### **Debug Steps**

1. **Check Vercel Logs**:
   ```bash
   vercel logs
   ```

2. **Test API Locally**:
   ```bash
   vercel dev
   ```

3. **Check Browser Console**:
   - Look for CORS errors
   - Check network requests

4. **Verify Environment Variables**:
   ```bash
   echo $REACT_APP_API_URL
   ```

## ✅ **Success Checklist**

- [ ] Vercel backend deployed successfully
- [ ] API endpoints responding correctly
- [ ] React app built and deployed to cPanel
- [ ] Environment variables configured
- [ ] Maintenance mode working
- [ ] Title management working
- [ ] No CORS errors
- [ ] Settings persisting in JSON file

## 🎯 **Expected Results**

After successful deployment:

1. **Admin Panel**: Accessible at `/admin` with Firebase authentication
2. **Maintenance Mode**: Toggle works instantly, shows maintenance message
3. **Title Management**: Updates website title in real-time
4. **Data Persistence**: Settings saved to JSON file on Vercel
5. **No Firebase Database**: Only authentication uses Firebase
6. **Cross-Origin**: Frontend and backend work together seamlessly

## 🚀 **Production Ready**

Your admin panel is now production-ready with:
- ✅ Firebase authentication
- ✅ JSON backend on Vercel
- ✅ Real-time updates
- ✅ Data persistence
- ✅ Error handling
- ✅ CORS support
- ✅ Input validation
- ✅ Responsive design

Deploy and enjoy your fully functional admin panel! 🎉
