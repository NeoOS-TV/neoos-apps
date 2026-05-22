const defaultIPTV = [
    { id: "DasErste.de", title: "Das Erste (ARD)", sub: "Live-Stream", url: "https://daserste-live.ard-mcdn.de/daserste/live/hls/de/master.m3u8", logo: "" },
    { id: "One.de", title: "ARD ONE", sub: "Live-Stream", url: "https://mcdn-one.ard.de/ardone/hls/master-1080p-5000.m3u8", logo: "" },
    { id: "ZDF.de", title: "ZDF", sub: "Live-Stream", url: "https://zdf-hls-15.akamaized.net/hls/live/2016498/de/high/master.m3u8", logo: "" },
    { id: "ZDFneo.de", title: "ZDF neo", sub: "Live-Stream", url: "https://zdf-hls-16.akamaized.net/hls/live/2016499/de/high/master.m3u8", logo: "" },
    { id: "Tagesschau24.de", title: "Tagesschau24", sub: "Nachrichten live", url: "https://tagesschau.akamaized.net/hls/live/2020115/tagesschau/tagesschau_1/master.m3u8", logo: "" },
    { id: "ZDFinfo.de", title: "ZDFinfo", sub: "Dokus & Reportagen", url: "https://zdf-hls-17.akamaized.net/hls/live/2016500/de/high/master.m3u8", logo: "" },
    { id: "3sat.de", title: "3sat", sub: "Kultur & Wissen", url: "https://zdf-hls-18.akamaized.net/hls/live/2016501/dach/high/master.m3u8", logo: "" },
    { id: "Arte.de", title: "Arte", sub: "Live-Stream", url: "https://artesimulcast.akamaized.net/hls/live/2030993/artelive_de/index.m3u8", logo: "" },
    { id: "BRFernsehenSud.de", title: "BR Fernsehen", sub: "Regionalprogramm", url: "https://mcdn.br.de/br/fs/bfs_sued/hls/de/master.m3u8", logo: "" },
    { id: "WDRFernsehen.de", title: "WDR", sub: "Regionalprogramm", url: "https://wdrfs247.akamaized.net/hls/live/681509/wdr_msl4_fs247/index.m3u8", logo: "" }
];

let storedCustom = localStorage.getItem('neoTV_custom_channels');
if (!storedCustom) {
    localStorage.setItem('neoTV_custom_channels', JSON.stringify([]));
    storedCustom = JSON.stringify([]);
}

const mediaData = {
    iptv: [],                         
    default: defaultIPTV,             
    custom: JSON.parse(storedCustom), 
    local: []                         
};

let currentMenu = 'iptv';
let ownChannels = [];
let currentEditChannelIndex = -1; 
let currentHls = null;
let controlsTimeout = null;
let epgUpdateInterval = null;
let xmlEpgCache = null;
let currentActiveChannel = null;

const menuItems = ['menu-iptv', 'menu-default', 'menu-custom', 'menu-local'];

async function init() {
    renderGrid();
    setupPlayerListeners();
    fetchIptvOrgList();
    fetchEPGCache(); 
}

// ================= DYNAMISCHER IPTV-ORG M3U PARSER =================
async function fetchIptvOrgList() {
    const grid = document.getElementById('grid');
    if(mediaData.iptv.length === 0 && currentMenu === 'iptv') {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">Lade deutsche Senderliste von iptv-org...</div>';
    }
    try {
        const response = await fetch('https://iptv-org.github.io/iptv/countries/de.m3u');
        const text = await response.text();
        const lines = text.split('\n');
        const parsedChannels = [];
        let currentChannel = null;

        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('#EXTINF:')) {
                currentChannel = {};
                const idMatch = line.match(/tvg-id="([^"]+)"/);
                currentChannel.id = idMatch ? idMatch[1] : "";
                const logoMatch = line.match(/tvg-logo="([^"]+)"/);
                currentChannel.logo = logoMatch ? logoMatch[1] : "";
                const commaIdx = line.lastIndexOf(',');
                currentChannel.title = commaIdx !== -1 ? line.substring(commaIdx + 1).trim() : "Unbekannter Sender";
                currentChannel.sub = "Deutsches Fernsehen";
            } else if (line && !line.startsWith('#') && currentChannel) {
                currentChannel.url = line;
                parsedChannels.push(currentChannel);
                currentChannel = null;
            }
        }
        mediaData.iptv = parsedChannels;
        fetchRealLogos(); 
        if (currentMenu === 'iptv') renderGrid();
    } catch (e) {
        if (currentMenu === 'iptv') {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#cc2929;">Fehler beim Laden der Onlineliste.</div>';
        }
    }
}

