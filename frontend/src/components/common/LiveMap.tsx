// components/common/LiveMap.tsx
import React, { useEffect, useRef, useState } from "react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Fix for default markers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LiveMapProps {
  technicianLocation: {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp: Date;
  } | null;
  userLocation: {
    lat: number;
    lng: number;
    street?: string;
    city?: string;
    label?: string;
  };
  isTracking: boolean;
  locationHistory?: {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp: Date;
  }[];
  interactive?: boolean; // Add this prop to control interactivity
}

const LiveMap: React.FC<LiveMapProps> = ({
  technicianLocation,
  userLocation,
  isTracking,
  locationHistory = [],
  interactive = false // Default to non-interactive
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const routingControl = useRef<L.Routing.Control | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Custom icons
  const userLocationIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(
      `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#10B981" fill-opacity="0.2"/>
        <circle cx="16" cy="16" r="8" fill="#10B981"/>
        <circle cx="16" cy="16" r="4" fill="white"/>
      </svg>`
    ),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const technicianIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(
      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="#3B82F6"/>
        <circle cx="12" cy="12" r="6" fill="white"/>
      </svg>`
    ),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    console.log('Initializing map with user location:', userLocation);

    try {
      // Create map with disabled interactions
      const map = L.map(mapRef.current, {
        // Disable all interactions
        dragging: interactive, // Only allow dragging if interactive is true
        touchZoom: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive,
        zoomControl: interactive, // Show zoom controls only if interactive
        
        // Additional options for better static view
        closePopupOnClick: false,
        bounceAtZoomLimits: false
      }).setView([userLocation.lat, userLocation.lng], 13);
      
      // Add tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add USER location marker - make it non-draggable
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userLocationIcon,
        draggable: false // Prevent marker dragging
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-weight: 600; font-size: 0.875rem;">
            <div>🏠 Your Location</div>
            ${userLocation.street ? `<div style="color: #6b7280;">${userLocation.street}</div>` : ''}
            ${userLocation.city ? `<div style="color: #6b7280;">${userLocation.city}</div>` : ''}
            ${userLocation.label ? `<div style="color: #6b7280;">${userLocation.label}</div>` : ''}
          </div>
        `);

      // Disable popup closing on map click
      userMarker.on('popupopen', () => {
        map.dragging.disable();
      });

      userMarker.on('popupclose', () => {
        if (interactive) {
          map.dragging.enable();
        }
      });

      mapInstance.current = map;
      setMapLoaded(true);

      // Force resize
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (routingControl.current) {
        routingControl.current.remove();
        routingControl.current = null;
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [userLocation, interactive]);

  // Update map with technician location and route
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded) return;

    const map = mapInstance.current;

    // Clear existing technician markers and routing
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const latLng = layer.getLatLng();
        // Keep only the user location marker (remove technician markers)
        if (Math.abs(latLng.lat - userLocation.lat) > 0.001 || 
            Math.abs(latLng.lng - userLocation.lng) > 0.001) {
          map.removeLayer(layer);
        }
      }
    });

    // Remove existing routing control
    if (routingControl.current) {
      routingControl.current.remove();
      routingControl.current = null;
    }

    // Add technician marker and route if available
    if (technicianLocation && isTracking) {
      console.log('Adding technician marker and real route');

      // Add TECHNICIAN marker - make it non-draggable
      const technicianMarker = L.marker([technicianLocation.lat, technicianLocation.lng], {
        icon: technicianIcon,
        draggable: false // Prevent marker dragging
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-weight: 600; font-size: 0.875rem;">
            <div>👨‍🔧 Technician</div>
            <div style="color: #6b7280;">Live location</div>
            <div style="color: #9ca3af; font-size: 0.75rem;">
              ${technicianLocation.timestamp.toLocaleTimeString()}
            </div>
          </div>
        `);

      // Disable popup interactions for technician marker too
      technicianMarker.on('popupopen', () => {
        map.dragging.disable();
      });

      technicianMarker.on('popupclose', () => {
        if (interactive) {
          map.dragging.enable();
        }
      });

      // Add real road route using OpenRouteService
      try {
        routingControl.current = L.Routing.control({
          waypoints: [
            L.latLng(technicianLocation.lat, technicianLocation.lng),
            L.latLng(userLocation.lat, userLocation.lng)
          ],
          routeWhileDragging: false,
          showAlternatives: false,
          fitSelectedRoutes: true,
          show: false, // Hide default instructions
          // Disable route editing
          addWaypoints: false,
          lineOptions: {
            styles: [
              {
                color: '#EF4444',
                weight: 6,
                opacity: 0.8,
                dashArray: '8, 8'
              }
            ],
            extendToWaypoints: false,
            missingRouteTolerance: 10
          },
          router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving'
          })
        }).addTo(map);

        // Disable routing control interactions
        if (routingControl.current) {
          const container = routingControl.current.getContainer();
          if (container) {
            container.style.pointerEvents = 'none'; // Disable clicks on routing control
          }
        }

        // Customize the route line
        routingControl.current.on('routesfound', (e) => {
          const routes = e.routes;
          const summary = routes[0].summary;
          
          console.log('Route found:', {
            totalDistance: (summary.totalDistance / 1000).toFixed(1) + ' km',
            totalTime: (summary.totalTime / 60).toFixed(1) + ' min'
          });

          // Update the route popup with real info
          const routeLine = e.routes[0].coordinates;
          if (routeLine && routeLine.length > 0) {
            L.polyline(routeLine, {
              color: '#EF4444',
              weight: 6,
              opacity: 0.8,
              dashArray: '8, 8',
              interactive: false // Make the route line non-interactive
            }).bindPopup(`
              <div style="font-weight: 600; font-size: 0.875rem;">
                <div>🛣️ Real Route to Your Location</div>
                <div style="color: #6b7280; font-size: 0.75rem;">
                  Distance: ${(summary.totalDistance / 1000).toFixed(1)} km<br>
                  Estimated time: ${(summary.totalTime / 60).toFixed(1)} min
                </div>
              </div>
            `).addTo(map);
          }
        });

      } catch (error) {
        console.error('Error creating route:', error);
        // Fallback to straight line if routing fails
        const routePoints = [
          [technicianLocation.lat, technicianLocation.lng] as [number, number],
          [userLocation.lat, userLocation.lng] as [number, number]
        ];
        
        L.polyline(routePoints, {
          color: '#EF4444',
          weight: 5,
          opacity: 0.7,
          dashArray: '10, 10',
          lineCap: 'round',
          interactive: false // Make the fallback route non-interactive too
        }).addTo(map);
      }

      // Add location history trail if available
      if (locationHistory.length > 1) {
        const historyPoints = locationHistory.map(loc => [loc.lat, loc.lng] as [number, number]);
        L.polyline(historyPoints, {
          color: '#3B82F6',
          weight: 3,
          opacity: 0.5,
          interactive: false // Make history trail non-interactive
        }).addTo(map);
      }

      // Fit bounds to show both technician and user locations
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        [technicianLocation.lat, technicianLocation.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [mapLoaded, technicianLocation, isTracking, locationHistory, userLocation, interactive]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg border border-gray-200"
        style={{
          cursor: interactive ? 'grab' : 'default' // Change cursor based on interactivity
        }}
      />
      
      {/* Non-interactive overlay when map is not interactive */}
      {!interactive && (
        <div 
          className="absolute inset-0 bg-transparent z-10"
          style={{ pointerEvents: 'none' }}
        />
      )}
      
      {/* Live Tracking Badge */}
      {isTracking && technicianLocation && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2 border z-20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700">
              Technician En Route
            </span>
          </div>
          {technicianLocation && (
            <div className="text-xs text-gray-500 mt-1">
              {getDistanceFromTechnician(technicianLocation, userLocation)} away
            </div>
          )}
        </div>
      )}

      {/* Map Attribution */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded text-xs px-2 py-1 border z-20">
        © OpenStreetMap contributors
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-2 bg-white bg-opacity-90 rounded text-xs px-2 py-1 border z-20">
        <div className="flex items-center gap-1 mb-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Your Location</span>
        </div>
        <div className="flex items-center gap-1 mb-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Technician</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-1 bg-red-500 rounded"></div>
          <span>Route</span>
        </div>
      </div>

      {/* Interactive Mode Indicator */}
      {interactive && (
        <div className="absolute top-4 right-32 bg-yellow-100 border border-yellow-300 rounded text-xs px-2 py-1 z-20">
          🎯 Interactive Mode
        </div>
      )}
    </div>
  );
};

// Helper function to calculate distance
const getDistanceFromTechnician = (
  technicianLocation: { lat: number; lng: number },
  userLocation: { lat: number; lng: number }
): string => {
  const R = 6371; // Earth's radius in km
  const dLat = ((userLocation.lat - technicianLocation.lat) * Math.PI) / 180;
  const dLon = ((userLocation.lng - technicianLocation.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((technicianLocation.lat * Math.PI) / 180) *
      Math.cos((userLocation.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  if (distance < 1) {
    return `${Math.round(distance * 1000)} meters`;
  } else {
    return `${distance.toFixed(1)} km`;
  }
};

export default LiveMap;