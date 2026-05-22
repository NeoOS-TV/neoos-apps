// ================= FIREBASE INITIALISIERUNG =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCUBIg7822V1-1YQ-v62G-isq7pZPxEm9k",
    authDomain: "neoaccount.firebaseapp.com",
    projectId: "neoaccount",
    storageBucket: "neoaccount.firebasestorage.app",
    messagingSenderId: "326522190440",
    appId: "1:326522190440:web:b9456dc74af4260a9259dd",
    measurementId: "G-G1ZJC055VG"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// ================= GLOBALE VARIABLEN =================
let currentStepId = 'step-welcome';
let focusIndex = 0;
let focusableElements = [];
let discoveredNetworks = []; // Speichert die gescannten WLAN-Objekte

// ================= INITIALISIERUNG =================
window.onload = () => {
    updateFocusableElements();
};

function updateFocusableElements() {
    const activeStep = document.getElementById(currentStepId);
    focusableElements = Array.from(activeStep.querySelectorAll('.focusable'));
    focusIndex = 0;
    renderFocus();
}

function renderFocus() {
    focusableElements.forEach((el, index) => {
        if (index === focusIndex) {
            el.classList.add('focused');
            el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            el.classList.remove('focused');
        }
    });
}

// ================= SCHRITT-NAVIGATION =================
window.nextStep = function(stepId) {
    document.getElementById(currentStepId).classList.remove('active');
    currentStepId = 'step-' + stepId;
    document.getElementById(currentStepId).classList.add('active');
    
    // Trigger, wenn der WLAN-Bildschirm geladen wird
    if (stepId === 'wlan') {
        scanWifiNetworks();
    }
    
    updateFocusableElements();
};

// ================= NATIVES WEBOS WLAN MANAGEMENT =================
window.scanWifiNetworks = function() {
    const listContainer = document.getElementById('wlan-networks-list');
    const statusText = document.getElementById('wlan-status-text');
    
    statusText.innerText = "Suche nach verfügbaren WLAN-Netzwerken...";
    listContainer.innerHTML = '<div class="loading-spinner">Scanne Netzwerke...</div>';

    if (typeof webOS !== 'undefined' && webOS.service) {
        // 1. WLAN einschalten, falls deaktiviert
        webOS.service.request("luna://com.webos.service.wifi", {
            method: "setstate",
            parameters: { "state": "enabled" },
            onSuccess: function() {
                // 2. Nach Netzwerken suchen
                webOS.service.request("luna://com.webos.service.wifi", {
                    method: "findnetworks",
                    onSuccess: function(response) {
                        if (response.foundNetworks && response.foundNetworks.length > 0) {
                            discoveredNetworks = response.foundNetworks;
                            renderWifiList();
                        } else {
                            listContainer.innerHTML = '<div style="color:#aaa; padding:20px;">Keine Netzwerke gefunden.</div>';
                        }
                        statusText.innerText = "Wähle dein Netzwerk aus.";
                    },
                    onFailure: function(err) {
                        statusText.innerText = "Fehler beim Suchen nach Netzwerken.";
                        console.error(err);
                    }
                });
            }
        });
    } else {
        // PC-Browser / Emulator-Fallback Mocking
        setTimeout(() => {
            discoveredNetworks = [
                { ssid: "Heimnetzwerk_5G", signalLevel: 90, securityType: "wpa2" },
                { ssid: "FritzBox 7590", signalLevel: 75, securityType: "wpa2" },
                { ssid: "Offenes_Cafe_WLAN", signalLevel: 40, securityType: "none" }
            ];
            renderWifiList();
            statusText.innerText = "Wähle dein Netzwerk aus (Browser-Simulation).";
        }, 1000);
    }
};

function renderWifiList() {
    const listContainer = document.getElementById('wlan-networks-list');
    // Die alten "Aktualisieren" / "Überspringen" Buttons unten im Container sichern
    const actionAreaButtons = document.querySelectorAll('#step-wlan .bottom-action button');
    
    listContainer.innerHTML = '';

    discoveredNetworks.forEach((network, index) => {
        const item = document.createElement('div');
        item.className = 'list-item focusable';
        
        // Bestimme das passende Icon anhand der Signalstärke
        let wifiIcon = "signal_wifi_4_bar";
        if (network.signalLevel < 30) wifiIcon = "signal_wifi_1_bar";
        else if (network.signalLevel < 60) wifiIcon = "signal_wifi_2_bar";
        else if (network.signalLevel < 80) wifiIcon = "signal_wifi_3_bar";

        // Schloss anzeigen, falls das Netzwerk gesichert ist
        const lockIcon = network.securityType !== 'none' ? '<span class="material-symbols-sharp style="font-size:18px; opacity:0.6;">lock</span>' : '';

        item.innerHTML = `
            <span class="material-symbols-sharp">${wifiIcon}</span>
            <div style="flex:1; text-align:left; display:flex; align-items:center; gap:10px;">
                ${network.ssid} ${lockIcon}
            </div>
            <span class="network-type-label">${network.securityType.toUpperCase()}</span>
        `;
        
        // Event-Listener für die Verbindung per Klick/Enter anbinden
        item.onclick = () => connectToWifi(network);
        
        listContainer.appendChild(item);
    });

    // WICHTIG: Die persistenten Buttons wieder der D-Pad-Fokussteuerung hinzufügen
    updateFocusableElements();
}

