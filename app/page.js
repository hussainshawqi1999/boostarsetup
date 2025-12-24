"use client";
import React, { useState } from 'react';
import { Save, Loader2, Plus, Zap, Key } from 'lucide-react';

export default function NanoBananaPro() {
  const [authKey, setAuthKey] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  
  // المفاتيح
  const [rdKey, setRdKey] = useState('');
  const [torboxKey, setTorboxKey] = useState('');
  const [subdlKey, setSubdlKey] = useState('');
  
  const [addons, setAddons] = useState([]);

  // 1. تسجيل الدخول
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
      else { alert("بيانات الدخول خطأ"); }
    } catch (e) { alert("فشل الاتصال"); }
    setLoading(false);
  };

  // 2. توليد الروابط (تم إضافة StremThru Torbox)
  const generateAddons = () => {
    const presets = [];

    // --- StremThru (Real-Debrid) ---
    if (rdKey) {
        presets.push({ 
            name: 'StremThru Torz (RD)', 
            url: `https://stremthru.13377001.xyz/stremio/torz/store=realdebrid&token=${rdKey}/manifest.json` 
        });
    }

    // --- StremThru (TorBox) [الجديد] ---
    if (torboxKey) {
        presets.push({ 
            name: 'StremThru Torz (TorBox)', 
            url: `https://stremthru.13377001.xyz/stremio/torz/store=torbox&token=${torboxKey}/manifest.json` 
        });
    }

    // --- Torrentio ---
    if (torboxKey) presets.push({ name: 'Torrentio (Torbox)', url: `https://torrentio.strem.fun/torbox=${torboxKey}/manifest.json` });
    if (rdKey) presets.push({ name: 'Torrentio (Real-Debrid)', url: `https://torrentio.strem.fun/realdebrid=${rdKey}/manifest.json` });

    // --- باقي القائمة ---
    presets.push({ name: 'MediaFusion', url: 'https://mediafusion.elfhosted.com/manifest.json' });
    presets.push({ name: 'TorrentsDB', url: 'https://torrents-db.elfhosted.com/manifest.json' }); 
    presets.push({ name: 'AutoStream', url: 'https://autostream.elfhosted.com/manifest.json' });

    if (subdlKey) {
        presets.push({ name: 'SubDL API', url: `https://stremio-subdl.onderka.com/${subdlKey}/manifest.json` });
    }

    presets.push({ name: 'Subsource Arabic', url: `https://subsource.strem.top/YXJhYmljLGVuZ2xpc2gvaGlJbmNsdWRlLw==/manifest.json` });
    presets.push({ name: 'SubHero Arabic', url: `https://subhero.onrender.com/%7B%22language%22%3A%22en%2Car%22%7D/manifest.json` });
    presets.push({ name: 'Arcont Custom', url: 'https://arcontstremio.vercel.app/manifest.json' });

    setAddons(presets.map(p => ({ transportUrl: p.url, transportName: 'http', name: p.name })));
    setStep(3);
  };

  // 3. المزامنة
  const startSync = async () => {
    setLoading(true);
    setStatusMsg('جاري الدمج والمزامنة...');
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authKey: authKey,
          addons: addons.map(ad => ({ transportUrl: ad.transportUrl, transportName: "http" }))
        })
      });
      
      const data = await res.json();
      
      if (data.details) {
         const failed = data.details.filter(d => !d.success).map(d => d.url).join('\n');
         if (failed) {
             alert("تمت المزامنة ولكن بعض الإضافات فشلت:\n" + failed);
         } else {
             alert("نجاح باهر! تم تثبيت StremThru لـ Torbox/RD وباقي القائمة.");
         }
      } else if (data.result?.success) {
        alert("تمت العملية بنجاح!");
      } else {
        throw new Error(data.error || "خطأ غير معروف");
      }
    } catch (e) { alert("خطأ: " + e.message); }
    setLoading(false);
    setStatusMsg('');
  };

  const move = (idx, dir) => {
    const list = [...addons];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target >= 0 && target < list.length) {
      [list[idx], list[target]] = [list[target], list[idx]];
      setAddons(list);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 flex justify-center items-center" dir="rtl">
      <div className="w-full max-w-lg bg-[#0f172a] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-6 bg-blue-600/10 border-b border-slate-800 text-center font-black text-blue-500 text-2xl italic">
          Nano Banana Pro 🍌 v38
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-4">
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none" placeholder="إيميل ستريميو" onChange={e => setCredentials({...credentials, email: e.target.value})} />
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none" type="password" placeholder="كلمة المرور" onChange={e => setCredentials({...credentials, password: e.target.value})} />
              <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold">{loading ? "جاري الدخول..." : "دخول"}</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 text-right">
              <div className="bg-slate-900/50 p-3 rounded-xl space-y-2 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Key size={14} className="text-blue-400"/>
                  <label className="text-xs text-blue-400 font-bold">مفاتيح Debrid</label>
                </div>
                <input className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs" placeholder="Real-Debrid API Key" onChange={e => setRdKey(e.target.value)} />
                <input className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs" placeholder="Torbox API Key" onChange={e => setTorboxKey(e.target.value)} />
              </div>
              
              <div className="bg-slate-900/50 p-3 rounded-xl space-y-2 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                   <Key size={14} className="text-amber-400"/>
                   <label className="text-xs text-amber-400 font-bold">مفاتيح الخدمات الأخرى</label>
                </div>
                <input className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs" placeholder="SubDL API Key" onChange={e => setSubdlKey(e.target.value)} />
              </div>

              <button onClick={generateAddons} className="w-full bg-blue-600 p-4 rounded-xl font-bold mt-2">تجهيز الروابط ←</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-green-600/10 p-3 rounded-xl border border-green-500/20 flex gap-2 items-center">
                <Zap size={16} className="text-green-400" />
                <p className="text-[10px] text-green-200 font-bold">سيتم دمج القائمة الجديدة مع الموجودة سابقاً.</p>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto px-1">
                {addons.map((ad, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-slate-800 bg-slate-900">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold truncate max-w-[200px]">{ad.name}</span>
                        <span className="text-[8px] text-slate-500 truncate max-w-[200px]">{ad.transportUrl}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => move(i, 'up')} className="p-1 hover:bg-slate-800 rounded">↑</button>
                      <button onClick={() => move(i, 'down')} className="p-1 hover:bg-slate-800 rounded">↓</button>
                      <button onClick={() => setAddons(addons.filter((_, idx) => idx !== i))} className="text-red-500 px-1">×</button>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={startSync} disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold flex justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20}/> : <Plus size={20}/>} {loading ? (statusMsg || 'جاري التثبيت...') : 'إضافة لحسابي'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
