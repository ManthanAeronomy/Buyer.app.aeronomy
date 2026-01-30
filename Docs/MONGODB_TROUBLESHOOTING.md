# MongoDB Connection Troubleshooting Guide

## Error: `querySrv EREFUSED _mongodb._tcp.cluster0.wk2yksl.mongodb.net`

This error means DNS resolution is failing for your MongoDB Atlas cluster. Here are the most common causes and solutions:

## Common Causes & Solutions

### 1. **MongoDB Atlas Cluster is Paused** (Most Common)

**Free tier clusters pause after 1 hour of inactivity.**

**Solution:**
1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Navigate to your cluster
3. Click **"Resume"** or **"Resume Cluster"**
4. Wait 1-2 minutes for the cluster to resume
5. Try connecting again

### 2. **IP Address Not Whitelisted**

MongoDB Atlas blocks connections from IPs not in the whitelist.

**Solution:**
1. Go to MongoDB Atlas → **Network Access**
2. Click **"Add IP Address"**
3. For local development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ **Warning:** Only use this for development. Use specific IPs in production.
4. Save and wait 1-2 minutes
5. Try connecting again

### 3. **Incorrect Connection String**

The connection string format might be wrong.

**Correct Format:**
```
mongodb+srv://username:password@cluster0.wk2yksl.mongodb.net/database-name?retryWrites=true&w=majority
```

**Check:**
- Username and password are correct (no special characters need URL encoding)
- Database name is correct
- Cluster name matches (cluster0.wk2yksl.mongodb.net)

### 4. **Network/Firewall Issues**

Your network or firewall might be blocking MongoDB connections.

**Solution:**
- Try a different network (mobile hotspot)
- Check if corporate firewall is blocking port 27017
- Try using MongoDB Compass to test connection

### 5. **DNS Resolution Issues**

Your system might have DNS issues.

**Solution:**
```bash
# Test DNS resolution
nslookup cluster0.wk2yksl.mongodb.net

# Flush DNS cache (Windows)
ipconfig /flushdns

# Flush DNS cache (Mac/Linux)
sudo dscacheutil -flushcache
```

## Quick Fix Checklist

1. ✅ **Check if cluster is running** in MongoDB Atlas dashboard
2. ✅ **Verify IP whitelist** includes your current IP (or 0.0.0.0/0 for dev)
3. ✅ **Verify connection string** in `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.wk2yksl.mongodb.net/database-name?retryWrites=true&w=majority
   ```
4. ✅ **Restart your dev server** after making changes
5. ✅ **Check MongoDB Atlas logs** for connection attempts

## Testing Connection

### Option 1: Test with MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Paste your connection string
3. Click "Connect"
4. If it works here, the issue is with your app configuration

### Option 2: Test with Node.js Script

Create `test-mongodb.js`:

```javascript
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || 'your-connection-string-here'

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Connection failed:', error.message)
    process.exit(1)
  })
```

Run:
```bash
node test-mongodb.js
```

### Option 3: Use Health Check Endpoint

Visit: `http://localhost:3004/api/health/mongodb`

## Alternative: Use Standard Connection String

If `mongodb+srv://` continues to fail, try the standard connection string:

1. In MongoDB Atlas, click **"Connect"** → **"Connect your application"**
2. Select **"Node.js"** driver
3. Copy the connection string
4. Replace `mongodb+srv://` with `mongodb://` and add port `:27017`

Example:
```
mongodb://username:password@cluster0-shard-00-00.wk2yksl.mongodb.net:27017,cluster0-shard-00-01.wk2yksl.mongodb.net:27017,cluster0-shard-00-02.wk2yksl.mongodb.net:27017/database-name?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

## Environment Variable Setup

Make sure `.env.local` exists in your project root:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster0.wk2yksl.mongodb.net/aeronomy?retryWrites=true&w=majority

# Other required variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
CLERK_WEBHOOK_SECRET=...
```

**Important:** 
- Replace `username` and `password` with your MongoDB Atlas credentials
- Replace `aeronomy` with your database name
- Make sure there are no spaces or quotes around the connection string

## Still Having Issues?

1. **Check MongoDB Atlas Status**: https://status.mongodb.com/
2. **Review MongoDB Atlas Logs**: Dashboard → Monitoring → Logs
3. **Try creating a new database user** with read/write permissions
4. **Verify your MongoDB Atlas project** is active and not suspended

## Connection String Format Reference

```
mongodb+srv://[username]:[password]@[cluster]/[database]?[options]
```

**Options:**
- `retryWrites=true` - Retry write operations
- `w=majority` - Write concern
- `ssl=true` - Use SSL (usually automatic with mongodb+srv)

## Common Mistakes

❌ **Wrong:** `MONGODB_URI="mongodb+srv://..."` (quotes)
✅ **Right:** `MONGODB_URI=mongodb+srv://...` (no quotes)

❌ **Wrong:** `MONGODB_URI=mongodb+srv://user:pass@cluster/db` (missing options)
✅ **Right:** `MONGODB_URI=mongodb+srv://user:pass@cluster/db?retryWrites=true&w=majority`

❌ **Wrong:** Using old connection string after cluster name change
✅ **Right:** Get fresh connection string from Atlas dashboard



