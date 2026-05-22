// ================= CONFIG & STATE =================
let embyConfig = JSON.parse(localStorage.getItem('neoEmby_config')) || { url: '', token: '' };
let currentItems = [];
let selectedItem = null;

const deviceId = localStorage.getItem('neoEmby_deviceId') || 'neoTV_' + Math.random().toString(36).substring(2, 11);
localStorage.setItem('neoEmby_deviceId', deviceId);

// App-Zustände
let currentMenu = ''; 
let activeZone = 'settings'; 
let sidebarIndex = 0;
let gridIndex = 0;
let settingsIndex = 0;

let detailBtnIndex = 0;
const detailButtons = ['btn-detail-play', 'btn-detail-restart', 'btn-detail-back'];

// Player-Zustände
let isPlayerActive = false;
let currentHls = null;
let osdTimeout = null;
let progressInterval = null;
let playerFocusZone = 'buttons';
let playerBtnIndex = 1;
const playerButtons = ['btn-rw', 'btn-play-pause', 'btn-ff'];

let menuItems = [];

// ================= INIT =================
async function init() {
    // 1. App-Infos aus appinfo.json laden (inkl. ID & UI-Revision)
    try {
        const appInfoResp = await fetch('appinfo.json');
        if (appInfoResp.ok) {
            const appInfo = await appInfoResp.json();
            document.getElementById('app-info-display').innerHTML = `
                <strong>${appInfo.title || 'NeoEmby'} v${appInfo.version || '1.0.0'}</strong><br>
                <span style="font-size: 12px; color: #888;">${appInfo.id || ''}</span><br>
                Vendor: ${appInfo.vendor || 'NeoOS'} | Rev: ${appInfo.uiRevision || '0'}
            `;
        }
    } catch(e) {
        console.log("App-Info konnte nicht geladen werden:", e);
        document.getElementById('app-info-display').innerHTML = "NeoEmby v1.0.0<br>Vendor: NeoOS";
    }

    // 2. Bestehender Code: Formularfelder befüllen & Verbindung prüfen
    document.getElementById('emby-url').value = embyConfig.url || '';
    document.getElementById('emby-token').value = embyConfig.token || '';

    const video = document.getElementById('native-player');
    if (video) {
        video.addEventListener('timeupdate', updatePlaybackProgress);
    }

    if (embyConfig.url && embyConfig.token) {
        await fetchLibraries(); 
    } else {
        updateServerStatus(false);
        switchToSettings();
    }
}



