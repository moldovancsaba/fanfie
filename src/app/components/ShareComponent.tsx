'use client';

import { useState } from 'react';
import { 
  FaTwitter, 
  FaFacebook, 
  FaInstagram, 
  FaLink, 
  FaDownload,
  FaShare
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface ShareComponentProps {
  imageUrl: string;
  title?: string;
  description?: string;
  fallbackUrl?: string;
}

type ShareOption = 'twitter' | 'facebook' | 'instagram' | 'copy' | 'download';
type ExportFormat = 'png' | 'jpeg';

interface ShareState {
  isSharing: boolean;
  isExporting: boolean;
  shareError: string | null;
  exportError: string | null;
  copied: boolean;
}

const ShareComponent: React.FC<ShareComponentProps> = ({
  imageUrl,
  title = 'Check out my creation!',
  description = 'Created with Fanfie App',
  fallbackUrl = window.location.href,
}) => {
  const [state, setState] = useState<ShareState>({
    isSharing: false,
    isExporting: false,
    shareError: null,
    exportError: null,
    copied: false,
  });

  const isWebShareSupported = typeof navigator !== 'undefined' && 'share' in navigator;

  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  // Handle native web share
  const handleWebShare = async () => {
    if (!isWebShareSupported) {
      setState(prev => ({ ...prev, shareError: 'Web Share API is not supported in your browser' }));
      toast.error('Sharing not supported in your browser');
      return;
    }

    setState(prev => ({ ...prev, isSharing: true, shareError: null }));

    try {
      // Create a fetch request to get the image as a blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a File object from the blob
      const file = new File([blob], 'fanfie-image.png', { type: 'image/png' });

      // Share the image and text
      await navigator.share({
        title,
        text: description,
        url: fallbackUrl,
        files: 'files' in navigator.share ? [file] : undefined,
      });
      
      toast.success('Shared successfully!');
    } catch (error) {
      console.error('Error sharing:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to share';
      setState(prev => ({ ...prev, shareError: errorMessage }));
      toast.error(`Failed to share: ${errorMessage}`);
    } finally {
      setState(prev => ({ ...prev, isSharing: false }));
    }
  };

  // Handle social sharing options with platform-specific logic
  const handleSocialShare = (platform: ShareOption) => {
    setState(prev => ({ ...prev, isSharing: true, shareError: null }));

    try {
      let shareUrl = '';

      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(description)}&url=${encodeURIComponent(fallbackUrl)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fallbackUrl)}&quote=${encodeURIComponent(description)}`;
          break;
        case 'instagram':
          // Instagram doesn't have a web share API, show instruction toast
          toast.info('Save the image and upload it to Instagram');
          setState(prev => ({ ...prev, isSharing: false }));
          return;
        case 'copy':
          handleCopyLink();
          return;
        case 'download':
          handleExport('png');
          return;
        default:
          throw new Error('Unknown sharing platform');
      }

      // Open share URL in a new window
      if (shareUrl && isBrowser) {
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
        toast.success(`Opening ${platform} sharing...`);
      }
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to share';
      setState(prev => ({ ...prev, shareError: errorMessage }));
      toast.error(`Failed to share: ${errorMessage}`);
    } finally {
      setState(prev => ({ ...prev, isSharing: false }));
    }
  };

  // Handle copying link to clipboard
  const handleCopyLink = async () => {
    setState(prev => ({ ...prev, isSharing: true, shareError: null }));

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fallbackUrl);
        setState(prev => ({ ...prev, copied: true }));
        toast.success('Link copied to clipboard!');
        
        // Reset copied state after 2 seconds
        setTimeout(() => {
          setState(prev => ({ ...prev, copied: false }));
        }, 2000);
      } else {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = fallbackUrl;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setState(prev => ({ ...prev, copied: true }));
          toast.success('Link copied to clipboard!');
          
          // Reset copied state after 2 seconds
          setTimeout(() => {
            setState(prev => ({ ...prev, copied: false }));
          }, 2000);
        } else {
          throw new Error('Failed to copy link');
        }
      }
    } catch (error) {
      console.error('Error copying link:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to copy link';
      setState(prev => ({ ...prev, shareError: errorMessage }));
      toast.error(`Failed to copy: ${errorMessage}`);
    } finally {
      setState(prev => ({ ...prev, isSharing: false }));
    }
  };

  // Handle exporting image in different formats
  const handleExport = async (format: ExportFormat) => {
    setState(prev => ({ ...prev, isExporting: true, exportError: null }));

    try {
      // Create a link element to download the image
      const link = document.createElement('a');
      
      // If format is jpeg and imageUrl is PNG, convert it
      let downloadUrl = imageUrl;
      const fileExtension = format.toLowerCase();
      
      if (format === 'jpeg' && imageUrl.startsWith('data:image/png')) {
        // Convert PNG to JPEG
        const canvas = document.createElement('canvas');
        const img = document.createElement('img');
        
        // Set crossOrigin to anonymous to avoid tainted canvas issues
        img.crossOrigin = 'anonymous';
        
        // Create a promise to handle image loading
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });
        
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Fill with white background for JPEGs (since they don't support transparency)
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          downloadUrl = canvas.toDataURL('image/jpeg', 0.9);
        } else {
          throw new Error('Could not get canvas context for conversion');
        }
      }
      
      // Set the download link attributes
      link.href = downloadUrl;
      link.download = `fanfie-image.${fileExtension}`;
      link.target = '_blank';
      
      // Append the link to the document body, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to export as ${format}`;
      setState(prev => ({ ...prev, exportError: errorMessage }));
      toast.error(`Export failed: ${errorMessage}`);
    } finally {
      setState(prev => ({ ...prev, isExporting: false }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-center mb-4">Share Your Creation</h2>
      
      {/* Image Preview */}
      <div className="mb-4 relative aspect-square w-full overflow-hidden rounded-md bg-gray-100">
        <img 
          src={imageUrl} 
          alt="Your creation" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Web Share API Button (Primary sharing option) */}
      {isWebShareSupported && (
        <button
          onClick={handleWebShare}
          disabled={state.isSharing}
          className="w-full flex items-center justify-center py-2 px-4 mb-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:bg-blue-400"
        >
          {state.isSharing ? (
            <span className="animate-pulse">Sharing...</span>
          ) : (
            <>
              <FaShare className="mr-2" /> Share
            </>
          )}
        </button>
      )}
      
      {/* Social Media Sharing Options */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={() => handleSocialShare('twitter')}
          disabled={state.isSharing}
          className="flex flex-col items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
        >
          <FaTwitter className="text-[#1DA1F2] text-xl mb-1" />
          <span className="text-xs">Twitter</span>
        </button>
        
        <button
          onClick={() => handleSocialShare('facebook')}
          disabled={state.isSharing}
          className="flex flex-col items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
        >
          <FaFacebook className="text-[#4267B2] text-xl mb-1" />
          <span className="text-xs">Facebook</span>
        </button>
        
        <button
          onClick={() => handleSocialShare('instagram')}
          disabled={state.isSharing}
          className="flex flex-col items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
        >
          <FaInstagram className="text-[#C13584] text-xl mb-1" />
          <span className="text-xs">Instagram</span>
        </button>
      </div>
      
      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        disabled={state.isSharing}
        className="w-full flex items-center justify-center py-2 px-4 mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors disabled:opacity-50"
      >
        {state.copied ? (
          <span className="text-green-600">Link Copied!</span>
        ) : (
          <>
            <FaLink className="mr-2" /> Copy Link
          </>
        )}
      </button>
      
      {/* Export Options */}
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Export as:</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExport('png')}
            disabled={state.isExporting}
            className="flex-1 flex items-center justify-center py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {state.isExporting ? (
              <span className="animate-pulse">Exporting...</span>
            ) : (
              <>
                <FaDownload className="mr-2" /> PNG
              </>
            )}
          </button>
          
          <button
            onClick={() => handleExport('jpeg')}
            disabled={state.isExporting}
            className="flex-1 flex items-center justify-center py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {state.isExporting ? (
              <span className="animate-pulse">Exporting...</span>
            ) : (
              <>
                <FaDownload className="mr-2" /> JPEG
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Error Messages */}
      {state.shareError && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 text-sm rounded-md">
          {state.shareError}
        </div>
      )}
      
      {state.exportError && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 text-sm rounded-md">
          {state.exportError}
        </div>
      )}
    </div>
  );
};

export default ShareComponent;

