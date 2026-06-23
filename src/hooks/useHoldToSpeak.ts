import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent, type MouseEvent } from 'react';
import { blobToWavBase64 } from '../lib/audioToWav';
import { TranscribeService } from '../services/transcribe.service';

function pickMimeType(): string | undefined {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

export function useHoldToSpeak(options: {
  disabled?: boolean;
  onTranscript: (text: string) => void | Promise<void>;
  onError?: (message: string) => void;
}) {
  const { disabled = false, onTranscript, onError } = options;
  const [holding, setHolding] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [supported, setSupported] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const holdActiveRef = useRef(false);

  useEffect(() => {
    setSupported(
      typeof window !== 'undefined'
        && Boolean(navigator.mediaDevices?.getUserMedia)
        && typeof MediaRecorder !== 'undefined',
    );
  }, []);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stopRecorder = useCallback(() => {
    const rec = recorderRef.current;
    recorderRef.current = null;
    if (rec && rec.state !== 'inactive') {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const finishRecording = useCallback(async () => {
    if (!holdActiveRef.current) return;
    holdActiveRef.current = false;
    setHolding(false);
    setProcessing(true);

    try {
      const chunks = chunksRef.current;
      chunksRef.current = [];
      if (!chunks.length) {
        throw new Error('未录到音频');
      }

      const mime = chunks[0].type || 'audio/webm';
      const blob = new Blob(chunks, { type: mime });
      const audioBase64 = await blobToWavBase64(blob);
      const { transcript } = await TranscribeService.transcribeAudioBase64(audioBase64);
      await onTranscript(transcript);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '语音识别失败';
      onError?.(msg);
    } finally {
      setProcessing(false);
      releaseStream();
    }
  }, [onError, onTranscript, releaseStream]);

  const startHold = useCallback(async () => {
    if (disabled || processing || holdActiveRef.current || !supported) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorderRef.current = recorder;
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        void finishRecording();
      };
      recorder.start(200);
      holdActiveRef.current = true;
      setHolding(true);
    } catch (e) {
      releaseStream();
      const msg = e instanceof Error ? e.message : '无法访问麦克风';
      onError?.(msg);
    }
  }, [disabled, finishRecording, onError, processing, releaseStream, supported]);

  const endHold = useCallback(() => {
    if (!holdActiveRef.current) return;
    stopRecorder();
  }, [stopRecorder]);

  useEffect(() => () => {
    holdActiveRef.current = false;
    stopRecorder();
    releaseStream();
  }, [releaseStream, stopRecorder]);

  const holdHandlers = useMemo(
    () => ({
      onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        void startHold();
      },
      onPointerUp: (e: PointerEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        endHold();
      },
      onPointerLeave: (_e: PointerEvent<HTMLButtonElement>) => {
        if (holdActiveRef.current) endHold();
      },
      onPointerCancel: () => endHold(),
      onContextMenu: (e: MouseEvent<HTMLButtonElement>) => e.preventDefault(),
    }),
    [endHold, startHold],
  );

  return { holding, processing, supported, holdHandlers };
}
