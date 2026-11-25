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
              <!-- Profile & Clerk UserButton -->
              <div class="flex items-center gap-2">
                <div id="clerkUserButtonMount" class="flex items-center"></div>
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
                        <button onclick="toggleUserRole()" class="text-[10px] text-googleBlue hover:underline font-semibold">Switch Role</button>
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
              </div>
            ` : `
              <!-- Sign In / Sign Up Modal Triggers -->
              <div class="flex items-center gap-2">
                <button onclick="loginAsDemoAccount('host')" class="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full transition-all flex items-center gap-1.5 shadow-sm">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>⚡ Demo Login</span>
                </button>
                <button onclick="openPlugMateSignIn()" class="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-googleBlue hover:bg-gray-100 rounded-full transition-colors">
                  Sign In
                </button>
                <button onclick="openPlugMateSignUp()" class="px-3.5 py-1.5 bg-googleBlue hover:bg-googleBlueHover text-white text-xs font-bold rounded-full shadow-sm transition-colors flex items-center gap-1.5">
                  Sign Up
                </button>
              </div>
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
          <div class="py-2 border-b border-gray-100 flex flex-col gap-2">
            <button onclick="loginAsDemoAccount('host')" class="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 flex items-center justify-center gap-1.5">
              <span>⚡</span> Demo Account (Host Mode)
            </button>
            <div class="flex items-center gap-2">
              <button onclick="openPlugMateSignIn()" class="flex-1 py-2 bg-gray-100 text-gray-800 rounded-lg text-xs font-bold hover:bg-gray-200">Sign In</button>
              <button onclick="openPlugMateSignUp()" class="flex-1 py-2 bg-googleBlue text-white rounded-lg text-xs font-bold hover:bg-googleBlueHover">Sign Up</button>
            </div>
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

async function toggleUserRole() {
  if (window.VoltData && typeof VoltData.getCurrentUser === 'function') {
    const cur = VoltData.getCurrentUser();
    if (cur) {
      const nextRole = cur.role === 'host' ? 'chargee' : 'host';
      cur.role = nextRole;
      if (typeof VoltData.setUserRole === 'function') {
        VoltData.setUserRole(nextRole);
      }
      if (typeof VoltData.setCurrentUser === 'function') {
        await Promise.race([
          Promise.resolve(VoltData.setCurrentUser(cur)),
          new Promise(r => setTimeout(r, 800))
        ]);
      }
      window.location.reload();
      return;
    }
  }
  openPlugMateSignIn();
}

// -------------------------------------------------------------
// Scrutiny Demo Account & Live Supabase Database Sync
// -------------------------------------------------------------
async function loginAsDemoAccount(role = 'host') {
  const isHost = role === 'host';
  const demoUser = {
    id: 'user_demo_jaspreet',
    name: 'Jaspreet Singh',
    email: 'jaspreet@plugmate.ev',
    phone: '+91 98765 43210',
    role: isHost ? 'host' : 'chargee',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    address: 'Indiranagar, Bengaluru',
    badge: 'Verified Community Host'
  };

  if (window.VoltData && typeof VoltData.setCurrentUser === 'function') {
    await Promise.race([
      Promise.resolve(VoltData.setCurrentUser(demoUser)),
      new Promise(r => setTimeout(r, 800))
    ]);
  } else {
    try {
      localStorage.setItem('plugmate_current_user_v1', JSON.stringify(demoUser));
      localStorage.setItem('voltshare_current_user_v1', JSON.stringify(demoUser));
    } catch (e) { }
    await fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify(demoUser)
    }).catch(() => { });
  }

  closeDemoAuthModal();
  window.location.reload();
}

