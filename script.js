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



function HandleUserJoined(memberId){
    console.log('User joined:', memberId);
    peerConnection = new RTCPeerConnection();

    peer_1_Stream.getTracks.forEach(track =>{
        peerConnection.addTracks(track, peer_1_Stream);
    });

    const offer = peerConnection.createOffer();
    peerConnection.setLocalDescription(offer);

    remoteStream = new MediaStream();

    client.sendMessageToPeer({text:JSON.stringify({'type':offer, 'offer':offer}), memberId});
}



function HandleUserLeft(memberId){
    console.log('User left:', memberId);
}

function HandleMessageFromPeer(memberId){
    console.log('MESSAGE FROM PEER:', memberId);
}



init()