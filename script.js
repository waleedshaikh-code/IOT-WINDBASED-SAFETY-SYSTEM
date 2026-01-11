let windHistory = []; // Store last 10 wind readings

function statusToClasses(status) {
  if (status === "SAFE") return { badge: "safe", bg: "safeBg", text: "SAFE" };
  if (status === "WARNING") return { badge: "warning", bg: "warningBg", text: "WARNING" };
  return { badge: "hazard", bg: "hazardBg", text: "HAZARD" };
}

function computeTrend(history) {
  if (history.length < 3) return "Trend: --";

  // Compare average of last 2 vs previous 2
  const last2 = (history[history.length - 1] + history[history.length - 2]) / 2;
  const prev2 = (history[history.length - 2] + history[history.length - 3]) / 2;

  const diff = last2 - prev2;

  if (diff > 0.4) return "Trend: ⬆ Increasing";
  if (diff < -0.4) return "Trend: ⬇ Decreasing";
  return "Trend: ➖ Stable";
}

function explanationText(status) {
  if (status === "SAFE") {
    return "Wind conditions are normal. No action required. Continue monitoring.";
  }
  if (status === "WARNING") {
    return "Elevated wind detected. Monitor conditions and prepare safety actions if wind increases.";
  }
  return "Hazardous wind level detected. Recommend immediate safety measures and limiting outdoor exposure.";
}

function updateData() {
  fetch("/data")
    .then((response) => response.json())
    .then((data) => {
      const wind = Number(data.wind);

      // --- Update history (keep last 10)
      if (!Number.isNaN(wind)) {
        windHistory.push(wind);
        if (windHistory.length > 10) windHistory.shift();
      }

      // --- Update main values
      document.getElementById("windValue").innerText = data.wind;
      document.getElementById("temp").innerText = data.temperature + " °C";
      document.getElementById("hum").innerText = data.humidity + " %";

      // --- Safety zones (badge + background)
      const badge = document.getElementById("badge");
      const card = document.getElementById("card");
      const s = statusToClasses(data.status);

      badge.innerText = s.text;
      badge.className = "badge " + s.badge;

      card.classList.remove("safeBg", "warningBg", "hazardBg");
      card.classList.add(s.bg);

      // --- Trend indicator
      document.getElementById("trend").innerText = computeTrend(windHistory);

      // --- Explanation box
      document.getElementById("explainText").innerText = explanationText(data.status);
    })
    .catch(() => {
      // If something fails, don't crash the UI
    });
}

setInterval(updateData, 2000);
updateData();
