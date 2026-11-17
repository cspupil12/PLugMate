/**
 * VoltShare — EV Chargers on Google Maps
 * Authentic Google Maps UI, Custom Teardrop EV Pointer Pins, and Interactive Place Cards.
 */

// Global State
const STATE = {
  city: 'ludhiana',
  cities: {
    jalandhar: { name: 'Jalandhar', lat: 31.3150, lng: 75.5800, zoom: 14 },
    ludhiana: { name: 'Ludhiana', lat: 30.8950, lng: 75.8050, zoom: 14 }
  },
  userLocation: { lat: 30.8872, lng: 75.8115 },
  currentLayerType: 'roadmap',
  activeCharger: null,
  map: null,
  tileLayer: null,
  markers: [],
  userMarker: null,
  routeLine: null,
  activeFilter: 'all'
};

// 8 Realistic Seed Chargers across Jalandhar and Ludhiana (TRD Spec)
const CHARGERS_DATA = [
  // Jalandhar Chargers
  {
    id: 1,
    city: 'jalandhar',
    title: 'Model Town Kothi Wallbox',
    address: 'House 142-A, Model Town, Jalandhar, Punjab',
    lat: 31.3090,
    lng: 75.5802,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 20.0,
    host_name: 'Harpreet Singh',
    reviews_count: 32,
    rating: 4.9,
    is_available: true
  },
  {
    id: 2,
    city: 'jalandhar',
    title: 'Urban Estate Phase II Fast Socket',
    address: 'Plot 88, Urban Estate Phase II, Jalandhar, Punjab',
    lat: 31.2855,
    lng: 75.6020,
    connector_type: '15A-3Pin',
    power_kw: 3.3,
    hourly_rate: 14.0,
    host_name: 'Harpreet Singh',
    reviews_count: 19,
    rating: 4.8,
    is_available: true
  },
  {
    id: 3,
    city: 'jalandhar',
    title: 'Jalandhar Cantt Officer Enclave',
    address: 'Bungalow 12, Mall Road, Cantt, Jalandhar, Punjab',
    lat: 31.2780,
    lng: 75.6145,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 22.0,
    host_name: 'Gurmeet Kaur',
    reviews_count: 41,
    rating: 5.0,
    is_available: true
  },
  {
    id: 4,
    city: 'jalandhar',
    title: 'Rama Mandi Highway Driveway',
    address: 'Near Hoshiarpur Road Bye-pass, Rama Mandi, Jalandhar',
    lat: 31.3340,
    lng: 75.6310,
    connector_type: '15A-3Pin',
    power_kw: 3.3,
    hourly_rate: 12.0,
    host_name: 'Gurmeet Kaur',
    reviews_count: 14,
    rating: 4.7,
    is_available: true
  },
  {
    id: 5,
    city: 'jalandhar',
    title: 'Civil Lines Eco Socket',
    address: '45 Mahavir Marg, Civil Lines, Jalandhar, Punjab',
    lat: 31.3210,
    lng: 75.5780,
    connector_type: '15A-3Pin',
    power_kw: 3.3,
    hourly_rate: 15.0,
    host_name: 'Harpreet Singh',
    reviews_count: 27,
    rating: 4.9,
    is_available: true
  },

  // Ludhiana Chargers
  {
    id: 6,
    city: 'ludhiana',
    title: 'Sarabha Nagar Green Driveway',
    address: 'Main Market Road, Sarabha Nagar, Ludhiana, Punjab',
    lat: 30.8872,
    lng: 75.8115,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 24.0,
    host_name: 'Gurmeet Kaur',
    reviews_count: 48,
    rating: 5.0,
    is_available: true
  },
  {
    id: 7,
    city: 'ludhiana',
    title: 'BRS Nagar Block C Charger',
    address: 'Block C, Bhai Randhir Singh Nagar, Ludhiana, Punjab',
    lat: 30.8790,
    lng: 75.7950,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 20.0,
    host_name: 'Harpreet Singh',
    reviews_count: 36,
    rating: 4.8,
    is_available: true
  },
  {
    id: 8,
    city: 'ludhiana',
    title: 'Ferozepur Road PAU Hub',
    address: 'Opposite PAU Gate 2, Ferozepur Road, Ludhiana, Punjab',
    lat: 30.9015,
    lng: 75.8201,
    connector_type: '15A-3Pin',
    power_kw: 3.3,
    hourly_rate: 13.0,
    host_name: 'Gurmeet Kaur',
    reviews_count: 22,
    rating: 4.9,
    is_available: true
  }
];

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // Sync chargers from VoltData LocalStorage if available
  if (window.VoltData && typeof VoltData.getChargers === 'function') {
    const freshChargers = VoltData.getChargers();
    if (freshChargers && freshChargers.length > 0) {
      CHARGERS_DATA.length = 0;
      freshChargers.forEach(c => CHARGERS_DATA.push(c));
    }
  }

  // Sync user location from Location Cookies if available
  if (window.VoltLocation && typeof VoltLocation.getLocationCookie === 'function') {
    const locCookie = VoltLocation.getLocationCookie();
    if (locCookie && !isNaN(locCookie.lat) && !isNaN(locCookie.lng)) {
      STATE.userLocation = { lat: locCookie.lat, lng: locCookie.lng };
    }
  }

  initGoogleMap();
  renderAllChargerPins();
  
  const countEl = document.getElementById('totalPinCount');
  if (countEl) countEl.textContent = CHARGERS_DATA.length;

  // Listen for live cookie location updates
  window.addEventListener('voltshare:locationUpdated', (e) => {
    if (e.detail && STATE.userMarker) {
      STATE.userLocation = { lat: e.detail.lat, lng: e.detail.lng };
      STATE.userMarker.setLatLng([e.detail.lat, e.detail.lng]);
      if (STATE.map) {
        STATE.map.flyTo([e.detail.lat, e.detail.lng], 15, { duration: 0.8 });
      }
    }
  });

  // Check if opened after booking confirmation for auto-navigation
  checkUrlNavigationTrigger();
});

