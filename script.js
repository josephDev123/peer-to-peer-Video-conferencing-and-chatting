const videoElem_1 =  document.getElementById('video-1');
const videoElem_2 =  document.getElementById('video-2');

let peerConnection;

const constraints = {
    video:{
        min: 768,
        max: 1024,
        width: 1024
    }, 
    audio: false
}

const stun_servers = {
    iceServers:[
        {
            urls:['stun2.l.google.com:19302', 'stun3.l.google.com:19302', 'stun4.l.google.com:19302']
        }
    ]
}



async function  init(){
    const media = await navigator.mediaDevices.getUserMedia(constraints)
    videoElem_1.srcObject = media
}

init()