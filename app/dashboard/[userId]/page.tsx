"use client"
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAllUsersContext } from '@/context/AllUsersContext';
import { firebaseApp } from '@/firebase/config';
import { getMessagesRef, sendMessage } from '@/firebase/messages';
import { getAuth } from 'firebase/auth';
import { child, off, onValue, update } from 'firebase/database';
import { Check, CheckCheck, SendIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useRef } from 'react'

export default function Chat() {
  const { userId }: { userId: string } = useParams();
  const { allUsers }: any = useAllUsersContext();
  const receiver = allUsers.filter((user: any) => user.uid == userId)[0];

  const auth = getAuth(firebaseApp);

  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState<any[]>([]);

  const messagesEndRef = useRef<null | HTMLDivElement>(null)


  useEffect(() => {
    onValue(getMessagesRef(auth.currentUser?.uid!, userId), async (snapshot) => {
      if (snapshot.exists()) {
        const messages: any[] = [];
        snapshot.forEach((childSnapshot) => {
          if (!childSnapshot.val().read && childSnapshot.val().receiverId == auth.currentUser?.uid) {
            update(child(getMessagesRef(auth.currentUser?.uid!, userId), childSnapshot.key), {
              read: true
            })
              .then(() => {
                console.log('Updating read status!')
                messages.push({
                  ...childSnapshot.val(),
                  id: childSnapshot.key
                })
              })
              .finally(() => {
                setMessages(messages);
              })
          }
          else {
            messages.push({
              ...childSnapshot.val(),
              id: childSnapshot.key
            })
            setMessages(messages);
          }

        })
        console.log(messages);
      }
    })
    return () => {
      off(getMessagesRef(auth.currentUser?.uid!, userId));
    }
  }, [auth.currentUser?.uid, userId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(() => {
    scrollToBottom()
  })
  return (
    <div className='h-screen w-full'>
      <nav className='flex flex-row items-center justify-between p-5 border-b'>
        <div className='flex flex-row items-center'>
          <Avatar className='w-[48px] h-[48px] relative overflow-visible'>
            <AvatarImage className='rounded-full' width={"48px"} src={receiver?.profile_picture} alt="Profile picture" />
            {receiver?.status == 'online' ?
              <div className='w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0'></div> :
              <></>
            }
          </Avatar>
          <div className='ml-2'>
            <h2 className='font-semibold'>{receiver?.name}</h2>
            <p className='text-sm'>{receiver?.status}</p>
          </div>
        </div>
      </nav>
      <div className='flex flex-col h-[65%] overflow-scroll w-full p-5 bg-gray-100'>
        {
          messages.map((index: number, message: any) => {
            return (
              <div key={index} className={message.senderId == auth.currentUser?.uid ? "p-4 shadow-xl rounded-lg m-4 w-fit ml-auto max-w-md bg-white" : "p-4 shadow-xl rounded-lg my-2 w-fit max-w-md bg-white"}>
                {message.message}
                <div className='flex text-xs justify-end'>
                  <span className='text-xs text-gray-500 mr-2'>
                    {(new Date(message.timestamp)).toLocaleString()}
                  </span>
                  {message.senderId == auth.currentUser?.uid &&
                    (message.read ? <CheckCheck className='w-4 h-4 text-blue-500' /> :
                      (receiver?.status === 'online' || receiver?.lastseen >= message.timestamp) ?
                        <CheckCheck className='w-4 h-4' /> : <Check className='w-4 h-4' />)}
                </div>
              </div>
            )
          })
        }
        <div ref={messagesEndRef} />
      </div>
      <div className='p-4 border-t flex items-center'>
        <Textarea placeholder="Type your message here"
          value={message}
          onChange={
            (e) => setMessage(e.target.value)
          } />
        <Button
          className='ml-4'
          onClick={(e) => {
            sendMessage(auth.currentUser?.uid!, userId, message);
            setMessage('');
          }}><SendIcon className='' /></Button>
      </div>
    </div>
  )
}
