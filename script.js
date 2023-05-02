
const videoElem_1 =  document.getElementById('video-1');
const videoElem_2 =  document.getElementById('video-2');

let peerConnection;
let peer_1_Stream;
let remoteStream;
const APP_ID ='3eb5ac05c86c421d8264681b474261d1'

 let client;
 let channel;
// const Agora_option = {
//     uid: Math.floor(Math.random() * 100000).toString(),
//     token: ''
// }

const uid = String(Math.floor(Math.random() * 100000))
const token =''

const constraints = {
    video:true, 
    audio: false
}

const stun_servers = {
    iceServers:[
        {
            urls:['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}


async function  init(){

     peer_1_Stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElem_1.srcObject =  peer_1_Stream;


    client =  await AgoraRTM.createInstance(APP_ID);
    await client.login({uid, token});
    channel =   client.createChannel('main')
    await channel.join();

    channel.on('MemberJoined', HandleUserJoined);
    channel.on('MessageFromPeer', HandleMessageFromPeer);
    channel.on('MemberLeft', HandleUserLeft);
   
}


const setPeerConnection = async (memberId)=>{
    peerConnection = new RTCPeerConnection(stun_servers);
    remoteStream = new MediaStream();
    videoElem_2.srcObject = remoteStream

    if(!peer_1_Stream){
        peer_1_Stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElem_1.srcObject = peer_1_Stream;
    }
    

    peer_1_Stream.getTracks().forEach(track=>{
        peerConnection.addTrack(track, peer_1_Stream);
    });

   
    peerConnection.ontrack = (event)=>{
        event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track))
        
    }

    peerConnection.onicecandidate= async(event)=>{
        if(event.candidate){
            // client.sendMessageToPeer({text:JSON.stringify({'type':'candidate', 'candidate':event.candidate}, memberId)});
            client.sendMessageToPeer({text:JSON.stringify({'type':'candidate', 'candidate':event.candidate})}, memberId)
        }

    }

}


async function HandleUserJoined(memberId){
    // if (!peer_1_Stream) {
    //       peer_1_Stream = await navigator.mediaDevices.getUserMedia(constraints);
    //         videoElem_1.srcObject = peer_1_Stream; 
    // }
 
    console.log('User joined:', memberId);
    await setPeerConnection(memberId)
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    client.sendMessageToPeer({text:JSON.stringify({'type':'offer', 'offer':offer})}, memberId)
}
 



function HandleMessageFromPeer(message, memberId){
    console.log('message from peer: ', message, memberId)
    const msg = JSON.parse(message.text);
    console.log(msg)

    if (msg.type === 'offer') {
        createAnswer(msg.offer, memberId);
    }

    if (msg.type === 'candidate') {
        if(peerConnection){
            peerConnection.addIceCandidate(msg.candidate)
        }
    }

    if (msg.type === 'answer') {
        addAnswer(msg.answer);
    }
}


async function createAnswer(offer, memberId){
    await setPeerConnection(memberId)
    await peerConnection.setRemoteDescription(offer)

    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    client.sendMessageToPeer({text:JSON.stringify({'type':'answer', 'answer':answer})}, memberId)
}


async function addAnswer(answer){
    if(!peerConnection.currentRemoteDescription){
         peerConnection.setRemoteDescription(answer)
    }
}

function HandleUserLeft(memberId){
    console.log('User left:', memberId);
}

init()