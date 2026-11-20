import os
import random
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables (.env.local takes priority for local development)
load_dotenv('.env.local', override=True)
load_dotenv('.env', override=False)

# Initialize Flask
app = Flask(__name__, static_folder='voltshare/public', static_url_path='')
CORS(app)

# Supabase Credentials
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = (
    os.environ.get("SUPABASE_PUBLISHABLE_KEY") or 
    os.environ.get("SUPABASE_ANON_KEY") or 
    os.environ.get("SUPABASE_KEY")
)

supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client, Client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"[PlugMate] Connected to Supabase at: {SUPABASE_URL}")
    except Exception as e:
        print(f"[PlugMate] Supabase initialization notice: {e}")
else:
    print("[PlugMate] Notice: SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY not set in .env yet.")
    print("[PlugMate] Running in local demo mode with instant fallback. Add credentials to .env to persist to Supabase cloud.")

# Default community chargers & bookings for live demo
LOCAL_CHARGERS = [
    {
        "id": 1,
        "host_id": "user_demo_jaspreet",
        "host_name": "Jaspreet Singh (Host)",
        "title": "Green Park Driveway Wallbox",
        "tagline": "7.4 kW Level 2 Fast AC Charger with dedicated shaded parking",
        "address": "House 142, Green Park Avenue, Near Community Centre",
        "city": "community",
        "lat": 30.8895,
        "lng": 75.8140,
        "connector_type": "Type-2 AC (7.4 kW)",
        "power_kw": 7.4,
        "hourly_rate": 22.0,
        "is_available": True,
        "available_hours": "06:00 AM - 11:30 PM",
        "photo": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80",
        "amenities": ["Gated Driveway", "CCTV Monitor", "WiFi Access", "Covered Canopy"],
        "rating": 4.9,
        "reviews_count": 18,
        "compatibility": "Tata Nexon EV, MG ZS EV, Mahindra XUV400, Hyundai Ioniq 5",
        "surge_guarantee": True
    },
    {
        "id": 2,
        "host_id": "user_demo_jaspreet",
        "host_name": "Jaspreet Singh (Host)",
        "title": "Model Town Rapid AC Socket",
        "tagline": "11 kW high-speed 3-phase charger in secure gated residential compound",
        "address": "B-48, Model Town Extension, Opp. Gurdwara",
        "city": "community",
        "lat": 30.8845,
        "lng": 75.8080,
        "connector_type": "Type-2 AC (11 kW)",
        "power_kw": 11.0,
        "hourly_rate": 25.0,
        "is_available": True,
        "available_hours": "24/7 All Day",
        "photo": "https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=800&q=80",
        "amenities": ["24/7 Access", "Security Guard", "Well-lit Area", "Overnight Allowed"],
        "rating": 5.0,
        "reviews_count": 24,
        "compatibility": "All Type-2 AC Compatible EVs",
        "surge_guarantee": True
    },
    {
        "id": 3,
        "host_id": "user_host_rahul",
        "host_name": "Rahul Sharma",
        "title": "Sunrise Villa Smart 15A Socket",
        "tagline": "Economical 3.3 kW socket ideal for two-wheelers and overnight hybrid charging",
        "address": "Plot 12, Sunrise Enclave, Main Road",
        "city": "community",
        "lat": 30.8920,
        "lng": 75.8190,
        "connector_type": "15A Smart Socket (3.3 kW)",
        "power_kw": 3.3,
        "hourly_rate": 14.0,
        "is_available": True,
        "available_hours": "07:00 AM - 10:00 PM",
        "photo": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
        "amenities": ["15A Industrial Plug", "Waterproof Cover", "Ground-Floor Access"],
        "rating": 4.8,
        "reviews_count": 9,
        "compatibility": "Ather, Ola S1, TVS iQube, Nexon EV (portable brick)",
        "surge_guarantee": True
    },
    {
        "id": 4,
        "host_id": "user_host_ananya",
        "host_name": "Ananya Verma",
        "title": "EcoCharge Solar Driveway Port",
        "tagline": "100% Rooftop Solar-powered clean green energy charging",
        "address": "Eco Haven, Street 7, Sector 32",
        "city": "community",
        "lat": 30.8810,
        "lng": 75.8155,
        "connector_type": "Type-2 AC (7.4 kW)",
        "power_kw": 7.4,
        "hourly_rate": 19.0,
        "is_available": True,
        "available_hours": "08:00 AM - 08:00 PM",
        "photo": "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
        "amenities": ["100% Solar Green Energy", "Drinking Water", "EV Rest Bench"],
        "rating": 5.0,
        "reviews_count": 12,
        "compatibility": "All Standard Indian Four-Wheeler EVs",
        "surge_guarantee": True
    },
    {
        "id": 5,
        "host_id": "user_host_vikram",
        "host_name": "Vikram Malhotra",
        "title": "Metro Gate Fast AC Charger",
        "tagline": "22 kW High output commercial grade wallbox inside gated society",
        "address": "Tower 4 Driveway, Metro Greens Society",
        "city": "community",
        "lat": 30.8965,
        "lng": 75.8095,
        "connector_type": "Type-2 AC (22 kW)",
        "power_kw": 22.0,
        "hourly_rate": 28.0,
        "is_available": True,
        "available_hours": "24/7 Gated",
        "photo": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80",
        "amenities": ["22 kW High Speed", "Security Intercom", "Waiting Lounge"],
        "rating": 4.9,
        "reviews_count": 31,
        "compatibility": "Type-2 AC Fast Charging Capable EVs",
        "surge_guarantee": True
    },
    {
        "id": 6,
        "host_id": "user_host_simran",
        "host_name": "Simran Kaur",
        "title": "Lakeview Residency Plug",
        "tagline": "Cozy driveway parking slot with secure 3.3 kW socket and surge protector",
        "address": "House 89, Lakeview Road, Near Club",
        "city": "community",
        "lat": 30.8830,
        "lng": 75.8230,
        "connector_type": "15A Smart Socket (3.3 kW)",
        "power_kw": 3.3,
        "hourly_rate": 15.0,
        "is_available": True,
        "available_hours": "06:00 AM - Midnight",
        "photo": "https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=800&q=80",
        "amenities": ["Surge Protection", "CCTV Covered", "Ample Turning Space"],
        "rating": 4.7,
        "reviews_count": 7,
        "compatibility": "Two-wheelers & Standard 15A Plug-in Vehicles",
        "surge_guarantee": True
    }
]

