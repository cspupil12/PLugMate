/**
 * VoltShare — Peer-to-Peer Community EV Charger Sharing
 * Shared LocalStorage Data Layer & Demo Seed Engine
 * Context: Ludhiana, Punjab Community EV Charging Prototype
 */

const VOLT_STORAGE_KEYS = {
  CHARGERS: 'voltshare_chargers_v1',
  BOOKINGS: 'voltshare_bookings_v1',
  REVIEWS: 'voltshare_reviews_v1',
  CURRENT_USER: 'voltshare_current_user_v1',
  USERS: 'voltshare_users_v1'
};

// 3 Realistic Prototype Demo Users
const SEED_USERS = [
  {
    id: 'user_chargee_1',
    name: 'Amanjot Virdi',
    email: 'aman@voltshare.in',
    phone: '+91 98888 12345',
    role: 'chargee',
    vehicle: {
      make: 'Tata',
      model: 'Nexon EV Empowered+',
      reg_no: 'PB-10-AZ-4521',
      connector: 'Type-2 AC',
      battery_kwh: 40.5
    },
    address: 'Flat 402, Green Avenue, Pakhowal Rd, Ludhiana (No Driveway Parking)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'
  },
  {
    id: 'user_host_1',
    name: 'Harpreet Singh',
    email: 'harpreet@voltshare.in',
    phone: '+91 98765 43210',
    role: 'host',
    rating: 4.9,
    reviewsCount: 38,
    badge: 'Punjab DISCOM Verified Host',
    address: 'Kothi 142-A, Sarabha Nagar, Ludhiana',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80'
  },
  {
    id: 'user_host_2',
    name: 'Gurmeet Kaur',
    email: 'gurmeet@voltshare.in',
    phone: '+91 98123 45678',
    role: 'host',
    rating: 5.0,
    reviewsCount: 42,
    badge: 'Solar Rooftop Certified Host',
    address: 'Bungalow 7, Ferozepur Road PAU Enclave, Ludhiana',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80'
  }
];

