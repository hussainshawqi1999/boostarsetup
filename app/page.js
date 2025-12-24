"use client";
import React, { useState } from 'react';
import { 
  ShieldCheck, RefreshCw, Trash2, Database, CheckCircle2, XCircle, Activity, Star, 
  ArrowUp, ArrowDown, ExternalLink, Zap, Loader2
} from 'lucide-react';

export default function NanoBananaPro() {
  const [authKey, setAuthKey] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, status: '' });
  
  // إعدادات المفاتيح
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
      } else { 
        alert("بيانات الدخول غير صحيحة"); 
      }
    } catch (e) { 
      alert("فشل الاتصال بخادم Stremio"); 
    }
    setLoading(false);
  };

  // --- بناء الروابط بشكل منفصل كما طلبت ---
  const generateAddons = () => {
    const presets = [
      // 1. Cinemeta الرسمية
      { name: 'Cinemeta', url: 'https://v3-cinemeta.strem.io/manifest.json' }
    ];

    // 2. إضافة Torrentio لـ Torbox بشكل منفصل
    if (torboxKey) {
      presets.push({ 
        name: 'Torrentio (Torbox)', 
        url: `https://torrentio.strem.fun/torbox=${torboxKey}/manifest.json` 
      });
    }

    // 3. إضافة Torrentio لـ Real-Debrid بشكل منفصل
    if (rdKey) {
      presets.push({ 
        name: 'Torrentio (Real-Debrid)', 
        url: `https://torrentio.strem.fun/realdebrid=${rdKey}/manifest.json` 
      });
    }
      
    // 4. Subsource (الرابط الصحيح المعتمد)
    presets.push({ 
      name: 'Subsource Arabic', 
      url: `https://subsource.strem.top/YXJhYmljLGVuZ2xpc2gvaGlJbmNsdWRlLw==/manifest.json` 
    });
      
    // 5. Subhero (الرابط الصحيح المعتمد)
    presets.push({ 
      name: 'Subhero Arabic', 
      url: `https://subhero.onrender.com/%7B%22language%22%3A%22en%2Car%22%7D/manifest.json` 
    });

    setAddons(presets.map(p => ({ transportUrl: p.url, transportName: 'http', name: p.name })));
    setStep(3);
  };

  // --- التحكم في القائمة ---
  const moveAddon = (index, direction) => {
    const newAddons = [...addons];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newAddons.length) return;
    [newAddons[index], newAddons[target]] = [newAddons[target], newAddons[index]];
    setAddons(newAddons);
  };

  const deleteAddon = (index) => setAddons(addons.filter((_, i) => i !== index));

  // --- المزامنة المتسلسلة (واحدة تلو الأخرى بفاصل 5 ثوانٍ) ---
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const startSync = async () => {
    if (addons.length === 0) return alert("القائمة فارغة");
    setLoading(true);
    let currentCollection = [];
    try {
      for (let i = 0; i < addons.length; i++) {
        const addon = addons[i];
        setSyncProgress({ current: i + 1, total: addons.length, status: `تثبيت: ${addon.name}...` });
        
        currentCollection.push({ transportUrl: addon.transportUrl, transportName: 'http' });

        const res = await fetch('https://api.strem.io/api/addonCollectionSet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authKey, addons: currentCollection })
        });
        
        const data = await res.json();
        if (!data.result?.success) throw new Error(`رفض الرابط: ${addon.name}`);

        if (i < addons.length - 1) {
          setSyncProgress(prev => ({ ...prev, status: `تم! بانتظار 5 ثوانٍ للتالي...` }));
          await delay(5000); 
        }
      }
      alert("تمت المزامنة بنجاح! كل إضافة تعمل الآن بشكل مستقل.");
    } catch (e) { 
      alert("خطأ: " + e.message); 
    }
    setLoading(false);
    setSyncProgress({ current: 0, total: 0, status: '' });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-4 flex justify-center items-center" dir="rtl">
      <div className="w-full max-w-lg bg-[#0f172a] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-6 bg-blue-600/10 border-b border-slate-800 text-center font-black text-blue-500 text-2xl italic">
          Nano Banana Pro 🍌 v30
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-4 text-right">
              <label className="text-sm font-bold text-slate-500">سجل دخولك</label>
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none" placeholder="الإيميل" onChange={e => setCredentials({...credentials, email: e.target.value})} />
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none" type="password" placeholder="كلمة المرور" onChange={e => setCredentials({...credentials, password: e.target.value})} />
              <button onClick={handleLogin} className="w-full bg-blue-600 p-4 rounded-xl font-bold hover:bg-blue-700 transition">دخول</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-right">
              <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 space-y-4">
                <label className="text-xs font-bold text-blue-400">مفاتيح الخدمات (منفصلة)</label>
                <div className="space-y-3">
                  <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs" placeholder="Real-Debrid API Key" value={rdKey} onChange={e => setRdKey(e.target.value)} />
                  <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs" placeholder="Torbox API Key" value={torboxKey} onChange={e => setTorboxKey(e.target.value)} />
                </div>
              </div>
              <button onClick={generateAddons} className="w-full bg-blue-600 p-4 rounded-xl font-bold">توليد الإضافات المخطط لها ←</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                <div className="text-right">
                  <h2 className="font-bold text-sm text-blue-400 italic">ترتيب المزامنة المتسلسلة</h2>
                  <p className="text-[10px] text-slate-400">سيتم التثبيت بفاصل 5 ثوانٍ لضمان النجاح</p>
                </div>
                <button onClick={startSync} disabled={loading} className="bg-green-600 px-6 py-2 rounded-full font-bold text-xs shadow-lg">
                  {loading ? 'جاري العمل...' : 'بدء المزامنة'}
                </button>
              </div>

              {loading && (
                <div className="bg-slate-900 p-3 rounded-xl border border-blue-500/30 text-center animate-pulse">
                   <p className="text-[10px] text-blue-300 font-bold">{syncProgress.status}</p>
                   <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}></div>
                   </div>
                </div>
              )}

              <div className="space-y-2 max-h-64 overflow-y-auto px-2 custom-scrollbar">
                {addons.map((ad, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 group transition hover:border-blue-500/50">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-200">{ad.name}</span>
                      <span className="text-[8px] text-blue-300 truncate max-w-[150px] font-mono">{ad.transportUrl}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => moveAddon(i, 'up')} className="p-1 hover:bg-slate-800 rounded"><ArrowUp size={14}/></button>
                      <button onClick={() => moveAddon(i, 'down')} className="p-1 hover:bg-slate-800 rounded"><ArrowDown size={14}/></button>
                      <button onClick={() => deleteAddon(i)} className="p-1 hover:bg-red-900/30 text-red-500 rounded"><Trash2 size={14}/></button>
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
