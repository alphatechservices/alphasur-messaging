import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, push, onValue, remove, getDatabase, set } from 'firebase/database';
import { auth } from '../firebase';
import '../messageDetails.css'; // Importer le fichier CSS pour le style
import { useNavigate } from 'react-router-dom';


function MessagingScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const scrollViewRef = useRef();

  const db = getDatabase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const usersArray = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
      setUsers(usersArray);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    // Stocker le message dans la base de données en temps réel
    if (activeConversationId && user) {
      const messageDraftRef = ref(db, `conversations/${activeConversationId}/drafts/${user.uid}`);
      set(messageDraftRef, {
        text: newMessage,
        userId: user.uid,
        username: user.email || 'User',
        updatedAt: new Date().toISOString(),
      }).catch((error) => {
        console.error('Error saving draft:', error);
      });
    }
  };

  const sendMessage = async () => {
    if (message.trim() && user && activeConversationId) {
      try {
        const conversationMessagesRef = ref(db, `conversations/${activeConversationId}/messages`);
        await push(conversationMessagesRef, {
          text: message,
          createdAt: new Date().toISOString(),
          userId: user.uid,
          username: user.email || 'User',
        });
        setMessage('');
  
        // Supprimer le brouillon après l'envoi du message
        const messageDraftRef = ref(db, `conversations/${activeConversationId}/drafts/${user.uid}`);
        await remove(messageDraftRef);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };
  

  const deleteConversation = async () => {
    if (activeConversationId) {
      try {
        await remove(ref(db, `conversations/${activeConversationId}`));
        setActiveConversationId(null);
        alert('Conversation deleted');
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
  };

  const newConversation = async () => {
    if (!selectedUserId) {
      alert('Please select a user to start a conversation with.');
      return;
    }
    try {
      const newConversationRef = await push(ref(db, 'conversations'), {
        participants: {
          [user.uid]: true,
          [selectedUserId]: true
        },
        createdAt: new Date().toISOString(),
      });
      const newConversationId = newConversationRef.key;
  
      setActiveConversationId(newConversationId);
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };
  

  useEffect(() => {
    if (user) {
      const conversationsRef = ref(db, 'conversations');
      const unsubscribe = onValue(conversationsRef, (snapshot) => {
        const data = snapshot.val() || {};
        const userConversations = Object.keys(data).filter(
          (id) => data[id].participants && data[id].participants[user.uid]
        );
        setConversations(userConversations);
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversationId) {
      const messagesRef = ref(db, `conversations/${activeConversationId}/messages`);
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val() || {};
        const messagesArray = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setMessages(messagesArray);
        scrollViewRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
      return () => unsubscribe();
    }
  }, [activeConversationId]);

  const navigate = useNavigate()

  return (
    <div className="messaging-screen">
      <button onClick={() => navigate(-1)} className="back-button">Retour</button> {/* Bouton de retour */}
      {!activeConversationId ? (
        <div className="panel">
          <h2>Conversations</h2>
          <select
            value={selectedUserId || ''}
            className='select-container'
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="" disabled>{"Selectionne l'utilisateur"}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email || 'Unknown User'} - ( {u.id} )
              </option>
            ))}
          </select>
          <button className="new-conversation-button" onClick={newConversation}>
            Nouvelle Conversation
          </button>
          <div className="scroll-view">
            {conversations.length > 0 ? (
              conversations.map((id) => (
                <div
                  key={id}
                  className="conversation-card"
                  onClick={() => setActiveConversationId(id)}
                >
                  <p>Conversation {id}</p>
                </div>
              ))
            ) : (
              <p>{"Aucune conversation n'a été trouvée."}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="conversation-panel">
          <div className="header">
            <button onClick={() => setActiveConversationId(null)} className='messageDetail-back-button'>Retour</button>
            <h3>Conversation {activeConversationId}</h3>
            <button className="delete-button" onClick={deleteConversation}>
              Supprimer
            </button>
          </div>
          <div className="conversation-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-container ${
                  msg.userId === user.uid ? 'my-message' : 'other-message'
                }`}
              >
                <p className="username">{msg.username}</p>
                <p className="message-text">{msg.text}</p>
              </div>
            ))}
            <div ref={scrollViewRef}></div>
          </div>
          <div className="input-container">
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={handleInputChange}
            />
            <button className="send-button" onClick={sendMessage}>
              Envoyer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagingScreen;
