interface WeatherInfo {
  emoji: string;
  label: string;
}

const weatherMap: Record<number, WeatherInfo> = {
  0: { emoji: "☀️", label: "Clear" },
  1: { emoji: "🌤️", label: "Mainly clear" },
  2: { emoji: "⛅", label: "Partly cloudy" },
  3: { emoji: "☁️", label: "Overcast" },
  45: { emoji: "🌫️", label: "Fog" },
  48: { emoji: "🌫️", label: "Fog" },
  51: { emoji: "🌦️", label: "Drizzle" },
  53: { emoji: "🌦️", label: "Drizzle" },
  55: { emoji: "🌦️", label: "Drizzle" },
  61: { emoji: "🌧️", label: "Rain" },
  63: { emoji: "🌧️", label: "Rain" },
  65: { emoji: "🌧️", label: "Rain" },
  71: { emoji: "🌨️", label: "Snow" },
  73: { emoji: "🌨️", label: "Snow" },
  75: { emoji: "🌨️", label: "Snow" },
  80: { emoji: "🌧️", label: "Showers" },
  81: { emoji: "🌧️", label: "Showers" },
  82: { emoji: "🌧️", label: "Showers" },
  85: { emoji: "🌨️", label: "Snow showers" },
  86: { emoji: "🌨️", label: "Snow showers" },
  95: { emoji: "⛈️", label: "Thunderstorm" },
  96: { emoji: "⛈️", label: "Thunderstorm" },
  99: { emoji: "⛈️", label: "Thunderstorm" },
};

export function getWeatherInfo(code: number): WeatherInfo {
  return weatherMap[code] ?? { emoji: "❓", label: "Unknown" };
}
