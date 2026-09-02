import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { API_BASE_URL } from "../utils/api";
import Header from "../components/Header";
import { 
  Mic, 
  Square,
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  AlertCircle,
  Clock,
  RotateCcw,
  Timer,
  Edit3,
  RefreshCw
} from "lucide-react";

const InterviewSessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Interview state
  const [questionNumber, setQuestionNumber] = useState(1);
  const [maxQuestions, setMaxQuestions] = useState(10);
  const [questionText, setQuestionText] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");


  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [interviewStatus, setInterviewStatus] = useState("speaking"); // "speaking", "ready", "recording", "evaluating", "completed"

  // Audio state for AI Question TTS
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Typing question animation state
  const [typedQuestion, setTypedQuestion] = useState("");
  const typingTimerRef = useRef(null);

  // MediaRecorder & Audio Visualizer refs & states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [speechDetected, setSpeechDetected] = useState(false);
  const [silenceCountdown, setSilenceCountdown] = useState(null);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const lastActiveTimeRef = useRef(Date.now());
  const hasSpokenRef = useRef(false);
  const isSubmittingRef = useRef(false);

  // Robust Voice Synthesis (TTS for AI Question)
  // Sanitize text for natural speech synthesis (prevent TTS from saying 'backtick', 'hash', 'slash', etc.)
  const cleanTextForSpeech = (rawText) => {
    if (!rawText) return "";
    return rawText
      // Convert common coding terms to verbal equivalents
      .replace(/\bC\+\+\b/g, "C plus plus")
      .replace(/\bC#\b/g, "C sharp")
      .replace(/\b\.js\b/gi, " JS")
      .replace(/\b\.ts\b/gi, " TS")
      .replace(/\bHTML5\b/gi, "HTML 5")
      .replace(/\bCSS3\b/gi, "CSS 3")
      .replace(/&/g, " and ")
      .replace(/@/g, " at ")
      .replace(/\//g, " or ")
      .replace(/\\/g, " ")
      // Strip markdown symbols and coding punctuation: backticks, hashes, asterisks, brackets, tildes, pipes
      .replace(/[`*_~#><|{}[\]()]/g, " ")
      // Remove isolated slashes, hyphens, colons or quotes that some TTS engines read out loud
      .replace(/(^|\s)[/\\#`~*_-]+(\s|$)/g, " ")
      // Normalize spacing and natural pauses
      .replace(/\s+/g, " ")
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s*\.\s*/g, ". ")
      .replace(/\s*\?\s*/g, "? ")
      .trim();
  };

  const speakQuestion = useCallback((text) => {
    if (!text || !audioEnabled || typeof window === "undefined" || !window.speechSynthesis) {
      setInterviewStatus("ready");
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const spokenCleanText = cleanTextForSpeech(text);
      const utterance = new SpeechSynthesisUtterance(spokenCleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";


      const executeSpeak = () => {
        try {
          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            const preferredVoice = voices.find(
              (v) =>
                v.lang.startsWith("en") &&
                (v.name.includes("Google") ||
                  v.name.includes("Natural") ||
                  v.name.includes("Samantha") ||
                  v.name.includes("Daniel") ||
                  v.name.includes("Jenny") ||
                  v.name.includes("Guy") ||
                  v.name.includes("Alex"))
            ) || voices.find((v) => v.lang.startsWith("en")) || voices[0];

            if (preferredVoice) utterance.voice = preferredVoice;
          }

          utterance.onstart = () => {
            setInterviewStatus("speaking");
          };

          utterance.onend = () => {
            setInterviewStatus("ready");
          };

          utterance.onerror = (e) => {
            console.warn("TTS synthesis error:", e);
            setInterviewStatus("ready");
          };

          // Chrome speech synthesis freeze fix
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }

          setTimeout(() => {
            try {
              window.speechSynthesis.speak(utterance);
            } catch (err) {
              console.warn("Speech synthesis speak call error:", err);
              setInterviewStatus("ready");
            }
          }, 80);
        } catch (err) {
          console.warn("TTS execute error:", err);
          setInterviewStatus("ready");
        }
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        executeSpeak();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          executeSpeak();
        };
        setTimeout(executeSpeak, 120);
      }
    } catch (err) {
      console.warn("Could not start speech synthesis:", err);
      setInterviewStatus("ready");
    }
  }, [audioEnabled]);

  // Clean up Audio Visualizer and Stream
  const cleanupAudio = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== "closed") {
          audioContextRef.current.close();
        }
      } catch (e) {
        // ignore
      }
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        // ignore
      }
      mediaStreamRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setAudioLevel(0);
  };

  // Start Mic Audio Visualizer (Web Audio API)
  const startAudioAnalyser = (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const currentLevel = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(currentLevel);

        // Voice activity detection (above ambient sound threshold)
        if (currentLevel > 12) {
          lastActiveTimeRef.current = Date.now();
          hasSpokenRef.current = true;
          setSpeechDetected(true);
        }

        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.warn("Could not start audio visualizer analyser:", err);
    }
  };

  // Start Audio Recording
  const startRecording = async () => {
    try {
      setErrorMsg("");
      setMicPermissionDenied(false);
      hasSpokenRef.current = false;
      lastActiveTimeRef.current = Date.now();
      isSubmittingRef.current = false;
      setSpeechDetected(false);
      setSilenceCountdown(null);
      audioChunksRef.current = [];

      // Clean any existing streams before starting fresh
      cleanupAudio();

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Your browser does not support audio recording.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 44100,
        } 
      });
      mediaStreamRef.current = stream;
      startAudioAnalyser(stream);

      // Determine best supported mime type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const options = {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 128000,
      };

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (e) => {
        console.warn("MediaRecorder error:", e);
      };

      recorder.start(100); // Collect slice every 100ms for continuous capture
      setIsRecording(true);
      setInterviewStatus("recording");
      setRecordingSeconds(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setMicPermissionDenied(true);
      setErrorMsg("Microphone access was denied or is unavailable. Please check your browser permissions or use the text answer option below.");
      handleResetRecording();
    }
  };

  // Stop Recording and get complete Audio Blob with guaranteed timeout safety
  const stopRecordingAndGetBlob = () => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        const mimeType = recorder?.mimeType || "audio/webm";
        const blob = audioChunksRef.current.length > 0 ? new Blob(audioChunksRef.current, { type: mimeType }) : null;
        cleanupAudio();
        setIsRecording(false);
        resolve(blob);
        return;
      }

      let resolved = false;
      const finish = () => {
        if (resolved) return;
        resolved = true;
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = audioChunksRef.current.length > 0 ? new Blob(audioChunksRef.current, { type: mimeType }) : null;
        cleanupAudio();
        setIsRecording(false);
        resolve(blob);
      };

      // 1500ms safety timeout to prevent promise lockup
      const timeoutId = setTimeout(() => {
        console.warn("MediaRecorder onstop timeout reached, forcing blob resolution.");
        finish();
      }, 1500);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        clearTimeout(timeoutId);
        finish();
      };

      try {
        if (recorder.state === "recording") {
          recorder.requestData();
        }
      } catch (e) {
        console.warn("requestData error:", e);
      }

      try {
        recorder.stop();
      } catch (e) {
        console.warn("recorder.stop error:", e);
        clearTimeout(timeoutId);
        finish();
      }
    });
  };

  // Optional manual text answer state
  const [showTextInput, setShowTextInput] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");

  // Submit Answer to Backend (Audio Blob or Direct Text Answer)
  const handleSubmitRecordedAnswer = useCallback(async (customText) => {
    if (loading || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setSilenceCountdown(null);
    setLoading(true);
    setErrorMsg("");
    setInterviewStatus("evaluating");

    try {
      const formData = new FormData();
      formData.append("interviewId", id);

      const manualText = typeof customText === "string" ? customText.trim() : textAnswer.trim();

      if (manualText) {
        formData.append("answerText", manualText);
      } else {
        let audioBlob = null;
        if (isRecording) {
          audioBlob = await stopRecordingAndGetBlob();
        } else if (audioChunksRef.current.length > 0) {
          const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
          audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        }

        if (!audioBlob || audioBlob.size === 0) {
          throw new Error("No recorded voice answer found. Please click record, speak your answer, or type it below.");
        }

        formData.append("audio", audioBlob, "user_answer.webm");
      }

      const res = await fetch(`${API_BASE_URL}/api/interview/${id}/answer`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to transcribe and evaluate your answer. Please try again.");
      }

      const data = await res.json();

      // Reset recording and answer states completely on success
      audioChunksRef.current = [];
      setRecordingSeconds(0);
      hasSpokenRef.current = false;
      setSpeechDetected(false);
      setTextAnswer("");
      setShowTextInput(false);

      if (data.interviewEnded) {
        setInterviewStatus("completed");
        
        const reportRes = await fetch(`${API_BASE_URL}/api/interview/${id}/report`, {
          method: "POST",
          credentials: "include",
        });

        if (!reportRes.ok) {
          const errData = await reportRes.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to generate report.");
        }

        const reportData = await reportRes.json();

        // Update user-scoped localStorage history table
        const userKey = user?._id ? `hireiq_sessions_${user._id}` : "hireiq_sessions";
        const savedSessions = localStorage.getItem(userKey);
        if (savedSessions) {
          const sessions = JSON.parse(savedSessions);
          const updatedSessions = sessions.map((s) => {
            if (s.id === id) {
              return { 
                ...s, 
                status: "Completed", 
                score: Math.round(Number(reportData.overallScore) > 10 ? Number(reportData.overallScore) : Number(reportData.overallScore) * 10)
              };
            }
            return s;
          });
          localStorage.setItem(userKey, JSON.stringify(updatedSessions));
        }

        // Clean up active session cache
        localStorage.removeItem(`hireiq_active_question_${id}`);


        navigate(`/reports/${id}`);
      } else {
        // Next question
        const nextQ = {
          questionNumber: data.questionNumber,
          questionText: data.questionText,
          topic: data.topic,
          difficulty: data.difficulty,
        };

        localStorage.setItem(`hireiq_active_question_${id}`, JSON.stringify(nextQ));
        setQuestionNumber(nextQ.questionNumber);
        setQuestionText(nextQ.questionText);
        setTopic(nextQ.topic);
        setDifficulty(nextQ.difficulty);
      }
    } catch (error) {
      console.error("Answer submission failure:", error);
      setErrorMsg(error.message || "Failed to process answer. Please click 'Record Again' or type your response.");
      
      // Clean reset state so user can immediately record again without refreshing
      audioChunksRef.current = [];
      hasSpokenRef.current = false;
      setSpeechDetected(false);
      setSilenceCountdown(null);
      lastActiveTimeRef.current = Date.now();
      cleanupAudio();
      setIsRecording(false);
      setInterviewStatus("ready");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  }, [id, isRecording, loading, navigate, textAnswer]);

  // Silence Auto-Submit: Auto-submits after 3 full seconds of complete silence following speech
  useEffect(() => {
    if (!isRecording || loading) {
      setSilenceCountdown(null);
      return;
    }

    const interval = setInterval(() => {
      // Only evaluate silence if candidate has actually spoken
      if (!hasSpokenRef.current) {
        setSilenceCountdown(null);
        return;
      }

      const elapsedSinceActive = Date.now() - lastActiveTimeRef.current;
      const SILENCE_THRESHOLD_MS = 3000; // 3.0 seconds

      if (elapsedSinceActive >= SILENCE_THRESHOLD_MS) {
        setSilenceCountdown(null);
        clearInterval(interval);
        handleSubmitRecordedAnswer();
      } else if (elapsedSinceActive >= 1500) {
        // Show gentle countdown during the last 1.5s of verified silence
        const secondsLeft = Math.ceil((SILENCE_THRESHOLD_MS - elapsedSinceActive) / 1000);
        setSilenceCountdown(secondsLeft > 0 ? secondsLeft : null);
      } else {
        setSilenceCountdown(null);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [isRecording, loading, handleSubmitRecordedAnswer]);

  // Reset/Cancel current recording
  const handleResetRecording = () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      cleanupAudio();
      setIsRecording(false);
    }
    audioChunksRef.current = [];
    setRecordingSeconds(0);
    hasSpokenRef.current = false;
    setSpeechDetected(false);
    setSilenceCountdown(null);
    lastActiveTimeRef.current = Date.now();
    isSubmittingRef.current = false;
    setInterviewStatus("ready");
  };


  // Load first question on mount
  useEffect(() => {
    const storageKey = `hireiq_active_question_${id}`;
    const cachedQuestion = localStorage.getItem(storageKey);

    const loadState = async () => {
      const defaultMax = 10;

      if (cachedQuestion) {
        const q = JSON.parse(cachedQuestion);
        setQuestionNumber(q.questionNumber || 1);
        setMaxQuestions(q.maxQuestions || defaultMax);
        setQuestionText(q.questionText || "");
        setTopic(q.topic || "");
        setDifficulty(q.difficulty || "medium");
      } else if (location.state?.firstQuestion) {
        const q = location.state.firstQuestion;
        const totalQ = location.state.maxQuestions || defaultMax;
        setQuestionNumber(q.questionNumber || 1);
        setMaxQuestions(totalQ);
        setQuestionText(q.questionText || "");
        setTopic(q.topic || "");
        setDifficulty(q.difficulty || "medium");
        localStorage.setItem(storageKey, JSON.stringify({ ...q, maxQuestions: totalQ }));
      } else {
        try {
          const res = await fetch(`${API_BASE_URL}/api/interview/${id}`, {
            method: "GET",
            credentials: "include",
          });

          if (!res.ok) {
            throw new Error("Failed to fetch interview session from backend.");
          }

          const data = await res.json();
          
          if (data.status === "completed") {
            navigate(`/reports/${id}`);
            return;
          }

          const totalQ = data.maxQuestions || defaultMax;
          const q = {
            questionNumber: data.questionNumber || 1,
            maxQuestions: totalQ,
            questionText: data.questionText || "",
            topic: data.topic || "",
            difficulty: data.difficulty || "medium",
          };

          setQuestionNumber(q.questionNumber);
          setMaxQuestions(totalQ);
          setQuestionText(q.questionText);
          setTopic(q.topic);
          setDifficulty(q.difficulty);
          localStorage.setItem(storageKey, JSON.stringify(q));
        } catch (err) {
          console.error("Error loading interview state:", err);
          setErrorMsg("Failed to load interview state. Redirecting to dashboard...");
          setTimeout(() => navigate("/dashboard"), 3000);
        }
      }
    };

    loadState();


    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
      cleanupAudio();
    };
  }, [id, navigate, location.state]);

  // Typing effect & TTS trigger on question change
  useEffect(() => {
    if (!questionText) return;

    // Reset display cleanly
    setTypedQuestion("");
    setInterviewStatus("speaking");
    handleResetRecording();

    // 1. Play Voice
    speakQuestion(questionText);

    // 2. Typing Animation
    let currentLength = 0;
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    typingTimerRef.current = setInterval(() => {
      if (currentLength < questionText.length) {
        currentLength++;
        setTypedQuestion(questionText.slice(0, currentLength));
      } else {
        clearInterval(typingTimerRef.current);
      }
    }, 22);

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [questionText, questionNumber, audioEnabled, speakQuestion]);

  // Toggle voice audio output for AI questions
  const toggleAudio = () => {
    if (audioEnabled) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setAudioEnabled(false);
      setInterviewStatus("ready");
    } else {
      setAudioEnabled(true);
      if (questionText) {
        speakQuestion(questionText);
      }
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans antialiased text-slate-800 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 sm:py-10 flex flex-col gap-6">
        
        {/* Topic & Audio Controls Header */}
        <div className="flex justify-between items-center bg-white/60 border border-slate-200/50 rounded-2xl px-5 py-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 border border-amber-200/30">
              {topic || "AI Interview"}
            </span>
            <span className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-500 capitalize">
              {difficulty}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleAudio}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 transition cursor-pointer"
              title={audioEnabled ? "Mute AI Voice" : "Unmute AI Voice"}
            >
              {audioEnabled ? (
                <>
                  <Volume2 className="w-4.5 h-4.5 text-amber-600 animate-pulse" />
                  <span className="hidden sm:inline">AI Voice ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4.5 h-4.5 text-slate-400" />
                  <span className="hidden sm:inline">AI Voice OFF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Question Speaker Card */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/50 flex flex-col gap-6 text-left relative overflow-hidden">
          
          {/* Header indicator */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
              Question {questionNumber} of {maxQuestions}
            </span>

            
            {/* Visualizer Status */}
            <div className="flex items-center gap-2.5">
              {interviewStatus === "speaking" && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50/80 border border-amber-200/30 px-3 py-1 rounded-full animate-fade-in">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  AI speaking...
                </span>
              )}
              {interviewStatus === "ready" && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/40 px-3 py-1 rounded-full animate-fade-in">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Ready for your answer
                </span>
              )}
              {interviewStatus === "recording" && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200/40 px-3 py-1 rounded-full animate-fade-in">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  Recording your voice...
                </span>
              )}
              {interviewStatus === "evaluating" && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200/30 px-3 py-1 rounded-full animate-fade-in">
                  <span className="w-3 h-3 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></span>
                  Processing & Evaluating Answer...
                </span>
              )}
            </div>
          </div>

          {/* AI Audio Waveform Visualizers */}
          <div className="flex items-center justify-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/70">
            {interviewStatus === "speaking" ? (
              <div className="flex items-end gap-1.5 h-14 select-none">
                <div className="w-1.5 bg-amber-500 rounded-full animate-[bar-wave_0.7s_ease-in-out_infinite_0.1s] h-4"></div>
                <div className="w-1.5 bg-amber-600 rounded-full animate-[bar-wave_0.7s_ease-in-out_infinite_0.3s] h-10"></div>
                <div className="w-1.5 bg-amber-500 rounded-full animate-[bar-wave_0.7s_ease-in-out_infinite_0.5s] h-14"></div>
                <div className="w-1.5 bg-amber-600 rounded-full animate-[bar-wave_0.7s_ease-in-out_infinite_0.2s] h-8"></div>
                <div className="w-1.5 bg-amber-500 rounded-full animate-[bar-wave_0.7s_ease-in-out_infinite_0.4s] h-12"></div>
                <div className="w-1.5 bg-amber-600 rounded-full animate-[bar-wave_0.7s_ease-in-out_infinite_0.6s] h-6"></div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Listen to question above, then record your voice answer below</span>
              </div>
            )}
          </div>

          {/* AI Question Transcript Text */}
          <div className="min-h-[80px] flex flex-col justify-start">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {typedQuestion || questionText}
              {interviewStatus === "speaking" && typedQuestion.length < questionText.length && (
                <span className="inline-block w-1.5 h-5 bg-amber-500 ml-1 animate-pulse align-middle"></span>
              )}
            </h2>
          </div>
        </div>

        {/* Voice Response Area */}
        <div className="bg-[#F2F1EC]/60 border border-slate-200/70 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/40 text-left flex flex-col gap-6">
          
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                Candidate Voice Response
              </span>
              <p className="text-sm font-semibold text-slate-600 mt-0.5">
                Record your voice answer clearly. Our AI interviewer will analyze and evaluate your response.
              </p>
            </div>


            {/* Silence Auto-submit Timer / Recording Timer Badges */}
            <div className="flex items-center gap-2">
              {silenceCountdown !== null && (
                <div className="inline-flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-extrabold px-3 py-1.5 rounded-xl animate-pulse shadow-xs">
                  <Timer className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>Auto-submitting in {silenceCountdown}s...</span>
                </div>
              )}
              
              {isRecording && (
                <div className="inline-flex items-center gap-1.5 bg-red-100 border border-red-300 text-red-700 text-xs font-extrabold px-3 py-1.5 rounded-xl animate-pulse">
                  <Clock className="w-4 h-4 text-red-600 animate-spin" />
                  <span>{formatTime(recordingSeconds)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Microphone Permission Warning if any */}
          {micPermissionDenied && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Microphone access was denied or is unavailable. Please enable microphone permissions in your browser.</span>
            </div>
          )}

          {/* Error Message & Quick Actions Banner */}
          {errorMsg && (
            <div className="bg-red-50/90 border border-red-200 text-red-700 text-xs font-semibold p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    handleResetRecording();
                    startRecording();
                  }}
                  className="px-3.5 py-1.5 bg-white border border-red-200 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Voice</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setShowTextInput(true);
                  }}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Type Answer</span>
                </button>
              </div>
            </div>
          )}

          {/* Optional Text Answer Fallback Input */}
          {showTextInput ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-amber-600" />
                  Written Response Mode
                </label>
                <button
                  type="button"
                  onClick={() => setShowTextInput(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  Switch back to Voice
                </button>
              </div>
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your technical answer here in detail..."
                rows={4}
                disabled={loading}
                className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmitRecordedAnswer(textAnswer)}
                  disabled={loading || !textAnswer.trim()}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition duration-150 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Evaluating Answer...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Written Answer</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Voice Console Card */
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
              
              {/* Live Visualizer + Mic Button Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-150">
                
                {/* Mic Status & Trigger */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={isRecording ? handleSubmitRecordedAnswer : startRecording}
                    disabled={loading || interviewStatus === "speaking"}
                    className={`relative p-4 rounded-2xl font-bold text-white transition duration-200 shadow-md active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 ring-4 ring-red-200 animate-pulse"
                        : "bg-amber-600 hover:bg-amber-700"
                    }`}
                    title={isRecording ? "Stop & Submit Answer" : "Start Recording Answer"}
                  >
                    {isRecording ? (
                      <Square className="w-6 h-6 fill-current" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                  </button>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-800">
                        {isRecording ? "Recording in Progress" : "Microphone Ready"}
                      </span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isRecording ? "bg-red-500 animate-ping" : "bg-slate-300"
                        }`}
                      ></span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium mt-0.5">
                      {isRecording
                        ? "Speak your answer clearly. Auto-submits after 3s of silence when you finish."
                        : "Click the mic button to start recording your response"}
                    </span>
                  </div>
                </div>

                {/* Dynamic Soundwave Bars based on audio level */}
                <div className="flex items-center gap-1.5 h-10 px-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs select-none">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => {
                    const height = isRecording
                      ? Math.max(6, Math.min(32, (audioLevel / 100) * 32 * (bar % 2 === 0 ? 1.3 : 0.7) + (bar * 2)))
                      : 4;
                    return (
                      <div
                        key={bar}
                        className={`w-1 rounded-full transition-all duration-75 ${
                          isRecording ? (audioLevel > 10 ? "bg-emerald-500" : "bg-amber-500") : "bg-slate-200"
                        }`}
                        style={{ height: `${height}px` }}
                      ></div>
                    );
                  })}
                </div>

              </div>

              {/* Audio Recording Status Banner */}
              <div className="py-6 px-5 bg-slate-50/50 border border-slate-200/80 rounded-xl flex flex-col items-center justify-center text-center gap-2">
                {loading ? (
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                    <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                    <span>Processing audio & evaluating response...</span>
                  </div>
                ) : silenceCountdown !== null ? (

                  <div className="flex flex-col items-center gap-1 text-amber-700">
                    <span className="text-sm font-extrabold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                      Silence detected. Auto-submitting in {silenceCountdown}s...
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      (Resume speaking anytime to continue answering)
                    </span>
                  </div>
                ) : isRecording && speechDetected ? (
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Capturing your voice... Auto-submits after 3 seconds of silence.</span>
                  </div>
                ) : isRecording ? (
                  <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <span>Recording voice ({formatTime(recordingSeconds)})... Speak your answer clearly.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
                    <Mic className="w-4 h-4 text-amber-500" />
                    <span>Click "Start Recording" or the microphone button above to answer.</span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-1">
            <div className="flex items-center gap-2">
              {isRecording && (
                <button
                  type="button"
                  onClick={handleResetRecording}
                  disabled={loading}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-red-600 bg-white border border-slate-200 rounded-xl transition hover:bg-red-50 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Cancel and re-record"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Cancel Recording</span>
                </button>
              )}
              {!showTextInput && (
                <button
                  type="button"
                  onClick={() => setShowTextInput(true)}
                  disabled={loading || isRecording}
                  className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-amber-600 bg-white border border-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  title="Prefer typing?"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Type Answer Instead</span>
                </button>
              )}
              <p className="text-xs text-slate-400 font-medium select-none hidden sm:inline">
                🎙️ Auto-submits after 3s silence • Or click submit anytime
              </p>
            </div>

            {!showTextInput && (
              <button
                type="button"
                onClick={isRecording ? handleSubmitRecordedAnswer : startRecording}
                disabled={loading || interviewStatus === "speaking"}
                className={`w-full sm:w-auto px-8 py-4 font-bold text-sm rounded-xl transition duration-150 shadow-md hover:shadow-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer ${
                  isRecording 
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-[#121212] hover:bg-slate-800 text-white"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Processing Voice...</span>
                  </>
                ) : isRecording ? (
                  <>
                    <span>Submit Voice Answer</span>
                    <Send className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Start Recording Answer</span>
                  </>
                )}
              </button>
            )}
          </div>


        </div>

      </main>

      {/* Global CSS Wave Animation keyframes injection */}
      <style>{`
        @keyframes bar-wave {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(2.2);
          }
        }
      `}</style>
    </div>
  );
};

export default InterviewSessionPage;
