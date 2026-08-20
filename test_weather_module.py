"""
AGRO-SMART 5-Point Weather Intelligence Verification
Tests:
TEST 1: GPS coordinates (24.96, 86.18) + Crop: Tomato
TEST 2: Manual location (Jamui, Bihar) + Crop: Tomato
TEST 3: Manual location (Patna, Bihar) + Crop: Rice
TEST 4: Invalid location (asdfghxyz123)
TEST 5: Simulated provider failure / invalid coordinates
"""
import sys
import os

backend_dir = os.path.join(os.path.dirname(__file__), "backend")
sys.path.insert(0, backend_dir)

from app import create_app

def run_5_tests():
    app = create_app()
    client = app.test_client()

    print("==================================================")
    print("AGRO-SMART WEATHER MODULE 5-POINT VERIFICATION")
    print("==================================================")

    # TEST 1: GPS coordinates (24.96, 86.18), Crop: Tomato
    res1 = client.get("/api/weather/risk?lat=24.96&lon=86.18&crop=Tomato")
    d1 = res1.get_json()
    print("\n--- TEST 1: GPS Coordinates (24.96, 86.18) + Tomato ---")
    print(f"HTTP Status:  {res1.status_code}")
    print(f"Content-Type: {res1.headers.get('Content-Type')}")
    print(f"Valid JSON:   {d1 is not None}")
    print(f"Weather Src:  {d1.get('data', {}).get('weather_source')}")
    print(f"Location:     {d1.get('data', {}).get('location')}")
    print(f"Temperature:  {d1.get('data', {}).get('temperature')} C")
    print(f"Risk Result:  {d1.get('data', {}).get('risk_level')} RISK")
    assert res1.status_code == 200
    assert d1.get("success") is True
    assert d1.get("data", {}).get("weather_source") == "open-meteo"
    print("[PASS] TEST 1 passed successfully.")

    # TEST 2: Manual location (Jamui, Bihar), Crop: Tomato
    res2 = client.get("/api/weather/risk?location=Jamui,%20Bihar&crop=Tomato")
    d2 = res2.get_json()
    print("\n--- TEST 2: Manual Location (Jamui, Bihar) + Tomato ---")
    print(f"HTTP Status:  {res2.status_code}")
    print(f"Content-Type: {res2.headers.get('Content-Type')}")
    print(f"Valid JSON:   {d2 is not None}")
    print(f"Weather Src:  {d2.get('data', {}).get('weather_source')}")
    print(f"Location:     {d2.get('data', {}).get('location')}")
    print(f"Temperature:  {d2.get('data', {}).get('temperature')} C")
    print(f"Risk Result:  {d2.get('data', {}).get('risk_level')} RISK")
    assert res2.status_code == 200
    assert "jamui" in d2.get("data", {}).get("location", "").lower()
    print("[PASS] TEST 2 passed successfully.")

    # TEST 3: Manual location (Patna, Bihar), Crop: Rice
    res3 = client.get("/api/weather/risk?location=Patna,%20Bihar&crop=Rice")
    d3 = res3.get_json()
    print("\n--- TEST 3: Manual Location (Patna, Bihar) + Rice ---")
    print(f"HTTP Status:  {res3.status_code}")
    print(f"Content-Type: {res3.headers.get('Content-Type')}")
    print(f"Valid JSON:   {d3 is not None}")
    print(f"Weather Src:  {d3.get('data', {}).get('weather_source')}")
    print(f"Location:     {d3.get('data', {}).get('location')}")
    print(f"Crop:         {d3.get('data', {}).get('crop')}")
    print(f"Risk Result:  {d3.get('data', {}).get('risk_level')} RISK")
    assert res3.status_code == 200
    assert d3.get("data", {}).get("crop") == "Rice"
    print("[PASS] TEST 3 passed successfully.")

    # TEST 4: Invalid location (asdfghxyz123)
    res4 = client.get("/api/weather/risk?location=asdfghxyz123&crop=Tomato")
    d4 = res4.get_json()
    print("\n--- TEST 4: Invalid Location ('asdfghxyz123') ---")
    print(f"HTTP Status:  {res4.status_code}")
    print(f"Content-Type: {res4.headers.get('Content-Type')}")
    print(f"Valid JSON:   {d4 is not None}")
    print(f"Error Code:   {d4.get('error', {}).get('code')}")
    print(f"Message:      {d4.get('error', {}).get('message')}")
    assert res4.status_code == 404
    assert d4.get("success") is False
    assert d4.get("error", {}).get("code") == "LOCATION_NOT_FOUND"
    print("[PASS] TEST 4 passed successfully.")

    # TEST 5: Simulate provider failure (e.g. invalid latitude 999.0)
    res5 = client.get("/api/weather/risk?lat=999.0&lon=999.0&crop=Tomato")
    d5 = res5.get_json()
    print("\n--- TEST 5: Simulated Provider Failure (Invalid coords) ---")
    print(f"HTTP Status:  {res5.status_code}")
    print(f"Content-Type: {res5.headers.get('Content-Type')}")
    print(f"Valid JSON:   {d5 is not None}")
    print(f"Error Code:   {d5.get('error', {}).get('code')}")
    print(f"Message:      {d5.get('error', {}).get('message')}")
    assert res5.status_code == 503 or res5.status_code == 500
    assert d5.get("success") is False
    assert d5.get("error") is not None
    print("[PASS] TEST 5 passed successfully.")

    print("\n==================================================")
    print("ALL 5 TESTS COMPLETED AND FULLY PASSED (100%)")
    print("==================================================")

if __name__ == "__main__":
    run_5_tests()
