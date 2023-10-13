"use client"
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useAllUsersContext } from '@/context/AllUsersContext';
import { useAuthContext } from '@/context/AuthContext';
import { firebaseApp } from '@/firebase/config';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { getAuth } from 'firebase/auth';
import { get, getDatabase, onDisconnect, ref, set } from 'firebase/database';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user }: any = useAuthContext(); // Get user from AuthContext
  const { allUsers }: any = useAllUsersContext(); // Get all users from AllUsersContext

  const router = useRouter()

  const db = getDatabase(firebaseApp); // Get database instance
  const auth = getAuth(firebaseApp); // Get auth instance

  useEffect(() => {
    if (!user)
      router.push('/signin')
  })

  var isOfflineForDatabase = { // Offline presence
    state: 'offline',
    email: auth.currentUser?.email,
    lastseen: Date.now()
  };

  var isOnlineForDatabase = { // Online presence
    state: 'online',
    email: auth.currentUser?.email
  };

  useEffect(() => {
    if (!auth.currentUser)
      return
    // Update online presence
    get(ref(db, 'info/connected')).then(function (snapshot) {
      var userStatusDatabaseRef = ref(db, '/status/' + auth.currentUser?.uid);

      onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(function () {
        // Set status to online 
        set(userStatusDatabaseRef, isOnlineForDatabase);
      });
    });
  }, [])

  useEffect(() => {
    if (!auth.currentUser) {
      router.push('/signin')
      return
    }
    const { uid, displayName, email, photoURL }: any = auth.currentUser;
    // Check if user exists in database
    get(ref(db, 'users/' + user.uid))
      .then((snapshot) => {
        if (!snapshot.exists()) { // If user does not exist, create user
          set(ref(db, 'users/' + uid), {
            name: displayName,
            email: email,
            profile_picture: photoURL
          });
        }
      })
      .catch((error) => {
        console.log(error);
      })
  }, [])

  const handleLogout = () => {
    const auth = getAuth(firebaseApp);
    var userStatusDatabaseRef = ref(db, '/status/' + auth.currentUser?.uid);
    set(userStatusDatabaseRef, isOfflineForDatabase);
    auth.signOut()
      .then(() => {
        console.log('Signed out');
      })
      .catch((error) => {
        console.log(error);
      })
  }

  const { toast } = useToast()


  return (
    <div className='h-full'>
      <nav className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center'>
          <img src='https://pbs.twimg.com/profile_images/1536942284637229056/6Misxh3C_400x400.jpg' className='w-12 h-12 mr-4' />
          <h1 className='text-2xl font-semibold'>Dive Chat</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className='flex items-center hover:cursor-pointer'>
              <div className='w-12 h-12'>
                <img src={user?.photoURL} className='w-full h-full rounded-full' />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className='ml-2'>
              <h2 className='font-semibold'>{user?.displayName}</h2>
              <p className='text-sm'>online</p>
              <p className='text-sm text-gray-600'>{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Button onClick={(e) => handleLogout()}>Log out</Button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
      <div className='flex h-full'>
        <div className='flex flex-col min-w-fit border-r overflow-scroll'>
          {allUsers.map((user: any) => {
            return (
              <div key={user.email} className='max-w-xl flex items-center border-b py-4 px-4 hover:cursor-pointer hover:bg-slate-50 overflow-scroll lg:pr-16'
                onClick={() => {
                  router.push('/dashboard/' + user.uid)
                }}>
                <div className='mr-0 lg:mr-4 md:mr-4'>
                  <Avatar className='w-[40px] h-[40px]  md:w-[60px] md:h-[60px] lg:w-[60px] lg:h-[60px] relative'>
                    <AvatarImage className='rounded-full w-[40px] h-[40px]  md:w-[60px] md:h-[60px] lg:w-[60px] lg:h-[60px]' src={user.profile_picture} alt="Profile picture" />
                    {user.status == 'online' ?
                      <div className='w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0'></div> :
                      <></>
                    }
                  </Avatar>
                </div>
                <div className='hidden md:block lg:block'>
                  <h1 className='text-lg font-semibold'>{user.name}</h1>
                  <p>{user.status}</p>
                  <p>{user.email}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className='w-full h-full'>
          {children}
        </div>
      </div>
    </div>
  )
}
