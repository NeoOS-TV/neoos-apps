// Globaler App-Zustand
let currentMenu = 'sidebar'; // 'sidebar', 'grid', 'search-input', oder 'player'
let sidebarIndex = 0;
let gridIndex = 0;
let playerBtnIndex = 0; // 0: Play/Pause, 1: Fav, 2: Close

let stationsData = [];
let favoritesList = JSON.parse(localStorage.getItem('neoRadio_favs')) || [];
let currentAudio = null;
let isOverlayActive = false;
let currentPlayingStation = null;
let metadataInterval = null;

const CARDS_PER_ROW = 4;

// Fest definiertes Objekt für den Baumann & Clausen Stream
const COMEDY_SHORTCUT_STATION = {
    id: "baumann-clausen-shortcut-uuid",
    title: "Baumann & Clausen (R.SH)",
    logo: "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolssharp/sentiment_very_satisfied/default/24px.svg",
    url: "http://stream.rsh.de/rsh-comedy/mp3-192/",
    sub: "Comedy, Non-Stop"
};

// DOM Elemente
let sidebarItems = document.querySelectorAll('.nav-item');
const radioGrid = document.getElementById('radio-grid');
const playingOverlay = document.getElementById('radio-playing-overlay');
const searchContainer = document.getElementById('search-bar-container');
const sectionTitle = document.getElementById('current-section-title');

// App-Start
document.addEventListener('DOMContentLoaded', () => {
    sidebarItems = document.querySelectorAll('.nav-item'); // Aktualisiert die Liste für die Steuerung
    updateFocus();
    switchSection('top-stations');
});

function switchSection(target) {
    searchContainer.style.display = 'none';
    gridIndex = 0;
    
    if (target === 'top-stations') {
        sectionTitle.textContent = "Top Radiosender";
        loadRadioStations("https://de1.api.radio-browser.info/json/stations/bycountry/germany?limit=50&order=clickcount&reverse=true");
    } else if (target === 'favorites') {
        sectionTitle.textContent = "Deine Favoriten";
        stationsData = [...favoritesList];
        renderGrid();
    } else if (target === 'search') {
        sectionTitle.textContent = "Sender Suchen";
        stationsData = [];
        renderGrid();
        // Trigger direkt den nativen Browser-Dialog
        triggerNativeSearch();
    } else if (target === 'shortcut-comedy') {
        playRadio(COMEDY_SHORTCUT_STATION);
    }
}

// Öffnet das native Tastatur-Fenster des Browsers
function triggerNativeSearch() {
    // Kurzer Timeout, damit der TV-Browser mit dem UI-Wechsel hinterherkommt
    setTimeout(() => {
        const query = prompt("Radiosender suchen:");
        
        if (query !== null && query.trim().length > 0) {
            sectionTitle.textContent = `Suche nach: ${query.trim()}`;
            loadRadioStations(`https://de1.api.radio-browser.info/json/stations/byname/${encodeURIComponent(query.trim())}?limit=40`);
            currentMenu = 'grid';
            gridIndex = 0;
        } else {
            // Falls abgebrochen oder leer: Zurück zur Sidebar
            currentMenu = 'sidebar';
        }
        updateFocus();
    }, 100);
}

async function loadRadioStations(url) {
    radioGrid.innerHTML = "<div style='font-size:24px; padding:20px;'>Lade Sender...</div>";
    try {
        const response = await fetch(url);
        const stations = await response.json();
        
        stationsData = stations.map(station => ({
            id: station.stationuuid,
            title: station.name,
            logo: station.favicon || "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolssharp/radio/default/24px.svg",
            url: station.url_resolved || station.url,
            sub: station.tags ? station.tags.split(',').slice(0, 2).join(', ') : "Radio Stream"
        }));
        
        renderGrid();
    } catch (error) {
        console.error("API Fehler:", error);
        radioGrid.innerHTML = "<div style='color:red; font-size:24px; padding:20px;'>Fehler beim Laden.</div>";
    }
}

