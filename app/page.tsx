'use client'

import Camera from './components/Camera'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-0 bg-black overflow-hidden">
      <div className="w-full h-screen">
        <Camera />
      </div>
    </main>
  )
}
