process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { client, xml } = require('@xmpp/client');


const XMPP_SERVER = 'alumchat.xyz';

const xmpp = client({
  service: `xmpp://${XMPP_SERVER}:5222`,
  domain: XMPP_SERVER,
  username: process.argv[2],
  password: process.argv[3],

});

xmpp.on('error', err => {
  console.error('❌', err.toString());
});

xmpp.on('offline', () => {
  console.log('⏹', 'offline');
});

xmpp.on('online', address => {
  console.log(`🎉 Connected as ${address.toString()}`);
});

// This will be the entry point for our client, starting the connection process.
function startClient(username, password) {
  xmpp.options.resource = 'example';
  xmpp.options.username = username.split('@')[0];
  xmpp.options.password = password;
  return xmpp.start();
}

async function registerAccount(username, password) {
    const registration = xml(
      'iq',
      { type: 'set', to: XMPP_SERVER },
      xml('query', { xmlns: 'jabber:iq:register' },
        xml('username', {}, username),
        xml('password', {}, password)
      )
    );
  
    xmpp.send(registration).then(() => {
      console.log('Account registered successfully!');
    }).catch((err) => {
      console.error('Error registering account:', err.toString());
    });
}

function logout() {
    // Send an unavailable presence
    xmpp.send(xml('presence', { type: 'unavailable' })).then(() => {
      console.log("Logged out successfully!");
      xmpp.stop();  // Gracefully stop the client
    }).catch((err) => {
      console.error("Error during logout:", err.toString());
    });
  }

  function deleteAccount() {
    const deleteStanza = xml(
      'iq',
      { type: 'set' },
      xml('query', { xmlns: 'jabber:iq:register' },
        xml('remove')
      )
    );
  
    xmpp.send(deleteStanza).then(() => {
      console.log("Account deleted successfully!");
      xmpp.stop();  // Gracefully stop the client after deletion
    }).catch((err) => {
      console.error("Error deleting account:", err.toString());
    });
  }

  function getRoster() {
    const rosterStanza = xml(
      'iq',
      { type: 'get', id: 'roster_1' },
      xml('query', { xmlns: 'jabber:iq:roster' })
    );

    xmpp.send(rosterStanza).then((response) => {
      // If response is undefined, return to prevent further processing
      if (!response) {
        console.log("Received empty roster response.");
        return;
      }

      const contacts = response.getChildren('item');
      contacts.forEach(contact => {
        const jid = contact.attrs.jid;
        console.log(`Contact: ${jid}`);
      });
    }).catch((err) => {
      console.error("Error retrieving roster:", err.toString());
    });
}



  xmpp.on('stanza', (stanza) => {
    if (stanza.is('presence')) {
      const from = stanza.attrs.from;
      const type = stanza.attrs.type || 'available'; // If no type is provided, it means the user is available.
      console.log(`Presence update from ${from}: ${type}`);
    }
  });
  
  function addUserToRoster(jid, nickname = '') {
    // Create the roster set stanza
    const rosterSetStanza = xml(
      'iq',
      { type: 'set', id: 'add1' },
      xml('query', { xmlns: 'jabber:iq:roster' },
        xml('item', { jid: jid, name: nickname })
      )
    );

    // Send the roster set stanza
    xmpp.send(rosterSetStanza).then(() => {
      console.log(`User ${jid} added to roster!`);
      
      // Now, send a subscription request
      const subscribeStanza = xml('presence', { to: jid, type: 'subscribe' });
      xmpp.send(subscribeStanza).then(() => {
        console.log(`Subscription request sent to ${jid}.`);
      }).catch((err) => {
        console.error("Error sending subscription request:", err.toString());
      });

    }).catch((err) => {
      console.error("Error adding user to roster:", err.toString());
    });
}

function showContactDetails(jidToFetch) {
  const rosterGetStanza = xml(
    'iq',
    { type: 'get', id: 'roster_2' },
    xml('query', { xmlns: 'jabber:iq:roster' })
  );

  // Send the roster get stanza
  xmpp.send(rosterGetStanza).then((response) => {
    const items = response.getChildren('item');
    const contact = items.find(item => item.attrs.jid === jidToFetch);
    
    if (contact) {
      console.log(`JID: ${contact.attrs.jid}`);
      console.log(`Name: ${contact.attrs.name || 'N/A'}`);
      console.log(`Subscription: ${contact.attrs.subscription}`);
      const groups = contact.getChildren('group').map(group => group.text());
      console.log(`Groups: ${groups.join(', ') || 'N/A'}`);
    } else {
      console.log(`No contact found with JID: ${jidToFetch}`);
    }

  }).catch((err) => {
    console.error("Error fetching roster:", err.toString());
  });
}

function sendMessage(toJID, messageText) {
  const messageStanza = xml(
    'message',
    { type: 'chat', to: toJID },
    xml('body', {}, messageText)
  );

  // Send the message stanza
  xmpp.send(messageStanza).then(() => {
    console.log(`Message sent to ${toJID}!`);
  }).catch((err) => {
    console.error("Error sending message:", err.toString());
  });
}

xmpp.on('stanza', (stanza) => {
  if (stanza.is('message') && stanza.attrs.type === 'chat') {
    const fromJID = stanza.attrs.from;
    const body = stanza.getChildText('body');
    if (body) {
      console.log(`Message from ${fromJID}: ${body}`);
    }
  }
});

function sendNotification(toJID, notificationText) {
  const notificationStanza = xml(
    'message',
    { type: 'chat', to: toJID },
    xml('subject', {}, 'NOTIFICATION'),
    xml('body', {}, notificationText)
  );

  // Send the notification stanza
  xmpp.send(notificationStanza).then(() => {
    console.log(`Notification sent to ${toJID}!`);
  }).catch((err) => {
    console.error("Error sending notification:", err.toString());
  });
}

xmpp.on('stanza', (stanza) => {
  if (stanza.is('message') && stanza.attrs.type === 'chat') {
    const fromJID = stanza.attrs.from;
    const body = stanza.getChildText('body');
    const subject = stanza.getChildText('subject');
    
    if (subject === 'NOTIFICATION') {
      console.log(`Notification from ${fromJID}: ${body}`);
    } else if (body) {
      console.log(`Message from ${fromJID}: ${body}`);
    }
  }
});

function setPresence(presenceType = 'available', statusMessage = '') {
  const presenceStanza = xml(
    'presence',
    { type: presenceType },
    xml('status', {}, statusMessage)
  );

  // Send the presence stanza
  xmpp.send(presenceStanza).then(() => {
    console.log(`Presence set to ${presenceType} with message: ${statusMessage}`);
  }).catch((err) => {
    console.error("Error setting presence:", err.toString());
  });
}



  

if (require.main === module) {
    const username = process.argv[2];
    const password = process.argv[3];
  
    if (!username || !password) {
      console.log('Please provide a username and password as command line arguments.');
    } else {
      xmpp.start().then(() => {
        registerAccount(username, password);
      }).catch((err) => {
        console.error('Error starting client:', err.toString());
      });
    }
  }
  
  
  module.exports = {
    startClient,
    registerAccount,
    logout,
    deleteAccount,
    getRoster,
    addUserToRoster,
    showContactDetails,
    sendMessage,
    sendNotification,
    setPresence
  };
  
