"use client";
import React, { useState } from 'react';
import { 
  ShieldCheck, RefreshCw, Trash2, Globe, Star, Database, CheckCircle2, XCircle, Activity, Link
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
      } else { alert("بيانات الدخول خاطئة"); }
    } catch (e) { alert("فشل الاتصال بخادم Stremio"); }
    setLoading(false);
  };

  // --- تنظيف الحساب (ضروري قبل أي محاولة جديدة) ---
  const clearAccount = async () => {
    if (!confirm("سيتم تفريغ الحساب تماماً، هل أنت موافق؟")) return;
    setLoading(true);
    try {
      await fetch('https://api.strem.io/api/addonCollectionSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, addons: [] })
      });
      alert("تم تنظيف الحساب! يمكنك الآن التوليد والمزامنة.");
      setAddons([]);
    } catch (e) { alert("فشل التنظيف"); }
    setLoading(false);
  };

  // --- توليد الإضافات (صيغة مبسطة جداً لتجنب الأخطاء) ---
  const generateAddons = () => {
    if (verifyStatus.debrid !== 'success' || verifyStatus.tmdb !== 'success') {
      if (!confirm("لم يتم التحقق من جميع المفاتيح، هل تريد الاستمرار؟")) return;
    }

    const { type, apiKey } = debrid;
    const shortLang = tmdbLang.split('-')[0];

    // قائمة الروابط الأساسية والموثوقة فقط
    const presets = [
      { name: 'Cinemeta', url: `https://v3-cinemeta.strem.io/manifest.json` },
      { name: 'TMDB Arabic', url: `https://tmdb-addons.strem.io/config/${tmdbKey}/language=${tmdbLang}/manifest.json` },
      { name: 'Torrentio', url: `https://torrentio.strem.fun/${type}=${apiKey}|language=${shortLang}|rpdb=${rpdbKey}/manifest.json` },
      { name: 'Comet', url: `https://comet.elfhosted.com/${apiKey}/tmdb_api=${tmdbKey}/language=${shortLang}/rpdb=${rpdbKey}/manifest.json` },
      { name: 'MediaFusion', url: `https://mediafusion.elfhosted.com/config/${apiKey}/manifest.json` }
    ];

    setAddons(presets.map(p => ({
      transportUrl: p.url,
      transportName: 'http',
      flags: { official: false }
    })));
    setStep(3);
  };

  // --- المزامنة النهائية (Sync) ---
  const syncToStremio = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.strem.io/api/addonCollectionSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, addons })
      });
      const data = await res.json();
      if (data.result?.success) {
        alert("نجاح باهر! تمت المزامنة. افتح تطبيق ستريميو الآن.");
      } else {
        alert("رفض الخادم المزامنة: " + JSON.stringify(data.error));
      }
    } catch (e) { alert("خطأ في الشبكة أثناء المزامنة"); }
    setLoading(false);
  };

  const StatusIcon = ({ status }) => {
    if (status === 'loading') return <Activity className="animate-spin text-blue-400" size={14}/>;
    if (status === 'success') return <CheckCircle2 className="text-green-500" size={14}/>;
    if (status === 'error') return <XCircle className="text-red-500" size={14}/>;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-4 flex justify-center items-center" dir="rtl">
      <div className="w-full max-w-lg bg-[#0f172a] rounded-3xl border border-slate-800 shadow-2xl">
        <div className="p-6 bg-blue-600/10 border-b border-slate-800 text-center rounded-t-3xl">
          <h1 className="text-2xl font-black text-blue-500 italic">Nano Banana Pro 🍌</h1>
          <p className="text-slate-400 text-[10px] tracking-widest mt-1 uppercase italic">Fix & Setup Version</p>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-4">
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-blue-500" placeholder="إيميل ستريميو" onChange={e => setCredentials({...credentials, email: e.target.value})} />
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-blue-500" type="password" placeholder="الباسورد" onChange={e => setCredentials({...credentials, password: e.target.value})} />
              <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold hover:bg-blue-700 transition">تحقق من الحساب</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                <div className="relative">
                  <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs pr-10" placeholder="TMDB Key" onChange={e => setTmdbKey(e.target.value)} />
                  <button onClick={() => verifyAPI('tmdb', tmdbKey)} className="absolute left-1.5 top-2 bg-slate-700 p-1.5 rounded text-[8px] flex items-center gap-1">تحقق <StatusIcon status={verifyStatus.tmdb}/></button>
                </div>
                <select className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-blue-400" value={tmdbLang} onChange={e => setTmdbLang(e.target.value)}>
                  <option value="ar-SA">العربية 🇸🇦</option>
                  <option value="en-US">English 🇺🇸</option>
                </select>
              </div>

              <div className="flex gap-2 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                <select className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs" onChange={e => setDebrid({...debrid, type: e.target.value})}>
                  <option value="realdebrid">Real-Debrid</option>
                  <option value="torbox">TorBox</option>
                </select>
                <div className="flex-1 relative">
                  <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs pr-10" placeholder="Debrid API Key" onChange={e => setDebrid({...debrid, apiKey: e.target.value})} />
                  <button onClick={() => verifyAPI('debrid', debrid.apiKey)} className="absolute left-1.5 top-2 bg-slate-700 p-1.5 rounded text-[8px] flex items-center gap-1 font-bold">تحقق <StatusIcon status={verifyStatus.debrid}/></button>
                </div>
              </div>

              <button onClick={generateAddons} className="w-full bg-blue-600 p-4 rounded-xl font-bold shadow-lg shadow-blue-900/20">توليد الإضافات المضمونة ←</button>
              <button onClick={clearAccount} className="w-full border border-red-500/30 text-red-500 p-2 rounded-xl text-[10px] flex items-center justify-center gap-2 hover:bg-red-500/5 transition"><Trash2 size={12}/> تنظيف الحساب (جربه أولاً إذا واجهت خطأ)</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-green-600/10 p-4 rounded-2xl border border-green-500/20">
                <h2 className="font-bold text-sm text-green-400">القائمة نظيفة ({addons.length})</h2>
                <button onClick={syncToStremio} className="bg-green-600 px-6 py-2 rounded-full font-bold text-xs animate-pulse hover:animate-none">تثبيت الآن (Sync)</button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto px-2">
                {addons.map((ad, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <div className="bg-slate-800 p-1 rounded text-[8px] text-slate-500">{i+1}</div>
                    <span className="text-[8px] text-blue-300 truncate font-mono">{ad.transportUrl}</span>
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
