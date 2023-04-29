

const videoElem_1 =  document.getElementById('video-1');
const videoElem_2 =  document.getElementById('video-2');

let peerConnection;
let peer_1_Stream;
let remoteStream;
const APP_ID ='3eb5ac05c86c421d8264681b474261d1'

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
    
    client =  AgoraRTM.createInstance(APP_ID)
    await client.login(Agora_option);
    channel =  await client.createChannel('main')
    await channel.join();

    channel.on('MemberJoined', HandleUserJoined);
    channel.on('MessageFromPeer', HandleMessageFromPeer);
    channel.on('MemberLeft', HandleUserLeft);

    peer_1_Stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElem_1.srcObject = peer_1_Stream;
}


const setPeerConnection = async (memberId)=>{
    peerConnection = new RTCPeerConnection();

    if(!peer_1_Stream){
        peer_1_Stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElem_1.srcObject = peer_1_Stream;
    }

    peer_1_Stream.getTracks().forEach(track =>{
        peerConnection.addTrack(track, peer_1_Stream);
    });

    remoteStream = new MediaStream();
    peerConnection.ontrack = (event)=>{
        videoElem_2.srcObject = event.remoteStream[0];
    }

    peerConnection.onicecandidate=(event)=>{
        if(event.candidate){
            // client.sendMessageToPeer({text:JSON.stringify({'type':'candidate', 'candidate':event.candidate}, memberId)});
            client.sendMessageToPeer({text:JSON.stringify({'type':'candidate', 'candidate':event.candidate})}, memberId)
        }

    }

}


async function HandleUserJoined(memberId){
    console.log('User joined:', memberId);
    setPeerConnection(memberId)
    const offer = peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    client.sendMessageToPeer({text:JSON.stringify({'type':'offer', 'offer':offer})}, memberId)
}
 



function HandleUserLeft(memberId){
    console.log('User left:', memberId);
}

function HandleMessageFromPeer(message, memberId){
    console.log('message from peer: ',message, memberId)
    const msg = JSON.parse(message.text);

    if (msg.type === 'offer') {
        createAnswer(msg.offer, memberId);
    }

    if (msg.type === 'candidate') {
        client.sendMessageToPeer({text:JSON.stringify({'type':'candidate', 'answer':msg.candidate}), memberId})
    }

    if (msg.type === 'answer') {
        addAnswer(msg.answer);
    }
}



async function createAnswer(offer, memberId){
    const answer = peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    await peerConnection.setRemoteDescription(offer)
    // client.sendMessageToPeer({text:JSON.stringify({'type':'answer', 'answer':answer}), memberId})
    client.sendMessageToPeer({text:JSON.stringify({'type':'answer', 'answer':answer})}, memberId)
}


async function addAnswer(message){
    if(!peerConnection.setRemoteDescription()){
        await peerConnection.setRemoteDescription(message)
    }
}

init()