// ================= COMPATIBLE LIBRARIES FETCH =================
async function fetchLibraries() {
    const sidebarNav = document.getElementById('sidebar-nav');
    sidebarNav.innerHTML = `<div style="padding:15px; color:#aaa; font-size:14px;">Lade Bibliotheken...</div>`;

    if (!embyConfig.url || !embyConfig.token) {
        sidebarNav.innerHTML = `<div style="padding:15px; color:#ff3333; font-size:14px;">Keine Zugangsdaten</div>`;
        switchToSettings();
        return;
    }

    // Geänderter Endpunkt: /emby/Library/SelectableMediaFolders ist extrem kompatibel mit Emby & Jellyfin
    const url = `${embyConfig.url}/emby/Library/SelectableMediaFolders?api_key=${embyConfig.token}`;

    try {
        const response = await fetch(url, { 
            headers: { 'X-Emby-Token': embyConfig.token },
            signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) throw new Error("Server antwortet mit Fehler");
        const data = await response.json();

        menuItems = [];
        sidebarNav.innerHTML = '';

        // Befüllen der Haupt-Bibliotheken
        (data || []).forEach((item, index) => {
            const btn = document.createElement('div');
            btn.className = 'nav-item';
            btn.id = `menu-item-${index}`;
            btn.innerHTML = `<span class="material-symbols-sharp">folder</span> ${item.Name}`;
            sidebarNav.appendChild(btn);

            menuItems.push({
                id: btn.id,
                type: 'Library',
                parentId: item.Id, 
                title: item.Name,
                element: btn
            });
        });

        // Server-Setup Menüpunkt hinzufügen
        const settingsBtn = document.createElement('div');
        settingsBtn.className = 'nav-item';
        settingsBtn.id = `menu-item-settings`;
        settingsBtn.innerHTML = `<span class="material-symbols-sharp">settings</span> Server-Setup`;
        sidebarNav.appendChild(settingsBtn);

        menuItems.push({
            id: settingsBtn.id,
            type: 'Settings',
            parentId: null,
            title: 'Server-Setup',
            element: settingsBtn
        });

        updateServerStatus(true);
        
        if (menuItems.length > 1) {
            activeZone = 'sidebar';
            changeMenu(0);
        } else {
            switchToSettings();
        }

    } catch (err) {
        console.error("Library Fetch Fehler, versuche Fallback...", err);
        // Fallback auf den Standard /Items Stammordner falls der obige Pfad auch scheitert
        await fetchLibrariesFallback();
    }
}

// ================= FALLBACK API METHODE =================
async function fetchLibrariesFallback() {
    const sidebarNav = document.getElementById('sidebar-nav');
    const url = `${embyConfig.url}/emby/Items?api_key=${embyConfig.token}`;

    try {
        const response = await fetch(url, { headers: { 'X-Emby-Token': embyConfig.token } });
        if (!response.ok) throw new Error("Fallback gescheitert");
        const data = await response.json();

        menuItems = [];
        sidebarNav.innerHTML = '';

        (data.Items || []).forEach((item, index) => {
            if (item.Type === "CollectionFolder") {
                const btn = document.createElement('div');
                btn.className = 'nav-item';
                btn.id = `menu-item-${index}`;
                btn.innerHTML = `<span class="material-symbols-sharp">folder</span> ${item.Name}`;
                sidebarNav.appendChild(btn);

                menuItems.push({
                    id: btn.id,
                    type: 'Library',
                    parentId: item.Id, 
                    title: item.Name,
                    element: btn
                });
            }
        });

        const settingsBtn = document.createElement('div');
        settingsBtn.className = 'nav-item';
        settingsBtn.id = `menu-item-settings`;
        settingsBtn.innerHTML = `<span class="material-symbols-sharp">settings</span> Server-Setup`;
        sidebarNav.appendChild(settingsBtn);

        menuItems.push({
            id: settingsBtn.id,
            type: 'Settings',
            parentId: null,
            title: 'Server-Setup',
            element: settingsBtn
        });

        updateServerStatus(true);
        if (menuItems.length > 1) { activeZone = 'sidebar'; changeMenu(0); } else { switchToSettings(); }

    } catch(e) {
        sidebarNav.innerHTML = `<div style="padding:15px; color:#ff3333; font-size:14px;">Verbindung fehlgeschlagen</div>`;
        updateServerStatus(false);
        menuItems = [{ id: 'menu-item-settings', type: 'Settings', parentId: null, title: 'Server-Setup', element: null }];
        switchToSettings();
    }
}

// ================= SERVER STATUS =================
function updateServerStatus(connected) {
    const status = document.getElementById('server-status');
    if(status) {
        status.innerText = connected ? "Verbunden" : "Nicht verbunden";
        status.style.color = connected ? "#00ff88" : "#ff3333";
    }
}

// ================= SETTINGS SPEICHERN =================
async function connectToEmby() {
    let url = document.getElementById('emby-url').value.trim();
    const token = document.getElementById('emby-token').value.trim();
    
    if (!url || !token) {
        alert("Bitte URL und Token ausfüllen.");
        return;
    }

    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    
    // Erzwinge http:// falls vergessen wurde
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
    }

    const status = document.getElementById('server-status');
    if(status) { status.innerText = "Verbinde..."; status.style.color = "#ffaa00"; }

    embyConfig = { url, token };
    localStorage.setItem('neoEmby_config', JSON.stringify(embyConfig));
    
    await fetchLibraries();
}

