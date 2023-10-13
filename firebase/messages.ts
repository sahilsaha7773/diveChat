import { child, get, getDatabase, push, ref, set, update } from "firebase/database"
import { firebaseApp } from "./config"

// Get a reference to the coversation in the database.
const getMessagesRef = (senderId: string, receiverId: string) => {
  const db = getDatabase(firebaseApp)
  const conversationPath = senderId > receiverId ? `${senderId}+${receiverId}` : `${receiverId}+${senderId}`
  const messagesRef = ref(db, `messages/${conversationPath}`)
  return messagesRef
}

// Add a new message entry to the Firebase database.
const sendMessage = async (senderId: string, receiverId: string, message: string) => {
  const db = getDatabase(firebaseApp)
  const conversationPath = senderId > receiverId ? `${senderId}+${receiverId}` : `${receiverId}+${senderId}`
  const messageRef = ref(db, `messages/${conversationPath}`)

  // Get online status of receiver
  const onlineStatusSnapshot = await get(ref(db, 'status/' + receiverId))
  const onlineStatus = onlineStatusSnapshot.val().state
  console.log('onlineStatus', onlineStatus)

  // Send message
  const token = get(ref(db, 'tokens/' + receiverId)).then((snapshot) => {
    if (snapshot.exists()) {
      return snapshot.val()
    }
    return ''
  })
  const payload = {
    notification: {
      title: 'New message',
      body: message
    },
    token
  }

  const messageData = {
    senderId,
    receiverId,
    message,
    read: false,
    timestamp: Date.now()
  }

  const updates: any = {}
  const newMessageKey = push(child(messageRef, 'messages')).key
  updates[`messages/${conversationPath}/` + newMessageKey] = messageData;
  update(ref(db), updates);
}

export { sendMessage, getMessagesRef }