function openDemoLoginModal() {
  if (document.getElementById('plugmateDemoModal')) return;

  const modal = document.createElement('div');
  modal.id = 'plugmateDemoModal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-googleCard max-w-sm w-full p-6 text-center border border-gray-100 relative">
      <button onclick="closeDemoAuthModal()" class="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
      
      <div class="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md mb-3">
        <span class="text-2xl">⚡</span>
      </div>
      
      <h3 class="text-lg font-bold font-google text-gray-900">Sign In to PlugMate</h3>
      <p class="text-xs text-gray-500 mt-1 mb-5">Select an account for project demonstration & scrutiny</p>
      
      <div class="space-y-2.5 text-left">
        <button onclick="loginAsDemoAccount('host')" class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors">
          <span>⚡</span>
          <div>
            <div class="font-bold">Log In as Host (Jaspreet Singh)</div>
            <div class="text-[10px] text-emerald-100 font-normal">Manage chargers & view earnings</div>
          </div>
        </button>
        
        <button onclick="loginAsDemoAccount('chargee')" class="w-full py-2.5 px-4 bg-googleBlue hover:bg-googleBlueHover text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors">
          <span>🚗</span>
          <div>
            <div class="font-bold">Log In as EV Driver (Chargee)</div>
            <div class="text-[10px] text-blue-100 font-normal">Explore map, book chargers & get 4-digit PIN</div>
          </div>
        </button>
      </div>
      
      <p class="text-[10px] text-gray-400 mt-4 border-t border-gray-100 pt-3">Live synced with Supabase cloud database</p>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeDemoAuthModal() {
  const m = document.getElementById('plugmateDemoModal');
  if (m) m.remove();
}

// Clerk Modal Openers (with Instant Demo Account Fallback)
function openPlugMateSignIn() {
  if (window.Clerk && typeof window.Clerk.openSignIn === 'function') {
    try {
      window.Clerk.openSignIn({
        afterSignInUrl: window.location.origin + '/my-bookings.html',
        afterSignUpUrl: window.location.origin + '/my-bookings.html'
      });
      return;
    } catch (e) { }
  }
  openDemoLoginModal();
}

function openPlugMateSignUp() {
  if (window.Clerk && typeof window.Clerk.openSignUp === 'function') {
    try {
      window.Clerk.openSignUp({
        afterSignInUrl: window.location.origin + '/my-bookings.html',
        afterSignUpUrl: window.location.origin + '/my-bookings.html'
      });
      return;
    } catch (e) { }
  }
  openDemoLoginModal();
}

function handleSignOut() {
  try {
    if (window.VoltData && typeof VoltData.logout === 'function') {
      VoltData.logout();
    }
    localStorage.removeItem('plugmate_current_user_v1');
    localStorage.removeItem('voltshare_current_user_v1');
  } catch (e) { }

  if (window.Clerk && typeof window.Clerk.signOut === 'function') {
    window.Clerk.signOut().then(() => {
      window.location.reload();
    }).catch(() => {
      window.location.reload();
    });
  } else {
    window.location.reload();
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

// Automatic Clerk Session Sync & Component Mount across all pages
async function initPlugMateClerk() {
  // Read publishable key from dynamic config (never hardcoded in source)
  const publishableKey = (window.__PLUGMATE_CONFIG__ && window.__PLUGMATE_CONFIG__.clerkPublishableKey)
    || (window.VoltConfig && window.VoltConfig.clerkPublishableKey)
    || '';

  if (!publishableKey) {
    return;
  }

  // Poll briefly for Clerk CDN script to load
  let attempts = 0;
  while (!window.Clerk && attempts < 40) {
    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }

  if (window.Clerk) {
    try {
      if (typeof window.Clerk.load === 'function' && !window.Clerk.loaded) {
        await window.Clerk.load({
          publishableKey: publishableKey
        });
      }

      const syncUserState = () => {
        if (window.Clerk && window.Clerk.user) {
          const user = window.Clerk.user;
          const primaryEmail = user.primaryEmailAddress ? user.primaryEmailAddress.emailAddress : '';
          const fullName = user.fullName || user.firstName || (primaryEmail ? primaryEmail.split('@')[0] : 'EV Driver');
          const role = user.publicMetadata?.role || 'chargee';
          const userData = {
            id: user.id,
            name: fullName,
            email: primaryEmail,
            avatar: user.imageUrl,
            role: role,
            phone: user.primaryPhoneNumber ? user.primaryPhoneNumber.phoneNumber : ''
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
      };

      syncUserState();

      // Listen for auth state changes (sign in, sign out)
      if (typeof window.Clerk.addListener === 'function') {
        window.Clerk.addListener(({ user }) => {
          if (user) {
            syncUserState();
          } else {
            if (window.VoltData && typeof VoltData.logout === 'function') {
              VoltData.logout();
            }
            if (typeof renderVoltNavbar === 'function') {
              renderVoltNavbar();
            }
          }
        });
      }

      // Mount Clerk's official UserButton if mount container is available
      const mountEl = document.getElementById('clerkUserButtonMount');
      if (mountEl && window.Clerk.user && typeof window.Clerk.mountUserButton === 'function') {
        mountEl.innerHTML = '';
        window.Clerk.mountUserButton(mountEl, {
          afterSignOutUrl: window.location.origin
        });
      }
    } catch (e) {
      console.warn('[PlugMate] Clerk sync notice:', e.message || e);
    }
  }
}

// Start Clerk initialization
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initPlugMateClerk();
} else {
  window.addEventListener('DOMContentLoaded', initPlugMateClerk);
}
