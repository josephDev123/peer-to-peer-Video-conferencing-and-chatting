
const videoElem_1 =  document.getElementById('localStream');
const videoElem_2 =  document.getElementById('remoteStream');
const streams_wrapper =  document.getElementById('streams_wrapper');
const loading =  document.getElementById('loading');

let peerConnection;
let localStream;
let remoteStream;
const APP_ID ='3eb5ac05c86c421d8264681b474261d1'

 let client;
 let channel;



const uid = String(Math.floor(Math.random() * 100000))
const token =null

const constraints = {
    video:true, 
    audio: true
}

const servers = {
    iceServers:[
        {
            urls:['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}

//loading state
loading.innerHTML =`<div>Loading ..... </div>`

async function init(){

    client =  await AgoraRTM.createInstance(APP_ID);
    await client.login({uid, token});
    channel = client.createChannel('main')
    await channel.join();

    channel.on('MemberJoined', HandleUserJoined);
    channel.on('MemberLeft', HandleUserLeft);
    client.on('MessageFromPeer', HandleMessageFromPeer);
    
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElem_1.setAttribute('class', 'remoteStream-bigThumbnail');
    videoElem_1.srcObject=localStream;
    loading.innerHTML = ''
}

function HandleUserLeft(memberId){
    console.log('User left:', memberId);
}


 function HandleMessageFromPeer(message, memberId){
    console.log('message from peer: ', message, memberId)
     msg = JSON.parse(message.text);
    // console.log(msg)

    if (msg.type === 'offer') {
        console.log('offer',msg.offer)
        createAnswer(msg.offer, memberId);
    }

    if (msg.type === 'answer') {
        console.log('anwser',msg.answer)
        addAnswer(msg.answer);
    }

    if (msg.type === 'candidate') {
        if(peerConnection){
            console.log('candidate', msg.candidate)
            peerConnection.addIceCandidate(msg.candidate)
        }
    }

   
}

async function HandleUserJoined(memberId){
    console.log('User joined:', memberId);
    createOffer(memberId) 
}
 


const createPeerConnection = async (memberId)=>{
    peerConnection = new RTCPeerConnection(servers);
    remoteStream = new MediaStream();
    videoElem_2.srcObject = remoteStream

    if(!localStream){
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElem_1.srcObject = localStream;
    }
    

    localStream.getTracks().forEach(track=>{
        peerConnection.addTrack(track, localStream);
    });

   
    peerConnection.ontrack = (event)=>{
        console.log('stream', memberId)
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
            
    })
    // videoElem_1.removeAttribute('class', 'localStream-bigThumbnail')    
    videoElem_2.setAttribute('class', 'remoteStream-bigThumbnail');
    videoElem_1.setAttribute('class', 'localStream-smallThumbnail') 
    }

    peerConnection.onicecandidate= async (event)=>{
        if(event.candidate){
            client.sendMessageToPeer({text:JSON.stringify({'type':'candidate', 'candidate':event.candidate})}, memberId)
        }

    }

}

async function createOffer(memberId){
    
    await createPeerConnection(memberId)
    const offer = await peerConnection.createOffer();
    console.log('create offer', offer)
    await peerConnection.setLocalDescription(offer);

    client.sendMessageToPeer({text:JSON.stringify({'type':'offer', 'offer':offer})}, memberId)
}

async function createAnswer(offer, memberId){
    await createPeerConnection(memberId)
    await peerConnection.setRemoteDescription(offer)

    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    console.log('create answer', answer)
    client.sendMessageToPeer({text:JSON.stringify({'type':'answer', 'answer':answer})}, memberId)
}


async function addAnswer(answer){
    if(!peerConnection.currentRemoteDescription){
         peerConnection.setRemoteDescription(answer)
       
    }
}

init()



