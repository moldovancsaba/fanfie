import CameraComponent from './components/CameraComponent';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Fanfie</h1>
        <CameraComponent />
      </div>
    </main>
  );
}
