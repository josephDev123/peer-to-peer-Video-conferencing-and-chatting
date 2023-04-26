const videoElem_1 =  document.getElementById('video-1');
const videoElem_2 =  document.getElementById('video-2');

let peerConnection;
let peer_1Stream;
let remoteStream;
const APP_ID ='3eb5ac05c86c421d8264681b474261d1'

 let client;
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



async function signalingServer(){
    client = await AgoraRTM.createInstance(APP_ID)
    await client.login(Agora_option);
    channel =  client.createChannel('main')
    channel.join();

    client.on('MemberJoined', HandleUserJoined)   
}


function HandleUserJoined(memberId){
     console.log('User joined:', memberId)
}




async function  init(){
    await signalingServer()
    peerConnection = new RTCPeerConnection();

    peer_1Stream = await navigator.mediaDevices.getUserMedia(constraints)
    peer_1Stream.getTracks().forEach(track => {
        // console.log(track)
        peerConnection.addTrack(track)
    })

    peerConnection.ontrack = (event)=>{
        console.log(event)
        remoteStream.addTrack(event.streams[0])
    }

    remoteStream = new MediaStream()
    // console.log(remoteStream)
    videoElem_2.srcObject = remoteStream;
    videoElem_1.srcObject = peer_1Stream;

    peerConnection.onicecandidate = async (event)=>{
        if(event.candidate){
             client.sendMessageToPeer({text: JSON.stringify({'type': 'candidate', 'candidate': event.candidate}) })
        }  
    }

    
    const offer = peerConnection.createOffer();
    peerConnection.setLocalDescription(offer)
      
      client.sendMessageToPeer({text:JSON.stringify({'type':'offer',  'offer': offer})})
    
}




init()