// 15 Realistic Community EV Chargers in Ludhiana (Punjab)
const SEED_CHARGERS = [
  {
    id: 1,
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    title: 'Sarabha Nagar Green Driveway Wallbox',
    tagline: 'Gated wide porch with shade, 5 mins from Kip\'s Market',
    address: 'House 84, Main Market Road, Sarabha Nagar, Ludhiana',
    city: 'ludhiana',
    lat: 30.8872,
    lng: 75.8115,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 22.0,
    is_available: true,
    available_hours: '06:00 AM - 11:30 PM',
    photo: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
    amenities: ['Gated Driveway', 'CCTV 24/7', 'Covered Porch', 'Drinking Water', 'Restroom'],
    rating: 4.9,
    reviews_count: 32,
    compatibility: 'Tata Nexon/Curvv, MG ZS/Windsor, Hyundai Ioniq, Mahindra XUV400',
    surge_guarantee: true
  },
  {
    id: 2,
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    title: 'BRS Nagar Block C Fast AC Socket',
    tagline: 'Convenient overnight spot for non-driveway townhomes',
    address: 'Plot 312, Block C, Bhai Randhir Singh Nagar, Ludhiana',
    city: 'ludhiana',
    lat: 30.8790,
    lng: 75.7950,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 20.0,
    is_available: true,
    available_hours: '24 Hours Open',
    photo: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
    amenities: ['Street Lamp Security', 'Wide Gate Entry', 'Automatic Cutoff Meter'],
    rating: 4.8,
    reviews_count: 24,
    compatibility: 'All Type-2 4-Wheelers & 3-Wheelers',
    surge_guarantee: true
  },
  {
    id: 3,
    host_id: 'user_host_2',
    host_name: 'Gurmeet Kaur',
    title: 'PAU Gate 2 Solar Powered Plug',
    tagline: 'Clean 100% solar surplus charging right on Ferozepur Road',
    address: 'Kothi 18, Opp. PAU Gate 2, Ferozepur Road, Ludhiana',
    city: 'ludhiana',
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
    title: 'Model Town Ext. High-Power AC',
    tagline: '11 kW 3-phase commercial grade home wallbox for quick turnarounds',
    address: 'Lane 4, Model Town Extension, Ludhiana',
    city: 'ludhiana',
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
    compatibility: 'BYD Atto 3/Seals, Hyundai Ioniq 5, Kia EV6, Audi e-tron',
    surge_guarantee: true
  },
  {
    id: 5,
    host_id: 'user_host_2',
    host_name: 'Gurmeet Kaur',
    title: 'Civil Lines Heritage Porch Socket',
    tagline: 'Quiet residential porch opposite Rakh Bagh',
    address: '14 Rakh Bagh Enclave, Civil Lines, Ludhiana',
    city: 'ludhiana',
    lat: 30.9080,
    lng: 75.8450,
    connector_type: '15A-3Pin',
    power_kw: 3.3,
    hourly_rate: 12.0,
    is_available: true,
    available_hours: '08:00 AM - 08:00 PM',
    photo: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    amenities: ['Shaded Carport', 'Tea / Water Provided', 'WiFi Access'],
    rating: 4.7,
    reviews_count: 15,
    compatibility: 'All 15A Industrial Plug EV Chargers',
    surge_guarantee: true
  },
  {
    id: 6,
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    title: 'Gurdev Nagar Quiet Porch',
    tagline: 'Secure gated lane, walking distance to Malhar Road eateries',
    address: 'Kothi 55, Gurdev Nagar, Ludhiana',
    city: 'ludhiana',
    lat: 30.8995,
    lng: 75.8290,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 22.0,
    is_available: false, // Currently in use to showcase "Busy / In-use" status
    available_hours: '07:00 AM - 11:00 PM',
    photo: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
    amenities: ['Gated Community', 'Guard on Gate', 'Security Lighting'],
    rating: 4.9,
    reviews_count: 28,
    compatibility: 'Type-2 4-Wheelers',
    surge_guarantee: true
  },
  {
    id: 7,
    host_id: 'user_host_2',
    host_name: 'Gurmeet Kaur',
    title: 'South City Canal Road Rapid Haven',
    tagline: 'High speed DC fast point for long-trip commuters near canal',
    address: 'Villa 108, South City Canal Road, Ludhiana',
    city: 'ludhiana',
    lat: 30.9250,
    lng: 75.7720,
    connector_type: 'CCS-2 DC',
    power_kw: 22.0,
    hourly_rate: 38.0,
    is_available: true,
    available_hours: '24 Hours Open',
    photo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    amenities: ['High-Power CCS-2', 'Lounge Waiting Area', 'Washroom', 'EV Tire Inflator'],
    rating: 5.0,
    reviews_count: 53,
    compatibility: 'All CCS-2 DC Fast Capable EVs',
    surge_guarantee: true
  },
  {
    id: 8,
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    title: 'Dugri Phase 1 Community Plug',
    tagline: 'Affordable overnight top-ups for South Ludhiana residents',
    address: 'Plot 72, Main Road, Dugri Phase 1, Ludhiana',
    city: 'ludhiana',
    lat: 30.8650,
    lng: 75.8480,
    connector_type: '15A-3Pin',
    power_kw: 3.3,
    hourly_rate: 14.0,
    is_available: true,
    available_hours: '06:00 PM - 08:00 AM (Overnight Special)',
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
    title: 'Kitchlu Nagar Eco Point',
    tagline: 'Quiet residential porch near Tagore Nagar crossing',
    address: 'House 22, Block A, Kitchlu Nagar, Ludhiana',
    city: 'ludhiana',
    lat: 30.9180,
    lng: 75.8150,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 20.0,
    is_available: true,
    available_hours: '07:00 AM - 10:30 PM',
    photo: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    amenities: ['Gated Lawn', 'Type-2 Tethered Cable', 'Fire Extinguisher'],
    rating: 4.8,
    reviews_count: 21,
    compatibility: 'Type-2 AC Standard',
    surge_guarantee: true
  },
  {
    id: 10,
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    title: 'Rajguru Nagar Gated Haven',
    tagline: 'Wide paved driveway inside secure gated society',
    address: 'House 410, Block D, Rajguru Nagar, Ludhiana',
    city: 'ludhiana',
    lat: 30.8720,
    lng: 75.7820,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 23.0,
    is_available: true,
    available_hours: '24 Hours Open',
    photo: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    amenities: ['24x7 Security Guard', 'Dedicated Parking Bay', 'Tethered 5m Cable'],
    rating: 4.9,
    reviews_count: 31,
    compatibility: 'Type-2 AC 4-Wheelers',
    surge_guarantee: true
  },
  {
    id: 11,
    host_id: 'user_host_2',
    host_name: 'Gurmeet Kaur',
    title: 'Aggar Nagar Block B Eco Socket',
    tagline: 'Low noise charging port next to community garden',
    address: 'B-89, Aggar Nagar, Ludhiana',
    city: 'ludhiana',
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
    title: 'Pakhowal Road Boulevard Port',
    tagline: 'Prime spot right on Pakhowal expressway, easy access',
    address: 'Highway Plaza Villa 3, Pakhowal Road, Ludhiana',
    city: 'ludhiana',
    lat: 30.8580,
    lng: 75.8230,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 21.0,
    is_available: true,
    available_hours: '06:00 AM - 11:00 PM',
    photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    amenities: ['Expressway Entrance', 'High Amperage Wiring', 'CCTV Monitor'],
    rating: 4.9,
    reviews_count: 27,
    compatibility: 'Tata Nexon, Curvv EV, MG ZS EV',
    surge_guarantee: true
  },
  {
    id: 13,
    host_id: 'user_host_2',
    host_name: 'Gurmeet Kaur',
    title: 'Shastri Nagar Solar Wallbox',
    tagline: '100% solar microgrid powered with smart load sharing',
    address: 'House 50, Shastri Nagar, Near Railway Crossing, Ludhiana',
    city: 'ludhiana',
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
    title: 'Haibowal Kalan Streetfront Socket',
    tagline: 'Compact driveway charging point for North Ludhiana commuters',
    address: 'Main Bazaar Road, Haibowal Kalan, Ludhiana',
    city: 'ludhiana',
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
    title: 'Gill Road Industrial Link Hub',
    tagline: 'Reliable high current point near GNDEC engineering college',
    address: 'Near GNDEC Campus, Gill Road, Ludhiana',
    city: 'ludhiana',
    lat: 30.8710,
    lng: 75.8620,
    connector_type: 'Type-2 AC',
    power_kw: 7.4,
    hourly_rate: 20.0,
    is_available: true,
    available_hours: '06:00 AM - 10:00 PM',
    photo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    amenities: ['Adjacent to College Gate', 'Resting Bench', 'Cold Drinking Water'],
    rating: 4.8,
    reviews_count: 23,
    compatibility: 'Tata Nexon, Curvv EV, MG Windsor',
    surge_guarantee: true
  }
];

