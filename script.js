// --- Lade-GIF-Anzeige ---
/**
 * Zeigt ein zentriertes Lade-GIF im angegebenen Container an.
 * @param {HTMLElement} container - Das Container-Element, in das das Lade-GIF eingefügt wird.
 */
function showLoading(container) {
    container.innerHTML = '';
    const img = document.createElement('img');
    img.src = 'assets/loading.gif';
    img.alt = 'Lädt...';
    img.style.display = 'block';
    img.style.margin = '1em auto';
    img.style.maxWidth = '80px';
    container.appendChild(img);
}
// --- Zentrale Warnungsanzeige ---
/**
 * Zeigt eine rote Warnung mit Bild im gegebenen Fehler-Div an.
 * @param {HTMLElement} errorDiv - Das Fehler-Div.
 * @param {string} text - Der Warntext.
 */
function showWarning(errorDiv, text) {
    // Clear previous content
    errorDiv.innerHTML = '';
    errorDiv.style.color = 'red';
    // Create warning image first
    let warnImg = document.getElementById(errorDiv.id + '_warnImg');
    if (!warnImg) {
        warnImg = document.createElement('img');
        warnImg.id = errorDiv.id + '_warnImg';
        warnImg.src = 'assets/warnung.png';
        warnImg.style.maxWidth = '30px';
        warnImg.style.marginRight = '8px';
        warnImg.style.verticalAlign = 'middle';
    }
    // Append image first, then text
    errorDiv.appendChild(warnImg);
    // Add text node after image
    const textNode = document.createTextNode(text);
    errorDiv.appendChild(textNode);
}
// --- Pagination Globals ---
let currentPage = 1;
let totalPages = 1;
let isPaginating = false;

