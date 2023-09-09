document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  document.querySelector('#compose-form').onsubmit = send;

  // By default, load the inbox
  load_mailbox('inbox');
 
});

function send() {

  console.log("hi");
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(() => {
    load_mailbox('sent'); 
  })

  return false;
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // document.querySelector('#compose-form').onsubmit=send;
}

function reply(id) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  //fetch the details
  let sender,subject,time, body;
  fetch('emails/'+id)
  .then(response => response.json())
  .then(email => {
    sender = email.sender;
    subject = email.subject;
    time = email.timestamp;
    body = email.body;
  })
  .then(()=>{
    // Pre fill the composition fields
    document.querySelector('#compose-recipients').value = sender;
    composeSubject = document.querySelector('#compose-subject');
    if (subject[0] === 'R' && subject[1] ==='e' && subject[2] ===':' )
      composeSubject.value = subject;
    else composeSubject.value = "Re: "+subject;

    document.querySelector('#compose-body').value = "On "+time+" "+sender+" wrote: "+body;
  });

  return false;

}

function load_mailbox(mailbox) {

  // console.log(mailbox);
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#read-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  // console.log(mailbox);

  if(mailbox === 'inbox') {
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {
        const mainOuter = document.querySelector('#emails-view');

        for(let i=0; i<=emails.length; i++){
          // skip
          // if(emails[i].archived) continue;

          //create card
          const cardDiv = document.createElement('cardDiv');
          cardDiv.className = "card";

          //background
          if(emails[i].read)
            cardDiv.style.backgroundColor = "#ededed";
          else cardDiv.style.backgroundColor = "white";
          
          //create left part
          const divLeft = document.createElement('div')
          divLeft.className = "left"

          //create sender div
          const senderDiv = document.createElement('div');
          senderDiv.className = "senderDiv";
          const sender = emails[i].sender;
          senderDiv.append(sender);

          //create subject div
          const subjectDiv = document.createElement('div');
          subjectDiv.className = "subjectDiv";
          const subject = emails[i].subject;
          subjectDiv.append("Subject: ");
          subjectDiv.append(subject);

          //create read button
          const readbtn = document.createElement('button');
          readbtn.className = 'readbtn';
          readbtn.innerHTML = "Read";
          readbtn.onclick = () => {
            fetch('emails/'+emails[i].id, {
              method: "PUT",
              body: JSON.stringify({
                read:true
              })
            });

            readMail(emails[i].id);
          }

          //sender and subject to left
          divLeft.append(senderDiv);
          divLeft.append(subjectDiv);
          divLeft.append(readbtn);
          
          //create right part
          const divRight = document.createElement('div');
          divRight.className = "right";

          //create time div
          const timeDiv = document.createElement('timeDiv');
          timeDiv.className = "timeDiv";
          const time = emails[i].timestamp;
          timeDiv.append(time);

          //create button div
          const button = document.createElement('button');
          button.className = "archive";
          // button.id = "archive/"+emails[i].id;
          button.innerHTML = "Archive";
          button.onclick = () => {
            fetch('/emails/'+emails[i].id, {
              method : "PUT",
              body: JSON.stringify({
                archived:true
              })
            }).then(response => {
              if (response.ok) {
                console.log(1);
                load_mailbox('inbox');
                console.log(2);
              }
            })
            
          };

          // time and button to right
          divRight.append(timeDiv);
          divRight.append(button);

          

          //left to card
          cardDiv.appendChild(divLeft);

          // right to card
          cardDiv.appendChild(divRight);

          mainOuter.appendChild(cardDiv);
        }
    });
  }

  else if(mailbox === 'archive') {
    fetch('/emails/archive')
    .then(response => response.json())
    .then(emails => {
        const mainOuter = document.querySelector('#emails-view');

        for(let i=0; i<=emails.length; i++){
          // skip
          // if(!emails[i].archived) continue;

          //create card
          const cardDiv = document.createElement('cardDiv');
          cardDiv.className = "card";

          //background
          if(emails[i].read)
            cardDiv.style.backgroundColor = "#ededed";
          else cardDiv.style.backgroundColor = "white";
          
          //create left part
          const divLeft = document.createElement('div')
          divLeft.className = "left"

          //create sender div
          const senderDiv = document.createElement('div');
          senderDiv.className = "senderDiv";
          const sender = emails[i].sender;
          senderDiv.append(sender);

          //create subject div
          const subjectDiv = document.createElement('div');
          subjectDiv.className = "subjectDiv";
          const subject = emails[i].subject;
          subjectDiv.append("Subject: ");
          subjectDiv.append(subject);

          //create read button
          const readbtn = document.createElement('button');
          readbtn.className = 'readbtn';
          readbtn.innerHTML = "Read";
          readbtn.onclick = () => {
            fetch('emails/'+emails[i].id, {
              method: "PUT",
              body: JSON.stringify({
                read:true
              })
            });

            readMail(emails[i].id);
          }

          //append sender, subject and read to left
          divLeft.append(senderDiv);
          divLeft.append(subjectDiv);
          divLeft.append(readbtn);

          //create right part
          const divRight = document.createElement('div');
          divRight.className = "right";

          //create time div
          const timeDiv = document.createElement('timeDiv');
          timeDiv.className = "timeDiv";
          const time = emails[i].timestamp;
          timeDiv.append(time);

          //create button div
          const button = document.createElement('button');
          button.className = "unarchive";
          // button.id = "unarchive/"+emails[i].id;
          button.innerHTML = "Unarchive";
          button.onclick = () => {
            fetch('/emails/'+emails[i].id, {
              method : "PUT",
              body: JSON.stringify({
                archived:false
              })
            }).then(response => {
              if (response.ok) {
                console.log(1);
                load_mailbox('archive');
                console.log(2);
              }
            })
            
          };

          // time and button to right
          divRight.append(timeDiv);
          divRight.append(button);

          //left to card
          cardDiv.appendChild(divLeft);

          // right to card
          cardDiv.appendChild(divRight);

          //append card to main
          mainOuter.appendChild(cardDiv);
        }
    });
  }

  if(mailbox === 'sent') {
    fetch('/emails/sent')
    .then(response => response.json())
    .then(emails => {
        const mainOuter = document.querySelector('#emails-view');

        for(let i=0; i<=emails.length; i++){
 
          const cardDiv = document.createElement('cardDiv');
          cardDiv.className = "card";

          //background
          // if(emails[i].read)
          cardDiv.style.backgroundColor = "#ededed";
          // else cardDiv.style.backgroundColor = "white";
          
          //create left part
          const divLeft = document.createElement('div')
          divLeft.className = "left"

          //create sender div
          const senderDiv = document.createElement('div');
          senderDiv.className = "senderDiv";
          const sender = emails[i].sender;
          senderDiv.append(sender);

          //create subject div
          const subjectDiv = document.createElement('div');
          subjectDiv.className = "subjectDiv";
          const subject = emails[i].subject;
          subjectDiv.append("Subject: ");
          subjectDiv.append(subject);

          //create read button
          const readbtn = document.createElement('button');
          readbtn.className = 'readbtn';
          readbtn.innerHTML = "Read";
          readbtn.onclick = () => {
            readMail(emails[i].id);
          }

          //append sender, subject and read to left
          divLeft.append(senderDiv);
          divLeft.append(subjectDiv);
          divLeft.append(readbtn);

          //create right part
          const divRight = document.createElement('div');
          divRight.className = "right";

          //create time div
          const timeDiv = document.createElement('timeDiv');
          timeDiv.className = "timeDiv";
          const time = emails[i].timestamp;
          timeDiv.append(time);

          // time and button to right
          divRight.append(timeDiv);

          //left to card
          cardDiv.appendChild(divLeft);

          // right to card
          cardDiv.appendChild(divRight);

          //append card to main
          mainOuter.appendChild(cardDiv);
        }
    });
  }
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function readMail(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'block';
  document.querySelector('#read-view').innerHTML = '';
  document.querySelector('#compose-view').style.display = 'none';
  let sender, recipients, subject, time, body;
  fetch('emails/'+id)
  .then(response => response.json())
  .then(email => {
    sender = email.sender;
    recipients = email.recipients;
    subject = email.subject;
    time = email.timestamp;
    body = email.body;
  })
  .then(()=> {

    //create subject div
    const subjectDiv = document.createElement('h3');
    subjectDiv.className = 'email-view_subject';
    subjectDiv.append(subject);

    //create sender div
    const senderDiv = document.createElement('h5');
    senderDiv.className = 'email-view_sender';
    senderDiv.append(sender);

    //create recipients div
    const recipientsDiv = document.createElement('select');
    recipientsDiv.className = 'email-view_recipients';
    recipientsDiv.style.margin = '10px 0';
    recipients.forEach(element=>{
      const recipient = document.createElement('option');
      recipient.append(element);
      recipientsDiv.append(recipient);
    });

    //create time div
    const timeDiv = document.createElement('div');
    timeDiv.append(time);

    //append sender, recipients and time in mid part
    const midDiv = document.createElement('div');
    midDiv.className = 'read-midDiv';
    const midLeft = document.createElement('div');
    const midRight = document.createElement('div');

    midLeft.append(senderDiv);
    midLeft.append("To : ", recipientsDiv);
    midDiv.append(midLeft);
    
    midRight.append(timeDiv);
    midDiv.append(midRight);


    //create body div
    const bodyDiv = document.createElement('div');
    bodyDiv.append(body);
    bodyDiv.style.marginTop = '30px';

    //create reply button
    const replybtn = document.createElement('button');
    replybtn.innerHTML = "Reply";
    replybtn.id = "reply-btn";
    replybtn.onclick =()=> reply(id);

    // read view div
    const readviewDiv = document.querySelector('#read-view');
    readviewDiv.appendChild(subjectDiv);
    readviewDiv.appendChild(midDiv);
    readviewDiv.appendChild(bodyDiv);
    readviewDiv.appendChild(replybtn);

  });
  
  return false;
}