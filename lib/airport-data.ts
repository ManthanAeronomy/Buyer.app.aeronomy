// Major world airports with coordinates and SAF regulatory information

export interface AirportRegulations {
    framework: string
    mandate: string
    notes?: string
}

export interface AirportData {
    code: string
    name: string
    city: string
    country: string
    region: 'US' | 'EU' | 'UK' | 'APAC' | 'MENA' | 'LATAM' | 'Africa'
    coordinates: [number, number] // [longitude, latitude]
    regulations: AirportRegulations
}

// SAF Regulatory Frameworks by Region
const REGULATIONS = {
    US: {
        framework: 'US SAF Grand Challenge',
        mandate: '3 billion gallons by 2030',
        notes: 'Tax credits under Inflation Reduction Act (IRA)',
    },
    EU: {
        framework: 'ReFuelEU Aviation',
        mandate: '2% by 2025, 6% by 2030, 70% by 2050',
        notes: 'Mandatory blend requirements for EU departures',
    },
    UK: {
        framework: 'UK SAF Mandate',
        mandate: '2% by 2025, 10% by 2030',
        notes: 'Jet Zero Strategy targets',
    },
    APAC: {
        framework: 'CORSIA',
        mandate: 'Varies by country',
        notes: 'Singapore, Japan, Australia advancing national targets',
    },
    MENA: {
        framework: 'CORSIA',
        mandate: 'Voluntary phase',
        notes: 'UAE and Saudi Arabia investing in SAF production',
    },
    LATAM: {
        framework: 'CORSIA',
        mandate: 'Voluntary phase',
        notes: 'Brazil leading with ethanol-based SAF development',
    },
    Africa: {
        framework: 'CORSIA',
        mandate: 'Voluntary phase',
        notes: 'Limited SAF infrastructure currently',
    },
}

