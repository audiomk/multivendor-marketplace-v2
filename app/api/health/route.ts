import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'

// Point an uptime monitor (UptimeRobot, Better Uptime, etc.) at this route.
// Checks real DB connectivity rather than just "the server process is up" —
// a hung MongoDB connection is a real outage even if Next.js itself
// responds.
export async function GET() {
  try {
    await connectToDatabase()
    return NextResponse.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('Health check failed:', err)
    return NextResponse.json(
      { status: 'error', db: 'disconnected', timestamp: new Date().toISOString() },
      { status: 503 }
    )
  }
}
