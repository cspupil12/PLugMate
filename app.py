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

# Default community chargers & bookings (aligned with Supabase seed records for offline fallback)
LOCAL_CHARGERS = [
    {
        "id": 1,
        "host_id": "user_host_1",
        "host_name": "Harpreet Singh",
        "title": "Green Park Driveway Wallbox",
        "tagline": "Gated wide porch with shade, 5 mins from community center",
        "address": "84 Main Market Avenue, Green Park",
        "city": "community",
        "lat": 30.8872,
        "lng": 75.8115,
        "connector_type": "Type-2 AC",
        "power_kw": 7.4,
        "hourly_rate": 22.0,
        "is_available": True,
        "available_hours": "06:00 AM - 11:30 PM",
        "photo": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80",
        "amenities": ["Gated Driveway", "CCTV Monitor", "Covered Porch", "Drinking Water", "Restroom"],
        "rating": 4.9,
        "reviews_count": 32,
        "compatibility": "Tata Nexon/Curvv, MG ZS/Windsor, Hyundai Ioniq, Mahindra XUV400",
        "surge_guarantee": True
    },
    {
        "id": 3,
        "host_id": "user_host_2",
        "host_name": "Gurmeet Kaur",
        "title": "University Enclave Solar Plug",
        "tagline": "Clean 100% solar surplus charging on quiet residential street",
        "address": "18 University Road, West Enclave",
        "city": "community",
        "lat": 30.9015,
        "lng": 75.8201,
        "connector_type": "15A-3Pin",
        "power_kw": 3.3,
        "hourly_rate": 13.0,
        "is_available": True,
        "available_hours": "07:00 AM - 10:00 PM",
        "photo": "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
        "amenities": ["100% Solar Energy", "Safe Overnight Parking", "EV 2-Wheeler Friendly"],
        "rating": 5.0,
        "reviews_count": 41,
        "compatibility": "Ather 450X, Ola S1, TVS iQube, MG Comet, Tata Tiago EV",
        "surge_guarantee": True
    },
    {
        "id": 4,
        "host_id": "user_host_1",
        "host_name": "Harpreet Singh",
        "title": "Pinecrest High-Power Wallbox",
        "tagline": "11 kW 3-phase home wallbox for faster charging turnarounds",
        "address": "4 Pinecrest Avenue, Northridge",
        "city": "community",
        "lat": 30.892,
        "lng": 75.834,
        "connector_type": "Type-2 AC",
        "power_kw": 11.0,
        "hourly_rate": 26.0,
        "is_available": True,
        "available_hours": "05:00 AM - Midnight",
        "photo": "https://images.unsplash.com/photo-1558441719-8b489c63f736?auto=format&fit=crop&w=800&q=80",
        "amenities": ["11 kW 3-Phase", "CCTV Monitor", "Easy Reversing Space"],
        "rating": 4.9,
        "reviews_count": 19,
        "compatibility": "BYD Atto 3/Seal, Hyundai Ioniq 5, Kia EV6, Audi e-tron",
        "surge_guarantee": True
    },
    {
        "id": 5,
        "host_id": "user_host_2",
        "host_name": "Gurmeet Kaur",
        "title": "Heritage Gardens Porch Socket",
        "tagline": "Quiet residential porch opposite neighborhood park",
        "address": "14 Heritage Walk, Civic Center",
        "city": "community",
        "lat": 30.908,
        "lng": 75.845,
        "connector_type": "15A-3Pin",
        "power_kw": 3.3,
        "hourly_rate": 12.0,
        "is_available": True,
        "available_hours": "08:00 AM - 08:00 PM",
        "photo": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80",
        "amenities": ["Shaded Carport", "Drinking Water Provided", "WiFi Access"],
        "rating": 4.7,
        "reviews_count": 15,
        "compatibility": "All 15A Industrial Plug EV Chargers",
        "surge_guarantee": True
    },
    {
        "id": 6,
        "host_id": "user_demo_jaspreet",
        "host_name": "Jaspreet Singh",
        "title": "Model Town Rapid AC Socket",
        "tagline": "11 kW high-speed 3-phase charger in secure gated residential compound",
        "address": "B-48, Model Town Extension, Opp. Gurdwara",
        "city": "community",
        "lat": 30.8845,
        "lng": 75.8080,
        "connector_type": "Type-2 AC",
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
        "id": 7,
        "host_id": "user_demo_jaspreet",
        "host_name": "Jaspreet Singh",
        "title": "EcoCharge Solar Driveway Port",
        "tagline": "100% Rooftop Solar-powered clean green energy charging",
        "address": "Eco Haven, Street 7, Sector 32",
        "city": "community",
        "lat": 30.8810,
        "lng": 75.8155,
        "connector_type": "Type-2 AC",
        "power_kw": 7.4,
        "hourly_rate": 19.0,
        "is_available": True,
        "available_hours": "08:00 AM - 08:00 PM",
        "photo": "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
        "amenities": ["100% Solar Green Energy", "Drinking Water", "EV Rest Bench"],
        "rating": 5.0,
        "reviews_count": 12,
        "compatibility": "Tata Nexon EV, MG ZS EV, Mahindra XUV400",
        "surge_guarantee": True
    }
]

