const defaultIPTV = [
    // --- Bereits vorhandene Basis-Sender ---
    { id: "DasErste.de", title: "Das Erste (ARD)", sub: "Live-Stream", url: "https://daserste-live.ard-mcdn.de/daserste/live/hls/de/master.m3u8", logo: "" },
    { id: "One.de", title: "ARD ONE", sub: "Live-Stream", url: "https://mcdn-one.ard.de/ardone/hls/master-1080p-5000.m3u8", logo: "" },
    { id: "ZDF.de", title: "ZDF", sub: "Live-Stream", url: "https://zdf-hls-15.akamaized.net/hls/live/2016498/de/high/master.m3u8", logo: "" },
    { id: "ZDFneo.de", title: "ZDF neo", sub: "Live-Stream", url: "https://zdf-hls-16.akamaized.net/hls/live/2016499/de/high/master.m3u8", logo: "" },
    { id: "Tagesschau24.de", title: "Tagesschau24", sub: "Nachrichten live", url: "https://tagesschau.akamaized.net/hls/live/2020115/tagesschau/tagesschau_1/master.m3u8", logo: "" },
    { id: "ZDFinfo.de", title: "ZDFinfo", sub: "Dokus & Reportagen", url: "https://zdf-hls-17.akamaized.net/hls/live/2016500/de/high/master.m3u8", logo: "" },
    { id: "3sat.de", title: "3sat", sub: "Kultur & Wissen", url: "https://zdf-hls-18.akamaized.net/hls/live/2016501/dach/high/master.m3u8", logo: "" },
    { id: "arte.fr", title: "arte", sub: "Live-Stream", url: "https://artesimulcast.akamaized.net/hls/live/2030993/artelive_de/index.m3u8", logo: "" },
    { id: "BRFernsehen.de", title: "BR Fernsehen", sub: "Regionalprogramm", url: "https://mcdn.br.de/br/fs/bfs_sued/hls/de/master.m3u8", logo: "" },
    { id: "WDRFernsehen.de", title: "WDR", sub: "Regionalprogramm", url: "https://wdrfs247.akamaized.net/hls/live/681509/wdr_msl4_fs247/index.m3u8", logo: "" },
    { id: "RadioBremenFernsehen.de", title: "Radio Bremen", sub: "Musikprogramm", url: "https://rbhlslive.akamaized.net/hls/live/2020435/rbfs/master.m3", logo: "" },
    { id: "WELT.de", title: "WELT HD", sub: "WELT", url: "https://w-live2weltcms.akamaized.net/hls/live/2041019/Welt-LivePGM/index.m3u8", logo: "" },
    { id: "N24Doku.de", title: "N24 Doku", sub: "Dokumentationen", url: "https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/60080e8a4bf36000076a81b1/master.m3u8", logo: "" },

    // --- Neu hinzugefügte offizielle Sender ---
    { id: "KiKA.de", title: "KiKA", sub: "Der Kinderkanal", url: "https://kika-live.ard-mcdn.de/kika/live/hls/de/master.m3u8", logo: "" },
    { id: "Nickelodeon.de", title: "Nickelodeon", sub: "Kinderkanal", url: "ttps://0d26a00dfbb1.airspace-cdn.cbsivideo.com/nick1999/master/nick1999.m3u8", logo: "" },
    { id: "phoenix.de", title: "Phoenix", sub: "Politik & Dokumentation", url: "https://zdf-hls-19.akamaized.net/hls/live/2016502/de/high/master.m3u8", logo: "" },
    { id: "ARDAlpha.de", title: "ARD Alpha", sub: "Bildung & Wissenschaft", url: "https://mcdn.br.de/br/fs/ard_alpha/hls/de/master.m3u8", logo: "" },
    { id: "BRFernsehen.de", title: "BR Fernsehen (Nord)", sub: "Bayerischer Rundfunk", url: "https://mcdn.br.de/br/fs/bfs_nord/hls/de/master.m3u8", logo: "" },
    { id: "hrFernsehen.de", title: "Hessischer Rundfunk", sub: "hr-fernsehen", url: "https://hrhlsde.akamaized.net/hls/live/2024526/hrhlsde/index.m3u8", logo: "" },
    { id: "MDRFernsehen.de", title: "MDR Sachsen", sub: "Mitteldeutscher Rundfunk", url: "https://mdrtvsahls.akamaized.net/hls/live/2016879/mdrtvsa/master.m3u8", logo: "" },
    { id: "NDRFernsehen.de", title: "NDR Niedersachsen", sub: "Norddeutscher Rundfunk", url: "https://mcdn.ndr.de/ndr/hls/ndr_fs/ndr_nds/master.m3u8", logo: "" },
    { id: "rbbFernsehen.de", title: "rbb Berlin", sub: "Rundfunk Berlin-Brandenburg", url: "https://rbb-hls-berlin.akamaized.net/hls/live/2017824/rbb_berlin/master.m3u8", logo: "" },
    { id: "SRFFernsehen.de", title: "SR Fernsehen", sub: "Saarländischer Rundfunk", url: "http://srlive24-lh.akamaihd.net/i/sr_universal02@107595/master.m3u8", logo: "" },
    { id: "SWRFernsehenBadenWurttemberg.de", title: "SWR Baden-Württemberg", sub: "Südwestrundfunk", url: "https://swrbwd-hls.akamaized.net/hls/live/2018672/swrbwd/master.m3u8", logo: "" },
    { id: "SWRFernsehenRheinlandPfalz.de", title: "SWR Rheinland-Pfalz", sub: "Südwestrundfunk", url: "https://mcdn.swr.de/swr/swrrpd/master.m3u8", logo: "" },
    { id: "KPJK604.us", title: "Deutsche Welle (DE)", sub: "Auslandsfernsehen", url: "https://dwamdstream111.akamaized.net/hls/live/2017972/dwstream111/stream05/streamPlaylist.m3u8", logo: "" },
    { id: "Bundestag.de", title: "Bundestag Kanal 1", sub: "Plenarsitzungen/Hauptprogramm", url: "https://c13014-l-hls.u.core.cdn.streamfarm.net/1000153copo/hk1.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Deutschlands_Flagge_und_Adler.png" },
    { id: "Bundesrat.de", title: "Bundestag Kanal 2", sub: "Ausschüsse/Sonderübertragungen", url: "https://c13014-l-hls.u.core.cdn.streamfarm.net/1000153copo/hk2.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Deutschlands_Flagge_und_Adler.png" }
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

// Navigations-Zustände (TV-Framework)
let currentMenu = 'iptv';
let activeZone = 'sidebar';
let sidebarIndex = 0;
let gridIndex = 0;
let isPlayerActive = false;
let isModalActive = false; 
let isManageActive = false;
let manageState = 'list'; 

// Verwalten-Listen-Indices
let ownChannels = [];
let manageListIndex = 0;
let currentEditChannelIndex = -1; 

// TV-Fokus Variablen für Modals
let modalFocusZone = 'inputs'; 
let modalInputIndex = 0;       
let modalButtonIndex = 0;      

// TV Player UI Fokushandler
let activePlayerControlIndex = 0; // 0: Play/Pause, 1: Mute, 2: CC
let ccMenuIndex = 0;
let isCCMenuOpen = false;

let currentHls = null;
let controlsTimeout = null;
let epgUpdateInterval = null;
let xmlEpgCache = null;
let currentActiveChannel = null;

const menuItems = [
    { id: 'iptv', element: document.getElementById('menu-iptv'), title: 'Online Liste' },
    { id: 'default', element: document.getElementById('menu-default'), title: 'Basis Sender' },
    { id: 'custom', element: document.getElementById('menu-custom'), title: 'Eigene Sender' },
    { id: 'local', element: document.getElementById('menu-local'), title: 'Lokale Medien' }
];

async function init() {
    renderGrid();
    updateFocus();
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
        updateFocus();
    } catch (e) {
        if (currentMenu === 'iptv') {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#cc2929;">Fehler beim Laden der Onlineliste.</div>';
        }
    }
}