// ================= LOGO INJEKTION FÜR BASIS-LISTE =================
async function fetchRealLogos() {
    try {
        const response = await fetch('https://iptv-org.github.io/api/logos.json');
        const logoData = await response.json();
        const logoMap = {};
        logoData.forEach(item => { if (item.channel && item.url) logoMap[item.channel] = item.url; });
        
        mediaData.default.forEach(channel => { if (logoMap[channel.id] && !channel.logo) channel.logo = logoMap[channel.id]; });
        if (currentMenu === 'default') renderGrid();
    } catch (error) {}
}

// ================= INDEXOF EPG PARSER =================
async function fetchEPGCache() {
    try {
        const response = await fetch('https://iptv-org.github.io/epg/guides/de/guide.xml');
        xmlEpgCache = await response.text();
        if (currentActiveChannel) updateEPG(currentActiveChannel.id, currentActiveChannel.title);
    } catch (e) {}
}

function parseXMLDate(xmlStr) {
    if (!xmlStr || xmlStr.length < 14) return new Date();
    const y = xmlStr.substring(0,4), m = xmlStr.substring(4,6), d = xmlStr.substring(6,8);
    const H = xmlStr.substring(8,10), M = xmlStr.substring(10,12), S = xmlStr.substring(12,14);
    const offset = xmlStr.substring(15); const offH = offset.substring(0,3), offM = offset.substring(3,5);
    return new Date(`${y}-${m}-${d}T${H}:${M}:${S}${offH}:${offM}`);
}

function updateEPG(channelId, channelTitle) {
    const epgTitleEl = document.getElementById('epg-title');
    const epgMetaEl = document.getElementById('epg-meta');
    if (currentMenu === 'local' || !channelId) { epgTitleEl.innerText = channelTitle; epgMetaEl.innerText = "Wiedergabe"; return; }
    if (!xmlEpgCache) { epgTitleEl.innerText = "Lade Programm-Guide..."; epgMetaEl.innerText = channelTitle; return; }

    try {
        const now = new Date(); const searchStr = `channel="${channelId}"`; let idx = 0;
        while ((idx = xmlEpgCache.indexOf(searchStr, idx)) !== -1) {
            let startProg = xmlEpgCache.lastIndexOf("<programme ", idx); let endProg = xmlEpgCache.indexOf("</programme>", idx);
            if (startProg !== -1 && endProg !== -1) {
                let chunk = xmlEpgCache.substring(startProg, endProg + 12);
                let startMatch = chunk.match(/start="([^"]+)"/); let stopMatch = chunk.match(/stop="([^"]+)"/);
                if (startMatch && stopMatch) {
                    let startTime = parseXMLDate(startMatch[1]); let stopTime = parseXMLDate(stopMatch[2]);
                    if (now >= startTime && now <= stopTime) {
                        let titleMatch = chunk.match(/<title[^>]*>([\s\S]*?)<\/title>/);
                        let title = titleMatch ? titleMatch[1] : "Live Programm";
                        title = title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
                        const startStr = startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        const stopStr = stopTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        epgTitleEl.innerText = title; epgMetaEl.innerText = `${channelTitle} | ${startStr} - ${stopStr}`;
                        return;
                    }
                }
            }
            idx += searchStr.length;
        }
        epgTitleEl.innerText = "Keine Programminformationen"; epgMetaEl.innerText = channelTitle;
    } catch (e) { epgTitleEl.innerText = channelTitle; epgMetaEl.innerText = "Live Programm"; }
}

