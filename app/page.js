"use client";
import React, { useState } from 'react';
import { 
  ShieldCheck, RefreshCw, Trash2, Globe, Star, Database, CheckCircle2, XCircle, Activity, Info
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
  const rpdbKey = "t0-free-rpdb"; // مفتاح RPDB المجاني المدمج
  
  const [verifyStatus, setVerifyStatus] = useState({ debrid: 'idle', tmdb: 'idle' });
  const [subKeys, setSubKeys] = useState({ subdl: '', subsource: '' });
  const [addons, setAddons] = useState([]);

  const languages = [
    { name: 'العربية (السعودية)', value: 'ar-SA' },
    { name: 'English (US)', value: 'en-US' },
  ];

  // --- التحقق من الـ API عبر الخادم الوسيط لتجنب مشكلة الـ X و CORS ---
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

  // --- تسجيل دخول Stremio ---
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

  // --- تنظيف الحساب من الإضافات التالفة لحل خطأ Manifest Null ---
  const clearAccount = async () => {
    if (!confirm("سيتم مسح جميع الإضافات الحالية لتنظيف الحساب، هل أنت موافق؟")) return;
    setLoading(true);
    try {
      await fetch('https://api.strem.io/api/addonCollectionSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, addons: [] })
      });
      alert("تم تنظيف الحساب! يمكنك الآن البدء بإضافة الروابط الجديدة.");
      setAddons([]);
    } catch (e) { alert("فشل التنظيف"); }
    setLoading(false);
  };

  // --- بناء مصفوفة الإضافات باللغة والتقييمات ---
  const generateAddons = () => {
    const { type, apiKey } = debrid;
    const shortLang = tmdbLang.split('-')[0];

    const presets = [
      { name: 'TMDB Arabic', url: `https://tmdb-addons.strem.io/config/${tmdbKey}/language=${tmdbLang}/manifest.json` },
      { name: 'Torrentio', url: `https://torrentio.strem.fun/${type}=${apiKey}|language=${shortLang}|rpdb=${rpdbKey}/manifest.json` },
      { name: 'Comet', url: `https://comet.elfhosted.com/${apiKey}/tmdb_api=${tmdbKey}/language=${shortLang}/rpdb=${rpdbKey}/manifest.json` },
      { name: 'MediaFusion', url: `https://mediafusion.elfhosted.com/config/${apiKey}/manifest.json` },
      { name: 'Cinemeta', url: `https://v3-cinemeta.strem.io/manifest.json` },
      { name: 'Anime Kitsu', url: `https://anime-kitsu.strem.io/manifest.json` }
    ];

    if (subKeys.subdl) presets.push({ name: 'SubDL', url: `https://subdl.strem.io/config/${subKeys.subdl}/manifest.json` });

    const finalAddons = presets.map(p => ({
      transportUrl: p.url,
      transportName: 'http'
    }));

    setAddons(finalAddons);
    setStep(3);
  };

  // --- المزامنة النهائية مع Stremio ---
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
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-4 flex justify-center items-center" dir="rtl">
      <div className="w-full max-w-xl bg-[#0f172a] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-8 bg-blue-600/10 border-b border-slate-800 text-center">
          <h1 className="text-2xl font-black text-blue-500 italic">Nano Banana Pro 🍌</h1>
          <p className="text-slate-400 text-[10px] tracking-widest mt-1 uppercase">Stremio Ultimate Manager</p>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-4">
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-blue-500 transition" placeholder="البريد الإلكتروني" onChange={e => setCredentials({...credentials, email: e.target.value})} />
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none transition" type="password" placeholder="كلمة المرور" onChange={e => setCredentials({...credentials, password: e.target.value})} />
              <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold hover:bg-blue-700 transition">تسجيل الدخول</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <div className="relative">
                  <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs pr-10" placeholder="TMDB Key" onChange={e => setTmdbKey(e.target.value)} />
                  <button onClick={() => verifyAPI('tmdb', tmdbKey)} className="absolute left-2 top-2 bg-slate-700 px-2 py-1 rounded text-[9px] flex items-center gap-1">تحقق <StatusIcon status={verifyStatus.tmdb}/></button>
                </div>
                <select className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-black" value={tmdbLang} onChange={e => setTmdbLang(e.target.value)}>
                  {languages.map(l => <option key={l.value} value={l.value}>{l.name}</option>)}
                </select>
              </div>

              <div className="flex gap-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <select className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-black" onChange={e => setDebrid({...debrid, type: e.target.value})}>
                  <option value="realdebrid">Real-Debrid</option>
                  <option value="torbox">TorBox</option>
                  <option value="alldebrid">All-Debrid</option>
                </select>
                <div className="flex-1 relative">
                  <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs pr-10" placeholder="API Key" onChange={e => setDebrid({...debrid, apiKey: e.target.value})} />
                  <button onClick={() => verifyAPI('debrid', debrid.apiKey)} className="absolute left-2 top-2 bg-slate-700 px-2 py-1 rounded text-[9px] flex items-center gap-1 font-bold">تحقق <StatusIcon status={verifyStatus.debrid}/></button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex justify-between items-center">
                 <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase tracking-widest italic">
                    <Star size={14} className="text-yellow-500 animate-pulse"/> RPDB Active
                 </div>
                 <input className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-[10px] w-24" placeholder="SubDL Key" onChange={e => setSubKeys({...subKeys, subdl: e.target.value})} />
              </div>

              <button onClick={generateAddons} className="w-full bg-green-600 p-4 rounded-xl font-bold shadow-lg shadow-green-900/20 hover:bg-green-700 transition">توليد الإضافات ←</button>
              <button onClick={clearAccount} className="w-full border border-red-500/30 text-red-400 p-2 rounded-xl text-[10px] flex items-center justify-center gap-2 hover:bg-red-500/10 transition"><Trash2 size={12}/> تنظيف الحساب من الإضافات التالفة</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20 text-right">
                <h2 className="font-bold text-sm text-blue-400">القائمة النهائية ({addons.length})</h2>
                <button onClick={syncToStremio} className="bg-blue-600 px-6 py-2 rounded-full font-bold animate-pulse hover:animate-none transition">مزامنة الآن</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {addons.map((ad, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 group hover:border-blue-500/50 transition">
                    <span className="text-[9px] text-blue-300 truncate max-w-[200px] font-mono">{ad.transportUrl}</span>
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