LOCAL_BOOKINGS = [
    {
        "id": "PM-8821",
        "charger_id": 1,
        "charger_title": "Green Park Driveway Wallbox",
        "charger_address": "House 142, Green Park Avenue",
        "host_id": "user_demo_jaspreet",
        "host_name": "Jaspreet Singh (Host)",
        "user_id": "user_driver_arjun",
        "user_name": "Arjun Mehta",
        "user_phone": "+91 98111 22334",
        "user_vehicle": "Tata Nexon EV Max",
        "date": "2026-11-20",
        "time_slot": "02:00 PM - 04:00 PM",
        "duration_hours": 2.0,
        "hourly_rate": 22.0,
        "total_amount": 48.40,
        "pin": "4821",
        "status": "upcoming",
        "payment_status": "Held in Escrow",
        "connector_type": "Type-2 AC (7.4 kW)",
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "PM-7104",
        "charger_id": 2,
        "charger_title": "Model Town Rapid AC Socket",
        "charger_address": "B-48, Model Town Extension",
        "host_id": "user_demo_jaspreet",
        "host_name": "Jaspreet Singh (Host)",
        "user_id": "user_driver_neha",
        "user_name": "Neha Kapoor",
        "user_phone": "+91 98222 33445",
        "user_vehicle": "MG ZS EV",
        "date": "2026-11-19",
        "time_slot": "06:00 PM - 08:30 PM",
        "duration_hours": 2.5,
        "hourly_rate": 25.0,
        "total_amount": 68.75,
        "pin": "7392",
        "status": "completed",
        "payment_status": "Released to Host",
        "connector_type": "Type-2 AC (11 kW)",
        "created_at": datetime.now().isoformat()
    }
]
LOCAL_REVIEWS = []

