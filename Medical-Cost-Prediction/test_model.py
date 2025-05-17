import pickle
import os

print("Current working directory:", os.getcwd())
print("Checking if model file exists:", os.path.exists("rf_tuned.pkl"))

try:
    print("Attempting to load the model...")
    with open("rf_tuned.pkl", 'rb') as file:
        model = pickle.load(file)
    print("Model loaded successfully!")
    print("Model type:", type(model))
except Exception as e:
    print(f"Error loading model: {e}")