// ================= PLAYER CONTROLS =================
function setupPlayerListeners() {
    const player = document.getElementById('native-player');
    const slider = document.getElementById('timeline-slider');
    const txtCurrent = document.getElementById('time-current');
    const txtDuration = document.getElementById('time-duration');

    player.addEventListener('timeupdate', () => {
        if (!isNaN(player.duration) && player.duration > 0 && player.duration !== Infinity) {
            const pct = (player.currentTime / player.duration) * 100; slider.value = pct;
            txtCurrent.innerText = formatTime(player.currentTime); txtDuration.innerText = formatTime(player.duration);
        } else { slider.value = 0; txtCurrent.innerText = "Live"; txtDuration.innerText = "--:--:--"; }
    });
    player.addEventListener('play', () => document.getElementById('btn-play-pause').innerHTML = '<span class="material-symbols-sharp">pause</span>');
    player.addEventListener('pause', () => document.getElementById('btn-play-pause').innerHTML = '<span class="material-symbols-sharp">play_arrow</span>');
    document.addEventListener('fullscreenchange', handleFullscreenExit);
    document.addEventListener('webkitfullscreenchange', handleFullscreenExit);
    player.addEventListener('webkitendfullscreen', () => { closeOverlays(); });
}
function handleFullscreenExit() { if (!document.fullscreenElement && !document.webkitFullscreenElement) { document.getElementById('custom-controls').classList.add('controls-visible'); resetControlsTimeout(); } }
function formatTime(secs) { if (isNaN(secs)) return "00:00"; const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = Math.floor(secs % 60); if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`; return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`; }

function seekVideo(val) { const player = document.getElementById('native-player'); if (!isNaN(player.duration) && player.duration > 0 && player.duration !== Infinity) { player.currentTime = (val / 100) * player.duration; } }
function togglePlay() { const player = document.getElementById('native-player'); if (player.paused) player.play(); else player.pause(); resetControlsTimeout(); }
function toggleMute() { const player = document.getElementById('native-player'); player.muted = !player.muted; document.getElementById('btn-mute').innerHTML = `<span class="material-symbols-sharp">${player.muted ? 'volume_off' : 'volume_up'}</span>`; resetControlsTimeout(); }
async function togglePiP() { const player = document.getElementById('native-player'); try { if (document.pictureInPictureElement) await document.exitPictureInPicture(); else if (document.pictureInPictureEnabled || player.webkitSupportsPictureInPicture) { if (player.requestPictureInPicture) await player.requestPictureInPicture(); else if (player.webkitSetPresentationMode) player.webkitSetPresentationMode(player.webkitPresentationMode === "picture-in-picture" ? "inline" : "picture-in-picture"); } } catch (e) {} resetControlsTimeout(); }

function toggleControlsVisibility() { 
    const ctrl = document.getElementById('custom-controls'); 
    if (ctrl.classList.contains('controls-visible')) {
        ctrl.classList.remove('controls-visible');
        document.getElementById('cc-tracks-menu').style.display = 'none'; 
    } else { 
        ctrl.classList.add('controls-visible'); 
        resetControlsTimeout(); 
    } 
}
function resetControlsTimeout() { 
    clearTimeout(controlsTimeout); 
    document.getElementById('custom-controls').classList.add('controls-visible'); 
    controlsTimeout = setTimeout(() => { 
        document.getElementById('custom-controls').classList.remove('controls-visible'); 
        document.getElementById('cc-tracks-menu').style.display = 'none';
    }, 4000); 
}

// ================= CC / UNTERTITEL LOGIK =================
function toggleCCMenu(event) {
    if(event) event.stopPropagation();
    const menu = document.getElementById('cc-tracks-menu');
    if(menu.style.display === 'block') {
        menu.style.display = 'none';
    } else {
        buildCCMenu();
        menu.style.display = 'block';
        resetControlsTimeout();
    }
}

