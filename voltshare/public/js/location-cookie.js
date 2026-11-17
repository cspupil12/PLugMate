/**
 * VoltShare — Location Tracking & Cookie Consent Manager
 * Handles HTTP/document cookies for user location tracking, proximity calculations,
 * and user consent persistence across sessions.
 */

const VoltLocation = {
  COOKIE_NAMES: {
    CONSENT: 'voltshare_loc_consent',
    LAT: 'voltshare_user_lat',
    LNG: 'voltshare_user_lng',
    CITY: 'voltshare_user_city',
    TIMESTAMP: 'voltshare_loc_timestamp'
  },

  // Cookie Helpers
  setCookie(name, value, days = 30) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
  },

  getCookie(name) {
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

  deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;SameSite=Lax`;
  },

  // Location Cookie State
  hasConsent() {
    return this.getCookie(this.COOKIE_NAMES.CONSENT) === 'granted';
  },

  isDeclined() {
    return this.getCookie(this.COOKIE_NAMES.CONSENT) === 'declined';
  },

  getLocationCookie() {
    const lat = parseFloat(this.getCookie(this.COOKIE_NAMES.LAT));
    const lng = parseFloat(this.getCookie(this.COOKIE_NAMES.LNG));
    const city = this.getCookie(this.COOKIE_NAMES.CITY) || 'ludhiana';
    const timestamp = this.getCookie(this.COOKIE_NAMES.TIMESTAMP);

    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng, city, timestamp, consent: true };
    }
    // Default Ludhiana coordinates if not yet set
    return { lat: 30.8950, lng: 75.8050, city: 'ludhiana', timestamp: null, consent: false };
  },

  saveLocationCookies(lat, lng, city = 'ludhiana') {
    this.setCookie(this.COOKIE_NAMES.CONSENT, 'granted', 30);
    this.setCookie(this.COOKIE_NAMES.LAT, lat.toFixed(5), 30);
    this.setCookie(this.COOKIE_NAMES.LNG, lng.toFixed(5), 30);
    this.setCookie(this.COOKIE_NAMES.CITY, city, 30);
    this.setCookie(this.COOKIE_NAMES.TIMESTAMP, new Date().toISOString(), 30);

    // Dispatch global event for map listener
    window.dispatchEvent(new CustomEvent('voltshare:locationUpdated', {
      detail: { lat, lng, city }
    }));
  },

  showLocationManagerModal() {
    const loc = this.getLocationCookie();
    const action = confirm(
      `🍪 VoltShare Location Tracking Cookie\n\n` +
      `Status: ${this.hasConsent() ? 'Active (GPS Tracking Granted)' : 'Default Ludhiana Coordinates'}\n` +
      `Coordinates: ${loc.lat.toFixed(4)}° N, ${loc.lng.toFixed(4)}° E\n` +
      `City: ${loc.city.toUpperCase()}\n` +
      `Last Updated: ${loc.timestamp ? new Date(loc.timestamp).toLocaleTimeString() : 'Initial Session'}\n\n` +
      `Click OK to refresh live device GPS location into cookie, or Cancel to keep.`
    );
    if (action) {
      this.acceptLocationConsent();
    }
  },

  // Consent Actions
  acceptLocationConsent() {
    const banner = document.getElementById('voltCookieBanner');
    if (banner) banner.remove();

    // Try HTML5 Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          this.saveLocationCookies(lat, lng, 'ludhiana');
          if (typeof showToast === 'function') {
            showToast(`Location cookies saved (${lat.toFixed(3)}° N, ${lng.toFixed(3)}° E)`, "🍪");
          }
        },
        (err) => {
          console.warn("Geolocation denied or unavailable, using Ludhiana community default:", err);
          // Default to Sarabha Nagar, Ludhiana
          this.saveLocationCookies(30.8872, 75.8115, 'ludhiana');
          if (typeof showToast === 'function') {
            showToast("Location cookie saved for Ludhiana neighborhood", "🍪");
          }
        },
        { timeout: 5000 }
      );
    } else {
      this.saveLocationCookies(30.8872, 75.8115, 'ludhiana');
      if (typeof showToast === 'function') {
        showToast("Location cookie saved for Ludhiana neighborhood", "🍪");
      }
    }
  },

  declineLocationConsent() {
    this.setCookie(this.COOKIE_NAMES.CONSENT, 'declined', 7);
    const banner = document.getElementById('voltCookieBanner');
    if (banner) banner.remove();
    if (typeof showToast === 'function') {
      showToast("Location cookies declined. Using city center.", "ℹ️");
    }
  },

  resetLocationCookies() {
    Object.values(this.COOKIE_NAMES).forEach(c => this.deleteCookie(c));
    if (typeof showToast === 'function') {
      showToast("Location tracking cookies cleared!", "🗑️");
    }
    setTimeout(() => window.location.reload(), 400);
  },

  // Inject Non-Intrusive Cookie Consent Banner
  mountCookieBanner() {
    // If user already granted or declined, don't show prompt
    if (this.hasConsent() || this.isDeclined()) return;
    if (document.getElementById('voltCookieBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'voltCookieBanner';
    banner.className = 'fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-white rounded-2xl shadow-googleCard border border-gray-200 p-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200';
    
    banner.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-googleBlue flex items-center justify-center text-xl shrink-0">
          🍪
        </div>
        <div class="space-y-1.5 flex-1 text-xs">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-gray-900 font-google">Location Tracking Cookies</h4>
            <span class="text-[10px] text-googleBlue bg-blue-50 font-bold px-2 py-0.5 rounded-full">Ludhiana EV Grid</span>
          </div>
          <p class="text-[11px] text-gray-600 leading-relaxed">
            VoltShare stores cookies to track your proximity to nearby community chargers in Ludhiana and calculate walking distances from your driveway.
          </p>
          <div class="pt-1.5 flex items-center gap-2">
            <button onclick="VoltLocation.acceptLocationConsent()" class="px-4 py-1.5 bg-googleBlue hover:bg-googleBlueHover text-white text-xs font-bold rounded-full shadow-google transition-all">
              Allow Location Cookies
            </button>
            <button onclick="VoltLocation.declineLocationConsent()" class="px-3 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-full transition-colors">
              Decline
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(banner);
  }
};

// Auto-run banner check when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    VoltLocation.mountCookieBanner();
  }, 800);
});
