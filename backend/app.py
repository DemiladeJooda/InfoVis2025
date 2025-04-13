from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from visualization import get_visualization

app = Flask(__name__)
# Allow only frontend origin
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

@app.route('/')
def index():
    return 'Backend is running'

@app.route('/api/visualize', methods=['POST'])
def visualize():
    try:
        print("Received request to /api/visualize")
        print("Request files:", request.files)
        print("Request form:", request.form)

        if 'csv_file' not in request.files:
            return jsonify(success=False, error="Missing csv_file"), 400

        data = request.files['csv_file'].read()
        vis_type = request.form.get('vis_type')
        parameter = request.form.get('parameter')
        location_filter = json.loads(request.form.get('location_filter', '[]'))

        result = get_visualization(data, vis_type, parameter, location_filter)
        return jsonify(result)
    
    except Exception as e:
        return jsonify(success=False, error=str(e)), 500

if __name__ == '__main__':
    app.run(debug=True, port=5050)
