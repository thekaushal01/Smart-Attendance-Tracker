let attendanceData = null;
let charts = {};

// Theme management
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light Mode';
        localStorage.setItem('theme', 'dark');
    }
}

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('theme-icon').textContent = '☀️';
        document.getElementById('theme-text').textContent = 'Light Mode';
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const fetchBtn = document.getElementById('fetchBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('loadingSpinner');
    
    // Show loading state
    fetchBtn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    
    try {
        const response = await fetch('/fetch_attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            attendanceData = data;
            displayDashboard(data);
            showNotification('Attendance data fetched successfully!');
            document.getElementById('refreshBtn').classList.add('show');
        } else {
            showError(data.message || 'Failed to fetch attendance data');
        }
    } catch (error) {
        showError('Network error: ' + error.message);
    } finally {
        // Reset loading state
        fetchBtn.disabled = false;
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
    }
});

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerHTML = `<div class="error-message">❌ ${message}</div>`;
    setTimeout(() => errorDiv.innerHTML = '', 5000);
    showNotification(message, 'error');
}

function displayDashboard(data) {
    // Show dashboard
    document.getElementById('dashboard').classList.add('active');
    
    // Update overall stats
    const overall = data.overall;
    document.getElementById('overallPercentage').textContent = overall.percentage + '%';
    document.getElementById('totalClasses').textContent = overall.total;
    document.getElementById('attendedClasses').textContent = overall.attended;
    document.getElementById('subjectCount').textContent = data.subjects.length;
    
    // Update progress ring
    updateProgressRing('overallProgress', parseFloat(overall.percentage));
    
    // Display subjects
    displaySubjects(data.subjects);
    
    // Force chart refresh with new data (ensures charts always update)
    setTimeout(() => {
        forceChartRefresh(data);
    }, 300);
}

function updateProgressRing(id, percentage) {
    const circle = document.getElementById(id);
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const progress = (percentage / 100) * circumference;
    
    circle.style.strokeDasharray = `${progress} ${circumference}`;
    
    // Color based on percentage
    if (percentage >= 75) {
        circle.style.stroke = '#10b981';
    } else if (percentage >= 60) {
        circle.style.stroke = '#f59e0b';
    } else {
        circle.style.stroke = '#ef4444';
    }
}

function displaySubjects(subjects) {
    const gridContainer = document.getElementById('subjectsGrid');
    const listContainer = document.getElementById('subjectsList');
    
    gridContainer.innerHTML = '';
    listContainer.innerHTML = '';
    
    subjects.forEach(subject => {
        const percentage = parseFloat(subject.percentage);
        const badgeClass = percentage >= 75 ? 'badge-success' : 
                          percentage >= 60 ? 'badge-warning' : 'badge-danger';
        
        // Grid view card
        const gridCard = document.createElement('div');
        gridCard.className = 'subject-card';
        gridCard.innerHTML = `
            <div class="subject-header">
                <div class="subject-name">${subject.subject}</div>
                <div class="attendance-badge ${badgeClass}">${subject.percentage}%</div>
            </div>
            <div class="subject-stats">
                <div class="stat-item">
                    <div class="stat-number">${subject.attended}</div>
                    <div class="stat-text">Attended</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${subject.total}</div>
                    <div class="stat-text">Total</div>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%; background-color: ${getProgressColor(percentage)};"></div>
            </div>
            <div class="recommendations">
                ${generateRecommendations(subject)}
            </div>
        `;
        gridContainer.appendChild(gridCard);
        
        // List view item
        const listItem = document.createElement('div');
        listItem.className = 'list-item';
        listItem.innerHTML = `
            <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">${subject.subject}</div>
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px;">
                    ${subject.attended}/${subject.total} classes attended
                </div>
                <div class="progress-bar" style="margin: 0; width: 100%; max-width: 200px;">
                    <div class="progress-fill" style="width: ${percentage}%; background-color: ${getProgressColor(percentage)};"></div>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
                    ${percentage < 75 && subject.needed_75 > 0 ? `Need ${subject.needed_75} more for 75%` : ''}
                    ${subject.can_miss_75 > 0 ? `Can miss ${subject.can_miss_75} classes and maintain 75%` : ''}
                </div>
            </div>
            <div class="attendance-badge ${badgeClass}">${subject.percentage}%</div>
        `;
        listContainer.appendChild(listItem);
    });
}

