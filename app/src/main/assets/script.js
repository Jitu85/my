document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const branchSelect = document.getElementById('branchSelect');
  const formulasGrid = document.getElementById('formulasGrid');
  const resultsInfo = document.getElementById('resultsInfo');

  let formulaData = [];
  let allBranches = new Set();

  async function loadData() {
    try {
      resultsInfo.innerText = "Loading formulas...";
      // Fetching from local assets folder in Android
      const response = await fetch('data.json');
      if (!response.ok) throw new Error("Could not load formulas data.");

      const data = await response.json();
      formulaData = data;

      allBranches.clear();
      formulaData.forEach(item => {
        if (item.Branch) allBranches.add(item.Branch);
      });

      populateBranches();
      renderCards(formulaData);
    } catch (error) {
      resultsInfo.innerHTML = `<span style="color: #ef4444;">Error: ${error.message}</span>`;
      console.error(error);
    }
  }

  function populateBranches() {
    branchSelect.innerHTML = '<option value="All">All Branches</option>';
    const branchesArray = Array.from(allBranches).sort();
    branchesArray.forEach(branch => {
      const option = document.createElement('option');
      option.value = branch;
      option.textContent = branch.replace(/_/g, ' ');
      branchSelect.appendChild(option);
    });
  }

  function renderCards(data) {
    formulasGrid.innerHTML = '';

    if (data.length === 0) {
      resultsInfo.innerHTML = `No results found.`;
      return;
    }

    resultsInfo.innerHTML = `Showing ${data.length} formula(s)`;

    data.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'formula-card glass';
      card.style.animationDelay = `${(index % 10) * 0.05}s`;

      const branchDisplay = item.Branch ? item.Branch.replace(/_/g, ' ') : '';
      const branchHTML = branchDisplay ? `<div class="card-branch">${branchDisplay}</div>` : '';
      const notesHTML = item.Notes ? `<div class="card-notes">${item.Notes}</div>` : '';
      const exampleHTML = item.Example ? `<div class="card-example"><strong>Ex:</strong> ${item.Example}</div>` : '';

      card.innerHTML = `
        ${branchHTML}
        <div class="card-title">${item.FormulaName || 'Unnamed'}</div>
        <div class="card-formula">${item.Formula || ''}</div>
        ${exampleHTML}
        ${notesHTML}
      `;
      formulasGrid.appendChild(card);
    });
  }

  function filterData() {
    const query = searchInput.value.toLowerCase().trim();
    const selectedBranch = branchSelect.value;

    const filtered = formulaData.filter(item => {
      const matchesBranch = selectedBranch === "All" || item.Branch === selectedBranch;
      const matchesQuery =
        (item.FormulaName || '').toLowerCase().includes(query) ||
        (item.Formula || '').toLowerCase().includes(query) ||
        (item.Branch || '').toLowerCase().includes(query) ||
        (item.Notes || '').toLowerCase().includes(query);
      return matchesBranch && matchesQuery;
    });
    renderCards(filtered);
  }

  searchInput.addEventListener('input', filterData);
  branchSelect.addEventListener('change', filterData);

  loadData();
});
