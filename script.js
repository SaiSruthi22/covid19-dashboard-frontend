// Global variables
let covidData = null;
let countriesList = [];
let timeSeriesChart = null;
let vaccinationChart = null;

// DOM elements
const countrySelect = document.getElementById('country-select');
const metricSelect = document.getElementById('metric-select');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const updateBtn = document.getElementById('update-btn');

// Summary elements
const totalCasesElement = document.getElementById('total-cases');
const totalDeathsElement = document.getElementById('total-deaths');
const totalRecoveredElement = document.getElementById('total-recovered');
const activeCasesElement = document.getElementById('active-cases');
const lastUpdatedElement = document.getElementById('last-updated');

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', async () => {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    startDateInput.valueAsDate = startDate;
    endDateInput.valueAsDate = endDate;
    
    // Load data
    await loadData();
    
    // Initialize charts
    initializeCharts();
    
    // Set up event listeners
    updateBtn.addEventListener('click', updateDashboard);
});

async function loadData() {
    try {
        // In a real application, you would fetch this from an API
        // For this example, we'll use a simulated delay
        console.log("Loading data...");
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demonstration, we'll use sample data structure
        // In a real app, you would fetch from an actual API or your Python backend
        covidData = {
            global: {
                cases: 600000000,
                deaths: 6500000,
                recovered: 580000000,
                active: 13600000,
                updated: new Date().toISOString()
            },
            countries: [
                { name: "USA", cases: 95000000, deaths: 1050000, recovered: 92000000, active: 1800000, casesPer100k: 28500 },
                { name: "India", cases: 44000000, deaths: 530000, recovered: 43000000, active: 170000, casesPer100k: 3200 },
                { name: "Brazil", cases: 34000000, deaths: 680000, recovered: 33000000, active: 20000, casesPer100k: 16000 },
                // More countries...
            ],
            timeSeries: generateSampleTimeSeries(),
            vaccinations: generateSampleVaccinationData()
        };
        
        // Populate country dropdown
        countriesList = covidData.countries.map(country => country.name);
        populateCountryDropdown();
        
        // Update summary
        updateSummary(covidData.global);
        
        // Update last updated time
        lastUpdatedElement.textContent = new Date(covidData.global.updated).toLocaleString();
        
        console.log("Data loaded successfully");
    } catch (error) {
        console.error("Error loading data:", error);
        alert("Failed to load data. Please try again later.");
    }
}

function populateCountryDropdown() {
    countrySelect.innerHTML = '<option value="global">Global</option>';
    
    countriesList.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}

function updateSummary(summaryData) {
    totalCasesElement.textContent = summaryData.cases.toLocaleString();
    totalDeathsElement.textContent = summaryData.deaths.toLocaleString();
    totalRecoveredElement.textContent = summaryData.recovered.toLocaleString();
    activeCasesElement.textContent = summaryData.active.toLocaleString();
}

