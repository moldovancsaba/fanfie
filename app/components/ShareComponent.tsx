'use client';

interface ShareComponentProps {
  imageUrl: string;
  onClose: () => void;
}

export default function ShareComponent({ imageUrl, onClose }: ShareComponentProps) {
  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `fanfie-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareImage = async () => {
    if (navigator.share) {
      try {
        // Convert base64 to blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'fanfie.png', { type: 'image/png' });

        await navigator.share({
          files: [file],
          title: 'My Fanfie',
          text: 'Check out my Fanfie!',
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      downloadImage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Share your Fanfie</h2>
        <div className="mb-4">
          <img src={imageUrl} alt="Your Fanfie" className="w-full rounded-lg" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={shareImage}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Share
          </button>
          <button
            onClick={downloadImage}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Download
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            New Photo
          </button>
        </div>
      </div>
    </div>
  );
}