function renderGrid() {
    radioGrid.innerHTML = "";
    if (stationsData.length === 0) {
        if (sectionTitle.textContent.includes("Favoriten")) {
            radioGrid.innerHTML = "<div style='font-size:22px; color:#666; padding:20px;'>Noch keine Favoriten gespeichert.<br>Nutze die Favoriten-Taste im Player.</div>";
        } else if (sectionTitle.textContent.includes("Suchen") || sectionTitle.textContent.includes("Suche nach")) {
            radioGrid.innerHTML = "<div style='font-size:22px; color:#666; padding:20px;'>Drücke ENTER auf 'Sender Suchen' für eine neue Suche.</div>";
        }
        return;
    }

    stationsData.forEach((station, index) => {
        const isFav = favoritesList.some(f => f.id === station.id);
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-index', index);
        
        card.innerHTML = `
            ${isFav ? '<span class="material-symbols-sharp card-fav-star">star</span>' : ''}
            <div class="card-logo-container">
                <img class="card-logo" src="${station.logo}" onerror="this.src='https://fonts.gstatic.com/s/i/short-term/release/materialsymbolssharp/radio/default/24px.svg'">
            </div>
            <div class="card-title">${station.title}</div>
            <div class="card-sub">${station.sub}</div>
        `;
        
        radioGrid.appendChild(card);
    });
    
    updateFocus();
}

function playRadio(station) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = "";
        currentAudio = null;
    }
    clearInterval(metadataInterval);

    currentPlayingStation = station;
    currentAudio = new Audio(station.url);
    currentAudio.play().catch(err => console.error("Wiedergabefehler:", err));

    document.getElementById('radio-now-img').src = station.logo;
    document.getElementById('radio-now-img').onerror = function() {
        this.src = 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolssharp/radio/default/24px.svg';
    };
    document.getElementById('radio-now-name').textContent = station.title;
    document.getElementById('radio-now-genre').textContent = station.sub;
    
    if (station.id === "baumann-clausen-shortcut-uuid") {
        document.getElementById('radio-now-song').textContent = "☕ Käffchen? - Schöno!";
    } else {
        document.getElementById('radio-now-song').textContent = "Lade Live-Songinfo...";
        fetchLiveSongInfo(station.id);
        metadataInterval = setInterval(() => fetchLiveSongInfo(station.id), 15000);
    }
    
    document.getElementById('btn-play').innerHTML = `<span class="material-symbols-sharp">pause</span>`;
    document.getElementById('radio-visualizer').style.display = 'flex';

    updatePlayerFavButton();

    playingOverlay.style.display = 'flex';
    isOverlayActive = true;
    currentMenu = 'player'; 
    playerBtnIndex = 0; 
    updateFocus();
}

async function fetchLiveSongInfo(uuid) {
    try {
        const res = await fetch(`https://de1.api.radio-browser.info/json/stations/byuuid/${uuid}`);
        const data = await res.json();
        if (data && data[0]) {
            document.getElementById('radio-now-song').textContent = data[0].songtitle || "Live-Übertragung läuft...";
        }
    } catch (e) {
        document.getElementById('radio-now-song').textContent = "Live-Übertragung läuft...";
    }
}

function updatePlayerFavButton() {
    const btnFav = document.getElementById('btn-fav');
    const isFav = favoritesList.some(f => f.id === currentPlayingStation.id);
    if (isFav) {
        btnFav.classList.add('is-favorite');
        btnFav.innerHTML = `<span class="material-symbols-sharp">star</span>`;
    } else {
        btnFav.classList.remove('is-favorite');
        btnFav.innerHTML = `<span class="material-symbols-sharp">star_border</span>`;
    }
}

function toggleFavorite(station) {
    const existsIndex = favoritesList.findIndex(f => f.id === station.id);
    if (existsIndex > -1) {
        favoritesList.splice(existsIndex, 1);
    } else {
        favoritesList.push(station);
    }
    localStorage.setItem('neoRadio_favs', JSON.stringify(favoritesList));
    
    if (sidebarItems[sidebarIndex].getAttribute('data-target') === 'favorites') {
        stationsData = [...favoritesList];
        if (gridIndex >= stationsData.length && gridIndex > 0) gridIndex = stationsData.length - 1;
    }
    renderGrid();
    updatePlayerFavButton();
}

