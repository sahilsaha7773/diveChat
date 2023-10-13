"use client"
import { messaging, requestForToken } from '@/firebase/config'
import { getToken } from 'firebase/messaging';
import React from 'react'

export default function page() {
  return (
    <div className='h-full flex flex-col justify-center items-center w-full'>
      Select a user to chat
    </div>
  )
}