async function fetchRealLogos() {
    try {
        const response = await fetch('https://iptv-org.github.io/api/logos.json');
        const logoData = await response.json();
        const logoMap = {};
        logoData.forEach(item => { if (item.channel && item.url) logoMap[item.channel] = item.url; });
        
        mediaData.default.forEach(channel => { if (logoMap[channel.id] && !channel.logo) channel.logo = logoMap[channel.id]; });
        if (currentMenu === 'default') renderGrid();
        updateFocus();
    } catch (error) {}
}

// ================= XMLTV EPG PARSER ENGINE =================
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

// ================= TV CONTROLS LOGIK ENGINE =================
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
}

function formatTime(secs) { if (isNaN(secs)) return "00:00"; const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = Math.floor(secs % 60); if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`; return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`; }
function seekVideo(val) { const player = document.getElementById('native-player'); if (!isNaN(player.duration) && player.duration > 0 && player.duration !== Infinity) { player.currentTime = (val / 100) * player.duration; } }
function togglePlay() { const player = document.getElementById('native-player'); if (player.paused) player.play(); else player.pause(); resetControlsTimeout(); }
function toggleMute() { const player = document.getElementById('native-player'); player.muted = !player.muted; document.getElementById('btn-mute').innerHTML = `<span class="material-symbols-sharp">${player.muted ? 'volume_off' : 'volume_up'}</span>`; resetControlsTimeout(); }

