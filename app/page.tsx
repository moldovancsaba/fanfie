'use client'

import Camera from './components/Camera'

export default function Home() {
  return (
    <main className="fixed inset-0 w-screen h-screen flex items-center justify-center p-0 m-0 bg-black overflow-hidden">
      <Camera />
    </main>
  )
}
