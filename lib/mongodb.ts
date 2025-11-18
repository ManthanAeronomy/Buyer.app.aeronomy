import mongoose from 'mongoose'

const MONGODB_URI: string | undefined = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI is not set in environment variables')
  console.warn('⚠️  MongoDB features will be disabled. Add MONGODB_URI to .env.local to enable.')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Set up connection event listeners
if (process.env.NODE_ENV === 'development') {
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB Atlas: Connected')
  })

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB Atlas connection error:', err.message)
  })

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB Atlas: Disconnected')
  })

  // Log when connection is ready
  mongoose.connection.once('open', () => {
    console.log('✅ MongoDB Atlas: Connection opened')
    console.log(`📊 Database: ${mongoose.connection.db?.databaseName || 'connected'}`)
  })
}

// Use global variable to maintain a cached connection across hot reloads in development
declare global {
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error('MongoDB URI is not configured. Please add MONGODB_URI to your environment variables.')
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB Atlas connected successfully')
      console.log(`📊 Database: ${mongoose.connection.db?.databaseName || 'connected'}`)
      return mongoose
    }).catch((error) => {
      console.error('❌ MongoDB Atlas connection error:', error.message)
      
      // Provide helpful error messages for common issues
      if (error.message.includes('querySrv EREFUSED')) {
        console.error('\n💡 Troubleshooting tips:')
        console.error('   1. Check if your MongoDB Atlas cluster is running (free tier clusters pause after inactivity)')
        console.error('   2. Verify your IP address is whitelisted in MongoDB Atlas Network Access')
        console.error('   3. Check your MONGODB_URI connection string in .env.local')
        console.error('   4. See MONGODB_TROUBLESHOOTING.md for detailed help\n')
      } else if (error.message.includes('authentication failed')) {
        console.error('\n💡 Authentication failed:')
        console.error('   1. Verify your username and password in the connection string')
        console.error('   2. Check if the database user has proper permissions')
        console.error('   3. Ensure special characters in password are URL-encoded\n')
      } else if (error.message.includes('ENOTFOUND')) {
        console.error('\n💡 DNS resolution failed:')
        console.error('   1. Check your internet connection')
        console.error('   2. Verify the cluster hostname in your connection string')
        console.error('   3. Try flushing DNS cache: ipconfig /flushdns (Windows) or sudo dscacheutil -flushcache (Mac)\n')
      }
      
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
    
    // Log connection status
    if (cached.conn.connection.readyState === 1) {
      console.log('✅ MongoDB Atlas connection verified')
    }
  } catch (e) {
    cached.promise = null
    console.error('❌ Failed to connect to MongoDB Atlas')
    throw e
  }

  return cached.conn
}

export default connectDB