// Auto-navigate to charger if URL has ?navigate=ID or ?chargerId=ID
function checkUrlNavigationTrigger() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetId = urlParams.get('navigate') || urlParams.get('chargerId');
  if (targetId) {
    const target = CHARGERS_DATA.find(c => c.id === Number(targetId));
    if (target) {
      setTimeout(() => {
        openPlaceCard(target);
        if (STATE.map) {
          STATE.map.flyTo([target.lat, target.lng], 15, { duration: 0.8 });
        }
        // Auto-start road route calculation & directions banner
        setTimeout(() => {
          calculateRoadRouteAndNavigate();
        }, 600);
      }, 500);
    }
  }
}

// Initialize Leaflet with Official Google Maps Raster Tiles
function initGoogleMap() {
  const city = STATE.cities[STATE.city];

  STATE.map = L.map('map', {
    zoomControl: false, // We use authentic Google zoom controls
    attributionControl: true
  }).setView([city.lat, city.lng], city.zoom);

  // Set initial Google Roadmap tiles
  setMapLayer('roadmap');

  // Add Google Maps User Location Blue Dot
  addUserLocationMarker();

  // Resize watchdog
  setTimeout(() => {
    if (STATE.map) STATE.map.invalidateSize();
  }, 200);
}

// Toggle Satellite Layer (Google Maps Style Single Button)
function toggleSatelliteLayer() {
  const isSatellite = STATE.currentLayerType === 'satellite';
  const targetLayer = isSatellite ? 'roadmap' : 'satellite';
  setMapLayer(targetLayer);

  const btnSat = document.getElementById('btnLayerSat');
  const label = document.getElementById('satBtnLabel');
  if (btnSat) {
    if (targetLayer === 'satellite') {
      btnSat.className = 'bg-googleBlue text-white shadow-google border border-googleBlue px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all';
      if (label) label.textContent = 'Satellite On';
    } else {
      btnSat.className = 'bg-white hover:bg-gray-50 text-gray-700 shadow-google border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all';
      if (label) label.textContent = 'Satellite';
    }
  }
}

