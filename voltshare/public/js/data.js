/**
 * PlugMate — Community EV Charger Sharing Network
 * Supabase + LocalStorage Client Data Layer
 */

const PLUGMATE_STORAGE_KEYS = {
  CHARGERS: 'plugmate_chargers_v1',
  BOOKINGS: 'plugmate_bookings_v1',
  REVIEWS: 'plugmate_reviews_v1',
  CURRENT_USER: 'plugmate_current_user_v1',
  USERS: 'plugmate_users_v1'
};

// Legacy keys for backward compatibility
const VOLT_STORAGE_KEYS = {
  CHARGERS: 'voltshare_chargers_v1',
  BOOKINGS: 'voltshare_bookings_v1',
  REVIEWS: 'voltshare_reviews_v1',
  CURRENT_USER: 'voltshare_current_user_v1',
  USERS: 'voltshare_users_v1'
};

// Base URL for Flask + Supabase API
const API_BASE = (function () {
  if (typeof window === 'undefined') return '';
  if (window.location.protocol === 'file:') return null;
  // If served directly from Flask on port 5000:
  if (window.location.port === '5000') return '';
  // If served from a static dev server (e.g. Live Server port 5500, Vite 5173, etc.):
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:5000';
  }
  return '';
})();

// Default Community EV Chargers (aligned with Supabase seed records for offline fallback)
const DEFAULT_CHARGERS = [
  {
    id: 1,
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    title: 'Green Park Driveway Wallbox',
    tagline: 'Gated wide porch with shade, 5 mins from community center',
    address: '84 Main Market Avenue, Green Park',
    city: 'community',
    lat: 30.8872,
    lng: 75.8115,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 22.0,
    is_available: true,
    available_hours: '06:00 AM - 11:30 PM',
    photo: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
    amenities: ['Gated Driveway', 'CCTV Monitor', 'Covered Porch', 'Drinking Water', 'Restroom'],
    rating: 4.9,
    reviews_count: 32,
    compatibility: 'Tata Nexon/Curvv, MG ZS/Windsor, Hyundai Ioniq, Mahindra XUV400',
    surge_guarantee: true
  },
  {
    id: 3,
    host_id: 'user_host_2',
    host_name: 'Gurmeet Kaur',
    title: 'University Enclave Solar Plug',
    tagline: 'Clean 100% solar surplus charging on quiet residential street',
    address: '18 University Road, West Enclave',
    city: 'community',
    lat: 30.9015,
    lng: 75.8201,
    connector_type: '15A-3Pin',
    power_kw: 3.3,
    hourly_rate: 13.0,
    is_available: true,
    available_hours: '07:00 AM - 10:00 PM',
    photo: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    amenities: ['100% Solar Energy', 'Safe Overnight Parking', 'EV 2-Wheeler Friendly'],
    rating: 5.0,
    reviews_count: 41,
    compatibility: 'Ather 450X, Ola S1, TVS iQube, MG Comet, Tata Tiago EV',
    surge_guarantee: true
  },
  {
    id: 4,
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    title: 'Pinecrest High-Power Wallbox',
    tagline: '11 kW 3-phase home wallbox for faster charging turnarounds',
    address: '4 Pinecrest Avenue, Northridge',
    city: 'community',
    lat: 30.892,
    lng: 75.834,
    connector_type: 'Type-2 AC',
    power_kw: 11.0,
    hourly_rate: 26.0,
    is_available: true,
    available_hours: '05:00 AM - Midnight',
    photo: 'https://images.unsplash.com/photo-1558441719-8b489c63f736?auto=format&fit=crop&w=800&q=80',
    amenities: ['11 kW 3-Phase', 'CCTV Monitor', 'Easy Reversing Space'],
    rating: 4.9,
    reviews_count: 19,
    compatibility: 'BYD Atto 3/Seal, Hyundai Ioniq 5, Kia EV6, Audi e-tron',
    surge_guarantee: true
  },
  {
    id: 5,
    host_id: 'user_host_2',
    host_name: 'Gurmeet Kaur',
    title: 'Heritage Gardens Porch Socket',
    tagline: 'Quiet residential porch opposite neighborhood park',
    address: '14 Heritage Walk, Civic Center',
    city: 'community',
    lat: 30.908,
    lng: 75.845,
    connector_type: '15A-3Pin',
    power_kw: 3.3,
    hourly_rate: 12.0,
    is_available: true,
    available_hours: '08:00 AM - 08:00 PM',
    photo: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    amenities: ['Shaded Carport', 'Drinking Water Provided', 'WiFi Access'],
    rating: 4.7,
    reviews_count: 15,
    compatibility: 'All 15A Industrial Plug EV Chargers',
    surge_guarantee: true
  },
  {
    id: 6,
    host_id: 'user_demo_jaspreet',
    host_name: 'Jaspreet Singh',
    title: 'Model Town Rapid AC Socket',
    tagline: '11 kW high-speed 3-phase charger in secure gated residential compound',
    address: 'B-48, Model Town Extension, Opp. Gurdwara',
    city: 'community',
    lat: 30.8845,
    lng: 75.8080,
    connector_type: 'Type-2 AC',
    power_kw: 11.0,
    hourly_rate: 25.0,
    is_available: true,
    available_hours: '24/7 All Day',
    photo: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=800&q=80',
    amenities: ['24/7 Access', 'Security Guard', 'Well-lit Area', 'Overnight Allowed'],
    rating: 5.0,
    reviews_count: 24,
    compatibility: 'All Type-2 AC Compatible EVs',
    surge_guarantee: true
  },
  {
    id: 7,
    host_id: 'user_demo_jaspreet',
    host_name: 'Jaspreet Singh',
    title: 'EcoCharge Solar Driveway Port',
    tagline: '100% Rooftop Solar-powered clean green energy charging',
    address: 'Eco Haven, Street 7, Sector 32',
    city: 'community',
    lat: 30.8810,
    lng: 75.8155,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 19.0,
    is_available: true,
    available_hours: '08:00 AM - 08:00 PM',
    photo: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    amenities: ['100% Solar Green Energy', 'Drinking Water', 'EV Rest Bench'],
    rating: 5.0,
    reviews_count: 12,
    compatibility: 'Tata Nexon EV, MG ZS EV, Mahindra XUV400',
    surge_guarantee: true
  },
  {
    id: 9,
    host_id: 'user_demo_jaspreet',
    host_name: 'Jaspreet Singh',
    title: 'Model Town Driveway Wallbox (Jalandhar)',
    tagline: '7.4 kW Level 2 AC charger in gated driveway near Model Town Market',
    address: 'House 214, Model Town Market Road, Jalandhar',
    city: 'jalandhar',
    lat: 31.3095,
    lng: 75.5762,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 22.0,
    is_available: true,
    available_hours: '06:00 AM - 11:30 PM',
    photo: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
    amenities: ['Gated Driveway', 'CCTV Monitor', 'Shaded Parking', 'WiFi Access'],
    rating: 4.9,
    reviews_count: 16,
    compatibility: 'Tata Nexon EV, MG ZS EV, Mahindra XUV400, Hyundai Ioniq 5',
    surge_guarantee: true
  },
  {
    id: 10,
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    title: 'Urban Estate Phase II Solar Plug',
    tagline: '11 kW 3-phase rooftop solar driveway charger in Urban Estate',
    address: 'SCO 42 Lane, Urban Estate Phase II, Jalandhar',
    city: 'jalandhar',
    lat: 31.2980,
    lng: 75.5910,
    connector_type: 'Type-2 AC',
    power_kw: 11.0,
    hourly_rate: 24.0,
    is_available: true,
    available_hours: '24/7 All Day',
    photo: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    amenities: ['100% Solar Energy', '11 kW 3-Phase', 'Security Guard'],
    rating: 5.0,
    reviews_count: 21,
    compatibility: 'All Type-2 AC Compatible EVs',
    surge_guarantee: true
  },
  {
    id: 11,
    host_id: 'user_host_2',
    host_name: 'Gurmeet Kaur',
    title: 'GTB Nagar Smart 15A Socket',
    tagline: 'Economical 3.3 kW socket ideal for EV two-wheelers and overnight charging',
    address: 'Plot 18, Guru Tegh Bahadur Nagar, Jalandhar',
    city: 'jalandhar',
    lat: 31.3145,
    lng: 75.5655,
    connector_type: '15A-3Pin',
    power_kw: 3.3,
    hourly_rate: 14.0,
    is_available: true,
    available_hours: '07:00 AM - 10:30 PM',
    photo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    amenities: ['15A Industrial Plug', 'EV 2-Wheeler Friendly', 'Covered Porch'],
    rating: 4.8,
    reviews_count: 11,
    compatibility: 'Ather 450X, Ola S1, TVS iQube, MG Comet, Tata Tiago EV',
    surge_guarantee: true
  },
  {
    id: 12,
    host_id: 'user_demo_jaspreet',
    host_name: 'Jaspreet Singh',
    title: 'Civil Lines Rapid AC Hub',
    tagline: '22 kW high-output residential wallbox near Company Bagh',
    address: 'Bungalow 9, Near Company Bagh, Civil Lines, Jalandhar',
    city: 'jalandhar',
    lat: 31.3260,
    lng: 75.5795,
    connector_type: 'Type-2 AC',
    power_kw: 22.0,
    hourly_rate: 28.0,
    is_available: true,
    available_hours: '24/7 Gated',
    photo: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=800&q=80',
    amenities: ['22 kW High Speed', 'CCTV Monitor', 'Waiting Lounge'],
    rating: 4.9,
    reviews_count: 28,
    compatibility: 'BYD Atto 3, Hyundai Ioniq 5, Kia EV6, Tata Nexon EV',
    surge_guarantee: true
  },
  {
    id: 13,
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    title: 'Lajpat Nagar Green Driveway Port',
    tagline: 'Safe overnight gated parking with surge-protected 15A socket',
    address: 'House 67, Lajpat Nagar, Cool Road, Jalandhar',
    city: 'jalandhar',
    lat: 31.3188,
    lng: 75.5865,
    connector_type: '15A-3Pin',
    power_kw: 3.3,
    hourly_rate: 13.0,
    is_available: true,
    available_hours: '06:00 AM - 11:00 PM',
    photo: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    amenities: ['Safe Overnight Parking', 'Surge Protection', 'Drinking Water'],
    rating: 4.7,
    reviews_count: 8,
    compatibility: 'All 15A Industrial Plug EV Chargers & 2-Wheelers',
    surge_guarantee: true
  }
];

