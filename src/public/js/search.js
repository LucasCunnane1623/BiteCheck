const searchInput   = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
let debounceTimer;

searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const q = searchInput.value.trim();

  if (!q) {
    searchResults.classList.add('hidden');
    return;
  }

  debounceTimer = setTimeout(async () => {
    const res  = await fetch(`/api/restaurants/search?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    const data = json.data;

    if (data.length === 0) {
      searchResults.innerHTML = '<p class="no-results">No restaurants found.</p>';
    } else {
      let resultsHTML = '';
      data.forEach(r => {
        let display = '?';
        let colorClass = 'score-grey';

        if (r.color) {
            display = r.score;
            colorClass = 'score-' + r.color;
        }

        resultsHTML += `
            <div class="search-result-item" data-id="${r._id}">
                <span>${r.name}</span>
                <span class="score-badge ${colorClass}">${display}</span>
            </div>
        `;
      });
      searchResults.innerHTML = resultsHTML;

      searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          searchResults.classList.add('hidden');
          searchInput.value = '';
          openDetailsModal(item.dataset.id);
        });
      });
    }

    searchResults.classList.remove('hidden');
  }, 300);
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('#map-controls')) {
    searchResults.classList.add('hidden');
  }
});