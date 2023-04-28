const videoElem_1 =  document.getElementById('video-1');
const videoElem_2 =  document.getElementById('video-2');

let peerConnection;
let peer_1_Stream;
let remoteStream;
const APP_ID ='1fb8d98f2e7145c698548a1f7487c2f9'

 let client;
 let channel;
const Agora_option = {
    uid: Math.floor(Math.random() * 100000).toString(),
    token: ''
}

const constraints = {
    video:{
        min: 768,
        max: 1024,
        width: 1024
    }, 
    audio: false
}

const stun_servers = {
    iceServers:[ { urls:['stun2.l.google.com:19302', 'stun3.l.google.com:19302', 'stun4.l.google.com:19302'] }]
}




async function  init(){
    client = await AgoraRTM.createInstance(APP_ID)
    await client.login(Agora_option);
    channel =  await client.createChannel('main')
    await channel.join();

    channel.on('MemberJoined', HandleUserJoined);
    channel.on('MessageFromPeer', HandleMessageFromPeer);
    channel.on('MemberLeft', HandleUserLeft);

    peer_1_Stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElem_1.srcObject = peer_1_Stream;
}


const setPeerConnection = (memberId)=>{
    peerConnection = new RTCPeerConnection();

    peer_1_Stream.getTracks.forEach(track =>{
        peerConnection.addTracks(track, peer_1_Stream);
    });

    peerConnection.onicecandidate=(event)=>{
        if(event.candidate){
            client.sendMessageToPeer({text:JSON.stringify({'type':candidate, 'candidate':event.candidate}, memberId)});
        }

    }

}


function HandleUserJoined(memberId){
    console.log('User joined:', memberId);
    setPeerConnection(memberId)
    const offer = peerConnection.createOffer();
    peerConnection.setLocalDescription(offer);

    remoteStream = new MediaStream();

    client.sendMessageToPeer({text:JSON.stringify({'type':offer, 'offer':offer}), memberId});
}



function HandleUserLeft(memberId){
    console.log('User left:', memberId);
}

function HandleMessageFromPeer(message, memberId){
    console.log('message from peer: ',message, memberId)
    
    if (message.type === offer) {
        createAnswer(message.offer, memberId);
    }

    if (message.type === candidate) {
        
    }

    if (message.type === offer) {
        
    }
}



function createAnswer(offer, memberId){
    const answer = peerConnection.createAnswer()
    peerConnection.setLocalDescription(answer)

    peerConnection.setRemoteDescription(offer)
    client.sendMessageToPeer({text:JSON.stringify({'type':'answer', 'answer':answer}), memberId})
}

init()