const DEFAULT_BOOKINGS = [
  {
    id: 'PM-8821',
    charger_id: 6,
    charger_title: 'Model Town Rapid AC Socket',
    charger_address: 'B-48, Model Town Extension, Opp. Gurdwara',
    host_id: 'user_demo_jaspreet',
    host_name: 'Jaspreet Singh',
    user_id: 'user_chargee_1',
    user_name: 'Amanjot Virdi',
    user_phone: '+91 98888 12345',
    user_vehicle: 'Tata Nexon EV Empowered+',
    date: '2026-11-26',
    time_slot: '02:00 PM (2 hrs)',
    duration_hours: 2,
    hourly_rate: 25.0,
    total_amount: 55.0,
    pin: '4821',
    status: 'upcoming',
    payment_status: 'Held in Escrow',
    connector_type: 'Type-2 AC',
    created_at: new Date().toISOString()
  },
  {
    id: 'PM-7104',
    charger_id: 7,
    charger_title: 'EcoCharge Solar Driveway Port',
    charger_address: 'Eco Haven, Street 7, Sector 32',
    host_id: 'user_demo_jaspreet',
    host_name: 'Jaspreet Singh',
    user_id: 'user_demo_jaspreet',
    user_name: 'Jaspreet Singh',
    user_phone: '+91 98765 43210',
    user_vehicle: 'MG ZS EV',
    date: '2026-11-24',
    time_slot: '06:00 PM (2 hrs)',
    duration_hours: 2,
    hourly_rate: 19.0,
    total_amount: 41.8,
    pin: '7392',
    status: 'completed',
    payment_status: 'Released to Host',
    connector_type: 'Type-2 AC',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

// -------------------------------------------------------------
// PlugMate Storage Layer Implementation
// -------------------------------------------------------------
const VoltData = {
  _hasSynced: false,
  _backendOffline: false,

  // Robust API fetch helper that persists mutations reliably across navigation/reloads
  async _fetchApi(path, options = {}) {
    if (API_BASE === null) return null;
    const method = (options.method || 'GET').toUpperCase();
    if (method === 'GET' && this._backendOffline) return null;
    try {
      const url = `${API_BASE}${path}`;
      const fetchOpts = method !== 'GET'
        ? { keepalive: true, ...options }
        : options;
      const res = await fetch(url, fetchOpts);
      if (res.status === 404 && path === '/api/health') {
        this._backendOffline = true;
        return null;
      }
      this._backendOffline = false;
      return res;
    } catch (e) {
      if (method === 'GET') {
        this._backendOffline = true;
      }
      return null;
    }
  },

  // Initialize storage structures (clean, zero mock data)
  init() {
    // Check if user just redirected from Clerk authentication portal
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      try {
        const params = new URLSearchParams(window.location.search);
        const clerkId = params.get('clerk_user_id');
        if (clerkId) {
          const userObj = {
            id: clerkId,
            name: params.get('name') || 'PlugMate User',
            email: params.get('email') || '',
            role: params.get('role') || 'chargee',
            avatar: params.get('avatar') || '',
            phone: params.get('phone') || ''
          };
          this.setCurrentUser(userObj);
          if (window.history && window.history.replaceState) {
            params.delete('clerk_user_id');
            params.delete('name');
            params.delete('email');
            params.delete('role');
            params.delete('avatar');
            params.delete('phone');
            const remaining = params.toString();
            const cleanUrl = window.location.pathname + (remaining ? '?' + remaining : '');
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }
      } catch (e) { }
    }

    const curChargers = localStorage.getItem(PLUGMATE_STORAGE_KEYS.CHARGERS);
    if (!curChargers || curChargers === '[]') {
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.CHARGERS, JSON.stringify(DEFAULT_CHARGERS));
    }
    localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, localStorage.getItem(PLUGMATE_STORAGE_KEYS.CHARGERS));

    const curBookings = localStorage.getItem(PLUGMATE_STORAGE_KEYS.BOOKINGS);
    if (!curBookings || curBookings === '[]') {
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS));
    }
    localStorage.setItem(VOLT_STORAGE_KEYS.BOOKINGS, localStorage.getItem(PLUGMATE_STORAGE_KEYS.BOOKINGS));

    if (!localStorage.getItem(PLUGMATE_STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.REVIEWS, '[]');
    }
    localStorage.setItem(VOLT_STORAGE_KEYS.REVIEWS, localStorage.getItem(PLUGMATE_STORAGE_KEYS.REVIEWS));

    if (!localStorage.getItem(PLUGMATE_STORAGE_KEYS.USERS)) {
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.USERS, '[]');
    }
    localStorage.setItem(VOLT_STORAGE_KEYS.USERS, localStorage.getItem(PLUGMATE_STORAGE_KEYS.USERS));

    // Background sync with Flask + Supabase API (runs once per page load)
    this.syncWithBackend();
  },

  // Background Cloud Sync with Flask + Supabase API
  async syncWithBackend() {
    if (this._hasSynced || API_BASE === null) return;
    this._hasSynced = true;

    try {
      const health = await this._fetchApi('/api/health');
      if (!health || !health.ok) {
        this._backendOffline = true;
        return;
      }
    } catch (e) {
      this._backendOffline = true;
      return;
    }

    const [chargersRes, bookingsRes, reviewsRes] = await Promise.all([
      this._fetchApi('/api/chargers').catch(() => null),
      this._fetchApi('/api/bookings').catch(() => null),
      this._fetchApi('/api/reviews').catch(() => null)
    ]);

    let changed = false;

    try {
      if (chargersRes && chargersRes.ok) {
        const cloudChargers = await chargersRes.json();
        if (Array.isArray(cloudChargers) && cloudChargers.length > 0) {
          localStorage.setItem(PLUGMATE_STORAGE_KEYS.CHARGERS, JSON.stringify(cloudChargers));
          localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, JSON.stringify(cloudChargers));
          changed = true;
        }
      }
    } catch (e) { }

    try {
      if (bookingsRes && bookingsRes.ok) {
        const cloudBookings = await bookingsRes.json();
        if (Array.isArray(cloudBookings)) {
          localStorage.setItem(PLUGMATE_STORAGE_KEYS.BOOKINGS, JSON.stringify(cloudBookings));
          localStorage.setItem(VOLT_STORAGE_KEYS.BOOKINGS, JSON.stringify(cloudBookings));
          changed = true;
        }
      }
    } catch (e) { }

    try {
      if (reviewsRes && reviewsRes.ok) {
        const cloudReviews = await reviewsRes.json();
        if (Array.isArray(cloudReviews)) {
          localStorage.setItem(PLUGMATE_STORAGE_KEYS.REVIEWS, JSON.stringify(cloudReviews));
          localStorage.setItem(VOLT_STORAGE_KEYS.REVIEWS, JSON.stringify(cloudReviews));
          changed = true;
        }
      }
    } catch (e) { }

    if (changed && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('plugmate:dataSynced'));
    }
  },

  // Users & Auth
  getUsers() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(PLUGMATE_STORAGE_KEYS.USERS)) || [];
    } catch {
      return [];
    }
  },

  getCurrentUser() {
    this.init();
    try {
      const raw = localStorage.getItem(PLUGMATE_STORAGE_KEYS.CURRENT_USER);
      if (!raw || raw === 'null' || raw === 'undefined') return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(PLUGMATE_STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(VOLT_STORAGE_KEYS.CURRENT_USER);
      return Promise.resolve(null);
    }
    localStorage.setItem(PLUGMATE_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(VOLT_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    if (user.id) {
      return this._fetchApi('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
    }
    return Promise.resolve(null);
  },

  setUserRole(role) {
    const cur = this.getCurrentUser();
    if (cur) {
      cur.role = role;
      this.setCurrentUser(cur);

      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === cur.id);
      if (idx !== -1) {
        users[idx].role = role;
        localStorage.setItem(PLUGMATE_STORAGE_KEYS.USERS, JSON.stringify(users));
        localStorage.setItem(VOLT_STORAGE_KEYS.USERS, JSON.stringify(users));
      }
    }
  },

  loginAs(userId) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  },

  loginOrSignup(name, email, role, phone = '', vehicle = null) {
    const users = this.getUsers();
    let existing = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      existing.role = role;
      this.setCurrentUser(existing);
      return existing;
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '',
      role: role,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80`,
      vehicle: role === 'chargee' ? (vehicle || {
        make: 'EV Owner',
        model: 'Electric Vehicle',
        reg_no: 'EV-2026',
        connector: 'Type-2 AC',
        battery_kwh: 40.0
      }) : null,
      address: 'Community Neighborhood',
      rating: 5.0,
      reviewsCount: 0
    };

    users.push(newUser);
    localStorage.setItem(PLUGMATE_STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return newUser;
  },

  logout() {
    this.setCurrentUser(null);
  },

  // Chargers
  getChargers() {
    this.init();
    try {
      const raw = localStorage.getItem(PLUGMATE_STORAGE_KEYS.CHARGERS);
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    } catch { }
    return DEFAULT_CHARGERS;
  },

  getChargerById(id) {
    const chargers = this.getChargers();
    return chargers.find(c => c.id === Number(id)) || null;
  },

  addCharger(chargerData) {
    const chargers = this.getChargers();
    const tempId = chargers.reduce((max, c) => Math.max(max, c.id || 0), 0) + 1;
    const newCharger = {
      id: tempId,
      rating: 5.0,
      reviews_count: 0,
      is_available: true,
      surge_guarantee: true,
      city: 'community',
      photo: chargerData.photo || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
      amenities: chargerData.amenities || ['Gated Driveway', 'CCTV Monitor'],
      ...chargerData
    };
    chargers.unshift(newCharger);
    localStorage.setItem(PLUGMATE_STORAGE_KEYS.CHARGERS, JSON.stringify(chargers));
    localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, JSON.stringify(chargers));

    this._fetchApi('/api/chargers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCharger)
    }).then(async (res) => {
      if (res && res.ok) {
        const saved = await res.json().catch(() => null);
        if (saved && saved.id) {
          const latest = this.getChargers();
          const idx = latest.findIndex(c => c.id === tempId);
          if (idx !== -1) {
            latest[idx] = saved;
            localStorage.setItem(PLUGMATE_STORAGE_KEYS.CHARGERS, JSON.stringify(latest));
            localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, JSON.stringify(latest));
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('plugmate:dataSynced'));
            }
          }
        }
      }
    }).catch(() => { });

    return newCharger;
  },

  updateCharger(id, updatedFields) {
    const chargers = this.getChargers();
    const idx = chargers.findIndex(c => c.id === Number(id));
    if (idx !== -1) {
      chargers[idx] = { ...chargers[idx], ...updatedFields };
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.CHARGERS, JSON.stringify(chargers));
      localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, JSON.stringify(chargers));

      this._fetchApi('/api/chargers/' + encodeURIComponent(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });

      return chargers[idx];
    }
    return null;

  },

  deleteCharger(id) {
    let chargers = this.getChargers();
    chargers = chargers.filter(c => c.id !== Number(id));
    localStorage.setItem(PLUGMATE_STORAGE_KEYS.CHARGERS, JSON.stringify(chargers));
    localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, JSON.stringify(chargers));

    this._fetchApi('/api/chargers/' + encodeURIComponent(id), { method: 'DELETE' });
  },

  // Bookings
  getBookings() {
    this.init();
    try {
      const raw = localStorage.getItem(PLUGMATE_STORAGE_KEYS.BOOKINGS);
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    } catch { }
    return DEFAULT_BOOKINGS;
  },

  getBookingById(id) {
    const bookings = this.getBookings();
    return bookings.find(b => b.id === id) || null;
  },

  createBooking(bookingPayload) {
    const bookings = this.getBookings();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newBooking = {
      id: `PM-${randomSuffix}`,
      pin: `${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'upcoming',
      payment_status: 'Held in Escrow',
      reviewed: false,
      created_at: new Date().toISOString(),
      ...bookingPayload
    };
    bookings.unshift(newBooking);
    localStorage.setItem(PLUGMATE_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    localStorage.setItem(VOLT_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    this._fetchApi('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking)
    });

    return newBooking;
  },

  cancelBooking(id) {
    const bookings = this.getBookings();
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'cancelled';
      booking.payment_status = 'Refunded to Source (₹' + booking.total_amount + ')';
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      localStorage.setItem(VOLT_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

      this._fetchApi('/api/bookings/' + encodeURIComponent(id) + '/cancel', { method: 'POST' });

      return booking;
    }
    return null;
  },

  completeBooking(id) {
    const bookings = this.getBookings();
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'completed';
      booking.payment_status = 'Released to Host';
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      localStorage.setItem(VOLT_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

      this._fetchApi('/api/bookings/' + encodeURIComponent(id) + '/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: booking.pin })
      });

      return booking;
    }
    return null;
  },

  // Reviews
  getReviews(chargerId = null) {
    this.init();
    try {
      const reviews = JSON.parse(localStorage.getItem(PLUGMATE_STORAGE_KEYS.REVIEWS)) || [];
      if (chargerId !== null) {
        return reviews.filter(r => r.charger_id === Number(chargerId));
      }
      return reviews;
    } catch {
      return [];
    }
  },

  addReview(bookingId, chargerId, rating, comment, tags = []) {
    const reviews = this.getReviews();
    const currentUser = this.getCurrentUser();

    const newReview = {
      id: Date.now(),
      charger_id: Number(chargerId),
      booking_id: bookingId,
      user_name: currentUser ? currentUser.name : 'EV Driver',
      rating: Number(rating),
      date: new Date().toISOString().split('T')[0],
      tags: tags,
      comment: comment.trim()
    };
    reviews.unshift(newReview);
    localStorage.setItem(PLUGMATE_STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    localStorage.setItem(VOLT_STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

    // Mark booking as reviewed
    const bookings = this.getBookings();
    const b = bookings.find(x => x.id === bookingId);
    if (b) {
      b.reviewed = true;
      b.review_rating = Number(rating);
      b.review_comment = comment.trim();
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      localStorage.setItem(VOLT_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    }

    // Recompute charger average rating
    const charger = this.getChargerById(chargerId);
    if (charger) {
      const chargerReviews = reviews.filter(r => r.charger_id === Number(chargerId));
      const avg = chargerReviews.reduce((sum, r) => sum + r.rating, 0) / chargerReviews.length;
      this.updateCharger(chargerId, {
        rating: Math.round(avg * 10) / 10,
        reviews_count: chargerReviews.length
      });
    }

    this._fetchApi('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview)
    });

    return newReview;
  }
};

// Aliases for compatibility
window.PlugMateData = VoltData;
window.VoltData = VoltData;

// Auto-run init
VoltData.init();
