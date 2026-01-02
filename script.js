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

    // API Key for TheMovieDB (nur eine zentrale Variable)
    const apiKey = '47c4ec1ddf8bc5518dcacb259d6bcbcb';

    // Genre-Liste dynamisch laden (wird auch bei Typwechsel neu geladen)
    async function loadGenres(type) {
        genreSelect.innerHTML = '';
        genreSelect.disabled = true;
        let url = '';
        if (type === 'tv') {
            url = `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=de-DE`;
        } else {
            url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=de-DE`;
        }
        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('Genres konnten nicht geladen werden.');
            const data = await resp.json();
            genreSelect.innerHTML = '<option value="">Wähle Genre</option>';
            if (data.genres && Array.isArray(data.genres)) {
                data.genres.forEach(g => {
                    const opt = document.createElement('option');
                    opt.value = g.id;
                    opt.textContent = g.name;
                    genreSelect.appendChild(opt);
                });
            }
            genreSelect.disabled = false;
        } catch (e) {
            genreSelect.innerHTML = '<option value="">Genres nicht verfügbar</option>';
            genreSelect.disabled = true;
        }
    }

    // Typ-Auswahl initialisieren und Listener für dynamische Genre-Liste
    typeSelect.innerHTML = '';
    typeSelect.appendChild(new Option('Wähle Typ', ''));
    typeSelect.appendChild(new Option('Film', 'movie'));
    typeSelect.appendChild(new Option('Serie', 'tv'));
    typeSelect.value = '';
    typeSelect.addEventListener('change', () => {
        const val = typeSelect.value || 'movie';
        loadGenres(val);
    });
    // Initial einmal laden (default: movie)
    loadGenres('movie');

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
        const isGenre = genreSelect.value !== '' && !genreSelect.disabled;
        const isType = typeSelect.value !== '';
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

        // Dynamische Endpunktwahl für discover/movie oder discover/tv
        let endpoint = 'movie';
        if (isType && typeSelect.value === 'tv') endpoint = 'tv';
        let params = {
            api_key: apiKey,
            language: 'de-DE',
            sort_by: 'popularity.desc',
            include_adult: 'false',
            include_video: 'false',
            page: 1
        };
        if (isGenre) params.with_genres = genreSelect.value;
        if (isYear) {
            if (yearFrom.value !== '') {
                params[endpoint === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte'] = `${yearFrom.value}-01-01`;
            }
            if (yearTo.value !== '') {
                params[endpoint === 'movie' ? 'primary_release_date.lte' : 'first_air_date.lte'] = `${yearTo.value}-12-31`;
            }
        }
        // Fehlerbehandlung
        function handleHTTPError(response) {
            if (!response.ok) {
                let msg = '';
                switch (response.status) {
                    case 401: msg = 'Fehler 401: Ungültiger API-Schlüssel.'; break;
                    case 404: msg = 'Fehler 404: Nicht gefunden.'; break;
                    default: msg = `Fehler ${response.status}: ${response.statusText}`;
                }
                throw new Error(msg);
            }
            return response;
        }
        async function fetchWithKriterien() {
            kriterienResults.innerHTML = '';
            try {
                let finalParams = { ...params };
                if (isActor) {
                    let actorName = actorInput.value.trim();
                    let personUrl = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&language=de-DE&query=${encodeURIComponent(actorName)}`;
                    let resp = await fetch(personUrl);
                    handleHTTPError(resp);
                    let data = await resp.json();
                    if (!data || !Array.isArray(data.results) || data.results.length === 0) {
                        throw new Error('Schauspieler nicht gefunden.');
                    }
                    let actorId = data.results[0].id;
                    finalParams.with_cast = actorId;
                }
                let finalUrl = new URL(`https://api.themoviedb.org/3/discover/${endpoint}`);
                Object.keys(finalParams).forEach(key => finalUrl.searchParams.append(key, finalParams[key]));
                let resp2 = await fetch(finalUrl);
                handleHTTPError(resp2);
                let data2 = await resp2.json();
                if (!data2 || !Array.isArray(data2.results)) {
                    kriterienResults.innerHTML = '<p>Ungültige oder leere Antwort erhalten.</p>';
                    return;
                }
                if (data2.results.length > 0) {
                    kriterienResults.innerHTML = '<ul>' + data2.results.map(item => {
                        const title = item.title || item.name || 'Unbekannt';
                        const date = (item.release_date || item.first_air_date || '').substring(0,4) || 'n/a';
                        return `<li>${title} (${date})</li>`;
                    }).join('') + '</ul>';
                } else {
                    kriterienResults.innerHTML = '<p>Keine Ergebnisse gefunden.</p>';
                }
            } catch (error) {
                errorDiv.textContent = error.message;
                kriterienResults.innerHTML = '';
            }
        }
        fetchWithKriterien();
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

        filmtitelSuggestions.innerHTML = '';

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

        // Suche nach Filmtitel (search/movie)
        const query = filmtitelInput.value.trim();
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=de-DE&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
        function handleHTTPError(response) {
            if (!response.ok) {
                let msg = '';
                switch (response.status) {
                    case 401: msg = 'Fehler 401: Ungültiger API-Schlüssel.'; break;
                    case 404: msg = 'Fehler 404: Nicht gefunden.'; break;
                    default: msg = `Fehler ${response.status}: ${response.statusText}`;
                }
                throw new Error(msg);
            }
            return response;
        }
        filmtitelSuggestions.innerHTML = '';
        fetch(url)
            .then(handleHTTPError)
            .then(response => response.json())
            .then(data => {
                if (!data || !Array.isArray(data.results)) {
                    filmtitelSuggestions.innerHTML = '<p>Ungültige oder leere Antwort erhalten.</p>';
                    return;
                }
                if (data.results.length > 0) {
                    filmtitelSuggestions.innerHTML = '<ul>' + data.results.map(movie =>
                        `<li>${movie.title} (${movie.release_date ? movie.release_date.substring(0,4) : 'n/a'})</li>`
                    ).join('') + '</ul>';
                } else {
                    filmtitelSuggestions.innerHTML = '<p>Keine Ergebnisse gefunden.</p>';
                }
            })
            .catch(error => {
                errorDiv.textContent = error.message;
                filmtitelSuggestions.innerHTML = '';
            });
    });

    // Ergänzung: Eventlistener für input und change auf alle Formularfelder
    const actorInput = document.getElementById('actorInput');
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

    // Vorschläge beim Tippen: Filmtitel
    filmtitelInput.addEventListener('input', async function() {
        const query = filmtitelInput.value.trim();
        filmtitelSuggestions.innerHTML = '';
        if (query.length < 2) return;
        try {
            const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=de-DE&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
            const resp = await fetch(url);
            if (!resp.ok) return;
            const data = await resp.json();
            if (data && Array.isArray(data.results) && data.results.length > 0) {
                filmtitelSuggestions.innerHTML = '<ul>' + data.results.slice(0, 5).map(movie =>
                    `<li>${movie.title} (${movie.release_date ? movie.release_date.substring(0,4) : 'n/a'})</li>`
                ).join('') + '</ul>';
            }
        } catch(e) {
            // Keine Vorschläge anzeigen
        }
    });

    // Vorschläge beim Tippen: Schauspieler (actorInput)
    let actorSuggestions = document.getElementById('actorSuggestions');
    if (!actorSuggestions) {
        actorSuggestions = document.createElement('div');
        actorSuggestions.id = 'actorSuggestions';
        actorInput.insertAdjacentElement('afterend', actorSuggestions);
    }
    actorInput.addEventListener('input', async function() {
        const query = actorInput.value.trim();
        actorSuggestions.innerHTML = '';
        if (query.length < 2) return;
        try {
            const url = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&language=de-DE&query=${encodeURIComponent(query)}`;
            const resp = await fetch(url);
            if (!resp.ok) return;
            const data = await resp.json();
            if (data && Array.isArray(data.results) && data.results.length > 0) {
                actorSuggestions.innerHTML = '<ul>' + data.results.slice(0, 5).map(actor =>
                    `<li>${actor.name}</li>`
                ).join('') + '</ul>';
            }
        } catch(e) {
            // Keine Vorschläge anzeigen
        }
    });
});
