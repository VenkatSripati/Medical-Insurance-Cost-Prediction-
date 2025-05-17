from flask import Flask, request, render_template, jsonify, session
import pickle
import numpy as np
import os
import json
from datetime import datetime

app = Flask(__name__, template_folder='./templates', static_folder='./static')
app.secret_key = 'medical_cost_prediction_secret_key'

# Load the model
try:
    with open("rf_model_new.pkl", 'rb') as file:
        model = pickle.load(file)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# BMI calculation function
def calculate_bmi(weight, height):
    """Calculate BMI from weight (kg) and height (cm)"""
    # Convert height from cm to m
    height_m = height / 100
    # Calculate BMI
    bmi = weight / (height_m * height_m)
    return round(bmi, 2)

# BMI category function
def get_bmi_category(bmi):
    """Return BMI category based on BMI value"""
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25:
        return "Normal weight"
    elif bmi < 30:
        return "Overweight"
    else:
        return "Obese"

# Routes
@app.route('/')
def home():
    return render_template('modern/index.html')

@app.route('/about')
def about():
    return render_template('modern/about.html')

@app.route('/calculate-bmi', methods=['POST'])
def bmi_calculator():
    try:
        data = request.get_json()
        weight = float(data.get('weight', 0))
        height = float(data.get('height', 0))

        if weight <= 0 or height <= 0:
            return jsonify({'error': 'Please enter valid weight and height values'}), 400

        bmi = calculate_bmi(weight, height)
        category = get_bmi_category(bmi)

        return jsonify({
            'bmi': bmi,
            'category': category
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if request.is_json:
            # Handle JSON request (API)
            data = request.get_json()
            features = [
                int(data.get('age', 0)),
                int(data.get('gender', 0)),
                float(data.get('bmi', 0)),
                int(data.get('children', 0)),
                int(data.get('smoker', 0)),
                int(data.get('region', 0))
            ]
        else:
            # Handle form submission
            features = []
            for key in ['age', 'gender', 'bmi', 'children', 'smoker', 'region']:
                value = request.form.get(key, '0')
                features.append(float(value) if key == 'bmi' else int(value))

        print(f"Features: {features}")
        final = np.array(features).reshape((1, 6))

        if model is not None:
            pred = model.predict(final)[0]
            print(f"Prediction: {pred}")

            # Store prediction in session
            prediction_data = {
                'amount': float(pred),
                'features': {
                    'age': features[0],
                    'gender': 'Female' if features[1] == 1 else 'Male',
                    'bmi': features[2],
                    'children': features[3],
                    'smoker': 'Yes' if features[4] == 1 else 'No',
                    'region': ['Northwest', 'Northeast', 'Southeast', 'Southwest'][features[5]]
                },
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }

            # Store in session
            if 'predictions' not in session:
                session['predictions'] = []

            session['predictions'].insert(0, prediction_data)
            # Keep only the last 5 predictions
            session['predictions'] = session['predictions'][:5]
            session['current_prediction'] = prediction_data

            if request.is_json:
                return jsonify({
                    'success': True,
                    'prediction': pred,
                    'formatted_prediction': f"${pred:,.2f}"
                })
            else:
                return render_template('modern/result.html',
                                      prediction=prediction_data,
                                      formatted_amount=f"${pred:,.2f}")
        else:
            error_msg = 'Error: Model not loaded'
            if request.is_json:
                return jsonify({'error': error_msg}), 500
            else:
                return render_template('modern/error.html', error=error_msg)

    except Exception as e:
        error_msg = f"Error during prediction: {str(e)}"
        print(error_msg)
        if request.is_json:
            return jsonify({'error': error_msg}), 500
        else:
            return render_template('modern/error.html', error=error_msg)

@app.route('/history')
def history():
    predictions = session.get('predictions', [])
    return render_template('modern/history.html', predictions=predictions)

@app.route('/clear-history', methods=['POST'])
def clear_history():
    session.pop('predictions', None)
    return jsonify({'success': True})

if __name__ == '__main__':
    print("Starting the Modern Medical Cost Prediction web application...")
    print("Access the website at: http://127.0.0.1:5001")
    app.run(debug=True, host='127.0.0.1', port=5001)
