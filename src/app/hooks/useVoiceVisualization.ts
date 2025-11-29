import { useEffect, useRef, useState, useCallback } from 'react';

export interface VoiceVisualizationData {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  volume: number;
}

export function useVoiceVisualization(isActive: boolean) {
  const [visualizationData, setVisualizationData] = useState<VoiceVisualizationData>({
    frequencyData: new Uint8Array(128),
    timeDomainData: new Uint8Array(128),
    volume: 0,
  });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startVisualization = useCallback(async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('getUserMedia not supported in this browser');
        return;
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      microphoneStreamRef.current = stream;

      // Create audio context and analyser
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256; // 128 frequency bins
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Start animation loop
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      const timeDomainData = new Uint8Array(analyser.frequencyBinCount);

      const updateVisualization = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(frequencyData);
        analyserRef.current.getByteTimeDomainData(timeDomainData);

        // Calculate volume (RMS)
        let sum = 0;
        for (let i = 0; i < timeDomainData.length; i++) {
          const normalized = (timeDomainData[i] - 128) / 128;
          sum += normalized * normalized;
        }
        const volume = Math.sqrt(sum / timeDomainData.length);

        setVisualizationData({
          frequencyData: new Uint8Array(frequencyData),
          timeDomainData: new Uint8Array(timeDomainData),
          volume,
        });

        animationFrameRef.current = requestAnimationFrame(updateVisualization);
      };

      updateVisualization();
    } catch (error) {
      console.warn('Voice visualization not available:', error);
      // Silently fail - visualization is optional
      // User may have denied mic permissions or be on an unsupported browser
    }
  }, []);

  const stopVisualization = useCallback(() => {
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop microphone stream
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Reset visualization data
    setVisualizationData({
      frequencyData: new Uint8Array(128),
      timeDomainData: new Uint8Array(128),
      volume: 0,
    });
  }, []);

  useEffect(() => {
    if (isActive) {
      startVisualization();
    } else {
      stopVisualization();
    }

    return () => {
      stopVisualization();
    };
  }, [isActive, startVisualization, stopVisualization]);

  return visualizationData;
}