function toggleControlsVisibility() { 
    const ctrl = document.getElementById('custom-controls'); 
    if (ctrl.classList.contains('controls-visible')) {
        ctrl.classList.remove('controls-visible');
        document.getElementById('cc-tracks-menu').style.display = 'none'; 
        isCCMenuOpen = false;
    } else { 
        ctrl.classList.add('controls-visible'); 
        resetControlsTimeout(); 
    } 
}

function resetControlsTimeout() { 
    clearTimeout(controlsTimeout); 
    document.getElementById('custom-controls').classList.add('controls-visible'); 
    updatePlayerUIRowFocus();
    controlsTimeout = setTimeout(() => { 
        if(!isCCMenuOpen && isPlayerActive) {
            document.getElementById('custom-controls').classList.remove('controls-visible'); 
        }
    }, 5000); 
}

function updatePlayerUIRowFocus() {
    const btns = document.querySelectorAll('.player-focusable');
    btns.forEach((btn, idx) => {
        if (!isCCMenuOpen && activePlayerControlIndex === idx) {
            btn.classList.add('focused');
        } else {
            btn.classList.remove('focused');
        }
    });

    const ccItems = document.querySelectorAll('.cc-item');
    ccItems.forEach((item, idx) => {
        if (isCCMenuOpen && ccMenuIndex === idx) {
            item.classList.add('focused');
        } else {
            item.classList.remove('focused');
        }
    });
}

// ================= CC UNTERTITEL LOGIK (HLS BYPASS) =================
function toggleCCMenu(event) {
    if(event) event.stopPropagation();
    const menu = document.getElementById('cc-tracks-menu');
    if(menu.style.display === 'block') {
        menu.style.display = 'none';
        isCCMenuOpen = false;
        activePlayerControlIndex = 2;
    } else {
        buildCCMenu();
        menu.style.display = 'block';
        isCCMenuOpen = true;
        ccMenuIndex = 0;
    }
    updatePlayerUIRowFocus();
}