function updateFocus() {
    sidebarItems.forEach(item => item.classList.remove('focused'));
    document.querySelectorAll('.card').forEach(card => card.classList.remove('focused'));
    document.querySelectorAll('.control-btn').forEach(btn => btn.classList.remove('player-focused'));

    if (currentMenu === 'sidebar') {
        if (sidebarItems[sidebarIndex]) sidebarItems[sidebarIndex].classList.add('focused');
    } else if (currentMenu === 'grid') {
        const activeCard = document.querySelector(`.card[data-index="${gridIndex}"]`);
        if (activeCard) {
            activeCard.classList.add('focused');
            activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else if (currentMenu === 'player') {
        const playerBtns = [document.getElementById('btn-play'), document.getElementById('btn-fav'), document.getElementById('btn-close')];
        if (playerBtns[playerBtnIndex]) {
            playerBtns[playerBtnIndex].classList.add('player-focused');
        }
    }
}

// Key-Steuerung (TV-optimiert)
window.addEventListener('keydown', (e) => {
    
    if (currentMenu === 'player') {
        if (e.key === 'Escape' || e.key === 'Backspace' || e.keyCode === 461) {
            playingOverlay.style.display = 'none';
            isOverlayActive = false;
            currentMenu = 'grid';
            updateFocus();
            e.preventDefault();
            return;
        }

        if (e.key === 'ArrowLeft') {
            if (playerBtnIndex > 0) playerBtnIndex--;
            updateFocus();
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            if (playerBtnIndex < 2) playerBtnIndex++;
            updateFocus();
            e.preventDefault();
        } else if (e.key === 'Enter') {
            if (playerBtnIndex === 0) { 
                if (currentAudio.paused) {
                    currentAudio.play();
                    document.getElementById('btn-play').innerHTML = `<span class="material-symbols-sharp">pause</span>`;
                    document.getElementById('radio-visualizer').style.display = 'flex';
                } else {
                    currentAudio.pause();
                    document.getElementById('btn-play').innerHTML = `<span class="material-symbols-sharp">play_arrow</span>`;
                    document.getElementById('radio-visualizer').style.display = 'none';
                }
            } else if (playerBtnIndex === 1) { 
                if (currentPlayingStation) toggleFavorite(currentPlayingStation);
            } else if (playerBtnIndex === 2) { 
                playingOverlay.style.display = 'none';
                isOverlayActive = false;
                currentMenu = 'grid';
                updateFocus();
            }
            e.preventDefault();
        }
        return;
    }

    switch (e.key) {
        case 'ArrowUp':
            if (currentMenu === 'sidebar') {
                if (sidebarIndex > 0) sidebarIndex--;
            } else if (currentMenu === 'grid') {
                if (gridIndex >= CARDS_PER_ROW) gridIndex -= CARDS_PER_ROW;
            }
            updateFocus();
            e.preventDefault();
            break;

        case 'ArrowDown':
            if (currentMenu === 'sidebar') {
                if (sidebarIndex < sidebarItems.length - 1) sidebarIndex++;
            } else if (currentMenu === 'grid') {
                if (gridIndex + CARDS_PER_ROW < stationsData.length) {
                    gridIndex += CARDS_PER_ROW;
                } else if (gridIndex < stationsData.length - 1) {
                    gridIndex = stationsData.length - 1;
                }
            }
            updateFocus();
            e.preventDefault();
            break;

        case 'ArrowLeft':
            if (currentMenu === 'grid') {
                if (gridIndex % CARDS_PER_ROW === 0) {
                    currentMenu = 'sidebar';
                } else {
                    gridIndex--;
                }
                updateFocus();
            }
            e.preventDefault();
            break;

        case 'ArrowRight':
            if (currentMenu === 'sidebar') {
                const target = sidebarItems[sidebarIndex].getAttribute('data-target');
                if (target === 'search') {
                    triggerNativeSearch();
                } else if (target === 'shortcut-comedy') {
                    e.preventDefault();
                } else if (stationsData.length > 0) {
                    currentMenu = 'grid';
                    gridIndex = 0;
                    updateFocus();
                }
            } else if (currentMenu === 'grid') {
                if (gridIndex < stationsData.length - 1) {
                    gridIndex++;
                    updateFocus();
                }
            }
            e.preventDefault();
            break;

        case 'Enter':
            if (currentMenu === 'sidebar') {
                const target = sidebarItems[sidebarIndex].getAttribute('data-target');
                if (target !== 'shortcut-comedy') {
                    sidebarItems.forEach(item => item.classList.remove('active'));
                    sidebarItems[sidebarIndex].classList.add('active');
                }
                switchSection(target);
            } else if (currentMenu === 'grid') {
                if (stationsData[gridIndex]) playRadio(stationsData[gridIndex]);
            }
            e.preventDefault();
            break;

        case 'Backspace':
        case 'Escape':
        case 461:
            if (currentMenu === 'grid') {
                currentMenu = 'sidebar';
                updateFocus();
                e.preventDefault();
            }
            break;
    }
});
