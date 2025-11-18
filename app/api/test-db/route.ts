import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

/**
 * Test endpoint to trigger MongoDB connection
 * GET /api/test-db
 */
export async function GET() {
  try {
    console.log('🔌 Testing MongoDB connection...')
    await connectDB()
    
    return NextResponse.json({
      status: 'success',
      message: 'MongoDB connected successfully',
    })
  } catch (error: any) {
    console.error('❌ MongoDB connection test failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'MongoDB connection failed',
      },
      { status: 500 }
    )
  }
}

