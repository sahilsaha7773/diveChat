"use client"
import React from 'react';
import {
    onAuthStateChanged,
    getAuth,
} from 'firebase/auth';
import { firebaseApp } from '@/firebase/config';

const auth = getAuth(firebaseApp);

export const AuthContext = React.createContext({});

export const useAuthContext = () => React.useContext(AuthContext);

export const AuthContextProvider = ({
    children,
}) => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user }}>
            {loading ?
                <div className='h-full w-full flex flex-col justify-center items-center'>
                    <div className="rounded-lg py-10 px-[100px] flex flex-col justify-center items-center">
                        <img src='https://pbs.twimg.com/profile_images/1536942284637229056/6Misxh3C_400x400.jpg' className='w-24 h-24 mb-4' />
                        <h1 className='text-2xl font-bold'>Dive Chat</h1>
                        <p className='text-lg text-center'>P2P (one on one) chat app</p>
                        <p className="
        mt-5 text-sm text-gray-400 flex items-center
        ">Loading...</p>
                    </div>
                </div> : children}
        </AuthContext.Provider>
    );
};