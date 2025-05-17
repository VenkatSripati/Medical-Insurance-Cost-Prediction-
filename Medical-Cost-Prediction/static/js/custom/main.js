// Theme management
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Apply the theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Toggle theme when button is clicked
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
    
    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
            themeToggle.setAttribute('title', 'Switch to light mode');
        } else {
            themeIcon.className = 'fas fa-moon';
            themeToggle.setAttribute('title', 'Switch to dark mode');
        }
    }
    
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', showTooltip);
        tooltip.addEventListener('mouseleave', hideTooltip);
    });
    
    function showTooltip(e) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = this.getAttribute('data-tooltip');
        document.body.appendChild(tooltip);
        
        const rect = this.getBoundingClientRect();
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
        tooltip.style.opacity = '1';
    }
    
    function hideTooltip() {
        const tooltips = document.querySelectorAll('.tooltip');
        tooltips.forEach(t => t.remove());
    }
    
    // BMI Calculator
    const bmiForm = document.getElementById('bmi-form');
    if (bmiForm) {
        bmiForm.addEventListener('submit', calculateBMI);
    }
    
    function calculateBMI(e) {
        e.preventDefault();
        
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);
        const resultElement = document.getElementById('bmi-result');
        
        if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
            resultElement.innerHTML = '<div class="alert alert-danger">Please enter valid weight and height values</div>';
            return;
        }
        
        // Send request to server
        fetch('/calculate-bmi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ weight, height }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                resultElement.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
            } else {
                let categoryClass = 'info';
                if (data.category === 'Underweight') categoryClass = 'warning';
                if (data.category === 'Overweight') categoryClass = 'warning';
                if (data.category === 'Obese') categoryClass = 'danger';
                if (data.category === 'Normal weight') categoryClass = 'success';
                
                resultElement.innerHTML = `
                    <div class="bmi-result-card">
                        <div class="bmi-value">${data.bmi}</div>
                        <div class="bmi-category category-${categoryClass}">${data.category}</div>
                        <div class="bmi-info">
                            <p>BMI Categories:</p>
                            <ul>
                                <li>Underweight: BMI less than 18.5</li>
                                <li>Normal weight: BMI 18.5 to 24.9</li>
                                <li>Overweight: BMI 25 to 29.9</li>
                                <li>Obese: BMI 30 or greater</li>
                            </ul>
                        </div>
                    </div>
                `;
                
                // Auto-fill BMI in prediction form if it exists
                const bmiInput = document.getElementById('bmi');
                if (bmiInput) {
                    bmiInput.value = data.bmi;
                }
            }
        })
        .catch(error => {
            resultElement.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        });
    }
    
    // Form validation
    const predictionForm = document.getElementById('prediction-form');
    if (predictionForm) {
        predictionForm.addEventListener('submit', function(e) {
            if (!validateForm()) {
                e.preventDefault();
            } else {
                // Show loading spinner
                document.getElementById('loading-overlay').style.display = 'flex';
            }
        });
    }
    
    function validateForm() {
        let isValid = true;
        const inputs = predictionForm.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            const errorElement = document.getElementById(`${input.id}-error`);
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
    
    // Clear history
    const clearHistoryBtn = document.getElementById('clear-history');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear your prediction history?')) {
                fetch('/clear-history', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.reload();
                    }
                });
            }
        });
    }
    
    // Initialize charts if they exist
    const predictionChart = document.getElementById('prediction-chart');
    if (predictionChart && window.Chart) {
        initializeChart();
    }
    
    function initializeChart() {
        // Get prediction data from the page
        const predictionData = JSON.parse(document.getElementById('prediction-data').textContent);
        
        // Create chart
        new Chart(predictionChart, {
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
    }
});
