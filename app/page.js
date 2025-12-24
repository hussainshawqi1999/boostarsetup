"use client";
import React, { useState } from 'react';
import { 
  ShieldCheck, RefreshCw, Trash2, Globe, Star, Database, CheckCircle2, XCircle, Activity, Subtitles
} from 'lucide-react';

export default function NanoBananaPro() {
  const [authKey, setAuthKey] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // إعدادات الخدمات (تم التركيز على المطلوب فقط)
  const [debrid, setDebrid] = useState({ type: 'realdebrid', apiKey: '' });
  const [subKeys, setSubKeys] = useState({ subsource: '' });
  const rpdbKey = "t0-free-rpdb"; 
  
  const [verifyStatus, setVerifyStatus] = useState({ debrid: 'idle', subsource: 'idle' });
  const [addons, setAddons] = useState([]);

  // --- التحقق من الـ API عبر السيرفر الوسيط (تجاوز الـ X) ---
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
      if (data.result?.authKey) {
        setAuthKey(data.result.authKey);
        setStep(2);
      } else { alert("بيانات الدخول غير صحيحة"); }
    } catch (e) { alert("فشل الاتصال بخادم Stremio"); }
    setLoading(false);
  };

  // --- تنظيف الحساب (ضروري جداً قبل المزامنة) ---
  const clearAccount = async () => {
    if (!confirm("سيتم تصفير الحساب تماماً، هل أنت موافق؟")) return;
    setLoading(true);
    try {
      await fetch('https://api.strem.io/api/addonCollectionSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, addons: [] })
      });
      alert("تم تنظيف الحساب بنجاح!");
      setAddons([]);
    } catch (e) { alert("فشل التنظيف"); }
    setLoading(false);
  };

  // --- بناء الإضافات الـ 4 المحددة فقط باللغة العربية ---
  const generateAddons = () => {
    if (!debrid.apiKey) return alert("يرجى إدخال مفتاح Debrid والتحقق منه");
    
    const { type, apiKey } = debrid;

    // القائمة المخصصة التي طلبتها يا حسين
    const presets = [
      // 1. Torrentio (Debrid + Arabic + RPDB)
      { name: 'Torrentio', url: `https://torrentio.strem.fun/${type}=${apiKey}|language=ar|rpdb=${rpdbKey}/manifest.json` },
      
      // 2. StremThru Torz (Debrid Setup)
      { name: 'StremThru Torz', url: `https://stremthru.strem.io/torz/config/${apiKey}/manifest.json` },
      
      // 3. SubSource (Arabic Only)
      { name: 'SubSource', url: `https://subsource.strem.io/config/${subKeys.subsource}/languages=ar/manifest.json` },
      
      // 4. SubHero (Arabic Only)
      { name: 'SubHero', url: `https://subhero.strem.io/manifest.json` }
    ];

    setAddons(presets.map(p => ({
      transportUrl: p.url,
      transportName: 'http',
      flags: { official: false }
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
        alert("نجاح! تم تثبيت Torrentio و StremThru والترجمات العربية بنجاح.");
      } else {
        alert("فشلت المزامنة: " + JSON.stringify(data.error));
      }
    } catch (e) { alert("خطأ في المزامنة"); }
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
        
        <div className="p-6 bg-blue-600/10 border-b border-slate-800 text-center">
          <h1 className="text-2xl font-black text-blue-500 italic">Nano Banana Pro 🍌 Arabic Core</h1>
          <p className="text-slate-400 text-[10px] tracking-widest mt-1 uppercase italic tracking-tighter">Essential Addons Only</p>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-4">
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none" placeholder="إيميل ستريميو" onChange={e => setCredentials({...credentials, email: e.target.value})} />
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none" type="password" placeholder="كلمة المرور" onChange={e => setCredentials({...credentials, password: e.target.value})} />
              <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold hover:bg-blue-700 transition">دخول</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-right">
              {/* Debrid Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-400 flex items-center gap-2"><Database size={16}/> إعداد الـ Debrid</label>
                <div className="flex gap-2">
                  <select className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs outline-none" onChange={e => setDebrid({...debrid, type: e.target.value})}>
                    <option value="realdebrid">Real-Debrid</option>
                    <option value="torbox">TorBox</option>
                  </select>
                  <div className="flex-1 relative">
                    <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs pr-10" placeholder="Debrid API Key" onChange={e => setDebrid({...debrid, apiKey: e.target.value})} />
                    <button onClick={() => verifyAPI('debrid', debrid.apiKey)} className="absolute left-1.5 top-1.5 bg-slate-700 p-1.5 rounded text-[8px] flex items-center gap-1 font-bold">فحص <StatusIcon s={verifyStatus.debrid}/></button>
                  </div>
                </div>
              </div>

              {/* Subtitles Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-400 flex items-center gap-2"><Subtitles size={16}/> إعداد الترجمات (اللغة العربية فقط)</label>
                <div className="relative">
                  <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs pr-10" placeholder="SubSource API Key" onChange={e => setSubKeys({...subKeys, subsource: e.target.value})} />
                  <button onClick={() => verifyAPI('subsource', subKeys.subsource)} className="absolute left-1.5 top-1.5 bg-slate-700 p-1.5 rounded text-[8px] flex items-center gap-1">فحص <StatusIcon s={verifyStatus.subsource}/></button>
                </div>
                <div className="bg-blue-600/10 p-2 rounded-lg text-[9px] text-blue-400 flex items-center gap-2">
                  <Star size={14} className="text-yellow-500 animate-pulse"/> التقييمات RPDB وترجمة SubHero مفعّلة تلقائياً
                </div>
              </div>

              <button onClick={generateAddons} className="w-full bg-blue-600 p-4 rounded-xl font-bold shadow-lg transition hover:scale-[1.02]">توليد الإضافات المخصصة ←</button>
              <button onClick={clearAccount} className="w-full border border-red-500/30 text-red-500 p-2 rounded-xl text-[10px] flex items-center justify-center gap-2 hover:bg-red-500/5 transition"><Trash2 size={12}/> تنظيف الحساب (هام جداً)</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                <h2 className="font-bold text-sm text-blue-400">القائمة الجاهزة ({addons.length})</h2>
                <button onClick={syncToStremio} className="bg-blue-600 px-6 py-2 rounded-full font-bold text-xs animate-pulse hover:animate-none transition">مزامنة سحابية (Sync)</button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto px-2">
                {addons.map((ad, i) => (
                  <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[8px] font-mono text-blue-300 truncate">
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