function buildCCMenu() {
    const menu = document.getElementById('cc-tracks-menu');
    menu.innerHTML = '<h4>Untertitel (CC)</h4>';
    
    if (currentHls) {
        const tracks = currentHls.subtitleTracks;
        const currentTrack = currentHls.subtitleTrack;
        
        const offOpt = document.createElement('div');
        offOpt.className = `cc-item ${currentTrack === -1 ? 'active' : ''}`;
        offOpt.innerText = 'Aus';
        offOpt.onclick = (e) => { e.stopPropagation(); currentHls.subtitleTrack = -1; buildCCMenu(); resetControlsTimeout(); };
        menu.appendChild(offOpt);

        tracks.forEach((track, index) => {
            const opt = document.createElement('div');
            opt.className = `cc-item ${currentTrack === index ? 'active' : ''}`;
            opt.innerText = track.name || `Spur ${index + 1}`;
            opt.onclick = (e) => { e.stopPropagation(); currentHls.subtitleTrack = index; buildCCMenu(); resetControlsTimeout(); };
            menu.appendChild(opt);
        });
    } 
    else {
        const player = document.getElementById('native-player');
        if(player.textTracks && player.textTracks.length > 0) {
            let anyActive = false;
            for(let i=0; i<player.textTracks.length; i++) {
                if(player.textTracks[i].mode === 'showing') anyActive = true;
            }

            const offOpt = document.createElement('div');
            offOpt.className = `cc-item ${!anyActive ? 'active' : ''}`;
            offOpt.innerText = 'Aus';
            offOpt.onclick = (e) => {
                e.stopPropagation();
                for(let i=0; i<player.textTracks.length; i++) player.textTracks[i].mode = 'disabled';
                buildCCMenu(); resetControlsTimeout();
            };
            menu.appendChild(offOpt);

            for(let i = 0; i < player.textTracks.length; i++) {
                const track = player.textTracks[i];
                const opt = document.createElement('div');
                opt.className = `cc-item ${track.mode === 'showing' ? 'active' : ''}`;
                opt.innerText = track.label || track.language || `Spur ${i+1}`;
                opt.onclick = (e) => {
                    e.stopPropagation();
                    for(let j=0; j<player.textTracks.length; j++) player.textTracks[j].mode = 'disabled';
                    track.mode = 'showing';
                    buildCCMenu(); resetControlsTimeout();
                };
                menu.appendChild(opt);
            }
        } else {
            menu.innerHTML += '<div class="cc-item" style="opacity:0.5;">Keine Untertitel verfügbar</div>';
        }
    }
}

