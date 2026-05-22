const DEFAULT_REPOS = [
    { name: "NeoStore Offiziell", url: "https://raw.githubusercontent.com/NeoOS-TV/NeoStore-Storage/main/app_index.json" }
];

let customRepos = JSON.parse(localStorage.getItem('neostore_repos')) || DEFAULT_REPOS;
let currentRepoIndex = 0; 

let storeApps = [];       // Enthält die Apps der aktuell gewählten Ansicht
let searchedApps = [];    // Flache Liste für Suchergebnisse (wichtig für die Grid-Steuerung)
let isSearchMode = false;  // Flag, ob wir uns im globalen Suchergebnis-Modus befinden
let currentNewRepoUrl = ""; // Zwischenspeicher für den virtuellen Eingabe-Dialog

let activeZone = 'sidebar'; 
let sidebarElements = [];  
let sidebarIndex = 1; // Startet standardmäßig auf "Anwendungen"       
let gridIndex = 0;          
let isModalActive = false; 
let modalButtonIndex = 0;   

let repoManagementIndex = 0; 
let deleteButtonActive = false; 

let selectedApp = null;
const fallbackIcon = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/TV_icon.svg/512px-TV_icon.svg.png";

async function init() {
    buildSidebarDOM();
    // Startet direkt mit dem ersten verfügbaren Repository
    await fetchAppsFromRepo(customRepos[0].url);
    updateFocus();
}

function buildSidebarDOM() {
    const container = document.getElementById('dynamic-repos');
    container.innerHTML = '';
    
    sidebarElements = [
        { id: 'menu-search', type: 'search_trigger', label: 'Store Suche' },
        { id: 'menu-apps', type: 'main_store', label: 'Anwendungen' }
    ];

    customRepos.forEach((repo, idx) => {
        const id = `repo-item-${idx}`;
        const div = document.createElement('div');
        div.className = "nav-item";
        div.id = id;
        div.innerHTML = `<span class="material-symbols-sharp">cloud_queue</span>${repo.name}`;
        container.appendChild(div);
        
        sidebarElements.push({ id: id, type: 'repo_source', url: repo.url, index: idx, label: repo.name });
    });

    sidebarElements.push({ id: 'menu-repo-mgr', type: 'management', label: 'Repo Management' });
    updateActiveSidebarHighlight();
}

function updateActiveSidebarHighlight() {
    document.querySelectorAll('#sidebar .nav-item').forEach(el => el.classList.remove('active'));
    
    if(isSearchMode) {
        document.getElementById('menu-search').classList.add('active');
        return;
    }

    const currentType = sidebarElements[sidebarIndex].type;
    if(currentType === 'management') {
        document.getElementById('menu-repo-mgr').classList.add('active');
    } else if (currentType === 'repo_source') {
        document.getElementById(`repo-item-${sidebarElements[sidebarIndex].index}`).classList.add('active');
    } else if (currentType === 'main_store') {
        document.getElementById('menu-apps').classList.add('active');
    }
}

async function fetchAppsFromRepo(url) {
    isSearchMode = false;
    const areaTitle = document.getElementById('area-title');
    const grid = document.getElementById('grid');
    
    grid.style.display = 'flex';
    document.getElementById('repo-management-view').style.display = 'none';
    grid.innerHTML = '<div style="padding: 50px; font-size: 24px; color: #aaa; width:100%; text-align:center;">Lade Repository-Daten...</div>';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        
        storeApps = await response.json();

        if (!storeApps || storeApps.length === 0) {
            grid.innerHTML = '<div style="padding: 50px; font-size: 24px; color: #aaa; width:100%; text-align:center;">Dieses Repo stellt keine Apps bereit.</div>';
            areaTitle.innerText = sidebarElements[sidebarIndex].label;
            return;
        }

        areaTitle.innerText = `${sidebarElements[sidebarIndex].label} (${storeApps.length})`;
        renderGrid(storeApps);

    } catch (error) {
        console.error("Fehler:", error);
        areaTitle.innerText = "Fehler beim Laden";
        grid.innerHTML = `<div style="padding: 30px; color: #ff8888; font-size: 18px;">Konnte Datenquelle nicht auslesen.<br>${error.message}</div>`;
    }
}