function getProgressColor(percentage) {
    if (percentage >= 75) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
}

function generateRecommendations(subject) {
    const recommendations = [];
    const percentage = parseFloat(subject.percentage);
    
    if (percentage < 60) {
        // Below 60%: Show classes needed for both 60% and 75%
        recommendations.push(`
            <div class="recommendation">
                <div class="recommendation-icon icon-warning"></div>
                <span>Need ${subject.needed_60} more classes to reach 60%</span>
            </div>
        `);
        recommendations.push(`
            <div class="recommendation">
                <div class="recommendation-icon icon-info"></div>
                <span>Need ${subject.needed_75} more classes to reach 75%</span>
            </div>
        `);
    } else if (percentage >= 60 && percentage < 75) {
        // Between 60-75%: Show classes can miss for 60% and classes needed for 75%
        recommendations.push(`
            <div class="recommendation">
                <div class="recommendation-icon icon-success"></div>
                <span>Can miss ${subject.can_miss_60} classes and maintain 60%</span>
            </div>
        `);
        recommendations.push(`
            <div class="recommendation">
                <div class="recommendation-icon icon-info"></div>
                <span>Need ${subject.needed_75} more classes to reach 75%</span>
            </div>
        `);
    } else {
        // Above 75%: Show classes can miss for both 60% and 75%
        recommendations.push(`
            <div class="recommendation">
                <div class="recommendation-icon icon-success"></div>
                <span>Can miss ${subject.can_miss_60} classes and maintain 60%</span>
            </div>
        `);
        recommendations.push(`
            <div class="recommendation">
                <div class="recommendation-icon icon-success"></div>
                <span>Can miss ${subject.can_miss_75} classes and maintain 75%</span>
            </div>
        `);
    }
    
    return recommendations.join('');
}

