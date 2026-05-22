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

let storedIPTV = localStorage.getItem('neoTV_channels');
if (!storedIPTV) {
    localStorage.setItem('neoTV_channels', JSON.stringify(defaultIPTV));
    storedIPTV = JSON.stringify(defaultIPTV);
}

const mediaData = {
    iptv: JSON.parse(storedIPTV),
    mediathek: [
        { id: "ARDMediathek.de", title: "ARD Mediathek", sub: "tv.ardmediathek.de", url: "https://tv.ardmediathek.de", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/ARD_Mediathek_Logo_2019.svg/512px-ARD_Mediathek_Logo_2019.svg.png" }
    ],
    local: []
};

let currentMenu = 'iptv';
let ownChannels = [];
let currentEditChannelIndex = -1; 
let currentHls = null;

const menuItems = ['menu-iptv', 'menu-mediathek', 'menu-local'];

async function init() {
    renderGrid();
    await fetchRealLogos();
}

async function fetchRealLogos() {
    try {
        const response = await fetch('https://iptv-org.github.io/api/logos.json');
        const logoData = await response.json();
        const logoMap = {};
        logoData.forEach(item => {
            if (item.channel && item.url) logoMap[item.channel] = item.url;
        });
        mediaData.iptv.forEach(channel => {
            if (logoMap[channel.id] && !channel.logo) {
                channel.logo = logoMap[channel.id];
            }
        });
        renderGrid();
    } catch (error) {
        console.error("Fehler beim Laden der API-Logos:", error);
    }
}

function triggerFolderPicker() {
    document.getElementById('local-folder-picker').click();
}

function handleFolderSelected(event) {
    const files = event.target.files;
    mediaData.local = [];
    const allowedExtensions = ['.mp4', '.webm', '.mkv', '.mp3', '.ogg', '.wav'];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileNameLower = file.name.toLowerCase();
        const matchesType = allowedExtensions.some(ext => fileNameLower.endsWith(ext));

        if (matchesType) {
            mediaData.local.push({
                id: "localfile_" + i,
                title: file.name,
                sub: (file.size / (1024 * 1024)).toFixed(1) + " MB",
                fileObject: file,
                type: fileNameLower.endsWith('.mp3') || fileNameLower.endsWith('.wav') || fileNameLower.endsWith('.ogg') ? 'audio' : 'video'
            });
        }
    }
    renderGrid();
}

// ================= MODALS =================
function openAddModal() {
    document.getElementById('add-channel-modal').style.display = 'flex';
}

function closeAddModal() {
    document.getElementById('add-channel-modal').style.display = 'none';
    document.getElementById('add-title').value = "";
    document.getElementById('add-url').value = "";
    document.getElementById('add-logo').value = "";
}

function addNewChannel() {
    const titleInput = document.getElementById('add-title').value.trim();
    const urlInput = document.getElementById('add-url').value.trim();
    let logoInput = document.getElementById('add-logo').value.trim();

    if (!titleInput || !urlInput) {
        alert("Bitte Name und Stream-URL ausfüllen!");
        return;
    }

    let channelId = titleInput.replace(/\s+/g, '') + ".de";
    if (!logoInput) logoInput = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/TV_icon.svg/512px-TV_icon.svg.png";

    mediaData.iptv.push({ id: channelId, title: titleInput, sub: "Benutzerdefiniert", url: urlInput, logo: logoInput });
    localStorage.setItem('neoTV_channels', JSON.stringify(mediaData.iptv));
    closeAddModal();
    renderGrid();
    fetchRealLogos();
}

function openManageModal() {
    document.getElementById('manage-channels-modal').style.display = 'flex';
    ownChannels = mediaData.iptv.map((ch, idx) => ({...ch, originalIndex: idx})).slice(10);
    renderManageList();
}

function renderManageList() {
    const listContainer = document.getElementById('own-channels-list');
    listContainer.innerHTML = '';
    document.getElementById('manage-modal-title').innerText = "Eigene Sender verwalten";
    document.getElementById('manage-list-view').style.display = 'block';
    document.getElementById('manage-edit-view').style.display = 'none';

    if (ownChannels.length === 0) {
        listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #777;">Keine eigenen Sender vorhanden.</div>';
        return;
    }

    ownChannels.forEach((channel) => {
        const item = document.createElement('div');
        item.className = 'manage-list-item';
        item.innerHTML = `<span>${channel.title}</span><span class="manage-list-item-sub">Bearbeiten</span>`;
        item.onclick = () => selectManageItem(channel.originalIndex);
        listContainer.appendChild(item);
    });
}

function selectManageItem(originalIdx) {
    currentEditChannelIndex = originalIdx;
    const selected = mediaData.iptv[originalIdx];

    document.getElementById('manage-modal-title').innerText = `Bearbeiten`;
    document.getElementById('manage-list-view').style.display = 'none';
    document.getElementById('manage-edit-view').style.display = 'block';

    document.getElementById('edit-title').value = selected.title;
    document.getElementById('edit-url').value = selected.url;
    document.getElementById('edit-logo').value = selected.logo;
}

function backToManageList() {
    renderManageList();
}