async function triggerGlobalSearch() {
    const query = prompt("Nach welcher App suchst du?");
    if (query === null) return; 
    
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return;

    isSearchMode = true;
    updateActiveSidebarHighlight();

    const areaTitle = document.getElementById('area-title');
    const grid = document.getElementById('grid');
    
    grid.style.display = 'flex';
    document.getElementById('repo-management-view').style.display = 'none';
    grid.innerHTML = '<div style="padding: 50px; font-size: 24px; color: #aaa; width:100%; text-align:center;">Durchsuche alle Repositories...</div>';
    areaTitle.innerText = `Suche nach "${query}"`;

    searchedApps = []; 
    const resultsByRepo = {};

    for (const repo of customRepos) {
        try {
            const response = await fetch(repo.url);
            if (response.ok) {
                const apps = await response.json();
                const filtered = apps.filter(app => 
                    app.title.toLowerCase().includes(cleanQuery) || 
                    app.id.toLowerCase().includes(cleanQuery) ||
                    (app.description && app.description.toLowerCase().includes(cleanQuery))
                );
                if (filtered.length > 0) {
                    resultsByRepo[repo.name] = filtered;
                }
            }
        } catch (e) {
            console.error(`Suche in Repo ${repo.name} fehlgeschlagen`, e);
        }
    }

    grid.innerHTML = '';
    let globalIndexCounter = 0;

    const repoNames = Object.keys(resultsByRepo);
    if (repoNames.length === 0) {
        grid.innerHTML = '<div style="padding: 50px; font-size: 24px; color: #aaa; width:100%; text-align:center;">Keine passenden Apps in den Quellen gefunden.</div>';
        return;
    }

    repoNames.forEach(repoName => {
        const divider = document.createElement('div');
        divider.className = 'search-divider';
        divider.innerText = `Quelle: ${repoName}`;
        grid.appendChild(divider);

        resultsByRepo[repoName].forEach(app => {
            const card = document.createElement('div');
            card.className = 'card';
            card.id = `card-${globalIndexCounter}`;
            card.innerHTML = `
                <div class="card-logo-container">
                    <img src="${app.logo}" alt="${app.title}" class="card-logo" onerror="this.src='${fallbackIcon}';">
                </div>
                <div class="card-title">${app.title}</div>
                <div class="card-sub">${app.version}</div>
            `;
            grid.appendChild(card);
            
            searchedApps.push(app);
            globalIndexCounter++;
        });
    });

    activeZone = 'grid';
    gridIndex = 0;
    updateFocus();
}

function renderGrid(appsList) {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    appsList.forEach((app, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.id = `card-${index}`;
        card.innerHTML = `
            <div class="card-logo-container">
                <img src="${app.logo}" alt="${app.title}" class="card-logo" onerror="this.src='${fallbackIcon}';">
            </div>
            <div class="card-title">${app.title}</div>
            <div class="card-sub">${app.version}</div>
        `;
        grid.appendChild(card);
    });
}

function renderRepoManagementList() {
    const list = document.getElementById('repo-management-list');
    list.innerHTML = '';
    customRepos.forEach((repo, idx) => {
        const item = document.createElement('div');
        item.className = 'repo-list-item';
        item.id = `repo-mgr-item-${idx}`;
        item.innerHTML = `
            <div class="repo-info">
                <h5>${repo.name}</h5>
                <p>${repo.url}</p>
            </div>
            <button class="btn-del-repo" id="btn-del-${idx}">Löschen</button>
        `;
        list.appendChild(item);
    });
}

