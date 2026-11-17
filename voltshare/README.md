# VoltShare — Peer-to-Peer EV Charger Sharing (Ludhiana)
### College Project Exhibition Prototype & Runbook

VoltShare is a community-driven EV charger sharing web prototype (modeled after Co Charger UK) created for an engineering exhibition. It solves the urban EV charging dilemma in Indian cities (specifically demonstrated across **Ludhiana, Punjab**):

> **The Problem:** 60%+ of EV owners in dense urban areas live in apartments or builder floors without private driveway parking, making home charging impossible.
> **The Solution:** Nearby residential homeowners with driveways and solar/wallbox installations (**Hosts**) rent their chargers during off-peak hours to non-driveway neighbors (**Chargees**), creating a decentralized green charging grid.

---

## 🚀 How to Run the Prototype

No complicated backend or database setup is needed. The prototype uses a shared `localStorage` data engine (`js/data.js`).

### Option 1: Python HTTP Server (Recommended)
Open your terminal in the `voltshare/public` folder and run:

```bash
# From voltshare/public directory
python -m http.server 8000
```
Then open your browser at:
👉 **`http://localhost:8000`**

### Option 2: Node.js `serve` / `npx`
```bash
npx serve voltshare/public
```

### Option 3: Direct Browser Open (Double Click)
You can directly open `voltshare/public/index.html` in Chrome, Firefox, or Edge.

---

## 🔌 Connecting the Filter Bar to `index.html`

As per the strict project rules, `index.html` was not modified. To enable the real-time filter bar (Plug type, Max price slider, Available now toggle) and map navigation pills, add this **single line** right before the closing `</body>` tag (around line 394) in `voltshare/public/index.html`:

```html
  <!-- Application Logic -->
  <script src="app.js"></script>
  <script src="js/map-filter.js"></script> <!-- ADD THIS LINE -->
</body>
</html>
```

When added, `js/map-filter.js` will:
1. Dynamically sync all 15 Ludhiana community chargers onto the Google Map.
2. Mount the floating filter toolbar below the search box.
3. Add top-right navigation links (`My Bookings`, `Host Mode`, `User Profile`).
4. Upgrade the map place card with a direct **"View Full Specs & Reserve Slot"** button.

---

## 🎭 College Exhibition Demo Script (5-Minute Walkthrough)

Follow this exact click-through order to deliver a high-impact presentation at your exhibition:

### **Scene 1: The Problem & Map Discovery (1.5 mins)**
1. **Open `index.html`**:
   - Show the authentic Google Maps interface centered on **Ludhiana**.
   - Point out the teardrop pins across familiar localities: *Sarabha Nagar, BRS Nagar, PAU Ferozepur Road, Model Town Extension, South City*.
2. **Use the Filter Toolbar**:
   - Filter by **Plug Type: Type-2 AC (7.4 kW)** or toggle **Available Now**.
   - Drag the **Max Hourly Price** slider down to ₹20/hr to show affordable options.
3. **Inspect a Charger**:
   - Click the green pin in **Sarabha Nagar** (Kothi 84, Harpreet Singh).
   - Point out the Google Maps Place Card with price (₹22/hr), 4.9★ rating, and the ₹50,000 community surge protection guarantee.
   - Click **"View Full Specs & Reserve Slot →"** (navigates to `charger.html?id=1`).

---

### **Scene 2: Charger Detail & Slot Booking (1.5 mins)**
1. **Show Charger Specs (`charger.html`)**:
   - Highlight the driveway photo, verified host badge (*Punjab DISCOM Landed*), power rating (7.4 kW), and host bio.
   - Show the driveway amenities (*Gated Driveway, CCTV, Shade*) and verified neighbor reviews.
   - Click **"Reserve Charger Slot"** (navigates to `booking.html?chargerId=1`).
