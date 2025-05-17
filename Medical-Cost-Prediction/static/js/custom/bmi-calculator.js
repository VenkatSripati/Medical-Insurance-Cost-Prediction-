// BMI Calculator functionality
document.addEventListener('DOMContentLoaded', function() {
    const bmiForm = document.getElementById('bmi-calculator-form');
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const bmiResult = document.getElementById('bmi-result');
    const bmiValue = document.getElementById('bmi-value');
    const bmiCategory = document.getElementById('bmi-category');
    const bmiChart = document.getElementById('bmi-chart');
    
    if (bmiForm) {
        bmiForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateBMI();
        });
    }
    
    // Real-time BMI calculation as user types
    if (weightInput && heightInput) {
        weightInput.addEventListener('input', debounce(calculateBMI, 500));
        heightInput.addEventListener('input', debounce(calculateBMI, 500));
    }
    
    function calculateBMI() {
        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);
        
        if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
            bmiResult.classList.add('hidden');
            return;
        }
        
        // Calculate BMI: weight (kg) / (height (m))^2
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        const roundedBMI = Math.round(bmi * 10) / 10;
        
        // Display result
        bmiValue.textContent = roundedBMI.toFixed(1);
        
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
        
        bmiCategory.textContent = category;
        bmiCategory.className = categoryClass;
        
        // Show result
        bmiResult.classList.remove('hidden');
        
        // Update BMI input in prediction form if it exists
        const predictionBmiInput = document.getElementById('bmi');
        if (predictionBmiInput) {
            predictionBmiInput.value = roundedBMI.toFixed(1);
        }
        
        // Update chart if it exists
        updateBMIChart(roundedBMI);
    }
    
    function updateBMIChart(bmi) {
        if (!bmiChart || !window.Chart) return;
        
        // Destroy existing chart if it exists
        if (window.bmiChartInstance) {
            window.bmiChartInstance.destroy();
        }
        
        // Create data for BMI chart
        const data = {
            labels: ['Underweight', 'Normal', 'Overweight', 'Obese'],
            datasets: [{
                label: 'BMI Range',
                data: [18.5, 25, 30, 40],
                backgroundColor: [
                    'rgba(255, 193, 7, 0.2)',
                    'rgba(40, 167, 69, 0.2)',
                    'rgba(255, 193, 7, 0.2)',
                    'rgba(220, 53, 69, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 193, 7, 1)',
                    'rgba(40, 167, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 1
            }]
        };
        
        // Add marker for current BMI
        const ctx = bmiChart.getContext('2d');
        window.bmiChartInstance = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 40
                    }
                },
                plugins: {
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                yMin: bmi,
                                yMax: bmi,
                                borderColor: 'rgb(255, 99, 132)',
                                borderWidth: 2,
                                label: {
                                    content: `Your BMI: ${bmi}`,
                                    enabled: true
                                }
                            }
                        }
                    }
                }
            }
        });
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
});
