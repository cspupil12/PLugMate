/**
 * PlugMate — Community EV Charger Sharing Network
 * Shared LocalStorage Data Layer & Demo Seed Engine
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

// Realistic Community Users
const SEED_USERS = [
  {
    id: 'user_chargee_1',
    name: 'Amanjot Virdi',
    email: 'aman@plugmate.io',
    phone: '+91 98888 12345',
    role: 'chargee',
    vehicle: {
      make: 'Tata',
      model: 'Nexon EV Empowered+',
      reg_no: 'EV-DRIVE-2026',
      connector: 'Type-2 AC',
      battery_kwh: 40.5
    },
    address: 'Green Avenue Apartments (No Driveway Parking)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'
  },
  {
    id: 'user_host_1',
    name: 'Harpreet Singh',
    email: 'harpreet@plugmate.io',
    phone: '+91 98765 43210',
    role: 'host',
    rating: 4.9,
    reviewsCount: 38,
    badge: 'Verified Community Host',
    address: '142 Oakridge Avenue, Green Park',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80'
  },
  {
    id: 'user_host_2',
    name: 'Gurmeet Kaur',
    email: 'gurmeet@plugmate.io',
    phone: '+91 98123 45678',
    role: 'host',
    rating: 5.0,
    reviewsCount: 42,
    badge: 'Solar Rooftop Host',
    address: '7 Westside Boulevard',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80'
  }
];

// 15 Realistic Community EV Chargers
const SEED_CHARGERS = [
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
    id: 2,
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    title: 'Central Boulevard Fast AC Port',
    tagline: 'Convenient overnight spot for apartment residents',
    address: '312 Central Boulevard, Block C',
    city: 'community',
    lat: 30.8790,
    lng: 75.7950,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 20.0,
    is_available: true,
    available_hours: '24 Hours Open',
    photo: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
    amenities: ['Security Lighting', 'Wide Gate Entry', 'Automatic Cutoff Meter'],
    rating: 4.8,
    reviews_count: 24,
    compatibility: 'All Type-2 4-Wheelers & 3-Wheelers',
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
    lat: 30.8920,
    lng: 75.8340,
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
    lat: 30.9080,
    lng: 75.8450,
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
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    title: 'Garden Quarter Porch Port',
    tagline: 'Secure gated lane with clear driveway access',
    address: '55 Garden Walk, Midtown',
    city: 'community',
    lat: 30.8995,
    lng: 75.8290,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 22.0,
    is_available: false,
    available_hours: '07:00 AM - 11:00 PM',
    photo: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
    amenities: ['Gated Lane', 'Night Illumination', 'Surge Protected'],
    rating: 4.9,
    reviews_count: 28,
    compatibility: 'Type-2 4-Wheelers',
    surge_guarantee: true
  },
  {
    id: 7,
    host_id: 'user_host_2',
    host_name: 'Gurmeet Kaur',
    title: 'Canal Road DC Fast Haven',
    tagline: 'Fast point for long-trip commuters near bypass ring',
    address: '108 Canal View Road, South Park',
    city: 'community',
    lat: 30.9250,
    lng: 75.7720,
    connector_type: 'CCS-2 DC',
    power_kw: 22.0,
    hourly_rate: 38.0,
    is_available: true,
    available_hours: '24 Hours Open',
    photo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    amenities: ['High-Power CCS-2', 'Waiting Area', 'Washroom Access', 'Tire Pressure Gauge'],
    rating: 5.0,
    reviews_count: 53,
    compatibility: 'All CCS-2 DC Fast Capable EVs',
    surge_guarantee: true
  },
  {
    id: 8,
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    title: 'Park Avenue Community Plug',
    tagline: 'Affordable overnight top-ups for local residents',
    address: '72 Park Avenue, Sector 2',
    city: 'community',
    lat: 30.8650,
    lng: 75.8480,
    connector_type: '15A-3Pin',
    power_kw: 3.3,
    hourly_rate: 14.0,
    is_available: true,
    available_hours: '06:00 PM - 08:00 AM',
    photo: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80',
    amenities: ['Dedicated Sub-meter', 'Spacious Driveway', 'Night Motion Sensor'],
    rating: 4.8,
    reviews_count: 18,
    compatibility: 'Comet EV, Tiago EV, Two-Wheelers',
    surge_guarantee: true
  },
  {
    id: 9,
    host_id: 'user_host_2',
    host_name: 'Gurmeet Kaur',
    title: 'Highland Park Eco Point',
    tagline: 'Quiet residential porch near green belt',
    address: '22 Highland Way, Block A',
    city: 'community',
    lat: 30.9180,
    lng: 75.8150,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 20.0,
    is_available: true,
    available_hours: '07:00 AM - 10:30 PM',
    photo: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    amenities: ['Gated Porch', 'Type-2 Tethered Cable', 'Fire Safety Extinguisher'],
    rating: 4.8,
    reviews_count: 21,
    compatibility: 'Type-2 AC Standard',
    surge_guarantee: true
  },
  {
    id: 10,
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    title: 'Eastgate Gated Driveway Wallbox',
    tagline: 'Wide paved driveway inside peaceful residential neighborhood',
    address: '410 Meadow Lane, Eastgate',
    city: 'community',
    lat: 30.8720,
    lng: 75.7820,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 23.0,
    is_available: true,
    available_hours: '24 Hours Open',
    photo: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    amenities: ['Dedicated Parking Bay', 'Tethered 5m Cable', 'CCTV Coverage'],
    rating: 4.9,
    reviews_count: 31,
    compatibility: 'Type-2 AC 4-Wheelers',
    surge_guarantee: true
  },
  {
    id: 11,
    host_id: 'user_host_2',
    host_name: 'Gurmeet Kaur',
    title: 'Garden Reach Eco Socket',
    tagline: 'Low-noise charging port next to community garden',
    address: '89 Garden Reach Crescent',
    city: 'community',
    lat: 30.8850,
    lng: 75.7890,
    connector_type: '15A-3Pin',
    power_kw: 3.3,
    hourly_rate: 13.0,
    is_available: false,
    available_hours: '06:00 AM - 09:00 PM',
    photo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    amenities: ['Surge Protector', 'Garden Seating', 'Pet Friendly'],
    rating: 4.6,
    reviews_count: 14,
    compatibility: '15A 3-pin Portable EVSEs',
    surge_guarantee: true
  },
  {
    id: 12,
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    title: 'Expressway Plaza Port',
    tagline: 'Prime spot near arterial roadway with seamless street access',
    address: '3 Expressway Plaza, Pine Ridge',
    city: 'community',
    lat: 30.8580,
    lng: 75.8230,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 21.0,
    is_available: true,
    available_hours: '06:00 AM - 11:00 PM',
    photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    amenities: ['Highway Proximity', 'Heavy Amperage Wiring', 'CCTV Monitor'],
    rating: 4.9,
    reviews_count: 27,
    compatibility: 'Tata Nexon, Curvv EV, MG ZS EV',
    surge_guarantee: true
  },
  {
    id: 13,
    host_id: 'user_host_2',
    host_name: 'Gurmeet Kaur',
    title: 'Sunset Ridge Solar Wallbox',
    tagline: 'Surplus solar rooftop microgrid with smart load balancing',
    address: '50 Sunset Ridge Road',
    city: 'community',
    lat: 30.9030,
    lng: 75.8380,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 19.0,
    is_available: true,
    available_hours: '07:00 AM - 07:00 PM (Solar Hours)',
    photo: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80',
    amenities: ['10 kW Solar Array', 'Clean Inverter Output', 'Shaded Bay'],
    rating: 5.0,
    reviews_count: 35,
    compatibility: 'All Modern Type-2 Vehicles',
    surge_guarantee: true
  },
  {
    id: 14,
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    title: 'Northgate Streetfront Socket',
    tagline: 'Compact driveway charging point for northern neighborhoods',
    address: '14 Northgate Avenue',
    city: 'community',
    lat: 30.9280,
    lng: 75.8320,
    connector_type: '15A-3Pin',
    power_kw: 3.3,
    hourly_rate: 12.0,
    is_available: true,
    available_hours: '24 Hours Open',
    photo: 'https://images.unsplash.com/photo-1558441719-8b489c63f736?auto=format&fit=crop&w=800&q=80',
    amenities: ['Streetfront Parking', 'Lockable Socket Box', 'Illuminated Bay'],
    rating: 4.6,
    reviews_count: 11,
    compatibility: 'Comet, 2-Wheelers & 3-Wheelers',
    surge_guarantee: true
  },
  {
    id: 15,
    host_id: 'user_host_2',
    host_name: 'Gurmeet Kaur',
    title: 'Tech Quarter Campus Hub',
    tagline: 'High-current charging point near tech park entrance',
    address: '9 Campus Circle, Tech Quarter',
    city: 'community',
    lat: 30.8710,
    lng: 75.8620,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 20.0,
    is_available: true,
    available_hours: '06:00 AM - 10:00 PM',
    photo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    amenities: ['Campus Proximity', 'Resting Bench', 'Drinking Water'],
    rating: 4.8,
    reviews_count: 23,
    compatibility: 'Tata Nexon, Curvv EV, MG Windsor',
    surge_guarantee: true
  }
];

// Seed Bookings
const SEED_BOOKINGS = [
  {
    id: 'PM-8921',
    charger_id: 1,
    charger_title: 'Green Park Driveway Wallbox',
    charger_address: '84 Main Market Avenue, Green Park',
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    user_id: 'user_chargee_1',
    user_name: 'Amanjot Virdi',
    user_phone: '+91 98888 12345',
    user_vehicle: 'Tata Nexon EV (EV-DRIVE-2026)',
    date: '2026-11-16',
    time_slot: '08:00 PM - 10:00 PM',
    duration_hours: 2,
    hourly_rate: 22.0,
    base_cost: 44.0,
    platform_fee: 4.4,
    total_amount: 48.4,
    pin: '8492',
    status: 'completed',
    payment_method: 'UPI',
    payment_status: 'Paid',
    created_at: '2026-11-16T18:30:00Z',
    reviewed: false
  },
  {
    id: 'PM-9042',
    charger_id: 2,
    charger_title: 'Central Boulevard Fast AC Port',
    charger_address: '312 Central Boulevard, Block C',
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    user_id: 'user_chargee_1',
    user_name: 'Amanjot Virdi',
    user_phone: '+91 98888 12345',
    user_vehicle: 'Tata Nexon EV (EV-DRIVE-2026)',
    date: '2026-11-18',
    time_slot: '06:00 PM - 09:00 PM',
    duration_hours: 3,
    hourly_rate: 20.0,
    base_cost: 60.0,
    platform_fee: 6.0,
    total_amount: 66.0,
    pin: '4318',
    status: 'upcoming',
    payment_method: 'PlugMate Community Escrow',
    payment_status: 'Held in Escrow',
    created_at: '2026-11-17T10:15:00Z',
    reviewed: false
  },
  {
    id: 'PM-7810',
    charger_id: 3,
    charger_title: 'University Enclave Solar Plug',
    charger_address: '18 University Road, West Enclave',
    host_id: 'user_host_2',
    host_name: 'Gurmeet Kaur',
    user_id: 'user_chargee_1',
    user_name: 'Amanjot Virdi',
    user_phone: '+91 98888 12345',
    user_vehicle: 'Tata Nexon EV (EV-DRIVE-2026)',
    date: '2026-11-12',
    time_slot: '02:00 PM - 04:00 PM',
    duration_hours: 2,
    hourly_rate: 13.0,
    base_cost: 26.0,
    platform_fee: 2.6,
    total_amount: 28.6,
    pin: '2194',
    status: 'completed',
    payment_method: 'Card Payment',
    payment_status: 'Paid',
    created_at: '2026-11-12T13:00:00Z',
    reviewed: true,
    review_rating: 5,
    review_comment: 'Host was welcoming! Her solar charger ran smoothly and filled my Nexon up with clean green energy.'
  }
];

// Seed Reviews
const SEED_REVIEWS = [
  {
    id: 1,
    charger_id: 1,
    booking_id: 'PM-7701',
    user_name: 'Navdeep Gill',
    rating: 5,
    date: '2026-11-10',
    tags: ['Safe at night', 'Friendly host', 'Reliable power'],
    comment: 'The host made sure the driveway gate was ready when I arrived at 10 PM. Smooth 7.4 kW charge.'
  },
  {
    id: 2,
    charger_id: 1,
    booking_id: 'PM-7755',
    user_name: 'Simranjeet Singh',
    rating: 5,
    date: '2026-11-05',
    tags: ['Clean driveway', 'Easy access'],
    comment: 'Much better than waiting in line at commercial stations. Sharing driveway plugs is a lifesaver for apartment owners.'
  },
  {
    id: 3,
    charger_id: 3,
    booking_id: 'PM-7810',
    user_name: 'Amanjot Virdi',
    rating: 5,
    date: '2026-11-12',
    tags: ['Green energy', 'Solar power', 'Quiet porch'],
    comment: 'Host was courteous and responsive. Clean solar charge directly into my car.'
  }
];

// -------------------------------------------------------------
// PlugMate Storage Layer Implementation
// -------------------------------------------------------------
const VoltData = {
  // Initialize LocalStorage with seed data if not present
  init() {
    // If old voltshare keys exist and plugmate doesn't, migrate them
    if (!localStorage.getItem(PLUGMATE_STORAGE_KEYS.CHARGERS)) {
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.CHARGERS, JSON.stringify(SEED_CHARGERS));
    }
    // Also sync to legacy voltshare keys for complete backward compatibility
    localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, localStorage.getItem(PLUGMATE_STORAGE_KEYS.CHARGERS));

    if (!localStorage.getItem(PLUGMATE_STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
    }
    localStorage.setItem(VOLT_STORAGE_KEYS.BOOKINGS, localStorage.getItem(PLUGMATE_STORAGE_KEYS.BOOKINGS));

    if (!localStorage.getItem(PLUGMATE_STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.REVIEWS, JSON.stringify(SEED_REVIEWS));
    }
    localStorage.setItem(VOLT_STORAGE_KEYS.REVIEWS, localStorage.getItem(PLUGMATE_STORAGE_KEYS.REVIEWS));

    if (!localStorage.getItem(PLUGMATE_STORAGE_KEYS.USERS)) {
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    }
    localStorage.setItem(VOLT_STORAGE_KEYS.USERS, localStorage.getItem(PLUGMATE_STORAGE_KEYS.USERS));

    if (!localStorage.getItem(PLUGMATE_STORAGE_KEYS.CURRENT_USER)) {
      // Check if voltshare has a signed in user (e.g. from clerk sync)
      const existingUser = localStorage.getItem(VOLT_STORAGE_KEYS.CURRENT_USER);
      if (existingUser) {
        localStorage.setItem(PLUGMATE_STORAGE_KEYS.CURRENT_USER, existingUser);
      } else {
        localStorage.setItem(PLUGMATE_STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
        localStorage.setItem(VOLT_STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
      }
    }
  },

  // Reset to initial clean seeds
  resetToSeed() {
    localStorage.setItem(PLUGMATE_STORAGE_KEYS.CHARGERS, JSON.stringify(SEED_CHARGERS));
    localStorage.setItem(PLUGMATE_STORAGE_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
    localStorage.setItem(PLUGMATE_STORAGE_KEYS.REVIEWS, JSON.stringify(SEED_REVIEWS));
    localStorage.setItem(PLUGMATE_STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(PLUGMATE_STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));

    localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, JSON.stringify(SEED_CHARGERS));
    localStorage.setItem(VOLT_STORAGE_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
    localStorage.setItem(VOLT_STORAGE_KEYS.REVIEWS, JSON.stringify(SEED_REVIEWS));
    localStorage.setItem(VOLT_STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(VOLT_STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
  },

  // Users & Auth
  getUsers() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(PLUGMATE_STORAGE_KEYS.USERS)) || SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  },

  getCurrentUser() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(PLUGMATE_STORAGE_KEYS.CURRENT_USER)) || SEED_USERS[0];
    } catch {
      return SEED_USERS[0];
    }
  },

  setCurrentUser(user) {
    localStorage.setItem(PLUGMATE_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(VOLT_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
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
    let existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      existing.role = role;
      this.setCurrentUser(existing);
      return existing;
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '+91 98765 00000',
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
    this.setCurrentUser(SEED_USERS[0]);
  },

  // Chargers
  getChargers() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(PLUGMATE_STORAGE_KEYS.CHARGERS)) || SEED_CHARGERS;
    } catch {
      return SEED_CHARGERS;
    }
  },

  getChargerById(id) {
    const chargers = this.getChargers();
    return chargers.find(c => c.id === Number(id)) || null;
  },

  addCharger(chargerData) {
    const chargers = this.getChargers();
    const newId = chargers.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const newCharger = {
      id: newId,
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
    return newCharger;
  },

  updateCharger(id, updatedFields) {
    const chargers = this.getChargers();
    const idx = chargers.findIndex(c => c.id === Number(id));
    if (idx !== -1) {
      chargers[idx] = { ...chargers[idx], ...updatedFields };
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.CHARGERS, JSON.stringify(chargers));
      localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, JSON.stringify(chargers));
      return chargers[idx];
    }
    return null;
  },

  deleteCharger(id) {
    let chargers = this.getChargers();
    chargers = chargers.filter(c => c.id !== Number(id));
    localStorage.setItem(PLUGMATE_STORAGE_KEYS.CHARGERS, JSON.stringify(chargers));
    localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, JSON.stringify(chargers));
  },

  // Bookings
  getBookings() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(PLUGMATE_STORAGE_KEYS.BOOKINGS)) || SEED_BOOKINGS;
    } catch {
      return SEED_BOOKINGS;
    }
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
      return booking;
    }
    return null;
  },

  // Reviews
  getReviews(chargerId = null) {
    this.init();
    try {
      const reviews = JSON.parse(localStorage.getItem(PLUGMATE_STORAGE_KEYS.REVIEWS)) || SEED_REVIEWS;
      if (chargerId !== null) {
        return reviews.filter(r => r.charger_id === Number(chargerId));
      }
      return reviews;
    } catch {
      return SEED_REVIEWS;
    }
  },

  addReview(bookingId, chargerId, rating, comment, tags = []) {
    const reviews = this.getReviews();
    const currentUser = this.getCurrentUser();

    const newReview = {
      id: Date.now(),
      charger_id: Number(chargerId),
      booking_id: bookingId,
      user_name: currentUser.name,
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

    return newReview;
  }
};

// Aliases for compatibility
window.PlugMateData = VoltData;
window.VoltData = VoltData;

// Auto-run init
VoltData.init();
