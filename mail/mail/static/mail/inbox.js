document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

// By default, load the inbox
var box = true
if (box == false) {
  load_mailbox('sent');
} else {
  load_mailbox('inbox')
}



// This function loads the view for sending the email
function compose_email(email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#detail-view').style.display = 'none';

  // If the sender of the email is unidentified, it will load a blank form for sending the email
  if (email.sender == undefined) { 
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  } else {
    // If a sender is identified, it will prefil the form based on its email data
    document.querySelector('#compose-recipients').value = email.sender;
    if(email.subject.includes("Re:")){
      document.querySelector('#compose-subject').value = email.subject;
    } else {
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;    
  }

  //Sent Mail after clicking a button
  document.querySelector('#compose-form').onsubmit = function() {
    const recivers = document.querySelector('#compose-recipients').value;
    const sub = document.querySelector('#compose-subject').value;
    const content = document.querySelector('#compose-body').value;
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: `${recivers}`,
        subject: `${sub}`,
        body: `${content}`
      })
    })
    .then(response => response.json())
    .then(result => {
    });

  // Loads the sent mailbox
  load_mailbox('sent')
  return false
  }
}


// This function fetch for all e-mails in the requested mailbox
function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // Fetch for requested mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(text => {
    // Run add_mail function for every email inside requested mailbox
    text.forEach(add_mail)
  })
}


// This function creates a div for a single email and adds functionality to different clicks
function add_mail(contents) {
  const object = document.createElement('div');
  const box = document.createElement('div');
  const button = document.createElement('div');
  box.id = "${contents.id}";
  if (contents.read === true){
    object.className = 'readed';
  } else {
    object.className = 'email';
  }
  box.innerHTML = `<b>${contents.sender}</b>
  ${contents.subject}               
  <small id="timestamp">${contents.timestamp}</small>`;
  object.append(box)
  var user = document.querySelector('#user').innerHTML
  if (contents.sender != user && contents.archived === false) {
    button.innerHTML = `<button id="archive">Archive</button><br>`
    button.addEventListener('click', () => archive_email(contents.id))
  }
  if (contents.archived == true && contents.sender != user) {
    button.innerHTML = `<button id="unarchive">Unarchive</button><br>`

    button.addEventListener('click', () => unarchive_email(contents.id))
  }
  object.append(button)
  box.addEventListener('click', () => view_email(contents.id))
  document.querySelector('#emails-view').append(object);
}

  // This function fetchs the requested email, marks it as read, and runs the detail_email function for it
  function view_email(email) {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#detail-view').style.display = 'block';

    fetch(`/emails/${email}`, {
      method: 'PUT',
      body:JSON.stringify({
        read: true
      })
    })

    fetch(`/emails/${email}`)
    .then(response => response.json())
    .then(text => {
      detail_email(text)
    });

  // This feature loads a detailed view of a specific, requested email
  function detail_email(argument) {
    const object = document.querySelector('#detail-view')
    const box = document.createElement('div');
    const buttons = document.createElement('div');
    const button = document.createElement('div');
    const replyButton = document.createElement('div');
    button.innerHTML = `<button id="archive">Archive</button><br>`
    buttons.className = 'buttons';
    button.className  = 'archive-button';
    replyButton.className = 'reply-button';
    box.innerHTML = `
    <b>Sender:</b> ${argument.sender}<br>
    <b>Recipients:</b> ${argument.recipients}<br>
    <b>Subject:</b> ${argument.subject}<br>
    <b>Timestamp:</b> ${argument.timestamp}<hr>
    ${argument.body}`
    var user = document.querySelector('#user').innerHTML
    if (argument.sender != user && argument.archived === false) {
      button.innerHTML = `<button id="archive">Archive</button><br>`
      console.log('Przycisk dodano')
      button.addEventListener('click', () => archive_email(argument.id))
    }
    if (argument.archived == true && argument.sender != user) {
      button.innerHTML = `<button id="unarchive">Unarchive</button><br>`
      console.log('Zaarchiwowane')
      button.addEventListener('click', () => unarchive_email(argument.id))
    }
    replyButton.innerHTML = `<button id="replay">Reply</button><br>`
    replyButton.addEventListener('click', () => compose_email(argument))
    buttons.append(replyButton);
    buttons.append(button);
    object.innerHTML  = ''
    object.append(buttons);
    object.append(box);
  }
  }

  // This function marks the email as archived
  function archive_email(email) {
    fetch(`/emails/${email}`, {
      method: 'PUT',
      body:JSON.stringify({
        archived: true
      })
    })
      load_mailbox('inbox')
      return true
  }

  // This function marks the email as unarchived
  function unarchive_email(email) {
    fetch(`/emails/${email}`, {
      method: 'PUT',
      body:JSON.stringify({
        archived: false
      })
    })
      load_mailbox('inbox')
      return true

  }

  
});
