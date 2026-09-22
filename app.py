"""
Hospital Management System - Flask Backend Entry Point

Provides API routes for:
1. Serving Dashboard UI.
2. System Health and Oracle DB Status.
3. Live Domain Data: Patients, Doctors, Nurses, Pharmacists, Rooms, Billing, Appointments, Test Reports.
4. Showcase Queries (Basic Filtering, Missing Data, Simple Aggregation, Sorting, 2-Table JOIN).
5. Interactive SQL Query Runner & Database Re-seeding.
"""

from flask import Flask, render_template, jsonify, request
from config import Config
import db

app = Flask(__name__)


# ==========================================
# Frontend Page Route
# ==========================================
@app.route("/")
def index():
    """Renders the main hospital management dashboard interface."""
    return render_template("index.html")


# ==========================================
# Health & Status API Routes
# ==========================================
@app.route("/api/health", methods=["GET"])
def health_check():
    """Application health-check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "Hospital Management System Backend",
        "configured": Config.is_configured()
    })


@app.route("/api/db-status", methods=["GET"])
def db_status():
    """Performs an actual connection test against the Oracle Database."""
    status_result = db.test_connection()
    status_code = 200 if status_result["connected"] else 503 if status_result["status"] == "connection_error" else 200
    return jsonify(status_result), status_code


@app.route("/api/dashboard-summary", methods=["GET"])
def dashboard_summary():
    """Returns high-level KPI metrics from Oracle DB."""
    try:
        summary = db.get_dashboard_summary()
        return jsonify({"success": True, "data": summary})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ==========================================
# Domain Entities API Routes (Live Oracle Queries)
# ==========================================
@app.route("/api/patients", methods=["GET"])
def get_patients():
    """Fetches all patients joined across normalized address and room chains."""
    try:
        data = db.get_all_patients()
        return jsonify({"success": True, "data": data, "count": len(data)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/doctors", methods=["GET"])
def get_doctors():
    """Fetches doctor roster with designations, specializations, and supervisors."""
    try:
        data = db.get_all_doctors()
        return jsonify({"success": True, "data": data, "count": len(data)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/nurses", methods=["GET"])
def get_nurses():
    """Fetches nurse roster with shift types and assigned room numbers."""
    try:
        data = db.get_all_nurses()
        return jsonify({"success": True, "data": data, "count": len(data)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/pharmacists", methods=["GET"])
def get_pharmacists():
    """Fetches pharmacist team with clearance levels and medical record counts."""
    try:
        data = db.get_all_pharmacists()
        return jsonify({"success": True, "data": data, "count": len(data)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/rooms", methods=["GET"])
def get_rooms():
    """Fetches room inventory, capacity, and current patient occupants."""
    try:
        data = db.get_all_rooms()
        return jsonify({"success": True, "data": data, "count": len(data)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/billing", methods=["GET"])
def get_billing():
    """Fetches billing, insurance amounts, and verification statuses."""
    try:
        data = db.get_all_billing()
        return jsonify({"success": True, "data": data, "count": len(data)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/appointments", methods=["GET"])
def get_appointments():
    """Fetches upcoming patient doctor appointments."""
    try:
        data = db.get_all_appointments()
        return jsonify({"success": True, "data": data, "count": len(data)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/test-reports", methods=["GET"])
def get_test_reports():
    """Fetches patient diagnostic test reports."""
    try:
        data = db.get_all_test_reports()
        return jsonify({"success": True, "data": data, "count": len(data)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ==========================================
# EER Demonstration Queries API Routes
# ==========================================
@app.route("/api/demo-queries", methods=["GET"])
def list_demo_queries():
    """Returns the metadata and descriptions for the 5 demonstration queries."""
    return jsonify({"success": True, "queries": db.DEMO_QUERIES})


@app.route("/api/demo-queries/<query_id>/run", methods=["GET", "POST"])
def run_demo_query_endpoint(query_id):
    """Executes a specific showcase demonstration query live on Oracle."""
    try:
        result = db.run_demo_query(query_id)
        return jsonify({"success": True, "result": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/api/run-custom-query", methods=["POST"])
def run_custom_query():
    """Allows user to run interactive SELECT queries directly on Oracle DB."""
    body = request.get_json() or {}
    sql = body.get("sql", "").strip()
    
    if not sql:
        return jsonify({"success": False, "error": "No SQL query provided."}), 400

    try:
        result = db.execute_custom_query(sql)
        return jsonify({"success": True, "result": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/api/reseed-db", methods=["POST"])
def reseed_db():
    """Reseeds database tables with initial test data."""
    try:
        import init_db
        init_db.init_database()
        return jsonify({"success": True, "message": "Database tables recreated and reseeded successfully!"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ==========================================
# App Execution
# ==========================================
if __name__ == "__main__":
    print("=" * 60)
    print("Hospital Management System Server Starting...")
    print(f"URL: http://127.0.0.1:{Config.FLASK_PORT}")
    print(f"Debug Mode: {Config.FLASK_DEBUG}")
    print("=" * 60)
    app.run(
        host="0.0.0.0",
        port=Config.FLASK_PORT,
        debug=Config.FLASK_DEBUG
    )
