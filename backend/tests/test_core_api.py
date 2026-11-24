import os

import requests


BASE_URL = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/")


def test_health_and_catalogs():
    # Public ingress forwards /api/* to FastAPI; root /health is only an
    # internal pod probe and is served by the frontend at the public URL.
    assert requests.get(f"{BASE_URL}/api/health", timeout=10).json() == {"status": "ok"}
    destinations = requests.get(f"{BASE_URL}/api/destinations", timeout=10).json()
    vehicles = requests.get(f"{BASE_URL}/api/vehicles", timeout=10).json()
    assert len(destinations) >= 4
    assert {item["id"] for item in vehicles} >= {"joy", "comfort", "van"}


def test_estimate_and_booking_history():
    payload = {"pickup": "TEST Downtown", "dropoff": "TEST Harbor", "vehicle_id": "joy"}
    estimate_response = requests.post(f"{BASE_URL}/api/rides/estimate", json=payload, timeout=10)
    assert estimate_response.status_code == 200
    estimate = estimate_response.json()
    assert estimate["vehicle_id"] == "joy"
    assert estimate["fare"] > 0
    history_response = requests.get(f"{BASE_URL}/api/bookings?user_id=demo-user", timeout=10)
    assert history_response.status_code == 200
    assert isinstance(history_response.json(), list)


def test_estimate_rejects_unknown_vehicle():
    response = requests.post(
        f"{BASE_URL}/api/rides/estimate",
        json={"pickup": "TEST A", "dropoff": "TEST B", "vehicle_id": "missing"},
        timeout=10,
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Vehicle not found"
