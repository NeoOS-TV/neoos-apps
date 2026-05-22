let pairingCode = "";
let peerConnection = null;
let signalingSocket = null;

const rtcConfig = { iceServers: [] };

document.addEventListener('DOMContentLoaded', () => {
    // 1. Lade den Namen: Entweder aus dem Speicher oder nimm den Standardwert
    const savedName = localStorage.getItem('neocast_device_name') || "NeoPlay Wohnzimmer";
    document.getElementById('tv-device-title').textContent = savedName;

    generatePairingCode();
    connectToSignalingServer();
});

// Umschalten auf Eingabefeld
function startEditingName() {
    const titleEl = document.getElementById('tv-device-title');
    const inputEl = document.getElementById('tv-device-input');
    
    inputEl.value = titleEl.textContent;
    titleEl.style.display = 'none';
    inputEl.style.display = 'inline-block';
    inputEl.focus();
    inputEl.select();
}

// Speichern des neuen Namens
function saveNewName() {
    const titleEl = document.getElementById('tv-device-title');
    const inputEl = document.getElementById('tv-device-input');
    const newName = inputEl.value.trim();

    if (newName.length > 0) {
        titleEl.textContent = newName;
        // Im Browser-Speicher sichern
        localStorage.setItem('neocast_device_name', newName);

        // Den neuen Namen sofort an den Pi-Dienst melden, falls die Verbindung steht
        if (signalingSocket && signalingSocket.readyState === WebSocket.OPEN) {
            signalingSocket.send(JSON.stringify({
                type: 'REGISTER_NAME',
                name: newName
            }));
        }
    }

    inputEl.style.display = 'none';
    titleEl.style.display = 'inline-block';
}

// Enter-Taste abfangen
function checkNameKey(event) {
    if (event.key === 'Enter') {
        saveNewName();
    }
}

function generatePairingCode() {
    pairingCode = Math.floor(1000 + Math.random() * 9000).toString();
    document.getElementById('pairing-code').textContent = pairingCode;
}

function connectToSignalingServer() {
    signalingSocket = new WebSocket(`ws://localhost:8088/neocast-signal`);

    signalingSocket.onopen = () => {
        const currentName = localStorage.getItem('neocast_device_name') || "NeoPlay Wohnzimmer";
        signalingSocket.send(JSON.stringify({
            type: 'REGISTER_NAME',
            name: currentName
        }));
    };

    signalingSocket.onmessage = async (event) => {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
            case 'PAIR_ATTEMPT':
                if (msg.code === pairingCode) {
                    signalingSocket.send(JSON.stringify({ type: 'PAIR_SUCCESS', clientUuid: msg.clientUuid }));
                    initWebRTC(msg.clientUuid);
                } else {
                    signalingSocket.send(JSON.stringify({ type: 'PAIR_FAILED', clientUuid: msg.clientUuid }));
                }
                break;

            case 'OFFER':
                if (!peerConnection) initWebRTC(msg.clientUuid);
                await peerConnection.setRemoteDescription(new RTCSessionDescription(msg.offer));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                signalingSocket.send(JSON.stringify({ type: 'ANSWER', answer: answer, clientUuid: msg.clientUuid }));
                break;

            case 'ICE_CANDIDATE':
                if (peerConnection) {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(msg.candidate));
                }
                break;

            case 'DISCONNECT':
                resetReceiver();
                break;
        }
    };
}

function initWebRTC(clientUuid) {
    peerConnection = new RTCPeerConnection(rtcConfig);

    peerConnection.ontrack = (event) => {
        const videoTag = document.getElementById('remote-video');
        if (videoTag.srcObject !== event.streams[0]) {
            videoTag.srcObject = event.streams[0];
            document.getElementById('waiting-screen').style.display = 'none';
            document.getElementById('stream-screen').style.display = 'block';
        }
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate && signalingSocket.readyState === WebSocket.OPEN) {
            signalingSocket.send(JSON.stringify({
                type: 'ICE_CANDIDATE',
                candidate: event.candidate,
                clientUuid: clientUuid
            }));
        }
    };

    peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
            resetReceiver();
        }
    };
}

function resetReceiver() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    document.getElementById('stream-screen').style.display = 'none';
    document.getElementById('waiting-screen').style.display = 'flex';
    generatePairingCode();
}
