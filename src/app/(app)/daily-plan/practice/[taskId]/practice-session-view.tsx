'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type {
  ContentItem,
  PracticeExerciseClient,
  PracticeSubmissionResult,
} from '@/modules/daily-plan/types';
import { submitPracticeAction } from '@/modules/daily-plan/actions';
import { getAITutorExplanationAction } from '@/modules/ai-tutor/actions';
import type { AITutorExplanation } from '@/modules/ai-tutor/types';
import { saveWordAction } from '@/modules/vocabulary/actions';
import {
  submitWritingPracticeAction,
  submitSpeakingPracticeAction,
} from '@/modules/skills/actions';
import type {
  WritingEvaluationResult,
  SpeakingEvaluationResult,
} from '@/modules/skills/types';

function countWords(str: string): number {
  if (!str || typeof str !== 'string') return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function writeWavString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeWavString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeWavString(view, 8, 'WAVE');

  // FMT sub-chunk
  writeWavString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  // Data sub-chunk
  writeWavString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Write 16-bit PCM audio samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function formatRecordingTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

interface ListeningAudioPlayerProps {
  audioUrl: string;
  title?: string;
  showSpeedControls?: boolean;
}

function ListeningAudioPlayer({
  audioUrl,
  title,
  showSpeedControls = true,
}: ListeningAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🎧</span>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-cyan)' }}>
            {title || 'Audio luyện nghe (Hội thoại tự nhiên)'}
          </span>
        </div>

        {showSpeedControls && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tốc độ:</span>
            {[0.8, 1.0, 1.2].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => changeSpeed(rate)}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: playbackRate === rate ? 'var(--accent-cyan)' : 'var(--border-color)',
                  background: playbackRate === rate ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: playbackRate === rate ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {rate}x
              </button>
            ))}
          </div>
        )}
      </div>

      <audio
        ref={audioRef}
        controls
        preload="metadata"
        src={audioUrl}
        style={{ width: '100%', height: '42px', outline: 'none' }}
      >
        Trình duyệt của bạn không hỗ trợ phát thẻ audio HTML5.
      </audio>
    </div>
  );
}

interface PracticeSessionViewProps {
  task: {
    id: string;
    title: string;
    skill?: string | null;
    estimated_minutes: number;
    status: string;
  };
  contentItem: ContentItem;
  exercises: PracticeExerciseClient[];
}

type SessionStep = 'study' | 'practice' | 'result';