document.addEventListener('DOMContentLoaded', () => {
    // --- Detailansicht für Karten ---
    // Speichere die letzte Scrollposition global für das Modal
    let lastScrollY = 0;
    async function openDetailView(item) {
        let detailView = document.getElementById('detailView');
        if (!detailView) {
            detailView = document.createElement('div');
            detailView.id = 'detailView';
            document.body.appendChild(detailView);
        }

        // 1) Determine type and base endpoint
        const type = item.__type === 'tv' ? 'tv' : 'movie';
        const id = item.id;
        const apiKey = '47c4ec1ddf8bc5518dcacb259d6bcbcb';
        // 2) Fetch additional detail data asynchronously
        const urls = [
            `https://api.themoviedb.org/3/${type}/${id}/credits?api_key=${apiKey}&language=de-DE`,
            `https://api.themoviedb.org/3/${type}/${id}/watch/providers?api_key=${apiKey}`,
            `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&language=de-DE`
        ];
        // 3) Use await Promise.all, continue gracefully on error
        let [credits, providers, full] = await Promise.all(urls.map(url => fetch(url).then(
            r => r.ok ? r.json() : null
        ).catch(_ => null)));

        // Fallbacks
        credits = credits || {};
        providers = providers || {};
        full = full || {};

        // 4) Build the detail view UI in this order:
        // Poster image (centered, large)
        let posterUrl = full.poster_path
            ? `https://image.tmdb.org/t/p/w342${full.poster_path}`
            : (item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : 'assets/placeholder_film.png');

        // Title (H1)
        const title = full.title || full.name || item.title || item.name || 'Unbekannt';
        // Media type text: Film / Serie
        const mediatypeText = type === 'movie' ? 'Film' : 'Serie';
        // Release year
        const year = (full.release_date || full.first_air_date || item.release_date || item.first_air_date || '').substring(0,4) || '';
        // Overview (Beschreibung)
        const overview = full.overview || item.overview || '';
        // Top 10 Cast members, Format: Name – Rolle, unterhalb der Beschreibung
        let castHtml = '';
        if (Array.isArray(credits.cast) && credits.cast.length > 0) {
            castHtml = '<ul style="padding-left:1.2em; margin:0">';
            credits.cast.slice(0, 10).forEach(c => {
                const cname = c.name || '';
                const role = c.character || '';
                // Name – Rolle, Name als klickbarer span
                castHtml += `<li><span class="cast-actor-clickable" style="cursor:pointer; color:#2360a5; text-decoration:underline;" data-actor-name="${encodeURIComponent(cname)}">${cname}</span>${role ? ' – ' + role : ''}</li>`;
            });
            castHtml += '</ul>';
        } else {
            castHtml = '<span style="color:#888;">Keine Angaben</span>';
        }
        // Streaminganbieter: untereinander (Liste), wenn keine: Text
        let providersHtml = '';
        let deFlat = providers.results && providers.results.DE && Array.isArray(providers.results.DE.flatrate)
            ? providers.results.DE.flatrate : null;
        // TMDB liefert einen allgemeinen Link für alle deutschen Anbieter (providers.results.DE.link)
        const providerUrl = providers.results && providers.results.DE && providers.results.DE.link ? providers.results.DE.link : '';
        if (deFlat && deFlat.length > 0) {
            providersHtml = '<ul style="padding-left:1.2em; margin:0">';
            deFlat.forEach(p => {
                let logoImg = '';
                if (p.logo_path) {
                    // Wenn provider_url vorhanden, mache Logo klickbar
                    if (providerUrl) {
                        logoImg = `<a href="${providerUrl}" target="_blank" rel="noopener" style="display:inline-block;"><img src="https://image.tmdb.org/t/p/w45${p.logo_path}" alt="${p.provider_name}" title="${p.provider_name}" style="height:28px;vertical-align:middle; border-radius:4px; background:#fff; box-shadow:0 1px 4px #0002; margin-right:10px; cursor:pointer;"></a>`;
                    } else {
                        logoImg = `<img src="https://image.tmdb.org/t/p/w45${p.logo_path}" alt="${p.provider_name}" title="${p.provider_name}" style="height:28px;vertical-align:middle; border-radius:4px; background:#fff; box-shadow:0 1px 4px #0002; margin-right:10px;">`;
                    }
                }
                providersHtml += `<li style="margin-bottom:0.5em;display:flex;align-items:center;">
                    ${logoImg}
                    <span style="font-size:0.97em; vertical-align:middle;">${p.provider_name}</span>
                </li>`;
            });
            providersHtml += '</ul>';
        } else {
            providersHtml = '<span style="color:#888;">Keine Streaminganbieter gefunden</span>';
        }
        // Bewertungsbalken (exakt wie Übersicht, nur wenn vote_count > 0), zentriert und direkt unter Beschreibung
        const voteAverage = typeof full.vote_average === 'number' ? full.vote_average : 0;
        const voteCount = typeof full.vote_count === 'number' ? full.vote_count : 0;
        let ratingHtml = '';
        if (voteCount > 0) {
            const ratingBarWidth = Math.round((voteAverage / 10) * 100);
            const ratingValue = voteAverage.toFixed(1);
            ratingHtml = `
                <div style="margin-top:1.3em; text-align:center;">
                  <div style="font-size:1em; margin-bottom:0.12em; text-align:center;">Bewertung:</div>
                  <div style="background:#e0e0e0; border-radius:4px; overflow:hidden; height:8px; width:100%; max-width:350px; margin:0 auto;">
                    <div style="background:#555; height:100%; width:${ratingBarWidth}%;"></div>
                  </div>
                  <div style="font-size:0.85em; color:#888; margin-top:2px; text-align:center;">
                    ${ratingValue}/10 (${voteCount} Stimmen)
                  </div>
                </div>
            `;
        }

        // Remove popularity, do not show it

        // Compose detail view HTML (as modal)
        detailView.innerHTML = `
            <div id="detailModalOverlay" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); z-index:9999; display:flex; align-items:center; justify-content:center;">
              <div id="detailModalContainer" style="background:#fff; border-radius:12px; max-width:800px; width:92vw; max-height:92vh; overflow-y:auto; box-shadow:0 6px 32px #0004; padding:2em 1.5em 1.5em 1.5em; position:relative;">
                <button id="detailCloseBtn" style="position:absolute; top:1em; right:1em; font-size:1.6em; padding:0.15em 0.7em; border-radius:5px; border:none; background:transparent; color:#888; cursor:pointer; font-weight:bold; line-height:1;">&#10005;</button>
                <div style="text-align:center; margin:1.2em 0 1.7em 0;">
                    <img src="${posterUrl}" style="max-width:260px; width:100%; height:auto; border-radius:10px; box-shadow:0 2px 12px #0002;">
                </div>
                <h1 style="font-size:2em; margin-bottom:0.25em; text-align:center;">${title}</h1>
                <div style="text-align:center; font-size:1.1em; color:#666; margin-bottom:0.2em;">
                    ${mediatypeText} &middot; ${year}
                </div>
                <div style="margin:1.3em 0 1.2em 0; font-size:1.09em; color:#222; line-height:1.4; text-align:center;">
                    ${overview ? overview : '<span style="color:#888;">Keine Beschreibung verfügbar.</span>'}
                </div>
                ${ratingHtml}
                <div style="margin:1.4em 0 0.9em 0;">
                    <div style="font-weight:bold; margin-bottom:0.3em;">Top 10 Besetzung:</div>
                    ${castHtml}
                </div>
                <div style="margin:1.4em 0 0.9em 0;">
                    <div style="font-weight:bold; margin-bottom:0.3em;">Streaminganbieter:</div>
                    ${providersHtml}
                </div>
              </div>
            </div>
        `;

        // Modal: show and hide logic
        detailView.style.display = 'block';
        detailView.style.position = 'fixed';
        detailView.style.top = '0';
        detailView.style.left = '0';
        detailView.style.width = '100vw';
        detailView.style.height = '100vh';
        detailView.style.zIndex = '9999';
        detailView.style.background = 'none';
        detailView.style.padding = '0';

        // Modal-Overlay: Seite bleibt sichtbar, nur Modal drüber. Scrollposition merken!
        lastScrollY = window.scrollY;
        // Kein Scrollen im Hintergrund (optional, aber Modal ist overlay)
        //document.body.style.overflow = 'hidden'; // Falls gewünscht, aber nicht gefordert

        // Zeige Modal, blende KEINE Seite aus!

        // Entferne alten Back-Button-Logik, stattdessen X oben rechts und Overlay-Klick
        function closeModalAndRestoreScroll() {
            detailView.style.display = 'none';
            //document.body.style.overflow = ''; // Falls gesetzt
            window.scrollTo(0, lastScrollY);
        }
        document.getElementById('detailCloseBtn').onclick = closeModalAndRestoreScroll;
        document.getElementById('detailModalOverlay').addEventListener('mousedown', function(e) {
            if (e.target === this) {
                closeModalAndRestoreScroll();
            }
        });

        // Cast klickbar: Eventlistener für alle .cast-actor-clickable
        setTimeout(() => {
            const castSpans = detailView.querySelectorAll('.cast-actor-clickable');
            castSpans.forEach(span => {
                span.addEventListener('click', function(e) {
                    // Setze Namen ins actorInput, Vorschläge ausblenden, Fehleranzeige zurücksetzen, Suche starten
                    const actorName = decodeURIComponent(this.getAttribute('data-actor-name'));
                    const actorInput = document.getElementById('actorInput');
                    if (actorInput) {
                        actorInput.value = actorName;
                        actorInput.dataset.suggestionClicked = 'true';
                        // Vorschläge beider Felder komplett entfernen
                        let actorSuggestions = document.getElementById('actorSuggestions');
                        let filmtitelSuggestions = document.getElementById('filmtitelSuggestions');
                        if (actorSuggestions) { actorSuggestions.innerHTML = ''; actorSuggestions.style.display = 'none'; }
                        if (filmtitelSuggestions) { filmtitelSuggestions.innerHTML = ''; filmtitelSuggestions.style.display = 'none'; }
                        // Fehleranzeige zurücksetzen
                        [actorInput].forEach(f => f.style.borderColor = '');
                        let errorDiv = document.getElementById('kriterienError');
                        if (errorDiv) {
                            errorDiv.textContent = '';
                            let warnImg = document.getElementById('kriterienWarnImg');
                            if (warnImg) warnImg.remove();
                        }
                        // Detailansicht schließen, Suchansicht zeigen
                        closeModalAndRestoreScroll();
                        if (kriterienSection) kriterienSection.style.display = 'block';
                        if (filmtitelSection) filmtitelSection.style.display = 'none';
                        // Starte sofort Kriterien-Suche
                        const kriterienSearchBtn = document.getElementById('kriterienSearchBtn');
                        if (kriterienSearchBtn) {
                            setTimeout(() => { kriterienSearchBtn.click(); }, 100);
                        }
                    }
                });
            });
        }, 10);
    }
    const startSection = document.getElementById('startSection');
    const filmtitelSection = document.getElementById('filmtitelSection');
    const kriterienSection = document.getElementById('kriterienSection');
    // --- Button "Zur anderen Suchoption" ---
    // Button erstellen, Bootstrap-Klassen hinzufügen
    let switchSearchBtn = document.getElementById('switchSearchBtn');
    if (!switchSearchBtn) {
        switchSearchBtn = document.createElement('button');
        switchSearchBtn.id = 'switchSearchBtn';
        switchSearchBtn.textContent = 'Zur anderen Suchoption';
        switchSearchBtn.className = 'btn btn-secondary mb-3';
        switchSearchBtn.style.display = 'none'; // Unsichtbar am Anfang
        const headerSection = document.querySelector('header');
        headerSection.insertAdjacentElement('afterend', switchSearchBtn);
    } else {
        // Falls schon vorhanden, Bootstrap-Klassen sicherstellen
        switchSearchBtn.classList.add('btn', 'btn-secondary', 'mb-3');
    }

    // Dynamischer Header für aktive Suchoption
    let activeSearchHeader = document.getElementById('activeSearchHeader');
    if (!activeSearchHeader) {
        activeSearchHeader = document.createElement('h2');
        activeSearchHeader.id = 'activeSearchHeader';
        activeSearchHeader.style.margin = '0.8em 0';
        activeSearchHeader.style.fontSize = '1.4em';
        activeSearchHeader.style.fontWeight = 'bold';
        switchSearchBtn.insertAdjacentElement('afterend', activeSearchHeader);
    }

    function updateActiveSearchHeader() {
        if (filmtitelSection.style.display !== 'none') {
            activeSearchHeader.textContent = 'Suche nach Titel';
        } else if (kriterienSection.style.display !== 'none') {
            activeSearchHeader.textContent = 'Kriterien-Suche';
        } else {
            activeSearchHeader.textContent = '';
        }
    }

    // Klick-Event: wechsle zwischen filmtitelSection und kriterienSection
    switchSearchBtn.addEventListener('click', () => {
        // Wenn Filmtitel-Sektion sichtbar, zu Kriterien wechseln
        if (filmtitelSection && filmtitelSection.style.display !== 'none') {
            filmtitelSection.style.display = 'none';
            kriterienSection.style.display = 'block';
            kriterienProgressBarContainer.style.display = 'block';
        }
        // Wenn Kriterien-Sektion sichtbar, zu Filmtitel wechseln
        else if (kriterienSection && kriterienSection.style.display !== 'none') {
            kriterienSection.style.display = 'none';
            filmtitelSection.style.display = 'block';
            kriterienProgressBarContainer.style.display = 'none';
        }
        // Nach jedem Wechsel Button-Sichtbarkeit prüfen
        updateSwitchSearchBtnVisibility();
        updateActiveSearchHeader();
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
    // Bootstrap-Klassen zu Selects hinzufügen
    genreSelect.classList.add('form-select');
    typeSelect.classList.add('form-select');
    genreSelect.innerHTML = '';
    typeSelect.innerHTML = '';

    // Add div for filmtitel suggestions below filmtitelInput
    const filmtitelInput = document.getElementById('filmtitelInput');
    // Bootstrap-Klasse zu Filmtitel-Input
    filmtitelInput.classList.add('form-control');
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
        kriterienProgressBarContainer.style.display = 'none';
        updateSwitchSearchBtnVisibility();
        updateActiveSearchHeader();
    });

    kriterienBtn.addEventListener('click', () => {
        startSection.style.display = 'none';
        kriterienSection.style.display = 'block';
        filmtitelSection.style.display = 'none';
        kriterienProgressBarContainer.style.display = 'block';
        showKriterienStep(0);
        updateSwitchSearchBtnVisibility();
        updateActiveSearchHeader();
    });
    // Initial setzen
    updateActiveSearchHeader();

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

    // --- Fortschrittsbalken für Kriterien-Suche (ohne Bootstrap) ---
    const kriterienProgressBarContainer = document.createElement('div');
    kriterienProgressBarContainer.id = 'kriterienProgressContainer';
    // Keine Bootstrap-Klasse!
    kriterienProgressBarContainer.style.width = '100%';
    kriterienProgressBarContainer.style.maxWidth = '400px';
    kriterienProgressBarContainer.style.margin = '0.8em 0';
    kriterienProgressBarContainer.style.background = '#e0e0e0';
    kriterienProgressBarContainer.style.borderRadius = '6px';
    kriterienProgressBarContainer.style.overflow = 'hidden';
    kriterienProgressBarContainer.style.height = '12px';
    kriterienProgressBarContainer.style.position = 'relative';
    // Fortschrittsbalken-Füllung
    const kriterienProgressBar = document.createElement('div');
    kriterienProgressBar.id = 'kriterienProgressFill';
    // Keine Bootstrap-Klasse!
    kriterienProgressBar.style.height = '100%';
    kriterienProgressBar.style.width = '0%';
    kriterienProgressBar.style.background = '#555';
    kriterienProgressBar.style.transition = 'width 0.3s';
    kriterienProgressBarContainer.appendChild(kriterienProgressBar);

    // Füge den Fortschrittsbalken direkt unter dem aktiven Such-Titel ein
    if (activeSearchHeader) {
        activeSearchHeader.insertAdjacentElement('afterend', kriterienProgressBarContainer);
    } else {
        switchSearchBtn.insertAdjacentElement('afterend', kriterienProgressBarContainer);
    }
    // Fortschrittsbalken zu Beginn ausblenden (nur bei Kriterien-Suche anzeigen)
    kriterienProgressBarContainer.style.display = 'none';

    // Funktion zum Aktualisieren des Fortschrittsbalkens
    function updateKriterienProgress(stepIndex) {
        const totalSteps = kriterienFields.length;
        const percent = Math.round(((stepIndex + 1) / totalSteps) * 100);
        kriterienProgressBar.style.width = percent + '%';
        // Keine aria-Attribute nötig, keine Bootstrap!
    }

    // Rufe updateKriterienProgress immer auf, wenn showKriterienStep ausgeführt wird
    const originalShowKriterienStep = showKriterienStep;
    showKriterienStep = function(stepIndex) {
        originalShowKriterienStep(stepIndex);
        updateKriterienProgress(stepIndex);
    };

    // Initialisieren beim ersten Schritt
    updateKriterienProgress(currentKriterienStep);

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
        // Reset to first page for new search
        if (!isPaginating) {
            currentPage = 1;
        }
        isPaginating = false;
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
        let warnImg = document.getElementById('kriterienError_warnImg');
        if (warnImg) warnImg.remove();

        // Welche Filter sind gesetzt?
        const isActor = actorInput.value.trim() !== '';
        const isGenre = genreSelect.value !== '' && !genreSelect.disabled;
        const isType = typeSelect.value !== '';
        const isYear = yearFrom.value !== yearFrom.min || yearTo.value !== yearTo.max;

        // Mindestens ein Kriterium muss gesetzt sein
        if (!isActor && !isGenre && !isType && !isYear) {
            [actorInput, genreSelect, typeSelect, yearFrom, yearTo].forEach(f => f.style.borderColor = 'red');
            showWarning(errorDiv, 'Wähle mindestens ein Kriterium.');
            kriterienResults.innerHTML = '';
            return;
        }

        // --- 1. Schauspieler-Eingabe: Regex-Check (logisch, keine Sonderzeichen) ---
        let actorId = null;
        let actorSuggestionClicked = actorInput.dataset.suggestionClicked === 'true';
        if (isActor && !actorSuggestionClicked) {
            const actorRegex = /^[A-Za-zÄÖÜäöüß]+(?:[ '-][A-Za-zÄÖÜäöüß]+)*$/;
            if (!actorRegex.test(actorInput.value.trim())) {
                actorInput.style.borderColor = 'red';
                showWarning(errorDiv, 'Bitte gib einen gültigen Namen ein.');
                kriterienResults.innerHTML = '';
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
                showWarning(errorDiv, 'Bitte gib einen gültigen Namen ein.');
                kriterienResults.innerHTML = '';
                return;
            }
        }

        errorDiv.textContent = '';
        let warnImg2 = document.getElementById('kriterienError_warnImg');
        if (warnImg2) warnImg2.remove();

        // Lade-GIF vor Start der API-Abfrage anzeigen
        showLoading(kriterienResults);
        await new Promise(resolve => setTimeout(resolve, 1500));

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
                    include_video: 'false'
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
                // Always set page parameter for pagination
                params.page = currentPage;
                // --- URL bauen ---
                const url = new URL(`https://api.themoviedb.org/3/discover/${ep}`);
                Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
                const resp = await fetch(url);
                handleHTTPError(resp);
                const data = await resp.json();
                // Store pagination info
                totalPages = data.total_pages || 1;
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
                        // click handler for detail view via data-item attribute
                        const itemJson = encodeURIComponent(JSON.stringify(item));
                        return `<div class="media-card" style="display: flex; flex-direction: row; align-items: stretch; margin-bottom: 1em;" data-item="${itemJson}">
                            <img src="${posterUrl}" alt="Poster von ${title}" class="card-poster" style="width: 25%; height: auto; object-fit: cover; flex-shrink: 0; border-radius: 4px; cursor:pointer">
                            <div class="card-info" style="flex: 1; padding: 0 1em; display: flex; flex-direction: column; justify-content: flex-start;">
                                <div style="margin-bottom: 0.3em;">
                                    <div class="card-title" style="font-weight:bold;font-size:1.25em;line-height:1.1; cursor:pointer">${title}</div>
                                </div>
                                <div style="font-size:1em; color:#444; margin-bottom:0.6em;">${year}</div>

                                <div style="font-size:0.97em; color:#222; margin-bottom:0.8em;">
                                  ${overview}
                                </div>

                                <div style="font-size:0.95em; color:#666; margin-bottom:0.6em;">
                                  ${language ? 'Originalsprache: ' + language : ''}
                                </div>
                                ${voteCount > 0 ? `
                                <div style="margin-top:auto;">
                                  <div style="font-size:0.95em; margin-bottom:0.12em;">Bewertung:</div>
                                  <div style="background:#e0e0e0; border-radius:4px; overflow:hidden; height:8px; width:100%; position:relative; margin-bottom:2px;">
                                    <div style="background:#555; height:100%; width:${ratingBarWidth}%;"></div>
                                  </div>
                                  <div style="font-size:0.85em; color:#888; margin-top:2px;">
                                    ${ratingValue}/10 (${voteCount} Stimmen)
                                  </div>
                                </div>
                                ` : ''}
                            </div>
                        </div>`;
                    }).join('') +
                    '</div>' +
                    '<div style="margin-top: 1.5em; text-align: right; font-size: 0.9em; color: #888;">' +
                    'Daten bereitgestellt von <a href="https://www.themoviedb.org/" target="_blank" rel="noopener" style="color:#888; text-decoration:underline;">TMDB</a>' +
                    '</div>';
            } else {
                kriterienResults.innerHTML = '<p>Keine Ergebnisse gefunden.</p>' +
                  '<div style="margin-top: 1.5em; text-align: right; font-size: 0.9em; color: #888;">' +
                  'Daten bereitgestellt von <a href="https://www.themoviedb.org/" target="_blank" rel="noopener" style="color:#888; text-decoration:underline;">TMDB</a>' +
                  '</div>';
            }
            // Render pagination controls after results
            renderPaginationControls();
            // Event Delegation für Detailansicht (nur einmal pro Render)
            if (!kriterienResults.dataset.eventDelegation) {
                kriterienResults.addEventListener('click', function(e) {
                    let card = e.target.closest('.media-card');
                    if (card && card.hasAttribute('data-item')) {
                        try {
                            const item = JSON.parse(decodeURIComponent(card.getAttribute('data-item')));
                            window.openDetailViewFromCard = function() {}; // dummy, falls alt aufgerufen
                            openDetailView(item);
                        } catch (err) {}
                    }
                });
                kriterienResults.dataset.eventDelegation = 'true';
            }
        } catch (error) {
            showWarning(errorDiv, error.message);
            kriterienResults.innerHTML = '';
            // Still render pagination for error state
            renderPaginationControls();
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

    filmtitelSearchBtn.addEventListener('click', async () => {
        // Reset to first page for new search
        if (!isPaginating) {
            currentPage = 1;
        }
        isPaginating = false;
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
        let warnImg = document.getElementById('filmtitelError_warnImg');
        if (warnImg) warnImg.remove();
        filmtitelSuggestions.innerHTML = '';
        // Lade-GIF vor Start der API-Abfrage anzeigen
        showLoading(filmtitelResults);
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (filmtitelInput.value.trim() === '') {
            filmtitelInput.style.borderColor = 'red';
            showWarning(errorDiv, 'Bitte gib einen gültigen Filmtitel ein.');
            filmtitelResults.innerHTML = '';
            return;
        }
        // Neue Regex-Validierung für Filmtitel (lockerer, akzeptiert alle gängigen Zeichen)
        // /^[A-Za-z0-9ÄÖÜäöüß'!?:&() .,\-]+$/
        const filmtitelRegex = /^[A-Za-z0-9ÄÖÜäöüß'!?:&() .,\-]+$/;
        let filmtitelSuggestionClicked = filmtitelInput.dataset.suggestionClicked === 'true';
        // Regex nur prüfen, wenn kein Vorschlag geklickt wurde
        if (!filmtitelSuggestionClicked && !filmtitelRegex.test(filmtitelInput.value.trim())) {
            filmtitelInput.style.borderColor = 'red';
            showWarning(errorDiv, 'Bitte gib einen gültigen Filmtitel ein.');
            filmtitelResults.innerHTML = '';
            return;
        }
        // TMDB-Abfrage: Suche sowohl Filme als auch Serien
        const query = filmtitelInput.value.trim();
        // Always use currentPage
        const urlMovie = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=de-DE&query=${encodeURIComponent(query)}&page=${currentPage}&include_adult=false`;
        const urlTV = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=de-DE&query=${encodeURIComponent(query)}&page=${currentPage}&include_adult=false`;
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
                // Store pagination info (from first successful response)
                totalPages = (dataMovie && dataMovie.total_pages) ? dataMovie.total_pages : ((dataTV && dataTV.total_pages) ? dataTV.total_pages : 1);
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
                    showWarning(errorDiv, 'Bitte gib einen gültigen Filmtitel ein.');
                    filmtitelResults.innerHTML = '';
                    renderPaginationControls();
                    return;
                }
                errorDiv.textContent = '';
                let warnImg2 = document.getElementById('filmtitelError_warnImg');
                if (warnImg2) warnImg2.remove();
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
                            // click handler for detail view via data-item attribute
                            const itemJson = encodeURIComponent(JSON.stringify(item));
                            return `<div class="media-card" style="display: flex; flex-direction: row; align-items: stretch; margin-bottom: 1em;" data-item="${itemJson}">
                                <img src="${posterUrl}" alt="Poster von ${title}" class="card-poster" style="width: 25%; height: auto; object-fit: cover; flex-shrink: 0; border-radius: 4px; cursor:pointer">
                                <div class="card-info" style="flex: 1; padding: 0 1em; display: flex; flex-direction: column; justify-content: flex-start;">
                                    <div style="margin-bottom: 0.3em;">
                                        <div class="card-title" style="font-weight:bold;font-size:1.25em;line-height:1.1; cursor:pointer">${title}</div>
                                    </div>
                                    <div style="font-size:1em; color:#444; margin-bottom:0.6em;">${year}</div>

                                    <div style="font-size:0.97em; color:#222; margin-bottom:0.8em;">
                                      ${overview}
                                    </div>

                                    <div style="font-size:0.95em; color:#666; margin-bottom:0.6em;">
                                      ${language ? 'Originalsprache: ' + language : ''}
                                    </div>
                                    ${voteCount > 0 ? `
                                    <div style="margin-top:auto;">
                                      <div style="font-size:0.95em; margin-bottom:0.12em;">Bewertung:</div>
                                      <div style="background:#e0e0e0; border-radius:4px; overflow:hidden; height:8px; width:100%; position:relative; margin-bottom:2px;">
                                        <div style="background:#555; height:100%; width:${ratingBarWidth}%;"></div>
                                      </div>
                                      <div style="font-size:0.85em; color:#888; margin-top:2px;">
                                        ${ratingValue}/10 (${voteCount} Stimmen)
                                      </div>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>`;
                        }).join('') +
                        '</div>' +
                        '<div style="margin-top: 1.5em; text-align: right; font-size: 0.9em; color: #888;">' +
                        'Daten bereitgestellt von <a href="https://www.themoviedb.org/" target="_blank" rel="noopener" style="color:#888; text-decoration:underline;">TMDB</a>' +
                        '</div>';
                } else {
                    filmtitelResults.innerHTML = '<p>Keine Ergebnisse gefunden.</p>' +
                      '<div style="margin-top: 1.5em; text-align: right; font-size: 0.9em; color: #888;">' +
                      'Daten bereitgestellt von <a href="https://www.themoviedb.org/" target="_blank" rel="noopener" style="color:#888; text-decoration:underline;">TMDB</a>' +
                      '</div>';
                }
                // Render pagination controls after results
                renderPaginationControls();
                // Event Delegation für Detailansicht (nur einmal pro Render)
                if (!filmtitelResults.dataset.eventDelegation) {
                    filmtitelResults.addEventListener('click', function(e) {
                        let card = e.target.closest('.media-card');
                        if (card && card.hasAttribute('data-item')) {
                            try {
                                const item = JSON.parse(decodeURIComponent(card.getAttribute('data-item')));
                                window.openDetailViewFromCard = function() {}; // dummy, falls alt aufgerufen
                                openDetailView(item);
                            } catch (err) {}
                        }
                    });
                    filmtitelResults.dataset.eventDelegation = 'true';
                }
            } catch (error) {
                showWarning(errorDiv, error.message);
                filmtitelResults.innerHTML = '';
                renderPaginationControls();
            }
        })();
    });

    // Ergänzung: Eventlistener für input und change auf alle Formularfelder
    const actorInput = document.getElementById('actorInput');
    // Bootstrap-Klasse zu actorInput
    actorInput.classList.add('form-control');
    function removeKriterienError() {
        [actorInput, genreSelect, typeSelect, yearFrom, yearTo].forEach(f => f.style.borderColor = '');
        const errorDiv = document.getElementById('kriterienError');
        if (errorDiv) {
            errorDiv.textContent = '';
            let warnImg = document.getElementById('kriterienError_warnImg');
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
            let warnImg = document.getElementById('filmtitelError_warnImg');
            if (warnImg) {
                warnImg.remove();
            }
        }
    }
    filmtitelInput.addEventListener('input', removeFilmtitelError);

    // Jahr-Inputs Bootstrap-Klassen und Layout für Kriterien-Suche
    // Remove unwanted Bootstrap border for sliders, only show bar
    yearFrom.classList.remove('form-control');
    yearTo.classList.remove('form-control');
    yearFrom.classList.add('form-range', 'flex-grow-1');
    yearTo.classList.add('form-range', 'flex-grow-1');

    // Umstrukturierung des yearDiv für bessere Darstellung
    const yearDiv = document.getElementById('yearDiv');
    if (yearDiv) {
        // yearDiv leeren
        yearDiv.innerHTML = '';
        // Label-Zeile: "Jahr:"
        const yearLabelRow = document.createElement('div');
        yearLabelRow.style.marginBottom = '0.5em';
        yearLabelRow.innerHTML = 'Jahr:';
        yearLabelRow.style.fontWeight = 'normal';
        yearLabelRow.style.fontSize = '1em';
        yearDiv.appendChild(yearLabelRow);

        // Zeile "von"
        const vonRow = document.createElement('div');
        vonRow.className = 'd-flex align-items-center mb-2';
        // "von"-Label
        const vonLabel = document.createElement('span');
        vonLabel.textContent = 'von';
        vonLabel.style.minWidth = '2.5em';
        vonLabel.style.marginRight = '0.7em';
        vonRow.appendChild(vonLabel);
        // yearFrom-Input
        yearFrom.style.marginRight = '0.8em';
        vonRow.appendChild(yearFrom);
        // yearFromValue
        yearFromValue.style.minWidth = '3em';
        yearFromValue.style.textAlign = 'right';
        vonRow.appendChild(yearFromValue);
        yearDiv.appendChild(vonRow);

        // Zeile "bis"
        const bisRow = document.createElement('div');
        bisRow.className = 'd-flex align-items-center';
        // "bis"-Label
        const bisLabel = document.createElement('span');
        bisLabel.textContent = 'bis';
        bisLabel.style.minWidth = '2.5em';
        bisLabel.style.marginRight = '0.7em';
        bisRow.appendChild(bisLabel);
        // yearTo-Input
        yearTo.style.marginRight = '0.8em';
        bisRow.appendChild(yearTo);
        // yearToValue
        yearToValue.style.minWidth = '3em';
        yearToValue.style.textAlign = 'right';
        bisRow.appendChild(yearToValue);
        yearDiv.appendChild(bisRow);
    }

    // Vorschläge beim Tippen: Filmtitel (Dropdown-ähnliche Auswahl)
    // --- Vorschlagslogik für FilmtitelInput ---
    // State: Vorschläge nur nach input, nicht nach focus
    let filmtitelSuggestionsActive = false;
    filmtitelInput.addEventListener('input', async function() {
        filmtitelInput.dataset.suggestionClicked = 'false';
        filmtitelSuggestionsActive = true;
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
                    // Vorschläge beider Felder komplett entfernen
                    filmtitelSuggestions.innerHTML = '';
                    filmtitelSuggestions.style.display = 'none';
                    filmtitelSuggestionsActive = false;
                    actorSuggestions.innerHTML = '';
                    actorSuggestions.style.display = 'none';
                    actorSuggestionsActive = false;
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
    // Vorschläge bei focus NICHT anzeigen, sondern nur bei input
    filmtitelInput.addEventListener('focus', function() {
        // keine Vorschläge auf focus anzeigen
    });
    // Enter schließt Vorschläge sofort
    filmtitelInput.addEventListener('keydown', function(e) {
        if (e.key === "Enter") {
            filmtitelSuggestions.innerHTML = '';
            filmtitelSuggestions.style.display = 'none';
            filmtitelSuggestionsActive = false;
        }
    });
    // Klick außerhalb schließt Vorschläge (Filmtitel)
    document.addEventListener('mousedown', function(e) {
        if (!filmtitelSuggestions.contains(e.target) && e.target !== filmtitelInput) {
            filmtitelSuggestions.innerHTML = '';
            filmtitelSuggestions.style.display = 'none';
            filmtitelSuggestionsActive = false;
        }
    });

    // Vorschläge beim Tippen: Schauspieler (actorInput) (Dropdown-ähnliche Auswahl)
    let actorSuggestions = document.getElementById('actorSuggestions');
    if (!actorSuggestions) {
        actorSuggestions = document.createElement('div');
        actorSuggestions.id = 'actorSuggestions';
        actorInput.insertAdjacentElement('afterend', actorSuggestions);
    }
    // --- Vorschlagslogik für actorInput ---
    let actorSuggestionsActive = false;
    actorInput.addEventListener('input', async function() {
        actorInput.dataset.suggestionClicked = 'false';
        actorSuggestionsActive = true;
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
                        // Vorschläge beider Felder komplett entfernen
                        filmtitelSuggestions.innerHTML = '';
                        filmtitelSuggestions.style.display = 'none';
                        filmtitelSuggestionsActive = false;
                        actorSuggestions.innerHTML = '';
                        actorSuggestions.style.display = 'none';
                        actorSuggestionsActive = false;
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
    // Vorschläge bei focus NICHT anzeigen, sondern nur bei input
    actorInput.addEventListener('focus', function() {
        // keine Vorschläge auf focus anzeigen
    });
    // Enter schließt Vorschläge sofort
    actorInput.addEventListener('keydown', function(e) {
        if (e.key === "Enter") {
            actorSuggestions.innerHTML = '';
            actorSuggestions.style.display = 'none';
            actorSuggestionsActive = false;
        }
    });
    // Klick außerhalb schließt Vorschläge (Schauspieler)
    document.addEventListener('mousedown', function(e) {
        if (!actorSuggestions.contains(e.target) && e.target !== actorInput) {
            actorSuggestions.innerHTML = '';
            actorSuggestions.style.display = 'none';
            actorSuggestionsActive = false;
        }
    });
});

// Nach jedem Laden prüfen, ob Button sichtbar sein soll (z.B. falls Startansicht)
document.addEventListener('DOMContentLoaded', () => {
    // Initial prüfen, falls Seite auf einer Suchoption startet
    const filmtitelSection = document.getElementById('filmtitelSection');
    const kriterienSection = document.getElementById('kriterienSection');
    const switchSearchBtn = document.getElementById('switchSearchBtn');
    const startSection = document.getElementById('startSection');
    const kriterienProgressBarContainer = document.getElementById('kriterienProgressContainer');
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
    // Fortschrittsbalken: nur bei Kriterien-Suche sichtbar, sonst immer ausblenden
    if (kriterienSection && kriterienSection.style.display !== 'none' && kriterienProgressBarContainer) {
        kriterienProgressBarContainer.style.display = 'block';
    } else {
        kriterienProgressBarContainer.style.display = 'none';
    }
});

// --- Pagination controls rendering ---
function renderPaginationControls() {
  const container = document.getElementById("pagination");
  if (!container) return;

  container.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "← Vorherige Seite";
  prevBtn.disabled = currentPage <= 1;
  prevBtn.className = "btn btn-outline-secondary me-2";
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      isPaginating = true;
      currentPage--;
      performSearch();
    }
  };

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Nächste Seite →";
  nextBtn.disabled = currentPage >= totalPages;
  nextBtn.className = "btn btn-outline-secondary ms-2";
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      isPaginating = true;
      currentPage++;
      performSearch();
    }
  };

  const info = document.createElement("span");
  info.textContent = ` Seite ${currentPage} von ${totalPages} `;
  info.style.verticalAlign = "middle";

  container.appendChild(prevBtn);
  container.appendChild(info);
  container.appendChild(nextBtn);
}

// Helper to trigger the correct search for pagination
function performSearch() {
  // Try to detect which search section is visible and trigger the respective search
  const filmtitelSection = document.getElementById('filmtitelSection');
  const kriterienSection = document.getElementById('kriterienSection');
  if (filmtitelSection && filmtitelSection.style.display !== 'none') {
    // Trigger filmtitel search
    document.getElementById('filmtitelSearchBtn').click();
  } else if (kriterienSection && kriterienSection.style.display !== 'none') {
    // Trigger kriterien search
    document.getElementById('kriterienSearchBtn').click();
  }
}

