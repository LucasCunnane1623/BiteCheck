const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    applyColorFilter(btn.dataset.color);

    await fetch('/api/users/filter-pref', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filterPref: btn.dataset.color }),
    });
  });
});

async function restoreFilterPref() {
  const res  = await fetch('/api/users/me');
  const user = await res.json();

  if (user.filterPref) {
    const btn = document.querySelector(`.filter-btn[data-color="${user.filterPref}"]`);
    if (btn) {
      btn.click();
    }
  }
}

restoreFilterPref();