// Seed Bookings
const SEED_BOOKINGS = [
  {
    id: 'VS-LDH-8921',
    charger_id: 1,
    charger_title: 'Sarabha Nagar Green Driveway Wallbox',
    charger_address: 'House 84, Main Market Road, Sarabha Nagar, Ludhiana',
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    user_id: 'user_chargee_1',
    user_name: 'Amanjot Virdi',
    user_phone: '+91 98888 12345',
    user_vehicle: 'Tata Nexon EV (PB-10-AZ-4521)',
    date: '2026-11-16',
    time_slot: '08:00 PM - 10:00 PM',
    duration_hours: 2,
    hourly_rate: 22.0,
    base_cost: 44.0,
    platform_fee: 4.4,
    total_amount: 48.4,
    pin: '8492',
    status: 'completed', // completed, upcoming, cancelled
    payment_method: 'UPI (Google Pay)',
    payment_status: 'Paid',
    created_at: '2026-11-16T18:30:00Z',
    reviewed: false
  },
  {
    id: 'VS-LDH-9042',
    charger_id: 2,
    charger_title: 'BRS Nagar Block C Fast AC Socket',
    charger_address: 'Plot 312, Block C, Bhai Randhir Singh Nagar, Ludhiana',
    host_id: 'user_host_1',
    host_name: 'Harpreet Singh',
    user_id: 'user_chargee_1',
    user_name: 'Amanjot Virdi',
    user_phone: '+91 98888 12345',
    user_vehicle: 'Tata Nexon EV (PB-10-AZ-4521)',
    date: '2026-11-18',
    time_slot: '06:00 PM - 09:00 PM',
    duration_hours: 3,
    hourly_rate: 20.0,
    base_cost: 60.0,
    platform_fee: 6.0,
    total_amount: 66.0,
    pin: '4318',
    status: 'upcoming',
    payment_method: 'VoltShare Community Escrow (UPI)',
    payment_status: 'Held in Escrow',
    created_at: '2026-11-17T10:15:00Z',
    reviewed: false
  },
  {
    id: 'VS-LDH-7810',
    charger_id: 3,
    charger_title: 'PAU Gate 2 Solar Powered Plug',
    charger_address: 'Kothi 18, Opp. PAU Gate 2, Ferozepur Road, Ludhiana',
    host_id: 'user_host_2',
    host_name: 'Gurmeet Kaur',
    user_id: 'user_chargee_1',
    user_name: 'Amanjot Virdi',
    user_phone: '+91 98888 12345',
    user_vehicle: 'Tata Nexon EV (PB-10-AZ-4521)',
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
    review_comment: 'Gurmeet ji was super courteous! Her solar charger ran smoothly and filled my Nexon up with clean green energy.'
  }
];

