"use client";
import React, { useState } from 'react';
import { 
  ShieldCheck, RefreshCw, Trash2, Globe, Star, Database, CheckCircle2, XCircle, Activity, Zap, ExternalLink 
} from 'lucide-react';

export default function NanoBananaPro() {
  const [authKey, setAuthKey] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [debrid, setDebrid] = useState({ type: 'realdebrid', apiKey: '' });
  const [tmdbKey, setTmdbKey] = useState('');
  const [tmdbLang, setTmdbLang] = useState('ar-SA');
  const rpdbKey = "t0-free-rpdb"; // مفتاح RPDB المدمج
  
  const [verifyStatus, setVerifyStatus] = useState({ debrid: 'idle', tmdb: 'idle' });
  const [addons, setAddons] = useState([]);

  // --- التحقق من المفاتيح عبر السيرفر الوسيط ---
  const verifyAPI = async (service, key) => {
    if (!key) return alert("أدخل المفتاح أولاً");
    setVerifyStatus(prev => ({ ...prev, [service]: 'loading' }));
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, type: debrid.type, key })
      });
      const data = await res.json();
      setVerifyStatus(prev => ({ ...prev, [service]: data.success ? 'success' : 'error' }));
    } catch (e) { setVerifyStatus(prev => ({ ...prev, [service]: 'error' })); }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.strem.io/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...credentials, type: 'Login' })
      });
      const data = await res.json();
      if (data.result?.authKey) { setAuthKey(data.result.authKey); setStep(2); }
      else { alert("خطأ في بيانات ستريميو"); }
    } catch (e) { alert("فشل الاتصال بخادم Stremio"); }
    setLoading(false);
  };

  // --- تنظيف الحساب الشامل ---
  const clearAccount = async () => {
    if (!confirm("سيتم تصفير حسابك تماماً، هل أنت موافق؟")) return;
    setLoading(true);
    try {
      await fetch('https://api.strem.io/api/addonCollectionSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, addons: [] })
      });
      alert("تم تنظيف الحساب! جرب التثبيت اليدوي الآن.");
      setAddons([]);
    } catch (e) { alert("فشل التنظيف"); }
    setLoading(false);
  };

  // --- توليد الإضافات (صيغة متوافقة مع V22) ---
  const generateAddons = () => {
    const { type, apiKey } = debrid;
    const shortLang = tmdbLang.split('-')[0];

    const presets = [
      { name: 'Torrentio', url: `https://torrentio.strem.fun/${type}=${apiKey}|language=${shortLang}|rpdb=${rpdbKey}/manifest.json` },
      { name: 'TMDB Arabic', url: `https://tmdb-addons.strem.io/config/${tmdbKey}/language=${tmdbLang}/manifest.json` },
      { name: 'Comet', url: `https://comet.elfhosted.com/${apiKey}/tmdb_api=${tmdbKey}/language=${shortLang}/rpdb=${rpdbKey}/manifest.json` },
      { name: 'Cinemeta', url: `https://v3-cinemeta.strem.io/manifest.json` }
    ];

    setAddons(presets.map(p => ({ 
      transportUrl: p.url, 
      transportName: 'http', 
      name: p.name,
      // زر التثبيت اليدوي المستوحى من كود حسين V22
      manualUrl: p.url.replace('https://', 'stremio://') + '?v=' + Date.now()
    })));
    setStep(3);
  };

  const syncToStremio = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.strem.io/api/addonCollectionSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          authKey, 
          addons: addons.map(a => ({ transportUrl: a.transportUrl, transportName: 'http' })) 
        })
      });
      const data = await res.json();
      if (data.result?.success) alert("تمت المزامنة السحابية بنجاح!");
      else alert("خطأ في المزامنة: " + JSON.stringify(data.error));
    } catch (e) { alert("خطأ في الشبكة"); }
    setLoading(false);
  };

  // وظيفة التثبيت اليدوي المباشر (كود حسين المفضل)
  const forceInstall = (url) => {
    window.location.href = url;
  };

  const StatusIcon = ({ s }) => (
    s === 'loading' ? <Activity className="animate-spin text-blue-400" size={14}/> :
    s === 'success' ? <CheckCircle2 className="text-green-500" size={14}/> :
    s === 'error' ? <XCircle className="text-red-500" size={14}/> : null
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-4 flex justify-center items-center" dir="rtl">
      <div className="w-full max-w-xl bg-[#0f172a] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600/10 to-transparent border-b border-slate-800 text-center">
          <h1 className="text-2xl font-black text-blue-500 italic">Nano Banana Pro 🍌 V22-Pro</h1>
          <p className="text-slate-400 text-[10px] tracking-widest mt-1 uppercase italic tracking-tighter">By Hussain Al-Ghesra</p>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-4">
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-blue-500 transition" placeholder="إيميل ستريميو" onChange={e => setCredentials({...credentials, email: e.target.value})} />
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none transition" type="password" placeholder="كلمة المرور" onChange={e => setCredentials({...credentials, password: e.target.value})} />
              <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2">
                {loading ? <Activity className="animate-spin" size={20}/> : "دخول ومتابعة"}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-right">
                <div className="relative">
                  <label className="text-[10px] text-slate-500 block mb-1">TMDB API Key</label>
                  <input className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs pr-10" onChange={e => setTmdbKey(e.target.value)} />
                  <button onClick={() => verifyAPI('tmdb', tmdbKey)} className="absolute left-1.5 bottom-1.5 bg-slate-700 p-1 rounded"><StatusIcon s={verifyStatus.tmdb}/></button>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">اللغة</label>
                  <select className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-blue-400 outline-none" value={tmdbLang} onChange={e => setTmdbLang(e.target.value)}>
                    <option value="ar-SA">العربية 🇸🇦</option>
                    <option value="en-US">English 🇺🇸</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-right">
                <label className="text-[10px] text-slate-500 block mb-2">إعداد Debrid</label>
                <div className="flex gap-2">
                  <select className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-blue-400 outline-none" onChange={e => setDebrid({...debrid, type: e.target.value})}>
                    <option value="realdebrid">Real-Debrid</option>
                    <option value="torbox">TorBox</option>
                  </select>
                  <div className="flex-1 relative">
                    <input className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs pr-10" placeholder="API Key" onChange={e => setDebrid({...debrid, apiKey: e.target.value})} />
                    <button onClick={() => verifyAPI('debrid', debrid.apiKey)} className="absolute left-1.5 bottom-1.5 bg-slate-700 p-1 rounded font-bold"><StatusIcon s={verifyStatus.debrid}/></button>
                  </div>
                </div>
              </div>

              <button onClick={generateAddons} className="w-full bg-blue-600 p-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition">توليد الروابط ←</button>
              <button onClick={clearAccount} className="w-full border border-red-500/30 text-red-500 p-2 rounded-xl text-[10px] flex items-center justify-center gap-2 hover:bg-red-500/5 transition"><Trash2 size={12}/> تنظيف الحساب (استخدمه في حال حدوث خطأ)</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                <h2 className="font-bold text-sm text-blue-400 italic">الإضافات جاهزة</h2>
                <button onClick={syncToStremio} className="bg-blue-600 px-6 py-2 rounded-full font-bold text-xs animate-pulse hover:animate-none">مزامنة سحابية (Sync)</button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto px-2 custom-scrollbar">
                {addons.map((ad, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 group hover:border-blue-500/50 transition">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-blue-400 font-bold">{ad.name}</span>
                      <span className="text-[8px] text-slate-500 truncate max-w-[150px] font-mono">{ad.transportUrl}</span>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => forceInstall(ad.manualUrl)} className="bg-green-600/20 p-2 rounded-lg text-green-400 hover:bg-green-600 hover:text-white transition flex items-center gap-1 text-[8px] font-bold">
                         <Zap size={12}/> تثبيت V22
                       </button>
                       <a href={ad.transportUrl} target="_blank" className="bg-slate-800 p-2 rounded-lg text-slate-400 hover:text-white transition"><ExternalLink size={12}/></a>
                    </div>
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
