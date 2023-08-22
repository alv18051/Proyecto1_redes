const readline = require('readline');
const { startClient, registerAccount, logout, deleteAccount, getRoster, addUserToRoster, showContactDetails, sendMessage, sendNotification, setPresence } = require('./pro1.js');


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function displayMenu() {
  console.log("\nXMPP Chat Client Menu:");
  console.log("1. Log in");
  console.log("2. Registrarse");
  console.log("3. Set presence");
  console.log("4. Enviar un mensaje");
  console.log("5. Log out");
  console.log("6. BOrrar una cuenta");
  console.log("7. Obtener el roster");
  console.log("8. Agregar un contacto");
  console.log("9. Ver detalles de un contacto");
  console.log("10. Enviar un mensaje");
  console.log("11. Enviar una notificacion");
  console.log("100. Exit");
}

function menu() {
  displayMenu();

  rl.question("\nChoose an option: ", (choice) => {
    switch (choice) {

      case '1':  
        rl.question("Enter your username: ", (username) => {
          rl.question("Enter your password: ", (password) => {
            startClient(username, password).then(() => {
              console.log("Login successful!");
              menu();
            }).catch((err) => {
              console.error("Error during login:", err);
              menu();
            });
          });
        });
      break;

      case '2':
        console.log("Registrarse")
        rl.question("Enter desired username: ", (username) => {
            rl.question("Enter desired password: ", (password) => {
              registerAccount(username, password).then(() => {
                console.log("Registro Completado!");
                menu();
              }).catch((err) => {
                console.error("Error de registro:", err);
                menu();
              });
            });
          });
          break;

      case '3':
        rl.question("Enter presence type (available, away, dnd, xa, unavailable): ", (presenceType) => {
          rl.question("Enter a custom status message (optional): ", (statusMessage) => {
            setPresence(presenceType, statusMessage);
            menu();
          });
        });
        break;

      case '4':
        // Register a new account functionality
        console.log("Register a new account (to be implemented)");
        menu();
        break;

      case '5':
        logout();
        menu();  // Return to the main menu after logging out
        break;

        case '6':
            // Delete account functionality
            rl.question("Are you sure you want to delete your account? (yes/no): ", (confirmation) => {
              if (confirmation.toLowerCase() === 'yes') {
                deleteAccount();
              } else {
                console.log("Account deletion canceled.");
              }
              menu();  // Return to the main menu
            });
            break;
        
        case '7':
            getRoster();
            menu();  // Return to the main menu
            break;
        
      case '8':
        rl.question("Enter the JID of the user you want to add: ", (jid) => {
          rl.question("Enter a nickname for the user (optional): ", (nickname) => {
            addUserToRoster(jid, nickname);
            menu();
          });
        });
      break;

      case '9':
      rl.question("Enter the JID of the user whose details you want to view: ", (jid) => {
        showContactDetails(jid);
        menu();
      });
      break;

      case '10':
      rl.question("Enter the JID of the user you want to message: ", (toJID) => {
        rl.question("Enter your message: ", (messageText) => {
          sendMessage(toJID, messageText);
          menu();
        });
      });
      break;

      case '11':
      rl.question("Enter the JID of the user you want to notify: ", (toJID) => {
        rl.question("Enter your notification: ", (notificationText) => {
          sendNotification(toJID, notificationText);
          menu();
        });
      });
      break;
    
      case '100':
        // Exit the application
        logout();
        console.log("Exiting...");
        rl.close();
        break;

      default:
        console.log("Invalid choice. Please choose a valid option.");
        menu();  // Prompt the user again for a valid choice
        break;
    }
  });
}

// Start the application loop
if (require.main === module) {
  menu();
}
