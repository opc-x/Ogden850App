import React, { useCallback, useEffect, useState } from 'react';
import { Volume2, Star, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../config';
import {
  TTS_SAMPLE_SENTENCE,
  findCatalogEntry,
  getPreferredVoiceUri,
  setPreferredVoiceUri,
  clearPreferredVoiceUri,
} from '../config/ttsVoices';

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}


function genderBadge(gender?: string) {
  if (gender === 'female') return '♀ 女';
  if (gender === 'male') return '♂ 男';
  if (gender === 'neutral') return '○';
  return '';
}

export function VoiceAuditionView() {
  const navigate = useNavigate();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [preferredUri, setPreferredUri] = useState<string | null>(null);
  const [playingUri, setPlayingUri] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'en-gb' | 'en-us' | 'other'>('all');

  const refresh = useCallback(() => {
    setVoices(loadVoices());
    setPreferredUri(getPreferredVoiceUri());
  }, []);

  useEffect(() => {
    refresh();
    window.speechSynthesis?.addEventListener('voiceschanged', refresh);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', refresh);
  }, [refresh]);

  const filtered = voices.filter((v) => {
    const lang = v.lang.toLowerCase();
    if (filter === 'en-gb') return lang.startsWith('en-gb');
    if (filter === 'en-us') return lang.startsWith('en-us');
    if (filter === 'other') return lang.startsWith('en') && !lang.startsWith('en-gb') && !lang.startsWith('en-us');
    return lang.startsWith('en');
  });

  const handlePlay = (voice: SpeechSynthesisVoice) => {
    setPlayingUri(voice.voiceURI);
    const synth = window.speechSynthesis;
    if (synth.paused) synth.resume();
    synth.cancel();
    const u = new SpeechSynthesisUtterance(TTS_SAMPLE_SENTENCE);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = APP_CONFIG.TTS.SPEECH_RATE;
    u.onend = () => setPlayingUri(null);
    u.onerror = () => setPlayingUri(null);
    synth.speak(u);
  };

  const handleSelect = (voice: SpeechSynthesisVoice) => {
    setPreferredVoiceUri(voice.voiceURI);
    setPreferredUri(voice.voiceURI);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-800 font-sans">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 pt-safe">
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={() => navigate('/browser')}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-slate-800">音色试听对比</h1>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed pl-1">
          点击下方每条右侧 🔊 播放同一句英文，对比后点「设为默认」。共 {filtered.length} 个英文音色。
        </p>
      </header>

      <div className="px-4 py-3">
        <blockquote className="rounded-2xl bg-cyan-50 border border-cyan-100 px-4 py-3 text-sm text-slate-700 leading-relaxed italic">
          「{TTS_SAMPLE_SENTENCE}」
        </blockquote>

        <div className="flex gap-2 mt-3 flex-wrap">
          {(['all', 'en-gb', 'en-us', 'other'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                filter === f
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {f === 'all' ? '全部英文' : f === 'en-gb' ? '英式 en-GB' : f === 'en-us' ? '美式 en-US' : '其他 en'}
            </button>
          ))}
        </div>

        {preferredUri && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs">
            <span className="text-emerald-800 font-semibold truncate flex-1">
              已选默认：{voices.find((v) => v.voiceURI === preferredUri)?.name ?? preferredUri}
            </span>
            <button
              type="button"
              onClick={() => { clearPreferredVoiceUri(); setPreferredUri(null); }}
              className="text-emerald-600 underline shrink-0 ml-2"
            >
              清除
            </button>
          </div>
        )}
      </div>

      <ul className="px-4 pb-8 space-y-2">
        {filtered.length === 0 && (
          <li className="text-center text-slate-400 py-12 text-sm">语音列表加载中…请稍候或刷新页面</li>
        )}
        {filtered.map((voice) => {
          const catalog = findCatalogEntry(voice.name);
          const isPreferred = voice.voiceURI === preferredUri;
          const isPlaying = voice.voiceURI === playingUri;

          return (
            <li
              key={voice.voiceURI}
              className={`rounded-2xl border bg-white px-3 py-2.5 flex items-center gap-2 transition-shadow ${
                isPreferred ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'
              } ${isPlaying ? 'shadow-md' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm text-slate-800 truncate">{voice.name}</span>
                  {voice.default && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">系统默认</span>
                  )}
                  {catalog?.note && (
                    <span className="text-[10px] bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded">{catalog.note}</span>
                  )}
                  {isPreferred && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> 默认
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {voice.lang}
                  {catalog?.gender && ` · ${genderBadge(catalog.gender)}`}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handlePlay(voice)}
                className={`p-2 rounded-full shrink-0 transition-colors ${
                  isPlaying ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-cyan-600 hover:bg-cyan-100'
                }`}
                title="播放试听句"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleSelect(voice)}
                className={`p-2 rounded-full shrink-0 transition-colors ${
                  isPreferred ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-amber-500 hover:bg-amber-50'
                }`}
                title="设为词典默认发音"
              >
                <Star className={`w-4 h-4 ${isPreferred ? 'fill-white' : ''}`} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