function initializeCharts() {
    // Time series chart
    const timeSeriesCtx = document.getElementById('time-series-chart').getContext('2d');
    timeSeriesChart = new Chart(timeSeriesCtx, {
        type: 'line',
        data: {
            labels: covidData.timeSeries.dates,
            datasets: [
                {
                    label: 'Cases',
                    data: covidData.timeSeries.cases,
                    borderColor: 'rgba(243, 156, 18, 0.8)',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Deaths',
                    data: covidData.timeSeries.deaths,
                    borderColor: 'rgba(231, 76, 60, 0.8)',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'COVID-19 Cases and Deaths Over Time'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
    
    // Top countries chart (using Plotly)
    updateTopCountriesChart();
    
    // Vaccination chart
    const vaccinationCtx = document.getElementById('vaccination-chart').getContext('2d');
    vaccinationChart = new Chart(vaccinationCtx, {
        type: 'bar',
        data: {
            labels: covidData.vaccinations.countries,
            datasets: [
                {
                    label: 'Fully Vaccinated (%)',
                    data: covidData.vaccinations.fullyVaccinated,
                    backgroundColor: 'rgba(46, 204, 113, 0.7)'
                },
                {
                    label: 'At Least One Dose (%)',
                    data: covidData.vaccinations.oneDose,
                    backgroundColor: 'rgba(52, 152, 219, 0.7)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Vaccination Progress by Country'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Percentage of Population'
                    }
                }
            }
        }
    });
    
    // Heatmap (using Plotly)
    updateHeatmap();
}

function updateTopCountriesChart() {
    const selectedMetric = metricSelect.value;
    const metricLabel = metricSelect.options[metricSelect.selectedIndex].text;
    
    // Sort countries by selected metric
    const sortedCountries = [...covidData.countries]
        .sort((a, b) => b[selectedMetric] - a[selectedMetric])
        .slice(0, 10);
    
    const trace = {
        x: sortedCountries.map(country => country[selectedMetric]),
        y: sortedCountries.map(country => country.name),
        type: 'bar',
        orientation: 'h',
        marker: {
            color: selectedMetric === 'deaths' ? 'rgba(231, 76, 60, 0.7)' : 'rgba(243, 156, 18, 0.7)'
        }
    };
    
    const layout = {
        title: `Top 10 Countries by ${metricLabel}`,
        xaxis: {
            title: metricLabel
        },
        yaxis: {
            autorange: 'reversed'
        },
        height: 300,
        margin: {
            l: 150,
            r: 50,
            b: 50,
            t: 50,
            pad: 4
        }
    };
    
    Plotly.newPlot('top-countries-chart', [trace], layout);
}

function updateHeatmap() {
    // In a real app, this would use actual geographic data
    // This is a simplified example
    
    const data = [{
        type: 'choropleth',
        locations: ['USA', 'CAN', 'MEX', 'BRA', 'ARG', 'GBR', 'FRA', 'DEU', 'ITA', 'ESP', 'CHN', 'IND', 'JPN', 'AUS', 'ZAF'],
        z: [100, 85, 75, 65, 55, 90, 80, 85, 70, 65, 40, 30, 50, 60, 45],
        text: ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'UK', 'France', 'Germany', 'Italy', 'Spain', 'China', 'India', 'Japan', 'Australia', 'South Africa'],
        colorscale: [
            [0, 'rgb(242, 240, 247)'],
            [0.2, 'rgb(218, 218, 235)'],
            [0.4, 'rgb(188, 189, 220)'],
            [0.6, 'rgb(158, 154, 200)'],
            [0.8, 'rgb(117, 107, 177)'],
            [1, 'rgb(84, 39, 143)']
        ],
        autocolorscale: false,
        reversescale: true,
        marker: {
            line: {
                color: 'rgb(180,180,180)',
                width: 0.5
            }
        },
        colorbar: {
            title: 'Cases per 100k'
        }
    }];
    
    const layout = {
        title: 'COVID-19 Cases Heatmap',
        geo: {
            showframe: false,
            showcoastlines: false,
            projection: {
                type: 'natural earth'
            }
        },
        height: 500
    };
    
    Plotly.newPlot('heatmap', data, layout, {showLink: false});
}

function updateDashboard() {
    const selectedCountry = countrySelect.value;
    const selectedMetric = metricSelect.value;
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    
    console.log(`Updating dashboard for ${selectedCountry} with metric ${selectedMetric} from ${startDate} to ${endDate}`);
    
    // Update time series chart with filtered data
    updateTimeSeriesChart(startDate, endDate);
    
    // Update top countries chart
    updateTopCountriesChart();
    
    // In a real app, you would also filter other visualizations
}

function updateTimeSeriesChart(startDate, endDate) {
    // In a real app, you would filter the time series data based on dates
    // For this example, we'll just update the chart with the full dataset
    
    timeSeriesChart.data.labels = covidData.timeSeries.dates;
    timeSeriesChart.data.datasets[0].data = covidData.timeSeries.cases;
    timeSeriesChart.data.datasets[1].data = covidData.timeSeries.deaths;
    timeSeriesChart.update();
}

// Helper functions for sample data
function generateSampleTimeSeries() {
    const dates = [];
    const cases = [];
    const deaths = [];
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    for (let i = 0; i < 30; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        dates.push(currentDate.toLocaleDateString());
        
        // Generate somewhat realistic looking data with some randomness
        const baseCases = 100000 + i * 50000;
        const baseDeaths = 1000 + i * 200;
        
        cases.push(baseCases + Math.random() * 20000);
        deaths.push(baseDeaths + Math.random() * 100);
    }
    
    return { dates, cases, deaths };
}

function generateSampleVaccinationData() {
    const countries = ['USA', 'UK', 'Canada', 'Germany', 'France', 'Italy', 'Spain', 'Japan', 'Australia', 'Brazil'];
    const fullyVaccinated = [65, 70, 75, 72, 68, 73, 76, 62, 75, 60];
    const oneDose = [75, 80, 82, 78, 75, 80, 82, 70, 80, 68];
    
    return { countries, fullyVaccinated, oneDose };
}