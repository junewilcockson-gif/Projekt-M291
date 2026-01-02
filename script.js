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

    // Prepare for API usage: clear genreSelect and typeSelect options
    const genreSelect = document.getElementById('genreSelect');
    const typeSelect = document.getElementById('typeSelect');
    genreSelect.innerHTML = '';
    typeSelect.innerHTML = '';

    // Add div for filmtitel suggestions below filmtitelInput
    const filmtitelInput = document.getElementById('filmtitelInput');
    let filmtitelSuggestions = document.getElementById('filmtitelSuggestions');
    if (!filmtitelSuggestions) {
        filmtitelSuggestions = document.createElement('div');
        filmtitelSuggestions.id = 'filmtitelSuggestions';
        filmtitelInput.insertAdjacentElement('afterend', filmtitelSuggestions);
    }

    // Add div for kriterien results below kriterienSearchBtn
    let kriterienResults = document.getElementById('kriterienResults');
    if (!kriterienResults) {
        kriterienResults = document.createElement('div');
        kriterienResults.id = 'kriterienResults';
        kriterienSearchBtn.insertAdjacentElement('afterend', kriterienResults);
    }

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

        // Positioniere den Skip-Button unter dem aktuell untersten sichtbaren Feld
      if (stepIndex < kriterienFields.length - 1) {
    kriterienNextBtn.style.display = 'inline-block';
    kriterienSearchBtn.style.display = 'none';
} else {
    kriterienNextBtn.style.display = 'none';
    kriterienSearchBtn.style.display = 'inline-block';
}
    }

    // Skip-Button klick Event: nächstes Feld anzeigen, auch wenn das aktuelle leer ist
    kriterienNextBtn.addEventListener('click', () => {
        if (currentKriterienStep < kriterienFields.length - 1) {
            currentKriterienStep++;
            showKriterienStep(currentKriterienStep);
        }
    });

    kriterienSearchBtn.addEventListener('click', () => {
        // Felder referenzieren
        const actorInput = document.getElementById('actorInput');
        // const genreSelect = document.getElementById('genreSelect'); // already defined above
        // const typeSelect = document.getElementById('typeSelect'); // already defined above
        // const yearFrom = document.getElementById('yearFrom'); // already defined above
        // const yearTo = document.getElementById('yearTo'); // already defined above

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

        // Entferne Warnungsbild falls vorhanden
        let warnImg = document.getElementById('kriterienWarnImg');
        if (warnImg) {
            warnImg.remove();
        }

        // Validierung: mindestens ein Kriterium ausgefüllt
        const isActor = actorInput.value.trim() !== '';
        const isGenre = genreSelect.value !== 'Wähle Genre';
        const isType = typeSelect.value !== 'Wähle Typ';
        const isYear = yearFrom.value !== yearFrom.min || yearTo.value !== yearTo.max;

        if (!isActor && !isGenre && !isType && !isYear) {
            [actorInput, genreSelect, typeSelect, yearFrom, yearTo].forEach(f => f.style.borderColor = 'red');
            errorDiv.textContent = 'Wähle mindestens ein Kriterium.';

            // Warnungsbild hinzufügen
            if (!warnImg) {
                warnImg = document.createElement('img');
                warnImg.id = 'kriterienWarnImg';
                warnImg.src = 'assets/warnung.png';
                warnImg.style.maxWidth = '30px';
                warnImg.style.marginLeft = '8px';
                warnImg.style.verticalAlign = 'middle';
                errorDiv.appendChild(warnImg);
            }
            return;
        }

        // Neue Regex-Validierung für actorInput, falls ausgefüllt
        if (isActor) {
            const actorRegex = /^[a-zA-ZäöüÄÖÜß]+(?:[ '-][a-zA-ZäöüÄÖÜß]+)*$/;
            if (!actorRegex.test(actorInput.value.trim())) {
                actorInput.style.borderColor = 'red';
                errorDiv.textContent = 'Bitte gib einen gültigen Namen ein.';
                if (!warnImg) {
                    warnImg = document.createElement('img');
                    warnImg.id = 'kriterienWarnImg';
                    warnImg.src = 'assets/warnung.png';
                    warnImg.style.maxWidth = '30px';
                    warnImg.style.marginLeft = '8px';
                    warnImg.style.verticalAlign = 'middle';
                    errorDiv.appendChild(warnImg);
                }
                return;
            }
        }

        // Validierung OK: Fehlermeldung entfernen, Alert ausgeben
        errorDiv.textContent = '';
        if (warnImg) {
            warnImg.remove();
        }
        alert('Suche durchgeführt!');
    });

    filmtitelSearchBtn.addEventListener('click', () => {
        // const filmtitelInput = document.getElementById('filmtitelInput'); // already defined above

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

        // Entferne Warnungsbild falls vorhanden
        let warnImg = document.getElementById('filmtitelWarnImg');
        if (warnImg) {
            warnImg.remove();
        }

        if (filmtitelInput.value.trim() === '') {
            filmtitelInput.style.borderColor = 'red';
            errorDiv.textContent = 'Bitte gib einen gültigen Filmtitel ein.';

            // Warnungsbild hinzufügen
            if (!warnImg) {
                warnImg = document.createElement('img');
                warnImg.id = 'filmtitelWarnImg';
                warnImg.src = 'assets/warnung.png';
                warnImg.style.maxWidth = '30px';
                warnImg.style.marginLeft = '8px';
                warnImg.style.verticalAlign = 'middle';
                errorDiv.appendChild(warnImg);
            }
            return;
        }

        // Neue Regex-Validierung für Filmtitel
        const filmtitelRegex = /^(?=.*[a-zA-Z0-9äöüÄÖÜß])[a-zA-Z0-9äöüÄÖÜß\s.,'!?:&()\-]+$/;
        if (!filmtitelRegex.test(filmtitelInput.value.trim())) {
            filmtitelInput.style.borderColor = 'red';
            errorDiv.textContent = 'Bitte gib einen gültigen Filmtitel ein.';

            // Warnungsbild hinzufügen
            if (!warnImg) {
                warnImg = document.createElement('img');
                warnImg.id = 'filmtitelWarnImg';
                warnImg.src = 'assets/warnung.png';
                warnImg.style.maxWidth = '30px';
                warnImg.style.marginLeft = '8px';
                warnImg.style.verticalAlign = 'middle';
                errorDiv.appendChild(warnImg);
            }
            return;
        }

        // Validierung OK: Fehlermeldung entfernen, Alert ausgeben
        errorDiv.textContent = '';
        if (warnImg) {
            warnImg.remove();
        }
        alert('Suche nach Filmtitel durchgeführt!');
    });

    // Ergänzung: Eventlistener für input und change auf alle Formularfelder
    const actorInput = document.getElementById('actorInput');
    // genreSelect and typeSelect already defined above
    // filmtitelInput already defined above

    function removeKriterienError() {
        [actorInput, genreSelect, typeSelect, yearFrom, yearTo].forEach(f => f.style.borderColor = '');
        const errorDiv = document.getElementById('kriterienError');
        if (errorDiv) {
            errorDiv.textContent = '';
            let warnImg = document.getElementById('kriterienWarnImg');
            if (warnImg) {
                warnImg.remove();
            }
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
            let warnImg = document.getElementById('filmtitelWarnImg');
            if (warnImg) {
                warnImg.remove();
            }
        }
    }

    filmtitelInput.addEventListener('input', removeFilmtitelError);
});
