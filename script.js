document.getElementById('kriterienBtn').addEventListener('click', function() {
    const form = document.getElementById('searchForm');
    form.innerHTML = '';
    document.querySelector('h1').textContent = 'Suche nach Kriterien';

    const steps = [
        { label: 'Schauspieler', type: 'text', id: 'actorInput', placeholder: 'Schauspieler eingeben...' },
        { label: 'Genre', type: 'select', id: 'genreSelect', options: ['Wähle Genre'] },
        { label: 'Jahr von', type: 'number', id: 'yearFrom', min: 1900, max: 2100 },
        { label: 'Jahr bis', type: 'number', id: 'yearTo', min: 1900, max: 2100 },
        { label: 'Film oder Serie?', type: 'select', id: 'typeSelect', options: ['Wähle Typ'] }
    ];

    let currentStep = 0;

    // Einen einzigen Button erstellen
    const actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.style.display = 'block';
    actionBtn.style.margin = '10px auto';
    actionBtn.textContent = 'Weiter';
    form.appendChild(actionBtn);

    function addField(step) {
        const div = document.createElement('div');
        div.style.marginBottom = '10px';
        const label = document.createElement('label');
        label.textContent = step.label + ': ';
        div.appendChild(label);

        let input;
        if (step.type === 'select') {
            input = document.createElement('select');
            input.id = step.id;
            step.options.forEach(opt => {
                const option = document.createElement('option');
                option.textContent = opt;
                input.appendChild(option);
            });
        } else {
            input = document.createElement('input');
            input.type = step.type;
            input.id = step.id;
            if (step.placeholder) input.placeholder = step.placeholder;
            if (step.min) input.min = step.min;
            if (step.max) input.max = step.max;
        }
        div.appendChild(input);

        // Button immer ans Ende setzen
        form.insertBefore(div, actionBtn);
    }

    // Erstes Feld direkt anzeigen
    addField(steps[currentStep]);
    currentStep++;

    // Button klick-Event
    actionBtn.addEventListener('click', function() {
        if (currentStep < steps.length - 1) {
            addField(steps[currentStep]);
            currentStep++;
        } else if (currentStep === steps.length - 1) {
            // Letztes Feld hinzufügen
            addField(steps[currentStep]);
            // Button zu Suchen ändern
            const searchBtn = document.createElement('button');
            searchBtn.type = 'button';
            searchBtn.textContent = 'Suchen';
            searchBtn.style.display = 'block';
            searchBtn.style.margin = '10px auto';
            form.replaceChild(searchBtn, actionBtn);

            searchBtn.addEventListener('click', function() {
                alert('Suche durchgeführt!');
            });

            currentStep++;
        }
    });
});
