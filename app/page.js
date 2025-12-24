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
  
  const [debrid, setDebrid] = useState({ type: 'realdebrid', apiKey: '' });
  const [tmdbKey, setTmdbKey] = useState('');
  const [tmdbLang, setTmdbLang] = useState('ar-SA');
  const rpdbKey = "t0-free-rpdb"; // مفتاح RPDB المدمج
  
  const [verifyStatus, setVerifyStatus] = useState({ debrid: 'idle', tmdb: 'idle' });
  const [addons, setAddons] = useState([]);

  // --- التحقق عبر السيرفر الوسيط (تأكد من وجود ملف api/verify/route.js) ---
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
      else { alert("خطأ في بيانات الدخول"); }
    } catch (e) { alert("فشل الاتصال بخادم Stremio"); }
    setLoading(false);
  };

  // --- تنظيف الحساب (هام جداً لمسح الروابط التالفة المسببة لخطأ Null) ---
  const clearAccount = async () => {
    if (!confirm("سيتم تصفير الحساب تماماً، هل أنت موافق؟")) return;
    setLoading(true);
    try {
      await fetch('https://api.strem.io/api/addonCollectionSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, addons: [] })
      });
      alert("تم تنظيف الحساب بنجاح! جرب الآن المزامنة الجديدة.");
      setAddons([]);
    } catch (e) { alert("فشل التنظيف"); }
    setLoading(false);
  };

  // --- بناء الروابط بصيغة "Clean Strict" لضمان قبول ستريميو ---
  const generateAddons = () => {
    const { type, apiKey } = debrid;
    const shortLang = tmdbLang.split('-')[0]; // ar

    // قائمة الروابط المصححة والمضمونة برمجياً
    const presets = [
      { url: `https://v3-cinemeta.strem.io/manifest.json` },
      { url: `https://torrentio.strem.fun/${type}=${apiKey}|language=ar|rpdb=${rpdbKey}/manifest.json` },
      { url: `https://tmdb-addons.strem.io/config/${tmdbKey}/language=${tmdbLang}/manifest.json` },
      { url: `https://comet.elfhosted.com/${apiKey}/manifest.json` },
      { url: `https://mediafusion.elfhosted.com/config/${apiKey}/manifest.json` }
    ];

    setAddons(presets.map(p => ({
      transportUrl: p.url,
      transportName: 'http'
    })));
    setStep(3);
  };

  const syncToStremio = async () => {
    setLoading(true);
    try {
      // استخدام الرابط الرسمي المستقر
      const res = await fetch('https://api.strem.io/api/addonCollectionSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, addons: addons })
      });
      
      const data = await res.json();
      
      if (data.result && data.result.success) {
        alert("تمت المزامنة بنجاح! افتح تطبيق ستريميو الآن.");
      } else {
        // إظهار الخطأ الدقيق من ستريميو لتسهيل الحل
        console.error("Stremio API Error:", data);
        alert("فشلت المزامنة: " + (data.error || "تأكد من تنظيف الحساب أولاً"));
      }
    } catch (e) { 
      alert("خطأ في الاتصال بالشبكة، تأكد من أنك لست خلف VPN");
    }
    setLoading(false);
  };

  const StatusIcon = ({ s }) => (
    s === 'loading' ? <Activity className="animate-spin text-blue-400" size={14}/> :
    s === 'success' ? <CheckCircle2 className="text-green-500" size={14}/> :
    s === 'error' ? <XCircle className="text-red-500" size={14}/> : null
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-4 flex justify-center items-center" dir="rtl">
      <div className="w-full max-w-lg bg-[#0f172a] rounded-3xl border border-slate-800 shadow-2xl">
        <div className="p-8 bg-blue-600/10 border-b border-slate-800 text-center rounded-t-3xl">
          <h1 className="text-2xl font-black text-blue-500 italic">Nano Banana Pro 🍌 Final Fix</h1>
          <p className="text-slate-400 text-[10px] tracking-widest mt-1 uppercase italic tracking-tighter">By Hussain Al-Ghesra</p>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-4">
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-blue-500 transition" placeholder="إيميل ستريميو" onChange={e => setCredentials({...credentials, email: e.target.value})} />
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none transition" type="password" placeholder="كلمة المرور" onChange={e => setCredentials({...credentials, password: e.target.value})} />
              <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold hover:bg-blue-700 transition">دخول</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <div className="relative">
                  <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs pr-10" placeholder="TMDB API Key" onChange={e => setTmdbKey(e.target.value)} />
                  <button onClick={() => verifyAPI('tmdb', tmdbKey)} className="absolute left-2 top-2 bg-slate-700 px-2 py-1 rounded text-[9px] flex items-center gap-1">تحقق <StatusIcon s={verifyStatus.tmdb}/></button>
                </div>
                <select className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-blue-400 outline-none" value={tmdbLang} onChange={e => setTmdbLang(e.target.value)}>
                  <option value="ar-SA">العربية 🇸🇦</option>
                  <option value="en-US">English 🇺🇸</option>
                </select>
              </div>

              <div className="flex gap-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <select className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs" onChange={e => setDebrid({...debrid, type: e.target.value})}>
                  <option value="realdebrid">Real-Debrid</option>
                  <option value="torbox">TorBox</option>
                </select>
                <div className="flex-1 relative">
                  <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs pr-10" placeholder="Debrid API Key" onChange={e => setDebrid({...debrid, apiKey: e.target.value})} />
                  <button onClick={() => verifyAPI('debrid', debrid.apiKey)} className="absolute left-2 top-2 bg-slate-700 px-2 py-1 rounded text-[9px] font-bold">تحقق <StatusIcon s={verifyStatus.debrid}/></button>
                </div>
              </div>

              <button onClick={generateAddons} className="w-full bg-green-600 p-4 rounded-xl font-bold transition shadow-lg">توليد الإضافات وترتيبها ←</button>
              <button onClick={clearAccount} className="w-full border border-red-500/30 text-red-400 p-2 rounded-xl text-[10px] flex items-center justify-center gap-2 hover:bg-red-500/5 transition"><Trash2 size={12}/> تنظيف الحساب (هام جداً)</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20 text-right">
                <h2 className="font-bold text-sm text-blue-400">القائمة النهائية جاهزة</h2>
                <button onClick={syncToStremio} className="bg-blue-600 px-6 py-2 rounded-full font-bold animate-pulse hover:animate-none transition">مزامنة سحابية (Sync)</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto px-2 custom-scrollbar">
                {addons.map((ad, i) => (
                  <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[10px] text-blue-300 font-mono truncate">
                    {ad.transportUrl}
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
