"use client"
import { Button } from "@/components/ui/button";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { firebaseApp } from "@/firebase/config";
import { useAuthContext } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { SiFirebase } from "react-icons/si";

export default function SignIn() {
  const { user }: any = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (user)
      router.push('/dashboard')
  }, [user])

  const auth = getAuth(firebaseApp);

  const handleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      })
  }
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="shadow-xl rounded-lg py-10 px-[100px] flex flex-col justify-center items-center">
        <img src='https://pbs.twimg.com/profile_images/1536942284637229056/6Misxh3C_400x400.jpg' className='w-24 h-24 mb-4' />
        <h1 className='text-2xl font-bold'>Dive Chat</h1>
        <p className='text-lg text-center'>P2P (one on one, not group) chat app</p>
        <Button className="mt-5" variant={"outline"} onClick={(e) => handleSignIn()}>
          <FcGoogle className='mr-2 w-6 h-6' />
          Sign in with Google</Button>
        <p className="
        mt-5 text-sm text-gray-400 flex items-center 
        ">Powered by <SiFirebase className='w-6 h-6 ml-2' />  </p>
      </div>
    </div>
  )
}