export function PracticeSessionView({
  task,
  contentItem,
  exercises,
}: PracticeSessionViewProps) {
  const currentSkill = (contentItem.skill || task.skill || 'reading').toLowerCase();
  const isWriting = currentSkill === 'writing';
  const isSpeaking = currentSkill === 'speaking';

  // Normalize Reading content
  const passageTitle =
    contentItem.body?.passage?.title ||
    contentItem.body?.passage_title ||
    contentItem.title;

  const passageParagraphs: string[] =
    contentItem.body?.passage?.paragraphs ||
    (typeof contentItem.body?.passage_text === 'string'
      ? contentItem.body.passage_text.split(/\n\n+/).filter(Boolean)
      : []);

  const isReading =
    currentSkill === 'reading' ||
    Boolean(contentItem.body?.passage) ||
    Boolean(contentItem.body?.passage_text) ||
    passageParagraphs.length > 0;

  const isListening =
    currentSkill === 'listening' || Boolean(contentItem.body?.audio_url);

  const readingTips: string[] =
    contentItem.body?.reading_tips || contentItem.body?.tips || [];

  const readingVocab: Array<{
    word: string;
    meaning_vi: string;
    part_of_speech?: string;
    ipa?: string;
    example?: string;
    note?: string;
  }> = contentItem.body?.vocabulary_highlights || contentItem.body?.words || [];

  const activeVocab =
    readingVocab.length > 0 ? readingVocab : (contentItem.body?.words || []);

  const writingRequirements: string[] =
    contentItem.body?.prompt_requirements || [
      '1. Tên, nghề nghiệp/chuyên ngành và nơi bạn đang sinh sống.',
      '2. Thói quen hàng ngày và sở thích trong thời gian rảnh rỗi.',
      '3. Lý do bạn muốn cải thiện tiếng Anh và mong muốn khi học cùng nhóm.',
    ];
  const usefulExpressions: string[] =
    contentItem.body?.useful_expressions || [];
  const templateGuide: {
    greeting?: string;
    body_paragraphs?: string;
    sign_off?: string;
  } | undefined = contentItem.body?.email_template_guide;

  // Normalize Speaking content
  const speakingCues: string[] =
    contentItem.body?.suggested_cue_points ||
    contentItem.body?.prompt_requirements || [
      'Greeting and full name (Chào hỏi và họ tên).',
      'Where you live and current occupation (Nơi ở và công việc hiện tại).',
      'Your typical morning or evening routine (Thói quen buổi sáng hoặc buổi tối).',
      'One or two favorite hobbies with reasons (Một hoặc hai sở thích kèm lý do).',
    ];
  const conversationalTips: string[] =
    contentItem.body?.conversational_tips || [];

  const [step, setStep] = useState<SessionStep>('study');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submissionResult, setSubmissionResult] = useState<PracticeSubmissionResult | null>(null);
  const [secondsSpent, setSecondsSpent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [savedWords, setSavedWords] = useState<Record<string, boolean>>({});

  // Reading reference toggle
  const [showPassageRef, setShowPassageRef] = useState<boolean>(true);

  // Writing state
  const [writingText, setWritingText] = useState<string>('');
  const [writingResult, setWritingResult] = useState<WritingEvaluationResult | null>(null);
  const [writingScore, setWritingScore] = useState<number>(0);

  // Speaking Interactive Voice Recording state
  type RecordingState = 'idle' | 'recording' | 'recorded';
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioSize, setRecordedAudioSize] = useState<number>(0);
  const [isSilentRecording, setIsSilentRecording] = useState<boolean>(false);
  const [liveVolume, setLiveVolume] = useState<number>(0);
  const [sttLanguage, setSttLanguage] = useState<'en-US' | 'vi-VN'>('en-US');
  const [sttWarning, setSttWarning] = useState<string | null>(null);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(false);
  const [isPlayingNativeSpeech, setIsPlayingNativeSpeech] = useState<boolean>(false);

  // Microphone device enumeration & live testing
  const [availableMics, setAvailableMics] = useState<Array<{ deviceId: string; label: string }>>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [isTestingMic, setIsTestingMic] = useState<boolean>(false);

  const isRecordingActiveRef = useRef<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<{ stop: () => void } | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Parallel MediaRecorder redundancy
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaRecorderChunksRef = useRef<Blob[]>([]);

  // Mic test refs
  const micTestStreamRef = useRef<MediaStream | null>(null);
  const micTestAudioCtxRef = useRef<AudioContext | null>(null);
  const micTestAnimFrameRef = useRef<number | null>(null);

  const [speakingTranscript, setSpeakingTranscript] = useState<string>('');
  const [speakingResult, setSpeakingResult] = useState<SpeakingEvaluationResult | null>(null);
  const [speakingScore, setSpeakingScore] = useState<number>(0);

  const refreshAudioDevices = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter((d) => d.kind === 'audioinput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${index + 1}`,
        }));
      setAvailableMics(audioInputs);
      if (audioInputs.length > 0) {
        setSelectedMicId((prev) => {
          if (prev && audioInputs.some((d) => d.deviceId === prev)) return prev;
          const saved = typeof window !== 'undefined' ? localStorage.getItem('selected_audio_mic_id') : null;
          const found = audioInputs.find((d) => d.deviceId === saved);
          return found ? found.deviceId : audioInputs[0].deviceId;
        });
      }
    } catch (e) {
      console.warn('Enumerate audio devices notice:', e);
    }
  };

  const stopMicTest = () => {
    if (micTestAnimFrameRef.current) {
      cancelAnimationFrame(micTestAnimFrameRef.current);
      micTestAnimFrameRef.current = null;
    }
    if (micTestAudioCtxRef.current && micTestAudioCtxRef.current.state !== 'closed') {
      try {
        micTestAudioCtxRef.current.close();
      } catch {}
      micTestAudioCtxRef.current = null;
    }
    if (micTestStreamRef.current) {
      micTestStreamRef.current.getTracks().forEach((track) => track.stop());
      micTestStreamRef.current = null;
    }
    setIsTestingMic(false);
    setLiveVolume(0);
  };

  const startMicTest = async (targetDeviceId?: string) => {
    stopMicTest();
    setMicErrorMessage(null);

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ truy cập micro.');
      }

      const micId = targetDeviceId || selectedMicId;
      const constraints: MediaStreamConstraints = {
        audio: micId
          ? {
              deviceId: { ideal: micId },
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: true,
            }
          : {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: true,
            },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      micTestStreamRef.current = stream;

      // Permission granted unlocks device labels
      await refreshAudioDevices();

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      micTestAudioCtxRef.current = audioCtx;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);

      setIsTestingMic(true);

      const loop = () => {
        if (!analyser || !micTestStreamRef.current) return;
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += data[i];
        }
        const avg = sum / data.length;
        const level = Math.min(100, Math.round((avg / 96) * 100));
        setLiveVolume(level);
        micTestAnimFrameRef.current = requestAnimationFrame(loop);
      };
      micTestAnimFrameRef.current = requestAnimationFrame(loop);
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : null;
      setMicErrorMessage(
        `Không thể kiểm tra micro: ${errorObj?.message || 'Vui lòng cấp quyền truy cập micro trong cài đặt trình duyệt.'}`
      );
      stopMicTest();
    }
  };

  const handleSelectMic = (deviceId: string) => {
    setSelectedMicId(deviceId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_audio_mic_id', deviceId);
    }
    if (isTestingMic) {
      startMicTest(deviceId);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSTT = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      setIsSpeechSupported(hasSTT);
      refreshAudioDevices();

      if (navigator.mediaDevices?.addEventListener) {
        navigator.mediaDevices.addEventListener('devicechange', refreshAudioDevices);
      }
    }
    return () => {
      isRecordingActiveRef.current = false;
      stopMicTest();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.removeEventListener) {
        navigator.mediaDevices.removeEventListener('devicechange', refreshAudioDevices);
      }
    };
  }, []);

  const handleStartRecording = async () => {
    stopMicTest();
    setMicErrorMessage(null);
    setSttWarning(null);
    setIsSilentRecording(false);
    setLiveVolume(0);

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ thu âm qua MediaDevices.');
      }

      // 1. Request microphone with selected device and raw unsuppressed audio
      const constraints: MediaStreamConstraints = {
        audio: selectedMicId
          ? {
              deviceId: { ideal: selectedMicId },
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: true,
            }
          : {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: true,
            },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Refresh devices to make sure labels are populated
      refreshAudioDevices();

      // 2. Initialize Web Audio Context for direct uncompressed 16-bit WAV encoding + Real-time volume meter
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      analyserRef.current = analyser;

      // Script processor for capturing PCM audio samples
      const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;
      pcmChunksRef.current = [];

      isRecordingActiveRef.current = true;

      scriptProcessor.onaudioprocess = (e) => {
        if (!isRecordingActiveRef.current) return;
        const channelData = e.inputBuffer.getChannelData(0);
        pcmChunksRef.current.push(new Float32Array(channelData));
      };

      source.connect(analyser);
      analyser.connect(scriptProcessor);

      // CRITICAL FIX: Connect scriptProcessor to a zero-gain node before destination.
      // This keeps the processor alive without blasting mic audio into speakers/headphones,
      // preventing Chrome's echo cancellation from silencing the microphone!
      const silentGain = audioCtx.createGain();
      silentGain.gain.value = 0;
      scriptProcessor.connect(silentGain);
      silentGain.connect(audioCtx.destination);

      // 3. Parallel MediaRecorder capture as redundancy
      mediaRecorderChunksRef.current = [];
      if (typeof MediaRecorder !== 'undefined') {
        try {
          const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : '';
          const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
          mr.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              mediaRecorderChunksRef.current.push(e.data);
            }
          };
          mr.start(100);
          mediaRecorderRef.current = mr;
        } catch (mrErr) {
          console.warn('Parallel MediaRecorder notice:', mrErr);
        }
      }

      // 4. Animation frame for live volume meter
      const updateVolumeMeter = () => {
        if (!analyserRef.current || !isRecordingActiveRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += data[i];
        }
        const avg = sum / data.length;
        const level = Math.min(100, Math.round((avg / 96) * 100));
        setLiveVolume(level);
        animFrameRef.current = requestAnimationFrame(updateVolumeMeter);
      };
      animFrameRef.current = requestAnimationFrame(updateVolumeMeter);

      // 5. Start Web Speech API STT with continuous recognition
      const SpeechRecognitionClass =
        typeof window !== 'undefined'
          ? (window as unknown as {
              SpeechRecognition?: new () => {
                lang: string;
                continuous: boolean;
                interimResults: boolean;
                maxAlternatives: number;
                onresult: (event: {
                  resultIndex: number;
                  results: Array<Array<{ transcript: string }> & { isFinal: boolean }>;
                }) => void;
                onerror: (e: { error: string }) => void;
                onend: () => void;
                start: () => void;
                stop: () => void;
              };
              webkitSpeechRecognition?: new () => {
                lang: string;
                continuous: boolean;
                interimResults: boolean;
                maxAlternatives: number;
                onresult: (event: {
                  resultIndex: number;
                  results: Array<Array<{ transcript: string }> & { isFinal: boolean }>;
                }) => void;
                onerror: (e: { error: string }) => void;
                onend: () => void;
                start: () => void;
                stop: () => void;
              };
            }).SpeechRecognition ||
            (window as unknown as {
              webkitSpeechRecognition?: new () => {
                lang: string;
                continuous: boolean;
                interimResults: boolean;
                maxAlternatives: number;
                onresult: (event: {
                  resultIndex: number;
                  results: Array<Array<{ transcript: string }> & { isFinal: boolean }>;
                }) => void;
                onerror: (e: { error: string }) => void;
                onend: () => void;
                start: () => void;
                stop: () => void;
              };
            }).webkitSpeechRecognition
          : null;

      if (SpeechRecognitionClass) {
        try {
          const recognition = new SpeechRecognitionClass();
          recognition.lang = sttLanguage;
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.maxAlternatives = 1;

          recognition.onresult = (event: {
            resultIndex: number;
            results: Array<Array<{ transcript: string }> & { isFinal: boolean }>;
          }) => {
            let fullTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
              if (event.results[i] && event.results[i][0]) {
                fullTranscript += event.results[i][0].transcript + ' ';
              }
            }
            const clean = fullTranscript.trim();
            if (clean) {
              setSpeakingTranscript(clean);
            }
          };

          recognition.onerror = (e: { error: string }) => {
            console.warn('SpeechRecognition notice:', e?.error);
            if (e?.error === 'network') {
              setSttWarning(
                'Nhận diện chữ tự động của Google tạm thời gián đoạn mạng. Giọng nói của bạn vẫn được thu vào file bình thường. Bạn có thể tự gõ hoặc bấm "💡 Điền transcript mẫu" bên dưới.'
              );
            }
          };

          recognition.onend = () => {
            if (isRecordingActiveRef.current) {
              try {
                recognition.start();
              } catch {}
            }
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (recErr) {
          console.warn('Speech recognition start notice:', recErr);
        }
      }

      setRecordingDuration(0);
      setRecordingState('recording');

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error('Error starting recording:', err);
      const errorObj = err instanceof Error ? err : null;
      const isDenied =
        errorObj?.name === 'NotAllowedError' || errorObj?.name === 'PermissionDeniedError';
      setMicErrorMessage(
        isDenied
          ? 'Quyền truy cập Micro bị từ chối. Vui lòng cho phép quyền truy cập micro trong cài đặt trình duyệt để thực hành nói.'
          : `Không thể kết nối Micro: ${errorObj?.message || 'Thiết bị micro không khả dụng.'}`
      );
    }
  };

  const handleStopRecording = () => {
    isRecordingActiveRef.current = false;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }

    // Process collected PCM Audio chunks into a guaranteed standard WAV Blob
    try {
      const pcmChunks = pcmChunksRef.current;
      if (pcmChunks.length > 0 && audioContextRef.current) {
        const totalLen = pcmChunks.reduce((acc, c) => acc + c.length, 0);
        const merged = new Float32Array(totalLen);
        let offset = 0;
        let peak = 0;
        for (const chunk of pcmChunks) {
          merged.set(chunk, offset);
          offset += chunk.length;
          for (let i = 0; i < chunk.length; i++) {
            const abs = Math.abs(chunk[i]);
            if (abs > peak) peak = abs;
          }
        }

        const isSilent = peak < 0.005;
        setIsSilentRecording(isSilent);

        // If PCM has sound or MediaRecorder is empty, use 16-bit WAV
        if (!isSilent || mediaRecorderChunksRef.current.length === 0) {
          const wavBlob = encodeWAV(merged, audioContextRef.current.sampleRate);
          setRecordedAudioSize(wavBlob.size);

          if (recordedAudioUrl) {
            URL.revokeObjectURL(recordedAudioUrl);
          }
          const url = URL.createObjectURL(wavBlob);
          setRecordedAudioUrl(url);
          setRecordingState('recorded');
        } else {
          // Fallback to MediaRecorder blob
          const mimeType = mediaRecorderChunksRef.current[0]?.type || 'audio/webm';
          const mrBlob = new Blob(mediaRecorderChunksRef.current, { type: mimeType });
          setRecordedAudioSize(mrBlob.size);

          if (recordedAudioUrl) {
            URL.revokeObjectURL(recordedAudioUrl);
          }
          const url = URL.createObjectURL(mrBlob);
          setRecordedAudioUrl(url);
          setRecordingState('recorded');
        }
      }
    } catch (wavErr) {
      console.error('Audio compilation error:', wavErr);
    }

    // Teardown Web Audio nodes
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch {}
      scriptProcessorRef.current = null;
    }
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {}
      analyserRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    // Stop microphone tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleResetRecording = () => {
    handleStopRecording();
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    setRecordedAudioSize(0);
    setIsSilentRecording(false);
    setLiveVolume(0);
    setRecordingDuration(0);
    setRecordingState('idle');
    setMicErrorMessage(null);
    setSttWarning(null);
  };

  const handleToggleNativeSpeech = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingNativeSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingNativeSpeech(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('US'))
    );
    if (enVoice) utterance.voice = enVoice;

    utterance.onend = () => setIsPlayingNativeSpeech(false);
    utterance.onerror = () => setIsPlayingNativeSpeech(false);

    setIsPlayingNativeSpeech(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveWordToNotebook = async (wordObj: {
    word: string;
    meaning_vi: string;
    part_of_speech?: string;
    ipa?: string;
    example?: string;
    note?: string;
  }) => {
    try {
      const res = await saveWordAction({
        word: wordObj.word,
        meaning_vi: wordObj.meaning_vi,
        part_of_speech: wordObj.part_of_speech,
        ipa: wordObj.ipa,
        example: wordObj.example,
        custom_notes: wordObj.note,
      });
      if (res.success) {
        setSavedWords((prev) => ({ ...prev, [wordObj.word]: true }));
      }
    } catch {
      // Non-blocking
    }
  };

  // Timer while practicing
  useEffect(() => {
    if (step !== 'practice') return;
    const interval = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleSelectOption = (exerciseId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [exerciseId]: optionId,
    }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = exercises.length;

  const handleSubmitQuiz = () => {
    if (answeredCount < totalCount) {
      if (!confirm(`Bạn mới trả lời ${answeredCount}/${totalCount} câu hỏi. Bạn có chắc muốn nộp bài ngay?`)) {
        return;
      }
    }

    const payload = Object.entries(selectedAnswers).map(([exerciseId, optionId]) => ({
      exercise_id: exerciseId,
      selected_option_id: optionId,
    }));

    setErrorMessage(null);

    startTransition(async () => {
      const res = await submitPracticeAction(
        task.id,
        contentItem.id,
        payload,
        secondsSpent
      );

      if (!res.success || !res.result) {
        setErrorMessage(res.error || 'Lỗi khi nộp bài. Vui lòng thử lại.');
      } else {
        setSubmissionResult(res.result);
        setStep('result');
      }
    });
  };

  const handleSubmitWriting = () => {
    const words = countWords(writingText);
    if (words < 10) {
      setErrorMessage('Bài viết quá ngắn (tối thiểu 10 từ). Vui lòng viết thêm nội dung trước khi nộp.');
      return;
    }
    setErrorMessage(null);

    startTransition(async () => {
      const res = await submitWritingPracticeAction(
        task.id,
        contentItem.id,
        writingText,
        secondsSpent
      );

      if (!res.success || !res.result) {
        setErrorMessage(res.error || 'Lỗi khi nộp bài viết. Vui lòng thử lại.');
      } else {
        setWritingResult(res.result.evaluation);
        setWritingScore(res.result.score);
        setStep('result');
      }
    });
  };

  const handleSubmitSpeaking = () => {
    if (recordingState === 'recording') {
      handleStopRecording();
    }
    let currentTranscript = speakingTranscript.trim();
    if (countWords(currentTranscript) < 10) {
      const defaultSample =
        'Hello everyone, my name is Alex and I live in Hanoi. Currently, I work as a software engineer. In my free time, I really enjoy playing acoustic guitar, reading books, and swimming on weekends. I want to improve my English speaking and communication skills to collaborate with global colleagues.';
      currentTranscript = defaultSample;
      setSpeakingTranscript(defaultSample);
    }
    setErrorMessage(null);

    startTransition(async () => {
      const res = await submitSpeakingPracticeAction(
        task.id,
        contentItem.id,
        currentTranscript,
        recordingDuration > 0 ? recordingDuration : secondsSpent
      );

      if (!res.success || !res.result) {
        setErrorMessage(res.error || 'Lỗi khi nộp bài nói. Vui lòng thử lại.');
      } else {
        setSpeakingResult(res.result.evaluation);
        setSpeakingScore(res.result.score);
        setStep('result');
      }
    });
  };

  const [aiTutorExplanations, setAiTutorExplanations] = useState<Record<string, AITutorExplanation>>({});
  const [loadingTutorId, setLoadingTutorId] = useState<string | null>(null);
  const [aiTutorErrors, setAiTutorErrors] = useState<Record<string, string>>({});
  const [followUpTexts, setFollowUpTexts] = useState<Record<string, string>>({});

  const handleAskAITutor = async (exerciseId: string, customQuery?: string) => {
    if (!submissionResult?.submission_id || loadingTutorId === exerciseId) return;

    setLoadingTutorId(exerciseId);
    setAiTutorErrors((prev) => ({ ...prev, [exerciseId]: '' }));

    try {
      const res = await getAITutorExplanationAction({
        submissionId: submissionResult.submission_id,
        exerciseId,
        userQuery: customQuery,
      });

      if (!res.success || !res.explanation) {
        setAiTutorErrors((prev) => ({
          ...prev,
          [exerciseId]: res.error || 'Không thể kết nối với AI Tutor lúc này.',
        }));
      } else {
        setAiTutorExplanations((prev) => ({
          ...prev,
          [exerciseId]: res.explanation!,
        }));
        if (customQuery) {
          setFollowUpTexts((prev) => ({ ...prev, [exerciseId]: '' }));
        }
      }
    } catch (err: unknown) {
      setAiTutorErrors((prev) => ({
        ...prev,
        [exerciseId]: err instanceof Error ? err.message : 'Lỗi hệ thống khi gọi AI Tutor.',
      }));
    } finally {
      setLoadingTutorId(null);
    }
  };

  const handleResetForRetry = () => {
    handleResetRecording();
    setSelectedAnswers({});
    setSubmissionResult(null);
    setWritingResult(null);
    setSpeakingResult(null);
    setSpeakingTranscript('');
    setSecondsSpent(0);
    setAiTutorExplanations({});
    setAiTutorErrors({});
    setFollowUpTexts({});
    setStep('practice');
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '5rem' }}>
      {/* Top breadcrumb & back */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/daily-plan" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          ← Quay lại Kế hoạch ngày
        </Link>

        {/* Step indicator pills */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setStep('study')}
            disabled={step === 'result'}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: step === 'result' ? 'not-allowed' : 'pointer',
              background: step === 'study' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)',
              color: step === 'study' ? '#0f172a' : 'var(--text-secondary)',
            }}
          >
            {isWriting ? '1. Đề bài & Tiêu chí' : isSpeaking ? '1. Chủ đề & Gợi ý nói' : '1. Nội dung bài học'}
          </button>
          <button
            onClick={() => setStep('practice')}
            disabled={step === 'result'}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: step === 'result' ? 'not-allowed' : 'pointer',
              background: step === 'practice' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)',
              color: step === 'practice' ? '#0f172a' : 'var(--text-secondary)',
            }}
          >
            {isWriting
              ? `2. Viết bài (${countWords(writingText)} từ)`
              : isSpeaking
              ? `2. Nhập transcript (${countWords(speakingTranscript)} từ)`
              : `2. Làm bài tập (${answeredCount}/${totalCount})`}
          </button>
          {step === 'result' && (
            <span
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: '#10b981',
                color: '#ffffff',
              }}
            >
              3. Kết quả &amp; Nhận xét
            </span>
          )}
        </div>
      </div>

      {errorMessage && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            marginBottom: '1.5rem',
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: NỘI DUNG BÀI HỌC (STUDY CONTENT) */}
      {/* ========================================================================= */}
      {step === 'study' && (
        <div>
          {/* Header Card */}
          <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <Badge variant="info">{contentItem.skill.toUpperCase()}</Badge>
              <Badge variant="default">Cấp độ {contentItem.level.toUpperCase()}</Badge>
              <Badge variant="default">⏱️ {contentItem.estimated_minutes} phút</Badge>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
              {contentItem.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              {contentItem.description}
            </p>

            {contentItem.body?.overview && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                }}
              >
                💡 <strong>Mục tiêu bài học:</strong> {contentItem.body.overview}
              </div>
            )}
          </div>

          {/* READING PASSAGE CARD */}
          {isReading && passageParagraphs.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.3rem' }}>📄</span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--accent-cyan)' }}>
                  {passageTitle}
                </h2>
              </div>

              <div
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '12px',
                  padding: '1.75rem',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '0.75rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>
                    📋 THỂ LOẠI: {contentItem.body?.passage?.type?.toUpperCase() || 'VĂN BẢN CÔNG SỞ / THÔNG BÁO'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ⏱️ Thời gian đọc gợi ý: ~{contentItem.body?.reading_time_minutes || 5} phút
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {passageParagraphs.map((p: string, idx: number) => (
                    <p key={idx} style={{ margin: 0, fontSize: '0.98rem', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              {readingTips.length > 0 && (
                <div
                  style={{
                    background: 'rgba(56, 189, 248, 0.05)',
                    border: '1px dashed rgba(56, 189, 248, 0.3)',
                    borderRadius: '10px',
                    padding: '1rem 1.25rem',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                    💡 Chiến lược đọc hiểu nhanh:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {readingTips.map((tip: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* WRITING PROMPT & RUBRIC CARD */}
          {isWriting && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
                ✍️ Đề bài &amp; Tiêu chuẩn đánh giá
              </h2>

              <div
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '12px',
                  padding: '1.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  NGỮ CẢNH (SCENARIO):
                </div>
                <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1.25rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {contentItem.body?.prompt_scenario || contentItem.description}
                </p>

                {writingRequirements.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700, marginBottom: '0.5rem' }}>
                      YÊU CẦU CẦN ĐẠT (CHECKLIST):
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {writingRequirements.map((req: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '0.35rem' }}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {templateGuide && (
                  <div
                    style={{
                      marginBottom: '1.25rem',
                      padding: '1rem',
                      borderRadius: '8px',
                      background: 'rgba(56, 189, 248, 0.05)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.5rem' }}>
                      ✉️ CẤU TRÚC GỢI Ý (EMAIL TEMPLATE GUIDE):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.88rem' }}>
                      {templateGuide.greeting && (
                        <div><strong style={{ color: 'var(--text-primary)' }}>Mở đầu:</strong> <code style={{ color: '#34d399' }}>{templateGuide.greeting}</code></div>
                      )}
                      {templateGuide.body_paragraphs && (
                        <div><strong style={{ color: 'var(--text-primary)' }}>Thân bài:</strong> <span style={{ color: 'var(--text-secondary)' }}>{templateGuide.body_paragraphs}</span></div>
                      )}
                      {templateGuide.sign_off && (
                        <div><strong style={{ color: 'var(--text-primary)' }}>Kết thư:</strong> <code style={{ color: '#fbbf24' }}>{templateGuide.sign_off}</code></div>
                      )}
                    </div>
                  </div>
                )}

                {usefulExpressions.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700, marginBottom: '0.5rem' }}>
                      ✨ MẪU CÂU HỮU ÍCH (USEFUL EXPRESSIONS):
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.4rem' }}>
                      {usefulExpressions.map((expr: string, idx: number) => (
                        <div key={idx} style={{ padding: '0.5rem 0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          💡 {expr}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Mục tiêu độ dài: </span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>
                      {contentItem.body?.min_words || 40} - {contentItem.body?.max_words || 180} từ ({contentItem.body?.target_words || '60-100 từ'})
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Định dạng: </span>
                    <strong style={{ color: '#34d399' }}>Email công sở / Kết nối bạn bè</strong>
                  </div>
                </div>
              </div>

              {/* Rubric Overview */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  🎯 Thang điểm Rubric chấm AI (Tổng 100 điểm):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                  <div style={{ padding: '0.65rem', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.08)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>Task (25đ)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Đáp ứng đủ các ý yêu cầu</div>
                  </div>
                  <div style={{ padding: '0.65rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.08)' }}>
                    <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.85rem' }}>Grammar (30đ)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Chia thì &amp; cấu trúc câu</div>
                  </div>
                  <div style={{ padding: '0.65rem', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.08)' }}>
                    <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.85rem' }}>Lexical (25đ)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Từ vựng &amp; cụm từ phù hợp</div>
                  </div>
                  <div style={{ padding: '0.65rem', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.08)' }}>
                    <div style={{ fontWeight: 700, color: '#c084fc', fontSize: '0.85rem' }}>Coherence (20đ)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bố cục &amp; từ nối mạch lạc</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SPEAKING PROMPT & TRANSCRIPT-FIRST NOTE */}
          {isSpeaking && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
                🎙️ Chủ đề nói &amp; Phương pháp Transcript-First
              </h2>

              <div
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '12px',
                  padding: '1.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  CHỦ ĐỀ ĐÀM THOẠI (TOPIC):
                </div>
                <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1.25rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {contentItem.body?.prompt_scenario || contentItem.title}
                </p>

                {speakingCues.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700, marginBottom: '0.5rem' }}>
                      CÁC CÂU HỎI GỢI Ý NÓI (CUE POINTS):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {speakingCues.map((cue: string, idx: number) => (
                        <div key={idx} style={{ padding: '0.6rem 0.85rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          💬 {cue}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {conversationalTips.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700, marginBottom: '0.5rem' }}>
                      🗣️ MẸO NÓI TỰ NHIÊN (CONVERSATIONAL TIPS):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {conversationalTips.map((tip: string, idx: number) => (
                        <div key={idx} style={{ padding: '0.5rem 0.75rem', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '3px solid #34d399', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          • {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Thời lượng mục tiêu: </span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>60 - 90 giây</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Độ dài transcript gợi ý: </span>
                    <strong style={{ color: '#34d399' }}>{contentItem.body?.min_words || 30} - {contentItem.body?.max_words || 160} từ</strong>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '0.85rem 1.15rem',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px dashed rgba(16, 185, 129, 0.3)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                💡 <strong>Tính năng Luyện nói Trực tiếp (Live Voice Recording &amp; AI Analysis):</strong> Bạn có thể bật micro và nói trực tiếp bằng tiếng Anh vào hệ thống! Hệ thống sẽ ghi âm giọng của bạn và tự động nhận diện lời nói (Speech-to-Text) sang tiếng Anh tức thì. Sau khi nói xong, bạn có thể nghe lại đoạn thu âm và nhận đánh giá chuyên sâu từ AI Gemini về độ trôi chảy, ngữ pháp và bài mẫu chuẩn bản xứ.
              </div>
            </div>
          )}

          {/* Vocabulary Cards */}
          {activeVocab.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
                📖 Sổ từ vựng cốt lõi ({activeVocab.length} từ)
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
                {activeVocab.map((w, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {w.word}
                      </span>
                      {w.part_of_speech && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          {w.part_of_speech}
                        </span>
                      )}
                    </div>

                    {w.ipa && (
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Phiên âm: <strong style={{ color: 'var(--text-primary)' }}>{w.ipa}</strong>
                      </div>
                    )}

                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#34d399' }}>
                      Ý nghĩa: {w.meaning_vi}
                    </div>

                    {w.example && (
                      <div
                        style={{
                          padding: '0.65rem 0.85rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '6px',
                          borderLeft: '3px solid var(--accent-cyan)',
                          fontSize: '0.85rem',
                          lineHeight: 1.5,
                          color: 'var(--text-primary)',
                        }}
                      >
                        Ví dụ: <em>&quot;{w.example}&quot;</em>
                      </div>
                    )}

                    {w.note && (
                      <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                        📌 Lưu ý: {w.note}
                      </div>
                    )}

                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <button
                        type="button"
                        onClick={() => handleSaveWordToNotebook(w)}
                        disabled={savedWords[w.word]}
                        style={{
                          background: savedWords[w.word] ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.1)',
                          border: savedWords[w.word] ? '1px solid #10b981' : '1px solid rgba(56, 189, 248, 0.3)',
                          color: savedWords[w.word] ? '#34d399' : 'var(--accent-cyan)',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: savedWords[w.word] ? 'default' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        {savedWords[w.word] ? (
                          <>
                            <span>✓</span>
                            <span>Đã lưu vào sổ từ</span>
                          </>
                        ) : (
                          <>
                            <span>⭐</span>
                            <span>Lưu vào sổ từ</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grammar Rules */}
          {contentItem.body?.rules && contentItem.body.rules.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
                📐 Cấu trúc &amp; Quy tắc ngữ pháp
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {contentItem.body.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                    }}
                  >
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--accent-cyan)' }}>
                      {rule.name}
                    </h3>

                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--accent-cyan)',
                        fontFamily: 'monospace',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {rule.formula}
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
                      {rule.explanation}
                    </p>

                    {rule.examples && rule.examples.length > 0 && (
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem 1rem', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          VÍ DỤ THỰC TẾ:
                        </div>
                        {rule.examples.map((ex, exIdx) => (
                          <div key={exIdx} style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                            • {ex}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Listening Tips & Audio Preview */}
          {isListening && contentItem.body?.audio_url && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
                🎧 Luyện nghe trước đoạn hội thoại
              </h2>

              {contentItem.body?.tips && contentItem.body.tips.length > 0 && (
                <div
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: '#fbbf24',
                      fontSize: '0.95rem',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    💡 Chiến lược nghe &amp; Bắt từ khóa cốt lõi:
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '1.25rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {contentItem.body.tips.map((tip, idx) => (
                      <li key={idx} style={{ marginBottom: '0.35rem' }}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <ListeningAudioPlayer
                  audioUrl={contentItem.body.audio_url}
                  title="Nghe thử hội thoại mẫu (Audio Preview)"
                />
              </div>

              <div
                style={{
                  padding: '0.85rem 1.15rem',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px dashed rgba(245, 158, 11, 0.3)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                🔒 <strong>Lưu ý sư phạm:</strong> Lời thoại chi tiết (Transcript) kèm bản dịch tiếng Việt sẽ được hiển thị đầy đủ sau khi bạn nộp bài, giúp bạn tối đa hóa phản xạ nghe hiểu tự nhiên mà không phụ thuộc vào chữ viết.
              </div>
            </div>
          )}

          {/* Action button */}
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button
              onClick={() => setStep('practice')}
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem', fontSize: '1.1rem' }}
            >
              {isWriting
                ? 'Tôi đã sẵn sàng • Bắt đầu viết bài ➔'
                : isSpeaking
                ? 'Tôi đã sẵn sàng • Bắt đầu nhập transcript nói ➔'
                : `Tôi đã hiểu bài • Bắt đầu làm bài tập (${exercises.length} câu) ➔`}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: LÀM BÀI TẬP TƯƠNG TÁC (INTERACTIVE PRACTICE) */}
      {/* ========================================================================= */}
      {step === 'practice' && (
        <div>
          {/* Header Progress & Timer */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: '12px',
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {isWriting ? 'ĐỘ DÀI BÀI VIẾT' : isSpeaking ? 'ĐỘ DÀI TRANSCRIPT' : 'TIẾN ĐỘ TRẢ LỜI'}
              </div>
              <strong style={{ fontSize: '1.25rem', color: 'var(--accent-cyan)' }}>
                {isWriting
                  ? `${countWords(writingText)} từ (Mục tiêu: 50-150)`
                  : isSpeaking
                  ? `${countWords(speakingTranscript)} từ (Mục tiêu: 40-120)`
                  : `${answeredCount} / ${totalCount} câu hỏi`}
              </strong>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>THỜI GIAN THỰC HÀNH</div>
              <strong style={{ fontSize: '1.25rem', color: '#fbbf24' }}>
                {Math.floor(secondsSpent / 60)}:{(secondsSpent % 60).toString().padStart(2, '0')}
              </strong>
            </div>
          </div>

          {/* =================================================================== */}
          {/* A. WRITING PRACTICE EDITOR */}
          {/* =================================================================== */}
          {isWriting && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.35rem' }}>
                  NHẮC LẠI ĐỀ BÀI:
                </div>
                <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {contentItem.body?.prompt_scenario || contentItem.description}
                </p>

                {writingRequirements.length > 0 && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    <strong style={{ color: '#fbbf24' }}>Các ý cần có (Checklist):</strong>
                    <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.2rem' }}>
                      {writingRequirements.map((req: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '0.2rem' }}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {usefulExpressions.length > 0 && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(56, 189, 248, 0.05)',
                      border: '1px dashed rgba(56, 189, 248, 0.3)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.35rem' }}>
                      💡 Mẫu câu gợi ý dùng trong bài:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {usefulExpressions.slice(0, 4).map((expr: string, idx: number) => (
                        <div key={idx} style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>
                          • {expr}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Khu vực soạn thảo bài viết của bạn:
                </label>
                <textarea
                  rows={12}
                  value={writingText}
                  onChange={(e) => setWritingText(e.target.value)}
                  placeholder="Dear Team, I am writing to introduce myself..."
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>Số từ hiện tại: <strong style={{ color: countWords(writingText) >= 40 ? '#34d399' : '#fbbf24' }}>{countWords(writingText)}</strong> từ</span>
                  <span>Gợi ý: {contentItem.body?.min_words || 40} - {contentItem.body?.max_words || 180} từ</span>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button onClick={() => setStep('study')} className="btn btn-secondary">
                  ← Xem lại đề bài &amp; Rubric
                </button>
                <button
                  onClick={handleSubmitWriting}
                  disabled={isPending || countWords(writingText) < 10}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 2rem', fontSize: '1.05rem' }}
                >
                  {isPending ? '🤖 AI đang phân tích bài viết...' : '🚀 Nộp bài & Nhận xét AI'}
                </button>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* B. SPEAKING INTERACTIVE VOICE STUDIO & TRANSCRIPT EDITOR */}
          {/* =================================================================== */}
          {isSpeaking && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <style>{`
                @keyframes recordPulse {
                  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                  70% { transform: scale(1.05); box-shadow: 0 0 0 16px rgba(239, 68, 68, 0); }
                  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                @keyframes eqWave1 { 0%, 100% { height: 8px; } 50% { height: 26px; } }
                @keyframes eqWave2 { 0%, 100% { height: 16px; } 50% { height: 36px; } }
                @keyframes eqWave3 { 0%, 100% { height: 10px; } 50% { height: 30px; } }
                @keyframes eqWave4 { 0%, 100% { height: 22px; } 50% { height: 14px; } }
                @keyframes eqWave5 { 0%, 100% { height: 12px; } 50% { height: 32px; } }
              `}</style>

              {/* 1. TOPIC & PROMPT GUIDELINES */}
              <div
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.35rem' }}>
                  CHỦ ĐỀ NÓI &amp; CÂU HỎI GỢI Ý:
                </div>
                <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {contentItem.body?.prompt_scenario || contentItem.title}
                </p>

                {speakingCues.length > 0 && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    <strong style={{ color: '#fbbf24' }}>Ý gợi ý trả lời:</strong>
                    <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.2rem' }}>
                      {speakingCues.map((cue: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '0.2rem' }}>{cue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {conversationalTips.length > 0 && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.05)',
                      border: '1px dashed rgba(16, 185, 129, 0.3)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '0.35rem' }}>
                      🗣️ Mẹo nói tự nhiên:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {conversationalTips.slice(0, 3).map((tip: string, idx: number) => (
                        <div key={idx} style={{ color: 'var(--text-primary)' }}>
                          • {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. INTERACTIVE VOICE STUDIO */}
              <div
                style={{
                  background: recordingState === 'recording'
                    ? 'linear-gradient(145deg, rgba(239, 68, 68, 0.08), rgba(15, 23, 42, 0.95))'
                    : 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))',
                  border: recordingState === 'recording'
                    ? '1px solid rgba(239, 68, 68, 0.6)'
                    : '1px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: '16px',
                  padding: '2rem 1.75rem',
                  boxShadow: recordingState === 'recording'
                    ? '0 0 25px rgba(239, 68, 68, 0.25)'
                    : '0 8px 24px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Header with status badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.35rem' }}>🎙️</span>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        Phòng Thu Âm Luyện Nói Trực Tiếp
                      </strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Live Voice Recording &amp; Speech-to-Text
                      </div>
                    </div>
                  </div>

                  {recordingState === 'idle' && (
                    <Badge variant="outline">⚪ Sẵn sàng ghi âm</Badge>
                  )}
                  {recordingState === 'recording' && (
                    <span
                      style={{
                        padding: '0.3rem 0.85rem',
                        borderRadius: '9999px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid #ef4444',
                        color: '#f87171',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                      }}
                    >
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'recordPulse 1.2s infinite' }} />
                      Đang ghi âm &amp; nhận diện tiếng Anh...
                    </span>
                  )}
                  {recordingState === 'recorded' && (
                    <Badge variant="success">✅ Đã thu âm xong ({formatRecordingTime(recordingDuration)})</Badge>
                  )}
                </div>

                {/* Microphone Device Selector & Live Test Bar */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
                      <span style={{ fontSize: '1rem' }}>🎙️</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Thiết bị Micro:</span>
                      <select
                        value={selectedMicId}
                        onChange={(e) => handleSelectMic(e.target.value)}
                        disabled={recordingState === 'recording'}
                        style={{
                          flex: 1,
                          padding: '0.35rem 0.6rem',
                          borderRadius: '6px',
                          background: 'var(--card-bg)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem',
                          outline: 'none',
                        }}
                      >
                        {availableMics.length > 0 ? (
                          availableMics.map((mic) => (
                            <option key={mic.deviceId} value={mic.deviceId}>
                              {mic.label}
                            </option>
                          ))
                        ) : (
                          <option value="">Microphone mặc định hệ thống</option>
                        )}
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => (isTestingMic ? stopMicTest() : startMicTest())}
                        disabled={recordingState === 'recording'}
                        style={{
                          padding: '0.35rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid',
                          borderColor: isTestingMic ? '#ef4444' : 'var(--accent-cyan)',
                          background: isTestingMic ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.12)',
                          color: isTestingMic ? '#f87171' : 'var(--accent-cyan)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {isTestingMic ? '⏹️ Dừng thử mic' : '🔊 Thử Micro trước khi thu'}
                      </button>
                    </div>
                  </div>

                  {isTestingMic && (
                    <div
                      style={{
                        marginTop: '0.65rem',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Mức tín hiệu thử nghiệm:</span>
                        <span style={{ color: liveVolume > 15 ? '#34d399' : liveVolume > 2 ? '#fbbf24' : '#f87171', fontWeight: 700 }}>
                          {liveVolume > 15 ? '🟢 Đang nhận giọng nói tốt' : liveVolume > 2 ? '🟡 Âm thanh nhỏ' : '🔴 Chưa có âm thanh'} ({liveVolume}%)
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.max(4, liveVolume)}%`,
                            height: '100%',
                            background: liveVolume > 15 ? 'linear-gradient(90deg, #10b981, #34d399)' : liveVolume > 2 ? '#fbbf24' : '#ef4444',
                            transition: 'width 0.1s ease',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                        💡 Hãy nói thử vào mic: Nếu thanh màu xanh nhảy lên, thiết bị này hoạt động chuẩn! Nếu vẫn 0%, hãy chuyển sang thiết bị khác trong danh sách bên trên.
                      </div>
                    </div>
                  )}
                </div>

                {/* Language Selector for STT */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ngôn ngữ nhận diện:</span>
                  <button
                    type="button"
                    onClick={() => setSttLanguage('en-US')}
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: sttLanguage === 'en-US' ? 'var(--accent-cyan)' : 'var(--border-color)',
                      background: sttLanguage === 'en-US' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: sttLanguage === 'en-US' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    🇺🇸 Tiếng Anh (en-US - Chuẩn)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSttLanguage('vi-VN')}
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: sttLanguage === 'vi-VN' ? '#34d399' : 'var(--border-color)',
                      background: sttLanguage === 'vi-VN' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: sttLanguage === 'vi-VN' ? '#34d399' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    🇻🇳 Tiếng Việt (Thử mic)
                  </button>
                </div>

                {/* Microphone Error Alert */}
                {micErrorMessage && (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#fca5a5',
                      fontSize: '0.85rem',
                      marginBottom: '1.25rem',
                      lineHeight: 1.5,
                      textAlign: 'left',
                    }}
                  >
                    ⚠️ {micErrorMessage}
                  </div>
                )}

                {/* STT Notice Alert */}
                {sttWarning && (
                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      color: '#fbbf24',
                      fontSize: '0.8rem',
                      marginBottom: '1.25rem',
                      lineHeight: 1.4,
                      textAlign: 'left',
                    }}
                  >
                    ℹ️ {sttWarning}
                  </div>
                )}

                {/* Studio Center Stage */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem 0' }}>
                  {/* Case 1: IDLE */}
                  {recordingState === 'idle' && (
                    <div style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        id="start-speaking-record-btn"
                        style={{
                          width: '88px',
                          height: '88px',
                          borderRadius: '50%',
                          border: 'none',
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: '#ffffff',
                          fontSize: '2.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.45)',
                          margin: '0 auto 1.25rem',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.08)';
                          e.currentTarget.style.boxShadow = '0 10px 28px rgba(239, 68, 68, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.45)';
                        }}
                      >
                        🎙️
                      </button>

                      <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                        Nhấn để bắt đầu nói bằng tiếng Anh
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto', lineHeight: 1.5 }}>
                        Nói to, rõ ràng theo các gợi ý bên trên. Giọng nói của bạn sẽ được thu âm chuẩn WAV và tự động chuyển thành chữ (Speech-to-Text) tức thì.
                      </p>
                    </div>
                  )}

                  {/* Case 2: RECORDING */}
                  {recordingState === 'recording' && (
                    <div style={{ textAlign: 'center', width: '100%', maxWidth: '480px' }}>
                      {/* Timer Display */}
                      <div
                        style={{
                          fontSize: '2.25rem',
                          fontWeight: 800,
                          color: '#f87171',
                          fontVariantNumeric: 'tabular-nums',
                          marginBottom: '0.5rem',
                          letterSpacing: '0.05em',
                        }}
                      >
                        ⏱️ {formatRecordingTime(recordingDuration)}
                      </div>

                      {/* Real-time Microphone Volume Level Indicator */}
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '380px',
                          margin: '0 auto 1.25rem',
                          background: 'rgba(0, 0, 0, 0.35)',
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Tín hiệu Micro thực tế:</span>
                          <span
                            style={{
                              color: liveVolume > 15 ? '#34d399' : liveVolume > 2 ? '#fbbf24' : '#f87171',
                              fontWeight: 700,
                            }}
                          >
                            {liveVolume > 15 ? '🟢 Đang nhận giọng nói tốt' : liveVolume > 2 ? '🟡 Âm thanh nhỏ' : '🔴 Chưa có âm thanh'} ({liveVolume}%)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.max(4, liveVolume)}%`,
                              height: '100%',
                              background: liveVolume > 15 ? 'linear-gradient(90deg, #10b981, #34d399)' : liveVolume > 2 ? '#fbbf24' : '#ef4444',
                              transition: 'width 0.1s ease',
                            }}
                          />
                        </div>
                        {liveVolume < 3 && recordingDuration > 2 && (
                          <div style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '0.5rem', textAlign: 'left', lineHeight: 1.4 }}>
                            ⚠️ Mẹo: Nếu bạn đang nói mà thanh âm lượng vẫn 0%, hãy kiểm tra nút bật micro trên tai nghe hoặc cài đặt âm lượng Micro trong Windows.
                          </div>
                        )}
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        {isSpeechSupported
                          ? `Đang nhận diện giọng nói (${sttLanguage === 'en-US' ? 'Tiếng Anh' : 'Tiếng Việt'})...`
                          : 'Đang ghi âm giọng nói chất lượng cao...'}
                      </div>

                      {/* Stop Recording Button */}
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        id="stop-speaking-record-btn"
                        className="btn"
                        style={{
                          background: '#ef4444',
                          color: '#ffffff',
                          padding: '0.75rem 2rem',
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          borderRadius: '9999px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 4px 18px rgba(239, 68, 68, 0.45)',
                          animation: 'recordPulse 2s infinite',
                        }}
                      >
                        ⏹️ Dừng ghi âm &amp; Hoàn tất
                      </button>
                    </div>
                  )}

                  {/* Case 3: RECORDED */}
                  {recordingState === 'recorded' && (
                    <div style={{ width: '100%', maxWidth: '540px', textAlign: 'center', margin: '0 auto' }}>
                      <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                          <span style={{ fontWeight: 600 }}>
                            🎧 Nghe lại đoạn thu âm ({formatRecordingTime(recordingDuration)}):
                          </span>
                          {recordedAudioSize > 0 && (
                            <Badge variant="outline">{(recordedAudioSize / 1024).toFixed(0)} KB (WAV chuẩn)</Badge>
                          )}
                        </div>

                        {/* Silence Warning */}
                        {isSilentRecording && (
                          <div
                            style={{
                              padding: '0.75rem 1rem',
                              borderRadius: '8px',
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              color: '#fca5a5',
                              fontSize: '0.85rem',
                              marginBottom: '0.75rem',
                              textAlign: 'left',
                              lineHeight: 1.5,
                            }}
                          >
                            ⚠️ <strong>Cảnh báo âm lượng:</strong> Đoạn thu âm gần như im lặng (Micro không nhận được âm thanh). Hãy kiểm tra công tắc bật micro trên tai nghe hoặc cài đặt âm lượng Windows Microphone, sau đó nhấn <em>&quot;Thu âm lại bản mới&quot;</em>!
                          </div>
                        )}

                        {recordedAudioUrl && (
                          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-color)' }}>
                            <audio
                              ref={audioPlayerRef}
                              controls
                              preload="auto"
                              src={recordedAudioUrl}
                              style={{ width: '100%', height: '44px', outline: 'none' }}
                            >
                              Trình duyệt không hỗ trợ phát thẻ audio.
                            </audio>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={handleResetRecording}
                          id="re-record-speaking-btn"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
                        >
                          🔄 Thu âm lại bản mới
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {!isSpeechSupported && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                    }}
                  >
                    ℹ️ Trình duyệt chưa bật Web Speech API nhận diện trực tiếp, bạn vẫn có thể thu âm tiếng bình thường và chỉnh sửa transcript bên dưới.
                  </div>
                )}
              </div>

              {/* 3. TRANSCRIPT REVIEW & EDIT */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    📝 Bản nhận diện lời nói (Transcript):
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSpeakingTranscript(
                          'Hello everyone, my name is Alex and I live in Hanoi. Currently, I work as a software engineer. In my free time, I really enjoy playing acoustic guitar, reading books, and swimming on weekends. I want to improve my English speaking and communication skills to collaborate with global colleagues.'
                        );
                      }}
                      style={{
                        padding: '0.2rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(251, 191, 36, 0.4)',
                        background: 'rgba(251, 191, 36, 0.1)',
                        color: '#fbbf24',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      💡 Điền transcript mẫu theo đề bài
                    </button>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Có thể chỉnh sửa nếu nhận diện nhầm từ
                    </span>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={speakingTranscript}
                  onChange={(e) => setSpeakingTranscript(e.target.value)}
                  placeholder="Lời nói tiếng Anh của bạn khi ghi âm sẽ tự động xuất hiện ở đây, ví dụ: 'Hi everyone, my name is Alex. In my free time, I usually...'"
                  id="speaking-transcript-textarea"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>
                    Số từ nói được: <strong style={{ color: countWords(speakingTranscript) >= 30 ? '#34d399' : '#fbbf24' }}>{countWords(speakingTranscript)}</strong> từ
                  </span>
                  <span>Gợi ý: {contentItem.body?.min_words || 30} - {contentItem.body?.max_words || 160} từ</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                {countWords(speakingTranscript) < 10 && (
                  <div
                    style={{
                      maxWidth: '560px',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      color: '#fbbf24',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      textAlign: 'left',
                    }}
                  >
                    💡 <strong>Để AI chấm điểm chi tiết:</strong> Hãy gõ câu bạn vừa nói vào ô transcript, hoặc bấm <em>&quot;💡 Điền transcript mẫu theo đề bài&quot;</em>. Hoặc bạn có thể bấm trực tiếp nút nộp bên dưới, hệ thống sẽ tự động điền mẫu câu chuẩn và gửi cho AI đánh giá ngay!
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <button onClick={() => setStep('study')} className="btn btn-secondary">
                    ← Xem lại chủ đề
                  </button>
                  <button
                    onClick={handleSubmitSpeaking}
                    disabled={isPending}
                    id="submit-speaking-btn"
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 2rem', fontSize: '1.05rem', minWidth: '280px' }}
                  >
                    {isPending
                      ? '🤖 AI Gemini đang chấm điểm phát âm & phản xạ...'
                      : countWords(speakingTranscript) >= 10
                      ? '🚀 Nộp bài nói & Nhận xét AI'
                      : '🚀 Nộp bài (Tự động điền mẫu & Chấm điểm AI)'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* C. MULTIPLE CHOICE PRACTICE (READING & LISTENING) */}
          {/* =================================================================== */}
          {!isWriting && !isSpeaking && (
            <div>
              {/* Reading Passage Reference Box (Collapsible) */}
              {isReading && passageParagraphs.length > 0 && (
                <div
                  style={{
                    marginBottom: '2rem',
                    background: 'var(--card-bg)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem 1.5rem',
                      background: 'rgba(56, 189, 248, 0.08)',
                      borderBottom: showPassageRef ? '1px solid var(--border-color)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>📖</span>
                      <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem' }}>
                        Văn bản tham khảo: {passageTitle}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPassageRef(!showPassageRef)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {showPassageRef ? 'Ẩn bớt ▲' : 'Hiện văn bản ▼'}
                    </button>
                  </div>

                  {showPassageRef && (
                    <div style={{ padding: '1.5rem', maxHeight: '350px', overflowY: 'auto' }}>
                      {passageParagraphs.map((p: string, idx: number) => (
                        <p key={idx} style={{ margin: '0 0 0.85rem', fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                          {p}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Persistent Audio Player during practice */}
              {isListening && contentItem.body?.audio_url && (
                <div style={{ marginBottom: '2rem' }}>
                  <ListeningAudioPlayer
                    audioUrl={contentItem.body.audio_url}
                    title="🎧 Audio nghe hội thoại (Bạn có thể nghe lại nhiều lần khi làm bài)"
                  />
                </div>
              )}

              {/* Exercise Questions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {exercises.map((ex, index) => {
                  const selectedOption = selectedAnswers[ex.id];

                  return (
                    <div
                      key={ex.id}
                      style={{
                        background: 'var(--card-bg)',
                        border: selectedOption
                          ? '1px solid rgba(56, 189, 248, 0.4)'
                          : '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Badge variant="default">Câu {index + 1}</Badge>
                        {selectedOption && <Badge variant="success">Đã chọn</Badge>}
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.5, margin: '0 0 1rem' }}>
                        {ex.prompt}
                      </h3>

                      {ex.context_text && (
                        <div
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderLeft: '3px solid var(--border-color)',
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '1rem',
                          }}
                        >
                          {ex.context_text}
                        </div>
                      )}

                      {/* Options */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {ex.options.map((opt) => {
                          const isSelected = selectedOption === opt.id;

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectOption(ex.id, opt.id)}
                              style={{
                                textAlign: 'left',
                                padding: '0.85rem 1.15rem',
                                borderRadius: '8px',
                                background: isSelected
                                  ? 'rgba(56, 189, 248, 0.15)'
                                  : 'rgba(255, 255, 255, 0.03)',
                                border: isSelected
                                  ? '2px solid var(--accent-cyan)'
                                  : '1px solid var(--border-color)',
                                color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)',
                                fontSize: '0.95rem',
                                fontWeight: isSelected ? 600 : 400,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <span>{opt.text}</span>
                              <span
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  border: isSelected
                                    ? '5px solid var(--accent-cyan)'
                                    : '2px solid var(--text-muted)',
                                  background: isSelected ? '#ffffff' : 'transparent',
                                }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit button */}
              <div style={{ marginTop: '2.5rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button onClick={() => setStep('study')} className="btn btn-secondary">
                  ← Xem lại lý thuyết
                </button>

                <button
                  onClick={handleSubmitQuiz}
                  disabled={isPending || answeredCount === 0}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 2rem', fontSize: '1.05rem' }}
                >
                  {isPending ? 'Đang chấm điểm...' : '🚀 Nộp bài & Xem kết quả'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: KẾT QUẢ & GIẢI THÍCH CHI TIẾT (RESULT & FEEDBACK) */}
      {/* ========================================================================= */}
      {step === 'result' && (
        <div>
          {/* =================================================================== */}
          {/* A. WRITING RESULT VIEW */}
          {/* =================================================================== */}
          {isWriting && writingResult && (
            <div>
              {/* Writing Hero Score Card */}
              <div
                className="card"
                style={{
                  padding: '2.5rem',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.12), rgba(15, 23, 42, 0.95))',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: '16px',
                  marginBottom: '2rem',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                  {writingScore >= 80 ? '🌟' : writingScore >= 60 ? '👍' : '💪'}
                </div>

                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                  {writingScore >= 80
                    ? 'Xuất sắc! Bài viết mạch lạc và chuẩn ngữ pháp'
                    : writingScore >= 60
                    ? 'Làm tốt lắm! Đạt yêu cầu bài tập cơ bản'
                    : 'Cần luyện tập thêm! Hãy chú ý các lỗi ngữ pháp'}
                </h2>

                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '0.5rem 0' }}>
                  {writingScore} <span style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/ 100</span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                  🔒 <em>Điểm số dựa trên thang 4 tiêu chuẩn sư phạm của bài tập. Không đại diện cho chứng chỉ CEFR chính thức.</em>
                </p>

                {/* 4 Rubric Meters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Task Achievement</div>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>
                      {writingResult.rubric_scores.task_achievement} / 25
                    </strong>
                  </div>
                  <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Grammar Accuracy</div>
                    <strong style={{ fontSize: '1.2rem', color: '#34d399' }}>
                      {writingResult.rubric_scores.grammar_accuracy} / 30
                    </strong>
                  </div>
                  <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lexical Resource</div>
                    <strong style={{ fontSize: '1.2rem', color: '#fbbf24' }}>
                      {writingResult.rubric_scores.lexical_resource} / 25
                    </strong>
                  </div>
                  <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Coherence &amp; Org</div>
                    <strong style={{ fontSize: '1.2rem', color: '#c084fc' }}>
                      {writingResult.rubric_scores.coherence_organization} / 20
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link href="/daily-plan" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
                    📅 Hoàn tất &amp; Về Kế hoạch ngày
                  </Link>
                  <button onClick={handleResetForRetry} className="btn btn-secondary">
                    🔄 Viết lại bài này
                  </button>
                </div>
              </div>

              {/* Overall Feedback */}
              <div
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--accent-cyan)' }}>
                  💡 Nhận xét sư phạm tổng quan
                </h3>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  {writingResult.overall_feedback}
                </p>
              </div>

              {/* Grammar Corrections */}
              {writingResult.grammar_corrections.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    🔍 Lỗi ngữ pháp &amp; Cách sửa chi tiết ({writingResult.grammar_corrections.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {writingResult.grammar_corrections.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--card-bg)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '10px',
                          padding: '1rem 1.25rem',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#f87171', fontSize: '0.9rem' }}>
                            Câu viết cũ: <s>&quot;{item.error_quote}&quot;</s>
                          </span>
                          <span style={{ color: '#34d399', fontSize: '0.9rem', fontWeight: 600 }}>
                            ➔ Sửa lại: &quot;{item.correction}&quot;
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          💡 <em>Giải thích:</em> {item.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vocabulary Enhancements */}
              {writingResult.vocabulary_enhancements.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    ✨ Gợi ý nâng cấp từ vựng &amp; Diễn đạt
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
                    {writingResult.vocabulary_enhancements.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--card-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          padding: '1rem',
                        }}
                      >
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Từ ban đầu: <s>{item.original}</s></div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', margin: '0.25rem 0' }}>
                          ➔ {item.suggestion}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {item.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improved Native Version */}
              {writingResult.improved_version && (
                <div
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>📝</span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--accent-cyan)' }}>
                      Phiên bản tham khảo hoàn thiện (Native Version)
                    </h3>
                  </div>

                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      background: 'rgba(0, 0, 0, 0.25)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                      marginBottom: '1rem',
                    }}
                  >
                    {writingResult.improved_version.text}
                  </div>

                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    💡 <em>Lý do cải tiến:</em> {writingResult.improved_version.rationale}
                  </p>
                </div>
              )}

              {/* Next Steps */}
              {writingResult.next_steps.length > 0 && (
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '2rem',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    🚀 Các bước luyện tập tiếp theo:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {writingResult.next_steps.map((stepItem, idx) => (
                      <li key={idx}>{stepItem}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* B. SPEAKING RESULT VIEW */}
          {/* =================================================================== */}
          {isSpeaking && speakingResult && (
            <div>
              {/* Speaking Hero Score Card */}
              <div
                className="card"
                style={{
                  padding: '2.5rem',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.12), rgba(15, 23, 42, 0.95))',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '16px',
                  marginBottom: '2rem',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                  {speakingScore >= 80 ? '🌟' : speakingScore >= 60 ? '👍' : '💪'}
                </div>

                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                  {speakingScore >= 80
                    ? 'Xuất sắc! Phản xạ nói tự nhiên và trôi chảy'
                    : speakingScore >= 60
                    ? 'Khá tốt! Ý tưởng rõ ràng, cần tăng thêm từ nối'
                    : 'Cần luyện tập thêm! Hãy nghe bài mẫu và lặp lại'}
                </h2>

                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#34d399', margin: '0.5rem 0' }}>
                  {speakingScore} <span style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/ 100</span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                  🔒 <em>Đánh giá phản xạ &amp; cấu trúc câu theo phương pháp Transcript-First. Không đại diện cho chứng chỉ CEFR chính thức.</em>
                </p>

                {/* 4 Rubric Meters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Relevance &amp; Fluency</div>
                    <strong style={{ fontSize: '1.2rem', color: '#34d399' }}>
                      {speakingResult.rubric_scores.relevance_fluency} / 25
                    </strong>
                  </div>
                  <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Spoken Grammar</div>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>
                      {speakingResult.rubric_scores.spoken_grammar} / 30
                    </strong>
                  </div>
                  <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Conversational Vocab</div>
                    <strong style={{ fontSize: '1.2rem', color: '#fbbf24' }}>
                      {speakingResult.rubric_scores.conversational_vocab} / 25
                    </strong>
                  </div>
                  <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Naturalness</div>
                    <strong style={{ fontSize: '1.2rem', color: '#c084fc' }}>
                      {speakingResult.rubric_scores.naturalness_sample} / 20
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link href="/daily-plan" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
                    📅 Hoàn tất &amp; Về Kế hoạch ngày
                  </Link>
                  <button onClick={handleResetForRetry} className="btn btn-secondary">
                    🔄 Luyện nói lại bài này
                  </button>
                </div>
              </div>

              {/* Audio Replay of Learner's Own Recording */}
              {recordedAudioUrl && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>🎧</span>
                      <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem' }}>
                        Nghe lại giọng nói của bạn đã thu ({formatRecordingTime(recordingDuration)})
                      </strong>
                    </div>
                    <Badge variant="info">Bản ghi âm học viên</Badge>
                  </div>
                  <audio controls src={recordedAudioUrl} style={{ width: '100%', height: '42px', outline: 'none' }}>
                    Trình duyệt không hỗ trợ phát audio.
                  </audio>
                </div>
              )}

              {/* Overall Feedback & Fluency */}
              <div
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#34d399' }}>
                  🎙️ Nhận xét phản xạ &amp; Độ tự nhiên
                </h3>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  {speakingResult.overall_feedback}
                </p>
                <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '3px solid #34d399', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  💬 <em>Tính liên kết:</em> {speakingResult.relevance_and_fluency}
                </div>
              </div>

              {/* Spoken Grammar Corrections */}
              {speakingResult.grammar_corrections.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    🔍 Lỗi ngữ pháp trong văn nói ({speakingResult.grammar_corrections.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {speakingResult.grammar_corrections.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--card-bg)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '10px',
                          padding: '1rem 1.25rem',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#f87171', fontSize: '0.9rem' }}>
                            Câu nói cũ: <s>&quot;{item.error_quote}&quot;</s>
                          </span>
                          <span style={{ color: '#34d399', fontSize: '0.9rem', fontWeight: 600 }}>
                            ➔ Nói tự nhiên hơn: &quot;{item.correction}&quot;
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          💡 <em>Giải thích:</em> {item.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Native Spoken Monologue */}
              {speakingResult.sample_spoken_response && (
                <div
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>🗣️</span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#34d399' }}>
                        Bài nói mẫu bản xứ tham khảo (Sample Spoken Answer)
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleNativeSpeech(speakingResult.sample_spoken_response.text)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #34d399',
                        background: isPlayingNativeSpeech ? 'rgba(52, 211, 153, 0.25)' : 'rgba(52, 211, 153, 0.1)',
                        color: '#34d399',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {isPlayingNativeSpeech ? '⏹️ Dừng đọc bài mẫu' : '🔊 Nghe phát âm mẫu bản xứ (TTS)'}
                    </button>
                  </div>

                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      background: 'rgba(0, 0, 0, 0.25)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                      marginBottom: '1rem',
                    }}
                  >
                    {speakingResult.sample_spoken_response.text}
                  </div>

                  {speakingResult.sample_spoken_response.key_phrases && speakingResult.sample_spoken_response.key_phrases.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cụm từ đắt giá:</span>
                      {speakingResult.sample_spoken_response.key_phrases.map((phrase, pIdx) => (
                        <Badge key={pIdx} variant="info">{phrase}</Badge>
                      ))}
                    </div>
                  )}

                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    💡 <em>Lý do tự nhiên:</em> {speakingResult.sample_spoken_response.rationale}
                  </p>
                </div>
              )}

              {/* Next Steps */}
              {speakingResult.next_steps.length > 0 && (
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '2rem',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    🚀 Gợi ý luyện tập phản xạ:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {speakingResult.next_steps.map((stepItem, idx) => (
                      <li key={idx}>{stepItem}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* C. MULTIPLE CHOICE RESULT (READING & LISTENING) */}
          {/* =================================================================== */}
          {!isWriting && !isSpeaking && submissionResult && (
            <div>
              {/* Result Score Card */}
              <div
                className="card"
                style={{
                  padding: '2.5rem',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.95))',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '16px',
                  marginBottom: '2rem',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                  {submissionResult.percentage >= 80 ? '🌟' : submissionResult.percentage >= 50 ? '👍' : '💪'}
                </div>

                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                  {submissionResult.percentage >= 80
                    ? 'Xuất sắc! Bạn nắm rất vững bài học'
                    : submissionResult.percentage >= 50
                    ? 'Làm tốt lắm! Hãy xem lại các câu chưa chính xác'
                    : 'Cần ôn tập thêm! Hãy xem kỹ phần giải thích chi tiết'}
                </h2>

                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#34d399', margin: '0.5rem 0' }}>
                  {submissionResult.percentage}%
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 0 1.5rem' }}>
                  Đạt <strong>{submissionResult.score} / {submissionResult.max_score} điểm</strong> ({submissionResult.breakdown.filter((b) => b.is_correct).length}/{submissionResult.breakdown.length} câu đúng) trong thời gian{' '}
                  <strong>{Math.floor(secondsSpent / 60)} phút {secondsSpent % 60} giây</strong>.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link href="/daily-plan" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
                    📅 Hoàn tất &amp; Về Kế hoạch ngày
                  </Link>
                  <button onClick={handleResetForRetry} className="btn btn-secondary">
                    🔄 Làm lại bài tập
                  </button>
                </div>
              </div>

              {/* Listening Dialogue Transcript & Audio Replay (Revealed after submission) */}
              {isListening && (contentItem.body?.dialogue || contentItem.body?.transcript) && (
                <div
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '12px',
                    padding: '1.75rem',
                    marginBottom: '2rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.35rem' }}>📜</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--accent-cyan)' }}>
                      Script cuộc hội thoại &amp; Bản dịch chi tiết (Transcript)
                    </h3>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                    Đối chiếu nội dung bạn vừa nghe với phụ đề song ngữ bên dưới để nắm chắc cách dùng từ, nối âm và ngữ cảnh giao tiếp.
                  </p>

                  {contentItem.body?.audio_url && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <ListeningAudioPlayer
                        audioUrl={contentItem.body.audio_url}
                        title="Nghe lại để kiểm tra đối chiếu (Audio Replay)"
                      />
                    </div>
                  )}

                  {contentItem.body?.dialogue && contentItem.body.dialogue.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {contentItem.body.dialogue.map((line, idx) => {
                        const isDavid = line.speaker.toLowerCase().includes('david');
                        return (
                          <div
                            key={idx}
                            style={{
                              padding: '0.85rem 1.15rem',
                              borderRadius: '8px',
                              background: isDavid ? 'rgba(56, 189, 248, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                              borderLeft: `4px solid ${isDavid ? 'var(--accent-cyan)' : '#34d399'}`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  color: isDavid ? 'var(--accent-cyan)' : '#34d399',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  background: isDavid ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                }}
                              >
                                {line.speaker}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                marginBottom: '0.2rem',
                              }}
                            >
                              {line.text}
                            </div>
                            {line.translation_vi && (
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                {line.translation_vi}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : contentItem.body?.transcript ? (
                    <pre
                      style={{
                        background: 'rgba(0, 0, 0, 0.25)',
                        padding: '1rem',
                        borderRadius: '8px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {contentItem.body.transcript}
                    </pre>
                  ) : null}
                </div>
              )}

              {/* Reading Passage Review (Step 3) */}
              {isReading && passageParagraphs.length > 0 && (
                <div
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>📖</span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--accent-cyan)' }}>
                        Đối chiếu văn bản bài đọc: {passageTitle}
                      </h3>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', padding: '0.5rem 0' }}>
                    {passageParagraphs.map((p: string, idx: number) => (
                      <p key={idx} style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Question Review */}
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
                🔍 Chi tiết từng câu &amp; Giải thích đáp án
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {submissionResult.breakdown.map((item, idx) => {
                  const currentEx = exercises.find((e) => e.id === item.exercise_id);
                  const userOpt = currentEx?.options?.find(
                    (o) => o.id === item.user_answer || o.id === item.user_option_id
                  );
                  const correctOpt = currentEx?.options?.find(
                    (o) => o.id === item.correct_answer || o.id === item.correct_option_id
                  );

                  const displayUserAnswer =
                    userOpt?.text ||
                    (item.user_answer && !item.user_answer.startsWith('opt_')
                      ? item.user_answer
                      : undefined) ||
                    (item.user_answer ? item.user_answer : '(Bỏ trống)');

                  const displayCorrectAnswer =
                    correctOpt?.text ||
                    (item.correct_answer && !item.correct_answer.startsWith('opt_')
                      ? item.correct_answer
                      : undefined) ||
                    item.correct_answer;

                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--card-bg)',
                        border: item.is_correct
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Badge variant={item.is_correct ? 'success' : 'default'}>
                          {item.is_correct ? '✓ Câu đúng' : '✕ Câu sai'}
                        </Badge>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Câu {idx + 1}</span>
                      </div>

                      <p style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 0.75rem', lineHeight: 1.5 }}>
                        {item.prompt}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <div style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', background: item.is_correct ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                          Câu bạn chọn: <strong style={{ color: item.is_correct ? '#34d399' : '#f87171' }}>{displayUserAnswer}</strong>
                        </div>

                        {!item.is_correct && (
                          <div style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)' }}>
                            Đáp án đúng: <strong style={{ color: '#34d399' }}>{displayCorrectAnswer}</strong>
                          </div>
                        )}
                      </div>

                      {/* Explanation box */}
                      <div
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderLeft: '3px solid var(--accent-cyan)',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.6,
                        }}
                      >
                        💡 <strong>Giải thích chi tiết:</strong> {item.explanation}
                      </div>

                      {/* AI Tutor Section */}
                      <div style={{ marginTop: '0.85rem' }}>
                        {aiTutorExplanations[item.exercise_id] ? (
                          <div
                            style={{
                              padding: '1.25rem',
                              borderRadius: '10px',
                              background: 'rgba(56, 189, 248, 0.05)',
                              border: '1px solid rgba(56, 189, 248, 0.25)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.75rem',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                🤖 AI Tutor • Phân tích chuyên sâu
                              </span>
                              <Badge variant="info">Trình độ {contentItem.level.toUpperCase()}</Badge>
                            </div>

                            <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                              {aiTutorExplanations[item.exercise_id].explanation}
                            </div>

                            <div
                              style={{
                                padding: '0.65rem 0.85rem',
                                borderRadius: '6px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderLeft: '3px solid #34d399',
                                fontSize: '0.85rem',
                                color: '#e2e8f0',
                                lineHeight: 1.5,
                              }}
                            >
                              📐 <strong>Quy tắc cần nhớ:</strong> {aiTutorExplanations[item.exercise_id].rule_summary}
                            </div>

                            {aiTutorExplanations[item.exercise_id].examples?.length > 0 && (
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <strong style={{ color: 'var(--accent-cyan)' }}>Ví dụ mở rộng:</strong>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.35rem' }}>
                                  {aiTutorExplanations[item.exercise_id].examples.map((ex, exIdx) => (
                                    <div key={exIdx} style={{ paddingLeft: '0.5rem', borderLeft: '2px solid rgba(56, 189, 248, 0.2)' }}>
                                      • {ex}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontStyle: 'italic' }}>
                              💡 <strong>Gợi ý ôn tập:</strong> {aiTutorExplanations[item.exercise_id].next_step_tip}
                            </div>

                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                              <input
                                type="text"
                                placeholder="Hỏi thêm AI Tutor về câu này..."
                                value={followUpTexts[item.exercise_id] || ''}
                                onChange={(e) =>
                                  setFollowUpTexts((prev) => ({ ...prev, [item.exercise_id]: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && (followUpTexts[item.exercise_id] || '').trim()) {
                                    handleAskAITutor(item.exercise_id, (followUpTexts[item.exercise_id] || '').trim());
                                  }
                                }}
                                style={{
                                  flex: 1,
                                  padding: '0.5rem 0.85rem',
                                  borderRadius: '6px',
                                  background: 'rgba(0, 0, 0, 0.2)',
                                  border: '1px solid var(--border-color)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.85rem',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleAskAITutor(item.exercise_id, (followUpTexts[item.exercise_id] || '').trim())
                                }
                                disabled={loadingTutorId === item.exercise_id || !(followUpTexts[item.exercise_id] || '').trim()}
                                className="btn btn-secondary"
                                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                              >
                                {loadingTutorId === item.exercise_id ? 'Đang gửi...' : 'Hỏi tiếp'}
                              </button>
                            </div>
                          </div>
                        ) : loadingTutorId === item.exercise_id ? (
                          <div
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '8px',
                              background: 'rgba(56, 189, 248, 0.06)',
                              border: '1px dashed rgba(56, 189, 248, 0.3)',
                              fontSize: '0.85rem',
                              color: 'var(--accent-cyan)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <span>🤖 AI Tutor đang phân tích câu hỏi theo trình độ {contentItem.level.toUpperCase()}...</span>
                          </div>
                        ) : (
                          <div>
                            {aiTutorErrors[item.exercise_id] && (
                              <div
                                style={{
                                  padding: '0.65rem 0.85rem',
                                  borderRadius: '6px',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#f87171',
                                  fontSize: '0.85rem',
                                  marginBottom: '0.5rem',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <span>⚠️ {aiTutorErrors[item.exercise_id]}</span>
                                <button
                                  type="button"
                                  onClick={() => handleAskAITutor(item.exercise_id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--accent-cyan)',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  Thử lại
                                </button>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleAskAITutor(item.exercise_id)}
                              style={{
                                background: 'rgba(56, 189, 248, 0.08)',
                                border: '1px solid rgba(56, 189, 248, 0.25)',
                                borderRadius: '8px',
                                padding: '0.55rem 1rem',
                                color: 'var(--accent-cyan)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              🤖 Hỏi AI Tutor phân tích sâu hơn câu này
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                <Link href="/daily-plan" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                  Quay lại danh sách Kế hoạch ngày ➔
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
