import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class NASAPowerAPI:
    BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
    PARAMS = {
        'temperature': 'T2M',        # Temperature at 2m (Celsius)
        'precipitation': 'PRECTOTCORR', # Precipitation (mm/day)
        'wind_speed': 'WS10M',       # Wind Speed at 10m (m/s)
        'humidity': 'RH2M'           # Relative Humidity at 2m (%)
    }
    UNITS = {
        'temperature': '°C',
        'precipitation': 'mm/day',
        'wind_speed': 'm/s',
        'humidity': '%'
    }

    # Class-level cache shared across instances
    _cache = {}
    _cache_ttl = timedelta(hours=24)

    def __init__(self):
        pass

    def _get_cache_key(self, lat, lon, start_year, end_year):
        return f"{round(lat, 2)}_{round(lon, 2)}_{start_year}_{end_year}"

    def fetch_data(self, lat, lon, start_year, end_year, variables):
        """Fetch daily weather data from NASA POWER API or local cache."""
        cache_key = self._get_cache_key(lat, lon, start_year, end_year)
        now = datetime.now()

        # Check for valid cached data
        if cache_key in NASAPowerAPI._cache:
            cached_item = NASAPowerAPI._cache[cache_key]
            if now - cached_item['timestamp'] < NASAPowerAPI._cache_ttl:
                print(f"  -> Cache HIT for ({lat}, {lon})")
                return cached_item['data'], True

        print(f"  -> Cache MISS for ({lat}, {lon}). Fetching from NASA POWER API...")

        params = {
            "parameters": ",".join([self.PARAMS[v] for v in variables if v in self.PARAMS]),
            "community": "RE",
            "longitude": lon,
            "latitude": lat,
            "start": f"{start_year}0101",
            "end": f"{end_year}1231",
            "format": "JSON"
        }

        response = requests.get(self.BASE_URL, params=params, timeout=30)
        response.raise_for_status()

        data = response.json()
        
        parsed_data = {}
        for var in variables:
            if var in self.PARAMS:
                api_param = self.PARAMS[var]
                if 'properties' in data and 'parameter' in data['properties'] and api_param in data['properties']['parameter']:
                    raw_values = data['properties']['parameter'][api_param]
                    val_list = list(raw_values.values()) if isinstance(raw_values, dict) else list(raw_values)
                    
                    date_range = pd.date_range(start=f"{start_year}-01-01", end=f"{end_year}-12-31", freq='D')
                    min_len = min(len(date_range), len(val_list))
                    
                    df = pd.DataFrame({
                        'date': date_range[:min_len], 
                        'value': val_list[:min_len]
                    })
                    
                    df['value'] = pd.to_numeric(df['value'], errors='coerce')
                    df = df.dropna()
                    df['day_of_year'] = df['date'].dt.dayofyear
                    parsed_data[var] = df[['day_of_year', 'value']].rename(columns={'value': var})
                else:
                    print(f"Warning: Parameter {api_param} not found in NASA response.")
                    parsed_data[var] = pd.DataFrame(columns=['day_of_year', 'value'])

        # Store in cache
        NASAPowerAPI._cache[cache_key] = {
            'timestamp': now,
            'data': parsed_data
        }

        return parsed_data, False

    def compute_day_of_year_statistics(self, data, variables):
        """Compute statistics for each day of year."""
        stats = {}
        for var in variables:
            if var in data and not data[var].empty:
                var_data = data[var]
                day_stats = {}
                for doy in range(1, 367):
                    doy_values = var_data[var_data['day_of_year'] == doy][var]
                    if not doy_values.empty:
                        values = doy_values.values
                        day_stats[doy] = {
                            'mean': float(np.mean(values)),
                            'std': float(np.std(values)),
                            'p10': float(np.percentile(values, 10)),
                            'p90': float(np.percentile(values, 90)),
                            'min': float(np.min(values)),
                            'max': float(np.max(values)),
                            'count': int(len(values)),
                            'unit': self.UNITS.get(var, '')
                        }
                    else:
                        day_stats[doy] = {
                            'mean': 0.0, 'std': 0.0, 'p10': 0.0, 'p90': 0.0,
                            'min': 0.0, 'max': 0.0, 'count': 0, 'unit': self.UNITS.get(var, '')
                        }
                stats[var] = day_stats
            else:
                stats[var] = {}
        return stats

    def get_stats_for_day(self, lat, lon, day_of_year, variables):
        """Fetch statistics for a specific day of year. Returns (stats, is_cached)."""
        start_year = 2014
        end_year = 2024
        
        raw_data, is_cached = self.fetch_data(lat, lon, start_year, end_year, variables)
        all_stats = self.compute_day_of_year_statistics(raw_data, variables)
        
        results = []
        for var in variables:
            if var in all_stats and day_of_year in all_stats[var]:
                stat = all_stats[var][day_of_year].copy()
                stat['variable_type'] = var
                results.append(stat)
            else:
                print(f"Warning: Stats for {var} on day {day_of_year} not found.")

        return results, is_cached
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class NASAPowerAPI:
    BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
    PARAMS = {
        'temperature': 'T2M',        # Temperature at 2m (Celsius)
        'precipitation': 'PRECTOTCORR', # Precipitation (mm/day)
        'wind_speed': 'WS10M',       # Wind Speed at 10m (m/s)
        'humidity': 'RH2M'           # Relative Humidity at 2m (%)
    }
    UNITS = {
        'temperature': '°C',
        'precipitation': 'mm/day',
        'wind_speed': 'm/s',
        'humidity': '%'
    }

    _cache = {}
    _cache_ttl = timedelta(hours=24)

    def __init__(self):
        pass

    def _get_cache_key(self, lat, lon, start_year, end_year):
        return f"{round(lat, 2)}_{round(lon, 2)}_{start_year}_{end_year}"

    def fetch_data(self, lat, lon, start_year, end_year, variables):
        cache_key = self._get_cache_key(lat, lon, start_year, end_year)
        now = datetime.now()

        if cache_key in NASAPowerAPI._cache:
            cached_item = NASAPowerAPI._cache[cache_key]
            if now - cached_item['timestamp'] < NASAPowerAPI._cache_ttl:
                print(f"  -> Cache HIT for ({lat}, {lon})")
                return cached_item['data'], True

        print(f"  -> Cache MISS for ({lat}, {lon}). Fetching from NASA POWER API...")

        params = {
            "parameters": ",".join([self.PARAMS[v] for v in variables if v in self.PARAMS]),
            "community": "RE",
            "longitude": lon,
            "latitude": lat,
            "start": f"{start_year}0101",
            "end": f"{end_year}1231",
            "format": "JSON"
        }

        response = requests.get(self.BASE_URL, params=params, timeout=30)
        response.raise_for_status()

        data = response.json()
        
        parsed_data = {}
        for var in variables:
            if var in self.PARAMS:
                api_param = self.PARAMS[var]
                if 'properties' in data and 'parameter' in data['properties'] and api_param in data['properties']['parameter']:
                    raw_values = data['properties']['parameter'][api_param]
                    val_list = list(raw_values.values()) if isinstance(raw_values, dict) else list(raw_values)
                    
                    date_range = pd.date_range(start=f"{start_year}-01-01", end=f"{end_year}-12-31", freq='D')
                    min_len = min(len(date_range), len(val_list))
                    
                    df = pd.DataFrame({
                        'date': date_range[:min_len], 
                        'value': val_list[:min_len]
                    })
                    
                    df['value'] = pd.to_numeric(df['value'], errors='coerce')
                    # Replace NASA dummy values (-999 or -99) with NaN and drop
                    df['value'] = df['value'].replace([-999, -99, -999.0, -99.0], np.nan)
                    df = df.dropna()
                    df['day_of_year'] = df['date'].dt.dayofyear
                    parsed_data[var] = df[['day_of_year', 'value']].rename(columns={'value': var})
                else:
                    print(f"Warning: Parameter {api_param} not found in NASA response.")
                    parsed_data[var] = pd.DataFrame(columns=['day_of_year', 'value'])

        NASAPowerAPI._cache[cache_key] = {
            'timestamp': now,
            'data': parsed_data
        }

        return parsed_data, False

    def compute_day_of_year_statistics(self, data, variables):
        stats = {}
        for var in variables:
            if var in data and not data[var].empty:
                var_data = data[var]
                day_stats = {}
                for doy in range(1, 367):
                    doy_values = var_data[var_data['day_of_year'] == doy][var]
                    if not doy_values.empty:
                        values = doy_values.values
                        std_val = float(np.std(values))
                        day_stats[doy] = {
                            'mean': float(np.mean(values)),
                            'std': std_val if std_val > 0 else 0.001, # Avoid zero std_dev division
                            'p10': float(np.percentile(values, 10)),
                            'p90': float(np.percentile(values, 90)),
                            'min': float(np.min(values)),
                            'max': float(np.max(values)),
                            'count': int(len(values)),
                            'unit': self.UNITS.get(var, '')
                        }
                    else:
                        day_stats[doy] = {
                            'mean': 0.0, 'std': 0.001, 'p10': 0.0, 'p90': 0.0,
                            'min': 0.0, 'max': 0.0, 'count': 0, 'unit': self.UNITS.get(var, '')
                        }
                stats[var] = day_stats
            else:
                stats[var] = {}
        return stats

    def get_stats_for_day(self, lat, lon, day_of_year, variables):
        # 10-year historical baseline window
        start_year = 2014
        end_year = 2024
        
        raw_data, is_cached = self.fetch_data(lat, lon, start_year, end_year, variables)
        all_stats = self.compute_day_of_year_statistics(raw_data, variables)
        
        results = []
        for var in variables:
            if var in all_stats and day_of_year in all_stats[var]:
                stat = all_stats[var][day_of_year].copy()
                stat['variable_type'] = var
                results.append(stat)
            else:
                print(f"Warning: Stats for {var} on day {day_of_year} not found.")

        return results, is_cached

