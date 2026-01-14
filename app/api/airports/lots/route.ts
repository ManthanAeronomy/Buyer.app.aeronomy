import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Lot from '@/models/Lot'
import { AIRPORTS, getAirportByCode } from '@/lib/airport-data'

export interface AirportLotData {
    code: string
    name: string
    city: string
    country: string
    region: string
    coordinates: [number, number]
    regulations: {
        framework: string
        mandate: string
        notes?: string
    }
    lotData: {
        totalLots: number
        totalVolume: number
        volumeUnit: string
        avgPrice: number
        minPrice: number
        maxPrice: number
        currency: string
        standards: string[]
    } | null
}

export async function GET(req: NextRequest) {
    try {
        await connectDB()

        // Get all published lots with delivery location
        const lots = await Lot.find({
            status: 'published',
            'delivery.deliveryLocation': { $exists: true, $ne: '' }
        }).lean()

        // Aggregate lots by delivery location (airport code)
        const lotsByAirport: Record<string, any[]> = {}

        for (const lot of lots) {
            const location = (lot.delivery?.deliveryLocation || '').toUpperCase().trim()

            // Try to match with known airport codes
            for (const airport of AIRPORTS) {
                // Match if the location contains the airport code or name
                if (
                    location === airport.code ||
                    location.includes(airport.code) ||
                    location.toLowerCase().includes(airport.city.toLowerCase()) ||
                    location.toLowerCase().includes(airport.name.toLowerCase())
                ) {
                    if (!lotsByAirport[airport.code]) {
                        lotsByAirport[airport.code] = []
                    }
                    lotsByAirport[airport.code].push(lot)
                    break
                }
            }
        }

        // Build response with all airports and their lot data
        const airportsWithLots: AirportLotData[] = AIRPORTS.map(airport => {
            const airportLots = lotsByAirport[airport.code] || []

            let lotData = null
            if (airportLots.length > 0) {
                const prices = airportLots.map(l => l.pricing?.pricePerUnit || l.pricing?.price / (l.volume?.amount || 1) || 0).filter(p => p > 0)
                const volumes = airportLots.map(l => l.volume?.amount || 0)
                const standards = [...new Set(airportLots.flatMap(l => l.compliance?.standards || []))]

                lotData = {
                    totalLots: airportLots.length,
                    totalVolume: volumes.reduce((a, b) => a + b, 0),
                    volumeUnit: airportLots[0]?.volume?.unit || 'gallons',
                    avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
                    minPrice: prices.length > 0 ? Math.min(...prices) : 0,
                    maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
                    currency: airportLots[0]?.pricing?.currency || 'USD',
                    standards,
                }
            }

            return {
                code: airport.code,
                name: airport.name,
                city: airport.city,
                country: airport.country,
                region: airport.region,
                coordinates: airport.coordinates,
                regulations: airport.regulations,
                lotData,
            }
        })

        return NextResponse.json({
            airports: airportsWithLots,
            totalAirports: airportsWithLots.length,
            airportsWithLots: airportsWithLots.filter(a => a.lotData !== null).length,
        })
    } catch (error: any) {
        console.error('Error fetching airport lots:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch airport lot data' },
            { status: 500 }
        )
    }
}