function buildCCMenu() {
    const menu = document.getElementById('cc-tracks-menu');
    menu.innerHTML = '<h4>Untertitel (CC)</h4>';
    
    if (currentHls && currentHls.subtitleTracks.length > 0) {
        const tracks = currentHls.subtitleTracks;
        const currentTrack = currentHls.subtitleTrack;
        
        const offOpt = document.createElement('div');
        offOpt.className = `cc-item ${currentTrack === -1 ? 'active' : ''}`;
        offOpt.innerText = 'Aus';
        menu.appendChild(offOpt);

        tracks.forEach((track, index) => {
            const opt = document.createElement('div');
            opt.className = `cc-item ${currentTrack === index ? 'active' : ''}`;
            opt.innerText = track.name || `Spur ${index + 1}`;
            menu.appendChild(opt);
        });
    } 
    else {
        const player = document.getElementById('native-player');
        if(player.textTracks && player.textTracks.length > 0) {
            let anyActive = false;
            for(let i=0; i<player.textTracks.length; i++) { if(player.textTracks[i].mode === 'showing') anyActive = true; }

            const offOpt = document.createElement('div');
            offOpt.className = `cc-item ${!anyActive ? 'active' : ''}`;
            offOpt.innerText = 'Aus';
            menu.appendChild(offOpt);

            for(let i = 0; i < player.textTracks.length; i++) {
                const track = player.textTracks[i];
                const opt = document.createElement('div');
                opt.className = `cc-item ${track.mode === 'showing' ? 'active' : ''}`;
                opt.innerText = track.label || track.language || `Spur ${i+1}`;
                menu.appendChild(opt);
            }
        } else {
            menu.innerHTML += '<div class="cc-item active" style="opacity:0.5;">Keine Untertitel verfügbar</div>';
        }
    }
}

function triggerCCSelection() {
    const player = document.getElementById('native-player');
    if (currentHls && currentHls.subtitleTracks.length > 0) {
        if(ccMenuIndex === 0) { currentHls.subtitleTrack = -1; }
        else { currentHls.subtitleTrack = ccMenuIndex - 1; }
    } else if(player.textTracks && player.textTracks.length > 0) {
        for(let i=0; i<player.textTracks.length; i++) player.textTracks[i].mode = 'disabled';
        if(ccMenuIndex > 0) {
            player.textTracks[ccMenuIndex - 1].mode = 'showing';
        }
    }
    buildCCMenu();
    updatePlayerUIRowFocus();
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
    gridIndex = 0; renderGrid(); updateFocus();
}

// ================= TV MODAL UI WORKER CONTROLS =================
function updateModalFormFocus(containerId) {
    const container = document.getElementById(containerId);
    const inputs = container.querySelectorAll('.input-row input');
    inputs.forEach((input, idx) => {
        if (modalFocusZone === 'inputs' && idx === modalInputIndex) input.classList.add('input-focused');
        else input.classList.remove('input-focused');
    });
    const currentButtons = Array.from(container.querySelectorAll('.modal-focusable')).filter(b => b.offsetParent !== null);
    currentButtons.forEach((btn, idx) => {
        if (modalFocusZone === 'buttons' && idx === modalButtonIndex) btn.classList.add('button-focused');
        else btn.classList.remove('button-focused');
    });
}
function triggerVirtualKeyboard(inputElement) {
    let newVal = prompt("Wert eingeben / bearbeiten:", inputElement.value);
    if (newVal !== null) inputElement.value = newVal;
}

function openAddModal() { document.getElementById('add-channel-modal').style.display = 'flex'; isModalActive = true; modalFocusZone = 'inputs'; modalInputIndex = 0; modalButtonIndex = 0; updateModalFormFocus('add-channel-modal'); }
function closeAddModal() { document.getElementById('add-channel-modal').style.display = 'none'; isModalActive = false; document.getElementById('add-title').value = ""; document.getElementById('add-url').value = ""; document.getElementById('add-logo').value = ""; updateFocus(); }
function addNewChannel() {
    const t = document.getElementById('add-title').value.trim(); const u = document.getElementById('add-url').value.trim(); let l = document.getElementById('add-logo').value.trim();
    if (!t || !u) return; let id = t.replace(/\s+/g, '') + ".de";
    if (!l) l = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/TV_icon.svg/512px-TV_icon.svg.png";
    mediaData.custom.push({ id, title: t, sub: "Eigener Stream", url: u, logo: l });
    localStorage.setItem('neoTV_custom_channels', JSON.stringify(mediaData.custom)); closeAddModal(); renderGrid();
}

