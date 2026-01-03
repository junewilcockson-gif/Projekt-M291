document.addEventListener('DOMContentLoaded', () => {
    const startSection = document.getElementById('startSection');
    const filmtitelSection = document.getElementById('filmtitelSection');
    const kriterienSection = document.getElementById('kriterienSection');
    // --- Button "Zur anderen Suchoption" ---
    // Button erstellen, aber zunächst unsichtbar und ohne spezielles Styling
    let switchSearchBtn = document.getElementById('switchSearchBtn');
    if (!switchSearchBtn) {
        switchSearchBtn = document.createElement('button');
        switchSearchBtn.id = 'switchSearchBtn';
        switchSearchBtn.textContent = 'Zur anderen Suchoption';
        // Kein spezielles Styling, nur minimal
        switchSearchBtn.style.display = 'none'; // Unsichtbar am Anfang
        // Kein fixed, keine Breite, kein Box-Shadow, keine Padding/Font etc.
        document.body.insertBefore(switchSearchBtn, document.body.firstChild);
    }
    // Klick-Event: wechsle zwischen filmtitelSection und kriterienSection
    switchSearchBtn.addEventListener('click', () => {
        // Wenn Filmtitel-Sektion sichtbar, zu Kriterien wechseln
        if (filmtitelSection && filmtitelSection.style.display !== 'none') {
            filmtitelSection.style.display = 'none';
            kriterienSection.style.display = 'block';
        }
        // Wenn Kriterien-Sektion sichtbar, zu Filmtitel wechseln
        else if (kriterienSection && kriterienSection.style.display !== 'none') {
            kriterienSection.style.display = 'none';
            filmtitelSection.style.display = 'block';
        }
        // Nach jedem Wechsel Button-Sichtbarkeit prüfen
        updateSwitchSearchBtnVisibility();
    });

    // Funktion: Button nur anzeigen, wenn eine Suchoption gewählt ist (filmtitelSection oder kriterienSection sichtbar)
    function updateSwitchSearchBtnVisibility() {
        if (
            (filmtitelSection && filmtitelSection.style.display !== 'none') ||
            (kriterienSection && kriterienSection.style.display !== 'none')
        ) {
            switchSearchBtn.style.display = 'inline-block';
        } else {
            switchSearchBtn.style.display = 'none';
        }
    }

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
        kriterienSection.style.display = 'none';
        updateSwitchSearchBtnVisibility();
    });

    kriterienBtn.addEventListener('click', () => {
        startSection.style.display = 'none';
        kriterienSection.style.display = 'block';
        filmtitelSection.style.display = 'none';
        showKriterienStep(0);
        updateSwitchSearchBtnVisibility();
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

    // Request-ID für Genre-Requests (Race Condition Absicherung)
    let genreRequestId = 0;
    // Genre-Liste dynamisch laden (wird auch bei Typwechsel neu geladen)
    async function loadGenres(type) {
        const currentRequestId = ++genreRequestId;

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
            if (currentRequestId !== genreRequestId) return;
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

    // Typ-Auswahl initialisieren: dynamisch aus TheMovieDB API (movie/tv)
    async function loadTypes() {
        typeSelect.innerHTML = '';
        typeSelect.appendChild(new Option('Wähle Typ', ''));
        // Da TheMovieDB keine eigene Typen-API bereitstellt, aber nur "movie" und "tv" unterstützt,
        // prüfen wir dynamisch, indem wir die verfügbaren Endpunkte testen.
        // Alternativ könnten wir den configuration-Endpoint prüfen, aber dort stehen keine Typen explizit.
        // Wir testen discover/movie und discover/tv als "verfügbare Typen".
        const types = [
            { key: 'movie', label: 'Film' },
            { key: 'tv', label: 'Serie' }
        ];
        // Optional: Überprüfe, ob Endpunkte erreichbar sind
        for (const t of types) {
            try {
                const url = `https://api.themoviedb.org/3/discover/${t.key}?api_key=${apiKey}&language=de-DE&page=1`;
                const resp = await fetch(url);
                if (resp.ok) {
                    typeSelect.appendChild(new Option(t.label, t.key));
                }
            } catch (e) {
                // Ignoriere Typ, falls API nicht erreichbar
            }
        }
        typeSelect.value = '';
    }

    // Typen laden und Listener für Typwechsel setzen
    loadTypes().then(() => {
        typeSelect.addEventListener('change', async () => {
            if (!typeSelect.value) return;

            const val = typeSelect.value;
            const previousGenre = genreSelect.value;

            await loadGenres(val);

            if (previousGenre) {
                const exists = Array.from(genreSelect.options)
                    .some(opt => opt.value === previousGenre);
                if (exists) {
                    genreSelect.value = previousGenre;
                }
            }
        });
        // Genre-Dropdown initial beim Start mit Film-Genres füllen
        loadGenres('movie');
    });

    // Überarbeiteter Kriterien-Suchblock: stabil, korrekt, async/await, stackable, alle Anforderungen
    kriterienSearchBtn.addEventListener('click', async () => {
        const actorInput = document.getElementById('actorInput');
        [actorInput, genreSelect, typeSelect, yearFrom, yearTo].forEach(f => f.style.borderColor = '');
        let errorDiv = document.getElementById('kriterienError');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'kriterienError';
            errorDiv.style.color = 'red';
            errorDiv.style.marginTop = '10px';
            kriterienSearchBtn.insertAdjacentElement('afterend', errorDiv);
        }
        errorDiv.textContent = '';
        let warnImg = document.getElementById('kriterienWarnImg');
        if (warnImg) warnImg.remove();

        // Welche Filter sind gesetzt?
        const isActor = actorInput.value.trim() !== '';
        const isGenre = genreSelect.value !== '' && !genreSelect.disabled;
        const isType = typeSelect.value !== '';
        const isYear = yearFrom.value !== yearFrom.min || yearTo.value !== yearTo.max;

        // Mindestens ein Kriterium muss gesetzt sein
        if (!isActor && !isGenre && !isType && !isYear) {
            [actorInput, genreSelect, typeSelect, yearFrom, yearTo].forEach(f => f.style.borderColor = 'red');
            errorDiv.textContent = 'Wähle mindestens ein Kriterium.';
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

        // --- 1. Schauspieler-Eingabe: Regex-Check (logisch, keine Sonderzeichen) ---
        let actorId = null;
        let actorSuggestionClicked = actorInput.dataset.suggestionClicked === 'true';
        if (isActor && !actorSuggestionClicked) {
            const actorRegex = /^[A-Za-zÄÖÜäöüß]+(?:[ '-][A-Za-zÄÖÜäöüß]+)*$/;
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

        // --- 2. Endpoints (movie/tv) vor allen Fetches definieren (stackable) ---
        let endpoints = [];
        if (isType) {
            endpoints.push(typeSelect.value); // 'movie' oder 'tv'
        } else {
            endpoints.push('movie', 'tv');
        }

        // --- 3. Schauspieler-ID von TMDB holen, falls nötig (vor allen Endpoints-Fetches) ---
        if (isActor) {
            try {
                const personUrl = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&language=de-DE&query=${encodeURIComponent(actorInput.value.trim())}`;
                const resp = await fetch(personUrl);
                if (!resp.ok) throw new Error();
                const data = await resp.json();
                if (!data || !Array.isArray(data.results) || data.results.length === 0) throw new Error();
                actorId = data.results[0].id;
            } catch {
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

        errorDiv.textContent = '';
        if (warnImg) warnImg.remove();

        // Helper für HTTP-Fehler
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

        // --- 4. Stacked Fetches mit stackable Filter-Logik, Sortierung, Kartenanzeige ---
        kriterienResults.innerHTML = '';
        try {
            let allResults = [];
            for (const ep of endpoints) {
                // --- Endpoints-Parameter ---
                let params = {
                    api_key: apiKey,
                    language: 'de-DE',
                    sort_by: 'release_date.desc',
                    include_adult: 'false',
                    include_video: 'false',
                    page: 1
                };
                // Genre-Filter
                if (isGenre) {
                    params.with_genres = genreSelect.value;
                }
                // Jahr-Filter
                if (isYear) {
                    if (ep === 'movie') {
                        params['primary_release_date.gte'] = `${yearFrom.value}-01-01`;
                        params['primary_release_date.lte'] = `${yearTo.value}-12-31`;
                    } else {
                        params['first_air_date.gte'] = `${yearFrom.value}-01-01`;
                        params['first_air_date.lte'] = `${yearTo.value}-12-31`;
                    }
                }
                // Filme: Schauspieler direkt via with_cast
                if (ep === 'movie' && isActor && actorId) {
                    params.with_cast = actorId;
                }
                // --- URL bauen ---
                const url = new URL(`https://api.themoviedb.org/3/discover/${ep}`);
                Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
                const resp = await fetch(url);
                handleHTTPError(resp);
                const data = await resp.json();
                let results = [];
                if (data?.results) {
                    results = data.results.map(r => ({ ...r, __type: ep }));
                }
                // Serien: Schauspieler-Check clientseitig via /tv/{id}/credits
                if (ep === 'tv' && isActor && actorId && results.length > 0) {
                    const filtered = [];
                    // Für jede Serie separat die Credits prüfen, ob actorId im Cast ist
                    for (const tv of results) {
                        try {
                            const creditsUrl = `https://api.themoviedb.org/3/tv/${tv.id}/credits?api_key=${apiKey}&language=de-DE`;
                            const creditsResp = await fetch(creditsUrl);
                            if (!creditsResp.ok) continue;
                            const creditsData = await creditsResp.json();
                            if (creditsData && Array.isArray(creditsData.cast)) {
                                if (creditsData.cast.some(c => c.id === actorId)) {
                                    filtered.push(tv);
                                }
                            }
                        } catch (e) {
                            // Fehler ignorieren (Serie überspringen)
                        }
                    }
                    allResults.push(...filtered);
                } else {
                    allResults.push(...results);
                }
            }
            // Stackable Filter: Jahr (falls API unvollständig), Genre, Typ
            let results = allResults.filter(item => {
                // Jahr
                if (isYear) {
                    const rawDate = item.release_date || item.first_air_date;
                    if (!rawDate) return false;
                    const year = Number(rawDate.substring(0, 4));
                    if (year < Number(yearFrom.value) || year > Number(yearTo.value)) return false;
                }
                // Genre
                if (isGenre) {
                    if (!Array.isArray(item.genre_ids)) return false;
                    if (!item.genre_ids.includes(Number(genreSelect.value))) return false;
                }
                // Typ
                if (isType) {
                    if (typeSelect.value === 'movie' && item.__type !== 'movie') return false;
                    if (typeSelect.value === 'tv' && item.__type !== 'tv') return false;
                }
                // Kein clientseitiger Schauspieler-Check mehr!
                return true;
            });
            // Sortierung nach Release-Date absteigend
            results.sort((a, b) => {
                let dateA = a.release_date || a.first_air_date || '';
                let dateB = b.release_date || b.first_air_date || '';
                let nA = Number(dateA.replace(/-/g, '')) || 0;
                let nB = Number(dateB.replace(/-/g, '')) || 0;
                return nB - nA;
            });
            // Kartenanzeige: Poster links, Infos rechts, responsive, ALLE Felder dynamisch
            function renderAllFields(obj) {
                // Hilfsfunktion: gibt ein <ul> mit allen Feldern des Objekts zurück
                let html = '<ul style="margin:0; padding:0 0 0 1.1em;">';
                for (const [key, value] of Object.entries(obj)) {
                    if (key === 'poster_path') continue; // Poster separat
                    if (key === '__type') continue; // Typ separat
                    html += `<li style="margin-bottom:2px;"><b>${key}:</b> `;
                    if (value === null || typeof value === 'undefined') {
                        html += '<i>null</i>';
                    } else if (typeof value === 'object') {
                        if (Array.isArray(value)) {
                            if (value.length === 0) {
                                html += '<i>Leeres Array</i>';
                            } else if (typeof value[0] === 'object') {
                                html += '<ul style="margin:0 0 0 1.1em;">';
                                for (const entry of value) {
                                    html += '<li>';
                                    if (typeof entry === 'object') {
                                        html += renderAllFields(entry);
                                    } else {
                                        html += String(entry);
                                    }
                                    html += '</li>';
                                }
                                html += '</ul>';
                            } else {
                                html += value.map(v => String(v)).join(', ');
                            }
                        } else {
                            html += renderAllFields(value);
                        }
                    } else {
                        html += String(value);
                    }
                    html += '</li>';
                }
                html += '</ul>';
                return html;
            }
            if (results.length > 0) {
                kriterienResults.innerHTML = '<div class="card-container">' +
                    results.map(item => {
                        const title = item.title || item.name || 'Unbekannt';
                        const year = (item.release_date || item.first_air_date || '').substring(0, 4) || '';
                        const language = item.original_language || '';
                        const overview = item.overview || '';
                        // Bewertung (vote_average) und Stimmen (vote_count)
                        const voteAverage = typeof item.vote_average === 'number' ? item.vote_average : 0;
                        const voteCount = typeof item.vote_count === 'number' ? item.vote_count : 0;
                        const ratingBarWidth = Math.round((voteAverage / 10) * 100);
                        const ratingValue = voteAverage.toFixed(1);
                        const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : 'assets/placeholder_film.png';
                        return `<div class="media-card" style="display: flex; flex-direction: row; align-items: stretch; margin-bottom: 1em;">
                            <img src="${posterUrl}" alt="Poster von ${title}" class="card-poster" style="width: 25%; height: auto; object-fit: cover; flex-shrink: 0; border-radius: 4px;">
                            <div class="card-info" style="flex: 1; padding: 0 1em; display: flex; flex-direction: column; justify-content: flex-start;">
                                <div style="margin-bottom: 0.3em;">
                                    <div class="card-title" style="font-weight:bold;font-size:1.25em;line-height:1.1;">${title}</div>
                                </div>
                                <div style="font-size:1em; color:#444; margin-bottom:0.1em;">${year ? 'Jahr: ' + year : ''}</div>
                                <div style="font-size:0.98em; color:#666; margin-bottom:0.2em;">${language ? 'Originalsprache: ' + language : ''}</div>
                                <div style="font-size:0.97em; color:#222; margin-bottom:0.6em;">${overview}</div>
                                <div style="margin-top:auto;">
                                  <div style="font-size:0.95em; margin-bottom:0.12em;">Bewertung:</div>
                                  <div style="background:#e0e0e0; border-radius:4px; overflow:hidden; height:8px; width:100%; position:relative; margin-bottom:2px;">
                                    <div style="background:#555; height:100%; width:${ratingBarWidth}%; transition:width 0.3s;"></div>
                                  </div>
                                  <div style="font-size:0.85em; color:#888; margin-top:2px;">
                                    Bewertung: ${ratingValue}/10 (${voteCount} Stimmen)
                                  </div>
                                </div>
                            </div>
                        </div>`;
                    }).join('') +
                    '</div>';
            } else {
                kriterienResults.innerHTML = '<p>Keine Ergebnisse gefunden.</p>';
            }
        } catch (error) {
            errorDiv.textContent = error.message;
            kriterienResults.innerHTML = '';
        }
    });

    // Filmtitel-Suche: wie Kriterien-Suche (Filme & Serien, Kartenanzeige in eigenem Div)
    // Div für Ergebnisse unter der Suche
    let filmtitelResults = document.getElementById('filmtitelResults');
    if (!filmtitelResults) {
        filmtitelResults = document.createElement('div');
        filmtitelResults.id = 'filmtitelResults';
        filmtitelSearchBtn.insertAdjacentElement('afterend', filmtitelResults);
    }

    filmtitelSearchBtn.addEventListener('click', () => {
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
        if (warnImg) warnImg.remove();
        filmtitelSuggestions.innerHTML = '';
        filmtitelResults.innerHTML = '';
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
        // Neue Regex-Validierung für Filmtitel (lockerer, akzeptiert alle gängigen Zeichen)
        // /^[A-Za-z0-9ÄÖÜäöüß'!?:&() .,\-]+$/
        const filmtitelRegex = /^[A-Za-z0-9ÄÖÜäöüß'!?:&() .,\-]+$/;
        let filmtitelSuggestionClicked = filmtitelInput.dataset.suggestionClicked === 'true';
        // Regex nur prüfen, wenn kein Vorschlag geklickt wurde
        if (!filmtitelSuggestionClicked && !filmtitelRegex.test(filmtitelInput.value.trim())) {
            filmtitelInput.style.borderColor = 'red';
            errorDiv.textContent = 'Bitte gib einen gültigen Filmtitel ein.';
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
        // TMDB-Abfrage: Suche sowohl Filme als auch Serien
        const query = filmtitelInput.value.trim();
        const urlMovie = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=de-DE&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
        const urlTV = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=de-DE&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
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
        // Suche asynchron, wie bei Kriterien-Suche
        (async () => {
            try {
                // Parallel suchen
                const [respMovie, respTV] = await Promise.all([fetch(urlMovie), fetch(urlTV)]);
                handleHTTPError(respMovie);
                handleHTTPError(respTV);
                const [dataMovie, dataTV] = await Promise.all([respMovie.json(), respTV.json()]);
                let results = [];
                if (dataMovie && Array.isArray(dataMovie.results)) {
                    results = results.concat(dataMovie.results.map(r => ({ ...r, __type: 'movie' })));
                }
                if (dataTV && Array.isArray(dataTV.results)) {
                    results = results.concat(dataTV.results.map(r => ({ ...r, __type: 'tv' })));
                }
                // Nichts gefunden?
                if (results.length === 0) {
                    filmtitelInput.style.borderColor = 'red';
                    errorDiv.textContent = 'Bitte gib einen gültigen Filmtitel ein.';
                    if (!warnImg) {
                        warnImg = document.createElement('img');
                        warnImg.id = 'filmtitelWarnImg';
                        warnImg.src = 'assets/warnung.png';
                        warnImg.style.maxWidth = '30px';
                        warnImg.style.marginLeft = '8px';
                        warnImg.style.verticalAlign = 'middle';
                        errorDiv.appendChild(warnImg);
                    }
                    filmtitelResults.innerHTML = '';
                    return;
                }
                errorDiv.textContent = '';
                if (warnImg) warnImg.remove();
                // Sortiere nach Release/First-Air-Date absteigend
                results.sort((a, b) => {
                    let dateA = a.release_date || a.first_air_date || '';
                    let dateB = b.release_date || b.first_air_date || '';
                    let nA = Number(dateA.replace(/-/g, '')) || 0;
                    let nB = Number(dateB.replace(/-/g, '')) || 0;
                    return nB - nA;
                });
                // Kartenanzeige: Poster links, alle Felder rechts (wie oben)
                function renderAllFields(obj) {
                    let html = '<ul style="margin:0; padding:0 0 0 1.1em;">';
                    for (const [key, value] of Object.entries(obj)) {
                        if (key === 'poster_path') continue;
                        if (key === '__type') continue;
                        html += `<li style="margin-bottom:2px;"><b>${key}:</b> `;
                        if (value === null || typeof value === 'undefined') {
                            html += '<i>null</i>';
                        } else if (typeof value === 'object') {
                            if (Array.isArray(value)) {
                                if (value.length === 0) {
                                    html += '<i>Leeres Array</i>';
                                } else if (typeof value[0] === 'object') {
                                    html += '<ul style="margin:0 0 0 1.1em;">';
                                    for (const entry of value) {
                                        html += '<li>';
                                        if (typeof entry === 'object') {
                                            html += renderAllFields(entry);
                                        } else {
                                            html += String(entry);
                                        }
                                        html += '</li>';
                                    }
                                    html += '</ul>';
                                } else {
                                    html += value.map(v => String(v)).join(', ');
                                }
                            } else {
                                html += renderAllFields(value);
                            }
                        } else {
                            html += String(value);
                        }
                        html += '</li>';
                    }
                    html += '</ul>';
                    return html;
                }
                if (results.length > 0) {
                    filmtitelResults.innerHTML = '<div class="card-container">' +
                        results.map(item => {
                            const title = item.title || item.name || 'Unbekannt';
                            const year = (item.release_date || item.first_air_date || '').substring(0, 4) || '';
                            const language = item.original_language || '';
                            const overview = item.overview || '';
                            // Bewertung (vote_average) und Stimmen (vote_count)
                            const voteAverage = typeof item.vote_average === 'number' ? item.vote_average : 0;
                            const voteCount = typeof item.vote_count === 'number' ? item.vote_count : 0;
                            const ratingBarWidth = Math.round((voteAverage / 10) * 100);
                            const ratingValue = voteAverage.toFixed(1);
                            const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : 'assets/placeholder_film.png';
                            return `<div class="media-card" style="display: flex; flex-direction: row; align-items: stretch; margin-bottom: 1em;">
                                <img src="${posterUrl}" alt="Poster von ${title}" class="card-poster" style="width: 25%; height: auto; object-fit: cover; flex-shrink: 0; border-radius: 4px;">
                                <div class="card-info" style="flex: 1; padding: 0 1em; display: flex; flex-direction: column; justify-content: flex-start;">
                                    <div style="margin-bottom: 0.3em;">
                                        <div class="card-title" style="font-weight:bold;font-size:1.25em;line-height:1.1;">${title}</div>
                                    </div>
                                    <div style="font-size:1em; color:#444; margin-bottom:0.1em;">${year ? 'Jahr: ' + year : ''}</div>
                                    <div style="font-size:0.98em; color:#666; margin-bottom:0.2em;">${language ? 'Originalsprache: ' + language : ''}</div>
                                    <div style="font-size:0.97em; color:#222; margin-bottom:0.6em;">${overview}</div>
                                    <div style="margin-top:auto;">
                                      <div style="font-size:0.95em; margin-bottom:0.12em;">Bewertung:</div>
                                      <div style="background:#e0e0e0; border-radius:4px; overflow:hidden; height:8px; width:100%; position:relative; margin-bottom:2px;">
                                        <div style="background:#555; height:100%; width:${ratingBarWidth}%; transition:width 0.3s;"></div>
                                      </div>
                                      <div style="font-size:0.85em; color:#888; margin-top:2px;">
                                        Bewertung: ${ratingValue}/10 (${voteCount} Stimmen)
                                      </div>
                                    </div>
                                </div>
                            </div>`;
                        }).join('') +
                        '</div>';
                } else {
                    filmtitelResults.innerHTML = '<p>Keine Ergebnisse gefunden.</p>';
                }
            } catch (error) {
                errorDiv.textContent = error.message;
                filmtitelResults.innerHTML = '';
            }
        })();
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

    // Vorschläge beim Tippen: Filmtitel (Dropdown-ähnliche Auswahl)
    filmtitelInput.addEventListener('input', async function() {
        filmtitelInput.dataset.suggestionClicked = 'false';
        const query = filmtitelInput.value.trim();
        filmtitelSuggestions.innerHTML = '';
        filmtitelSuggestions.style.display = 'none';
        if (query.length < 2) return;
        try {
            // Suche sowohl Filme als auch Serien für Vorschläge
            const [respMovie, respTV] = await Promise.all([
                fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=de-DE&query=${encodeURIComponent(query)}&page=1&include_adult=false`),
                fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=de-DE&query=${encodeURIComponent(query)}&page=1&include_adult=false`)
            ]);
            if (!respMovie.ok && !respTV.ok) return;
            const [dataMovie, dataTV] = await Promise.all([
                respMovie.ok ? respMovie.json() : { results: [] },
                respTV.ok ? respTV.json() : { results: [] }
            ]);
            // Kombiniere Ergebnisse, max. 5 insgesamt
            let results = [];
            if (dataMovie && Array.isArray(dataMovie.results)) {
                results = results.concat(dataMovie.results.map(r => ({ ...r, __type: 'movie' })));
            }
            if (dataTV && Array.isArray(dataTV.results)) {
                results = results.concat(dataTV.results.map(r => ({ ...r, __type: 'tv' })));
            }
            // Sortiere wie bei den Ergebnissen
            results.sort((a, b) => {
                let dateA = a.release_date || a.first_air_date || '';
                let dateB = b.release_date || b.first_air_date || '';
                let nA = Number(dateA.replace(/-/g, '')) || 0;
                let nB = Number(dateB.replace(/-/g, '')) || 0;
                return nB - nA;
            });
            results = results.slice(0, 5);
            if (results.length > 0) {
                const list = document.createElement('ul');
                list.style.listStyle = 'none';
                list.style.margin = '0';
                list.style.padding = '0';
                list.style.position = 'absolute';
                list.style.background = '#fff';
                list.style.border = '1px solid #ccc';
                list.style.width = filmtitelInput.offsetWidth + 'px';
                list.style.zIndex = '1000';
                results.forEach(item => {
                    const li = document.createElement('li');
                    const title = item.title || item.name || 'Unbekannt';
                    const date = (item.release_date || item.first_air_date || '').substring(0,4) || 'n/a';
                    li.textContent = `${title} (${date})`;
                    li.style.padding = '6px 12px';
                    li.style.cursor = 'pointer';
                    li.addEventListener('mousedown', function(e) {
                        filmtitelInput.value = title;
                        filmtitelInput.dataset.suggestionClicked = 'true';
                        filmtitelSuggestions.innerHTML = '';
                        filmtitelSuggestions.style.display = 'none';
                        // Fetch auslösen (wie Button-Klick)
                        filmtitelSearchBtn.click();
                        e.preventDefault();
                    });
                    li.addEventListener('mouseover', function() {
                        li.style.background = '#f0f0f0';
                    });
                    li.addEventListener('mouseout', function() {
                        li.style.background = '';
                    });
                    list.appendChild(li);
                });
                filmtitelSuggestions.innerHTML = '';
                filmtitelSuggestions.appendChild(list);
                filmtitelSuggestions.style.display = 'block';
                filmtitelSuggestions.style.position = 'relative';
            }
        } catch(e) {
            // Keine Vorschläge anzeigen
        }
    });
    // Klick außerhalb schließt Vorschläge (Filmtitel)
    document.addEventListener('mousedown', function(e) {
        if (!filmtitelSuggestions.contains(e.target) && e.target !== filmtitelInput) {
            filmtitelSuggestions.innerHTML = '';
            filmtitelSuggestions.style.display = 'none';
        }
    });

    // Vorschläge beim Tippen: Schauspieler (actorInput) (Dropdown-ähnliche Auswahl)
    let actorSuggestions = document.getElementById('actorSuggestions');
    if (!actorSuggestions) {
        actorSuggestions = document.createElement('div');
        actorSuggestions.id = 'actorSuggestions';
        actorInput.insertAdjacentElement('afterend', actorSuggestions);
    }
    actorInput.addEventListener('input', async function() {
        actorInput.dataset.suggestionClicked = 'false';
        const query = actorInput.value.trim();
        actorSuggestions.innerHTML = '';
        actorSuggestions.style.display = 'none';
        if (query.length < 2) return;
        try {
            const url = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&language=de-DE&query=${encodeURIComponent(query)}`;
            const resp = await fetch(url);
            if (!resp.ok) return;
            const data = await resp.json();
            if (data && Array.isArray(data.results) && data.results.length > 0) {
                const list = document.createElement('ul');
                list.style.listStyle = 'none';
                list.style.margin = '0';
                list.style.padding = '0';
                list.style.position = 'absolute';
                list.style.background = '#fff';
                list.style.border = '1px solid #ccc';
                list.style.width = actorInput.offsetWidth + 'px';
                list.style.zIndex = '1000';
                data.results.slice(0, 5).forEach(actor => {
                    const li = document.createElement('li');
                    li.textContent = actor.name;
                    li.style.padding = '6px 12px';
                    li.style.cursor = 'pointer';
                    li.addEventListener('mousedown', function(e) {
                        actorInput.value = actor.name;
                        actorInput.dataset.suggestionClicked = 'true';
                        actorSuggestions.innerHTML = '';
                        actorSuggestions.style.display = 'none';
                        actorInput.dispatchEvent(new Event('input'));
                        e.preventDefault();
                    });
                    li.addEventListener('mouseover', function() {
                        li.style.background = '#f0f0f0';
                    });
                    li.addEventListener('mouseout', function() {
                        li.style.background = '';
                    });
                    list.appendChild(li);
                });
                actorSuggestions.innerHTML = '';
                actorSuggestions.appendChild(list);
                actorSuggestions.style.display = 'block';
                actorSuggestions.style.position = 'relative';
            }
        } catch(e) {
            // Keine Vorschläge anzeigen
        }
    });
    // Klick außerhalb schließt Vorschläge (Schauspieler)
    document.addEventListener('mousedown', function(e) {
        if (!actorSuggestions.contains(e.target) && e.target !== actorInput) {
            actorSuggestions.innerHTML = '';
            actorSuggestions.style.display = 'none';
        }
    });
});

// Nach jedem Laden prüfen, ob Button sichtbar sein soll (z.B. falls Startansicht)
document.addEventListener('DOMContentLoaded', () => {
    // Initial prüfen, falls Seite auf einer Suchoption startet
    const filmtitelSection = document.getElementById('filmtitelSection');
    const kriterienSection = document.getElementById('kriterienSection');
    const switchSearchBtn = document.getElementById('switchSearchBtn');
    function updateSwitchSearchBtnVisibility() {
        if (
            (filmtitelSection && filmtitelSection.style.display !== 'none') ||
            (kriterienSection && kriterienSection.style.display !== 'none')
        ) {
            switchSearchBtn.style.display = 'inline-block';
        } else {
            switchSearchBtn.style.display = 'none';
        }
    }
    updateSwitchSearchBtnVisibility();
});
