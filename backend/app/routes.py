from flask import Blueprint, request, jsonify, send_file
import io
import csv
from .calculations import calculate_probabilities, get_day_of_year
from .data_loader import get_weather_stats

api_bp = Blueprint('api', __name__)

@api_bp.route('/query', methods=['POST'])
def query_weather():
    data = request.get_json() or {}
    lat = data.get('lat')
    lon = data.get('lon')
    date_str = data.get('date') # Expected format: YYYY-MM-DD
    variables = data.get('variables', [])
    thresholds = data.get('thresholds', {})

    if not all([lat is not None, lon is not None, date_str, variables]):
        return jsonify({'error': 'Missing required parameters: lat, lon, date, variables'}), 400

    if not (-90 <= lat <= 90):
        return jsonify({'error': 'Latitude must be between -90 and 90'}), 400
    if not (-180 <= lon <= 180):
        return jsonify({'error': 'Longitude must be between -180 and 180'}), 400

    try:
        day_of_year = get_day_of_year(date_str)
    except ValueError as e:
        return jsonify({'error': f'Invalid date format: {e}'}), 400

    try:
        stats, is_cached = get_weather_stats(lat, lon, day_of_year, variables)
        results = calculate_probabilities(stats, thresholds)

        return jsonify({
            'location': {'lat': lat, 'lon': lon},
            'date': date_str,
            'day_of_year': day_of_year,
            'probabilities': results,
            'data_source': 'nasa_api',
            'is_cached': is_cached
        }), 200
    except Exception as e:
        print(f"Error querying weather data: {e}")
        return jsonify({
            'error': 'Unable to retrieve data from NASA POWER API. NASA services may be temporarily unavailable or there may be a network connection issue.'
        }), 503

@api_bp.route('/export', methods=['POST'])
def export_data():
    data = request.get_json() or {}
    results = data.get('results')
    export_format = data.get('format', 'json')

    if not results:
        return jsonify({'error': 'No data provided for export'}), 400

    if export_format == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Variable', 'Probability (%)', 'Historical Mean', 'Historical Range (Min)', 'Historical Range (Max)', 'Unit', 'Threshold'])
        probabilities = results.get('probabilities', {})
        for var_type, var_data in probabilities.items():
            writer.writerow([
                var_type,
                var_data.get('probability', 'N/A'),
                var_data.get('historicalMean', 'N/A'),
                var_data.get('historicalRange', [None, None])[0],
                var_data.get('historicalRange', [None, None])[1],
                var_data.get('unit', 'N/A'),
                var_data.get('threshold', 'N/A')
            ])
        csv_data = output.getvalue()
        output.close()

        output_bytes = io.BytesIO()
        output_bytes.write(csv_data.encode('utf-8'))
        output_bytes.seek(0)
        return send_file(
            output_bytes,
            mimetype='text/csv',
            as_attachment=True,
            download_name='weather_analysis.csv'
        )

    else:
        json_data = jsonify(results)
        json_bytes = io.BytesIO(json_data.get_data())
        return send_file(
            json_bytes,
            mimetype='application/json',
            as_attachment=True,
            download_name='weather_analysis.json'
        )

@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

