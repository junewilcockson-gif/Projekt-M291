document.getElementById('kriterienBtn').addEventListener('click', function() {
    const form = document.getElementById('searchForm');
    form.innerHTML = '';
    document.querySelector('h1').textContent = 'Suche nach Kriterien';

    const steps = [
        { label: 'Schauspieler', type: 'text', id: 'actorInput', placeholder: 'Schauspieler eingeben...' },
        { label: 'Genre', type: 'select', id: 'genreSelect', options: ['Wähle Genre'] },
        { label: 'Jahr', type: 'range', id: 'year', fromId: 'yearFrom', toId: 'yearTo', min: 1900, max: 2100 },
        { label: 'Film oder Serie?', type: 'select', id: 'typeSelect', options: ['Wähle Typ'] }
    ];

    let currentStep = 0;

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

        if (step.type === 'select') {
            const input = document.createElement('select');
            input.id = step.id;
            step.options.forEach(opt => {
                const option = document.createElement('option');
                option.textContent = opt;
                input.appendChild(option);
            });
            div.appendChild(input);
        } else if (step.type === 'range' && step.fromId && step.toId) {
            const fromInput = document.createElement('input');
            fromInput.type = 'range';
            fromInput.id = step.fromId;
            fromInput.min = step.min;
            fromInput.max = step.max;
            fromInput.value = step.min;

            const toInput = document.createElement('input');
            toInput.type = 'range';
            toInput.id = step.toId;
            toInput.min = step.min;
            toInput.max = step.max;
            toInput.value = step.max;

            const fromLabel = document.createElement('span');
            fromLabel.textContent = 'Von: ';
            fromLabel.style.marginRight = '5px';

            const fromValue = document.createElement('span');
            fromValue.textContent = fromInput.value; 
            fromValue.style.marginRight = '15px';

            const toLabel = document.createElement('span');
            toLabel.textContent = 'Bis: ';
            toLabel.style.margin = '0 5px 0 0';

            const toValue = document.createElement('span');
            toValue.textContent = toInput.value; 

            // Eventlistener für live-Anzeige
            fromInput.addEventListener('input', () => {
                fromValue.textContent = fromInput.value;
            });

            toInput.addEventListener('input', () => {
                toValue.textContent = toInput.value;
            });

            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.justifyContent = 'center';
            container.style.alignItems = 'center';
            container.appendChild(fromLabel);
            container.appendChild(fromInput);
            container.appendChild(fromValue);
            container.appendChild(toLabel);
            container.appendChild(toInput);
            container.appendChild(toValue);

            div.appendChild(container);
        } else {
            const input = document.createElement('input');
            input.type = step.type;
            input.id = step.id;
            if (step.placeholder) input.placeholder = step.placeholder;
            if (step.min) input.min = step.min;
            if (step.max) input.max = step.max;
            div.appendChild(input);
        }

        form.insertBefore(div, actionBtn);
    }

    addField(steps[currentStep]);
    currentStep++;

    actionBtn.addEventListener('click', function() {
        if (currentStep < steps.length - 1) {
            addField(steps[currentStep]);
            currentStep++;
        } else if (currentStep === steps.length - 1) {
            addField(steps[currentStep]);

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
