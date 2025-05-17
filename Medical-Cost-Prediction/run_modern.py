from app_modern import app

if __name__ == '__main__':
    print("Starting the Modern Medical Cost Prediction web application...")
    print("Access the website at: http://127.0.0.1:5001")
    app.run(debug=True, host='127.0.0.1', port=5001)
