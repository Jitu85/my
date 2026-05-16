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
      const response = await fetch('data.json');
      if (!response.ok) throw new Error(`Failed to load data.json (Status: ${response.status})`);

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Data format is invalid: expected an array.");

      formulaData = data;
      
      // Extract unique branches
      allBranches.clear();
      formulaData.forEach(item => {
        if (item.Branch) {
          allBranches.add(item.Branch);
        }
      });

      populateBranches();
      renderCards(formulaData);
    } catch (error) {
      resultsInfo.innerHTML = `<span style="color: #ef4444;">Error: ${error.message}</span>`;
      console.error("FormulaApp Error:", error);
    }
  }

  function populateBranches() {
    // Clear existing dynamic options (keep "All")
    branchSelect.innerHTML = '<option value="All">All Branches</option>';

    // Convert to array and sort alphabetically
    const branchesArray = Array.from(allBranches).sort();
    
    branchesArray.forEach(branch => {
      const option = document.createElement('option');
      option.value = branch;
      // Replace underscores with spaces for better display
      option.textContent = branch.replace(/_/g, ' ');
      branchSelect.appendChild(option);
    });
  }

  function renderCards(data) {
    formulasGrid.innerHTML = '';
    
    if (data.length === 0) {
      resultsInfo.innerHTML = `No formulas found. Try adjusting your search.`;
      return;
    }

    resultsInfo.innerHTML = `Showing ${data.length} formula(s)`;

    data.forEach((item, index) => {
      const delay = (index % 10) * 0.05; // Stagger animation
      const card = document.createElement('div');
      card.className = 'formula-card glass';
      card.style.animationDelay = `${delay}s`;

      const branchDisplay = item.Branch ? item.Branch.replace(/_/g, ' ') : '';
      const branchHTML = branchDisplay ? `<div class="card-branch">${branchDisplay}</div>` : '';
      const notesHTML = item.Notes ? `<div class="card-notes">${item.Notes}</div>` : '';
      const exampleHTML = item.Example ? `<div class="card-example"><strong>Example:</strong> ${item.Example}</div>` : '';

      // Use textContent or a safer way to prevent XSS if data is untrusted,
      // but for this local app, innerHTML is used for formatting.
      card.innerHTML = `
        ${branchHTML}
        <div class="card-title">${item.FormulaName || 'Unnamed Formula'}</div>
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

  // Event Listeners for Search and Filter
  searchInput.addEventListener('input', filterData);
  branchSelect.addEventListener('change', filterData);

  // Initialize
  loadData();
});