function switchToSettings() {
    document.getElementById('grid').style.display = 'none';
    document.getElementById('settings-view').style.display = 'block';
    document.getElementById('detail-view').style.display = 'none';
    document.getElementById('area-title').innerText = 'Server-Setup';
    
    menuItems.forEach(item => { if(item.element) item.element.classList.remove('active'); });
    const sBtn = document.getElementById('menu-item-settings');
    if(sBtn) sBtn.classList.add('active');

    updateFocus();
}

// ================= FETCH & GRID =================
async function fetchEmbyData() {
    if (!embyConfig.url || !embyConfig.token || !currentMenu) return;

    const grid = document.getElementById('grid');
    grid.innerHTML = `<div style="padding:40px; color:#aaa;">Lade Medien...</div>`;
    document.getElementById('settings-view').style.display = 'none';

    const apiUrl = `${embyConfig.url}/emby/Items?ParentId=${currentMenu}&Recursive=true&Fields=PrimaryImageAspectRatio,Overview,Genres,ProductionYear,RunTimeTicks,UserData&api_key=${embyConfig.token}`;

    try {
        const response = await fetch(apiUrl, {
            headers: { 'X-Emby-Token': embyConfig.token }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        currentItems = (data.Items || []).filter(item => item.Type !== 'CollectionFolder' && item.Type !== 'Folder');
        renderGrid();
    } catch (err) {
        console.error("Fehler beim Laden der Medien:", err);
        grid.innerHTML = `<div style="padding:40px; color:#ff3333;">Inhalte konnten nicht geladen werden.</div>`;
    }
}

function renderGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    if (currentItems.length === 0) {
        grid.innerHTML = `<div style="padding:40px; color:#666; font-size:20px;">Diese Bibliothek ist leer.</div>`;
        return;
    }

    currentItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.id = `card-${index}`;
        const imgUrl = item.ImageTags && item.ImageTags.Primary
            ? `${embyConfig.url}/emby/Items/${item.Id}/Images/Primary?maxHeight=300&api_key=${embyConfig.token}`
            : 'https://via.placeholder.com/216x300/1c1c1c/ffffff?text=Kein+Cover';
        card.innerHTML = `<div class="poster-container"><img class="poster-img" src="${imgUrl}"></div><div class="card-title">${item.Name}</div>`;
        grid.appendChild(card);
    });

    updateFocus();
}

// ================= DETAILVIEW =================
function showDetailView(item) {
    if (!item) return;
    selectedItem = item;
    activeZone = 'detail';
    detailBtnIndex = 0;

    document.getElementById('grid').style.display = 'none';
    document.getElementById('detail-view').style.display = 'block';

    document.getElementById('detail-title').innerText = item.Name;
    document.getElementById('detail-year').innerText = item.ProductionYear || "Unbekannt";
    document.getElementById('detail-overview').innerText = item.Overview || "Keine Beschreibung verfügbar.";
    document.getElementById('detail-genres').innerText = item.Genres && item.Genres.length > 0 ? item.Genres.join(', ') : 'Keine Genres';

    const minutes = item.RunTimeTicks ? Math.round(item.RunTimeTicks / 10000000 / 60) : "--";
    document.getElementById('detail-runtime').innerText = `${minutes} Min`;

    document.getElementById('detail-poster').src = item.ImageTags && item.ImageTags.Primary
        ? `${embyConfig.url}/emby/Items/${item.Id}/Images/Primary?maxHeight=600&api_key=${embyConfig.token}`
        : 'https://via.placeholder.com/380x570/1c1c1c/ffffff?text=Kein+Cover';

    if (item.BackdropImageTags && item.BackdropImageTags.length > 0) {
        document.getElementById('detail-backdrop').style.backgroundImage = `url('${embyConfig.url}/emby/Items/${item.Id}/Images/Backdrop/0?maxWidth=1920&api_key=${embyConfig.token}')`;
    } else {
        document.getElementById('detail-backdrop').style.backgroundImage = 'none';
    }

    const playBtn = document.getElementById('btn-detail-play');
    const restartBtn = document.getElementById('btn-detail-restart');

    if (item.UserData && item.UserData.PlaybackPositionTicks > 100000000) {
        playBtn.innerText = "Fortsetzen";
        restartBtn.style.display = "block";
    } else {
        playBtn.innerText = "Abspielen";
        restartBtn.style.display = "none";
    }

    updateFocus();
}

