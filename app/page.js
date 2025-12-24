"use client";
import React, { useState } from 'react';
import { 
  ShieldCheck, RefreshCw, Trash2, Globe, Star, Database, CheckCircle2, XCircle, Activity, ExternalLink, AlertTriangle
} from 'lucide-react';

export default function NanoBananaPro() {
  const [authKey, setAuthKey] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // إعدادات الخدمات
  const [debrid, setDebrid] = useState({ type: 'realdebrid', apiKey: '' });
  const [tmdbKey, setTmdbKey] = useState('');
  const [tmdbLang, setTmdbLang] = useState('ar-SA');
  const rpdbKey = "t0-free-rpdb"; // المفتاح الذي زودتنا به
  
  const [verifyStatus, setVerifyStatus] = useState({ debrid: 'idle', tmdb: 'idle' });
  const [addons, setAddons] = useState([]);

  // --- التحقق عبر السيرفر الوسيط (تأكد من وجود ملف api/verify/route.js) ---
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

  // --- تنظيف الحساب: يمسح كل شيء لإصلاح خطأ Null ---
  const clearAccount = async () => {
    if (!confirm("سيتم تصفير حسابك تماماً لحل مشكلة الـ Null، هل أنت موافق؟")) return;
    setLoading(true);
    try {
      await fetch('https://api.strem.io/api/addonCollectionSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, addons: [] })
      });
      alert("تم تنظيف الحساب بنجاح! جرب الآن مزامنة Torrentio فقط للتأكد.");
      setAddons([]);
    } catch (e) { alert("فشل التنظيف"); }
    setLoading(false);
  };

  // --- توليد الإضافات (روابط مختصرة ومجربة) ---
  const generateAddons = () => {
    const { type, apiKey } = debrid;
    const shortLang = tmdbLang.split('-')[0];

    // قائمة بأهم الإضافات فقط لضمان الاستقرار
    const presets = [
      { name: 'Torrentio', url: `https://torrentio.strem.fun/${type}=${apiKey}|language=${shortLang}|rpdb=${rpdbKey}/manifest.json` },
      { name: 'Comet', url: `https://comet.elfhosted.com/${apiKey}/tmdb_api=${tmdbKey}/language=${shortLang}/rpdb=${rpdbKey}/manifest.json` },
      { name: 'Cinemeta', url: `https://v3-cinemeta.strem.io/manifest.json` }
    ];

    setAddons(presets.map(p => ({ transportUrl: p.url, transportName: 'http', name: p.name })));
    setStep(3);
  };

  const syncToStremio = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.strem.io/api/addonCollectionSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, addons: addons.map(a => ({ transportUrl: a.transportUrl, transportName: 'http' })) })
      });
      const data = await res.json();
      if (data.result?.success) alert("تمت المزامنة بنجاح! افتح ستريميو الآن.");
      else alert("رفض ستريميو القائمة: " + JSON.stringify(data.error));
    } catch (e) { alert("خطأ في الشبكة"); }
    setLoading(false);
  };

  const StatusIcon = ({ s }) => (
    s === 'loading' ? <Activity className="animate-spin text-blue-400" size={14}/> :
    s === 'success' ? <CheckCircle2 className="text-green-500" size={14}/> :
    s === 'error' ? <XCircle className="text-red-500" size={14}/> : null
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-4 flex justify-center items-center" dir="rtl">
      <div className="w-full max-w-lg bg-[#0f172a] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-6 bg-blue-600/10 border-b border-slate-800 text-center">
          <h1 className="text-2xl font-black text-blue-500 italic">Nano Banana Pro 🍌 v1.5</h1>
          <p className="text-slate-400 text-[10px] tracking-widest mt-1 uppercase italic">Stable Debug Edition</p>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-4 text-right">
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-blue-500 transition" placeholder="إيميل ستريميو" onChange={e => setCredentials({...credentials, email: e.target.value})} />
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none transition" type="password" placeholder="كلمة المرور" onChange={e => setCredentials({...credentials, password: e.target.value})} />
              <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold hover:bg-blue-700 transition">دخول</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <div className="relative">
                  <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs pr-10" placeholder="TMDB Key" onChange={e => setTmdbKey(e.target.value)} />
                  <button onClick={() => verifyAPI('tmdb', tmdbKey)} className="absolute left-1.5 top-2 bg-slate-700 p-1.5 rounded text-[8px] flex items-center gap-1">فحص <StatusIcon s={verifyStatus.tmdb}/></button>
                </div>
                <select className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-blue-400 outline-none" value={tmdbLang} onChange={e => setTmdbLang(e.target.value)}>
                  <option value="ar-SA">العربية 🇸🇦</option>
                  <option value="en-US">English 🇺🇸</option>
                </select>
              </div>

              <div className="flex gap-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <select className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-blue-400 outline-none" onChange={e => setDebrid({...debrid, type: e.target.value})}>
                  <option value="realdebrid">Real-Debrid</option>
                  <option value="torbox">TorBox</option>
                </select>
                <div className="flex-1 relative">
                  <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs pr-10" placeholder="Debrid API" onChange={e => setDebrid({...debrid, apiKey: e.target.value})} />
                  <button onClick={() => verifyAPI('debrid', debrid.apiKey)} className="absolute left-1.5 top-2 bg-slate-700 p-1.5 rounded text-[8px] flex items-center gap-1 font-bold">فحص <StatusIcon s={verifyStatus.debrid}/></button>
                </div>
              </div>

              <button onClick={generateAddons} className="w-full bg-blue-600 p-4 rounded-xl font-bold shadow-lg">توليد الروابط ←</button>
              <button onClick={clearAccount} className="w-full border border-red-500/30 text-red-500 p-2 rounded-xl text-[10px] flex items-center justify-center gap-2 hover:bg-red-500/5 transition"><Trash2 size={12}/> تنظيف الحساب تماماً (هام)</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-2 items-start">
                <AlertTriangle className="text-amber-500 shrink-0" size={16}/>
                <p className="text-[10px] text-amber-200">افحص الروابط بالضغط على الأيقونة الزرقاء. إذا لم يظهر ملف JSON، فالمفتاح الذي أدخلته غير صحيح وسيسبب خطأ Null.</p>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto px-2 custom-scrollbar">
                {addons.map((ad, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 group hover:border-blue-500/50 transition">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-blue-400 font-bold">{ad.name}</span>
                      <span className="text-[8px] text-slate-500 truncate max-w-[200px] font-mono">{ad.transportUrl}</span>
                    </div>
                    <a href={ad.transportUrl} target="_blank" className="bg-blue-600/20 p-2 rounded-lg text-blue-400 hover:bg-blue-600 hover:text-white transition"><ExternalLink size={14}/></a>
                  </div>
                ))}
              </div>
              <button onClick={syncToStremio} className="w-full bg-green-600 p-4 rounded-xl font-bold shadow-lg animate-pulse hover:animate-none transition">تثبيت الآن (Sync)</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