function openManageModal() { document.getElementById('manage-channels-modal').style.display = 'flex'; isManageActive = true; manageState = 'list'; manageListIndex = 0; modalFocusZone = 'inputs'; ownChannels = mediaData.custom.map((ch, idx) => ({...ch, originalIndex: idx})); renderManageList(); }
function renderManageList() {
    const listContainer = document.getElementById('own-channels-list'); listContainer.innerHTML = '';
    document.getElementById('manage-modal-title').innerText = "Eigene Sender verwalten"; document.getElementById('manage-list-view').style.display = 'block'; document.getElementById('manage-edit-view').style.display = 'none';
    if (ownChannels.length === 0) { listContainer.innerHTML = '<div style="padding: 30px; text-align: center; color: #777;">Keine eigenen Sender vorhanden.</div>'; modalFocusZone = 'buttons'; modalButtonIndex = 0; }
    ownChannels.forEach((channel, idx) => {
        const item = document.createElement('div'); item.className = `manage-list-item ${(modalFocusZone === 'inputs' && idx === manageListIndex) ? 'selected-item' : ''}`;
        item.innerHTML = `<span>${channel.title}</span><span class="manage-list-item-sub">Bearbeiten</span>`; listContainer.appendChild(item);
    });
    updateModalFormFocus('manage-channels-modal');
}
function updateManageListFocus() {
    const items = document.querySelectorAll('.manage-list-item');
    items.forEach((item, idx) => {
        if (modalFocusZone === 'inputs' && idx === manageListIndex) { item.classList.add('selected-item'); item.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
        else { item.classList.remove('selected-item'); }
    });
}
function selectManageItem() {
    if (ownChannels.length === 0) return; const selected = ownChannels[manageListIndex]; currentEditChannelIndex = selected.originalIndex;
    manageState = 'edit'; modalFocusZone = 'inputs'; modalInputIndex = 0; modalButtonIndex = 0;
    document.getElementById('manage-modal-title').innerText = `Bearbeiten`; document.getElementById('manage-list-view').style.display = 'none'; document.getElementById('manage-edit-view').style.display = 'block';
    document.getElementById('edit-title').value = selected.title; document.getElementById('edit-url').value = selected.url; document.getElementById('edit-logo').value = selected.logo;
    updateModalFormFocus('manage-channels-modal');
}
function backToManageList() { manageState = 'list'; modalFocusZone = 'inputs'; renderManageList(); }
function closeManageModal() { document.getElementById('manage-channels-modal').style.display = 'none'; isManageActive = false; updateFocus(); }
function saveEditedChannel() {
    const t = document.getElementById('edit-title').value.trim(); const u = document.getElementById('edit-url').value.trim(); const l = document.getElementById('edit-logo').value.trim(); if (!t || !u) return;
    mediaData.custom[currentEditChannelIndex].title = t; mediaData.custom[currentEditChannelIndex].url = u; mediaData.custom[currentEditChannelIndex].logo = l;
    localStorage.setItem('neoTV_custom_channels', JSON.stringify(mediaData.custom)); ownChannels = mediaData.custom.map((ch, idx) => ({...ch, originalIndex: idx})); backToManageList(); renderGrid();
}
function deleteChannel() {
    if (confirm("Diesen Sender wirklich löschen?")) {
        mediaData.custom.splice(currentEditChannelIndex, 1); localStorage.setItem('neoTV_custom_channels', JSON.stringify(mediaData.custom));
        ownChannels = mediaData.custom.map((ch, idx) => ({...ch, originalIndex: idx})); if (manageListIndex >= ownChannels.length && manageListIndex > 0) manageListIndex--;
        backToManageList(); renderGrid();
    }
}

// ================= TV GRID RENDERING LOGIK =================
function renderGrid() {
    const grid = document.getElementById('grid'); grid.innerHTML = ''; const items = mediaData[currentMenu];

    items.forEach((item, index) => {
        const card = document.createElement('div'); card.className = 'card'; card.id = `card-${index}`;
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
        const addCard = document.createElement('div'); addCard.className = 'card add-card'; addCard.id = `card-${items.length}`;
        addCard.innerHTML = `<div class="card-logo-container"><span class="material-symbols-sharp">add_circle</span></div><div class="card-title">Hinzufügen</div><div class="card-sub">Link einbinden</div>`;
        grid.appendChild(addCard);

        const manageCard = document.createElement('div'); manageCard.className = 'card manage-card'; manageCard.id = `card-${items.length + 1}`;
        manageCard.innerHTML = `<div class="card-logo-container"><span class="material-symbols-sharp">settings</span></div><div class="card-title">Verwalten</div><div class="card-sub">Liste bearbeiten</div>`;
        grid.appendChild(manageCard);
    } 
    else if (currentMenu === 'local') {
        const folderCard = document.createElement('div'); folderCard.className = 'card folder-card'; folderCard.id = `card-${items.length}`;
        folderCard.innerHTML = `<div class="card-logo-container"><span class="material-symbols-sharp">create_new_folder</span></div><div class="card-title">Ordner wählen</div><div class="card-sub">Verzeichnis laden</div>`;
        grid.appendChild(folderCard);
    }
    document.getElementById('area-title').innerText = { iptv: 'Online Liste', default: 'Basis Sender', custom: 'Eigene Sender', local: 'Lokale Medien' }[currentMenu];
}

function getMaxGridItems() {
    let len = mediaData[currentMenu].length;
    if (currentMenu === 'custom') len += 2; if (currentMenu === 'local') len += 1;
    return len;
}

function updateFocus() {
    menuItems.forEach(item => item.element.classList.remove('focused'));
    document.querySelectorAll('.card').forEach(card => card.classList.remove('focused'));
    if (activeZone === 'sidebar') { menuItems[sidebarIndex].element.classList.add('focused'); } 
    else if (activeZone === 'grid') {
        const activeCard = document.getElementById(`card-${gridIndex}`);
        if (activeCard) { activeCard.classList.add('focused'); activeCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    }
}

function changeMenu(index) {
    menuItems.forEach(item => item.element.classList.remove('active'));
    sidebarIndex = index; currentMenu = menuItems[sidebarIndex].id;
    menuItems[sidebarIndex].element.classList.add('active');
    gridIndex = 0; renderGrid();
}

// ================= FERNBEDIENUNGS MATRIX (CORE NAVIGATOR) =================
window.addEventListener('keydown', function(e) {
    // 1. Logik im Player-Overlay (Echtes TV OSD-Parsing)
    if (isPlayerActive) {
        resetControlsTimeout();
        const ccItems = document.querySelectorAll('.cc-item');
        
        if (e.key === 'Escape' || e.key === 'BackSpace' || e.keyCode === 461) {
            if (isCCMenuOpen) { toggleCCMenu(); } else { closeOverlays(); }
            e.preventDefault(); return;
        }

        if (!isCCMenuOpen) {
            // Horizontale Navigation auf der Player-Leiste
            if (e.key === 'ArrowRight' && activePlayerControlIndex < 2) { activePlayerControlIndex++; }
            if (e.key === 'ArrowLeft' && activePlayerControlIndex > 0) { activePlayerControlIndex--; }
            if (e.key === 'Enter') {
                const btns = document.querySelectorAll('.player-focusable');
                btns[activePlayerControlIndex].click();
            }
        } else {
            // Vertikale Track-Navigation im Untertitel-Menü
            if (e.key === 'ArrowDown' && ccMenuIndex < ccItems.length - 1) { ccMenuIndex++; }
            if (e.key === 'ArrowUp' && ccMenuIndex > 0) { ccMenuIndex--; }
            if (e.key === 'Enter') { triggerCCSelection(); }
        }
        updatePlayerUIRowFocus();
        return;
    }

    // 2. Logik in Modalen Verwalten-Masken
    if (isManageActive) {
        const container = document.getElementById('manage-channels-modal');
        const currentButtons = Array.from(container.querySelectorAll('.modal-focusable')).filter(b => b.offsetParent !== null);
        const currentInputs = container.querySelectorAll('.input-row input');

        if (e.key === 'Escape' || e.key === 'BackSpace' || e.keyCode === 461) {
            if (manageState === 'edit') backToManageList(); else closeManageModal();
            e.preventDefault(); return;
        }
        if (manageState === 'list') {
            if (modalFocusZone === 'inputs') {
                if (e.key === 'ArrowUp' && manageListIndex > 0) { manageListIndex--; updateManageListFocus(); }
                if (e.key === 'ArrowDown') {
                    if (manageListIndex < ownChannels.length - 1) { manageListIndex++; updateManageListFocus(); }
                    else { modalFocusZone = 'buttons'; modalButtonIndex = 0; updateManageListFocus(); updateModalFormFocus('manage-channels-modal'); }
                }
                if (e.key === 'Enter') selectManageItem();
            } else if (modalFocusZone === 'buttons') {
                if (e.key === 'ArrowUp' && ownChannels.length > 0) { modalFocusZone = 'inputs'; updateManageListFocus(); updateModalFormFocus('manage-channels-modal'); }
                if (e.key === 'Enter') currentButtons[modalButtonIndex].click();
            }
        } else if (manageState === 'edit') {
            if (modalFocusZone === 'inputs') {
                if (e.key === 'ArrowUp' && modalInputIndex > 0) modalInputIndex--;
                else if (e.key === 'ArrowDown') { if (modalInputIndex < currentInputs.length - 1) modalInputIndex++; else { modalFocusZone = 'buttons'; modalButtonIndex = 0; } }
                if (e.key === 'Enter') triggerVirtualKeyboard(currentInputs[modalInputIndex]);
            } else if (modalFocusZone === 'buttons') {
                if (e.key === 'ArrowUp') { modalFocusZone = 'inputs'; modalInputIndex = currentInputs.length - 1; }
                if (e.key === 'ArrowLeft' && modalButtonIndex > 0) modalButtonIndex--;
                if (e.key === 'ArrowRight' && modalButtonIndex < currentButtons.length - 1) modalButtonIndex++;
                if (e.key === 'Enter') currentButtons[modalButtonIndex].click();
            }
            updateModalFormFocus('manage-channels-modal');
        }
        return;
    }

    // 3. Logik im Hinzufügen-Modal
    if (isModalActive) {
        const container = document.getElementById('add-channel-modal');
        const addButtons = Array.from(container.querySelectorAll('.modal-focusable'));
        const addInputs = container.querySelectorAll('.input-row input');
        if (e.key === 'Escape' || e.key === 'BackSpace' || e.keyCode === 461) { closeAddModal(); e.preventDefault(); return; }
        if (modalFocusZone === 'inputs') {
            if (e.key === 'ArrowUp' && modalInputIndex > 0) modalInputIndex--;
            if (e.key === 'ArrowDown') { if (modalInputIndex < addInputs.length - 1) modalInputIndex++; else { modalFocusZone = 'buttons'; modalButtonIndex = 0; } }
            if (e.key === 'Enter') triggerVirtualKeyboard(addInputs[modalInputIndex]);
        } else if (modalFocusZone === 'buttons') {
            if (e.key === 'ArrowUp') { modalFocusZone = 'inputs'; modalInputIndex = addInputs.length - 1; }
            if (e.key === 'ArrowLeft' && modalButtonIndex > 0) modalButtonIndex--;
            if (e.key === 'ArrowRight' && modalButtonIndex < addButtons.length - 1) modalButtonIndex++;
            if (e.key === 'Enter') addButtons[modalButtonIndex].click();
        }
        updateModalFormFocus('add-channel-modal');
        return; 
    }

    // 4. Standard Dashboard Grid Navigation Matrix
    const maxItems = getMaxGridItems();
    switch(e.key) {
        case 'ArrowUp':
            if (activeZone === 'sidebar' && sidebarIndex > 0) { sidebarIndex--; changeMenu(sidebarIndex); }
            else if (activeZone === 'grid' && gridIndex >= 2) { gridIndex -= 2; }
            break;
        case 'ArrowDown':
            if (activeZone === 'sidebar' && sidebarIndex < menuItems.length - 1) { sidebarIndex++; changeMenu(sidebarIndex); }
            else if (activeZone === 'grid') {
                if (gridIndex + 2 < maxItems) gridIndex += 2;
                else if (gridIndex % 2 === 0 && gridIndex + 1 < maxItems) gridIndex = maxItems - 1;
            }
            break;
        case 'ArrowRight':
            if (activeZone === 'sidebar' && maxItems > 0) { activeZone = 'grid'; gridIndex = 0; }
            else if (activeZone === 'grid' && gridIndex < maxItems - 1) gridIndex++;
            break;
        case 'ArrowLeft':
            if (activeZone === 'grid') { if (gridIndex > 0) gridIndex--; else if (gridIndex === 0) activeZone = 'sidebar'; }
            break;
        case 'Enter':
            if (activeZone === 'grid') selectItem();
            break;
    }
    updateFocus();
});

// ================= ITEM SELECT ENGINE =================
function selectItem() {
    if (currentMenu === 'custom' && gridIndex === mediaData.custom.length) { openAddModal(); return; }
    if (currentMenu === 'custom' && gridIndex === mediaData.custom.length + 1) { openManageModal(); return; }
    if (currentMenu === 'local' && gridIndex === mediaData.local.length) { triggerFolderPicker(); return; }

    const selected = mediaData[currentMenu][gridIndex]; if (!selected) return;
    
    const overlay = document.getElementById('player-overlay'); const player = document.getElementById('native-player');
    overlay.style.display = 'block'; isPlayerActive = true;
    activePlayerControlIndex = 0; isCCMenuOpen = false;
    currentActiveChannel = { id: selected.id, title: selected.title };

    document.getElementById('cc-tracks-menu').style.display = 'none';
    updateEPG(selected.id, selected.title); clearInterval(epgUpdateInterval);
    epgUpdateInterval = setInterval(() => updateEPG(selected.id, selected.title), 60000);

    // Radikale Deaktivierung von CC Spuren vor Wiedergabebeginn
    const disableCCSpuren = () => {
        if (player.textTracks) {
            for (let i = 0; i < player.textTracks.length; i++) player.textTracks[i].mode = 'disabled';
        }
    };
    player.onplaying = disableCCSpuren;

    if (currentMenu === 'local') { 
        player.src = URL.createObjectURL(selected.fileObject); 
        disableCCSpuren(); player.play();
    } 
    else {
        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            if(currentHls) currentHls.destroy();
            currentHls = new Hls({ 
                autoStartLoad: true, 
                subtitleTrack: -1, 
                renderTextTracksNatively: false 
            });
            currentHls.loadSource(selected.url); currentHls.attachMedia(player);
            currentHls.on(Hls.Events.MANIFEST_PARSED, () => { 
                currentHls.subtitleTrack = -1; 
                disableCCSpuren(); player.play(); 
            });
        } else if (player.canPlayType('application/vnd.apple.mpegurl')) { 
            player.src = selected.url; 
            disableCCSpuren(); player.play(); 
        }
    }
    resetControlsTimeout();
    updatePlayerUIRowFocus();
}

function closeOverlays() {
    const player = document.getElementById('native-player'); player.pause(); clearInterval(epgUpdateInterval); currentActiveChannel = null;
    document.getElementById('cc-tracks-menu').style.display = 'none'; isCCMenuOpen = false;
    if (currentHls) { currentHls.destroy(); currentHls = null; }
    if (player.src.startsWith('blob:')) URL.revokeObjectURL(player.src); player.src = "";
    document.getElementById('player-overlay').style.display = 'none'; isPlayerActive = false; updateFocus();
}

window.onload = init;
