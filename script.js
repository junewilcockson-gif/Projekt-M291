// Tabs auswählen
const titleTab = document.getElementById('titleTab');
const genreTab = document.getElementById('genreTab');

// Bereiche auswählen
const titleSearch = document.getElementById('titleSearch');
const genreSearch = document.getElementById('genreSearch');

// Tab-Klick-Events
titleTab.addEventListener('click', () => {
  titleSearch.style.display = 'block';   // Zeige Filmtitel-Suche
  genreSearch.style.display = 'none';    // Verstecke Genre-Suche
});

genreTab.addEventListener('click', () => {
  titleSearch.style.display = 'none';    // Verstecke Filmtitel-Suche
  genreSearch.style.display = 'block';   // Zeige Genre-Suche
});

// Formular und Eingaben auswählen
const form = document.getElementById('movieForm');
const titleInput = document.getElementById('titleInput');
const titleError = document.getElementById('titleError');

const genreSelect = document.getElementById('genreSelect');
const yearFrom = document.getElementById('yearFrom');
const yearTo = document.getElementById('yearTo');
const genreError = document.getElementById('genreError');

form.addEventListener('submit', (e) => {
  e.preventDefault(); // Verhindert Seiten-Neuladen

  // Reset Fehlermeldungen
  titleError.textContent = '';
  genreError.textContent = '';
  titleInput.style.borderColor = '';
  yearFrom.style.borderColor = '';
  yearTo.style.borderColor = '';
  genreSelect.style.borderColor = '';

  let valid = true;

  // Filmtitel-Validierung
  if (titleSearch.style.display === 'block') {
    if (titleInput.value.trim() === '') {
      titleError.textContent = 'Bitte einen Titel eingeben!';
      titleInput.style.borderColor = 'red';
      valid = false;
    }
  }

  // Genre & Jahr-Validierung
  if (genreSearch.style.display === 'block') {
    if (genreSelect.value === '') {
      genreError.textContent = 'Bitte ein Genre auswählen!';
      genreSelect.style.borderColor = 'red';
      valid = false;
    }

    if (yearFrom.value && yearTo.value && Number(yearFrom.value) > Number(yearTo.value)) {
      genreError.textContent = 'Von-Jahr darf nicht größer als Bis-Jahr sein!';
      yearFrom.style.borderColor = 'red';
      yearTo.style.borderColor = 'red';
      valid = false;
    }
  }

  if (valid) {
    alert('Formular ist korrekt! Du könntest jetzt die API aufrufen.');
  }
});