function createCharts(data) {
    // Only create charts if containers exist and data is valid
    const attendanceCanvas = document.getElementById('attendanceChart');
    const performanceCanvas = document.getElementById('performanceChart');
    
    if (!attendanceCanvas || !performanceCanvas || !data || !data.subjects) {
        console.log('Chart containers or data not available');
        return;
    }
    
    // Destroy existing charts to prevent memory leaks and ensure fresh data
    if (charts.attendance) {
        charts.attendance.destroy();
        charts.attendance = null;
    }
    if (charts.performance) {
        charts.performance.destroy();
        charts.performance = null;
    }
    
    // Clear canvas contexts
    const attendanceCtx = attendanceCanvas.getContext('2d');
    const performanceCtx = performanceCanvas.getContext('2d');
    attendanceCtx.clearRect(0, 0, attendanceCanvas.width, attendanceCanvas.height);
    performanceCtx.clearRect(0, 0, performanceCanvas.width, performanceCanvas.height);
    
    try {
        // Attendance Distribution Chart (Doughnut) - ALWAYS RECREATED WITH FRESH DATA
        const attendanceLabels = ['Below 60%', '60-75%', 'Above 75%'];
        const attendanceCounts = [0, 0, 0];
        
        // Process current data (not cached)
        data.subjects.forEach(subject => {
            const percentage = parseFloat(subject.percentage);
            if (percentage < 60) attendanceCounts[0]++;
            else if (percentage < 75) attendanceCounts[1]++;
            else attendanceCounts[2]++;
        });
        
        console.log('Creating attendance chart with data:', attendanceCounts);
        
        charts.attendance = new Chart(attendanceCtx, {
            type: 'doughnut',
            data: {
                labels: attendanceLabels,
                datasets: [{
                    data: attendanceCounts,
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                    borderColor: ['#dc2626', '#d97706', '#059669'],
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.2,
                layout: {
                    padding: 10
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = data.subjects.length;
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} subjects (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 800
                }
            }
        });
        
        // Subject Performance Chart (Bar) - ALWAYS RECREATED WITH FRESH DATA
        // Sort subjects by percentage for better visualization (use fresh data)
        const sortedSubjects = [...data.subjects].sort((a, b) => 
            parseFloat(b.percentage) - parseFloat(a.percentage)
        );
        
        const subjectNames = sortedSubjects.map(s => 
            s.subject.length > 10 ? s.subject.substring(0, 10) + '...' : s.subject
        );
        const percentages = sortedSubjects.map(s => parseFloat(s.percentage));
        const backgroundColors = percentages.map(p => {
            if (p >= 75) return '#10b981';
            if (p >= 60) return '#f59e0b';
            return '#ef4444';
        });
        
        console.log('Creating performance chart with subjects:', subjectNames.length);
        
        charts.performance = new Chart(performanceCtx, {
            type: 'bar',
            data: {
                labels: subjectNames,
                datasets: [{
                    label: 'Attendance Percentage',
                    data: percentages,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors,
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.2,
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10,
                        left: 5,
                        right: 5
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            },
                            font: {
                                size: 10
                            },
                            maxTicksLimit: 6
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0,
                            font: {
                                size: 9
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const index = context[0].dataIndex;
                                return sortedSubjects[index].subject;
                            },
                            label: function(context) {
                                const index = context.dataIndex;
                                const subject = sortedSubjects[index];
                                return [
                                    `Attendance: ${context.parsed.y}%`,
                                    `Attended: ${subject.attended}/${subject.total} classes`
                                ];
                            }
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            }
        });
        
        console.log('✅ Charts created successfully with fresh data');
        
    } catch (error) {
        console.error('❌ Error creating charts:', error);
        showNotification('Error creating charts: ' + error.message, 'error');
    }
}

function toggleView(view) {
    const buttons = document.querySelectorAll('.view-toggle button');
    const gridView = document.getElementById('subjectsGrid');
    const listView = document.getElementById('subjectsList');
    
    // Reset all button states
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Set active button
    const clickedButton = event.target;
    clickedButton.classList.add('active');
    
    // Toggle views with proper hiding/showing
    if (view === 'grid') {
        gridView.classList.remove('hidden');
        gridView.style.display = 'grid';
        listView.classList.remove('active');
        listView.classList.add('hidden');
        listView.style.display = 'none';
        console.log('📊 Switched to Grid View');
    } else if (view === 'list') {
        gridView.classList.add('hidden');
        gridView.style.display = 'none';
        listView.classList.add('active');
        listView.classList.remove('hidden');
        listView.style.display = 'block';
        console.log('📋 Switched to List View');
    }
    
    // Save preference
    try {
        localStorage.setItem('viewPreference', view);
    } catch (error) {
        console.warn('Could not save view preference:', error);
    }
}

function simulateAttendance() {
    if (!attendanceData) {
        showNotification('Please fetch attendance data first', 'error');
        return;
    }
    
    const classesToAttend = parseInt(document.getElementById('classesToAttend').value) || 0;
    const classesToMiss = parseInt(document.getElementById('classesToMiss').value) || 0;
    const resultDiv = document.getElementById('predictionResult');
    
    // Calculate new attendance based on both attend and miss
    let newAttended = attendanceData.overall.attended + classesToAttend;
    let newTotal = attendanceData.overall.total + classesToAttend + classesToMiss;
    
    const currentPercentage = parseFloat(attendanceData.overall.percentage);
    const newPercentage = newTotal > 0 ? ((newAttended / newTotal) * 100) : 0;
    const change = (newPercentage - currentPercentage);
    
    // Determine result styling
    const changeClass = change > 0 ? 'success' : change < 0 ? 'danger' : 'warning';
    const changeIcon = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
    const changeText = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'no change';
    
    // Generate recommendation based on new percentage
    let recommendation = '';
    let recommendationClass = 'success-message';
    
    if (newPercentage < 60) {
        recommendation = '⚠️ <strong>Critical:</strong> Below 60% - High risk zone!';
        recommendationClass = 'error-message';
    } else if (newPercentage < 75) {
        recommendation = '⚡ <strong>Warning:</strong> Below 75% - Consider attending more classes';
        recommendationClass = 'warning-message';
    } else {
        recommendation = '✅ <strong>Safe:</strong> Above 75% - Good attendance level!';
        recommendationClass = 'success-message';
    }
    
    // Build result display
    let resultHTML = `
        <div class="${recommendationClass}">
            <strong>Simulation Result:</strong><br>
            After attending ${classesToAttend} and missing ${classesToMiss} classes:<br>
            <div style="margin-top: 12px; font-size: 1.2rem;">
                ${changeIcon} <strong>${newPercentage.toFixed(2)}%</strong> 
                <span style="color: var(--${changeClass === 'success' ? 'success' : changeClass === 'danger' ? 'danger' : 'warning'}-color);">
                    (${change > 0 ? '+' : ''}${change.toFixed(2)}% ${changeText})
                </span>
            </div>
            <div style="margin-top: 8px; font-size: 0.9rem; opacity: 0.8;">
                Total: ${newAttended}/${newTotal} classes
            </div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.2);">
                ${recommendation}
            </div>
        </div>
    `;
    
    // Add additional insights if both values are provided
    if (classesToAttend > 0 && classesToMiss > 0) {
        const attendOnlyPercentage = ((attendanceData.overall.attended + classesToAttend) / (attendanceData.overall.total + classesToAttend) * 100);
        const missOnlyPercentage = (attendanceData.overall.attended / (attendanceData.overall.total + classesToMiss) * 100);
        
        resultHTML += `
            <div style="margin-top: 15px; padding: 12px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; font-size: 0.9rem;">
                <strong>💡 Additional Insights:</strong><br>
                • If only attending ${classesToAttend}: ${attendOnlyPercentage.toFixed(2)}%<br>
                • If only missing ${classesToMiss}: ${missOnlyPercentage.toFixed(2)}%<br>
                • Combined impact: ${newPercentage.toFixed(2)}%
            </div>
        `;
    }
    
    resultDiv.innerHTML = resultHTML;
    
    // Show notification
    showNotification(`Simulation complete: ${newPercentage.toFixed(1)}% attendance projected`);
}

function exportToPDF() {
    if (!attendanceData) {
        showNotification('No data available to export', 'error');
        return;
    }
    
    try {
        // Check if jsPDF is loaded with multiple possible references
        let jsPDF;
        if (window.jspdf && window.jspdf.jsPDF) {
            jsPDF = window.jspdf.jsPDF;
        } else if (window.jsPDF) {
            jsPDF = window.jsPDF;
        } else {
            throw new Error('jsPDF library not found');
        }
        
        const doc = new jsPDF();
        
        // Set font
        doc.setFont('helvetica');
        
        // Title
        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text('Attendance Report', 20, 30);
        
        // Date
        doc.setFontSize(12);
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Generated on: ${currentDate}`, 20, 45);
        
        // Line separator
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 50, 190, 50);
        
        // Overall statistics
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Overall Statistics', 20, 65);
        
        doc.setFontSize(12);
        doc.text(`Total Classes: ${attendanceData.overall.total}`, 30, 80);
        doc.text(`Classes Attended: ${attendanceData.overall.attended}`, 30, 90);
        doc.text(`Attendance Percentage: ${attendanceData.overall.percentage}%`, 30, 100);
        
        if (attendanceData.overall.needed_75 > 0) {
            doc.text(`Classes needed for 75%: ${attendanceData.overall.needed_75}`, 30, 110);
        }
        
        if (attendanceData.overall.can_miss_75 > 0) {
            doc.text(`Classes can miss (maintain 75%): ${attendanceData.overall.can_miss_75}`, 30, 120);
        }
        
        // Subject breakdown
        doc.setFontSize(16);
        doc.text('Subject-wise Breakdown', 20, 140);
        
        let yPosition = 155;
        const pageHeight = doc.internal.pageSize.height;
        
        attendanceData.subjects.forEach((subject, index) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 20;
                doc.setFontSize(16);
                doc.text('Subject-wise Breakdown (continued)', 20, yPosition);
                yPosition += 20;
            }
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            
            // Subject name (truncate if too long)
            const subjectName = subject.subject.length > 30 ? 
                subject.subject.substring(0, 30) + '...' : subject.subject;
            
            doc.text(`${index + 1}. ${subjectName}`, 30, yPosition);
            doc.text(`${subject.attended}/${subject.total} classes`, 120, yPosition);
            doc.text(`(${subject.percentage}%)`, 160, yPosition);
            
            yPosition += 8;
            
            // Add recommendations if any
            const percentage = parseFloat(subject.percentage);
            if (percentage < 75 && subject.needed_75 > 0) {
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text(`   → Need ${subject.needed_75} more classes for 75%`, 30, yPosition);
                yPosition += 6;
            }
            
            if (subject.can_miss_75 > 0) {
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text(`   → Can miss ${subject.can_miss_75} classes (maintain 75%)`, 30, yPosition);
                yPosition += 6;
            }
            
            yPosition += 5; // Extra spacing between subjects
        });
        
        // Footer
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${totalPages} - Generated by Attendance Analyzer`, 
                20, pageHeight - 10);
        }
        
        // Save the PDF
        const fileName = `attendance_report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        showNotification('PDF exported successfully!');
        
    } catch (error) {
        console.error('PDF Export Error:', error);
        
        // Fallback: Generate a simple text report
        generateTextReport();
        showNotification('PDF library unavailable. Text report generated instead.', 'warning');
    }
}

// Fallback text report generator
function generateTextReport() {
    if (!attendanceData) return;
    
    let report = 'ATTENDANCE REPORT\n';
    report += '=================\n\n';
    report += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    
    report += 'OVERALL STATISTICS:\n';
    report += `Total Classes: ${attendanceData.overall.total}\n`;
    report += `Classes Attended: ${attendanceData.overall.attended}\n`;
    report += `Attendance Percentage: ${attendanceData.overall.percentage}%\n\n`;
    
    report += 'SUBJECT-WISE BREAKDOWN:\n';
    report += '========================\n\n';
    
    attendanceData.subjects.forEach((subject, index) => {
        report += `${index + 1}. ${subject.subject}\n`;
        report += `   Attended: ${subject.attended}/${subject.total} classes (${subject.percentage}%)\n`;
        
        if (subject.needed_75 > 0) {
            report += `   → Need ${subject.needed_75} more classes for 75%\n`;
        }
        
        if (subject.can_miss_75 > 0) {
            report += `   → Can miss ${subject.can_miss_75} classes (maintain 75%)\n`;
        }
        
        report += '\n';
    });
    
    // Create and download text file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function exportToCSV() {
    if (!attendanceData) return;
    
    try {
        let csvContent = 'Subject,Total Classes,Attended Classes,Percentage,Classes Needed (75%),Classes Can Miss (75%)\n';
        
        attendanceData.subjects.forEach(subject => {
            csvContent += `"${subject.subject}",${subject.total},${subject.attended},${subject.percentage},${subject.needed_75},${subject.can_miss_75}\n`;
        });
        
        // Add overall row
        const overall = attendanceData.overall;
        csvContent += `"OVERALL",${overall.total},${overall.attended},${overall.percentage},${overall.needed_75},${overall.can_miss_75}\n`;
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'attendance_data.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        
        showNotification('CSV exported successfully!');
    } catch (error) {
        showNotification('Error exporting CSV: ' + error.message, 'error');
    }
}

function refreshData() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username && password) {
        // Prevent multiple simultaneous requests
        const fetchBtn = document.getElementById('fetchBtn');
        if (fetchBtn.disabled) {
            showNotification('Request already in progress...', 'error');
            return;
        }
        
        // Trigger form submission
        const form = document.getElementById('loginForm');
        const submitEvent = new Event('submit', { cancelable: true });
        form.dispatchEvent(submitEvent);
    } else {
        showNotification('Please enter username and password first', 'error');
    }
}

function clearData() {
    if (confirm('Are you sure you want to clear all data?')) {
        // Destroy charts first
        destroyAllCharts();
        
        // Clear data
        attendanceData = null;
        document.getElementById('dashboard').classList.remove('active');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('refreshBtn').classList.remove('show');
        
        // Clear session storage
        try {
            sessionStorage.removeItem('attendanceData');
        } catch (error) {
            console.warn('Could not clear session storage:', error);
        }
        
        // Disable auto-refresh
        disableAutoRefresh();
        
        showNotification('Data cleared successfully!');
    }
}

// Pull to refresh functionality for mobile
let startY = 0;
let pullDistance = 0;
let isPulling = false;

document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
    }
});

document.addEventListener('touchmove', (e) => {
    if (isPulling && window.scrollY === 0) {
        pullDistance = e.touches[0].clientY - startY;
        if (pullDistance > 0 && pullDistance < 100) {
            document.body.style.transform = `translateY(${pullDistance * 0.5}px)`;
        }
    }
});

document.addEventListener('touchend', () => {
    if (isPulling && pullDistance > 60) {
        refreshData();
    }
    
    document.body.style.transform = '';
    isPulling = false;
    pullDistance = 0;
});

// Auto-refresh management (disabled by default)
let autoRefreshInterval = null;

// Clean up and destroy all charts
function destroyAllCharts() {
    try {
        Object.keys(charts).forEach(key => {
            if (charts[key] && typeof charts[key].destroy === 'function') {
                console.log(`Destroying chart: ${key}`);
                charts[key].destroy();
                charts[key] = null;
            }
        });
        charts = {};
        console.log('✅ All charts destroyed successfully');
    } catch (error) {
        console.error('❌ Error destroying charts:', error);
    }
}

// Force chart refresh - ensures charts always update with new data
function forceChartRefresh(data) {
    console.log('🔄 Force refreshing charts with new data');
    
    // Always destroy existing charts first
    destroyAllCharts();
    
    // Wait for cleanup, then create fresh charts
    setTimeout(() => {
        safeCreateCharts(data);
    }, 100);
}

function enableAutoRefresh() {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    
    autoRefreshInterval = setInterval(() => {
        if (attendanceData && document.getElementById('username').value && document.getElementById('password').value) {
            console.log('Auto-refreshing data...');
            refreshData();
            showNotification('Data auto-refreshed!');
        }
    }, 300000); // 5 minutes
}

function disableAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    // Initialize chart system
    initializeCharts();
    
    // Check if there's saved data in sessionStorage
    const savedData = sessionStorage.getItem('attendanceData');
    if (savedData) {
        try {
            attendanceData = JSON.parse(savedData);
            displayDashboard(attendanceData);
            document.getElementById('refreshBtn').classList.add('show');
            showNotification('Previous data loaded!');
        } catch (error) {
            console.error('Error loading saved data:', error);
            sessionStorage.removeItem('attendanceData');
        }
    }
});

// Save data to session storage when fetched
function saveToSession(data) {
    try {
        sessionStorage.setItem('attendanceData', JSON.stringify(data));
    } catch (error) {
        console.warn('Could not save to session storage:', error);
    }
}

// Update the original display function to handle auto-refresh properly
const originalDisplayDashboard = displayDashboard;
displayDashboard = function(data) {
    originalDisplayDashboard(data);
    saveToSession(data);
    
    // Enable auto-refresh only after successful data fetch
    if (!autoRefreshInterval) {
        // Ask user if they want auto-refresh (optional)
        // enableAutoRefresh();
    }
};

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'r':
                e.preventDefault();
                refreshData();
                break;
            case 'e':
                e.preventDefault();
                if (attendanceData) exportToPDF();
                break;
            case 'd':
                e.preventDefault();
                toggleTheme();
                break;
        }
    }
    
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
        }
    }
});

// Add tooltips for better UX
function addTooltips() {
    const tooltipElements = [
        { selector: '.progress-ring', text: 'Overall attendance percentage' },
        { selector: '.attendance-badge', text: 'Current attendance percentage' },
        { selector: '.stat-card', text: 'Click for detailed breakdown' }
    ];

    tooltipElements.forEach(({ selector, text }) => {
        document.querySelectorAll(selector).forEach(el => {
            el.title = text;
        });
    });
}

// Improved chart initialization and management
function initializeCharts() {
    // Clear any existing charts
    charts = {};
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        return false;
    }
    
    // Set Chart.js defaults
    Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    Chart.defaults.color = getComputedStyle(document.documentElement)
        .getPropertyValue('--text-secondary').trim();
    
    return true;
}

// Safe chart creation with error handling
function safeCreateCharts(data) {
    if (!data || !data.subjects || data.subjects.length === 0) {
        console.log('No valid data for charts');
        return;
    }
    
    // Initialize charts if not done already
    if (!initializeCharts()) {
        setTimeout(() => safeCreateCharts(data), 1000); // Retry after 1 second
        return;
    }
    
    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        try {
            createCharts(data);
        } catch (error) {
            console.error('Chart creation failed:', error);
            showNotification('Charts could not be created. Data is still available.', 'error');
        }
    });
}

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Initialize all features
window.addEventListener('load', () => {
    // Ensure all libraries are loaded
    const checkLibraries = () => {
        const chartLoaded = typeof Chart !== 'undefined';
        let jsPDFLoaded = false;
        
        // Check for jsPDF in multiple locations
        if (window.jspdf && window.jspdf.jsPDF) {
            jsPDFLoaded = true;
        } else if (window.jsPDF) {
            jsPDFLoaded = true;
        }
        
        // Proper console logging
        console.log('📚 Library Status Check:');
        console.log('Chart.js:', chartLoaded ? 'Loaded ✅' : 'Missing ❌');
        console.log('jsPDF:', jsPDFLoaded ? 'Loaded ✅' : 'Missing ❌');
        
        if (!chartLoaded) {
            console.warn('⚠️ Chart.js not loaded - charts will not work');
            showNotification('Chart library not loaded - charts may not work', 'error');
        }
        
        if (!jsPDFLoaded) {
            console.log('ℹ️ jsPDF not available - will use text export fallback');
        } else {
            console.log('✅ All libraries loaded successfully');
        }
    };
    
    // Check libraries after a delay to ensure loading
    setTimeout(checkLibraries, 2000);
    
    // Add event listeners
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', () => {
            setTimeout(addTooltips, 2000);
        });
    }
});

// Page visibility API to handle tab switching
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - pause any ongoing operations
        disableAutoRefresh();
    } else {
        // Page is visible again - resume if needed
        if (attendanceData && !autoRefreshInterval) {
            // User can manually enable auto-refresh if needed
        }
    }
});

// Before page unload - cleanup
window.addEventListener('beforeunload', () => {
    destroyAllCharts();
    disableAutoRefresh();
});

function createParticleSystem() {
    const container = document.getElementById('particleContainer');
    if (!container) return;
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 15) + 's';
        
        const size = 3 + Math.random() * 4;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        container.appendChild(particle);
        
        setTimeout(() => {
            if (container.contains(particle)) {
                container.removeChild(particle);
            }
        }, 35000);
    }
    
    for (let i = 0; i < 60; i++) {
        setTimeout(() => createParticle(), i * 50);
    }
    
    setInterval(createParticle, 400);
}

// Start particle system on load
window.addEventListener('load', () => {
    createParticleSystem();
});