async function refreshSelectedItemData() {
    if (!selectedItem || !embyConfig.url || !embyConfig.token) {
        fallbackToDetail();
        return;
    }
    
    const url = `${embyConfig.url}/emby/Items/${selectedItem.Id}?Fields=UserData&api_key=${embyConfig.token}`;

    try {
        const response = await fetch(url, {
            headers: { 
                'X-Emby-Token': embyConfig.token,
                'X-Emby-Client': 'NeoEmby WebApp',
                'X-Emby-Device-Id': deviceId
            }
        });
        if (response.ok) {
            const freshItem = await response.json();
            selectedItem = freshItem; 
            
            const playBtn = document.getElementById('btn-detail-play');
            const restartBtn = document.getElementById('btn-detail-restart');
            
            if (freshItem.UserData && freshItem.UserData.PlaybackPositionTicks > 100000000) { 
                playBtn.innerText = "Fortsetzen";
                restartBtn.style.display = "block"; 
            } else {
                playBtn.innerText = "Abspielen";
                restartBtn.style.display = "none";
            }
        }
    } catch(e) {
        console.error("Fehler beim Aktualisieren der Item-Daten", e);
    }
    
    fallbackToDetail();
}

function fallbackToDetail() {
    activeZone = 'detail';
    detailBtnIndex = 0;
    updateFocus();
}

function closeDetailView() {
    document.getElementById('detail-view').style.display = 'none';
    document.getElementById('grid').style.display = 'flex';
    activeZone = 'grid';
    fetchEmbyData(); 
    updateFocus();
}

function changeMenu(index) {
    if (menuItems.length === 0) return;
    
    menuItems.forEach(item => { if(item.element) item.element.classList.remove('active'); });
    sidebarIndex = index;
    if(menuItems[sidebarIndex].element) menuItems[sidebarIndex].element.classList.add('active');
    
    document.getElementById('area-title').innerText = menuItems[sidebarIndex].title;
    
    if (menuItems[sidebarIndex].type === 'Settings') {
        switchToSettings();
    } else {
        currentMenu = menuItems[sidebarIndex].parentId; 
        gridIndex = 0; 
        
        document.getElementById('settings-view').style.display = 'none';
        document.getElementById('detail-view').style.display = 'none';
        document.getElementById('grid').style.display = 'flex';
        
        fetchEmbyData(); 
    }
}

// ================= PLAYER INITIALISIERUNG =================
function playEmbyItem(item, resume) {
    if (!item) return;

    const overlay = document.getElementById('player-overlay');
    const player = document.getElementById('native-player');

    overlay.style.display = 'block';
    isPlayerActive = true;
    activeZone = 'player';
    playerFocusZone = 'buttons';
    playerBtnIndex = 1;
    document.querySelector('#btn-play-pause .material-symbols-sharp').innerText = 'pause';
    document.getElementById('osd-title').innerText = item.Name;

    const streamUrl = `${embyConfig.url}/emby/Videos/${item.Id}/Stream?static=true&api_key=${embyConfig.token}`;
    player.src = streamUrl;
    showOSD();

    if (resume && item.UserData && item.UserData.PlaybackPositionTicks > 0) {
        player.addEventListener('loadedmetadata', function handler() {
            player.currentTime = item.UserData.PlaybackPositionTicks / 10000000;
            player.removeEventListener('loadedmetadata', handler);
        });
    }

    player.play().then(() => startProgressReporting()).catch(() => {
        const hlsUrl = `${embyConfig.url}/emby/videos/${item.Id}/master.m3u8?api_key=${embyConfig.token}`;
        if (Hls.isSupported()) {
            currentHls = new Hls();
            currentHls.loadSource(hlsUrl);
            currentHls.attachMedia(player);
            player.play();
            startProgressReporting();
        } else {
            player.src = hlsUrl;
            player.play();
            startProgressReporting();
        }
    });
}

