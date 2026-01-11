import os
from flask import Flask, jsonify, render_template
import time, random, math, threading

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
STATIC_DIR = os.path.join(BASE_DIR, "static")

print("BASE_DIR =", BASE_DIR)
print("TEMPLATE_DIR =", TEMPLATE_DIR)
print("STATIC_DIR =", STATIC_DIR)
print("Templates folder exists?", os.path.isdir(TEMPLATE_DIR))
print("Static folder exists?", os.path.isdir(STATIC_DIR))
print("Index exists?", os.path.isfile(os.path.join(TEMPLATE_DIR, "index.html")))

app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)

# GLOBAL DATA
current_data = {
    "wind": 0.0,
    "temperature": 22.0,
    "humidity": 45.0,
    "status": "SAFE"
}

# -----------------------------
# WIND SIMULATION (Option D)
# -----------------------------
def wind_simulator():
    t0 = time.time()
    base = 4.5
    last_spike = 0

    while True:
        t = time.time() - t0

        smooth = 2 * math.sin(t / 10) + math.sin(t / 4)
        noise = random.uniform(-0.7, 0.7)

        wind = base + smooth + noise

        if time.time() - last_spike > 10 and random.random() < 0.1:
            wind += random.uniform(6, 10)
            last_spike = time.time()

        wind = max(0, min(wind, 25))
        wind = round(wind, 1)

        if wind < 8:
            status = "SAFE"
        elif wind < 15:
            status = "WARNING"
        else:
            status = "HAZARD"

        current_data["wind"] = wind
        current_data["status"] = status

        print(f"Wind: {wind} m/s | Status: {status} | "
              f"Temp: {current_data['temperature']} °C | "
              f"Humidity: {current_data['humidity']} %")

        time.sleep(2)

# -----------------------------
# ROUTES
# -----------------------------
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/data")
def data():
    return jsonify(current_data)


if __name__ == "__main__":
    threading.Thread(target=wind_simulator, daemon=True).start()
    app.run(host="0.0.0.0", port=5000)
