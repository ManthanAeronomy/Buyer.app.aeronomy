declare module 'react-simple-maps' {
    import * as React from 'react'

    export interface ComposableMapProps {
        projection?: string
        projectionConfig?: {
            scale?: number
            center?: [number, number]
            rotate?: [number, number, number]
        }
        width?: number
        height?: number
        style?: React.CSSProperties
        className?: string
        children?: React.ReactNode
    }

    export interface ZoomableGroupProps {
        center?: [number, number]
        zoom?: number
        minZoom?: number
        maxZoom?: number
        translateExtent?: [[number, number], [number, number]]
        onMoveStart?: (event: any) => void
        onMove?: (event: any) => void
        onMoveEnd?: (event: any) => void
        children?: React.ReactNode
    }

    export interface GeographiesProps {
        geography: string | object
        children: (data: { geographies: any[] }) => React.ReactNode
    }

    export interface GeographyProps {
        geography: any
        fill?: string
        stroke?: string
        strokeWidth?: number
        style?: {
            default?: React.CSSProperties
            hover?: React.CSSProperties
            pressed?: React.CSSProperties
        }
        className?: string
        onMouseEnter?: (event: React.MouseEvent) => void
        onMouseLeave?: (event: React.MouseEvent) => void
        onClick?: (event: React.MouseEvent) => void
    }

    export interface MarkerProps {
        coordinates: [number, number]
        children?: React.ReactNode
        style?: React.CSSProperties
        className?: string
        onMouseEnter?: (event: React.MouseEvent) => void
        onMouseLeave?: (event: React.MouseEvent) => void
        onClick?: (event: React.MouseEvent) => void
    }

    export interface LineProps {
        from: [number, number]
        to: [number, number]
        stroke?: string
        strokeWidth?: number
        strokeLinecap?: 'butt' | 'round' | 'square'
    }

    export interface AnnotationProps {
        subject: [number, number]
        dx?: number
        dy?: number
        curve?: number
        connectorProps?: React.SVGProps<SVGPathElement>
        children?: React.ReactNode
    }

    export class ComposableMap extends React.Component<ComposableMapProps> { }
    export class ZoomableGroup extends React.Component<ZoomableGroupProps> { }
    export class Geographies extends React.Component<GeographiesProps> { }
    export class Geography extends React.Component<GeographyProps> { }
    export class Marker extends React.Component<MarkerProps> { }
    export class Line extends React.Component<LineProps> { }
    export class Annotation extends React.Component<AnnotationProps> { }
}
