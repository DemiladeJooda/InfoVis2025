from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import json
from visualization import get_visualization

import pandas as pd


app = Flask(__name__)
# Allow only frontend origin
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "http://localhost:3000"}})


@app.route('/')
def index():
    return 'Backend is running'




@app.route('/api/visualize-multiview', methods=['POST'])
@cross_origin(origin='http://localhost:3000') 
def visualize_multiview():
    try:
        if 'csv_file' not in request.files:
            return jsonify(success=False, error="Missing csv_file"), 400

        data = request.files['csv_file'].read()
        
        df = pd.read_csv(pd.io.common.BytesIO(data)) 

        # Define desired visualizations
        date_range = None
        location_filter = []

        # Generate each figure using get_visualization
        fig1 = get_visualization(data, 'time_series', 'DissolvedOxygen', location_filter, date_range)
        fig2 = get_visualization(data, 'location_comparison', 'Nitrate', location_filter, date_range)
        fig3 = get_visualization(data, 'threshold_analysis', 'EColi', location_filter, date_range)

        fig_static, fig_trend = compute_wqi_feature_importance(df)
        
        if not (fig1['success'] and fig2['success'] and fig3['success']):
            return jsonify(success=False, error="One or more visualizations failed"), 500

        return jsonify({
            'success': True,
            'plotlyData': {
            'metricIndex': json.loads(fig1['plotlyData']),
            'pollutantComparison': json.loads(fig2['plotlyData']),
            'thresholdOverlay': json.loads(fig3['plotlyData']),
            'parameterImpactStatic': json.loads(fig_static.to_json()),
            'parameterImpactTrend': json.loads(fig_trend.to_json())
        }
        })
    except Exception as e:
        return jsonify(success=False, error=str(e)), 500


@app.route('/api/visualize', methods=['POST'])
def visualize():
    try:
        print("Received request to /api/visualize")
        print("Request files:", request.files)
        print("Request form:", request.form)

        if 'csv_file' not in request.files:
            return jsonify(success=False, error="Missing csv_file"), 400

        date_range_raw = request.form.get('date_range', '{}')
        date_range = json.loads(date_range_raw)

        data = request.files['csv_file'].read()
        vis_type = request.form.get('vis_type')
        
        parameter_raw = request.form.get('parameter')

        # Properly parse scatter_plot parameters as a list
        if vis_type == 'scatter_plot':
            parameter = json.loads(parameter_raw) if parameter_raw else []
        else:
            parameter = parameter_raw


        location_filter = json.loads(request.form.get('location_filter', '[]'))

        result = get_visualization(data, vis_type, parameter, location_filter, date_range)
        return jsonify(result)
    
    except Exception as e:
        return jsonify(success=False, error=str(e)), 500


if __name__ == "__main__":
    app.run(debug=True, port=5050)

