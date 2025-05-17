import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle

print("Loading dataset...")
# Load the dataset
data = pd.read_csv('insurance.csv')

# Convert categorical variables to numerical
print("Processing data...")
data['sex'] = data['sex'].map({'male': 0, 'female': 1})
data['smoker'] = data['smoker'].map({'no': 0, 'yes': 1})
data['region'] = data['region'].map({'northwest': 0, 'northeast': 1, 'southeast': 2, 'southwest': 3})

# Split features and target
X = data.drop('charges', axis=1)
y = data['charges']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale the features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Create and train the model
print("Training model...")
rf_model = RandomForestRegressor(
    n_estimators=1200,
    max_depth=50,
    min_samples_split=7,
    min_samples_leaf=12,
    random_state=42
)
rf_model.fit(X_train_scaled, y_train)

# Save the model
print("Saving model...")
with open('rf_model_new.pkl', 'wb') as file:
    pickle.dump(rf_model, file)

print("Model created and saved successfully!")
