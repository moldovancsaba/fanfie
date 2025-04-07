'use client';

import React, { useState, useRef, useEffect } from 'react';

const SimpleCameraComponent: React.FC = () => {
  const [status, setStatus] = useState<'requesting' | 'granted' | 'denied'>('requesting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoDimensions, setVideoDimensions] = useState<{width: number, height: number} | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if navigator.mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('denied');
      setErrorMessage('Camera access not supported in this browser.');
      return;
    }

    let stream: MediaStream | null = null;

    console.log('Initializing camera and requesting permissions...');
    
    // Request camera access
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((mediaStream) => {
        console.log('Camera permission granted, setting up video stream');
        // Set the stream as the video source
        stream = mediaStream;
        
        if (videoRef.current) {
          console.log('Video element found, setting srcObject');
          videoRef.current.srcObject = stream;
          
          // When video metadata is loaded, log dimensions
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, readyState:', videoRef.current?.readyState);
            
            // Log video dimensions for debugging
            if (videoRef.current) {
              const width = videoRef.current.videoWidth;
              const height = videoRef.current.videoHeight;
              console.log(`Video dimensions: ${width}x${height}`);
              setVideoDimensions({ width, height });
            }
          };
          
          // Explicitly call play with error handling
          try {
            const playPromise = videoRef.current.play();
            
            // Modern browsers return a promise from play()
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log('Video playback started successfully');
                  setIsVideoPlaying(true);
                  setStatus('granted');
                })
                .catch(error => {
                  console.error('Error playing video:', error);
                  // Still mark as granted since we have the stream, even if autoplay failed
                  setStatus('granted');
                });
            } else {
              // Older browsers don't return a promise
              console.log('Video play() called (no promise returned)');
              setStatus('granted');
            }
          } catch (playError) {
            console.error('Exception while calling play():', playError);
            // Still set to granted since we have permission, even if play failed
            setStatus('granted');
          }
        } else {
          console.error('Video element reference is null');
          setStatus('granted');
        }
      })
      .catch((error) => {
        console.error('Camera access denied:', error);
        setStatus('denied');
        
        // Handle different types of errors
        if (error.name === 'NotAllowedError')
