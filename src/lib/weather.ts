export type WeatherSnapshot = {
  summary: string;
  tempC: number | null;
  precipChance: number | null;
  source: "open-meteo";
};

/**
 * Best-effort forecast for the event date via Open-Meteo (no API key).
 * Returns null when address can't be geocoded or the date is too far.
 */
export async function fetchEventWeather(input: {
  address: string;
  dateISO: string;
}): Promise<WeatherSnapshot | null> {
  const address = input.address.trim();
  if (!address || !/^\d{4}-\d{2}-\d{2}$/.test(input.dateISO)) return null;

  try {
    const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geoUrl.searchParams.set("name", address.slice(0, 80));
    geoUrl.searchParams.set("count", "1");
    geoUrl.searchParams.set("language", "en");
    geoUrl.searchParams.set("format", "json");
    const geoRes = await fetch(geoUrl.toString(), { next: { revalidate: 86400 } });
    if (!geoRes.ok) return null;
    const geo = (await geoRes.json()) as {
      results?: { latitude: number; longitude: number; name: string }[];
    };
    const place = geo.results?.[0];
    if (!place) return null;

    const wxUrl = new URL("https://api.open-meteo.com/v1/forecast");
    wxUrl.searchParams.set("latitude", String(place.latitude));
    wxUrl.searchParams.set("longitude", String(place.longitude));
    wxUrl.searchParams.set("daily", "weathercode,temperature_2m_max,precipitation_probability_max");
    wxUrl.searchParams.set("timezone", "auto");
    wxUrl.searchParams.set("start_date", input.dateISO);
    wxUrl.searchParams.set("end_date", input.dateISO);

    const wxRes = await fetch(wxUrl.toString(), { next: { revalidate: 3600 } });
    if (!wxRes.ok) return null;
    const wx = (await wxRes.json()) as {
      daily?: {
        weathercode?: number[];
        temperature_2m_max?: number[];
        precipitation_probability_max?: number[];
      };
    };
    const code = wx.daily?.weathercode?.[0];
    const temp = wx.daily?.temperature_2m_max?.[0] ?? null;
    const precip = wx.daily?.precipitation_probability_max?.[0] ?? null;
    if (code == null && temp == null) return null;

    return {
      summary: weatherLabel(code),
      tempC: temp,
      precipChance: precip,
      source: "open-meteo",
    };
  } catch {
    return null;
  }
}

function weatherLabel(code: number | undefined): string {
  if (code == null) return "Forecast unavailable";
  if (code === 0) return "Clear skies";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rain likely";
  if (code <= 77) return "Snow possible";
  if (code <= 82) return "Showers";
  if (code <= 99) return "Thunderstorms possible";
  return "Variable conditions";
}
