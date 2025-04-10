'use client'

import Camera from './components/Camera'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          Take & Upload Photo
        </h1>
        <Camera />
      </div>
    </main>
  )
}