function updateFocus() {
    document.querySelectorAll('#sidebar .nav-item').forEach(el => el.classList.remove('focused'));
    document.querySelectorAll('.card').forEach(card => card.classList.remove('focused'));
    document.getElementById('repo-fake-input').classList.remove('focused');
    document.getElementById('btn-add-repo').classList.remove('focused');
    document.querySelectorAll('.repo-list-item').forEach(item => item.classList.remove('focused'));
    document.querySelectorAll('.btn-del-repo').forEach(btn => btn.classList.remove('active-del'));

    if (activeZone === 'sidebar') {
        const activeItem = document.getElementById(sidebarElements[sidebarIndex].id);
        if (activeItem) activeItem.classList.add('focused');
    } 
    else if (activeZone === 'grid') {
        const activeCard = document.getElementById(`card-${gridIndex}`);
        if (activeCard) {
            activeCard.classList.add('focused');
            activeCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    } 
    else if (activeZone === 'management_view') {
        if (repoManagementIndex === 0) {
            document.getElementById('repo-fake-input').classList.add('focused');
        } else if (repoManagementIndex === 1) {
            document.getElementById('btn-add-repo').classList.add('focused');
        } else {
            const listIdx = repoManagementIndex - 2;
            const item = document.getElementById(`repo-mgr-item-${listIdx}`);
            if (item) {
                item.classList.add('focused');
                if (deleteButtonActive) {
                    document.getElementById(`btn-del-${listIdx}`).classList.add('active-del');
                }
            }
        }
    }
}

function openAppDetails(app) {
    selectedApp = app;
    document.getElementById('modal-title').innerText = app.title;
    document.getElementById('modal-icon').src = app.logo;
    document.getElementById('modal-id').innerText = app.id;
    document.getElementById('modal-version').innerText = "Version: " + app.version;

    // Reset Button-Zustand beim Öffnen
    updateInstallButtonText("Installieren");

    if (window.marked && typeof window.marked.parse === 'function') {
        document.getElementById('modal-desc').innerHTML = window.marked.parse(app.description);
    } else {
        document.getElementById('modal-desc').innerText = app.description;
    }

    document.getElementById('app-modal').style.display = 'flex';
    isModalActive = true;
    modalButtonIndex = 0;
    updateModalFocus();
}

function closeModal() {
    document.getElementById('app-modal').style.display = 'none';
    isModalActive = false;
    updateFocus();
}

function updateModalFocus() {
    const container = document.getElementById('modal-btn-container');
    const buttons = container.querySelectorAll('.modal-focusable');
    buttons.forEach((btn, idx) => {
        if (idx === modalButtonIndex) btn.classList.add('button-focused');
        else btn.classList.remove('button-focused');
    });
}

function updateInstallButtonText(text, isError = false) {
    const btn = document.getElementById('btn-install');
    if (btn) {
        btn.innerText = text;
        btn.style.background = isError ? "#cc2929" : "#0088ff";
    }
}

function installPackage(ipkUrl) {
    if (!window.webOS) {
        alert("webOS API nicht gefunden. Installation abgebrochen.\nURL: " + ipkUrl);
        return;
    }

    updateInstallButtonText("Lade herunter...");

    window.webOS.service.request("luna://com.webos.appInstallService", {
        method: "install",
        parameters: {
            id: selectedApp.id,
            ipkUrl: ipkUrl,
            subscribe: true
        },
        onSuccess: function (res) {
            if (res.details && res.details.state) {
                const state = res.details.state.toLowerCase();
                
                if (state === "downloading") {
                    const progress = res.details.progress || 0;
                    updateInstallButtonText(`Lade herunter (${progress}%)`);
                } 
                else if (state === "installing") {
                    updateInstallButtonText("Installiere App...");
                } 
                else if (state === "installed" || res.status === "success") {
                    updateInstallButtonText("Fertiggestellt!");
                    setTimeout(() => {
                        alert(`${selectedApp.title} wurde erfolgreich installiert!`);
                        closeModal();
                    }, 1200);
                }
            }
        },
        onFailure: function (err) {
            console.error("Installationsfehler:", err);
            updateInstallButtonText("Fehler!", true);
            setTimeout(() => {
                alert("Installation fehlgeschlagen:\n" + (err.errorText || "Unbekannter Fehler"));
                updateInstallButtonText("Installieren");
            }, 1500);
        }
    });
}

function triggerVirtualRepoInput() {
    const url = prompt("Gib die App-Index JSON URL des Repositories ein:", "https://");
    if (url && url.trim() !== "" && url !== "https://") {
        currentNewRepoUrl = url.trim();
        document.getElementById('repo-fake-input').innerText = currentNewRepoUrl;
        document.getElementById('repo-fake-input').style.color = "#fff";
    }
}

function handleAddRepo() {
    if(!currentNewRepoUrl) {
        alert("Bitte zuerst eine URL über das Feld eingeben.");
        return;
    }

    try {
        const urlObj = new URL(currentNewRepoUrl);
        const pathParts = urlObj.pathname.split('/');
        const repoName = pathParts[2] ? pathParts[2] : "Externes Repo";

        customRepos.push({ name: repoName, url: currentNewRepoUrl });
        localStorage.setItem('neostore_repos', JSON.stringify(customRepos));
        
        currentNewRepoUrl = "";
        document.getElementById('repo-fake-input').innerText = "Repo-URL eingeben...";
        document.getElementById('repo-fake-input').style.color = "#888";

        buildSidebarDOM();
        renderRepoManagementList();
        repoManagementIndex = 2 + (customRepos.length - 1); 
        updateFocus();
    } catch(e) {
        alert("Bitte eine valide URL eingeben.");
    }
}

function handleDeleteRepo(index) {
    customRepos.splice(index, 1);
    localStorage.setItem('neostore_repos', JSON.stringify(customRepos));
    buildSidebarDOM();
    renderRepoManagementList();
    deleteButtonActive = false;
    repoManagementIndex = 0;
    updateFocus();
}

window.addEventListener('keydown', function(e) {
    if (isModalActive) {
        if (e.key === 'Escape' || e.key === 'BackSpace' || e.keyCode === 461) {
            closeModal(); e.preventDefault(); return;
        }
        if (e.key === 'ArrowLeft' && modalButtonIndex > 0) modalButtonIndex--;
        if (e.key === 'ArrowRight' && modalButtonIndex < 1) modalButtonIndex++;
        if (e.key === 'Enter') {
            if (modalButtonIndex === 0) installPackage(selectedApp.url);
            else closeModal();
        }
        updateModalFocus(); return;
    }

    const currentAppsList = isSearchMode ? searchedApps : storeApps;

    if (activeZone === 'sidebar') {
        switch(e.key) {
            case 'ArrowUp':
                if (sidebarIndex > 0) sidebarIndex--;
                break;
            case 'ArrowDown':
                if (sidebarIndex < sidebarElements.length - 1) sidebarIndex++;
                break;
            case 'ArrowRight':
                if (sidebarElements[sidebarIndex].type === 'management') {
                    activeZone = 'management_view';
                    repoManagementIndex = 0;
                } else if (sidebarElements[sidebarIndex].type === 'search_trigger') {
                    // Bleibt im Menü stehen
                } else {
                    if ((sidebarElements[sidebarIndex].type === 'main_store' || sidebarElements[sidebarIndex].type === 'repo_source') && storeApps.length === 0) {
                        const targetUrl = sidebarElements[sidebarIndex].type === 'main_store' ? customRepos[0].url : sidebarElements[sidebarIndex].url;
                        currentRepoIndex = sidebarElements[sidebarIndex].type === 'main_store' ? 0 : sidebarElements[sidebarIndex].index;
                        fetchAppsFromRepo(targetUrl);
                    }
                    if (currentAppsList.length > 0) {
                        activeZone = 'grid';
                        gridIndex = 0;
                    }
                }
                break;
            case 'Enter':
                if (sidebarElements[sidebarIndex].type === 'search_trigger') {
                    triggerGlobalSearch();
                } else if (sidebarElements[sidebarIndex].type === 'management') {
                    isSearchMode = false;
                    updateActiveSidebarHighlight();
                    document.getElementById('grid').style.display = 'none';
                    document.getElementById('repo-management-view').style.display = 'flex';
                    document.getElementById('area-title').innerText = "Repository Einstellungen";
                    renderRepoManagementList();
                    activeZone = 'management_view';
                    repoManagementIndex = 0;
                } else if (sidebarElements[sidebarIndex].type === 'main_store') {
                    currentRepoIndex = 0;
                    if (customRepos[0]) {
                        fetchAppsFromRepo(customRepos[0].url);
                    }
                    updateActiveSidebarHighlight();
                } else {
                    currentRepoIndex = sidebarElements[sidebarIndex].index || 0;
                    fetchAppsFromRepo(sidebarElements[sidebarIndex].url);
                    updateActiveSidebarHighlight();
                }
                break;
        }
    } 
    else if (activeZone === 'grid') {
        const columns = 4;
        switch(e.key) {
            case 'ArrowUp': if (gridIndex >= columns) gridIndex -= columns; break;
            case 'ArrowDown': if (gridIndex + columns < currentAppsList.length) gridIndex += columns; break;
            case 'ArrowLeft': 
                if (gridIndex % columns > 0) gridIndex--; 
                else activeZone = 'sidebar';
                break;
            case 'ArrowRight': if (gridIndex < currentAppsList.length - 1) gridIndex++; break;
            case 'Enter': openAppDetails(currentAppsList[gridIndex]); break;
        }
    } 
    else if (activeZone === 'management_view') {
        switch(e.key) {
            case 'ArrowLeft':
                if (repoManagementIndex === 1) repoManagementIndex = 0;
                else if (repoManagementIndex >= 2 && deleteButtonActive) deleteButtonActive = false;
                else activeZone = 'sidebar';
                break;
            case 'ArrowRight':
                if (repoManagementIndex === 0) repoManagementIndex = 1;
                else if (repoManagementIndex >= 2 && !deleteButtonActive) deleteButtonActive = true;
                break;
            case 'ArrowUp':
                if (repoManagementIndex >= 2) {
                    if (repoManagementIndex === 2) repoManagementIndex = 0;
                    else repoManagementIndex--;
                }
                break;
            case 'ArrowDown':
                if (repoManagementIndex === 0 || repoManagementIndex === 1) {
                    if(customRepos.length > 0) repoManagementIndex = 2;
                } else if (repoManagementIndex < 2 + customRepos.length - 1) {
                    repoManagementIndex++;
                }
                break;
            case 'Enter':
                if (repoManagementIndex === 0) {
                    triggerVirtualRepoInput(); 
                } else if (repoManagementIndex === 1) {
                    handleAddRepo();
                } else if (repoManagementIndex >= 2 && deleteButtonActive) {
                    handleDeleteRepo(repoManagementIndex - 2);
                }
                break;
        }
    }
    updateFocus();
});

window.onload = init;
