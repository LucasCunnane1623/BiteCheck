async function openDetailsModal(restaurantId) {
  const [dataRes, templateRes] = await Promise.all([
    fetch(`/api/restaurants/${restaurantId}`),
    fetch('/partials/restaurant-details.handlebars'),
  ]);

  const data      = await dataRes.json();
  const template  = Handlebars.compile(await templateRes.text());
  const container = document.getElementById('details-modal-container');

  container.innerHTML = template(data);
  container.classList.remove('hidden');

  document.getElementById('close-details').addEventListener('click', () => {
    container.classList.add('hidden');
  });

  document.getElementById('open-logs').addEventListener('click', (e) => {
    container.classList.add('hidden');
    openLogsModal(e.target.dataset.id);
  });
}

async function openLogsModal(restaurantId) {
  const [dataRes, templateRes] = await Promise.all([
    fetch(`/api/restaurants/${restaurantId}/logs`),
    fetch('/partials/transparency-logs.handlebars'),
  ]);

  const data      = await dataRes.json();
  const template  = Handlebars.compile(await templateRes.text());
  const container = document.getElementById('logs-modal-container');

  container.innerHTML = template(data);
  container.classList.remove('hidden');

  document.getElementById('close-logs').addEventListener('click', () => {
    container.classList.add('hidden');
  });

  document.querySelectorAll('.log-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.log-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      renderLogReport(data.inspections[parseInt(item.dataset.index)]);
    });
  });
}

function renderLogReport(inspection) {
  let violationsHTML = '';

  if (inspection.violations.length === 0) {
    violationsHTML = '<p class="no-violations">No violations recorded.</p>';
  } else {
    inspection.violations.forEach(v => {
      violationsHTML += `
        <div class="violation">
          <p class="violation-type">${v.type}</p>
          <p class="violation-notes">${v.notes}</p>
        </div>
      `;
    });
  }

  document.getElementById('log-report').innerHTML = `
    <p class="report-date">${inspection.date}</p>
    <p class="report-inspector">${inspection.inspectorName}</p>
    <p class="report-notes">${inspection.generalNotes || 'None'}</p>
    <h3>Violations</h3>
    ${violationsHTML}
  `;
}