function closePlayer() {
    stopProgressReporting();
    const overlay = document.getElementById('player-overlay');
    const player = document.getElementById('native-player');
    const osd = document.getElementById('player-osd');

    player.pause();
    if (currentHls) { currentHls.destroy(); currentHls = null; }
    player.src = "";
    osd.classList.remove('show');
    overlay.style.display = 'none';
    isPlayerActive = false;

    refreshSelectedItemData();
}

// ================= PLAYER PROGRESS =================
function updatePlaybackProgress() {
    const player = document.getElementById('native-player');
    if (!player || !player.duration) return;

    const percent = (player.currentTime / player.duration) * 100;
    document.getElementById('progress-bar-fill').style.width = `${percent}%`;
    document.getElementById('time-current').innerText = formatTime(player.currentTime);
    document.getElementById('time-total').innerText = formatTime(player.duration);
}

// ================= PROGRESS REPORTING =================
function startProgressReporting() {
    reportProgressToServer('Start');
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => reportProgressToServer('Progress'), 10000);
}

function stopProgressReporting() {
    if (progressInterval) clearInterval(progressInterval);
    reportProgressToServer('Stopped');
}

function reportProgressToServer(eventType) {
    if (!selectedItem || !isPlayerActive) return;
    const player = document.getElementById('native-player');
    if (!player || isNaN(player.currentTime)) return;

    const ticks = Math.round(player.currentTime * 10000000);
    const url = `${embyConfig.url}/emby/Sessions/Playing/${eventType}?api_key=${embyConfig.token}`;

    fetch(url, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-Emby-Token': embyConfig.token,
            'X-Emby-Client': 'NeoEmby WebApp',
            'X-Emby-Device-Name': 'Smart TV App',
            'X-Emby-Device-Id': deviceId,
            'X-Emby-Version': '1.0.0'
        },
        body: JSON.stringify({ 
            ItemId: selectedItem.Id, 
            PositionTicks: ticks,
            IsPaused: player.paused,
            IsAutomated: false,
            EventHint: eventType
        })
    }).catch(err => console.log("Progress Report Fehler:", err));
}

