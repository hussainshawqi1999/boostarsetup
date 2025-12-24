"use client";
import React, { useState } from 'react';
import { 
  Trash2, ArrowUp, ArrowDown, Activity, CheckCircle2, Loader2, Save, Trash, ExternalLink, RefreshCw
} from 'lucide-react';

export default function NanoBananaPro() {
  const [authKey, setAuthKey] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ msg: '', current: 0 });
  
  const [rdKey, setRdKey] = useState('');
  const [torboxKey, setTorboxKey] = useState('');
  const [addons, setAddons] = useState([]);

  // --- تسجيل الدخول ---
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

  // --- توليد القائمة بناءً على الروابط الدقيقة المكتشفة ---
  const generateAddons = () => {
    const presets = [
      { name: 'Cinemeta (Official)', url: 'https://v3-cinemeta.strem.io/manifest.json' }
    ];

    if (rdKey) presets.push({ name: 'Torrentio (RealDebrid)', url: `https://torrentio.strem.fun/realdebrid=${rdKey}/language=ar|rpdb=t0-free-rpdb/manifest.json` });
    if (torboxKey) presets.push({ name: 'Torrentio (Torbox)', url: `https://torrentio.strem.fun/torbox=${torboxKey}/language=ar|rpdb=t0-free-rpdb/manifest.json` });
    
    // روابط Subsource و SubHero المضمونة
    presets.push({ name: 'Subsource Arabic', url: `https://subsource.strem.top/YXJhYmljLGVuZ2xpc2gvaGlJbmNsdWRlLw==/manifest.json` });
    presets.push({ name: 'SubHero Arabic', url: `https://subhero.onrender.com/%7B%22language%22%3A%22en%2Car%22%7D/manifest.json` });

    setAddons(presets.map(p => ({ transportUrl: p.url, transportName: 'http', name: p.name, status: 'pending' })));
    setStep(3);
  };

  // --- المزامنة المتسلسلة عبر السيرفر الوسيط (الاحترافية) ---
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const startSequentialSync = async () => {
    if (addons.length === 0) return alert("القائمة فارغة");
    setLoading(true);
    let currentCollection = [];

    try {
      for (let i = 0; i < addons.length; i++) {
        const addon = addons[i];
        setSyncStatus({ msg: `جاري تثبيت: ${addon.name}...`, current: i + 1 });

        // بناء القائمة تراكمياً لضمان الاستقرار
        currentCollection.push({
          transportUrl: addon.transportUrl,
          transportName: "http"
        });

        // إرسال الطلب لملف api/sync المحلي الخاص بنا
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authKey: authKey,
            addons: currentCollection
          })
        });
        
        const data = await res.json();
        if (!data.result?.success) throw new Error(`رفض السيرفر إضافة: ${addon.name}`);

        // تحديث حالة الواجهة
        const updated = [...addons];
        updated[i].status = 'done';
        setAddons(updated);

        // انتظار 5 ثوانٍ قبل الإضافة التالية لضمان معالجة السيرفر
        if (i < addons.length - 1) {
          setSyncStatus(prev => ({ ...prev, msg: 'نجح! بانتظار 5 ثوانٍ...' }));
          await delay(5000);
        }
      }
      alert("نجحت المزامنة الكاملة بالترتيب المختار!");
    } catch (e) {
      alert("توقفت المزامنة عند خطأ: " + e.message);
    }
    setLoading(false);
    setSyncStatus({ msg: '', current: 0 });
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
          Nano Banana Pro 🍌 v32
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
                <label className="text-xs font-bold text-blue-400">مفاتيح الخدمات (اختياري)</label>
                <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs" placeholder="Real-Debrid API" value={rdKey} onChange={e => setRdKey(e.target.value)} />
                <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs" placeholder="Torbox API" value={torboxKey} onChange={e => setTorboxKey(e.target.value)} />
              </div>
              <button onClick={generateAddons} className="w-full bg-blue-600 p-4 rounded-xl font-bold">توليد وترتيب الإضافات ←</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-blue-600/10 p-4 rounded-xl border border-blue-500/20">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-blue-400 italic">نظام المزامنة المتسلسلة v32</span>
                  <span className="text-[10px] text-slate-500">مبني على تقنية Bootstrapper</span>
                </div>
                <button onClick={startSequentialSync} disabled={loading} className="bg-green-600 px-6 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} {loading ? 'جاري المزامنة...' : 'حفظ الترتيب'}
                </button>
              </div>

              {loading && <div className="text-center text-[10px] text-yellow-500 animate-pulse font-bold">{syncStatus.msg}</div>}

              <div className="space-y-2 max-h-64 overflow-y-auto px-2">
                {addons.map((ad, i) => (
                  <div key={i} className={`flex justify-between items-center p-3 rounded-xl border transition ${ad.status === 'done' ? 'border-green-500/50 bg-green-500/10' : 'border-slate-800 bg-slate-900'} group`}>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-200">{ad.name}</span>
                      <span className="text-[8px] text-blue-300 truncate max-w-[150px] font-mono">{ad.transportUrl}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => move(i, 'up')} className="p-1 hover:bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition">↑</button>
                      <button onClick={() => move(i, 'down')} className="p-1 hover:bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition">↓</button>
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
