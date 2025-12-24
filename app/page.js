"use client";
import React, { useState } from 'react';
import { 
  ShieldCheck, RefreshCw, Trash2, Globe, Star, Database, CheckCircle2, XCircle, Activity, ExternalLink
} from 'lucide-react';

export default function NanoBananaPro() {
  const [authKey, setAuthKey] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [debrid, setDebrid] = useState({ type: 'realdebrid', apiKey: '' });
  const [tmdbKey, setTmdbKey] = useState('');
  const [tmdbLang, setTmdbLang] = useState('ar-SA');
  const rpdbKey = "t0-free-rpdb"; 
  
  const [verifyStatus, setVerifyStatus] = useState({ debrid: 'idle', tmdb: 'idle' });
  const [addons, setAddons] = useState([]);

  // --- التحقق من الـ API عبر السيرفر الوسيط ---
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

  const clearAccount = async () => {
    if (!confirm("سيتم تفريغ الحساب تماماً، هل أنت موافق؟")) return;
    setLoading(true);
    try {
      await fetch('https://api.strem.io/api/addonCollectionSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, addons: [] })
      });
      alert("تم تنظيف الحساب! جرب الآن مزامنة رابط واحد فقط للتجربة.");
      setAddons([]);
    } catch (e) { alert("فشل التنظيف"); }
    setLoading(false);
  };

  // --- توليد قائمة "الحد الأدنى" الموثوقة لتجاوز خطأ Null ---
  const generateAddons = () => {
    const { type, apiKey } = debrid;
    const shortLang = tmdbLang.split('-')[0];

    // سنبدأ برابطين فقط (الأكثر استقراراً) لضمان نجاح التثبيت الأولي
    const presets = [
      { name: 'Torrentio', url: `https://torrentio.strem.fun/${type}=${apiKey}|language=${shortLang}|rpdb=${rpdbKey}/manifest.json` },
      { name: 'Cinemeta (Official)', url: `https://v3-cinemeta.strem.io/manifest.json` }
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
      const res = await fetch('https://api.strem.io/api/addonCollectionSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, addons })
      });
      const data = await res.json();
      if (data.result?.success) {
        alert("تمت المزامنة بنجاح! افتح ستريميو الآن.");
      } else {
        alert("فشل المزامنة: " + JSON.stringify(data.error));
      }
    } catch (e) { alert("خطأ في المزامنة"); }
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
        <div className="p-6 bg-blue-600/10 border-b border-slate-800 text-center rounded-t-3xl font-black italic text-blue-500 text-2xl">
          Nano Banana Pro 🍌
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-4">
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800" placeholder="إيميل ستريميو" onChange={e => setCredentials({...credentials, email: e.target.value})} />
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800" type="password" placeholder="الباسورد" onChange={e => setCredentials({...credentials, password: e.target.value})} />
              <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold">دخول</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex gap-2">
                <input className="flex-1 p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs" placeholder="TMDB API Key" onChange={e => setTmdbKey(e.target.value)} />
                <button onClick={() => verifyAPI('tmdb', tmdbKey)} className="bg-slate-700 px-3 py-1 rounded-xl text-[10px]"><StatusIcon status={verifyStatus.tmdb}/></button>
              </div>

              <div className="flex gap-2">
                <select className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs" onChange={e => setDebrid({...debrid, type: e.target.value})}>
                  <option value="realdebrid">Real-Debrid</option>
                  <option value="torbox">TorBox</option>
                </select>
                <input className="flex-1 p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs" placeholder="Debrid API Key" onChange={e => setDebrid({...debrid, apiKey: e.target.value})} />
                <button onClick={() => verifyAPI('debrid', debrid.apiKey)} className="bg-slate-700 px-3 py-1 rounded-xl text-[10px]"><StatusIcon status={verifyStatus.debrid}/></button>
              </div>

              <button onClick={generateAddons} className="w-full bg-blue-600 p-4 rounded-xl font-bold">توليد الروابط ←</button>
              <button onClick={clearAccount} className="w-full border border-red-500/30 text-red-500 p-2 rounded-xl text-[10px] flex items-center justify-center gap-2"><Trash2 size={12}/> تنظيف الحساب</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                <h2 className="font-bold text-sm text-blue-400 italic">افحص الروابط يدوياً قبل المزامنة</h2>
                <button onClick={syncToStremio} className="bg-blue-600 px-6 py-2 rounded-full font-bold text-xs">تثبيت (Sync)</button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto px-2">
                {addons.map((ad, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800 group">
                    <span className="text-[8px] text-blue-300 truncate max-w-[150px] font-mono">{ad.transportUrl}</span>
                    <a href={ad.transportUrl} target="_blank" className="text-slate-500 hover:text-white transition"><ExternalLink size={14}/></a>
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
