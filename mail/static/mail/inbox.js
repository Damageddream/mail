document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => {
    const box = 'inbox';
    load_content(box);
    });  

  document.querySelector('#sent').addEventListener('click', () => {
    const box = 'sent';
    load_content(box);
  });

  document.querySelector('#archived').addEventListener('click', () => {
    const box = 'archived';
    load_content(box);
  });

  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector("#compose-form").onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    load_content('sent')
    return false;
    

  }


  // By default, load the inbox
  load_content('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function reply(mail) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // fill composition fields with reply 
  document.querySelector('#compose-recipients').value = mail.sender;
  if (mail.subject.startsWith('RE:')){
    document.querySelector('#compose-subject').value = mail.subject;
  }
  else{
    document.querySelector('#compose-subject').value = `RE: ${mail.subject}`;
  }
  document.querySelector('#compose-body').value = `On ${mail.timestamp} ${mail.sender} wrote: ${mail.body}`;  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#mail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
}

function show_mail() {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
}

function load_content(box) {
  load_mailbox(box)
  let boxy;
  if(box === 'archived'){
    boxy = 'archive';
  }
  else {
    boxy = box;
  }
  fetch(`/emails/${boxy}`)
  .then(response => response.json())
  .then(emails =>{
    console.log(emails);
    for(let x in emails) {
      const mail = emails[x];
      const div = document.createElement('div');
      const archive = document.createElement('div');
      if (box === 'sent') {
        div.innerHTML = `<b>Sender:</b> ${mail.sender} <b>Subject:</b> ${mail.subject} <b>Time:</b> ${mail.timestamp}`;
      }
      else {
        if (mail.archived === false) {
          div.innerHTML = `<b>Sender:</b> ${mail.sender} <b>Subject:</b> ${mail.subject} <b>Time:</b> ${mail.timestamp}`;
          archive.innerHTML = '<button>Archive</button>'
          archive.id = `archive_${mail.id}`;
        }
        else {
          div.innerHTML = `<b>Sender:</b> ${mail.sender} <b>Subject:</b> ${mail.subject} <b>Time:</b> ${mail.timestamp}`;
          archive.innerHTML = '<button>Unarchive</button>'
          archive.id = `unarchive_${mail.id}`;
        }

      }
      div.classList.add('line');
      div.id = `${mail.id}`;
      const hid = document.createElement('div');
      hid.id = `hid_${mail.id}`;
      document.querySelector('#emails-view').append(hid);
      document.querySelector(`#hid_${mail.id}`).append(div);
      document.querySelector(`#hid_${mail.id}`).append(archive);

      if (box !== 'sent') {
        if (archive.id === `archive_${mail.id}`)
        {
          document.getElementById(`${archive.id}`).addEventListener('click', () => {
            fetch(`emails/${mail.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: true
              })
            })
            hid.classList.add('a-hide');
            document.getElementById(`hid_${mail.id}`).style.animationPlayState = 'running';
            document.getElementById(`hid_${mail.id}`).addEventListener('animationend', () => {
              document.getElementById(`hid_${mail.id}`).remove();
            }) 

          });

        }
        else {
          document.getElementById(`${archive.id}`).onclick = () => {
            fetch(`emails/${mail.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: false
              })
            })
            hid.classList.add('a-hide');
            document.getElementById(`hid_${mail.id}`).style.animationPlayState = 'running';
            document.getElementById(`hid_${mail.id}`).addEventListener('animationend', () => {
            document.getElementById(`hid_${mail.id}`).remove();
            load_content('inbox');
            }) 
          }
                 
        }
      }
      
      if(mail.read === true) {
        div.classList.add('unread')
      };
      document.getElementById(`${mail.id}`).onclick = () => {
        fetch(`emails/${mail.id}`)
        .then(response => response.json())
        .then(email => {
          console.log(email);
          document.querySelector('#mail').innerHTML='';
          show_mail();
          const divMail = document.createElement('div');
          const send = document.createElement('div');
          divMail.innerHTML = `<b>Sender:</b> ${email.sender}<br><b>Recepient:</b> ${email.recipients}<br><b>Subject:</b> ${email.subject}<br><b>Email:</b> ${email.body}<br><b>Date:</b>${email.timestamp}`;
          send.innerHTML = '<button>Reply</button>';
          send.id = `send_${email.id}`;
          document.querySelector('#mail').append(divMail);
          document.querySelector('#mail').append(send);
          document.getElementById(`send_${email.id}`).onclick = () => {
            reply(email)
          }
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              read: true
            })
          })
        })

      }
    }
  
  })  

}