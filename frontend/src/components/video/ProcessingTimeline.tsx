import React from 'react';
import { VideoStatus, ProcessingStep } from '../../types';
import { CheckCircle2, XCircle, Loader2, Circle } from 'lucide-react';

const PIPELINE_STEPS = [
  { key: 'extract_audio', label: 'Extract Audio', desc: 'Separating audio track from video using FFmpeg', status: 'extracting_audio' as VideoStatus },
  { key: 'transcribe', label: 'Transcribe Hindi', desc: 'Converting Hindi speech to text via Groq Whisper', status: 'transcribing' as VideoStatus },
  { key: 'translate', label: 'Translate to English', desc: 'Translating with LLaMA 3.3 70B preserving emotion', status: 'translating' as VideoStatus },
  { key: 'generate_speech', label: 'Generate Voice', desc: 'Synthesizing English speech with Google TTS (free)', status: 'generating_speech' as VideoStatus },
  { key: 'merge', label: 'Merge & Export', desc: 'Combining dubbed audio with original video', status: 'merging' as VideoStatus },
];

const STATUS_ORDER: VideoStatus[] = [
  'uploaded', 'extracting_audio', 'transcribing', 'translating', 'generating_speech', 'merging', 'completed', 'failed'
];

interface Props {
  currentStatus: VideoStatus;
  processingSteps?: ProcessingStep[];
}

export const ProcessingTimeline: React.FC<Props> = ({ currentStatus, processingSteps = [] }) => {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  const getStepState = (pipelineIdx: number): 'completed' | 'in_progress' | 'failed' | 'pending' => {
    const pipelineStatus = PIPELINE_STEPS[pipelineIdx].status;
    const pipelineStatusIdx = STATUS_ORDER.indexOf(pipelineStatus);

    if (currentStatus === 'failed') {
      const loggedStep = processingSteps.find(s => s.step === PIPELINE_STEPS[pipelineIdx].key);
      if (loggedStep?.status === 'failed') return 'failed';
      if (pipelineStatusIdx < currentIdx) return 'completed';
      return 'pending';
    }

    if (currentStatus === 'completed') return 'completed';
    if (pipelineStatusIdx < currentIdx) return 'completed';
    if (pipelineStatusIdx === currentIdx) return 'in_progress';
    return 'pending';
  };

  return (
    <div className="space-y-2">
      {PIPELINE_STEPS.map((step, i) => {
        const state = getStepState(i);
        const loggedStep = processingSteps.find(s => s.step === step.key);

        return (
          <div key={step.key} className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
            state === 'in_progress' ? 'bg-brand-500/8 border-brand-500/20' :
            state === 'completed' ? 'bg-emerald-500/5 border-emerald-500/15' :
            state === 'failed' ? 'bg-red-500/8 border-red-500/20' :
            'bg-surface-900 border-white/5 opacity-50'
          }`}>
            {/* Icon */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              state === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
              state === 'in_progress' ? 'bg-brand-500/20 text-brand-400' :
              state === 'failed' ? 'bg-red-500/20 text-red-400' :
              'bg-white/5 text-slate-600'
            }`}>
              {state === 'completed' ? <CheckCircle2 size={14} /> :
               state === 'in_progress' ? <Loader2 size={14} className="animate-spin" /> :
               state === 'failed' ? <XCircle size={14} /> :
               <Circle size={14} />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-semibold ${
                  state === 'completed' ? 'text-emerald-300' :
                  state === 'in_progress' ? 'text-brand-300' :
                  state === 'failed' ? 'text-red-300' :
                  'text-slate-500'
                }`}>
                  {step.label}
                </span>
                {loggedStep?.duration && (
                  <span className="text-xs text-slate-600">
                    {(loggedStep.duration / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${state !== 'pending' ? 'text-slate-400' : 'text-slate-600'}`}>
                {loggedStep?.message || step.desc}
              </p>
            </div>

            {/* Step number */}
            <span className="text-xs text-slate-700 font-mono shrink-0">0{i + 1}</span>
          </div>
        );
      })}
    </div>
  );
};