export const AIRPORTS: AirportData[] = [
    // United States
    { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'USA', region: 'US', coordinates: [-84.4281, 33.6407], regulations: REGULATIONS.US },
    { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA', region: 'US', coordinates: [-97.0403, 32.8998], regulations: REGULATIONS.US },
    { code: 'DEN', name: 'Denver International', city: 'Denver', country: 'USA', region: 'US', coordinates: [-104.6737, 39.8561], regulations: REGULATIONS.US },
    { code: 'ORD', name: "Chicago O'Hare International", city: 'Chicago', country: 'USA', region: 'US', coordinates: [-87.9073, 41.9742], regulations: REGULATIONS.US },
    { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', region: 'US', coordinates: [-118.4085, 33.9425], regulations: REGULATIONS.US },
    { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', region: 'US', coordinates: [-73.7789, 40.6413], regulations: REGULATIONS.US },
    { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA', region: 'US', coordinates: [-122.3789, 37.6213], regulations: REGULATIONS.US },
    { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA', region: 'US', coordinates: [-122.3088, 47.4502], regulations: REGULATIONS.US },
    { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA', region: 'US', coordinates: [-80.2870, 25.7959], regulations: REGULATIONS.US },
    { code: 'EWR', name: 'Newark Liberty International', city: 'Newark', country: 'USA', region: 'US', coordinates: [-74.1687, 40.6895], regulations: REGULATIONS.US },
    { code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', country: 'USA', region: 'US', coordinates: [-95.3414, 29.9902], regulations: REGULATIONS.US },
    { code: 'PHX', name: 'Phoenix Sky Harbor International', city: 'Phoenix', country: 'USA', region: 'US', coordinates: [-112.0116, 33.4373], regulations: REGULATIONS.US },

    // European Union
    { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', region: 'EU', coordinates: [2.5479, 49.0097], regulations: REGULATIONS.EU },
    { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', region: 'EU', coordinates: [8.5622, 50.0379], regulations: REGULATIONS.EU },
    { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', region: 'EU', coordinates: [4.7683, 52.3105], regulations: REGULATIONS.EU },
    { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', city: 'Madrid', country: 'Spain', region: 'EU', coordinates: [-3.5673, 40.4983], regulations: REGULATIONS.EU },
    { code: 'BCN', name: 'Barcelona–El Prat', city: 'Barcelona', country: 'Spain', region: 'EU', coordinates: [2.0785, 41.2974], regulations: REGULATIONS.EU },
    { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino', city: 'Rome', country: 'Italy', region: 'EU', coordinates: [12.2389, 41.8003], regulations: REGULATIONS.EU },
    { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', region: 'EU', coordinates: [11.7750, 48.3537], regulations: REGULATIONS.EU },
    { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', region: 'EU', coordinates: [8.5491, 47.4582], regulations: REGULATIONS.EU },
    { code: 'VIE', name: 'Vienna International', city: 'Vienna', country: 'Austria', region: 'EU', coordinates: [16.5697, 48.1103], regulations: REGULATIONS.EU },
    { code: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium', region: 'EU', coordinates: [4.4844, 50.9010], regulations: REGULATIONS.EU },
    { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', region: 'EU', coordinates: [12.6508, 55.6180], regulations: REGULATIONS.EU },
    { code: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'Norway', region: 'EU', coordinates: [11.1004, 60.1939], regulations: REGULATIONS.EU },
    { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden', region: 'EU', coordinates: [17.9237, 59.6498], regulations: REGULATIONS.EU },
    { code: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finland', region: 'EU', coordinates: [24.9633, 60.3172], regulations: REGULATIONS.EU },

    // United Kingdom
    { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK', region: 'UK', coordinates: [-0.4543, 51.4700], regulations: REGULATIONS.UK },
    { code: 'LGW', name: 'London Gatwick', city: 'London', country: 'UK', region: 'UK', coordinates: [-0.1821, 51.1537], regulations: REGULATIONS.UK },
    { code: 'STN', name: 'London Stansted', city: 'London', country: 'UK', region: 'UK', coordinates: [0.2350, 51.8850], regulations: REGULATIONS.UK },
    { code: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'UK', region: 'UK', coordinates: [-2.2750, 53.3537], regulations: REGULATIONS.UK },
    { code: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh', country: 'UK', region: 'UK', coordinates: [-3.3725, 55.9500], regulations: REGULATIONS.UK },
    { code: 'BHX', name: 'Birmingham Airport', city: 'Birmingham', country: 'UK', region: 'UK', coordinates: [-1.7480, 52.4539], regulations: REGULATIONS.UK },

    // Asia Pacific
    { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'China', region: 'APAC', coordinates: [113.9146, 22.3080], regulations: REGULATIONS.APAC },
    { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', region: 'APAC', coordinates: [103.9915, 1.3644], regulations: REGULATIONS.APAC },
    { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', region: 'APAC', coordinates: [140.3929, 35.7720], regulations: REGULATIONS.APAC },
    { code: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan', region: 'APAC', coordinates: [139.7798, 35.5494], regulations: REGULATIONS.APAC },
    { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea', region: 'APAC', coordinates: [126.4407, 37.4602], regulations: REGULATIONS.APAC },
    { code: 'PVG', name: 'Shanghai Pudong', city: 'Shanghai', country: 'China', region: 'APAC', coordinates: [121.8083, 31.1443], regulations: REGULATIONS.APAC },
    { code: 'PEK', name: 'Beijing Capital', city: 'Beijing', country: 'China', region: 'APAC', coordinates: [116.5974, 40.0799], regulations: REGULATIONS.APAC },
    { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand', region: 'APAC', coordinates: [100.7501, 13.6900], regulations: REGULATIONS.APAC },
    { code: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia', region: 'APAC', coordinates: [101.7098, 2.7456], regulations: REGULATIONS.APAC },
    { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', region: 'APAC', coordinates: [151.1772, -33.9399], regulations: REGULATIONS.APAC },
    { code: 'MEL', name: 'Melbourne Tullamarine', city: 'Melbourne', country: 'Australia', region: 'APAC', coordinates: [144.8410, -37.6690], regulations: REGULATIONS.APAC },
    { code: 'DEL', name: 'Indira Gandhi International', city: 'New Delhi', country: 'India', region: 'APAC', coordinates: [77.1025, 28.5562], regulations: REGULATIONS.APAC },
    { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj', city: 'Mumbai', country: 'India', region: 'APAC', coordinates: [72.8679, 19.0896], regulations: REGULATIONS.APAC },
    { code: 'CGK', name: 'Soekarno-Hatta', city: 'Jakarta', country: 'Indonesia', region: 'APAC', coordinates: [106.6558, -6.1256], regulations: REGULATIONS.APAC },

    // Middle East & North Africa
    { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', region: 'MENA', coordinates: [55.3644, 25.2532], regulations: REGULATIONS.MENA },
    { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'UAE', region: 'MENA', coordinates: [54.6511, 24.4330], regulations: REGULATIONS.MENA },
    { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', region: 'MENA', coordinates: [51.6138, 25.2609], regulations: REGULATIONS.MENA },
    { code: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia', region: 'MENA', coordinates: [39.1502, 21.6796], regulations: REGULATIONS.MENA },
    { code: 'RUH', name: 'King Khalid International', city: 'Riyadh', country: 'Saudi Arabia', region: 'MENA', coordinates: [46.6988, 24.9576], regulations: REGULATIONS.MENA },
    { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt', region: 'MENA', coordinates: [31.4056, 30.1219], regulations: REGULATIONS.MENA },
    { code: 'TLV', name: 'Ben Gurion', city: 'Tel Aviv', country: 'Israel', region: 'MENA', coordinates: [34.8854, 32.0055], regulations: REGULATIONS.MENA },
    { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', region: 'MENA', coordinates: [28.7519, 41.2753], regulations: REGULATIONS.MENA },
    { code: 'AMM', name: 'Queen Alia International', city: 'Amman', country: 'Jordan', region: 'MENA', coordinates: [35.9932, 31.7226], regulations: REGULATIONS.MENA },
    { code: 'BAH', name: 'Bahrain International', city: 'Manama', country: 'Bahrain', region: 'MENA', coordinates: [50.6336, 26.2708], regulations: REGULATIONS.MENA },
    { code: 'MCT', name: 'Muscat International', city: 'Muscat', country: 'Oman', region: 'MENA', coordinates: [58.2844, 23.5931], regulations: REGULATIONS.MENA },
    { code: 'KWI', name: 'Kuwait International', city: 'Kuwait City', country: 'Kuwait', region: 'MENA', coordinates: [47.9690, 29.2266], regulations: REGULATIONS.MENA },

    // Latin America
    { code: 'GRU', name: 'São Paulo–Guarulhos', city: 'São Paulo', country: 'Brazil', region: 'LATAM', coordinates: [-46.4730, -23.4356], regulations: REGULATIONS.LATAM },
    { code: 'MEX', name: 'Mexico City International', city: 'Mexico City', country: 'Mexico', region: 'LATAM', coordinates: [-99.0721, 19.4363], regulations: REGULATIONS.LATAM },
    { code: 'BOG', name: 'El Dorado International', city: 'Bogotá', country: 'Colombia', region: 'LATAM', coordinates: [-74.1469, 4.7016], regulations: REGULATIONS.LATAM },
    { code: 'SCL', name: 'Arturo Merino Benítez', city: 'Santiago', country: 'Chile', region: 'LATAM', coordinates: [-70.7859, -33.3930], regulations: REGULATIONS.LATAM },
    { code: 'EZE', name: 'Ministro Pistarini', city: 'Buenos Aires', country: 'Argentina', region: 'LATAM', coordinates: [-58.5358, -34.8222], regulations: REGULATIONS.LATAM },
    { code: 'LIM', name: 'Jorge Chávez International', city: 'Lima', country: 'Peru', region: 'LATAM', coordinates: [-77.1143, -12.0219], regulations: REGULATIONS.LATAM },
    { code: 'PTY', name: 'Tocumen International', city: 'Panama City', country: 'Panama', region: 'LATAM', coordinates: [-79.3835, 9.0714], regulations: REGULATIONS.LATAM },
    { code: 'CUN', name: 'Cancún International', city: 'Cancún', country: 'Mexico', region: 'LATAM', coordinates: [-86.8770, 21.0365], regulations: REGULATIONS.LATAM },
    { code: 'GIG', name: 'Rio de Janeiro–Galeão', city: 'Rio de Janeiro', country: 'Brazil', region: 'LATAM', coordinates: [-43.2436, -22.8090], regulations: REGULATIONS.LATAM },

    // Africa
    { code: 'JNB', name: 'O.R. Tambo International', city: 'Johannesburg', country: 'South Africa', region: 'Africa', coordinates: [28.2314, -26.1392], regulations: REGULATIONS.Africa },
    { code: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'South Africa', region: 'Africa', coordinates: [18.6017, -33.9715], regulations: REGULATIONS.Africa },
    { code: 'NBO', name: 'Jomo Kenyatta International', city: 'Nairobi', country: 'Kenya', region: 'Africa', coordinates: [36.9258, -1.3192], regulations: REGULATIONS.Africa },
    { code: 'ADD', name: 'Addis Ababa Bole', city: 'Addis Ababa', country: 'Ethiopia', region: 'Africa', coordinates: [38.7989, 8.9779], regulations: REGULATIONS.Africa },
    { code: 'LOS', name: 'Murtala Muhammed', city: 'Lagos', country: 'Nigeria', region: 'Africa', coordinates: [3.3212, 6.5774], regulations: REGULATIONS.Africa },
]

// Helper to get airport by code
export function getAirportByCode(code: string): AirportData | undefined {
    return AIRPORTS.find(a => a.code.toUpperCase() === code.toUpperCase())
}

// Helper to get airports by region
export function getAirportsByRegion(region: AirportData['region']): AirportData[] {
    return AIRPORTS.filter(a => a.region === region)
}

// Color scheme for regions
export const REGION_COLORS: Record<AirportData['region'], string> = {
    US: '#3B82F6',      // Blue
    EU: '#10B981',      // Green
    UK: '#6366F1',      // Indigo
    APAC: '#F59E0B',    // Amber
    MENA: '#EF4444',    // Red
    LATAM: '#8B5CF6',   // Purple
    Africa: '#EC4899',  // Pink
}
