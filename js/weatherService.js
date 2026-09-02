/**
 * STARK - Weather Service
 * Real-time Weather Integration via Open-Meteo API (Free, Real-time, Global)
 * Team STARK - Smart India Hackathon 2026
 */

export class WeatherService {
  constructor() {
    this.cachedData = null;
    this.lastFetched = null;
    this.status = "INITIAL"; // "LIVE", "DEMO_FALLBACK", "ERROR"
  }

  /**
   * Fetch live weather data for given latitude & longitude
   */
  async getWeatherData(latitude = 10.9601, longitude = 78.0766) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Weather API responded with HTTP status ${response.status}`);
      }

      const raw = await response.json();
      
      const current = raw.current || {};
      const daily = raw.daily || {};

      const weatherCode = current.weather_code ?? 0;
      const weatherCondition = this.getWeatherConditionFromCode(weatherCode);

      const formatted = {
        isLive: true,
        source: "Open-Meteo Global Forecast API",
        statusText: "🟢 LIVE WEATHER DATA",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temperature: Math.round(current.temperature_2m ?? 29),
        humidity: Math.round(current.relative_humidity_2m ?? 65),
        rainProbability: daily.precipitation_probability_max?.[0] ?? (current.precipitation > 0 ? 80 : 15),
        rainfallMm: current.precipitation ?? 0,
        windSpeedKmH: Math.round(current.wind_speed_10m ?? 12),
        weatherCode: weatherCode,
        condition: weatherCondition.title,
        icon: weatherCondition.icon,
        description: weatherCondition.description,
        forecast5Day: this.parse5DayForecast(daily),
        spoilageWeatherMultiplier: this.computeWeatherSpoilageMultiplier(current.temperature_2m, current.relative_humidity_2m, daily.precipitation_probability_max?.[0]),
        transitRisk: this.computeTransitRisk(daily.precipitation_probability_max?.[0], current.precipitation)
      };

      this.cachedData = formatted;
      this.lastFetched = new Date();
      this.status = "LIVE";

      return formatted;
    } catch (err) {
      console.warn("Weather API fetch failed, falling back to realistic meteorological dataset for coordinate:", latitude, longitude, err);
      return this.getFallbackWeatherData(latitude, longitude);
    }
  }

  /**
   * Fallback data clearly labeled as DEMO DATA when offline/blocked
   */
  getFallbackWeatherData(latitude, longitude) {
    const isSouthIndia = latitude < 16.0;
    const baseTemp = isSouthIndia ? 31 : 27;
    const baseHumidity = isSouthIndia ? 74 : 62;
    const baseRainProb = isSouthIndia ? 25 : 10;

    const formatted = {
      isLive: false,
      source: "Local Meteorological Model (Offline Fallback)",
      statusText: "🟡 DEMO WEATHER DATA (API Unavailable)",
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }),
      temperature: baseTemp,
      humidity: baseHumidity,
      rainProbability: baseRainProb,
      rainfallMm: 0,
      windSpeedKmH: 14,
      weatherCode: 1,
      condition: "Partly Cloudy",
      icon: "⛅",
      description: "Typical regional agro-climatic conditions with moderate cloud cover.",
      forecast5Day: [
        { day: "Today", maxTemp: baseTemp, minTemp: baseTemp - 7, rainProb: baseRainProb, icon: "⛅" },
        { day: "+1 Day", maxTemp: baseTemp + 1, minTemp: baseTemp - 6, rainProb: baseRainProb + 10, icon: "🌦️" },
        { day: "+2 Day", maxTemp: baseTemp + 2, minTemp: baseTemp - 5, rainProb: 15, icon: "☀️" },
        { day: "+3 Day", maxTemp: baseTemp, minTemp: baseTemp - 7, rainProb: 20, icon: "⛅" },
        { day: "+4 Day", maxTemp: baseTemp - 1, minTemp: baseTemp - 8, rainProb: 40, icon: "🌧️" }
      ],
      spoilageWeatherMultiplier: 1.15,
      transitRisk: "Low Transit Hazard (Dry Roads)"
    };

    this.cachedData = formatted;
    this.status = "DEMO_FALLBACK";
    return formatted;
  }

  parse5DayForecast(daily) {
    if (!daily.time || !Array.isArray(daily.time)) return [];
    
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const results = [];

    for (let i = 0; i < Math.min(5, daily.time.length); i++) {
      const date = new Date(daily.time[i]);
      const dayName = i === 0 ? "Today" : (i === 1 ? "Tomorrow" : `${days[date.getDay()]} (${date.getDate()}/${date.getMonth() + 1})`);
      const code = daily.weather_code?.[i] ?? 0;
      const cond = this.getWeatherConditionFromCode(code);

      results.push({
        day: dayName,
        maxTemp: Math.round(daily.temperature_2m_max?.[i] ?? 30),
        minTemp: Math.round(daily.temperature_2m_min?.[i] ?? 22),
        rainProb: Math.round(daily.precipitation_probability_max?.[i] ?? 10),
        rainMm: daily.precipitation_sum?.[i] ?? 0,
        icon: cond.icon,
        title: cond.title
      });
    }

    return results;
  }

  getWeatherConditionFromCode(code) {
    if (code === 0) return { title: "Clear Sky", icon: "☀️", description: "Clear and bright. Optimal for harvest drying & transport." };
    if (code >= 1 && code <= 3) return { title: "Partly Cloudy", icon: "⛅", description: "Mild cloud cover. Favorable for open transport." };
    if (code >= 45 && code <= 48) return { title: "Foggy / Mist", icon: "🌫️", description: "High moisture mist. Caution during night transit." };
    if (code >= 51 && code <= 55) return { title: "Light Drizzle", icon: "🌦️", description: "Minor moisture. Tarpaulin cover mandatory for open trucks." };
    if (code >= 61 && code <= 65) return { title: "Rain Showers", icon: "🌧️", description: "Active rainfall. Elevated post-harvest rot risk if produce is wet." };
    if (code >= 71 && code <= 77) return { title: "Hail / Cold", icon: "🌨️", description: "Severe cold/hail warning. Protect exposed crops." };
    if (code >= 80 && code <= 82) return { title: "Heavy Downpour", icon: "⛈️", description: "Heavy rain alert. Delay open transport or use waterproof containers." };
    if (code >= 95) return { title: "Thunderstorm", icon: "⚡", description: "High wind & storm. Avoid long-distance mandi transit." };
    return { title: "Clear", icon: "☀️", description: "Normal agro-climatic conditions." };
  }

  computeWeatherSpoilageMultiplier(temp = 28, humidity = 65, rainProb = 20) {
    let multiplier = 1.0;
    // High heat accelerates bacterial & enzymatic degradation
    if (temp > 33) multiplier += (temp - 33) * 0.04;
    // High humidity accelerates fungal rot in vegetables
    if (humidity > 70) multiplier += (humidity - 70) * 0.015;
    // Rain risk
    if (rainProb > 50) multiplier += 0.12;

    return Math.min(2.0, Math.max(0.8, multiplier));
  }

  computeTransitRisk(rainProb = 20, rainMm = 0) {
    if (rainMm > 15 || rainProb > 70) {
      return "⚠️ HIGH RISK: Wet road delays & produce moisture damage. Water-resistant tarpaulin required.";
    }
    if (rainMm > 2 || rainProb > 40) {
      return "🟡 MODERATE RISK: Potential road showers. Ensure crate covers.";
    }
    return "🟢 LOW RISK: Favorable road conditions & clear transit weather.";
  }
}
