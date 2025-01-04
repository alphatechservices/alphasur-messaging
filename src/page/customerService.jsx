import { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth"; // Import de signOut
import { database } from "../firebase"; // Import correct de votre configuration Firebase

import { ref as dbRef, get, onValue, push, set } from "firebase/database";
import { useNavigate } from "react-router-dom";

function CustomerService() {
  const [userConversations, setUserConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMessageBoxVisible, setIsMessageBoxVisible] = useState(false);
  const [selectedUserId] = useState(null);
  const [messageToSend, setMessageToSend] = useState("");
  const [unreadMessages, setUnreadMessages] = useState({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const db = database; // Utilisation directe de l'instance importée

  useEffect(() => {
    const fetchConversations = () => {
      const userId = getAuth().currentUser?.uid;
      if (!userId) return;

      const conversationsRef = dbRef(db, "conversations");
      const unsubscribe = onValue(conversationsRef, (snapshot) => {
        if (snapshot.exists()) {
          const conversations = snapshot.val();
          const userConversationsArray = Object.keys(conversations).map(
            (key) => ({
              conversationId: key,
              ...conversations[key],
            })
          );

          const newUnreadMessages = {};
          userConversationsArray.forEach((conversation) => {
            const unreadCount = conversation.messages
              ? Object.values(conversation.messages).filter(
                  (msg) => msg.userId !== userId && !msg.read
                ).length
              : 0;
            if (unreadCount > 0) {
              newUnreadMessages[conversation.conversationId] = unreadCount;
            }
          });

          setUnreadMessages(newUnreadMessages);
          setUserConversations(userConversationsArray);
        }
      });

      return () => unsubscribe();
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    const checkAdminStatus = () => {
      const user = getAuth().currentUser;
      if (user) {
        setIsAdmin(user.email === "admin@alphatech.com");
      }
    };

    checkAdminStatus();
  }, []);
  useEffect(() => {
    if (activeConversationId) {
      const conversationMessagesRef = dbRef(
        database,
        `conversations/${activeConversationId}/messages`
      );

      onValue(conversationMessagesRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const messagesArray = Object.keys(data).map((messageId) => ({
            messageId,
            ...data[messageId],
          }));

          // Vérifiez si un nouveau message est arrivé
          if (messagesArray.length > messages.length) {
            const lastMessage = messagesArray[messagesArray.length - 1];
            const currentUser = getAuth().currentUser;

            // Vérifiez si le dernier message ne provient pas de l'utilisateur actuel
            if (lastMessage.userId !== currentUser?.uid) {
              console.log("Nouvelle notification reçue."); // Notification sans son
            }
          }

          setMessages(messagesArray);
        } else {
          setMessages([]);
        }
      });
    }
  }, [activeConversationId, messages.length]);

  const handleConversationClick = (conversationId) => {
    setActiveConversationId(conversationId);
    setUnreadMessages((prevUnreadMessages) => ({
      ...prevUnreadMessages,
      [conversationId]: false,
    }));

    // Mettez à jour l'état "lu" dans Firebase
    const conversationMessagesRef = dbRef(
      database,
      `conversations/${conversationId}/messages`
    );
    onValue(conversationMessagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        Object.keys(messagesData).forEach((messageId) => {
          const messageRef = dbRef(
            database,
            `conversations/${conversationId}/messages/${messageId}/read`
          );
          set(messageRef, true);
        });
      }
    });
  };

  const handleSendMessage = async () => {
    const user = getAuth().currentUser;
    if (!user || !activeConversationId || newMessage.trim() === "") {
      alert("Impossible d'envoyer un message vide ou non connecté.");
      return;
    }

    const messageData = {
      userId: user.uid, // ID de l'utilisateur actuel (expéditeur)
      username: isAdmin ? "Admin" : user.email || `User ${user.uid}`, // Nom de l'utilisateur ou ID
      text: newMessage, // Contenu du message
      createdAt: new Date().toISOString(), // Horodatage
      isRead: false, // Ajout de la clé `isRead`
      read: false, // Ajout de la clé `read` (selon l'ancien format)
    };

    const messagesRef = dbRef(
      db,
      `conversations/${activeConversationId}/messages`
    );

    try {
      await push(messagesRef, messageData);
      setNewMessage("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
      alert("Une erreur est survenue lors de l'envoi du message.");
    }
  };

  const navigate = useNavigate();
  // Fonction de déconnexion
  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Rediriger l'utilisateur vers la page de connexion
        navigate("/");
      })
      .catch((error) => {
        console.error("Erreur lors de la déconnexion :", error);
      });
  };

  // Fonction pour envoyer le message à Firebase
  const handleSendMessageToUser = async () => {
    if (!selectedUserId || messageToSend.trim() === "") return;

    const user = getAuth().currentUser;
    if (!user) return;

    const messageData = {
      userId: user.uid, // ID de l'utilisateur actuel (expéditeur)
      username: user.email || `User ${user.uid}`, // Nom de l'utilisateur ou ID
      recipientId: selectedUserId, // ID du destinataire
      text: messageToSend, // Contenu du message
      createdAt: new Date().toISOString(), // Horodatage
    };

    // Référence aux messages de la conversation avec l'utilisateur sélectionné
    const messagesRef = dbRef(db, `conversations/${selectedUserId}/messages`);

    try {
      await push(messagesRef, messageData); // Pousser le message dans Firebase
      setMessageToSend(""); // Réinitialiser le champ de saisie
      setIsMessageBoxVisible(false); // Fermer la boîte de dialogue
      alert("Message envoyé avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }
  };


  const goToMessage = () => {
    navigate("/message");
  };


  useEffect(() => {
    const fetchRequest = async () => {
      try {
        // Récupérez toutes les requêtes
        const requestsRef = dbRef(db, "requests/");
        const requestsSnapshot = await get(requestsRef);

        if (!requestsSnapshot.exists()) {
          console.log("Aucune requête disponible");
          return;
        }

        const allRequests = requestsSnapshot.val();

        // Récupérez tous les utilisateurs
        const usersRef = dbRef(db, "users/");
        const usersSnapshot = await get(usersRef);

        if (!usersSnapshot.exists()) {
          console.log("Aucun utilisateur disponible");
          return;
        }

        const allUsers = usersSnapshot.val();

        // Associez les requêtes aux emails des utilisateurs
        const groupedRequests = {};

        for (const requestId of Object.keys(allRequests)) {
          const requestData = allRequests[requestId];
          const userId = requestData.userId;

          // Vérifiez si l'utilisateur existe et récupérez l'email
          const user = allUsers[userId];
          const email = user ? user.email : "Email non disponible";

          // Associez la requête à la publication via `propertyId`
          const publicationId = requestData.propertyId;
          if (!groupedRequests[publicationId]) {
            groupedRequests[publicationId] = [];
          }

          groupedRequests[publicationId].push({
            ...requestData,
            email, // Ajoutez l'email ici
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    };

    fetchRequest();
  }, [db]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div className="header-service-client">
        <h1 className="service-client">SERVICE CLIENT</h1>
        <button onClick={handleSignOut} className="logoutButton">
          Se déconnecter
        </button>
      </div>
      <div className="parallel-container">
        <div className="container">
          <div className="header-container">
            <h2 className="homeText">Mes Conversations</h2>
          </div>
          <div>
            {userConversations.map(({ conversationId }) => (
              <div
                key={conversationId}
                onClick={() => handleConversationClick(conversationId)}
                className={`conversation ${
                  conversationId === activeConversationId ? "active" : ""
                }`}
              >
                Conversation {conversationId}
                {unreadMessages[conversationId] && (
                  <span className="notification-badge">
                    {unreadMessages[conversationId]}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="messageContainer">
            {messages.length > 0 ? (
              messages.map(({ messageId, username, text, createdAt }) => (
                <div key={messageId} className="message">
                  <strong>{username}</strong>: {text} <br />
                  <small>{new Date(createdAt).toLocaleString()}</small>
                </div>
              ))
            ) : (
              <p>Aucun message trouvé pour cette conversation.</p>
            )}
          </div>

          <div className="messageInputContainer">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="inputMessage"
            />
            <button onClick={handleSendMessage} className="sendButton">
              Envoyer 📩
            </button>
          </div>
        </div>

        <div className="image-container">
          <img
            src="https://i.ibb.co/j8bwmWX/message.jpg"
            alt="conversation"
            className="conversationImage"
          />
        </div>
      </div>
      <div className="home-container">
        <div className="header-container">
          <h1>{"LE PANNEAU D'ADMINISTRATEUR"}</h1>
          <button onClick={toggleMenu} className="menuToggleButton">
            {isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          </button>
          <div className="gap">
            <button onClick={goToMessage} className="customButton">
              Aller à la page Message
            </button>
          </div>
        </div>

        <div className={`menu-bar ${isMenuOpen ? "open" : "closed"}`}>
          <button onClick={goToMessage}>Aller à la page Message</button>

        </div>
      </div>

      {isMessageBoxVisible && (
        <div className="message-box">
          <h2 className="message-box-title">Envoyer un message</h2>
          <textarea
            className="message-box-textarea"
            value={messageToSend}
            onChange={(e) => setMessageToSend(e.target.value)}
            placeholder="Écrivez votre message..."
          />
          <div className="message-box-buttons">
            <button
              className="message-box-send-button"
              onClick={handleSendMessageToUser}
            >
              Envoyer
            </button>
            <button
              className="message-box-cancel-button"
              onClick={() => setIsMessageBoxVisible(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default CustomerService;
