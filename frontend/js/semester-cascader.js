/**
 * Engineering College ERP - Cascading Year -> Semester Helper
 * Maps:
 * Year 1 (I Year)   -> Semester 1, Semester 2
 * Year 2 (II Year)  -> Semester 3, Semester 4
 * Year 3 (III Year) -> Semester 5, Semester 6
 * Year 4 (IV Year)  -> Semester 7, Semester 8
 */
window.EngineeringSemesterMap = {
  'I Year': ['Semester 1', 'Semester 2'],
  'II Year': ['Semester 3', 'Semester 4'],
  'III Year': ['Semester 5', 'Semester 6'],
  'IV Year': ['Semester 7', 'Semester 8'],
  'Year 1': ['Semester 1', 'Semester 2'],
  'Year 2': ['Semester 3', 'Semester 4'],
  'Year 3': ['Semester 5', 'Semester 6'],
  'Year 4': ['Semester 7', 'Semester 8'],
  'All': ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8']
};

window.bindYearSemesterCascading = function (yearEl, semEl, allowAllOption = false) {
  if (!yearEl || !semEl) return;

  const updateSemesters = () => {
    const selectedYear = yearEl.value || 'III Year';
    const sems = window.EngineeringSemesterMap[selectedYear] || ['Semester 5', 'Semester 6'];
    const currentVal = semEl.value;

    let optionsHtml = '';
    if (allowAllOption && selectedYear === 'All') {
      optionsHtml += '<option value="All" selected>All Semesters</option>';
      sems.forEach(s => { optionsHtml += `<option value="${s}">${s}</option>`; });
    } else {
      if (allowAllOption) optionsHtml += '<option value="All">All Semesters</option>';
      sems.forEach(s => {
        optionsHtml += `<option value="${s}">${s}</option>`;
      });
    }

    semEl.innerHTML = optionsHtml;

    if (sems.includes(currentVal)) {
      semEl.value = currentVal;
    } else if (!allowAllOption) {
      semEl.value = sems[0] || 'Semester 1';
    }
  };

  yearEl.addEventListener('change', updateSemesters);
  updateSemesters();
};