LOCAL_BOOKINGS = [
    {
        "id": "PM-8821",
        "charger_id": 6,
        "charger_title": "Model Town Rapid AC Socket",
        "charger_address": "B-48, Model Town Extension, Opp. Gurdwara",
        "host_id": "user_demo_jaspreet",
        "host_name": "Jaspreet Singh",
        "user_id": "user_chargee_1",
        "user_name": "Amanjot Virdi",
        "user_phone": "+91 98888 12345",
        "user_vehicle": "Tata Nexon EV Empowered+",
        "date": "2026-11-26",
        "time_slot": "02:00 PM (2 hrs)",
        "duration_hours": 2.0,
        "hourly_rate": 25.0,
        "base_cost": 50.0,
        "platform_fee": 5.0,
        "total_amount": 55.0,
        "pin": "4821",
        "status": "upcoming",
        "payment_method": "UPI (Google Pay)",
        "payment_status": "Held in Escrow",
        "reviewed": False,
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "PM-7104",
        "charger_id": 7,
        "charger_title": "EcoCharge Solar Driveway Port",
        "charger_address": "Eco Haven, Street 7, Sector 32",
        "host_id": "user_demo_jaspreet",
        "host_name": "Jaspreet Singh",
        "user_id": "user_demo_jaspreet",
        "user_name": "Jaspreet Singh",
        "user_phone": "+91 98765 43210",
        "user_vehicle": "MG ZS EV",
        "date": "2026-11-24",
        "time_slot": "06:00 PM (2 hrs)",
        "duration_hours": 2.0,
        "hourly_rate": 19.0,
        "base_cost": 38.0,
        "platform_fee": 3.8,
        "total_amount": 41.8,
        "pin": "7392",
        "status": "completed",
        "payment_method": "UPI (Google Pay)",
        "payment_status": "Released to Host",
        "reviewed": False,
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
    allowed_fields = {
        'title', 'tagline', 'address', 'city', 'lat', 'lng',
        'connector_type', 'power_kw', 'hourly_rate', 'is_available',
        'available_hours', 'photo', 'amenities', 'rating',
        'reviews_count', 'compatibility', 'surge_guarantee'
    }
    clean_payload = {k: v for k, v in payload.items() if k in allowed_fields}
    if not clean_payload:
        return jsonify({"error": "No valid fields to update"}), 400

    if supabase:
        try:
            res = supabase.table('chargers').update(clean_payload).eq('id', charger_id).execute()
            if res.data and len(res.data) > 0:
                return jsonify(res.data[0])
        except Exception as e:
            print(f"[PlugMate] Supabase update charger error: {e}")

    for idx, c in enumerate(LOCAL_CHARGERS):
        if c['id'] == charger_id:
            LOCAL_CHARGERS[idx].update(clean_payload)
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
            if res.data is not None:
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
    pin = str(payload.get('pin') or random.randint(1000, 9999))
    booking_id = str(payload.get('id') or f"PM-{random.randint(1000, 9999)}")

    hours = float(payload.get('duration_hours', 2))
    rate = float(payload.get('hourly_rate', 22.0))
    base_cost = round(float(payload.get('base_cost', hours * rate)), 2)
    fee = round(float(payload.get('platform_fee', base_cost * 0.10)), 2)
    total = round(float(payload.get('total_amount', base_cost + fee)), 2)

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
        "status": payload.get('status', 'upcoming'),
        "payment_method": payload.get('payment_method', 'PlugMate Escrow'),
        "payment_status": payload.get('payment_status', 'Held in Escrow'),
        "reviewed": bool(payload.get('reviewed', False))
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
    booking_id = str(payload.get('booking_id') or '').strip()
    new_rev = {
        "charger_id": int(payload.get('charger_id', 1)),
        "booking_id": booking_id,
        "user_name": payload.get('user_name', 'EV Driver'),
        "rating": int(payload.get('rating', 5)),
        "date": datetime.now().strftime('%Y-%m-%d'),
        "tags": payload.get('tags', []),
        "comment": payload.get('comment', '').strip()
    }

    if supabase:
        try:
            res = supabase.table('reviews').insert(new_rev).execute()
            if booking_id:
                try:
                    supabase.table('bookings').update({"reviewed": True}).eq('id', booking_id).execute()
                except Exception as be:
                    print(f"[PlugMate] Supabase mark booking reviewed notice: {be}")
            if res.data and len(res.data) > 0:
                return jsonify(res.data[0]), 201
        except Exception as e:
            print(f"[PlugMate] Supabase add review error: {e}")

    if booking_id:
        for b in LOCAL_BOOKINGS:
            if b.get('id') == booking_id:
                b['reviewed'] = True

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
