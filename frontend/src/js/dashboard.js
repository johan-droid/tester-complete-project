// Dashboard functionality
let performanceChart;

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Initialize performance chart
    initPerformanceChart();
    
    // Initialize dashboard interactions
    initDashboardInteractions();
    
    // Load demo data
    loadDemoData();
}

function initPerformanceChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    // Sample data for the chart
    const performanceData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [{
            label: 'Test Scores',
            data: [65, 70, 75, 80, 78, 85],
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }]
    };
    
    const config = {
        type: 'line',
        data: performanceData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    min: 50,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    };
    
    performanceChart = new Chart(ctx, config);
}

function initDashboardInteractions() {
    // Filter functionality for dashboard
    const filterSelect = document.getElementById('timeFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            updateDashboardData(this.value);
        });
    }
    
    // Simulate real-time updates
    setInterval(() => {
        updateStatsRandomly();
    }, 10000);
}

function updateDashboardData(timeRange) {
    // In a real application, this would fetch new data from the API
    console.log('Updating dashboard for:', timeRange);
    
    // Simulate API call delay
    setTimeout(() => {
        showNotification(`Dashboard updated for ${timeRange}`, 'success');
    }, 1000);
}

function updateStatsRandomly() {
    if (!isAuthenticated()) return;
    
    // This would be replaced with actual API calls in a real application
    const stats = {
        avgScore: document.getElementById('avgScore'),
        testsCompleted: document.getElementById('testsCompleted'),
        weakAreas: document.getElementById('weakAreas'),
        improvement: document.getElementById('improvement')
    };
    
    // Simulate small random changes
    if (stats.avgScore) {
        const currentScore = parseInt(stats.avgScore.textContent);
        const randomChange = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const newScore = Math.max(60, Math.min(95, currentScore + randomChange));
        stats.avgScore.textContent = newScore + '%';
    }
    
    if (stats.testsCompleted) {
        const currentTests = parseInt(stats.testsCompleted.textContent);
        if (Math.random() > 0.7) { // 30% chance to increment
            stats.testsCompleted.textContent = currentTests + 1;
        }
    }
}

function loadDemoData() {
    // This would load actual user data from the API
    if (isAuthenticated()) {
        // Load real user data
        loadUserDashboardData();
    } else {
        // Show demo data
        showDemoDashboard();
    }
}

async function loadUserDashboardData() {
    try {
        // This would be actual API calls to get user-specific data
        const response = await fetch(`${API_BASE_URL}/evaluations/results`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateDashboardWithRealData(data);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showDemoDashboard();
    }
}

function updateDashboardWithRealData(data) {
    // Update dashboard with real user data
    if (data.success && data.data.results) {
        const results = data.data.results;
        
        // Calculate statistics
        const totalTests = results.length;
        const avgScore = results.reduce((sum, result) => sum + result.percentage, 0) / totalTests;
        const weakAreas = calculateWeakAreas(results);
        
        // Update UI
        document.getElementById('avgScore').textContent = Math.round(avgScore) + '%';
        document.getElementById('testsCompleted').textContent = totalTests;
        document.getElementById('weakAreas').textContent = weakAreas.length + ' Topics';
        
        // Update chart
        updateChartWithRealData(results);
    }
}

function calculateWeakAreas(results) {
    // Simple implementation - in real app, use more sophisticated analysis
    const weakAreas = new Set();
    
    results.forEach(result => {
        if (result.percentage < 70) {
            result.evaluation?.weakAreas?.forEach(area => weakAreas.add(area));
        }
    });
    
    return Array.from(weakAreas);
}

function updateChartWithRealData(results) {
    // Update chart with real data
    const labels = results.map((result, index) => `Test ${index + 1}`);
    const scores = results.map(result => result.percentage);
    
    performanceChart.data.labels = labels;
    performanceChart.data.datasets[0].data = scores;
    performanceChart.update();
}

function showDemoDashboard() {
    // Show attractive demo data for unauthenticated users
    const demoData = {
        avgScore: 78,
        testsCompleted: 24,
        weakAreas: 3,
        improvement: 12
    };
    
    document.getElementById('avgScore').textContent = demoData.avgScore + '%';
    document.getElementById('testsCompleted').textContent = demoData.testsCompleted;
    document.getElementById('weakAreas').textContent = demoData.weakAreas + ' Topics';
    document.getElementById('improvement').textContent = '+' + demoData.improvement + '%';
}