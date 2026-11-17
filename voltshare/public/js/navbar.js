/**
 * VoltShare Shared Navigation Bar Component
 * Injects responsive Google Maps styled header across all prototype pages.
 */

function renderVoltNavbar(activePage = '') {
  const mountEl = document.getElementById('voltNavbarMount');
  if (!mountEl) return;

  const currentUser = VoltData.getCurrentUser();
  const isHost = currentUser.role === 'host';

  mountEl.innerHTML = `
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          
          <!-- Left: Brand Logo & Tagline -->
          <div class="flex items-center gap-3">
            <a href="index.html" class="flex items-center gap-2.5 group">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <span class="text-xl leading-none">⚡</span>
              </div>
              <div>
                <span class="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-1.5 font-google">
                  VoltShare
                  <span class="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-100 text-googleBlue">
                    Ludhiana
                  </span>
                </span>
                <span class="text-[11px] text-gray-500 block -mt-1 font-normal">Peer-to-Peer EV Driveway Sharing</span>
              </div>
            </a>

            <!-- Desktop Nav Links -->
            <div class="hidden md:flex items-center gap-1 ml-6 border-l border-gray-200 pl-6 text-xs font-medium">
              <a href="index.html" class="px-3 py-2 rounded-full flex items-center gap-1.5 transition-colors ${activePage === 'map' ? 'bg-blue-50 text-googleBlue font-bold' : 'text-gray-700 hover:bg-gray-100'}">
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

          <!-- Right: User Profile & Quick Demo Switcher -->
          <div class="hidden sm:flex items-center gap-3">
            
            <!-- Quick Demo Profile Switcher -->
            <div class="relative">
              <button onclick="toggleUserDropdown()" class="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full py-1.5 pl-2 pr-3 text-xs text-gray-700 transition-colors">
                <img src="${currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'}" alt="${currentUser.name}" class="w-6 h-6 rounded-full object-cover border border-gray-300">
                <div class="text-left">
                  <span class="font-bold text-gray-900 block leading-tight">${currentUser.name.split(' ')[0]}</span>
                  <span class="text-[10px] uppercase font-semibold ${isHost ? 'text-emerald-600' : 'text-googleBlue'}">
                    ${isHost ? 'Host' : 'Chargee'}
                  </span>
                </div>
                <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div id="userDropdownMenu" class="hidden absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-googleCard border border-gray-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div class="px-4 py-2 border-b border-gray-100">
                  <div class="text-xs font-semibold text-gray-900">${currentUser.name}</div>
                  <div class="text-[11px] text-gray-500">${currentUser.email}</div>
                  <div class="mt-1">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${isHost ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-googleBlue'}">
                      ${isHost ? '⚡ Host Mode' : '🚗 Chargee (EV Driver)'}
                    </span>
                  </div>
                </div>

                <div class="px-2 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Exhibition Demo Switcher
                </div>

                <button onclick="switchDemoUser('user_chargee_1')" class="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center justify-between">
                  <div>
                    <div class="font-medium text-gray-800">Amanjot Virdi</div>
                    <div class="text-[11px] text-gray-500">Chargee • Tata Nexon EV</div>
                  </div>
                  ${currentUser.id === 'user_chargee_1' ? '<span class="text-googleBlue font-bold">✓</span>' : ''}
                </button>

                <button onclick="switchDemoUser('user_host_1')" class="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center justify-between">
                  <div>
                    <div class="font-medium text-gray-800">Harpreet Singh</div>
                    <div class="text-[11px] text-gray-500">Host • Sarabha Nagar</div>
                  </div>
                  ${currentUser.id === 'user_host_1' ? '<span class="text-emerald-600 font-bold">✓</span>' : ''}
                </button>

                <button onclick="switchDemoUser('user_host_2')" class="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center justify-between">
                  <div>
                    <div class="font-medium text-gray-800">Gurmeet Kaur</div>
                    <div class="text-[11px] text-gray-500">Host • PAU Ferozepur Rd</div>
                  </div>
                  ${currentUser.id === 'user_host_2' ? '<span class="text-emerald-600 font-bold">✓</span>' : ''}
                </button>

                <div class="border-t border-gray-100 mt-1 pt-1">
                  <a href="login.html" class="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">
                    Switch / Login with another account →
                  </a>
                  <button onclick="resetDemoDataPrompt()" class="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5">
                    <span>🔄</span> Reset Prototype Demo Data
                  </button>
                </div>
              </div>
            </div>

            <!-- Return to Map Button -->
            <a href="index.html" class="px-3.5 py-1.5 bg-googleBlue hover:bg-googleBlueHover text-white text-xs font-medium rounded-full shadow-sm flex items-center gap-1.5 transition-colors">
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
        <div class="py-2 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <img src="${currentUser.avatar || ''}" class="w-8 h-8 rounded-full border border-gray-200 object-cover">
            <div>
              <div class="text-xs font-bold text-gray-900">${currentUser.name}</div>
              <div class="text-[10px] text-gray-500 uppercase">${currentUser.role}</div>
            </div>
          </div>
          <a href="login.html" class="text-xs text-googleBlue font-medium">Switch</a>
        </div>
        <a href="index.html" class="block py-2 text-xs font-medium text-gray-700 hover:text-googleBlue">🗺️ Explore Map</a>
        <a href="my-bookings.html" class="block py-2 text-xs font-medium text-gray-700 hover:text-googleBlue">📅 My Bookings</a>
        <a href="host-dashboard.html" class="block py-2 text-xs font-medium text-gray-700 hover:text-emerald-600">⚡ Host Dashboard</a>
        <div class="pt-2 border-t border-gray-100">
          <button onclick="resetDemoDataPrompt()" class="text-xs text-rose-600 font-medium py-1">
            🔄 Reset Demo Seed Data
          </button>
        </div>
      </div>
    </nav>

    <!-- Global Toast Container -->
    <div id="voltToast">
      <span id="voltToastIcon">⚡</span>
      <span id="voltToastMsg">Notification</span>
    </div>
  `;

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdownMenu');
    if (dropdown && !dropdown.contains(e.target) && !e.target.closest('button[onclick="toggleUserDropdown()"]')) {
      dropdown.classList.add('hidden');
    }
  });
}

function toggleUserDropdown() {
  const menu = document.getElementById('userDropdownMenu');
  if (menu) menu.classList.toggle('hidden');
}

function toggleMobileNav() {
  const menu = document.getElementById('mobileNavMenu');
  if (menu) menu.classList.toggle('hidden');
}

function switchDemoUser(userId) {
  VoltData.loginAs(userId);
  showToast(`Switched user to ${VoltData.getCurrentUser().name}`);
  setTimeout(() => window.location.reload(), 300);
}

function resetDemoDataPrompt() {
  if (confirm("Reset all VoltShare demo data (chargers, bookings, ratings) to clean exhibition state?")) {
    VoltData.resetToSeed();
    showToast("Demo data reset to fresh seeds!");
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);
  }
}

function showToast(message, icon = '⚡') {
  const toast = document.getElementById('voltToast');
  const msgEl = document.getElementById('voltToastMsg');
  const iconEl = document.getElementById('voltToastIcon');
  if (!toast) return;

  msgEl.textContent = message;
  iconEl.textContent = icon;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}