2. **Execute Reservation (`booking.html`)**:
   - Select **Date**: *Today (Nov 17)*.
   - Select **Time Slot**: *08:00 PM*.
   - Select **Duration**: *2 Hours*.
   - Show the transparent price calculation:
     - Energy: ₹44.00
     - 10% Community Escrow & Insurance: ₹4.40
     - **Total: ₹48.40**
   - Choose **Payment Method**: *UPI (Google Pay / PhonePe) Escrow*.
   - Click **"Confirm & Pay ₹48.40"**.

---

### **Scene 3: The Digital Handshake & PIN (45 seconds)**
1. **Instant Confirmation Screen**:
   - Highlight the generated **4-Digit Charging PIN (e.g. `8492`)** and booking ID (`VS-LDH-xxxx`).
   - *Key Talking Point for Judges:* "Money is safely locked in VoltShare Escrow. The driver drives to the host's house, shows this 4-digit PIN, and the host verifies it before turning on the power."
   - Click **"View in My Bookings"** (navigates to `my-bookings.html`).

---

### **Scene 4: Driver Dashboard & Host Mode (1 min)**
1. **Chargee View (`my-bookings.html`)**:
   - Show the active upcoming reservation with the large PIN badge and "Directions on Map" button.
2. **Switch to Host View**:
   - In the top navbar, click the profile dropdown and select **"Harpreet Singh (Host • Sarabha Nagar)"** or click **"Host Dashboard"**.
3. **Host Dashboard (`host-dashboard.html`)**:
   - Show the **Net Host Payouts** (90% cut for the host), active chargers, and incoming bookings.
   - Find Amanjot's booking and click **"🔑 Verify PIN"**.
   - Enter the 4-digit PIN $\rightarrow$ Session completes and the payout is instantly added to host earnings!
   - Demonstrate the **Availability Switch** (toggle between *Available* and *In Use*).
   - Click **"+ Add New Charger"** to show how easy it is for any homeowner to list their driveway socket.

---

### **Scene 5: Community Rating & Social Proof (30 seconds)**
1. In the navbar, switch back to **Amanjot Virdi (Chargee)**.
2. Go to `my-bookings.html` $\rightarrow$ Past History tab.
3. Click **"★ Leave Rating & Review"** (opens `review.html`).
4. Select 5 stars, click tags like *⚡ Fast charging* and *🏡 Clean driveway*, type a quick note, and submit.
5. The charger's rating updates across the entire app!

---

## 👥 Demo Accounts Included

| Role | Name | Details / Vehicle | Location |
| :--- | :--- | :--- | :--- |
| **Chargee** | Amanjot Virdi | Tata Nexon EV (PB-10-AZ-4521), No driveway | Pakhowal Rd, Ludhiana |
| **Host** | Harpreet Singh | 6 Listed Driveway Wallboxes (Type-2 AC 7.4kW) | Sarabha Nagar, Ludhiana |
| **Host** | Gurmeet Kaur | Solar Rooftop EV Sockets (15A & CCS-2) | PAU / Ferozepur Rd, Ludhiana |

*(You can switch between any of these users with one click from the navbar dropdown or on `login.html`)*.

---

## 📁 File Structure

```
voltshare/
├── public/
│   ├── index.html            # [FINAL & LOCKED] Google Maps UI
│   ├── app.js                # Original map routing & Leaflet layer logic
│   ├── login.html            # Authentication & role selector (Host vs Chargee)
│   ├── charger.html          # Detailed charger page (photos, specs, host bio, reviews)
│   ├── booking.html          # Slot booking, price calculation, fake UPI escrow, 4-digit PIN
│   ├── my-bookings.html      # Driver dashboard (active PIN, past trips, cancellation)
│   ├── host-dashboard.html   # Host dashboard (earnings, incoming bookings, add/edit charger)
│   ├── review.html           # 5-star rating and tag feedback submission
│   ├── css/
│   │   └── style.css         # Google Maps colors, shadows, and responsive styles
│   └── js/
│       ├── data.js           # Shared LocalStorage data engine (15 chargers, 3 users)
│       ├── navbar.js         # Reusable navigation bar & user switcher
│       └── map-filter.js     # Single-line bridge script for index.html
└── README.md                 # Exhibition runbook & architecture guide
```