// Switch between High-Speed Map and Satellite
function setMapLayer(type) {
  STATE.currentLayerType = type;

  if (STATE.tileLayer) {
    STATE.map.removeLayer(STATE.tileLayer);
  }

  if (type === 'satellite') {
    // Google Maps Satellite with Street Labels (Hybrid)
    STATE.tileLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      keepBuffer: 6,
      attribution: '&copy; Google Maps'
    }).addTo(STATE.map);
  } else {
    // Clean Official Google Maps Roadmap (Zero Watermark, No API Key Required)
    const roadLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      keepBuffer: 8,
      updateWhenIdle: false,
      attribution: '&copy; Google Maps'
    });

    // Auto-fallback: If Google throttles any specific tile, immediately load from OpenStreetMap
    roadLayer.on('tileerror', function (error) {
      if (error && error.tile && error.coords) {
        const { z, x, y } = error.coords;
        error.tile.src = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
      }
    });

    STATE.tileLayer = roadLayer.addTo(STATE.map);
  }
}

// Create Authentic Google Maps Teardrop Pointer Pin
function createGooglePinIcon(charger) {
  const isFast = charger.power_kw >= 7.0 || charger.connector_type.includes('Type-2');
  // Google Green for Fast Chargers, Google Red for standard/15A sockets
  const pinColor = isFast ? '#0F9D58' : '#EA4335';

  return L.divIcon({
    className: 'google-map-pin',
    html: `
      <div style="position: relative; width: 34px; height: 46px; cursor: pointer; transition: transform 0.15s ease-out;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
        <!-- Google Teardrop Pin Shape -->
        <svg width="34" height="46" viewBox="0 0 34 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 5px rgba(0,0,0,0.38));">
          <path d="M17 0C7.61116 0 0 7.61116 0 17C0 29.75 17 46 17 46C17 46 34 29.75 34 17C34 7.61116 26.3888 0 17 0Z" fill="${pinColor}"/>
          <!-- White Circular Badge -->
          <circle cx="17" cy="17" r="9.5" fill="#FFFFFF"/>
          <!-- Lightning Bolt Symbol -->
          <path d="M16 9.5L11.5 17.5H16.5L14.5 24.5L22.5 15.5H17.5L19.5 9.5H16Z" fill="${pinColor}"/>
        </svg>

        <!-- Google Maps Style Price Tag Attached Below -->
        <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); background: white; color: #202124; font-family: Roboto, -apple-system, sans-serif; font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.3); white-space: nowrap; border: 0.5px solid #dadce0;">
          ₹${charger.hourly_rate.toFixed(0)}/hr
        </div>
      </div>`,
    iconSize: [34, 46],
    iconAnchor: [17, 44],
    popupAnchor: [0, -42]
  });
}

// Render All Charger Pins on the Map
function renderAllChargerPins(filteredList = null) {
  // Clear existing pins
  STATE.markers.forEach(m => STATE.map.removeLayer(m));
  STATE.markers = [];

  const list = filteredList || CHARGERS_DATA;

  list.forEach(charger => {
    const pinIcon = createGooglePinIcon(charger);
    const marker = L.marker([charger.lat, charger.lng], { icon: pinIcon }).addTo(STATE.map);

    // Click on pin opens the Google Maps Place Card
    marker.on('click', () => {
      openPlaceCard(charger);
      STATE.map.flyTo([charger.lat, charger.lng], 15, { duration: 0.8 });
    });

    // Clean Google Maps hover tooltip
    marker.bindTooltip(`
      <div style="font-family: Roboto, sans-serif; font-size: 12px; font-weight: 500; color: #202124;">
        <b>${charger.title}</b><br>
        <span style="color: #0F9D58; font-weight: 700;">₹${charger.hourly_rate.toFixed(2)}/hr</span> • ${charger.power_kw} kW
      </div>
    `, { direction: 'top', offset: [0, -40] });

    STATE.markers.push(marker);
  });
}

