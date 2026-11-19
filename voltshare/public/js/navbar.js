/**
 * PlugMate Shared Navigation Bar Component
 * Clean, production-grade navigation with Clerk authentication support and role switching.
 */

function renderVoltNavbar(activePage = '') {
  // Ensure location cookie script is loaded
  if (!window.VoltLocation && !document.querySelector('script[src*="location-cookie.js"]')) {
    const locScript = document.createElement('script');
    locScript.src = 'js/location-cookie.js';
    document.head.appendChild(locScript);
  }

  const mountEl = document.getElementById('voltNavbarMount');
  if (!mountEl) return;

  const currentUser = (window.VoltData && typeof VoltData.getCurrentUser === 'function')
    ? VoltData.getCurrentUser()
    : null;
  const isHost = currentUser && currentUser.role === 'host';

  mountEl.innerHTML = `
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          
          <!-- Left: Brand Logo & Links -->
          <div class="flex items-center gap-3">
            <a href="index.html" class="flex items-center gap-2.5 group">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <span class="text-xl leading-none">⚡</span>
              </div>
              <div>
                <span class="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-1.5 font-google">
                  PlugMate
                </span>
                <span class="text-[11px] text-gray-500 block -mt-1 font-normal">EV Charger Sharing</span>
              </div>
            </a>

            <!-- Desktop Nav Links -->
            <div class="hidden md:flex items-center gap-1 ml-6 border-l border-gray-200 pl-6 text-xs font-medium">
              <a href="index.html" class="px-3 py-2 rounded-full flex items-center gap-1.5 transition-colors ${activePage === 'home' ? 'bg-blue-50 text-googleBlue font-bold' : 'text-gray-700 hover:bg-gray-100'}">
                <span>🏠</span> Home
              </a>
              <a href="map.html" class="px-3 py-2 rounded-full flex items-center gap-1.5 transition-colors ${activePage === 'map' ? 'bg-blue-50 text-googleBlue font-bold' : 'text-gray-700 hover:bg-gray-100'}">
                <span>🗺️</span> Explore Map
              </a>
              <a href="my-bookings.html" class="px-3 py-2 rounded-full flex items-center gap-1.5 transition-colors ${activePage === 'bookings' ? 'bg-blue-50 text-googleBlue font-bold' : 'text-gray-700 hover:bg-gray-100'}">
                <span>📅</span> My Bookings
              </a>
              <a href="host-dashboard.html" class="px-3 py-2 rounded-full flex items-center gap-1.5 transition-colors ${activePage === 'host' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-100'}">
                <span>⚡</span> Host Dashboard
              </a>
            </div>
          </div>

          <!-- Right: User Profile or Sign In -->
          <div class="hidden sm:flex items-center gap-3">
            
            ${currentUser ? `
              <!-- Profile Dropdown -->
              <div class="relative">
                <button onclick="toggleUserDropdown()" class="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full py-1.5 pl-2 pr-3 text-xs text-gray-700 transition-colors">
                  <img src="${currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'}" alt="${currentUser.name}" class="w-6 h-6 rounded-full object-cover border border-gray-300">
                  <div class="text-left">
                    <span class="font-bold text-gray-900 block leading-tight max-w-[120px] truncate">${currentUser.name}</span>
                    <span class="text-[10px] uppercase font-semibold ${isHost ? 'text-emerald-600' : 'text-googleBlue'}">
                      ${isHost ? 'Host' : 'Chargee'}
                    </span>
                  </div>
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                <!-- Dropdown Menu -->
                <div id="userDropdownMenu" class="hidden absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-googleCard border border-gray-200 py-2 z-50">
                  <div class="px-4 py-2 border-b border-gray-100">
                    <div class="text-xs font-semibold text-gray-900 truncate">${currentUser.name}</div>
                    <div class="text-[11px] text-gray-500 truncate">${currentUser.email || 'Verified Account'}</div>
                    <div class="mt-1 flex items-center justify-between">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${isHost ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-googleBlue'}">
                        ${isHost ? '⚡ Host Mode' : '🚗 Chargee (Driver)'}
                      </span>
                    </div>
                  </div>

                  <!-- Sign Out -->
                  <div class="px-2 py-1">
                    <button onclick="handleSignOut()" class="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1.5 font-medium transition-colors">
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ` : `
              <!-- Sign In Button -->
              <a href="https://clerk.jaspreet.dpdns.org/sign-in" onclick="this.href='https://clerk.jaspreet.dpdns.org/sign-in?redirect_url=' + encodeURIComponent(window.location.href)" class="px-4 py-2 bg-googleBlue hover:bg-googleBlueHover text-white text-xs font-bold rounded-full shadow-sm transition-colors flex items-center gap-1.5">
                <span>🔒</span> Sign In with Clerk
              </a>
            `}

            <!-- Map View Shortcut -->
            <a href="map.html" class="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-full shadow-sm flex items-center gap-1.5 transition-colors">
              <span>📍</span> Map View
            </a>
          </div>

          <!-- Mobile Hamburger Button -->
          <div class="flex items-center gap-2 sm:hidden">
            <button onclick="toggleMobileNav()" class="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>

        </div>
      </div>

      <!-- Mobile Dropdown Nav Menu -->
      <div id="mobileNavMenu" class="hidden sm:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-2">
        ${currentUser ? `
          <div class="py-2 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <img src="${currentUser.avatar || ''}" class="w-8 h-8 rounded-full border border-gray-200 object-cover">
              <div>
                <div class="text-xs font-bold text-gray-900">${currentUser.name}</div>
                <div class="text-[10px] text-gray-500 uppercase">${currentUser.role}</div>
              </div>
            </div>
            <button onclick="toggleUserRole()" class="text-xs text-googleBlue font-medium">Switch Role</button>
          </div>
        ` : `
          <div class="py-2 border-b border-gray-100">
            <a href="https://clerk.jaspreet.dpdns.org/sign-in" onclick="this.href='https://clerk.jaspreet.dpdns.org/sign-in?redirect_url=' + encodeURIComponent(window.location.href)" class="block text-center py-2 bg-googleBlue text-white rounded-lg text-xs font-bold">Sign In with Clerk</a>
          </div>
        `}
        <a href="index.html" class="block py-2 text-xs font-medium text-gray-700 hover:text-googleBlue">🏠 Home</a>
        <a href="map.html" class="block py-2 text-xs font-medium text-gray-700 hover:text-googleBlue">🗺️ Explore Map</a>
        <a href="my-bookings.html" class="block py-2 text-xs font-medium text-gray-700 hover:text-googleBlue">📅 My Bookings</a>
        <a href="host-dashboard.html" class="block py-2 text-xs font-medium text-gray-700 hover:text-googleBlue">⚡ Host Dashboard</a>
      </div>
    </nav>
  `;
}

function toggleUserDropdown() {
  const menu = document.getElementById('userDropdownMenu');
  if (menu) menu.classList.toggle('hidden');
}

function toggleMobileNav() {
  const menu = document.getElementById('mobileNavMenu');
  if (menu) menu.classList.toggle('hidden');
}

function toggleUserRole() {
  if (window.VoltData && typeof VoltData.getCurrentUser === 'function') {
    const cur = VoltData.getCurrentUser();
    if (cur) {
      const nextRole = cur.role === 'host' ? 'chargee' : 'host';
      if (typeof VoltData.setUserRole === 'function') {
        VoltData.setUserRole(nextRole);
      } else if (typeof VoltData.setCurrentUser === 'function') {
        cur.role = nextRole;
        VoltData.setCurrentUser(cur);
      }
      window.location.reload();
      return;
    }
  }
  window.location.href = 'https://clerk.jaspreet.dpdns.org/sign-in';
}

function handleSignOut() {
  try {
    if (window.VoltData && typeof VoltData.logout === 'function') {
      VoltData.logout();
    }
    localStorage.removeItem('plugmate_current_user_v1');
    localStorage.removeItem('voltshare_current_user_v1');
  } catch (e) { }

  if (window.Clerk && typeof Clerk.signOut === 'function') {
    Clerk.signOut().then(() => {
      window.location.href = 'https://clerk.jaspreet.dpdns.org/sign-in';
    }).catch(() => {
      window.location.href = 'https://clerk.jaspreet.dpdns.org/sign-in';
    });
  } else {
    window.location.href = 'https://clerk.jaspreet.dpdns.org/sign-in';
  }
}

// Global click outside to dismiss profile menu
document.addEventListener('click', (e) => {
  const menu = document.getElementById('userDropdownMenu');
  if (menu && !menu.classList.contains('hidden')) {
    if (!e.target.closest('#userDropdownMenu') && !e.target.closest('button[onclick="toggleUserDropdown()"]')) {
      menu.classList.add('hidden');
    }
  }
});

// Automatic Production Clerk Session Sync across all pages
window.addEventListener('load', async () => {
  if (window.Clerk) {
    try {
      await Clerk.load();
      if (Clerk.user) {
        const primaryEmail = Clerk.user.primaryEmailAddress ? Clerk.user.primaryEmailAddress.emailAddress : '';
        const fullName = Clerk.user.fullName || Clerk.user.firstName || (primaryEmail ? primaryEmail.split('@')[0] : 'EV Driver');
        const role = Clerk.user.publicMetadata?.role || 'chargee';
        const userData = {
          id: Clerk.user.id,
          name: fullName,
          email: primaryEmail,
          avatar: Clerk.user.imageUrl,
          role: role,
          phone: Clerk.user.primaryPhoneNumber ? Clerk.user.primaryPhoneNumber.phoneNumber : ''
        };
        if (window.VoltData && typeof VoltData.setCurrentUser === 'function') {
          const current = VoltData.getCurrentUser();
          if (!current || current.id !== userData.id) {
            VoltData.setCurrentUser(userData);
            if (typeof renderVoltNavbar === 'function') {
              renderVoltNavbar();
            }
          }
        }
      }
    } catch (e) {
      console.warn('Clerk sync notice:', e);
    }
  }
});
