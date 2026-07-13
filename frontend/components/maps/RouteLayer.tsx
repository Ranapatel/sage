import { useEffect } from 'react'

interface RouteLayerProps {
  map: any
  geometry: {
    type: string
    coordinates: [number, number][]
  } | null
  color?: string
  width?: number
  layerId?: string
  sourceId?: string
}

export default function RouteLayer({
  map,
  geometry,
  color = '#3b82f6',
  width = 5,
  layerId = 'route-layer',
  sourceId = 'route-source',
}: RouteLayerProps) {
  useEffect(() => {
    if (!map) return

    const addLayer = () => {
      try {
        if (!map.style) return
        // Clean up existing layer/source to avoid duplicates
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId)
        }
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId)
        }

        if (geometry) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: geometry,
              properties: {},
            },
          })

          map.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': color,
              'line-width': width,
              'line-opacity': 0.85,
            },
          })
        }
      } catch (err) {
        console.warn('[RouteLayer] Failed to add layer:', err)
      }
    }

    const handleStyleLoad = () => {
      addLayer()
    }

    try {
      if (map.style) {
        if (map.isStyleLoaded()) {
          addLayer()
        } else {
          map.on('style.load', handleStyleLoad)
        }
      }
    } catch (err) {
      console.warn('[RouteLayer] Failed to setup style load listener:', err)
    }

    return () => {
      if (map) {
        try {
          map.off('style.load', handleStyleLoad)
          if (map.style) {
            if (map.getLayer(layerId)) {
              map.removeLayer(layerId)
            }
            if (map.getSource(sourceId)) {
              map.removeSource(sourceId)
            }
          }
        } catch (err) {
          console.warn('[RouteLayer] Cleanup failed (map may already be removed):', err)
        }
      }
    }
  }, [map, geometry, color, width, layerId, sourceId])

  return null
}