# -------------------------------------------------------------
# Static Frontend Serving & Config Endpoint
# -------------------------------------------------------------
@app.route('/js/config.js')
def config_js():
    # Public publishable key only (never secret keys)
    key = os.environ.get('VITE_CLERK_PUBLISHABLE_KEY') or os.environ.get('CLERK_PUBLISHABLE_KEY') or ''
    js_content = f"""
window.__PLUGMATE_CONFIG__ = {{ clerkPublishableKey: '{key}' }};
(function() {{
  var k = '{key}';
  if (!k) return;
  if (document.querySelector('script[data-clerk-publishable-key]')) return;
  var s = document.createElement('script');
  s.setAttribute('data-clerk-publishable-key', k);
  s.src = 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js';
  s.async = true;
  s.crossOrigin = 'anonymous';
  document.head.appendChild(s);
}})();
"""
    response = app.response_class(
        response=js_content.strip(),
        status=200,
        mimetype='application/javascript'
    )
    return response

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(app.static_folder, 'favicon.svg', mimetype='image/svg+xml')

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# -------------------------------------------------------------
# Health Check & Supabase Status
# -------------------------------------------------------------
@app.route('/api/health')
def health():
    return jsonify({
        "status": "online",
        "service": "PlugMate API",
        "supabase_connected": supabase is not None,
        "supabase_url": SUPABASE_URL if supabase else None,
        "timestamp": datetime.now().isoformat()
    })

# -------------------------------------------------------------
# Chargers API
# -------------------------------------------------------------
@app.route('/api/chargers', methods=['GET'])
def get_chargers():
    if supabase:
        try:
            res = supabase.table('chargers').select('*').order('id', desc=False).execute()
            if res.data and len(res.data) > 0:
                return jsonify(res.data)
        except Exception as e:
            print(f"[PlugMate] Supabase fetch chargers error: {e}")
    return jsonify(LOCAL_CHARGERS)

@app.route('/api/chargers/<int:charger_id>', methods=['GET'])
def get_charger(charger_id):
    if supabase:
        try:
            res = supabase.table('chargers').select('*').eq('id', charger_id).single().execute()
            if res.data:
                return jsonify(res.data)
        except Exception as e:
            print(f"[PlugMate] Supabase get charger error: {e}")

    for c in LOCAL_CHARGERS:
        if c['id'] == charger_id:
            return jsonify(c)
    return jsonify({"error": "Charger not found"}), 404

@app.route('/api/chargers', methods=['POST'])
def create_charger():
    payload = request.get_json() or {}
    title = payload.get('title', '').strip()
    address = payload.get('address', '').strip()
    if not title or not address:
        return jsonify({"error": "Title and address are required"}), 400

    new_charger = {
        "host_id": payload.get('host_id', 'user_host_1'),
        "host_name": payload.get('host_name', 'Verified Host'),
        "title": title,
        "tagline": payload.get('tagline', 'Community driveway charger'),
        "address": address,
        "city": payload.get('city', 'community'),
        "lat": float(payload.get('lat', 30.8872 + (random.random() - 0.5) * 0.04)),
        "lng": float(payload.get('lng', 75.8115 + (random.random() - 0.5) * 0.04)),
        "connector_type": payload.get('connector_type', 'Type-2 AC'),
        "power_kw": float(payload.get('power_kw', 7.4)),
        "hourly_rate": float(payload.get('hourly_rate', 22.0)),
        "is_available": True,
        "available_hours": payload.get('available_hours', '06:00 AM - 11:30 PM'),
        "photo": payload.get('photo') or 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
        "amenities": payload.get('amenities') or ['Gated Driveway', 'CCTV Monitor'],
        "rating": 5.0,
        "reviews_count": 0,
        "compatibility": payload.get('compatibility', 'Universal EV Standard'),
        "surge_guarantee": True
    }

    if supabase:
        try:
            res = supabase.table('chargers').insert(new_charger).execute()
            if res.data and len(res.data) > 0:
                return jsonify(res.data[0]), 201
        except Exception as e:
            print(f"[PlugMate] Supabase insert charger error: {e}")

    # Fallback in-memory
    new_charger['id'] = max([c['id'] for c in LOCAL_CHARGERS], default=0) + 1
    LOCAL_CHARGERS.insert(0, new_charger)
    return jsonify(new_charger), 201

