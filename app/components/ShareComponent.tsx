'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import {
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaDownload,
  FaShareAlt,
  FaExternalLinkAlt
} from 'react-icons/fa';

interface ShareComponentProps {
  imageUrl: string;
  onClose: () => void;
  title?: string;
  description?: string;
}

interface SocialShareConfig {
  url: string;
  title: string;
  hashtags?: string[];
  via?: string;
}

export default function ShareComponent({ 
  imageUrl, 
  onClose,
  title = 'My Fanfie',
  description = 'Check out my Fanfie!'
}: ShareComponentProps) {
  const [loading, setLoading] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const shareConfig: SocialShareConfig = {
    url: typeof window !== 'undefined' ? window.location.href : '',
    title: title,
    hashtags: ['fanfie', 'photo', 'edit'],
    via: 'fanfieapp'
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      toast.success('Web Share API is not supported in your browser');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'fanfie.png', { type: 'image/png' });

      await navigator.share({
        title: shareConfig.title,
        text: description,
        url: shareConfig.url,
        files: [file]
      });

      toast.success('Shared successfully!');
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share. Please try another method.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'instagram') => {
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareConfig.title)}&url=${encodeURIComponent(shareConfig.url)}&hashtags=${shareConfig.hashtags?.join(',')}&via=${shareConfig.via}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareConfig.url)}`;
        break;
      case 'instagram':
        toast.success('Save the image and upload it to Instagram', {
          duration: 3000,
          icon: '📱'
        });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
    }
  };

  const handleDownload = async (format: 'png' | 'jpeg' = 'png') => {
    try {
      setLoading(true);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `fanfie-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error downloading:', error);
      toast.error('Failed to download image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Share Your Creation</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close share dialog"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 relative aspect-square w-full">
          <Image
            src={imageUrl}
            alt="Your edited photo"
            fill
            className="object-contain rounded-lg"
            priority
          />
        </div>

        <div className="space-y-4">
          {/* Native Share */}
          {canShare && (
            <button
              onClick={handleNativeShare}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              <FaShareAlt />
              <span>Share</span>
            </button>
          )}

          {/* Social Media Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSocialShare('twitter')}
              disabled={loading}
              className="flex flex-col items-center gap-1 p-3 bg-[#1DA1F2] text-white rounded hover:bg-opacity-90 transition-colors"
            >
              <FaTwitter className="text-xl" />
              <span className="text-xs">Twitter</span>
            </button>
            <button
              onClick={() => handleSocialShare('facebook')}
              disabled={loading}
              className="flex flex-col items-center gap-1 p-3 bg-[#4267B2] text-white rounded hover:bg-opacity-90 transition-colors"
            >
              <FaFacebook className="text-xl" />
              <span className="text-xs">Facebook</span>
            </button>
            <button
              onClick={() => handleSocialShare('instagram')}
              disabled={loading}
              className="flex flex-col items-center gap-1 p-3 bg-[#C13584] text-white rounded hover:bg-opacity-90 transition-colors"
            >
              <FaInstagram className="text-xl" />
              <span className="text-xs">Instagram</span>
            </button>
          </div>

          {/* Download Options */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDownload('png')}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
            >
              <FaDownload />
              <span>PNG</span>
            </button>
            <button
              onClick={() => handleDownload('jpeg')}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
            >
              <FaDownload />
              <span>JPEG</span>
            </button>
          </div>

          {/* Copy Link */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Link copied to clipboard!');
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
          >
            <FaExternalLinkAlt />
            <span>Copy Link</span>
          </button>
        </div>
      </div>
    </div>
  );
}