// ================= KEY HANDLING =================
window.addEventListener('keydown', function(e) {
    if (document.activeElement.tagName === 'INPUT') {
        if (e.key === 'Enter' || e.key === 'Escape') { 
            document.activeElement.blur(); 
            updateFocus(); 
            e.preventDefault(); 
        }
        return;
    }

    if (isPlayerActive) {
        handlePlayerKeys(e);
        return;
    }

    if (activeZone === 'detail') {
        handleDetailKeys(e);
        return;
    }

    const itemsPerRow = 6; 
    switch(e.key) {
        case 'ArrowUp':
            if (activeZone === 'sidebar' && sidebarIndex > 0) changeMenu(sidebarIndex - 1);
            else if (activeZone === 'grid' && gridIndex >= itemsPerRow) gridIndex -= itemsPerRow;
            else if (activeZone === 'settings' && settingsIndex > 0) settingsIndex--;
            break;
        case 'ArrowDown':
            if (activeZone === 'sidebar' && sidebarIndex < menuItems.length - 1) changeMenu(sidebarIndex + 1);
            else if (activeZone === 'grid' && gridIndex + itemsPerRow < currentItems.length) gridIndex += itemsPerRow;
            else if (activeZone === 'settings' && settingsIndex < 2) settingsIndex++;
            break;
        case 'ArrowRight':
            if (activeZone === 'sidebar') {
                if (menuItems[sidebarIndex] && menuItems[sidebarIndex].type === 'Settings') { 
                    activeZone = 'settings'; 
                    settingsIndex = 0; 
                } else if (currentItems.length > 0) {
                    activeZone = 'grid';
                }
            } else if (activeZone === 'grid' && gridIndex < currentItems.length - 1) {
                gridIndex++;
            }
            break;
        case 'ArrowLeft':
            if (activeZone === 'grid') { 
                if (gridIndex % itemsPerRow === 0) activeZone = 'sidebar'; 
                else gridIndex--; 
            } else if (activeZone === 'settings') {
                activeZone = 'sidebar';
                sidebarIndex = menuItems.findIndex(i => i.type === 'Settings');
                if(sidebarIndex === -1) sidebarIndex = 0;
            }
            break;
        case 'Enter':
            if (activeZone === 'settings') {
                if (settingsIndex === 0) document.getElementById('emby-url').focus();
                else if (settingsIndex === 1) document.getElementById('emby-token').focus();
                else if (settingsIndex === 2) connectToEmby();
            } else if (activeZone === 'sidebar') {
                if (menuItems[sidebarIndex] && menuItems[sidebarIndex].type === 'Settings') {
                    activeZone = 'settings';
                    settingsIndex = 0;
                } else if (currentItems.length > 0) {
                    activeZone = 'grid';
                }
            } else if (activeZone === 'grid') {
                showDetailView(currentItems[gridIndex]); 
            }
            break;
        case 'BackSpace':
        case 'Escape':
            if (activeZone === 'grid' || activeZone === 'settings') { 
                activeZone = 'sidebar'; 
                e.preventDefault(); 
            }
            break;
    }
    updateFocus();
});

function handleDetailKeys(e) {
    let visibleButtons = detailButtons.filter(id => document.getElementById(id).style.display !== 'none');
    
    switch(e.key) {
        case 'ArrowLeft':
            if (detailBtnIndex > 0) detailBtnIndex--;
            break;
        case 'ArrowRight':
            if (detailBtnIndex < visibleButtons.length - 1) detailBtnIndex++;
            break;
        case 'Enter':
            let actionId = visibleButtons[detailBtnIndex];
            if (actionId === 'btn-detail-play') playEmbyItem(selectedItem, true); 
            else if (actionId === 'btn-detail-restart') playEmbyItem(selectedItem, false); 
            else if (actionId === 'btn-detail-back') closeDetailView();
            break;
        case 'BackSpace':
        case 'Escape':
            closeDetailView();
            e.preventDefault();
            break;
    }
    updateFocus();
}

function handlePlayerKeys(e) {
    showOSD();
    const player = document.getElementById('native-player');

    if (playerFocusZone === 'buttons') {
        switch(e.key) {
            case 'ArrowLeft':
                if (playerBtnIndex > 0) playerBtnIndex--;
                break;
            case 'ArrowRight':
                if (playerBtnIndex < playerButtons.length - 1) playerBtnIndex++;
                break;
            case 'ArrowUp':
                playerFocusZone = 'timeline'; 
                break;
            case 'Enter':
                executePlayerAction();
                break;
        }
    } else if (playerFocusZone === 'timeline') {
        switch(e.key) {
            case 'ArrowDown':
                playerFocusZone = 'buttons'; 
                break;
            case 'ArrowLeft':
                player.currentTime = Math.max(0, player.currentTime - 30); 
                updatePlaybackProgress();
                break;
            case 'ArrowRight':
                player.currentTime = Math.min(player.duration, player.currentTime + 30); 
                updatePlaybackProgress();
                break;
        }
    }

    if (e.key === 'BackSpace' || e.key === 'Escape') {
        closePlayer();
        e.preventDefault();
    }
    
    updateFocus();
}