@app.route('/api/chargers/<int:charger_id>', methods=['PUT'])
def update_charger(charger_id):
    payload = request.get_json() or {}
    if supabase:
        try:
            res = supabase.table('chargers').update(payload).eq('id', charger_id).execute()
            if res.data and len(res.data) > 0:
                return jsonify(res.data[0])
        except Exception as e:
            print(f"[PlugMate] Supabase update charger error: {e}")

    for idx, c in enumerate(LOCAL_CHARGERS):
        if c['id'] == charger_id:
            LOCAL_CHARGERS[idx].update(payload)
            return jsonify(LOCAL_CHARGERS[idx])
    return jsonify({"error": "Charger not found"}), 404

@app.route('/api/chargers/<int:charger_id>', methods=['DELETE'])
def delete_charger(charger_id):
    if supabase:
        try:
            supabase.table('chargers').delete().eq('id', charger_id).execute()
            return jsonify({"success": True, "id": charger_id})
        except Exception as e:
            print(f"[PlugMate] Supabase delete charger error: {e}")

    global LOCAL_CHARGERS
    LOCAL_CHARGERS = [c for c in LOCAL_CHARGERS if c['id'] != charger_id]
    return jsonify({"success": True, "id": charger_id})

# -------------------------------------------------------------
# Bookings API
# -------------------------------------------------------------
@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    user_id = request.args.get('user_id')
    host_id = request.args.get('host_id')

    if supabase:
        try:
            query = supabase.table('bookings').select('*').order('created_at', desc=True)
            if user_id:
                query = query.eq('user_id', user_id)
            if host_id:
                query = query.eq('host_id', host_id)
            res = query.execute()
            if res.data and len(res.data) > 0:
                return jsonify(res.data)
        except Exception as e:
            print(f"[PlugMate] Supabase get bookings error: {e}")

    # Fallback in-memory
    filtered = list(LOCAL_BOOKINGS)
    if user_id:
        filtered = [b for b in filtered if b.get('user_id') == user_id]
    if host_id:
        filtered = [b for b in filtered if b.get('host_id') == host_id]
    return jsonify(filtered)

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    payload = request.get_json() or {}
    pin = f"{random.randint(1000, 9999)}"
    booking_id = f"PM-{random.randint(1000, 9999)}"

    hours = float(payload.get('duration_hours', 2))
    rate = float(payload.get('hourly_rate', 22.0))
    base_cost = round(hours * rate, 2)
    fee = round(base_cost * 0.10, 2)
    total = round(base_cost + fee, 2)

    new_booking = {
        "id": booking_id,
        "charger_id": int(payload.get('charger_id', 1)),
        "charger_title": payload.get('charger_title', 'Driveway Charger'),
        "charger_address": payload.get('charger_address', 'Neighborhood Street'),
        "host_id": payload.get('host_id', 'user_host_1'),
        "host_name": payload.get('host_name', 'Verified Host'),
        "user_id": payload.get('user_id', 'user_chargee_1'),
        "user_name": payload.get('user_name', 'EV Driver'),
        "user_phone": payload.get('user_phone', '+91 98888 12345'),
        "user_vehicle": payload.get('user_vehicle', 'Electric Car'),
        "date": payload.get('date', datetime.now().strftime('%Y-%m-%d')),
        "time_slot": payload.get('time_slot', '08:00 PM - 10:00 PM'),
        "duration_hours": hours,
        "hourly_rate": rate,
        "base_cost": base_cost,
        "platform_fee": fee,
        "total_amount": total,
        "pin": pin,
        "status": "upcoming",
        "payment_method": payload.get('payment_method', 'PlugMate Escrow'),
        "payment_status": "Held in Escrow",
        "reviewed": False
    }

    if supabase:
        try:
            res = supabase.table('bookings').insert(new_booking).execute()
            if res.data and len(res.data) > 0:
                return jsonify(res.data[0]), 201
        except Exception as e:
            print(f"[PlugMate] Supabase create booking error: {e}")

    LOCAL_BOOKINGS.insert(0, new_booking)
    return jsonify(new_booking), 201