// Seed Reviews
const SEED_REVIEWS = [
  {
    id: 1,
    charger_id: 1,
    booking_id: 'VS-LDH-7701',
    user_name: 'Navdeep Gill',
    rating: 5,
    date: '2026-11-10',
    tags: ['Safe at night', 'Friendly host', 'Fast charging'],
    comment: 'Harpreet uncle made sure the driveway gate was unlocked when I arrived at 10 PM. Clean 7.4 kW charge, no voltage drops!'
  },
  {
    id: 2,
    charger_id: 1,
    booking_id: 'VS-LDH-7755',
    user_name: 'Simranjeet Singh',
    rating: 5,
    date: '2026-11-05',
    tags: ['Clean driveway', 'Easy access'],
    comment: 'Much better than waiting at public commercial fast chargers. Neighborhood charger sharing is a lifesaver for apartment dwellers.'
  },
  {
    id: 3,
    charger_id: 3,
    booking_id: 'VS-LDH-7810',
    user_name: 'Amanjot Virdi',
    rating: 5,
    date: '2026-11-12',
    tags: ['Green energy', 'Solar power', 'Quiet porch'],
    comment: 'Gurmeet ji was super courteous! Her solar charger ran smoothly and filled my Nexon up with clean green energy.'
  }
];

// -------------------------------------------------------------
// Storage Layer Implementation
// -------------------------------------------------------------
const VoltData = {
  // Initialize LocalStorage with seed data if not present
  init() {
    if (!localStorage.getItem(VOLT_STORAGE_KEYS.CHARGERS)) {
      localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, JSON.stringify(SEED_CHARGERS));
    }
    if (!localStorage.getItem(VOLT_STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(VOLT_STORAGE_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
    }
    if (!localStorage.getItem(VOLT_STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(VOLT_STORAGE_KEYS.REVIEWS, JSON.stringify(SEED_REVIEWS));
    }
    if (!localStorage.getItem(VOLT_STORAGE_KEYS.USERS)) {
      localStorage.setItem(VOLT_STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(VOLT_STORAGE_KEYS.CURRENT_USER)) {
      // Default to Chargee Amanjot
      localStorage.setItem(VOLT_STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
    }
  },

  // Reset to initial demo seeds (Crucial for live exhibition presentations!)
  resetToSeed() {
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
      return JSON.parse(localStorage.getItem(VOLT_STORAGE_KEYS.USERS)) || SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  },

  getCurrentUser() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(VOLT_STORAGE_KEYS.CURRENT_USER)) || SEED_USERS[0];
    } catch {
      return SEED_USERS[0];
    }
  },

  setCurrentUser(user) {
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
      this.setCurrentUser(existing);
      return existing;
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '+91 98765 00000',
      role: role, // 'chargee' or 'host'
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80`,
      vehicle: role === 'chargee' ? (vehicle || {
        make: 'EV Owner',
        model: 'Electric Car',
        reg_no: 'PB-10-TEMP',
        connector: 'Type-2 AC',
        battery_kwh: 35.0
      }) : null,
      address: 'Ludhiana, Punjab',
      rating: 5.0,
      reviewsCount: 0
    };

    users.push(newUser);
    localStorage.setItem(VOLT_STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return newUser;
  },

  logout() {
    // Reset to default chargee
    this.setCurrentUser(SEED_USERS[0]);
  },

  // Chargers
  getChargers() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(VOLT_STORAGE_KEYS.CHARGERS)) || SEED_CHARGERS;
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
      photo: chargerData.photo || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
      amenities: chargerData.amenities || ['Gated Driveway', 'CCTV Monitor'],
      ...chargerData
    };
    chargers.unshift(newCharger);
    localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, JSON.stringify(chargers));
    return newCharger;
  },

  updateCharger(id, updatedFields) {
    const chargers = this.getChargers();
    const idx = chargers.findIndex(c => c.id === Number(id));
    if (idx !== -1) {
      chargers[idx] = { ...chargers[idx], ...updatedFields };
      localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, JSON.stringify(chargers));
      return chargers[idx];
    }
    return null;
  },

  deleteCharger(id) {
    let chargers = this.getChargers();
    chargers = chargers.filter(c => c.id !== Number(id));
    localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, JSON.stringify(chargers));
  },

  // Bookings
  getBookings() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(VOLT_STORAGE_KEYS.BOOKINGS)) || SEED_BOOKINGS;
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
      id: `VS-LDH-${randomSuffix}`,
      pin: `${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'upcoming',
      payment_status: 'Held in Escrow',
      reviewed: false,
      created_at: new Date().toISOString(),
      ...bookingPayload
    };
    bookings.unshift(newBooking);
    localStorage.setItem(VOLT_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return newBooking;
  },

  cancelBooking(id) {
    const bookings = this.getBookings();
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'cancelled';
      booking.payment_status = 'Refunded to Source (₹' + booking.total_amount + ')';
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
      localStorage.setItem(VOLT_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      return booking;
    }
    return null;
  },

  // Reviews
  getReviews(chargerId = null) {
    this.init();
    try {
      const reviews = JSON.parse(localStorage.getItem(VOLT_STORAGE_KEYS.REVIEWS)) || SEED_REVIEWS;
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
    localStorage.setItem(VOLT_STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

    // Mark booking as reviewed
    const bookings = this.getBookings();
    const b = bookings.find(x => x.id === bookingId);
    if (b) {
      b.reviewed = true;
      b.review_rating = Number(rating);
      b.review_comment = comment.trim();
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

// Auto-run init
VoltData.init();
