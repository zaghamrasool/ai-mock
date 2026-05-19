import { useEffect, useState, useCallback, useRef } from 'react';
import Vapi from '@vapi-ai/web';

const vapi = new Vapi((import.meta as any).env.VITE_VAPI_PUBLIC_KEY || '');

export function useVapi() {
  const [callStatus, setCallStatus] = useState<'idle' | 'loading' | 'active' | 'error'>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [activeCallId, setActiveCallId] = useState<string | null>(null);

  useEffect(() => {
    vapi.on('call-start', () => {
      setCallStatus('active');
    });

    vapi.on('call-end', () => {
      setCallStatus('idle');
    });

    vapi.on('message', (message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        setTranscript((prev) => prev + '\n' + (message.role === 'assistant' ? 'Interviewer: ' : 'Candidate: ') + message.transcript);
      }
    });

    vapi.on('error', (error) => {
      console.error('Vapi Error:', error);
      setCallStatus('error');
    });

    return () => {
      vapi.removeAllListeners();
    };
  }, []);

  const startCall = useCallback(async (assistantId: string, overrides?: any) => {
    setCallStatus('loading');
    try {
      const call = await vapi.start(assistantId, overrides);
      setActiveCallId(call.id);
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallStatus('error');
    }
  }, []);

  const stopCall = useCallback(async () => {
    await vapi.stop();
    setCallStatus('idle');
  }, []);

  return {
    callStatus,
    startCall,
    stopCall,
    transcript,
    activeCallId
  };
}
