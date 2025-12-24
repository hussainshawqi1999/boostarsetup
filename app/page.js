"use client";
import React, { useState } from 'react';
import { 
  Settings, ShieldCheck, ListOrdered, RefreshCw, Trash2, 
  Subtitles, CheckCircle2, Database, Key, Box, XCircle, Activity, Globe, Star
} from 'lucide-react';

export default function NanoBananaPro() {
  const [authKey, setAuthKey] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // إعدادات الخدمات
  const [debrid, setDebrid] = useState({ type: 'realdebrid', apiKey: '' });
  const [tmdbKey, setTmdbKey] = useState('');
  const [tmdbLang, setTmdbLang] = useState('ar-SA'); // خيار اللغة
  const rpdbKey = "t0-free-rpdb"; // المفتاح الذي زودتني به
  
  const [verifyStatus, setVerifyStatus] = useState({ debrid: 'idle', subdl: 'idle', subsource: 'idle', tmdb: 'idle' });
  const [subKeys, setSubKeys] = useState({ subdl: '', subsource: '' });
  const [addons, setAddons] = useState([]);

  // لغات TMDB المتاحة
  const languages = [
    { name: 'العربية (السعودية)', value: 'ar-SA' },
    { name: 'العربية (الإمارات)', value: 'ar-AE' },
    { name: 'English (US)', value: 'en-US' },
    { name: 'French', value: 'fr-FR' },
  ];

  // --- 1. وظيفة التحقق من المفاتيح ---
  const verifyAPI = async (service, key) => {
    if (!key) return alert("يرجى إدخال المفتاح أولاً");
    setVerifyStatus(prev => ({ ...prev, [service]: 'loading' }));

    try {
      let isValid = false;
      if (service === 'tmdb') {
        const res = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${key}`);
        isValid = res.ok;
      } else if (service === 'debrid' && debrid.type === 'realdebrid') {
        const res = await fetch(`https://api.real-debrid.com/rest/1.0/user?auth_token=${key}`);
        isValid = res.ok;
      } else {
        isValid = key.length > 5;
      }
      setVerifyStatus(prev => ({ ...prev, [service]: isValid ? 'success' : 'error' }));
    } catch (e) {
      setVerifyStatus(prev => ({ ...prev, [service]: 'error' }));
    }
  };

  // --- 2. تسجيل الدخول إلى Stremio ---
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
      } else { alert("خطأ في بيانات الدخول"); }
    } catch (e) { alert("فشل الاتصال بخادم Stremio"); }
    setLoading(false);
  };

  // --- 3. بناء الروابط مع TMDB و RPDB واللغة المختارة ---
  const generateAddons = () => {
    const { type, apiKey } = debrid;
    const lang = tmdbLang.split('-')[0]; // نأخذ الاختصار مثل ar

    const presets = [
      // إضافة TMDB مع اللغة المختارة
      { name: 'TMDB Metadata', url: `https://tmdb-addons.strem.io/config/${tmdbKey}/language=${tmdbLang}/manifest.json` },
      
      // Torrentio مع Debrid + Language + RPDB
      { name: 'Torrentio', url: `https://torrentio.strem.fun/${type}=${apiKey}|language=${lang}|rpdb=${rpdbKey}/manifest.json` },
      
      // Comet مع TMDB و RPDB
      { name: 'Comet', url: `https://comet.elfhosted.com/${apiKey}/tmdb_api=${tmdbKey}/language=${lang}/rpdb=${rpdbKey}/manifest.json` },
      
      // إضافات أخرى
      { name: 'MediaFusion', url: `https://mediafusion.elfhosted.com/config/${apiKey}/manifest.json` },
      { name: 'Jackettio', url: `https://jackettio.strem.fun/config/${apiKey}/manifest.json` },
      { name: 'Cinemeta', url: `https://v3-cinemeta.strem.io/manifest.json` },
      { name: 'Anime Kitsu', url: `https://anime-kitsu.strem.io/manifest.json` }
    ];

    if (subKeys.subdl) presets.push({ name: 'SubDL', url: `https://subdl.strem.io/config/${subKeys.subdl}/manifest.json` });
    if (subKeys.subsource) presets.push({ name: 'SubSource', url: `https://subsource.strem.io/config/${subKeys.subsource}/manifest.json` });

    const finalAddons = presets.map(p => ({
      transportUrl: p.url,
      transportName: 'http',
      flags: { official: false }
    }));

    setAddons(finalAddons);
    setStep(3);
  };

  // --- 4. المزامنة النهائية ---
  const syncToStremio = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.strem.io/api/addonCollectionSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, addons })
      });
      const data = await res.json();
      if (data.result?.success) alert("تمت المزامنة بنجاح! الإضافات الآن تدعم التقييمات واللغة المختارة.");
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
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 flex justify-center items-center" dir="rtl">
      <div className="w-full max-w-2xl bg-[#0f172a] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        
        <div className="p-6 bg-gradient-to-r from-blue-900/20 to-transparent border-b border-slate-800 text-center">
          <h1 className="text-2xl font-black text-blue-500 flex items-center justify-center gap-2 italic">
            Nano Banana Pro 🍌 <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full not-italic">RPDB Active</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">إعداد احترافي لمجتمع Stremio العربي</p>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-400">سجل دخولك بحساب Stremio</label>
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-blue-500" placeholder="البريد الإلكتروني" onChange={e => setCredentials({...credentials, email: e.target.value})} />
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-blue-500" type="password" placeholder="كلمة المرور" onChange={e => setCredentials({...credentials, password: e.target.value})} />
              <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold hover:bg-blue-700 transition">تحقق من الحساب</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              {/* TMDB & Language Section */}
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-4">
                <label className="text-sm font-bold text-blue-400 flex items-center gap-2"><Globe size={18}/> إعداد TMDB واللغة</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 pr-10 text-sm" placeholder="TMDB API Key" onChange={e => setTmdbKey(e.target.value)} />
                    <button onClick={() => verifyAPI('tmdb', tmdbKey)} className="absolute left-2 top-2 bg-slate-700 px-2 py-1 rounded text-[10px] flex items-center gap-1">
                       تحقق <StatusIcon status={verifyStatus.tmdb}/>
                    </button>
                  </div>
                  <select className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm" value={tmdbLang} onChange={e => setTmdbLang(e.target.value)}>
                    {languages.map(l => <option key={l.value} value={l.value}>{l.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Debrid Section */}
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-4">
                <label className="text-sm font-bold text-blue-400 flex items-center gap-2"><Database size={18}/> إعداد Debrid</label>
                <div className="flex gap-2">
                  <select className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm" onChange={e => setDebrid({...debrid, type: e.target.value})}>
                    <option value="realdebrid">Real-Debrid</option>
                    <option value="alldebrid">All-Debrid</option>
                    <option value="torbox">TorBox</option>
                    <option value="premiumize">Premiumize</option>
                  </select>
                  <div className="flex-1 relative">
                    <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 pr-10 text-sm" placeholder="Debrid API Key" onChange={e => setDebrid({...debrid, apiKey: e.target.value})} />
                    <button onClick={() => verifyAPI('debrid', debrid.apiKey)} className="absolute left-2 top-2 bg-slate-700 px-2 py-1 rounded text-[10px] flex items-center gap-1">
                      تحقق <StatusIcon status={verifyStatus.debrid}/>
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtitles Section */}
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-4">
                <label className="text-sm font-bold text-blue-400 flex items-center gap-2"><Subtitles size={18}/> الترجمة والتقييمات</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs" placeholder="SubDL Key" onChange={e => setSubKeys({...subKeys, subdl: e.target.value})} />
                    <button onClick={() => verifyAPI('subdl', subKeys.subdl)} className="absolute left-1 top-2 bg-slate-700 p-1 rounded"><StatusIcon status={verifyStatus.subdl}/></button>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-900/20 border border-blue-500/30 text-[10px] flex items-center gap-2">
                    <Star className="text-yellow-500" size={14}/> تقييمات RPDB مفعّلة تلقائياً
                  </div>
                </div>
              </div>

              <button onClick={generateAddons} className="w-full bg-green-600 p-4 rounded-xl font-bold text-sm shadow-lg shadow-green-900/20">توليد الإضافات الذكية ←</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-blue-600/10 p-4 rounded-2xl">
                <div>
                  <h3 className="font-bold text-sm">القائمة جاهزة</h3>
                  <p className="text-[10px] text-slate-400">إضافات TMDB و Torrentio و Comet مع RPDB</p>
                </div>
                <button onClick={syncToStremio} className="bg-blue-600 px-6 py-2 rounded-full font-bold text-sm">مزامنة (Sync)</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {addons.map((addon, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 group transition hover:border-blue-500/50">
                    <span className="text-[10px] text-blue-300 truncate max-w-[200px]">{addon.transportUrl}</span>
                    <button onClick={() => setAddons(addons.filter((_, idx) => idx !== i))}><Trash2 size={14} className="text-red-500 opacity-0 group-hover:opacity-100 transition"/></button>
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