// ================= LOCAL MEDIA ENGINE =================
function triggerFolderPicker() { document.getElementById('local-folder-picker').click(); }
function handleFolderSelected(event) {
    const files = event.target.files; mediaData.local = [];
    const allowed = ['.mp4', '.webm', '.mkv', '.mp3', '.ogg', '.wav'];
    for (let i = 0; i < files.length; i++) {
        const file = files[i]; const name = file.name.toLowerCase();
        if (allowed.some(ext => name.endsWith(ext))) {
            mediaData.local.push({ id: "localfile_" + i, title: file.name, sub: (file.size / (1024 * 1024)).toFixed(1) + " MB", fileObject: file, type: name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.ogg') ? 'audio' : 'video' });
        }
    }
    renderGrid();
}

// ================= MODALS & ACTIONS FOR CUSTOM TAB =================
function openAddModal() { document.getElementById('add-channel-modal').style.display = 'flex'; }
function openManageModal() { document.getElementById('manage-channels-modal').style.display = 'flex'; ownChannels = mediaData.custom.map((ch, idx) => ({...ch, originalIndex: idx})); renderManageList(); }

function closeAddModal() { document.getElementById('add-channel-modal').style.display = 'none'; document.getElementById('add-title').value = ""; document.getElementById('add-url').value = ""; document.getElementById('add-logo').value = ""; }
function addNewChannel() {
    const t = document.getElementById('add-title').value.trim(); const u = document.getElementById('add-url').value.trim(); let l = document.getElementById('add-logo').value.trim();
    if (!t || !u) return; let id = t.replace(/\s+/g, '') + ".de";
    if (!l) l = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/TV_icon.svg/512px-TV_icon.svg.png";
    mediaData.custom.push({ id, title: t, sub: "Eigener Stream", url: u, logo: l });
    localStorage.setItem('neoTV_custom_channels', JSON.stringify(mediaData.custom)); closeAddModal(); renderGrid();
}
function renderManageList() {
    const container = document.getElementById('own-channels-list'); container.innerHTML = '';
    document.getElementById('manage-modal-title').innerText = "Sender verwalten"; document.getElementById('manage-list-view').style.display = 'block'; document.getElementById('manage-edit-view').style.display = 'none';
    if (ownChannels.length === 0) { container.innerHTML = '<div style="padding:20px;text-align:center;color:#777;">Keine eigenen Sender vorhanden.</div>'; return; }
    ownChannels.forEach((ch) => {
        const item = document.createElement('div'); item.className = 'manage-list-item';
        item.innerHTML = `<span>${ch.title}</span><span class="manage-list-item-sub">Bearbeiten</span>`;
        item.onclick = () => {
            currentEditChannelIndex = ch.originalIndex; document.getElementById('manage-modal-title').innerText = `Bearbeiten`;
            document.getElementById('manage-list-view').style.display = 'none'; document.getElementById('manage-edit-view').style.display = 'block';
            document.getElementById('edit-title').value = mediaData.custom[ch.originalIndex].title; document.getElementById('edit-url').value = mediaData.custom[ch.originalIndex].url; document.getElementById('edit-logo').value = mediaData.custom[ch.originalIndex].logo;
        };
        container.appendChild(item);
    });
}
function backToManageList() { renderManageList(); }
function closeManageModal() { document.getElementById('manage-channels-modal').style.display = 'none'; }
function saveEditedChannel() {
    const t = document.getElementById('edit-title').value.trim(); const u = document.getElementById('edit-url').value.trim(); const l = document.getElementById('edit-logo').value.trim();
    if (!t || !u) return; mediaData.custom[currentEditChannelIndex].title = t; mediaData.custom[currentEditChannelIndex].url = u; mediaData.custom[currentEditChannelIndex].logo = l;
    localStorage.setItem('neoTV_custom_channels', JSON.stringify(mediaData.custom)); openManageModal(); renderGrid();
}
function deleteChannel() { if (confirm("Sender unwiderruflich löschen?")) { mediaData.custom.splice(currentEditChannelIndex, 1); localStorage.setItem('neoTV_custom_channels', JSON.stringify(mediaData.custom)); openManageModal(); renderGrid(); } }

// ================= RENDERING ENGINE =================
function renderGrid() {
    const grid = document.getElementById('grid'); grid.innerHTML = ''; const items = mediaData[currentMenu];
    
    if (currentMenu === 'custom' && items.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'empty-placeholder';
        placeholder.innerHTML = `
            <span class="material-symbols-sharp">auto_awesome</span>
            <h3>Deine eigene Senderliste</h3>
            <p>Hier ist aktuell noch alles frei! Nutze diesen Bereich, um deine ganz persönlichen .m3u8 Livestream-Links flexibel einzuspeisen.</p>
        `;
        grid.appendChild(placeholder);
    }

    items.forEach((item, index) => {
        const card = document.createElement('div'); card.className = 'card'; card.onclick = () => selectItem(index);
        if (currentMenu === 'local') {
            const icon = item.type === 'audio' ? 'audiotrack' : 'movie';
            card.innerHTML = `<div class="card-logo-container"><span class="material-symbols-sharp file-icon">${icon}</span></div><div class="card-title">${item.title}</div><div class="card-sub">${item.sub}</div>`;
        } else {
            const logoSrc = item.logo ? item.logo : "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/TV_icon.svg/512px-TV_icon.svg.png";
            card.innerHTML = `<div class="card-logo-container"><img src="${logoSrc}" alt="${item.title}" class="card-logo"></div><div class="card-title">${item.title}</div><div class="card-sub">${item.sub}</div>`;
        }
        grid.appendChild(card);
    });

    if (currentMenu === 'custom') {
        let a = document.createElement('div'); a.className = 'card add-card'; a.innerHTML = `<div class="card-logo-container"><span class="material-symbols-sharp">add_circle</span></div><div class="card-title">Hinzufügen</div>`; a.onclick = openAddModal; grid.appendChild(a);
        let m = document.createElement('div'); m.className = 'card manage-card'; m.innerHTML = `<div class="card-logo-container"><span class="material-symbols-sharp">settings</span></div><div class="card-title">Verwalten</div>`; m.onclick = openManageModal; grid.appendChild(m);
    } else if (currentMenu === 'local') {
        let f = document.createElement('div'); f.className = 'card folder-card'; f.innerHTML = `<div class="card-logo-container"><span class="material-symbols-sharp">create_new_folder</span></div><div class="card-title">Ordner wählen</div>`; f.onclick = triggerFolderPicker; grid.appendChild(f);
    }
    document.getElementById('area-title').innerText = { iptv: 'Live IPTV', default: 'Basis Sender', custom: 'Eigene Sender', local: 'Lokale Medien' }[currentMenu];
}

function changeMenu(index) {
    menuItems.forEach(id => document.getElementById(id).classList.remove('active'));
    currentMenu = ['iptv', 'default', 'custom', 'local'][index]; document.getElementById(menuItems[index]).classList.add('active'); renderGrid();
}

// ================= ITEM WÄHLEN & ERZWUNGENES AUTOPLAY =================
function selectItem(index) {
    const selected = mediaData[currentMenu][index]; if (!selected) return;
    const overlay = document.getElementById('player-overlay'); const player = document.getElementById('native-player');
    
    overlay.style.display = 'block'; 
    currentActiveChannel = { id: selected.id, title: selected.title };
    
    if (overlay.requestFullscreen) overlay.requestFullscreen(); else if (overlay.webkitRequestFullscreen) overlay.webkitRequestFullscreen();

    document.getElementById('cc-tracks-menu').style.display = 'none';

    updateEPG(selected.id, selected.title); clearInterval(epgUpdateInterval);
    epgUpdateInterval = setInterval(() => updateEPG(selected.id, selected.title), 60000);

    // BOMBENSICHERER AUTOPLAY BYPASS: 
    // Wir starten das Video als "Muted" (wird vom Browser IMMER erlaubt). 
    // Sobald es rollt, schalten wir die Stummschaltung sofort wieder aus.
    const forceAutoplay = () => {
        player.muted = true; // Stumm schalten für Browser-Erlaubnis
        
        // CC standardmäßig deaktivieren
        if (player.textTracks) {
            for (let i = 0; i < player.textTracks.length; i++) {
                player.textTracks[i].mode = 'disabled';
            }
        }

        player.play().then(() => {
            // Video läuft erfolgreich stumm an -> Ton sofort wieder aktivieren
            setTimeout(() => {
                player.muted = false;
                document.getElementById('btn-mute').innerHTML = '<span class="material-symbols-sharp">volume_up</span>';
            }, 150);
        }).catch((err) => {
            // Fallback für extreme Restriktionen: Versuche es erneut ohne Ton-Aktivierung
            player.play();
        });
    };

    if (currentMenu === 'local') { 
        player.src = URL.createObjectURL(selected.fileObject); 
        forceAutoplay();
    } 
    else {
        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            if(currentHls) currentHls.destroy();
            // subtitleTrack: -1 sorgt bei Hls.js dafür, dass Untertitel von Anfang an AUS sind
            currentHls = new Hls({ autoStartLoad: true, subtitleTrack: -1 });
            currentHls.loadSource(selected.url); currentHls.attachMedia(player);
            currentHls.on(Hls.Events.MANIFEST_PARSED, () => { forceAutoplay(); });
        } else if (player.canPlayType('application/vnd.apple.mpegurl')) { 
            player.src = selected.url; 
            forceAutoplay(); 
        }
    }
    resetControlsTimeout();
}

function toggleFullscreenToggle() {
    if (document.fullscreenElement || document.webkitFullscreenElement) { if (document.exitFullscreen) document.exitFullscreen(); else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); } 
    else { const overlay = document.getElementById('player-overlay'); if (overlay.requestFullscreen) overlay.requestFullscreen(); else if (overlay.webkitRequestFullscreen) overlay.webkitRequestFullscreen(); }
}
function closeOverlays(event) {
    if(event) event.stopPropagation(); const player = document.getElementById('native-player'); player.pause(); clearInterval(epgUpdateInterval); currentActiveChannel = null;
    document.getElementById('cc-tracks-menu').style.display = 'none';
    if (currentHls) { currentHls.destroy(); currentHls = null; }
    if (player.src.startsWith('blob:')) URL.revokeObjectURL(player.src); player.src = "";
    if (document.fullscreenElement || document.webkitFullscreenElement) { if (document.exitFullscreen) document.exitFullscreen(); else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); }
    document.getElementById('player-overlay').style.display = 'none';
}

window.onload = init;
