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
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-40" aria-label="Primary Navigation">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          
          <!-- Left: Brand Logo & Links -->
          <div class="flex items-center gap-3">
            <a href="index.html" class="flex items-center gap-2.5 group rounded-lg">
              <div class="w-9 h-9 rounded-lg bg-googleBlue flex items-center justify-center text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <span class="text-lg font-bold text-gray-900 tracking-tight block leading-tight font-google">
                  PlugMate
                </span>
                <span class="text-[11px] text-gray-600 block font-normal">EV Charger Sharing</span>
              </div>
            </a>

            <!-- Desktop Nav Links -->
            <div class="hidden md:flex items-center gap-1 ml-6 border-l border-gray-200 pl-6 text-xs font-medium">
              <a href="index.html" class="px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${activePage === 'home' ? 'bg-blue-50 text-googleBlueHover font-bold' : 'text-gray-700 hover:bg-gray-100'}">
                Home
              </a>
              <a href="map.html" class="px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${activePage === 'map' ? 'bg-blue-50 text-googleBlueHover font-bold' : 'text-gray-700 hover:bg-gray-100'}">
                Explore Map
              </a>
              <a href="my-bookings.html" class="px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${activePage === 'bookings' ? 'bg-blue-50 text-googleBlueHover font-bold' : 'text-gray-700 hover:bg-gray-100'}">
                My Bookings
              </a>
              <a href="host-dashboard.html" class="px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${activePage === 'host' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-100'}">
                Host Dashboard
              </a>
            </div>
          </div>

          <!-- Right: User Profile or Sign In -->
          <div class="hidden sm:flex items-center gap-2.5">
            
            ${currentUser ? `
              <!-- Profile & Clerk UserButton -->
              <div class="flex items-center gap-2">
                <div id="clerkUserButtonMount" class="flex items-center"></div>
                <div class="relative">
                  <button type="button" onclick="toggleUserDropdown()" aria-haspopup="true" aria-expanded="false" id="userDropdownTrigger" class="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg py-1.5 pl-2 pr-3 text-xs text-gray-800 transition-colors">
                    <img src="${currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'}" alt="${currentUser.name}" width="24" height="24" class="w-6 h-6 rounded-full object-cover border border-gray-300">
                    <div class="text-left">
                      <span class="font-bold text-gray-900 block leading-tight max-w-[120px] truncate">${currentUser.name}</span>
                      <span class="text-[10px] uppercase font-semibold ${isHost ? 'text-emerald-700' : 'text-googleBlueHover'}">
                        ${isHost ? 'Host' : 'Chargee'}
                      </span>
                    </div>
                    <svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  <!-- Dropdown Menu -->
                  <div id="userDropdownMenu" class="hidden absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-googleCard border border-gray-200 py-2 z-50">
                    <div class="px-4 py-2 border-b border-gray-100">
                      <div class="text-xs font-semibold text-gray-900 truncate">${currentUser.name}</div>
                      <div class="text-[11px] text-gray-600 truncate">${currentUser.email || 'Verified Account'}</div>
                      <div class="mt-1.5 flex items-center justify-between">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${isHost ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-googleBlueHover'}">
                          ${isHost ? 'Host Mode' : 'Chargee (Driver)'}
                        </span>
                        <button type="button" onclick="toggleUserRole()" class="text-[11px] text-googleBlueHover hover:underline font-semibold">Switch Role</button>
                      </div>
                    </div>

                    <!-- Sign Out -->
                    <div class="px-2 py-1">
                      <button type="button" onclick="handleSignOut()" class="w-full text-left px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 rounded-lg font-medium transition-colors">
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ` : `
              <!-- Sign In / Sign Up Modal Triggers -->
              <div class="flex items-center gap-2">
                <button type="button" onclick="loginAsDemoAccount('host')" class="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors">
                  Demo Login
                </button>
                <button type="button" onclick="openPlugMateSignIn()" class="px-3 py-2 text-xs font-semibold text-gray-700 hover:text-googleBlueHover hover:bg-gray-100 rounded-lg transition-colors">
                  Sign In
                </button>
                <button type="button" onclick="openPlugMateSignUp()" class="px-3.5 py-2 bg-googleBlue hover:bg-googleBlueHover text-white text-xs font-bold rounded-full transition-colors">
                  Sign Up
                </button>
              </div>
            `}

            <!-- Map View Shortcut -->
            <a href="map.html" class="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-full flex items-center gap-1.5 transition-colors">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Map View
            </a>
          </div>

          <!-- Mobile Hamburger Button -->
          <div class="flex items-center gap-2 sm:hidden">
            <button type="button" id="mobileNavToggleBtn" onclick="toggleMobileNav()" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobileNavMenu" class="px-3 py-2 min-h-[44px] rounded-lg text-gray-800 border border-gray-300 hover:bg-gray-100 flex items-center gap-1.5 text-xs font-semibold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              <span>Menu</span>
            </button>
          </div>

        </div>
      </div>

      <!-- Mobile Dropdown Nav Menu -->
      <div id="mobileNavMenu" class="hidden sm:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-1">
        ${currentUser ? `
          <div class="py-2.5 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <img src="${currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'}" alt="${currentUser.name}" width="32" height="32" class="w-8 h-8 rounded-full border border-gray-200 object-cover">
              <div>
                <div class="text-xs font-bold text-gray-900">${currentUser.name}</div>
                <div class="text-[11px] text-gray-600 uppercase font-medium">${currentUser.role}</div>
              </div>
            </div>
            <button type="button" onclick="toggleUserRole()" class="px-2.5 py-2 text-xs text-googleBlueHover font-semibold hover:underline">Switch Role</button>
          </div>
        ` : `
          <div class="py-2.5 border-b border-gray-100 flex flex-col gap-2">
            <button type="button" onclick="loginAsDemoAccount('host')" class="w-full py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-100">
              Demo Account (Host Mode)
            </button>
            <div class="flex items-center gap-2">
              <button type="button" onclick="openPlugMateSignIn()" class="flex-1 py-2.5 bg-gray-100 text-gray-800 rounded-lg text-xs font-bold hover:bg-gray-200">Sign In</button>
              <button type="button" onclick="openPlugMateSignUp()" class="flex-1 py-2.5 bg-googleBlue text-white rounded-lg text-xs font-bold hover:bg-googleBlueHover">Sign Up</button>
            </div>
          </div>
        `}
        <a href="index.html" class="block py-2.5 px-2 rounded-lg text-xs font-semibold ${activePage === 'home' ? 'bg-blue-50 text-googleBlueHover' : 'text-gray-700 hover:bg-gray-100'}">Home</a>
        <a href="map.html" class="block py-2.5 px-2 rounded-lg text-xs font-semibold ${activePage === 'map' ? 'bg-blue-50 text-googleBlueHover' : 'text-gray-700 hover:bg-gray-100'}">Explore Map</a>
        <a href="my-bookings.html" class="block py-2.5 px-2 rounded-lg text-xs font-semibold ${activePage === 'bookings' ? 'bg-blue-50 text-googleBlueHover' : 'text-gray-700 hover:bg-gray-100'}">My Bookings</a>
        <a href="host-dashboard.html" class="block py-2.5 px-2 rounded-lg text-xs font-semibold ${activePage === 'host' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-100'}">Host Dashboard</a>
        ${currentUser ? `
          <button type="button" onclick="handleSignOut()" class="w-full text-left py-2.5 px-2 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50">Sign Out</button>
        ` : ''}
      </div>
    </nav>
  `;
}

function toggleUserDropdown() {
  const menu = document.getElementById('userDropdownMenu');
  const trigger = document.getElementById('userDropdownTrigger');
  if (menu) {
    const isHidden = menu.classList.toggle('hidden');
    if (trigger) trigger.setAttribute('aria-expanded', String(!isHidden));
  }
}

function toggleMobileNav() {
  const menu = document.getElementById('mobileNavMenu');
  const btn = document.getElementById('mobileNavToggleBtn');
  if (menu) {
    const isHidden = menu.classList.toggle('hidden');
    if (btn) btn.setAttribute('aria-expanded', String(!isHidden));
  }
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
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'plugmateDemoModalTitle');
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60';
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-googleCard max-w-sm w-full p-6 text-center border border-gray-200 relative">
      <button type="button" onclick="closeDemoAuthModal()" aria-label="Close sign in dialog" class="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-lg font-bold">&times;</button>
      
      <div class="w-11 h-11 bg-googleBlue rounded-xl flex items-center justify-center text-white mx-auto mb-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      </div>
      
      <h3 id="plugmateDemoModalTitle" class="text-lg font-bold font-google text-gray-900">Sign In to PlugMate</h3>
      <p class="text-xs text-gray-600 mt-1 mb-5">Choose an account mode to test booking and host tools</p>
      
      <div class="space-y-2.5 text-left">
        <button type="button" onclick="loginAsDemoAccount('host')" class="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center justify-between gap-2 transition-colors">
          <div>
            <div class="font-bold">Log In as Host (Jaspreet Singh)</div>
            <div class="text-[11px] text-emerald-100 font-normal">Manage chargers, PIN handshakes & payouts</div>
          </div>
          <span aria-hidden="true" class="text-emerald-100 font-mono text-[11px]">HOST</span>
        </button>
        
        <button type="button" onclick="loginAsDemoAccount('chargee')" class="w-full py-3 px-4 bg-googleBlue hover:bg-googleBlueHover text-white rounded-lg text-xs font-bold flex items-center justify-between gap-2 transition-colors">
          <div>
            <div class="font-bold">Log In as EV Driver (Chargee)</div>
            <div class="text-[11px] text-blue-100 font-normal">Explore map, reserve slots & get 4-digit PIN</div>
          </div>
          <span aria-hidden="true" class="text-blue-100 font-mono text-[11px]">DRIVER</span>
        </button>
      </div>
      
      <p class="text-[11px] text-gray-600 mt-4 border-t border-gray-100 pt-3">Synced live with Supabase database</p>
    </div>
  `;
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeDemoAuthModal();
  });
  document.body.appendChild(modal);
}

function closeDemoAuthModal() {
  const m = document.getElementById('plugmateDemoModal');
  if (m) m.remove();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDemoAuthModal();
    const menu = document.getElementById('userDropdownMenu');
    if (menu && !menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
      const trigger = document.getElementById('userDropdownTrigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }
  }
});

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
