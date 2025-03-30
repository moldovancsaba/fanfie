import CameraComponent from './components/CameraComponent';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Fanfie</h1>
          <p className="text-gray-300">Take amazing photos with custom graphics</p>
        </header>
        
        <div className="max-w-4xl mx-auto">
          <CameraComponent />
        </div>
        
        <footer className="text-center mt-8 text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Fanfie. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
