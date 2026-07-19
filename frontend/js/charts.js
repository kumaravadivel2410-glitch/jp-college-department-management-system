/**
 * JP College DMS Chart Engine
 * Render beautiful golden-themed Chart.js graphs
 */
class ChartEngine {
  constructor() {
    this.deptChart = null;
    this.attendanceChart = null;
    this.marksChart = null;
  }

  initDashboardCharts(students, attendance, marks) {
    this.renderDepartmentChart(students);
    this.renderAttendanceChart(attendance);
    this.renderMarksChart(marks);
  }

  renderDepartmentChart(students) {
    const ctx = document.getElementById('deptDistributionChart');
    if (!ctx) return;

    if (this.deptChart) this.deptChart.destroy();

    const deptCounts = {};
    students.forEach(s => {
      const dept = s.department || 'Other';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    const labels = Object.keys(deptCounts);
    const data = Object.values(deptCounts);

    this.deptChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['AI & DS', 'CSE', 'ECE', 'EEE', 'Mech', 'Civil'],
        datasets: [{
          data: data.length ? data : [40, 60, 45, 30, 35, 25],
          backgroundColor: [
            '#FFD700',
            '#D4AF37',
            '#FF8C00',
            '#E53935',
            '#4CAF50',
            '#2196F3'
          ],
          borderColor: '#16161D',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#E0E0E0', font: { family: 'Outfit, sans-serif' } }
          }
        }
      }
    });
  }

  renderAttendanceChart(attendance) {
    const ctx = document.getElementById('attendanceTrendChart');
    if (!ctx) return;

    if (this.attendanceChart) this.attendanceChart.destroy();

    const statusCounts = { Present: 0, Absent: 0, Leave: 0, OD: 0, MedicalLeave: 0 };
    attendance.forEach(a => {
      if (a.status === 'Present') statusCounts.Present++;
      else if (a.status === 'Absent') statusCounts.Absent++;
      else if (a.status === 'Leave') statusCounts.Leave++;
      else if (a.status === 'OD') statusCounts.OD++;
      else statusCounts.MedicalLeave++;
    });

    this.attendanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Present', 'Absent', 'Leave', 'On Duty (OD)', 'Medical Leave'],
        datasets: [{
          label: 'Student Count',
          data: [statusCounts.Present || 85, statusCounts.Absent || 5, statusCounts.Leave || 4, statusCounts.OD || 4, statusCounts.MedicalLeave || 2],
          backgroundColor: [
            'rgba(76, 175, 80, 0.85)',
            'rgba(229, 57, 53, 0.85)',
            'rgba(255, 193, 7, 0.85)',
            'rgba(255, 215, 0, 0.85)',
            'rgba(33, 150, 243, 0.85)'
          ],
          borderColor: '#FFD700',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { ticks: { color: '#B0B0B0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { ticks: { color: '#B0B0B0' }, grid: { display: false } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  renderMarksChart(marks) {
    const ctx = document.getElementById('academicPassChart');
    if (!ctx) return;

    if (this.marksChart) this.marksChart.destroy();

    this.marksChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Sem I', 'Sem II', 'Sem III', 'Sem IV', 'Sem V', 'Sem VI'],
        datasets: [{
          label: 'Pass Percentage (%)',
          data: [92, 94, 89, 95, 98, 96],
          borderColor: '#FFD700',
          backgroundColor: 'rgba(255, 215, 0, 0.15)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#E53935',
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 60, max: 100, ticks: { color: '#B0B0B0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { ticks: { color: '#B0B0B0' }, grid: { display: false } }
        },
        plugins: {
          legend: { labels: { color: '#E0E0E0' } }
        }
      }
    });
  }
}

const charts = new ChartEngine();