@app.route('/api/bookings/<booking_id>/verify-pin', methods=['POST'])
def verify_pin(booking_id):
    payload = request.get_json() or {}
    entered_pin = str(payload.get('pin', '')).strip()

    booking = None
    if supabase:
        try:
            res = supabase.table('bookings').select('*').eq('id', booking_id).single().execute()
            booking = res.data
        except Exception:
            pass

    if not booking:
        booking = next((b for b in LOCAL_BOOKINGS if b['id'] == booking_id), None)

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if str(booking.get('pin')) != entered_pin:
        return jsonify({"error": "Incorrect PIN. Please ask the driver to show the 4-digit token from their booking screen."}), 400

    updated_fields = {
        "status": "completed",
        "payment_status": "Released to Host"
    }

    if supabase:
        try:
            res = supabase.table('bookings').update(updated_fields).eq('id', booking_id).execute()
            if res.data and len(res.data) > 0:
                return jsonify(res.data[0])
        except Exception as e:
            print(f"[PlugMate] Supabase verify pin update error: {e}")

    booking.update(updated_fields)
    return jsonify(booking)

@app.route('/api/bookings/<booking_id>/cancel', methods=['POST'])
def cancel_booking(booking_id):
    updated_fields = {
        "status": "cancelled",
        "payment_status": "Refunded to Source"
    }

    if supabase:
        try:
            res = supabase.table('bookings').update(updated_fields).eq('id', booking_id).execute()
            if res.data and len(res.data) > 0:
                return jsonify(res.data[0])
        except Exception as e:
            print(f"[PlugMate] Supabase cancel booking error: {e}")

    for b in LOCAL_BOOKINGS:
        if b['id'] == booking_id:
            b.update(updated_fields)
            return jsonify(b)
    return jsonify({"error": "Booking not found"}), 404

# -------------------------------------------------------------
# Reviews API
# -------------------------------------------------------------
@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    charger_id = request.args.get('charger_id')
    if supabase:
        try:
            query = supabase.table('reviews').select('*').order('created_at', desc=True)
            if charger_id:
                query = query.eq('charger_id', int(charger_id))
            res = query.execute()
            if res.data is not None:
                return jsonify(res.data)
        except Exception as e:
            print(f"[PlugMate] Supabase get reviews error: {e}")

    filtered = LOCAL_REVIEWS
    if charger_id:
        filtered = [r for r in filtered if r.get('charger_id') == int(charger_id)]
    return jsonify(filtered)

@app.route('/api/reviews', methods=['POST'])
def add_review():
    payload = request.get_json() or {}
    new_rev = {
        "charger_id": int(payload.get('charger_id', 1)),
        "booking_id": payload.get('booking_id', ''),
        "user_name": payload.get('user_name', 'EV Driver'),
        "rating": int(payload.get('rating', 5)),
        "date": datetime.now().strftime('%Y-%m-%d'),
        "tags": payload.get('tags', []),
        "comment": payload.get('comment', '').strip()
    }

    if supabase:
        try:
            res = supabase.table('reviews').insert(new_rev).execute()
            if res.data and len(res.data) > 0:
                return jsonify(res.data[0]), 201
        except Exception as e:
            print(f"[PlugMate] Supabase add review error: {e}")

    new_rev['id'] = len(LOCAL_REVIEWS) + 1
    LOCAL_REVIEWS.insert(0, new_rev)
    return jsonify(new_rev), 201

# -------------------------------------------------------------
# Users / Profile Sync API (Clerk & Community)
# -------------------------------------------------------------
@app.route('/api/users/sync', methods=['POST'])
def sync_user():
    payload = request.get_json() or {}
    user_id = payload.get('id')
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    user_data = {
        "id": user_id,
        "name": payload.get('name', 'Community User'),
        "email": payload.get('email', ''),
        "phone": payload.get('phone', ''),
        "role": payload.get('role', 'chargee'),
        "avatar": payload.get('avatar', ''),
        "address": payload.get('address', 'Neighborhood'),
        "vehicle": payload.get('vehicle')
    }

    if supabase:
        try:
            res = supabase.table('users').upsert(user_data).execute()
            if res.data and len(res.data) > 0:
                return jsonify(res.data[0])
        except Exception as e:
            print(f"[PlugMate] Supabase sync user error: {e}")

    return jsonify(user_data)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"\n⚡ PlugMate Flask + Supabase Server starting on http://localhost:{port}")
    print(f"⚡ Interactive Map: http://localhost:{port}/map.html")
    print(f"⚡ Host Dashboard: http://localhost:{port}/host-dashboard.html")
    print(f"⚡ My Bookings:    http://localhost:{port}/my-bookings.html\n")
    app.run(host='0.0.0.0', port=port, debug=True)
