// Main JavaScript for Medical Cost Prediction App
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    initThemeToggle();
    
    // BMI Calculator
    initBmiCalculator();
    
    // Form validation
    initFormValidation();
    
    // Initialize charts if they exist
    initCharts();
});

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    if (!themeToggle || !themeIcon) return;
    
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Apply the theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
            themeToggle.setAttribute('title', 'Switch to light mode');
        } else {
            themeIcon.className = 'fas fa-moon';
            themeToggle.setAttribute('title', 'Switch to dark mode');
        }
    }
}

// BMI Calculator functionality
function initBmiCalculator() {
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const calculateBmiBtn = document.getElementById('calculate-bmi');
    const bmiResult = document.getElementById('bmi-result');
    const bmiValue = document.getElementById('bmi-value');
    const bmiCategory = document.getElementById('bmi-category');
    const bmiInput = document.getElementById('bmi-input');
    
    if (!weightInput || !heightInput || !calculateBmiBtn) return;
    
    // Calculate BMI when button is clicked
    calculateBmiBtn.addEventListener('click', calculateBMI);
    
    // Real-time BMI calculation as user types (with debounce)
    weightInput.addEventListener('input', debounce(calculateBMI, 500));
    heightInput.addEventListener('input', debounce(calculateBMI, 500));
    
    function calculateBMI() {
        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);
        
        if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
            if (bmiResult) bmiResult.style.display = 'none';
            return;
        }
        
        // Calculate BMI: weight (kg) / (height (m))^2
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        const roundedBMI = Math.round(bmi * 10) / 10;
        
        // Display result
        if (bmiValue) bmiValue.textContent = roundedBMI.toFixed(1);
        
        // Determine category
        let category, categoryClass;
        if (bmi < 18.5) {
            category = 'Underweight';
            categoryClass = 'category-warning';
        } else if (bmi < 25) {
            category = 'Normal weight';
            categoryClass = 'category-success';
        } else if (bmi < 30) {
            category = 'Overweight';
            categoryClass = 'category-warning';
        } else {
            category = 'Obese';
            categoryClass = 'category-danger';
        }
        
        if (bmiCategory) {
            bmiCategory.textContent = category;
            bmiCategory.className = 'bmi-category ' + categoryClass;
        }
        
        // Show result
        if (bmiResult) bmiResult.style.display = 'block';
        
        // Update BMI input in prediction form
        if (bmiInput) {
            bmiInput.value = roundedBMI.toFixed(1);
        }
    }
}

// Form validation
function initFormValidation() {
    const predictionForm = document.getElementById('prediction-form');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    if (!predictionForm) return;
    
    predictionForm.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
        } else if (loadingOverlay) {
            // Show loading spinner
            loadingOverlay.style.display = 'flex';
        }
    });
    
    function validateForm() {
        let isValid = true;
        const inputs = predictionForm.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            const errorElement = document.getElementById(`${input.id}-error`);
            
            // Skip validation for hidden inputs
            if (input.type === 'hidden') return;
            
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
                if (errorElement) {
                    errorElement.textContent = 'This field is required';
                    errorElement.style.display = 'block';
                }
            } else {
                input.classList.remove('error');
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            }
        });
        
        return isValid;
    }
}

// Initialize charts
function initCharts() {
    const resultChart = document.getElementById('result-chart');
    
    if (resultChart && window.Chart) {
        // Get prediction data from the page
        const predictionDataElement = document.getElementById('prediction-data');
        if (!predictionDataElement) return;
        
        try {
            const predictionData = JSON.parse(predictionDataElement.textContent);
            
            // Create chart
            new Chart(resultChart, {
                type: 'bar',
                data: {
                    labels: ['Age', 'BMI', 'Children', 'Smoker', 'Region'],
                    datasets: [{
                        label: 'Factor Impact',
                        data: [
                            predictionData.features.age * 250,
                            predictionData.features.bmi * 300,
                            predictionData.features.children * 1000,
                            predictionData.features.smoker === 'Yes' ? 20000 : 0,
                            2000
                        ],
                        backgroundColor: [
                            'rgba(74, 107, 175, 0.7)',
                            'rgba(255, 107, 107, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(255, 159, 64, 0.7)',
                            'rgba(153, 102, 255, 0.7)'
                        ],
                        borderColor: [
                            'rgba(74, 107, 175, 1)',
                            'rgba(255, 107, 107, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(153, 102, 255, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Estimated Impact on Cost ($)'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error initializing chart:', error);
        }
    }
}

// Utility function to debounce input events
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            func.apply(context, args);
        }, wait);
    };
}
