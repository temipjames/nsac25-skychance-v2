import numpy as np
from scipy.stats import norm
from datetime import datetime

def get_day_of_year(date_str):
    """Convert YYYY-MM-DD string to day of year (1-366)."""
    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
    return date_obj.timetuple().tm_yday

def calculate_probabilities(stats, thresholds):
    """Calculate probability of exceeding thresholds based on historical stats."""
    results = {}
    for stat in stats: # Assuming stats is a list of dicts from data_loader
        var_type = stat['variable_type']
        result = {
            'historicalMean': round(stat['mean'], 1),
            'historicalRange': [round(stat['p10'], 1), round(stat['p90'], 1)],
            'unit': stat['unit']
        }

        # Calculate probability if threshold provided
        if var_type in thresholds:
            threshold = thresholds[var_type]
            mean = stat['mean']
            std_dev = stat['std']

            # Calculate z-score
            z = (threshold - mean) / std_dev
            # Probability of exceeding threshold (1 - CDF)
            prob = 1 - norm.cdf(z)
            result['threshold'] = threshold
            result['probability'] = round(prob * 100, 2) # Round to 2 decimal places

        results[var_type] = result
    return results