window.connectToWifi = function(network) {
    const statusText = document.getElementById('wlan-status-text');
    let password = "";

    if (network.securityType !== 'none') {
        // TV-Prompt für die Passworteingabe öffnen
        password = prompt(`Bitte Passwort für "${network.ssid}" eingeben:`);
        if (password === null) return; // Abgebrochen
    }

    statusText.innerText = `Verbinde mit ${network.ssid}...`;

    if (typeof webOS !== 'undefined' && webOS.service) {
        webOS.service.request("luna://com.webos.service.wifi", {
            method: "connect",
            parameters: {
                "ssid": network.ssid,
                "password": password,
                "security": { "securityType": network.securityType }
            },
            onSuccess: function(response) {
                statusText.innerText = `Erfolgreich verbunden mit ${network.ssid}!`;
                document.getElementById('wifi-main-icon').style.color = "#4CAF50";
                
                // Nach 1,5 Sekunden weiter zum Firebase Account-Screen
                setTimeout(() => {
                    window.nextStep('account');
                }, 1500);
            },
            onFailure: function(err) {
                statusText.innerText = `Verbindung fehlgeschlagen: ${err.errorText || 'Falsches Passwort'}`;
                alert("Verbindung fehlgeschlagen. Bitte Passwort überprüfen.");
            }
        });
    } else {
        // Browser Mock-Erfolg
        setTimeout(() => {
            statusText.innerText = `Erfolgreich verbunden mit ${network.ssid}!`;
            document.getElementById('wifi-main-icon').style.color = "#4CAF50";
            setTimeout(() => window.nextStep('account'), 1500);
        }, 1200);
    }
};

// ================= ECHTER FIREBASE LOGIN =================
window.performLogin = async function() {
    const emailInput = document.getElementById('firebase-email').value.trim();
    const passInput = document.getElementById('firebase-pass').value.trim();
    const btn = focusableElements[focusIndex];
    const originalText = btn.innerHTML;

    if (!emailInput || !passInput) {
        alert("Bitte E-Mail und Passwort eingeben!");
        return;
    }

    btn.innerHTML = `<span class="material-symbols-sharp">hourglass_empty</span> Lade...`;
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, emailInput, passInput);
        console.log("Erfolgreich eingeloggt:", userCredential.user.email);
        
        btn.style.backgroundColor = "#4CAF50";
        btn.innerHTML = `<span class="material-symbols-sharp">check_circle</span> Verbunden!`;
        
        setTimeout(() => {
            window.nextStep('finish');
        }, 1500);

    } catch (error) {
        console.error("Login Fehler:", error.code);
        let errorMsg = "Fehler bei der Anmeldung.";
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMsg = "E-Mail oder Passwort ist falsch.";
        }
        alert(errorMsg);
        btn.innerHTML = originalText;
    }
};

// ================= WEBOS LAUNCHER CALL =================
window.launchNeoOSLauncher = function() {
    try {
        if (typeof webOS !== 'undefined' && webOS.service) {
            webOS.service.request("luna://com.webos.applicationManager", {
                method: "launch",
                parameters: { "id": "com.neoos.launcher" },
                onSuccess: function () {
                    window.close(); 
                },
                onFailure: function (inError) {
                    console.error("Fehler beim Starten", inError);
                }
            });
        } else {
            alert("Launcher (com.neoos.launcher) wird gestartet!");
        }
    } catch (e) { console.error(e); }
};

// ================= FERNBEDIENUNGS-MATRIX =================
window.addEventListener('keydown', function(e) {
    if (focusableElements.length === 0) return;

    const currentElement = focusableElements[focusIndex];

    switch(e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
            focusIndex++;
            if (focusIndex >= focusableElements.length) focusIndex = 0;
            renderFocus();
            e.preventDefault();
            break;

        case 'ArrowUp':
        case 'ArrowLeft':
            focusIndex--;
            if (focusIndex < 0) focusIndex = focusableElements.length - 1;
            renderFocus();
            e.preventDefault();
            break;

        case 'Enter':
            if (currentElement.tagName.toLowerCase() === 'input') {
                let newVal = prompt("Eingabe:", currentElement.value);
                if (newVal !== null) {
                    currentElement.value = newVal;
                }
            } else {
                currentElement.click();
            }
            e.preventDefault();
            break;
            
        case 'Escape':
        case 'BackSpace':
        case 'Backspace': 
            e.preventDefault();
            break;
    }
});
