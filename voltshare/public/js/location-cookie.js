/**
 * VoltShare — Temporary Session Location Tracking & Cookie Consent Manager
 * - Persists location & consent temporarily for the duration of the browser session.
 * - Does NOT prompt on page reload (preserves session in sessionStorage & session cookies).
 * - Prompts again when the website/tab is closed and reopened.
 * - Continuously tracks real-time user location when permission is granted.
 */

const VoltLocation = {
  KEYS: {
    CONSENT: 'voltshare_loc_consent',
    LAT: 'voltshare_user_lat',
    LNG: 'voltshare_user_lng',
    ACC: 'voltshare_user_acc',
    CITY: 'voltshare_user_city',
    TIMESTAMP: 'voltshare_loc_timestamp'
  },

  watchId: null,

  // Temporary Session Storage & Cookie Helpers (No expires = Session duration only)
  setSessionValue(name, value) {
    // 1. Session Cookie (cleared by browser on tab/window close)
    document.cookie = `${name}=${encodeURIComponent(value)};path=/;SameSite=Lax`;
    // 2. SessionStorage (guaranteed temporary session persistence across reloads)
    try {
      sessionStorage.setItem(name, String(value));
    } catch (e) {}
  },

  getSessionValue(name) {
    // Check sessionStorage first
    try {
      const sVal = sessionStorage.getItem(name);
      if (sVal !== null && sVal !== undefined) return sVal;
    } catch (e) {}

    // Fallback to cookie
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(cname) === 0) {
        return c.substring(cname.length, c.length);
      }
    }
    return null;
  },

  deleteSessionValue(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;SameSite=Lax`;
    try {
      sessionStorage.removeItem(name);
    } catch (e) {}
  },

  // Consent State
  hasConsent() {
    return this.getSessionValue(this.KEYS.CONSENT) === 'granted';
  },

  isDeclined() {
    return this.getSessionValue(this.KEYS.CONSENT) === 'declined';
  },

  // Get active tracked location
  getLocation() {
    const lat = parseFloat(this.getSessionValue(this.KEYS.LAT));
    const lng = parseFloat(this.getSessionValue(this.KEYS.LNG));
    const acc = parseFloat(this.getSessionValue(this.KEYS.ACC)) || 5;
    const city = this.getSessionValue(this.KEYS.CITY) || 'ludhiana';
    const timestamp = this.getSessionValue(this.KEYS.TIMESTAMP);

    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng, accuracy: acc, city, timestamp, consent: this.hasConsent() };
    }
    // Default Ludhiana coordinates (Sarabha Nagar community hub)
    return { lat: 30.8872, lng: 75.8115, accuracy: 5, city: 'ludhiana', timestamp: null, consent: false };
  },

  // Backward compatible alias
  getLocationCookie() {
    return this.getLocation();
  },

  // Save location to temporary session storage
  saveLocation(lat, lng, city = 'ludhiana', accuracy = 5) {
    this.setSessionValue(this.KEYS.CONSENT, 'granted');
    this.setSessionValue(this.KEYS.LAT, lat.toFixed(6));
    this.setSessionValue(this.KEYS.LNG, lng.toFixed(6));
    this.setSessionValue(this.KEYS.ACC, Math.round(accuracy));
    this.setSessionValue(this.KEYS.CITY, city);
    this.setSessionValue(this.KEYS.TIMESTAMP, new Date().toISOString());

    // Dispatch global event for Leaflet map & navbar listeners
    window.dispatchEvent(new CustomEvent('voltshare:locationUpdated', {
      detail: { lat, lng, city, accuracy: Math.round(accuracy) }
    }));
  },

  // Backward compatible alias
  saveLocationCookies(lat, lng, city = 'ludhiana', accuracy = 5) {
    this.saveLocation(lat, lng, city, accuracy);
  },

  // Active Real-Time Geolocation Tracking with High Precision (under 5m target)
  startTracking() {
    if (!navigator.geolocation) {
      console.warn("Geolocation API not supported by browser");
      return;
    }

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0 // Do not use stale cache: forces live GPS / Wi-Fi trilateration
    };

    // 1. Immediate fresh position fix
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy || 5;
        this.saveLocation(lat, lng, 'ludhiana', acc);
      },
      (err) => {
        console.warn("High-accuracy location fetch note:", err.message);
        if (!this.getSessionValue(this.KEYS.LAT)) {
          this.saveLocation(30.8872, 75.8115, 'ludhiana', 15);
        }
      },
      geoOptions
    );

    // 2. Real-time watchPosition updates as user moves
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy || 5;
        this.saveLocation(lat, lng, 'ludhiana', acc);
      },
      (err) => {
        console.warn("watchPosition update note:", err.message);
      },
      geoOptions
    );
  },

  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  },

  // Consent Actions
  acceptLocationConsent() {
    const banner = document.getElementById('voltCookieBanner');
    if (banner) banner.remove();

    this.startTracking();

    if (typeof showToast === 'function') {
      showToast("Live location tracking active for this session", "📍");
    }
  },

  declineLocationConsent() {
    this.setSessionValue(this.KEYS.CONSENT, 'declined');
    const banner = document.getElementById('voltCookieBanner');
    if (banner) banner.remove();
    if (typeof showToast === 'function') {
      showToast("Location tracking declined for this session", "ℹ️");
    }
  },

  resetLocationCookies() {
    this.stopTracking();
    Object.values(this.KEYS).forEach(k => this.deleteSessionValue(k));
    if (typeof showToast === 'function') {
      showToast("Session location cookies cleared!", "🗑️");
    }
    setTimeout(() => window.location.reload(), 400);
  },

  showLocationManagerModal() {
    const loc = this.getLocation();
    const action = confirm(
      `🍪 VoltShare Session Location Tracking\n\n` +
      `Status: ${this.hasConsent() ? 'Active (Live GPS Tracking)' : 'Default Ludhiana Coordinates'}\n` +
      `Coordinates: ${loc.lat.toFixed(4)}° N, ${loc.lng.toFixed(4)}° E\n` +
      `City: ${loc.city.toUpperCase()}\n` +
      `Storage: Temporary Session (clears when browser tab is closed)\n\n` +
      `Click OK to refresh live GPS position, or Cancel to keep current.`
    );
    if (action) {
      this.acceptLocationConsent();
    }
  },

  // Mount Non-Intrusive Banner ONLY if no session consent yet
  mountCookieBanner() {
    // If user already granted or declined during this browser session, DO NOT PROMPT
    if (this.hasConsent() || this.isDeclined()) return;
    if (document.getElementById('voltCookieBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'voltCookieBanner';
    banner.className = 'fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-white rounded-2xl shadow-googleCard border border-gray-200 p-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200';
    
    banner.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-googleBlue flex items-center justify-center text-xl shrink-0">
          📍
        </div>
        <div class="space-y-1.5 flex-1 text-xs">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-gray-900 font-google">Allow Location Tracking?</h4>
            <span class="text-[10px] text-googleBlue bg-blue-50 font-bold px-2 py-0.5 rounded-full">Session Only</span>
          </div>
          <p class="text-[11px] text-gray-600 leading-relaxed">
            VoltShare tracks your position to center the map on your location and find nearest driveway EV chargers in Ludhiana. Stored temporarily for this visit.
          </p>
          <div class="pt-1.5 flex items-center gap-2">
            <button onclick="VoltLocation.acceptLocationConsent()" class="px-4 py-1.5 bg-googleBlue hover:bg-googleBlueHover text-white text-xs font-bold rounded-full shadow-google transition-all">
              Allow Location
            </button>
            <button onclick="VoltLocation.declineLocationConsent()" class="px-3 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-full transition-colors">
              Not Now
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(banner);
  },

  // Initialize
  init() {
    if (this.hasConsent()) {
      // Permission already active for this session: resume tracking silently without asking!
      this.startTracking();
    } else if (!this.isDeclined()) {
      // First visit of the session: mount banner after brief delay
      setTimeout(() => {
        this.mountCookieBanner();
      }, 700);
    }
  }
};

// Auto-run on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  VoltLocation.init();
});
