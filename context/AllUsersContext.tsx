"use client"
import { firebaseApp } from '@/firebase/config';
import { get, onValue, ref, getDatabase } from '@firebase/database';
import React from 'react';
import { useAuthContext } from './AuthContext';
import { off } from 'firebase/database';

export const AllUsersContext = React.createContext({});
export const useAllUsersContext = () => React.useContext(AllUsersContext);

export const AllUsersContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [allUsers, setAllUsers] = React.useState<any[]>([]);
  const { user }: any = useAuthContext();
  const [loading, setLoading] = React.useState(true);
  const db = getDatabase(firebaseApp);
  const uid = user?.uid
  const getAllUsers = () => {
    if (!user) {
      setAllUsers([]);
      return
    }
    get(ref(db, 'users/'))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const users: any[] = [];
          snapshot.forEach((childSnapshot) => {
            if (childSnapshot.key != uid) {
              users.push({
                ...childSnapshot.val(),
                uid: childSnapshot.key,
                status: "Offline",
                lastseen: 0
              })
            }
          })
          console.log(users);
          return users
        }
        else {
          return []
        }
      })
      .then((users) => {
        onValue(ref(db, 'status/'), (snapshot) => {
          var finalUsers: any[] = [];
          snapshot.forEach((childSnapshot) => {
            users.forEach((user) => {
              if (user.email == childSnapshot.val().email) {
                user.status = childSnapshot.val().state;
                user.lastseen = childSnapshot.val().lastseen;
              }
              if (finalUsers.filter((finalUser) => finalUser.email == user.email).length == 0)
                finalUsers.push(user)
            })
          })
          setAllUsers(finalUsers);
        })
      })
      .catch((error) => {
        console.log(error);
      })

  }

  React.useEffect(() => {
    getAllUsers();
    setLoading(false);
    return () => {
      off(ref(db, 'users/'));
    }
  }, [user])

  return (
    <AllUsersContext.Provider value={{ allUsers }}>
      {loading ?
        <div className='h-full w-full flex flex-col justify-center items-center'>
          <div className="rounded-lg py-10 px-[100px] flex flex-col justify-center items-center">
            <img src='https://pbs.twimg.com/profile_images/1536942284637229056/6Misxh3C_400x400.jpg' className='w-24 h-24 mb-4' />
            <h1 className='text-2xl font-bold'>Dive Chat</h1>
            <p className='text-lg text-center'>P2P (one on one) chat app</p>
            <p className="
mt-5 text-sm text-gray-400 flex items-center
">Loading...</p>
          </div></div> : children}
    </AllUsersContext.Provider>
  );
}