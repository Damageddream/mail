document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => {
    load_mailbox('inbox')
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails =>{
      console.log(emails);
      for(let x in emails) {
        const mail = emails[x];
        const div = document.createElement('div');
        div.innerHTML = `Sender: ${mail.sender} Subject: ${mail.subject} Time: ${mail.timestamp} <div><button>Archive</button><button>Unarchive</button></div>`;
        div.classList.add('line');
        div.id = `${mail.id}`;
        document.querySelector('#emails-view').append(div);
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
            divMail.innerHTML = `Sender: ${email.sender}<br>Recepient: ${email.recipients}<br>Subject: ${email.subject}<br> Email: ${email.body}<br>Date:${email.timestamp}`;
            document.querySelector('#mail').append(divMail);
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



  });
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
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
    load_mailbox('sent')
    return false;
    

  }


  // By default, load the inbox
  load_mailbox('inbox');
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