function closeManageModal() {
    document.getElementById('manage-channels-modal').style.display = 'none';
}

function saveEditedChannel() {
    const t = document.getElementById('edit-title').value.trim();
    const u = document.getElementById('edit-url').value.trim();
    const l = document.getElementById('edit-logo').value.trim();

    if (!t || !u) { alert("Name und URL dürfen nicht leer sein!"); return; }

    mediaData.iptv[currentEditChannelIndex].title = t;
    mediaData.iptv[currentEditChannelIndex].url = u;
    mediaData.iptv[currentEditChannelIndex].logo = l;
    localStorage.setItem('neoTV_channels', JSON.stringify(mediaData.iptv));
    ownChannels = mediaData.iptv.map((ch, idx) => ({...ch, originalIndex: idx})).slice(10);
    backToManageList();
    renderGrid();
}

function deleteChannel() {
    if (confirm("Diesen Sender wirklich löschen?")) {
        mediaData.iptv.splice(currentEditChannelIndex, 1);
        localStorage.setItem('neoTV_channels', JSON.stringify(mediaData.iptv));
        ownChannels = mediaData.iptv.map((ch, idx) => ({...ch, originalIndex: idx})).slice(10);
        backToManageList();
        renderGrid();
    }
}

// ================= RENDERING & NAVIGATION =================
function renderGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    const items = mediaData[currentMenu];

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => selectItem(index);

        if (currentMenu === 'local') {
            const icon = item.type === 'audio' ? 'audiotrack' : 'movie';
            card.innerHTML = `
                <div class="card-logo-container"><span class="material-symbols-sharp file-icon">${icon}</span></div>
                <div class="card-title">${item.title}</div>
                <div class="card-sub">${item.sub}</div>
            `;
        } else {
            const logoSrc = item.logo ? item.logo : "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/TV_icon.svg/512px-TV_icon.svg.png";
            card.innerHTML = `
                <div class="card-logo-container"><img src="${logoSrc}" alt="${item.title}" class="card-logo"></div>
                <div class="card-title">${item.title}</div>
                <div class="card-sub">${item.sub}</div>
            `;
        }
        grid.appendChild(card);
    });

    if (currentMenu === 'iptv') {
        const addCard = document.createElement('div');
        addCard.className = 'card add-card';
        addCard.innerHTML = `<div class="card-logo-container"><span class="material-symbols-sharp">add_circle</span></div><div class="card-title">Hinzufügen</div>`;
        addCard.onclick = openAddModal;
        grid.appendChild(addCard);

        const manageCard = document.createElement('div');
        manageCard.className = 'card manage-card';
        manageCard.innerHTML = `<div class="card-logo-container"><span class="material-symbols-sharp">settings</span></div><div class="card-title">Verwalten</div>`;
        manageCard.onclick = openManageModal;
        grid.appendChild(manageCard);
    } 
    else if (currentMenu === 'local') {
        const folderCard = document.createElement('div');
        folderCard.className = 'card folder-card';
        folderCard.innerHTML = `<div class="card-logo-container"><span class="material-symbols-sharp">create_new_folder</span></div><div class="card-title">Ordner wählen</div>`;
        folderCard.onclick = triggerFolderPicker;
        grid.appendChild(folderCard);
    }

    const titles = { iptv: 'Live IPTV', mediathek: 'Mediatheken', local: 'Lokale Medien' };
    document.getElementById('area-title').innerText = titles[currentMenu];
}

function changeMenu(index) {
    menuItems.forEach(id => document.getElementById(id).classList.remove('active'));
    
    if(index === 0) currentMenu = 'iptv';
    if(index === 1) currentMenu = 'mediathek';
    if(index === 2) currentMenu = 'local';

    document.getElementById(menuItems[index]).classList.add('active');
    renderGrid();
}

function selectItem(index) {
    const selected = mediaData[currentMenu][index];
    if (!selected) return;
    
    if (currentMenu === 'iptv' || currentMenu === 'local') {
        const overlay = document.getElementById('player-overlay');
        const player = document.getElementById('native-player');
        overlay.style.display = 'block';

        if (currentMenu === 'local') {
            const fileURL = URL.createObjectURL(selected.fileObject);
            player.src = fileURL;
            player.play();
        } 
        else if (currentMenu === 'iptv') {
            if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                currentHls = new Hls();
                currentHls.loadSource(selected.url);
                currentHls.attachMedia(player);
                currentHls.on(Hls.Events.MANIFEST_PARSED, () => player.play());
            } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
                player.src = selected.url;
                player.play();
            }
        }
    } else if (currentMenu === 'mediathek') {
        const overlay = document.getElementById('webview-overlay');
        document.getElementById('ard-webview').src = selected.url;
        overlay.style.display = 'block';
    }
}

function closeOverlays() {
    const player = document.getElementById('native-player');
    player.pause();
    if (currentHls) { currentHls.destroy(); currentHls = null; }
    if (player.src.startsWith('blob:')) URL.revokeObjectURL(player.src);
    player.src = "";
    
    document.getElementById('player-overlay').style.display = 'none';
    document.getElementById('ard-webview').src = "";
    document.getElementById('webview-overlay').style.display = 'none';
}

window.onload = init;
