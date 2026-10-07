from .nasa_api import NASAPowerAPI

def get_weather_stats(lat, lon, day_of_year, variables):
    """
    Fetch weather statistics directly from NASA POWER API (or cache).
    Raises an exception if the NASA API call fails.
    """
    print(f"Fetching NASA POWER data for ({lat}, {lon}) on day {day_of_year}...")
    api = NASAPowerAPI()
    
    # Fetch data and cache indicator
    nasa_stats, is_cached = api.get_stats_for_day(lat, lon, day_of_year, variables)

    if not nasa_stats:
        raise RuntimeError("No data returned from NASA API for requested location and day.")

    return nasa_stats, is_cached
