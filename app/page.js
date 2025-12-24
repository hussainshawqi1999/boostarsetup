"use client";
import React, { useState } from 'react';
import { Trash2, ArrowUp, ArrowDown, Activity, Save, Loader2, PlusCircle } from 'lucide-react';

export default function NanoBananaPro() {
  const [authKey, setAuthKey] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  
  const [rdKey, setRdKey] = useState('');
  const [torboxKey, setTorboxKey] = useState('');
  const [addons, setAddons] = useState([]);

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
    } catch (e) { alert("فشل الاتصال بخادم ستريميو"); }
    setLoading(false);
  };

  // توليد القائمة المطلوبة فقط (بدون Cinemeta أو Public Domains)
  const generateAddons = () => {
    const presets = [];
    if (torboxKey) presets.push({ name: 'Torrentio (Torbox)', url: `https://torrentio.strem.fun/torbox=${torboxKey}/manifest.json` });
    if (rdKey) presets.push({ name: 'Torrentio (Real-Debrid)', url: `https://torrentio.strem.fun/realdebrid=${rdKey}/manifest.json` });
    
    presets.push({ name: 'Subsource Arabic', url: `https://subsource.strem.top/YXJhYmljLGVuZ2xpc2gvaGlJbmNsdWRlLw==/manifest.json` });
    presets.push({ name: 'SubHero Arabic', url: `https://subhero.onrender.com/%7B%22language%22%3A%22en%2Car%22%7D/manifest.json` });

    setAddons(presets.map(p => ({ transportUrl: p.url, transportName: 'http', name: p.name })));
    setStep(3);
  };

  // المزامنة التي تستبدل القائمة بالكامل (Replace Sync) لضمان النظافة
  const startFinalSync = async () => {
    if (addons.length === 0) return alert("القائمة فارغة");
    setLoading(true);
    setSyncStatus('جاري تحديث حسابك...');

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
      if (data.result?.success) {
        alert("تمت المزامنة بنجاح! تم استبدال إضافاتك بالقائمة المختارة.");
      } else {
        throw new Error(data.error || "فشل السيرفر في معالجة الطلب");
      }
    } catch (e) {
      alert("خطأ في المزامنة: " + e.message);
    }
    setLoading(false);
    setSyncStatus('');
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
          Nano Banana Pro 🍌 Final
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-4">
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none" placeholder="بريد ستريميو" onChange={e => setCredentials({...credentials, email: e.target.value})} />
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none" type="password" placeholder="كلمة المرور" onChange={e => setCredentials({...credentials, password: e.target.value})} />
              <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold flex justify-center">{loading ? <Loader2 className="animate-spin"/> : "دخول"}</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-blue-400">مفاتيح API</label>
                <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs" placeholder="Real-Debrid API" value={rdKey} onChange={e => setRdKey(e.target.value)} />
                <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs" placeholder="Torbox API" value={torboxKey} onChange={e => setTorboxKey(e.target.value)} />
              </div>
              <button onClick={generateAddons} className="w-full bg-blue-600 p-4 rounded-xl font-bold">توليد القائمة ←</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-blue-600/10 p-4 rounded-xl border border-blue-500/20">
                <span className="text-xs font-bold text-blue-400 italic tracking-tight">نظام المزامنة النظيفة (استبدال كامل)</span>
                <button onClick={startFinalSync} disabled={loading} className="bg-green-600 px-6 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} {loading ? 'جاري المزامنة...' : 'حفظ التغييرات'}
                </button>
              </div>

              {loading && <div className="text-center text-[10px] text-yellow-500 animate-pulse font-bold">{syncStatus}</div>}

              <div className="space-y-2 max-h-64 overflow-y-auto px-2">
                {addons.map((ad, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-slate-800 bg-slate-900 group">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-200">{ad.name}</span>
                      <span className="text-[8px] text-blue-300 truncate max-w-[150px] font-mono">{ad.transportUrl}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => move(i, 'up')} className="p-1 hover:bg-slate-800 rounded">↑</button>
                      <button onClick={() => move(i, 'down')} className="p-1 hover:bg-slate-800 rounded">↓</button>
                      <button onClick={() => setAddons(addons.filter((_, idx) => idx !== i))} className="p-1 text-red-500"><Trash2 size={14}/></button>
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