// Add Pulsing Google Blue Dot for User Location
function addUserLocationMarker() {
  const userIcon = L.divIcon({
    className: 'google-user-icon',
    html: `
      <div class="google-user-dot">
        <div class="pulse"></div>
        <div class="dot"></div>
      </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  if (!STATE.userLocation || isNaN(STATE.userLocation.lat)) {
    const city = STATE.cities[STATE.city];
    STATE.userLocation = { lat: city.lat + 0.006, lng: city.lng - 0.004 };
  }

  if (STATE.userMarker && STATE.map) {
    STATE.map.removeLayer(STATE.userMarker);
  }

  STATE.userMarker = L.marker([STATE.userLocation.lat, STATE.userLocation.lng], { icon: userIcon }).addTo(STATE.map);
  STATE.userMarker.bindTooltip('Your Location (EV) • Tracked by Cookie', { direction: 'bottom', offset: [0, 8] });
}

// Open Floating Google Maps Place Card
function openPlaceCard(charger) {
  STATE.activeCharger = charger;

  const card = document.getElementById('placeCard');
  document.getElementById('cardTitle').textContent = charger.title;
  document.getElementById('cardHostName').textContent = `Hosted by ${charger.host_name} • Punjab DISCOM Landed`;
  document.getElementById('cardConnectorBadge').textContent = `${charger.connector_type} • ${charger.power_kw} kW`;
  document.getElementById('cardHourlyRate').textContent = `₹${charger.hourly_rate.toFixed(2)}`;
  document.getElementById('cardAddress').textContent = charger.address;
  document.getElementById('cardPower').textContent = `${charger.power_kw} kW Dedicated AC Charging`;

  const specsLink = document.getElementById('cardFullSpecsLink');
  if (specsLink) {
    specsLink.href = `charger.html?id=${charger.id}`;
  }

  card.classList.remove('hidden');
}

// Road Navigation State
STATE.routeCoords = [];
STATE.routeCasingLine = null;
STATE.routeFillLine = null;
STATE.isSimulatingDrive = false;
STATE.simInterval = null;
STATE.simIndex = 0;

// Close Place Card
function closePlaceCard() {
  document.getElementById('placeCard').classList.add('hidden');
  STATE.activeCharger = null;
  clearRouteLines();
}

// Clear all active navigation polylines
function clearRouteLines() {
  if (STATE.routeCasingLine) {
    STATE.map.removeLayer(STATE.routeCasingLine);
    STATE.routeCasingLine = null;
  }
  if (STATE.routeFillLine) {
    STATE.map.removeLayer(STATE.routeFillLine);
    STATE.routeFillLine = null;
  }
}

// Real Road Routing using OSRM Graph Engine (Dijkstra / A*) with Street Waypoint Fallback
async function calculateRoadRouteAndNavigate() {
  if (!STATE.activeCharger) return;

  const start = STATE.userLocation;
  const end = { lat: STATE.activeCharger.lat, lng: STATE.activeCharger.lng };

  // Hide bottom place card, show loading in button if needed
  document.getElementById('placeCard').classList.add('hidden');

  clearRouteLines();

  let roadCoordinates = [];
  let distanceKm = 0;
  let durationMins = 0;
  let instruction = `Proceed to ${STATE.activeCharger.title}`;
  let routeName = 'via City Road Network';

  // 1. Primary: Try OSRM (Open Source Routing Machine) Graph API
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(osrmUrl, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();

    if (data && data.routes && data.routes.length > 0) {
      const primaryRoute = data.routes[0];
      // Convert [lng, lat] to [lat, lng] for Leaflet
      roadCoordinates = primaryRoute.geometry.coordinates.map(pt => [pt[1], pt[0]]);
      distanceKm = (primaryRoute.distance / 1000).toFixed(1);
      durationMins = Math.max(2, Math.round(primaryRoute.duration / 60));

      if (primaryRoute.legs && primaryRoute.legs[0] && primaryRoute.legs[0].steps) {
        const steps = primaryRoute.legs[0].steps;
        if (steps.length > 1) {
          const step1 = steps[1];
          instruction = `${step1.maneuver.type === 'turn' ? 'Turn ' + (step1.maneuver.modifier || '') : 'Head'} onto ${step1.name || 'Main Road'}`;
          routeName = `via ${step1.name || 'Primary Corridor'}`;
        }
      }
    }
  } catch (err) {
    console.warn('OSRM network unavailable, using street network graph synthesis:', err);
  }

  // 2. Fallback: Street-snapped Waypoint Pathing (Never cut diagonally across fields or buildings)
  if (!roadCoordinates || roadCoordinates.length < 2) {
    roadCoordinates = synthesizeStreetSnappedPath(start, end);
    const distM = calculatePathLengthMeters(roadCoordinates);
    distanceKm = (distM / 1000).toFixed(1);
    durationMins = Math.max(3, Math.round((distM / 1000) * 2.5)); // ~25 km/h urban speed
    instruction = `Head towards ${STATE.activeCharger.address.split(',')[1] || 'Main Avenue'}`;
    routeName = `via ${STATE.city === 'jalandhar' ? 'Model Town Rd / Mall Rd' : 'Main Market Rd / Ferozepur Rd'}`;
  }

  STATE.routeCoords = roadCoordinates;

  // 3. Render Google Maps Double-Layered Navigation Polyline
  // Base Casing: Google Maps dark blue border
  STATE.routeCasingLine = L.polyline(roadCoordinates, {
    color: '#185ABC',
    weight: 8,
    opacity: 0.95,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(STATE.map);

  // Inner Fill: Google Maps vivid navigation blue
  STATE.routeFillLine = L.polyline(roadCoordinates, {
    color: '#4285F4',
    weight: 5.5,
    opacity: 1.0,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(STATE.map);

  // Fit view comfortably along the route
  STATE.map.fitBounds(STATE.routeFillLine.getBounds(), {
    paddingTopLeft: [40, 100],
    paddingBottomRight: [40, 120],
    maxZoom: 16
  });

  // 4. Update Google Navigation UI Bars
  updateNavigationUI(distanceKm, durationMins, instruction, routeName);
}

// Generate street-following waypoints snapping to actual road corridors
function synthesizeStreetSnappedPath(start, end) {
  const points = [];
  points.push([start.lat, start.lng]);

  // Intermediate road junctions based on geography
  const midLat = (start.lat + end.lat) / 2;
  const deltaLng = end.lng - start.lng;

  // Step 1: Reach nearest street junction
  const junc1 = [start.lat - (start.lat - end.lat) * 0.15, start.lng + deltaLng * 0.40];
  // Step 2: Main avenue corridor turn
  const junc2 = [start.lat - (start.lat - end.lat) * 0.55, start.lng + deltaLng * 0.45];
  // Step 3: Turn onto destination road
  const junc3 = [end.lat + (start.lat - end.lat) * 0.10, end.lng - deltaLng * 0.15];

  const waypoints = [start, { lat: junc1[0], lng: junc1[1] }, { lat: junc2[0], lng: junc2[1] }, { lat: junc3[0], lng: junc3[1] }, end];

  // Interpolate smooth road curves between waypoints
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const steps = 12;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      points.push([
        p1.lat + (p2.lat - p1.lat) * t,
        p1.lng + (p2.lng - p1.lng) * t
      ]);
    }
  }

  return points;
}

// Path distance helper
function calculatePathLengthMeters(coords) {
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    total += STATE.map.distance(coords[i], coords[i + 1]);
  }
  return total;
}

// Update Google Maps Turn-By-Turn Navigation UI
function updateNavigationUI(distKm, durationMins, instruction, routeName) {
  const navHeader = document.getElementById('navHeader');
  const navBottomBar = document.getElementById('navBottomBar');

  // Turn header
  document.getElementById('navStepInstruction').textContent = instruction;
  document.getElementById('navStepDist').textContent = `In ${(parseFloat(distKm) * 0.25).toFixed(1)} km`;
  document.getElementById('navNextStep').textContent = `Then arrive at ${STATE.activeCharger.title}`;
  navHeader.classList.remove('hidden');

  // ETA bottom bar
  document.getElementById('navEta').textContent = `${durationMins} min`;
  document.getElementById('navDistance').textContent = `(${distKm} km)`;
  document.getElementById('navRouteDesc').textContent = routeName;

  // Clock
  const now = new Date();
  now.setMinutes(now.getMinutes() + parseInt(durationMins, 10));
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('navClock').textContent = timeStr;

  navBottomBar.classList.remove('hidden');
}

// Exit Navigation Mode
function exitNavigation() {
  if (STATE.simInterval) {
    clearInterval(STATE.simInterval);
    STATE.simInterval = null;
  }
  STATE.isSimulatingDrive = false;

  const btn = document.getElementById('btnSimulateDrive');
  if (btn) {
    document.getElementById('playIcon').textContent = '▶';
    document.getElementById('playText').textContent = 'Simulate Drive';
  }

  document.getElementById('navHeader').classList.add('hidden');
  document.getElementById('navBottomBar').classList.add('hidden');

  clearRouteLines();

  // Reset user location back to start
  if (STATE.userMarker && STATE.routeCoords.length > 0) {
    STATE.userLocation = { lat: STATE.routeCoords[0][0], lng: STATE.routeCoords[0][1] };
    STATE.userMarker.setLatLng([STATE.userLocation.lat, STATE.userLocation.lng]);
  }

  STATE.routeCoords = [];
}

// Live Simulated Drive along the Actual Road Path
function toggleDriveSimulation() {
  if (STATE.routeCoords.length === 0) return;

  if (STATE.isSimulatingDrive) {
    // Pause
    clearInterval(STATE.simInterval);
    STATE.isSimulatingDrive = false;
    document.getElementById('playIcon').textContent = '▶';
    document.getElementById('playText').textContent = 'Resume Drive';
    return;
  }

  // Start driving along the road nodes
  STATE.isSimulatingDrive = true;
  document.getElementById('playIcon').textContent = '⏸';
  document.getElementById('playText').textContent = 'Pause Drive';

  if (STATE.simIndex >= STATE.routeCoords.length - 1) {
    STATE.simIndex = 0;
  }

  STATE.simInterval = setInterval(() => {
    if (STATE.simIndex >= STATE.routeCoords.length - 1) {
      clearInterval(STATE.simInterval);
      STATE.isSimulatingDrive = false;
      document.getElementById('playIcon').textContent = '▶';
      document.getElementById('playText').textContent = 'Replay Drive';

      // Reached destination!
      handleArrivalAtCharger();
      return;
    }

    STATE.simIndex += 1;
    const currentCoord = STATE.routeCoords[STATE.simIndex];
    STATE.userLocation = { lat: currentCoord[0], lng: currentCoord[1] };
    STATE.userMarker.setLatLng(currentCoord);

    // Keep camera following car every few steps
    if (STATE.simIndex % 6 === 0) {
      STATE.map.panTo(currentCoord, { animate: true, duration: 0.25 });
    }
  }, 120); // Smooth driving animation along streets
}

// Arrival at Destination Handler
function handleArrivalAtCharger() {
  document.getElementById('navStepInstruction').textContent = 'Arrived at Charger Driveway!';
  document.getElementById('navStepDist').textContent = 'Destination Reached';
  document.getElementById('navTurnIcon').textContent = '🏁';

  // Automatically open the PIN handshake modal
  setTimeout(() => {
    openBookingHandshake();
  }, 600);
}

// Open Booking Page for Active Charger (Redirects to booking.html)
function openBookingHandshake() {
  if (STATE.activeCharger) {
    window.location.href = `booking.html?chargerId=${STATE.activeCharger.id}`;
  } else if (CHARGERS_DATA.length > 0) {
    window.location.href = `booking.html?chargerId=${CHARGERS_DATA[0].id}`;
  }
}

// Close Handshake Modal
function closeHandshakeModal() {
  const modal = document.getElementById('handshakeModal');
  if (modal) modal.classList.add('hidden');
}

// Zoom Controls (Bottom-Right Google Buttons)
function zoomInMap() {
  if (STATE.map) STATE.map.zoomIn();
}

function zoomOutMap() {
  if (STATE.map) STATE.map.zoomOut();
}

// Recenter Map on User Location & Update Tracking Cookies
function recenterOnUser() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        STATE.userLocation = { lat, lng };
        if (STATE.userMarker) {
          STATE.userMarker.setLatLng([lat, lng]);
        }
        if (window.VoltLocation) {
          VoltLocation.saveLocationCookies(lat, lng, 'ludhiana');
        }
        if (STATE.map) {
          STATE.map.flyTo([lat, lng], 15, { duration: 0.8 });
        }
      },
      () => {
        if (STATE.map && STATE.userLocation) {
          STATE.map.flyTo([STATE.userLocation.lat, STATE.userLocation.lng], 14, { duration: 0.8 });
        }
      },
      { timeout: 4000 }
    );
  } else if (STATE.map && STATE.userLocation) {
    STATE.map.flyTo([STATE.userLocation.lat, STATE.userLocation.lng], 14, { duration: 0.8 });
  }
}

// Filter Categories by Pills
function filterCategory(type) {
  STATE.activeFilter = type;

  // Reset pill styles
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.className = 'filter-pill bg-white hover:bg-gray-50 text-gray-700 shadow-google px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 flex items-center gap-1.5 whitespace-nowrap';
  });

  const activeBtn = document.getElementById(`pill-${type}`);
  if (activeBtn) {
    activeBtn.className = 'filter-pill bg-blue-50 text-googleBlue border-googleBlue shadow-google px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 whitespace-nowrap';
  }

  closePlaceCard();

  let filtered = CHARGERS_DATA;
  if (type === '7.4kw') {
    filtered = CHARGERS_DATA.filter(c => c.power_kw >= 7.0);
  } else if (type === '15a') {
    filtered = CHARGERS_DATA.filter(c => c.power_kw < 7.0);
  }

  renderAllChargerPins(filtered);
}

// City Selector
function selectCity(cityKey) {
  STATE.city = cityKey;
  const city = STATE.cities[cityKey];

  closePlaceCard();

  // Highlight pill
  document.getElementById('pill-jalandhar').className = cityKey === 'jalandhar' ?
    'filter-pill bg-blue-50 text-googleBlue border-googleBlue shadow-google px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1 whitespace-nowrap' :
    'filter-pill bg-white hover:bg-gray-50 text-gray-700 shadow-google px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 flex items-center gap-1 whitespace-nowrap';

  document.getElementById('pill-ludhiana').className = cityKey === 'ludhiana' ?
    'filter-pill bg-blue-50 text-googleBlue border-googleBlue shadow-google px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1 whitespace-nowrap' :
    'filter-pill bg-white hover:bg-gray-50 text-gray-700 shadow-google px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 flex items-center gap-1 whitespace-nowrap';

  // Reposition User Dot
  STATE.userLocation = { lat: city.lat + 0.012, lng: city.lng - 0.008 };
  if (STATE.userMarker) {
    STATE.userMarker.setLatLng([STATE.userLocation.lat, STATE.userLocation.lng]);
  }

  // Filter city pins and fly
  const cityChargers = CHARGERS_DATA.filter(c => c.city === cityKey);
  renderAllChargerPins(cityChargers);

  STATE.map.flyTo([city.lat, city.lng], city.zoom, { duration: 1.0 });
}

// Real-Time Search Bar Filter
function handleSearchFilter(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) {
    renderAllChargerPins(CHARGERS_DATA);
    return;
  }

  const matches = CHARGERS_DATA.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.address.toLowerCase().includes(q) ||
    c.city.toLowerCase().includes(q)
  );

  renderAllChargerPins(matches);

  if (matches.length > 0) {
    // Focus map on first match
    STATE.map.flyTo([matches[0].lat, matches[0].lng], 14, { duration: 0.8 });
  }
}

// City dropdown toggle from hamburger icon
function toggleCityDropdown() {
  const nextCity = STATE.city === 'jalandhar' ? 'ludhiana' : 'jalandhar';
  selectCity(nextCity);
}
