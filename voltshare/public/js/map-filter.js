/**
 * VoltShare Map Filter Bar & Prototype Navigation Bridge
 * Injects non-intrusive filter controls and page links into index.html
 * ZERO modifications to index.html markup required.
 */

(function () {
  // Ensure VoltData and VoltLocation are loaded
  function ensureVoltData(callback) {
    if (!window.VoltLocation && !document.querySelector('script[src*="location-cookie.js"]')) {
      const locScript = document.createElement('script');
      locScript.src = 'js/location-cookie.js';
      document.head.appendChild(locScript);
    }

    if (window.VoltData) {
      callback();
    } else {
      const script = document.createElement('script');
      script.src = 'js/data.js';
      script.onload = callback;
      document.head.appendChild(script);
    }
  }

  // Filter State
  const FILTER_STATE = {
    connector: 'all',
    maxPrice: 40,
    availableOnly: false
  };

  function initMapFilterBridge() {
    // 1. Sync all community chargers into the map's CHARGERS_DATA
    if (window.VoltData && window.CHARGERS_DATA) {
      const storedChargers = VoltData.getChargers();
      if (storedChargers && storedChargers.length > 0) {
        // Replace in-memory list with complete 15-charger dataset
        CHARGERS_DATA.length = 0;
        storedChargers.forEach(c => CHARGERS_DATA.push(c));

        // Update pin counter in index.html header
        const totalCountEl = document.getElementById('totalPinCount');
        if (totalCountEl) totalCountEl.textContent = CHARGERS_DATA.length;

        // Re-render pins with all 15 chargers
        if (typeof renderAllChargerPins === 'function') {
          renderAllChargerPins(CHARGERS_DATA);
        }
      }
    }

    // 2. Inject Secondary Navigation Bar (Top-Right)
    injectMapNavShortcuts();

    // 3. Inject Floating Filter Bar (Below search header)
    injectFilterToolbar();

    // 4. Enhance Place Card with "View Full Details & Book" CTA
    enhancePlaceCard();

    // 5. Sync Map User Location from Location Cookie
    syncMapFromLocationCookie();
  }

  function syncMapFromLocationCookie() {
    if (window.VoltLocation) {
      const loc = VoltLocation.getLocationCookie();
      if (loc && loc.consent && window.STATE) {
        STATE.userLocation = { lat: loc.lat, lng: loc.lng };
        if (STATE.userMarker) {
          STATE.userMarker.setLatLng([loc.lat, loc.lng]);
        }
      }
    }

    window.addEventListener('voltshare:locationUpdated', (e) => {
      if (window.STATE && e.detail) {
        STATE.userLocation = { lat: e.detail.lat, lng: e.detail.lng };
        if (STATE.userMarker) {
          STATE.userMarker.setLatLng([e.detail.lat, e.detail.lng]);
        }
        if (STATE.map) {
          STATE.map.flyTo([e.detail.lat, e.detail.lng], 15, { duration: 1.0 });
        }
      }
    });
  }

  // Inject top-right navigation pills (My Bookings, Host Dashboard, Profile)
  function injectMapNavShortcuts() {
    const topBar = document.querySelector('.absolute.top-3.right-3');
    if (!topBar || document.getElementById('voltMapNavPillGroup') || topBar.querySelector('a[href="my-bookings.html"]')) return;

    const currentUser = (window.VoltData && typeof VoltData.getCurrentUser === 'function')
      ? VoltData.getCurrentUser()
      : null;

    const navGroup = document.createElement('div');
    navGroup.id = 'voltMapNavPillGroup';
    navGroup.className = 'flex items-center gap-1.5';
    navGroup.innerHTML = `
      <a href="my-bookings.html" class="bg-white hover:bg-gray-50 text-gray-800 rounded-lg shadow-google border border-gray-200 px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all">
        <span>📅</span>
        <span class="hidden sm:inline">My Bookings</span>
      </a>

      <a href="host-dashboard.html" class="bg-white hover:bg-gray-50 text-emerald-700 rounded-lg shadow-google border border-emerald-200 px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all">
        <span>⚡</span>
        <span class="hidden sm:inline">Host Mode</span>
      </a>

      <a href="https://clerk.jaspreet.dpdns.org/sign-in" onclick="this.href='https://clerk.jaspreet.dpdns.org/sign-in?redirect_url=' + encodeURIComponent(window.location.href)" class="bg-blue-50 hover:bg-blue-100 text-googleBlue rounded-lg shadow-google border border-blue-200 px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition-all" title="User Account">
        <span>👤</span>
        <span class="hidden md:inline">${currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}</span>
      </a>
    `;

    topBar.insertBefore(navGroup, topBar.firstChild);
  }

  // Inject Advanced Filter Toolbar
  function injectFilterToolbar() {
    const header = document.querySelector('header.absolute.top-3.left-3');
    if (!header || document.getElementById('voltFilterToolbar')) return;

    const toolbar = document.createElement('div');
    toolbar.id = 'voltFilterToolbar';
    toolbar.className = 'pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-google border border-gray-200 p-2.5 max-w-[calc(100vw-24px)] sm:w-[390px] flex flex-col gap-2 transition-all text-xs';

    toolbar.innerHTML = `
      <div class="flex items-center justify-between pb-1.5 border-b border-gray-100">
        <span class="font-bold text-gray-800 flex items-center gap-1.5">
          <span>🔍</span> Filter Chargers
        </span>
        <button id="btnResetFilters" class="text-[11px] text-googleBlue font-medium hover:underline">
          Reset
        </button>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <!-- Connector Selector -->
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Plug Type</label>
          <select id="filterConnectorSelect" class="w-full text-xs py-1 px-2 border border-gray-300 rounded-lg focus:outline-none focus:border-googleBlue bg-white">
            <option value="all">All Connectors</option>
            <option value="Type-2 AC">Type-2 AC (7.4kW+)</option>
            <option value="15A-3Pin">15A Socket (3.3kW)</option>
            <option value="CCS-2 DC">CCS-2 Rapid DC</option>
          </select>
        </div>

        <!-- Available Now Checkbox -->
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Status</label>
          <label class="flex items-center gap-1.5 py-1 px-1.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="checkbox" id="filterAvailableCheckbox" class="rounded text-googleBlue focus:ring-0">
            <span class="text-xs font-semibold text-gray-700">Available Now</span>
          </label>
        </div>
      </div>

      <!-- Max Price Slider -->
      <div class="pt-1">
        <div class="flex items-center justify-between text-[11px] mb-0.5">
          <span class="text-gray-500">Max Hourly Price:</span>
          <span class="font-mono font-bold text-emerald-600" id="filterPriceLabel">Up to ₹40/hr</span>
        </div>
        <input type="range" id="filterPriceRange" min="10" max="40" step="2" value="40" class="w-full accent-googleBlue cursor-pointer">
      </div>
    `;

    header.appendChild(toolbar);

    // Attach Event Listeners
    document.getElementById('filterConnectorSelect').addEventListener('change', applyFilters);
    document.getElementById('filterAvailableCheckbox').addEventListener('change', applyFilters);
    document.getElementById('filterPriceRange').addEventListener('input', (e) => {
      document.getElementById('filterPriceLabel').textContent = `Up to ₹${e.target.value}/hr`;
      applyFilters();
    });
    document.getElementById('btnResetFilters').addEventListener('click', resetFilters);
  }

  function applyFilters() {
    const connector = document.getElementById('filterConnectorSelect').value;
    const availableOnly = document.getElementById('filterAvailableCheckbox').checked;
    const maxPrice = parseFloat(document.getElementById('filterPriceRange').value);

    FILTER_STATE.connector = connector;
    FILTER_STATE.availableOnly = availableOnly;
    FILTER_STATE.maxPrice = maxPrice;

    const source = window.VoltData ? VoltData.getChargers() : (window.CHARGERS_DATA || []);

    const filtered = source.filter(c => {
      // Connector check
      if (connector !== 'all' && c.connector_type !== connector) {
        return false;
      }
      // Availability check
      if (availableOnly && !c.is_available) {
        return false;
      }
      // Price ceiling check
      if (c.hourly_rate > maxPrice) {
        return false;
      }
      return true;
    });

    if (typeof renderAllChargerPins === 'function') {
      renderAllChargerPins(filtered);
    }

    const counter = document.getElementById('totalPinCount');
    if (counter) counter.textContent = filtered.length;
  }

  function resetFilters() {
    document.getElementById('filterConnectorSelect').value = 'all';
    document.getElementById('filterAvailableCheckbox').checked = false;
    document.getElementById('filterPriceRange').value = 40;
    document.getElementById('filterPriceLabel').textContent = 'Up to ₹40/hr';
    applyFilters();
  }

  // Enhance Place Card with direct links to charger.html & booking.html
  function enhancePlaceCard() {
    const placeCard = document.getElementById('placeCard');
    if (!placeCard) return;

    // Watch for place card opening via MutationObserver
    const observer = new MutationObserver(() => {
      if (!placeCard.classList.contains('hidden') && window.STATE && window.STATE.activeCharger) {
        injectPlaceCardCta(window.STATE.activeCharger);
      }
    });

    observer.observe(placeCard, { attributes: true, attributeFilter: ['class'] });
  }

  function injectPlaceCardCta(charger) {
    let extraBtnContainer = document.getElementById('voltPlaceCardExtraBtn');
    const actionsGrid = document.querySelector('#placeCard .grid.grid-cols-2.gap-2.pt-1');
    if (!actionsGrid) return;

    if (!extraBtnContainer) {
      extraBtnContainer = document.createElement('div');
      extraBtnContainer.id = 'voltPlaceCardExtraBtn';
      extraBtnContainer.className = 'pt-2';
      actionsGrid.parentNode.insertBefore(extraBtnContainer, actionsGrid.nextSibling);
    }

    extraBtnContainer.innerHTML = `
      <a href="charger.html?id=${charger.id}" class="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-full flex items-center justify-center gap-1.5 transition-all shadow-md text-xs">
        <span>⚡</span>
        <span>View Full Specs & Reserve Slot →</span>
      </a>
    `;

    // Also wire the original "Start Charging" button to jump to booking.html
    const startBtn = actionsGrid.querySelector('button[onclick="openBookingHandshake()"]');
    if (startBtn) {
      startBtn.onclick = function (e) {
        e.preventDefault();
        window.location.href = `booking.html?chargerId=${charger.id}`;
      };
      startBtn.innerHTML = `<span>⚡</span> Book Slot`;
    }
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ensureVoltData(initMapFilterBridge));
  } else {
    ensureVoltData(initMapFilterBridge);
  }
})();
