const dateEl =  document.getElementById('date');
const createNewRoomForm = document.getElementById('new-meeting-form')
const shareLinkBtn = document.getElementById('shareLinkBtn');
const joinMeetingForm = document.getElementById('join-meeting')

// display data in the element
const date = new Date().toDateString();
dateEl.textContent = date

createNewRoomForm.onsubmit = (e)=>{
    e.preventDefault()
    let roomTitle = createNewRoomForm.elements['meeting-title'].value;
    let roomName = createNewRoomForm.elements['room-name'].value;
    if(!roomTitle && !roomName){
        alert('The(se) filed(s) cannot be empty')
    }else{
        window.location.href =`je-ma-uz.html?room_title=${roomTitle}&room_name=${roomName}`
        window.localStorage.setItem('new-meeting', JSON.stringify({'meeting_title':roomTitle, 'room_name':roomName}))
    }
  
}


shareLinkBtn.onclick = (e)=>{
    const new_meeting_storage_data = JSON.parse(window.localStorage.getItem('new-meeting'))
    console.log(new_meeting_storage_data)
    if(!new_meeting_storage_data?.meeting_title && !new_meeting_storage_data?.room_name){
        alert('create a meeting before sharing link. try again');
    }else{
        const currentUrl = `je-ma-uz.html?room_title=${new_meeting_storage_data?.meeting_title}&room_name=${new_meeting_storage_data?.room_name}`
        copyLink(currentUrl)
     
    } 
}

joinMeetingForm.onsubmit = (e)=>{
    e.preventDefault();
    const link = joinMeetingForm.elements['meeting-link']
    if(!link.value){
        alert('cannot join the meeting because of invalid or empty link');
    }else{
        window.location.href=link.value
    }
}

function copyLink(link) {
    navigator.clipboard.writeText(link)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch((error) => {
        alert('Failed to copy link:', error);
      });
  }
  
window.onbeforeunload = (e)=>{
    e.preventDefault();
    e.returnValue = ''
    window.localStorage.removeItem('new-meeting')
    
}
  