import { Clerk } from "@clerk/clerk-js";
import { ClerkUI } from "@clerk/ui/entry";

// Capture return targets immediately on page load
try {
  const initParams = new URLSearchParams(window.location.search);
  const initReturnTo = initParams.get("return_to");
  if (initReturnTo) {
    sessionStorage.setItem("plugmate_return_to", initReturnTo);
  }
  const initReturnBase = initParams.get("return_base");
  if (initReturnBase) {
    sessionStorage.setItem("plugmate_return_base", initReturnBase);
  }
} catch (e) {}

// Discover Publishable Key from Vite env or fallback to PlugMate key
const publishableKey = 
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
  "pk_test_ZGVsaWNhdGUtc2t5bGFyay03MTU2LmNsZXJrLmFjY291bnRzLmRldiQ";

const clerk = new Clerk(publishableKey);

// Synchronize session to backend / localStorage for PlugMate
function syncSessionToBackend(user) {
  if (!user) {
    try {
      localStorage.removeItem("plugmate_current_user_v1");
      localStorage.removeItem("voltshare_current_user_v1");
    } catch (e) {}
    return;
  }
  const primaryEmail = user.primaryEmailAddress ? user.primaryEmailAddress.emailAddress : "";
  const fullName = user.fullName || user.firstName || (primaryEmail ? primaryEmail.split("@")[0] : "EV Driver");
  const role = user.publicMetadata?.role || "chargee";
  const userData = {
    id: user.id,
    name: fullName,
    email: primaryEmail,
    avatar: user.imageUrl,
    role: role,
    phone: user.primaryPhoneNumber ? user.primaryPhoneNumber.phoneNumber : ""
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
    // SIGNED IN STATE: Immediately redirect back to the booking page
    // -------------------------------------------------------------
    syncSessionToBackend(clerk.user);

    const primaryEmail = clerk.user.primaryEmailAddress ? clerk.user.primaryEmailAddress.emailAddress : "";
    const fullName = clerk.user.fullName || clerk.user.firstName || (primaryEmail ? primaryEmail.split("@")[0] : "EV Driver");
    const role = clerk.user.publicMetadata?.role || "chargee";

    // 1. Check for explicit return target
    let returnTo = "";
    try {
      const urlParams = new URLSearchParams(window.location.search);
      returnTo = urlParams.get("return_to") || sessionStorage.getItem("plugmate_return_to") || "";
    } catch (e) {}

    // 2. Fall back to document referrer if valid and not localhost:5173
    if (!returnTo && document.referrer) {
      try {
        const ref = new URL(document.referrer);
        if (ref.port !== "5173") {
          returnTo = document.referrer;
        }
      } catch (e) {}
    }

    let destination = "";
    if (returnTo) {
      try {
        const targetUrl = new URL(returnTo, window.location.origin);
        targetUrl.searchParams.set("clerk_user_id", clerk.user.id);
        targetUrl.searchParams.set("name", fullName);
        targetUrl.searchParams.set("email", primaryEmail);
        targetUrl.searchParams.set("role", role);
        destination = targetUrl.toString();
      } catch (e) {
        destination = returnTo;
      }
    }

    // 3. Fallback: Default directly to the booking page (my-bookings.html)
    if (!destination) {
      let returnBase = "";
      try {
        const urlParams = new URLSearchParams(window.location.search);
        returnBase = urlParams.get("return_base") || sessionStorage.getItem("plugmate_return_base") || "";
      } catch (e) {}

      if (!returnBase) {
        returnBase = "http://localhost:5000/";
      }
      const baseWithSlash = returnBase.endsWith("/") ? returnBase : `${returnBase}/`;
      destination = `${baseWithSlash}my-bookings.html?clerk_user_id=${encodeURIComponent(clerk.user.id)}&name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(primaryEmail)}&role=${encodeURIComponent(role)}`;
    }

    app.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center p-6 text-center my-auto">
        <div class="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md mb-4">
          <span class="text-2xl">⚡</span>
        </div>
        <h2 class="text-lg font-bold font-google text-gray-900">Signed In Successfully</h2>
        <p class="text-xs text-gray-500 mt-1">Bringing you back to the booking page...</p>
      </div>
    `;

    window.location.href = destination;
    return;

  } else {
    // -------------------------------------------------------------
    // SIGNED OUT STATE: Clean, centered Clerk Sign-In Card (No spinner)
    // -------------------------------------------------------------
    syncSessionToBackend(null);

    app.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-auto">
        
        <!-- Header -->
        <div class="max-w-md w-full text-center mb-6">
          <div class="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md mb-3">
            <span class="text-2xl">⚡</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold font-google text-gray-900">PlugMate</h1>
          <p class="text-xs text-gray-500 mt-1">Community EV Charger Sharing Network</p>
        </div>

        <!-- Clerk Mounted Container -->
        <div id="clerk-mount-target" class="w-full max-w-md flex justify-center items-center"></div>

      </div>
    `;

    const targetEl = document.getElementById("clerk-mount-target");

    try {
      targetEl.innerHTML = "";
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
