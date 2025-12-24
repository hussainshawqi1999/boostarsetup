"use client";
import React, { useState } from 'react';
import { 
  Settings, ShieldCheck, ListOrdered, RefreshCw, Trash2, 
  Subtitles, CheckCircle2, Database, Globe, Star, XCircle, Activity, Layout 
} from 'lucide-react';

export default function NanoBananaPro() {
  const [authKey, setAuthKey] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // إعدادات الخدمات واللغة
  const [debrid, setDebrid] = useState({ type: 'realdebrid', apiKey: '' });
  const [tmdbKey, setTmdbKey] = useState('');
  const [tmdbLang, setTmdbLang] = useState('ar-SA');
  const rpdbKey = "t0-free-rpdb"; // مفتاح التقييمات المدمج
  
  const [verifyStatus, setVerifyStatus] = useState({ debrid: 'idle', tmdb: 'idle' });
  const [subKeys, setSubKeys] = useState({ subdl: '', subsource: '' });
  const [addons, setAddons] = useState([]);

  const languages = [
    { name: 'العربية (السعودية)', value: 'ar-SA' },
    { name: 'العربية (الإمارات)', value: 'ar-AE' },
    { name: 'English (US)', value: 'en-US' },
    { name: 'French', value: 'fr-FR' },
  ];

  // --- وظيفة التحقق عبر السيرفر (تجاوز مشكلة الـ X و CORS) ---
  const verifyAPI = async (service, key) => {
    if (!key) return alert("يرجى إدخال المفتاح أولاً");
    setVerifyStatus(prev => ({ ...prev, [service]: 'loading' }));

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, type: debrid.type, key })
      });

      const data = await res.json();
      setVerifyStatus(prev => ({ ...prev, [service]: data.success ? 'success' : 'error' }));
    } catch (e) {
      setVerifyStatus(prev => ({ ...prev, [service]: 'error' }));
    }
  };

  // --- تسجيل الدخول إلى ستريميو ---
  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.strem.io/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...credentials, type: 'Login' })
      });
      const data = await res.json();
      if (data.result?.authKey) {
        setAuthKey(data.result.authKey);
        setStep(2);
      } else { alert("بيانات الدخول غير صحيحة"); }
    } catch (e) { alert("فشل الاتصال بخادم Stremio"); }
    setLoading(false);
  };

  // --- بناء روابط الإضافات مع TMDB + RPDB + Arabic ---
  const generateAddons = () => {
    const { type, apiKey } = debrid;
    const shortLang = tmdbLang.split('-')[0];

    const presets = [
      // إضافة TMDB مع اللغة المختارة
      { name: 'TMDB Arabic', url: `https://tmdb-addons.strem.io/config/${tmdbKey}/language=${tmdbLang}/manifest.json` },
      
      // Torrentio مع Debrid + RPDB + Language
      { name: 'Torrentio', url: `https://torrentio.strem.fun/${type}=${apiKey}|language=${shortLang}|rpdb=${rpdbKey}/manifest.json` },
      
      // Comet مع TMDB و RPDB واللغة
      { name: 'Comet', url: `https://comet.elfhosted.com/${apiKey}/tmdb_api=${tmdbKey}/language=${shortLang}/rpdb=${rpdbKey}/manifest.json` },
      
      // إضافات ثابتة وأدوات
      { name: 'Jackettio', url: `https://jackettio.strem.fun/config/${apiKey}/manifest.json` },
      { name: 'MediaFusion', url: `https://mediafusion.elfhosted.com/config/${apiKey}/manifest.json` },
      { name: 'Cinemeta', url: `https://v3-cinemeta.strem.io/manifest.json` },
      { name: 'Anime Kitsu', url: `https://anime-kitsu.strem.io/manifest.json` }
    ];

    if (subKeys.subdl) presets.push({ name: 'SubDL', url: `https://subdl.strem.io/config/${subKeys.subdl}/manifest.json` });
    if (subKeys.subsource) presets.push({ name: 'SubSource', url: `https://subsource.strem.io/config/${subKeys.subsource}/manifest.json` });

    // تنظيف الهيكل لمنع خطأ الـ Manifest Null
    setAddons(presets.map(p => ({ 
        transportUrl: p.url, 
        transportName: 'http', 
        flags: { official: false } 
    })));
    setStep(3);
  };

  // --- المزامنة النهائية ---
  const syncToStremio = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.strem.io/api/addonCollectionSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, addons })
      });
      const data = await res.json();
      if (data.result?.success) alert("تمت المزامنة بنجاح يا حسين! استمتع بالمشاهدة.");
    } catch (e) { alert("فشلت المزامنة"); }
    setLoading(false);
  };

  const StatusIcon = ({ status }) => {
    if (status === 'loading') return <Activity className="animate-spin text-blue-400" size={16}/>;
    if (status === 'success') return <CheckCircle2 className="text-green-500" size={16}/>;
    if (status === 'error') return <XCircle className="text-red-500" size={16}/>;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-4 md:p-10 flex justify-center items-center" dir="rtl">
      <div className="w-full max-w-2xl bg-[#0f172a] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-8 bg-blue-600/10 border-b border-slate-800 text-center">
          <h1 className="text-3xl font-black text-blue-500 italic">Nano Banana Pro 🍌</h1>
          <p className="text-slate-400 text-xs mt-1 tracking-widest uppercase">The Ultimate Stremio Configurator</p>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-500">حساب Stremio</label>
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none transition" placeholder="البريد الإلكتروني" onChange={e => setCredentials({...credentials, email: e.target.value})} />
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none transition" type="password" placeholder="كلمة المرور" onChange={e => setCredentials({...credentials, password: e.target.value})} />
              <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold hover:bg-blue-700 transition">تسجيل الدخول</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* TMDB & Language */}
              <div className="space-y-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <label className="text-sm font-bold text-blue-400 flex items-center gap-2"><Globe size={18}/> إعداد TMDB واللغة</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm pr-12" placeholder="TMDB API Key" onChange={e => setTmdbKey(e.target.value)} />
                    <button onClick={() => verifyAPI('tmdb', tmdbKey)} className="absolute left-2 top-2 bg-slate-700 px-2 py-1 rounded text-[10px] flex items-center gap-1">تحقق <StatusIcon status={verifyStatus.tmdb}/></button>
                  </div>
                  <select className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm" value={tmdbLang} onChange={e => setTmdbLang(e.target.value)}>
                    {languages.map(l => <option key={l.value} value={l.value}>{l.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Debrid Selector & Key */}
              <div className="space-y-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <label className="text-sm font-bold text-blue-400 flex items-center gap-2"><Database size={18}/> إعداد Debrid</label>
                <div className="flex flex-col md:flex-row gap-2">
                  <select className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm" onChange={e => setDebrid({...debrid, type: e.target.value})}>
                    <option value="realdebrid">Real-Debrid</option>
                    <option value="torbox">TorBox</option>
                    <option value="alldebrid">All-Debrid</option>
                    <option value="premiumize">Premiumize</option>
                  </select>
                  <div className="flex-1 relative">
                    <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm pr-12" placeholder="Debrid API Key" onChange={e => setDebrid({...debrid, apiKey: e.target.value})} />
                    <button onClick={() => verifyAPI('debrid', debrid.apiKey)} className="absolute left-2 top-2 bg-slate-700 px-2 py-1 rounded text-[10px] flex items-center gap-1 font-bold">تحقق <StatusIcon status={verifyStatus.debrid}/></button>
                  </div>
                </div>
              </div>

              {/* RPDB Banner */}
              <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/30 flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-blue-400 text-xs uppercase italic tracking-wider">
                  <Star size={16} className="text-yellow-500 animate-pulse" /> RPDB Active (t0-free-rpdb)
                </div>
                <input className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-[10px] w-24" placeholder="SubDL Key" onChange={e => setSubKeys({...subKeys, subdl: e.target.value})} />
              </div>

              <button onClick={generateAddons} className="w-full bg-green-600 p-4 rounded-xl font-bold shadow-lg shadow-green-900/20 hover:bg-green-700 transition">توليد الإضافات وترتيبها ←</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                <h2 className="font-bold text-sm">القائمة النهائية جاهزة</h2>
                <button onClick={syncToStremio} className="bg-blue-600 px-6 py-2 rounded-full font-bold animate-pulse hover:animate-none">مزامنة الآن (Sync)</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {addons.map((addon, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 group hover:border-blue-500/50 transition">
                    <span className="text-[10px] text-blue-300 truncate max-w-[200px] font-mono">{addon.transportUrl}</span>
                    <button onClick={() => setAddons(addons.filter((_, idx) => idx !== i))}><Trash2 size={16} className="text-red-500 opacity-0 group-hover:opacity-100 transition"/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
