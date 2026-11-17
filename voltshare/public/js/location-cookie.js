/**
 * PlugMate — Temporary Session Location Tracking & Cookie Consent Manager
 * - Persists location & consent temporarily for the duration of the browser session.
 * - Does NOT prompt on page reload (preserves session in sessionStorage & session cookies).
 * - Prompts again when the website/tab is closed and reopened.
 * - Continuously tracks real-time user location when permission is granted.
 */

const VoltLocation = {
  KEYS: {
    CONSENT: 'plugmate_loc_consent',
    LAT: 'plugmate_user_lat',
    LNG: 'plugmate_user_lng',
    ACC: 'plugmate_user_acc',
    CITY: 'plugmate_user_city',
    TIMESTAMP: 'plugmate_loc_timestamp'
  },

  watchId: null,

  // Temporary Session Storage & Cookie Helpers
  setSessionValue(name, value) {
    document.cookie = `${name}=${encodeURIComponent(value)};path=/;SameSite=Lax`;
    try {
      sessionStorage.setItem(name, String(value));
    } catch (e) {}
  },

  getSessionValue(name) {
    try {
      const sVal = sessionStorage.getItem(name);
      if (sVal !== null && sVal !== undefined) return sVal;
    } catch (e) {}

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
    return this.getSessionValue(this.KEYS.CONSENT) === 'granted' ||
           this.getSessionValue('voltshare_loc_consent') === 'granted';
  },

  isDeclined() {
    return this.getSessionValue(this.KEYS.CONSENT) === 'declined' ||
           this.getSessionValue('voltshare_loc_consent') === 'declined';
  },

  // Get active tracked location
  getLocation() {
    const lat = parseFloat(this.getSessionValue(this.KEYS.LAT) || this.getSessionValue('voltshare_user_lat'));
    const lng = parseFloat(this.getSessionValue(this.KEYS.LNG) || this.getSessionValue('voltshare_user_lng'));
    const acc = parseFloat(this.getSessionValue(this.KEYS.ACC) || this.getSessionValue('voltshare_user_acc')) || 5;
    const city = this.getSessionValue(this.KEYS.CITY) || 'community';
    const timestamp = this.getSessionValue(this.KEYS.TIMESTAMP);

    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng, accuracy: acc, city, timestamp, consent: this.hasConsent() };
    }
    // Default community anchor coordinates
    return { lat: 30.8872, lng: 75.8115, accuracy: 5, city: 'community', timestamp: null, consent: false };
  },

  getLocationCookie() {
    return this.getLocation();
  },

  // Save location to temporary session storage
  saveLocation(lat, lng, city = 'community', accuracy = 5) {
    this.setSessionValue(this.KEYS.CONSENT, 'granted');
    this.setSessionValue(this.KEYS.LAT, lat.toFixed(6));
    this.setSessionValue(this.KEYS.LNG, lng.toFixed(6));
    this.setSessionValue(this.KEYS.ACC, Math.round(accuracy));
    this.setSessionValue(this.KEYS.CITY, city);
    this.setSessionValue(this.KEYS.TIMESTAMP, new Date().toISOString());

    // Legacy sync
    this.setSessionValue('voltshare_loc_consent', 'granted');
    this.setSessionValue('voltshare_user_lat', lat.toFixed(6));
    this.setSessionValue('voltshare_user_lng', lng.toFixed(6));

    // Dispatch global events
    const detail = { lat, lng, city, accuracy: Math.round(accuracy) };
    window.dispatchEvent(new CustomEvent('plugmate:locationUpdated', { detail }));
    window.dispatchEvent(new CustomEvent('voltshare:locationUpdated', { detail }));
  },

  saveLocationCookies(lat, lng, city = 'community', accuracy = 5) {
    this.saveLocation(lat, lng, city, accuracy);
  },

  // Active Real-Time Geolocation Tracking
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
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy || 5;
        this.saveLocation(lat, lng, 'community', acc);
      },
      (err) => {
        console.warn("High-accuracy location note:", err.message);
        if (!this.getSessionValue(this.KEYS.LAT)) {
          this.saveLocation(30.8872, 75.8115, 'community', 15);
        }
      },
      geoOptions
    );

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy || 5;
        this.saveLocation(lat, lng, 'community', acc);
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
    this.setSessionValue('voltshare_loc_consent', 'declined');
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
      showToast("Session location cookies cleared", "🗑️");
    }
    setTimeout(() => window.location.reload(), 400);
  },

  showLocationManagerModal() {
    const loc = this.getLocation();
    const action = confirm(
      `PlugMate Session Location Tracking\n\n` +
      `Status: ${this.hasConsent() ? 'Active (Live GPS Tracking)' : 'Default Neighborhood Coordinates'}\n` +
      `Coordinates: ${loc.lat.toFixed(4)}° N, ${loc.lng.toFixed(4)}° E\n` +
      `Storage: Temporary Session (clears when browser tab is closed)\n\n` +
      `Click OK to refresh live GPS position, or Cancel to keep current.`
    );
    if (action) {
      this.acceptLocationConsent();
    }
  },

  mountCookieBanner() {
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
            PlugMate uses your position to center the map on your location and find the nearest community driveway EV chargers. Stored temporarily for this visit only.
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

  init() {
    if (this.hasConsent()) {
      this.startTracking();
    } else if (!this.isDeclined()) {
      setTimeout(() => {
        this.mountCookieBanner();
      }, 700);
    }
  }
};

window.PlugMateLocation = VoltLocation;
window.VoltLocation = VoltLocation;

document.addEventListener('DOMContentLoaded', () => {
  VoltLocation.init();
});
