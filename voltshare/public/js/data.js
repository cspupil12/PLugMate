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

// Purge any legacy mock seed data from browser localStorage
(function purgeLegacyMockData() {
  try {
    const cur = localStorage.getItem(PLUGMATE_STORAGE_KEYS.CURRENT_USER);
    if (cur && (cur.includes('user_chargee_1') || cur.includes('Amanjot'))) {
      localStorage.removeItem(PLUGMATE_STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(VOLT_STORAGE_KEYS.CURRENT_USER);
    }
    const ch = localStorage.getItem(PLUGMATE_STORAGE_KEYS.CHARGERS);
    if (ch && ch.includes('user_host_1')) {
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.CHARGERS, '[]');
      localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, '[]');
    }
    const bk = localStorage.getItem(PLUGMATE_STORAGE_KEYS.BOOKINGS);
    if (bk && bk.includes('PM-8921')) {
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.BOOKINGS, '[]');
      localStorage.setItem(VOLT_STORAGE_KEYS.BOOKINGS, '[]');
    }
    const rv = localStorage.getItem(PLUGMATE_STORAGE_KEYS.REVIEWS);
    if (rv && rv.includes('Navdeep Gill')) {
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.REVIEWS, '[]');
      localStorage.setItem(VOLT_STORAGE_KEYS.REVIEWS, '[]');
    }
  } catch (e) { }
})();

// -------------------------------------------------------------
// PlugMate Storage Layer Implementation
// -------------------------------------------------------------
const VoltData = {
  _hasSynced: false,
  _backendOffline: false,

  // Robust API fetch helper that avoids console spam when running without backend proxy
  async _fetchApi(path, options = {}) {
    if (this._backendOffline || API_BASE === null) return null;
    try {
      const url = `${API_BASE}${path}`;
      const res = await fetch(url, options);
      if (res.status === 404) {
        this._backendOffline = true;
        return null;
      }
      return res;
    } catch (e) {
      this._backendOffline = true;
      return null;
    }
  },

  // Initialize storage structures (clean, zero mock data)
  init() {
    if (!localStorage.getItem(PLUGMATE_STORAGE_KEYS.CHARGERS)) {
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.CHARGERS, '[]');
    }
    localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, localStorage.getItem(PLUGMATE_STORAGE_KEYS.CHARGERS));

    if (!localStorage.getItem(PLUGMATE_STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(PLUGMATE_STORAGE_KEYS.BOOKINGS, '[]');
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
    if (this._hasSynced || this._backendOffline || API_BASE === null) return;
    this._hasSynced = true;

    try {
      // Probe health endpoint first; if down or static server 404, gracefully stop
      const health = await this._fetchApi('/api/health');
      if (!health || !health.ok) {
        this._backendOffline = true;
        return;
      }
    } catch (e) {
      this._backendOffline = true;
      return;
    }

    try {
      const res = await this._fetchApi('/api/chargers');
      if (res && res.ok) {
        const cloudChargers = await res.json();
        if (Array.isArray(cloudChargers)) {
          localStorage.setItem(PLUGMATE_STORAGE_KEYS.CHARGERS, JSON.stringify(cloudChargers));
          localStorage.setItem(VOLT_STORAGE_KEYS.CHARGERS, JSON.stringify(cloudChargers));
        }
      }
    } catch (e) { }

    try {
      const res = await this._fetchApi('/api/bookings');
      if (res && res.ok) {
        const cloudBookings = await res.json();
        if (Array.isArray(cloudBookings)) {
          localStorage.setItem(PLUGMATE_STORAGE_KEYS.BOOKINGS, JSON.stringify(cloudBookings));
          localStorage.setItem(VOLT_STORAGE_KEYS.BOOKINGS, JSON.stringify(cloudBookings));
        }
      }
    } catch (e) { }

    try {
      const res = await this._fetchApi('/api/reviews');
      if (res && res.ok) {
        const cloudReviews = await res.json();
        if (Array.isArray(cloudReviews)) {
          localStorage.setItem(PLUGMATE_STORAGE_KEYS.REVIEWS, JSON.stringify(cloudReviews));
          localStorage.setItem(VOLT_STORAGE_KEYS.REVIEWS, JSON.stringify(cloudReviews));
        }
      }
    } catch (e) { }
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
      return;
    }
    localStorage.setItem(PLUGMATE_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(VOLT_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    if (user.id) {
      this._fetchApi('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
    }
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
      return JSON.parse(localStorage.getItem(PLUGMATE_STORAGE_KEYS.CHARGERS)) || [];
    } catch {
      return [];
    }
  },

  getChargerById(id) {
    const chargers = this.getChargers();
    return chargers.find(c => c.id === Number(id)) || null;
  },

  addCharger(chargerData) {
    const chargers = this.getChargers();
    const newId = chargers.reduce((max, c) => Math.max(max, c.id || 0), 0) + 1;
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

    this._fetchApi('/api/chargers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCharger)
    });

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
      return JSON.parse(localStorage.getItem(PLUGMATE_STORAGE_KEYS.BOOKINGS)) || [];
    } catch {
      return [];
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
