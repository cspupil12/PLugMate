import { Clerk } from "@clerk/clerk-js";
import { ClerkUI } from "@clerk/ui/entry";

// Discover Publishable Key from Vite env or fallback to PlugMate key
const publishableKey = 
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
  "pk_test_ZGVsaWNhdGUtc2t5bGFyay03MTU2LmNsZXJrLmFjY291bnRzLmRldiQ";

const clerk = new Clerk(publishableKey);

// Synchronize session to backend / localStorage for VoltShare
function syncSessionToBackend(user) {
  if (!user) {
    try {
      localStorage.removeItem("voltshare_current_user_v1");
    } catch (e) {}
    return;
  }
  const primaryEmail = user.primaryEmailAddress ? user.primaryEmailAddress.emailAddress : "";
  const fullName = user.fullName || user.firstName || (primaryEmail ? primaryEmail.split("@")[0] : "EV Driver");
  const userData = {
    id: user.id,
    name: fullName,
    email: primaryEmail,
    avatar: user.imageUrl,
    role: "chargee",
    phone: user.primaryPhoneNumber ? user.primaryPhoneNumber.phoneNumber : "+91 98765 00000"
  };
  try {
    localStorage.setItem("plugmate_current_user_v1", JSON.stringify(userData));
    localStorage.setItem("voltshare_current_user_v1", JSON.stringify(userData));
    localStorage.setItem("clerk_publishable_key", publishableKey);
  } catch (e) {}
}

async function initClerk() {
  try {
    // Explicitly load with ClerkUI so prebuilt components (SignIn, UserButton) are mounted
    await clerk.load({
      ui: {
        ClerkUI
      }
    });
  } catch (err) {
    console.error("Clerk.load failed:", err);
  }
  renderUI();
}

function renderUI() {
  const app = document.getElementById("app");
  if (!app) return;

  if (clerk.user) {
    // -------------------------------------------------------------
    // SIGNED IN STATE: Connects to Backend & VoltShare App
    // -------------------------------------------------------------
    syncSessionToBackend(clerk.user);

    const primaryEmail = clerk.user.primaryEmailAddress ? clerk.user.primaryEmailAddress.emailAddress : "";
    const fullName = clerk.user.fullName || clerk.user.firstName || (primaryEmail ? primaryEmail.split("@")[0] : "EV Driver");

    app.innerHTML = `
      <!-- Sticky Navigation Bar -->
      <nav class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
            
            <!-- Left: Logo & Tagline -->
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <span class="text-xl">⚡</span>
              </div>
              <div>
                <span class="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-1.5 font-google">
                  PlugMate
                  <span class="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-100 text-googleBlue">
                    Connected
                  </span>
                </span>
                <span class="text-[11px] text-gray-500 block -mt-1">EV Driveway Sharing Network</span>
              </div>
            </div>

            <!-- Right: User Button Mount -->
            <div class="flex items-center gap-3">
              <div class="text-right hidden sm:block">
                <span class="text-xs font-bold text-gray-900 block leading-tight">${fullName}</span>
                <span class="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Account
                </span>
              </div>
              <div id="user-button" class="w-8 h-8 flex items-center justify-center"></div>
            </div>

          </div>
        </div>
      </nav>

      <!-- Authenticated Content Connected to App -->
      <main class="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        <!-- Welcome Hero Banner -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <img src="${clerk.user.imageUrl}" class="w-16 h-16 rounded-full border-2 border-white/60 shadow-md object-cover" />
            <div>
              <div class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-blue-100 mb-1">
                <span>🛡️</span> PlugMate Account Active
              </div>
              <h1 class="text-2xl font-bold font-google">Welcome, ${fullName}!</h1>
              <p class="text-xs text-blue-100 mt-1">${primaryEmail}</p>
            </div>
          </div>
        </div>

        <!-- Connection to App & Services -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <!-- Card 1: Explore Map -->
          <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="w-10 h-10 bg-blue-50 text-googleBlue rounded-xl flex items-center justify-center text-xl">
                🗺️
              </div>
              <h3 class="text-sm font-bold text-gray-900">Explore Nearby Chargers</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                Find community driveway chargers nearby with real-time road directions.
              </p>
            </div>
            <a href="http://localhost:8000/map.html" class="w-full py-2 bg-googleBlue hover:bg-blue-700 text-white text-xs font-bold rounded-lg text-center shadow-sm transition-colors flex items-center justify-center gap-1.5">
              <span>⚡</span> Launch Map App →
            </a>
          </div>

          <!-- Card 2: Host Dashboard -->
          <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">
                🏠
              </div>
              <h3 class="text-sm font-bold text-gray-900">Host Dashboard</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                List your driveway charger, verify arriving drivers, and view your payout history.
              </p>
            </div>
            <a href="http://localhost:8000/host-dashboard.html" class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg text-center shadow-sm transition-colors flex items-center justify-center gap-1.5">
              <span>🔑</span> Open Host Mode →
            </a>
          </div>

          <!-- Card 3: My Bookings -->
          <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl">
                📅
              </div>
              <h3 class="text-sm font-bold text-gray-900">My EV Bookings</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                Review your active reservations, view arrival PINs, and manage past sessions.
              </p>
            </div>
            <a href="http://localhost:8000/my-bookings.html" class="w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg text-center shadow-sm transition-colors flex items-center justify-center gap-1.5">
              <span>📋</span> View My Bookings →
            </a>
          </div>

        </div>

      </main>
    `;

    try {
      clerk.mountUserButton(document.getElementById("user-button"));
    } catch (err) {
      console.warn("clerk.mountUserButton notice:", err);
    }

  } else {
    // -------------------------------------------------------------
    // SIGNED OUT STATE: Clean, centered Clerk Sign-In Card
    // -------------------------------------------------------------
    syncSessionToBackend(null);

    app.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-auto">
        
        <!-- Header -->
        <div class="max-w-md w-full text-center mb-6">
          <div class="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md mb-3">
            <span class="text-2xl">⚡</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold font-google text-gray-900">PlugMate Authentication</h1>
          <p class="text-xs text-gray-500 mt-1">Community EV Charger Sharing Network</p>
        </div>

        <!-- Clerk Mounted Container -->
        <div id="clerk-mount-target" class="w-full max-w-md flex justify-center items-center min-h-[380px]">
          <div class="text-center text-gray-400 py-10 space-y-2">
            <div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-xs font-medium">Connecting to Clerk Secure Sign-In...</p>
          </div>
        </div>

      </div>
    `;

    const targetEl = document.getElementById("clerk-mount-target");

    try {
      clerk.mountSignIn(targetEl, {
        routing: "hash"
      });
    } catch (err) {
      console.error("Clerk mountSignIn failed:", err);
      targetEl.innerHTML = `
        <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs max-w-sm text-center">
          Failed to mount Clerk: ${err.message || err}
        </div>
      `;
    }
  }
}

// Listen for authentication changes (Sign In / Sign Out)
clerk.addListener(() => {
  renderUI();
});

// Kick off Clerk initialization
initClerk();
