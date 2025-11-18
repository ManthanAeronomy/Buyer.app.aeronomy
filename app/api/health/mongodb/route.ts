import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'

/**
 * Health check endpoint to verify MongoDB connection
 * GET /api/health/mongodb
 */
export async function GET() {
  try {
    await connectDB()

    const connectionState = mongoose.connection.readyState
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    }

    const stateName = states[connectionState as keyof typeof states] || 'unknown'

    if (connectionState === 1) {
      return NextResponse.json({
        status: 'success',
        message: 'MongoDB Atlas is connected',
        connectionState: stateName,
        database: mongoose.connection.db?.databaseName || 'unknown',
        host: mongoose.connection.host || 'unknown',
      })
    } else {
      return NextResponse.json(
        {
          status: 'error',
          message: `MongoDB Atlas connection state: ${stateName}`,
          connectionState: stateName,
        },
        { status: 503 }
      )
    }
  } catch (error: any) {
    console.error('MongoDB health check failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to connect to MongoDB Atlas',
        error: error.message,
      },
      { status: 503 }
    )
  }
}

