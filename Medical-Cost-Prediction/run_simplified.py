from flask import Flask, request, render_template
import pickle
import numpy as np

app = Flask(__name__, template_folder='./templates', static_folder='./static')

# Load the model
try:
    with open("rf_tuned.pkl", 'rb') as file:  
        model = pickle.load(file)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/predict', methods=['POST','GET'])
def predict():
    if request.method == 'POST':
        try:
            features = [int(x) for x in request.form.values()]
            print(f"Features: {features}")
            
            final = np.array(features).reshape((1,6))
            print(f"Reshaped features: {final}")
            
            if model is not None:
                pred = model.predict(final)[0]
                print(f"Prediction: {pred}")
                
                if pred < 0:
                    return render_template('op.html', pred='Error calculating Amount!')
                else:
                    return render_template('op.html', pred=f'Expected amount is {pred:.3f}')
            else:
                return render_template('op.html', pred='Error: Model not loaded')
        except Exception as e:
            print(f"Error during prediction: {e}")
            return render_template('op.html', pred=f'Error: {str(e)}')
    return render_template('home.html')

if __name__ == '__main__':
    print("Starting the Medical Cost Prediction web application...")
    print("Access the website at: http://127.0.0.1:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)
