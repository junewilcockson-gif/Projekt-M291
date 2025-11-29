document.getElementById('filmtitelBtn').addEventListener('click', function() {
    document.querySelector('h1').textContent = 'Filmtitel';
    document.getElementById('searchForm').innerHTML = '<input type="text" id="searchInput" placeholder="Suche nach Filmtitel..."><button type="button" id="confirmBtn" style="display:none;">Suchen</button><p id="warning" style="color: #FF3939; display:none;">Die Eingabe ist zu lang.</p>';
    
    document.getElementById('searchInput').addEventListener('input', function() {
        document.getElementById('confirmBtn').style.display = 'inline-block';
        document.getElementById('warning').style.display = 'none';
        document.getElementById('warningIcon').style.display = 'none';
    });
    
    document.getElementById('confirmBtn').addEventListener('click', function() {
        if (document.getElementById('searchInput').value.length > 50) {
            document.getElementById('warning').style.display = 'block';
            if (!document.getElementById('warningIcon')) {
                const icon = document.createElement('img');
                icon.id = 'warningIcon';
                icon.src = 'assets/warnung.png';
                icon.style.width = '5%';
                icon.style.height = 'auto';
                icon.style.display = 'block';
                icon.style.margin = '0 auto';
                icon.alt = 'Warnung';
                document.getElementById('searchForm').appendChild(icon);
            }
            document.getElementById('warningIcon').style.display = 'block';
        } else {
            // Perform search or something
            alert('Suche durchgeführt');
        }
    });
});

document.getElementById('kriterienBtn').addEventListener('click', function() {
    document.querySelector('h1').textContent = 'Suche nach Kriterien';
    document.getElementById('searchForm').innerHTML = '<label for="actorInput">Schauspieler</label><input type="text" id="actorInput" pattern="[a-zA-Z ]*" maxlength="50" placeholder="Schauspieler eingeben..."><button type="button" id="skipActor">Skip</button>';
    
    document.getElementById('skipActor').addEventListener('click', function() {
        document.getElementById('searchForm').innerHTML += '<br><label for="genreSelect">Genre</label><select id="genreSelect"><option value="">Wähle Genre</option></select><button type="button" id="skipGenre">Skip</button>';
        
        document.getElementById('skipGenre').addEventListener('click', function() {
            document.getElementById('searchForm').innerHTML += '<br><label>Jahr</label><label for="yearFrom">von</label><input type="number" id="yearFrom" min="1900" max="2100" step="1"><label for="yearTo">bis</label><input type="number" id="yearTo" min="1900" max="2100" step="1"><button type="button" id="skipYear">Skip</button>';
            
            document.getElementById('skipYear').addEventListener('click', function() {
                document.getElementById('searchForm').innerHTML += '<br><label for="typeSelect">Film oder Serie?</label><select id="typeSelect"><option value="">Wähle Typ</option></select>';
            });
        });
    });
});
