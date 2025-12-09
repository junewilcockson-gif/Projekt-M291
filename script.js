document.addEventListener('DOMContentLoaded', () => {
    const startSection = document.getElementById('startSection');
    const filmtitelSection = document.getElementById('filmtitelSection');
    const kriterienSection = document.getElementById('kriterienSection');

    const filmtitelBtn = document.getElementById('filmtitelBtn');
    const kriterienBtn = document.getElementById('kriterienBtn');

    const kriterienNextBtn = document.getElementById('kriterienNextBtn');
    const kriterienSearchBtn = document.getElementById('kriterienSearchBtn');

    const filmtitelSearchBtn = document.getElementById('filmtitelSearchBtn');

    const yearFrom = document.getElementById('yearFrom');
    const yearTo = document.getElementById('yearTo');
    const yearFromValue = document.getElementById('yearFromValue');
    const yearToValue = document.getElementById('yearToValue');

    // Live-Anzeige für Jahr Slider
    yearFrom.addEventListener('input', () => {
        yearFromValue.textContent = yearFrom.value;
    });
    yearTo.addEventListener('input', () => {
        yearToValue.textContent = yearTo.value;
    });

    // Buttons im Startbereich
    filmtitelBtn.addEventListener('click', () => {
        startSection.style.display = 'none';
        filmtitelSection.style.display = 'block';
    });

    kriterienBtn.addEventListener('click', () => {
        startSection.style.display = 'none';
        kriterienSection.style.display = 'block';
        showKriterienStep(0);
    });

    const kriterienFields = ['actorDiv', 'genreDiv', 'yearDiv', 'typeDiv'];
    let currentKriterienStep = 0;

    function showKriterienStep(stepIndex) {
        kriterienFields.forEach((id, i) => {
            const el = document.getElementById(id);
            el.style.display = i <= stepIndex ? 'block' : 'none';
        });

        // Weiter Button anzeigen oder Suchen Button
        if (stepIndex < kriterienFields.length - 1) {
            kriterienNextBtn.style.display = 'none';
            kriterienSearchBtn.style.display = 'none';
        } else {
            kriterienNextBtn.style.display = 'none';
            kriterienSearchBtn.style.display = 'inline-block';
        }
    }

    // Entferne den Eventlistener für kriterienNextBtn, da der Skip-Button nicht mehr benötigt wird

    kriterienSearchBtn.addEventListener('click', () => {
        // Felder referenzieren
        const actorInput = document.getElementById('actorInput');
        const genreSelect = document.getElementById('genreSelect');
        const typeSelect = document.getElementById('typeSelect');
        const yearFrom = document.getElementById('yearFrom');
        const yearTo = document.getElementById('yearTo');

        // Fehleranzeige zurücksetzen
        [actorInput, genreSelect, typeSelect, yearFrom, yearTo].forEach(f => f.style.borderColor = '');

        // Fehlermeldung div erzeugen, falls nicht vorhanden
        let errorDiv = document.getElementById('kriterienError');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'kriterienError';
            errorDiv.style.color = 'red';
            errorDiv.style.marginTop = '10px';
            kriterienSearchBtn.insertAdjacentElement('afterend', errorDiv);
        }
        errorDiv.textContent = '';

        // Validierung: mindestens ein Kriterium ausgefüllt
        const isActor = actorInput.value.trim() !== '';
        const isGenre = genreSelect.value !== 'Wähle Genre';
        const isType = typeSelect.value !== 'Wähle Typ';
        const isYear = yearFrom.value !== yearFrom.min || yearTo.value !== yearTo.max;

        if (!isActor && !isGenre && !isType && !isYear) {
            [actorInput, genreSelect, typeSelect, yearFrom, yearTo].forEach(f => f.style.borderColor = 'red');
            errorDiv.textContent = 'Wähle mindestens ein Kriterium.';
            return;
        }

        // Validierung OK: Fehlermeldung entfernen, Alert ausgeben
        errorDiv.textContent = '';
        alert('Suche durchgeführt!');
    });

    filmtitelSearchBtn.addEventListener('click', () => {
        const filmtitelInput = document.getElementById('filmtitelInput');

        // Fehleranzeige zurücksetzen
        filmtitelInput.style.borderColor = '';

        // Fehlermeldung div erzeugen, falls nicht vorhanden
        let errorDiv = document.getElementById('filmtitelError');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'filmtitelError';
            errorDiv.style.color = 'red';
            errorDiv.style.marginTop = '10px';
            filmtitelSearchBtn.insertAdjacentElement('afterend', errorDiv);
        }
        errorDiv.textContent = '';

        if (filmtitelInput.value.trim() === '') {
            filmtitelInput.style.borderColor = 'red';
            errorDiv.textContent = 'Bitte gib einen Filmtitel ein.';
            return;
        }

        // Validierung OK: Fehlermeldung entfernen, Alert ausgeben
        errorDiv.textContent = '';
        alert('Suche nach Filmtitel durchgeführt!');
    });

    // Ergänzung: Eventlistener für input und change auf alle Formularfelder
    const actorInput = document.getElementById('actorInput');
    const genreSelect = document.getElementById('genreSelect');
    const typeSelect = document.getElementById('typeSelect');
    const filmtitelInput = document.getElementById('filmtitelInput');

    function removeKriterienError() {
        [actorInput, genreSelect, typeSelect, yearFrom, yearTo].forEach(f => f.style.borderColor = '');
        const errorDiv = document.getElementById('kriterienError');
        if (errorDiv) {
            errorDiv.textContent = '';
        }
    }

    actorInput.addEventListener('input', () => {
        removeKriterienError();
        if (currentKriterienStep === 0) {
            currentKriterienStep++;
            showKriterienStep(currentKriterienStep);
        }
    });
    genreSelect.addEventListener('change', () => {
        removeKriterienError();
        if (currentKriterienStep === 1) {
            currentKriterienStep++;
            showKriterienStep(currentKriterienStep);
        }
    });
    yearFrom.addEventListener('input', () => {
        removeKriterienError();
        if (currentKriterienStep === 2) {
            currentKriterienStep++;
            showKriterienStep(currentKriterienStep);
        }
    });
    yearTo.addEventListener('input', () => {
        removeKriterienError();
        if (currentKriterienStep === 2) {
            currentKriterienStep++;
            showKriterienStep(currentKriterienStep);
        }
    });
    typeSelect.addEventListener('change', () => {
        removeKriterienError();
        // No next step after last field
    });

    function removeFilmtitelError() {
        filmtitelInput.style.borderColor = '';
        const errorDiv = document.getElementById('filmtitelError');
        if (errorDiv) {
            errorDiv.textContent = '';
        }
    }

    filmtitelInput.addEventListener('input', removeFilmtitelError);
});
