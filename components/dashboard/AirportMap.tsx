'use client'

import { useState, useEffect, memo } from 'react'
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup,
} from 'react-simple-maps'
import { MapPin, Package, DollarSign, Shield, Loader2, X } from 'lucide-react'
import { REGION_COLORS } from '@/lib/airport-data'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface AirportLotData {
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

interface TooltipData {
    airport: AirportLotData
    x: number
    y: number
}

function AirportMap() {
    const [airports, setAirports] = useState<AirportLotData[]>([])
    const [loading, setLoading] = useState(true)
    const [tooltip, setTooltip] = useState<TooltipData | null>(null)
    const [selectedAirport, setSelectedAirport] = useState<AirportLotData | null>(null)

    useEffect(() => {
        fetchAirportData()
    }, [])

    const fetchAirportData = async () => {
        try {
            const res = await fetch('/api/airports/lots')
            if (res.ok) {
                const data = await res.json()
                setAirports(data.airports || [])
            }
        } catch (error) {
            console.error('Failed to fetch airport data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkerHover = (airport: AirportLotData, event: React.MouseEvent) => {
        const rect = (event.target as Element).getBoundingClientRect()
        setTooltip({
            airport,
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY - 10,
        })
    }

    const handleMarkerLeave = () => {
        setTooltip(null)
    }

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price)
    }

    const formatVolume = (volume: number, unit: string) => {
        if (volume >= 1000000) {
            return `${(volume / 1000000).toFixed(1)}M ${unit}`
        }
        if (volume >= 1000) {
            return `${(volume / 1000).toFixed(0)}K ${unit}`
        }
        return `${volume.toLocaleString()} ${unit}`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[400px] bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-slate-500">Loading airport data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            Global SAF Marketplace Map
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Hover over airports to view SAF availability and regulations
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-green-500"></span>
                            <span className="text-slate-600">Lots Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-slate-300"></span>
                            <span className="text-slate-600">No Lots</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="h-[450px] bg-[#f0f4f8]">
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                        scale: 140,
                        center: [10, 30],
                    }}
                    style={{ width: '100%', height: '100%' }}
                >
                    <ZoomableGroup>
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill="#e2e8f0"
                                        stroke="#cbd5e1"
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: 'none' },
                                            hover: { fill: '#cbd5e1', outline: 'none' },
                                            pressed: { outline: 'none' },
                                        }}
                                    />
                                ))
                            }
                        </Geographies>

                        {/* Airport Markers */}
                        {airports.map((airport) => {
                            const hasLots = airport.lotData !== null && airport.lotData.totalLots > 0
                            const regionColor = REGION_COLORS[airport.region as keyof typeof REGION_COLORS] || '#64748b'

                            return (
                                <Marker
                                    key={airport.code}
                                    coordinates={airport.coordinates}
                                    onMouseEnter={(e) => handleMarkerHover(airport, e)}
                                    onMouseLeave={handleMarkerLeave}
                                    onClick={() => setSelectedAirport(airport)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <circle
                                        r={hasLots ? 6 : 4}
                                        fill={hasLots ? regionColor : '#94a3b8'}
                                        stroke="#fff"
                                        strokeWidth={1.5}
                                        opacity={hasLots ? 1 : 0.6}
                                        className="transition-all duration-200 hover:r-8"
                                    />
                                    {hasLots && (
                                        <circle
                                            r={10}
                                            fill={regionColor}
                                            opacity={0.2}
                                            className="animate-ping"
                                        />
                                    )}
                                </Marker>
                            )
                        })}
                    </ZoomableGroup>
                </ComposableMap>
            </div>

            {/* Hover Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translate(-50%, -100%)',
                    }}
                >
                    <div className="bg-slate-900 text-white rounded-lg shadow-xl p-4 min-w-[280px] max-w-[320px]">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="font-bold text-lg">{tooltip.airport.code}</p>
                                <p className="text-sm text-slate-300">{tooltip.airport.name}</p>
                                <p className="text-xs text-slate-400">{tooltip.airport.city}, {tooltip.airport.country}</p>
                            </div>
                            <span
                                className="text-xs px-2 py-1 rounded font-medium"
                                style={{ backgroundColor: REGION_COLORS[tooltip.airport.region as keyof typeof REGION_COLORS] }}
                            >
                                {tooltip.airport.region}
                            </span>
                        </div>

                        {/* Regulations */}
                        <div className="mb-3 pb-3 border-b border-slate-700">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Regulatory Framework</p>
                            <p className="text-sm font-medium text-blue-400">{tooltip.airport.regulations.framework}</p>
                            <p className="text-xs text-slate-300">{tooltip.airport.regulations.mandate}</p>
                        </div>

                        {/* Lot Data */}
                        {tooltip.airport.lotData ? (
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">SAF Lots Available</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-green-400" />
                                        <span><strong>{tooltip.airport.lotData.totalLots}</strong> lots</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-yellow-400" />
                                        <span>{formatPrice(tooltip.airport.lotData.avgPrice, tooltip.airport.lotData.currency)}/gal</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    Volume: {formatVolume(tooltip.airport.lotData.totalVolume, tooltip.airport.lotData.volumeUnit)}
                                </p>
                                {tooltip.airport.lotData.standards.length > 0 && (
                                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                                        <Shield className="h-3 w-3 text-green-400" />
                                        {tooltip.airport.lotData.standards.map(s => (
                                            <span key={s} className="text-xs bg-slate-700 px-1.5 py-0.5 rounded">{s}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">No SAF lots currently available</p>
                        )}

                        {/* Arrow */}
                        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full">
                            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-900"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Selected Airport Detail Panel */}
            {selectedAirport && (
                <div className="absolute right-4 top-16 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-40 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">{selectedAirport.code} - {selectedAirport.city}</h3>
                        <button
                            onClick={() => setSelectedAirport(null)}
                            className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                        >
                            <X className="h-4 w-4 text-slate-500" />
                        </button>
                    </div>
                    <div className="p-4 space-y-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Airport</p>
                            <p className="font-medium text-slate-900">{selectedAirport.name}</p>
                            <p className="text-sm text-slate-600">{selectedAirport.country}</p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Regulatory Framework</p>
                            <p className="font-medium text-blue-600">{selectedAirport.regulations.framework}</p>
                            <p className="text-sm text-slate-600">{selectedAirport.regulations.mandate}</p>
                            {selectedAirport.regulations.notes && (
                                <p className="text-xs text-slate-500 mt-1">{selectedAirport.regulations.notes}</p>
                            )}
                        </div>

                        {selectedAirport.lotData ? (
                            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-2">SAF Available</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Lots Posted</span>
                                        <span className="font-bold text-slate-900">{selectedAirport.lotData.totalLots}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Total Volume</span>
                                        <span className="font-bold text-slate-900">{formatVolume(selectedAirport.lotData.totalVolume, selectedAirport.lotData.volumeUnit)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Avg Price</span>
                                        <span className="font-bold text-green-700">{formatPrice(selectedAirport.lotData.avgPrice, selectedAirport.lotData.currency)}/gal</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Price Range</span>
                                        <span className="text-slate-900">
                                            {formatPrice(selectedAirport.lotData.minPrice, selectedAirport.lotData.currency)} - {formatPrice(selectedAirport.lotData.maxPrice, selectedAirport.lotData.currency)}
                                        </span>
                                    </div>
                                    {selectedAirport.lotData.standards.length > 0 && (
                                        <div className="pt-2 border-t border-green-200">
                                            <p className="text-xs text-slate-500 mb-1">Compliance Standards</p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedAirport.lotData.standards.map(s => (
                                                    <span key={s} className="text-xs bg-white px-2 py-0.5 rounded border border-green-300 text-green-700">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
                                <p className="text-sm text-slate-500">No SAF lots currently available at this airport</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Region Legend */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-center gap-6 text-xs">
                    {Object.entries(REGION_COLORS).map(([region, color]) => (
                        <div key={region} className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                            <span className="text-slate-600">{region}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default memo(AirportMap)