function executePlayerAction() {
    const player = document.getElementById('native-player');
    const playPauseIcon = document.querySelector('#btn-play-pause .material-symbols-sharp');

    if (playerBtnIndex === 0) {
        player.currentTime = Math.max(0, player.currentTime - 10);
    } else if (playerBtnIndex === 1) {
        if (player.paused) {
            player.play();
            playPauseIcon.innerText = 'pause';
        } else {
            player.pause();
            playPauseIcon.innerText = 'play_arrow';
        }
    } else if (playerBtnIndex === 2) {
        player.currentTime = Math.min(player.duration, player.currentTime + 30);
    }
    updatePlaybackProgress();
}

function showOSD() {
    const osd = document.getElementById('player-osd');
    osd.classList.add('show');
    clearTimeout(osdTimeout);
    osdTimeout = setTimeout(() => {
        if (isPlayerActive && activeZone === 'player' && !document.getElementById('native-player').paused) {
            osd.classList.remove('show');
        }
    }, 4000); 
}

// ================= FOCUS MANAGER =================
function updateFocus() {
    if (menuItems.length > 0) {
        menuItems.forEach(item => { if(item.element) item.element.classList.remove('focused'); });
    }
    const sBtn = document.getElementById('menu-item-settings');
    if(sBtn) sBtn.classList.remove('focused');

    document.querySelectorAll('.card').forEach(card => card.classList.remove('focused'));
    document.getElementById('emby-url').classList.remove('focused');
    document.getElementById('emby-token').classList.remove('focused');
    document.getElementById('save-btn').classList.remove('focused');
    
    playerButtons.forEach(id => document.getElementById(id).classList.remove('focused'));
    const progressContainer = document.getElementById('progress-container');
    if(progressContainer) progressContainer.classList.remove('focused');
    
    detailButtons.forEach(id => document.getElementById(id).classList.remove('focused'));

    if (activeZone === 'sidebar') {
        if(menuItems[sidebarIndex] && menuItems[sidebarIndex].element) {
            menuItems[sidebarIndex].element.classList.add('focused');
        } else if (sBtn && sidebarIndex === menuItems.length - 1) {
            sBtn.classList.add('focused');
        }
    } else if (activeZone === 'grid' && currentItems.length > 0) {
        const card = document.getElementById(`card-${gridIndex}`);
        if (card) {
            card.classList.add('focused');
            
            // DIESE ZEILE HINZUFÜGEN: Zwingt den Container, der fokussierten Karte zu folgen
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    } else if (activeZone === 'settings') {
        if (settingsIndex === 0) document.getElementById('emby-url').classList.add('focused');
        else if (settingsIndex === 1) document.getElementById('emby-token').classList.add('focused');
        else if (settingsIndex === 2) document.getElementById('save-btn').classList.add('focused');
    } else if (activeZone === 'detail') {
        let visible = detailButtons.filter(id => document.getElementById(id).style.display !== 'none');
        if (detailBtnIndex >= visible.length) detailBtnIndex = visible.length - 1;
        if (detailBtnIndex < 0) detailBtnIndex = 0;
        if (visible[detailBtnIndex]) {
            document.getElementById(visible[detailBtnIndex]).classList.add('focused');
        }
    } else if (activeZone === 'player') {
        if (playerFocusZone === 'buttons') {
            document.getElementById(playerButtons[playerBtnIndex]).classList.add('focused');
        } else if (playerFocusZone === 'timeline') {
            document.getElementById('progress-container').classList.add('focused');
        }
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00:00";
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}

document.getElementById('save-btn').addEventListener('click', connectToEmby);

window.onload = init;