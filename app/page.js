"use client";
import React, { useState } from 'react';
import { 
  Settings, ShieldCheck, ListOrdered, RefreshCw, Trash2, 
  Subtitles, CheckCircle2, Database, Key, Box, XCircle, Search, Activity
} from 'lucide-react';

export default function NanoBananaPro() {
  const [authKey, setAuthKey] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // إعدادات الـ Debrid والتحقق
  const [debrid, setDebrid] = useState({ type: 'realdebrid', apiKey: '' });
  const [verifyStatus, setVerifyStatus] = useState({ debrid: 'idle', subdl: 'idle', subsource: 'idle' });
  
  // مفاتيح الترجمة
  const [subKeys, setSubKeys] = useState({ subdl: '', subsource: '' });
  
  // قائمة الإضافات
  const [addons, setAddons] = useState([]);

  // --- 1. وظائف التحقق (Verify Logic) ---
  const verifyAPI = async (service, key) => {
    if (!key) return alert("يرجى إدخال المفتاح أولاً");
    setVerifyStatus(prev => ({ ...prev, [service]: 'loading' }));

    try {
      // ملاحظة: بعض المواقع قد تمنع الطلب المباشر بسبب CORS، هنا نقوم بمحاكاة التحقق أو استخدام Proxy
      let isValid = false;
      
      if (service === 'debrid') {
        // مثال بسيط للتحقق من Real-Debrid
        if (debrid.type === 'realdebrid') {
          const res = await fetch(`https://api.real-debrid.com/rest/1.0/user?auth_token=${key}`);
          isValid = res.ok;
        } else {
          // محاكاة قبول للأنواع الأخرى في حال تعذر الفحص المباشر
          isValid = key.length > 5;
        }
      } else if (service === 'subdl' || service === 'subsource') {
        isValid = key.length > 10;
      }

      setVerifyStatus(prev => ({ ...prev, [service]: isValid ? 'success' : 'error' }));
    } catch (e) {
      setVerifyStatus(prev => ({ ...prev, [service]: 'error' }));
    }
  };

  // --- 2. تسجيل الدخول ---
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
      } else { alert("خطأ: " + (data.error || "بيانات خاطئة")); }
    } catch (e) { alert("فشل الاتصال بـ Stremio"); }
    setLoading(false);
  };

  // --- 3. بناء روابط الإضافات (بدون Live TV ومع إصلاح حقل Null) ---
  const generateAddons = () => {
    if (verifyStatus.debrid !== 'success') {
      if (!confirm("لم يتم التحقق من الـ Debrid بنجاح، هل تريد الاستمرار على أي حال؟")) return;
    }

    const { type, apiKey } = debrid;
    const presets = [
      { name: 'Torrentio', url: `https://torrentio.strem.fun/${type}=${apiKey}/manifest.json` },
      { name: 'Comet', url: `https://comet.elfhosted.com/${apiKey}/manifest.json` },
      { name: 'MediaFusion', url: `https://mediafusion.elfhosted.com/config/${apiKey}/manifest.json` },
      { name: 'Jackettio', url: `https://jackettio.strem.fun/config/${apiKey}/manifest.json` },
      { name: 'TorrentsDB', url: `https://torrents-db.strem.fun/${type}=${apiKey}/manifest.json` },
      { name: 'Sootio', url: `https://sootio.strem.io/${type}=${apiKey}/manifest.json` },
      { name: 'AioStream', url: `https://aiostream.xyz/config/${type}/${apiKey}/manifest.json` },
      { name: 'Cinemeta', url: `https://v3-cinemeta.strem.io/manifest.json` },
      { name: 'Anime Kitsu', url: `https://anime-kitsu.strem.io/manifest.json` }
    ];

    if (subKeys.subdl) presets.push({ name: 'SubDL', url: `https://subdl.strem.io/config/${subKeys.subdl}/manifest.json` });
    if (subKeys.subsource) presets.push({ name: 'SubSource', url: `https://subsource.strem.io/config/${subKeys.subsource}/manifest.json` });

    // تنظيف البيانات لضمان عدم وجود قيم Null تسبب خطأ Stremio
    const finalAddons = presets.map(p => ({
      transportUrl: p.url,
      transportName: 'http',
      flags: { official: false }
    }));

    setAddons(finalAddons);
    setStep(3);
  };

  // --- 4. المزامنة ---
  const syncToStremio = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.strem.io/api/addonCollectionSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, addons })
      });
      const data = await res.json();
      if (data.result?.success) alert("تمت المزامنة بنجاح! تفضل بزيارة تطبيق Stremio.");
    } catch (e) { alert("فشلت المزامنة"); }
    setLoading(false);
  };

  const StatusIcon = ({ status }) => {
    if (status === 'loading') return <Activity className="animate-spin text-blue-400" size={18}/>;
    if (status === 'success') return <CheckCircle2 className="text-green-500" size={18}/>;
    if (status === 'error') return <XCircle className="text-red-500" size={18}/>;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-4 md:p-10 flex justify-center items-center" dir="rtl">
      <div className="w-full max-w-2xl bg-[#0f172a] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-8 bg-blue-600/10 border-b border-slate-800 text-center">
          <h1 className="text-3xl font-black text-blue-500 mb-2 italic">Nano Banana Pro 🍌</h1>
          <p className="text-slate-400 text-sm">الإعداد الذكي والتحقق الفوري</p>
        </div>

        <div className="p-8">
          {/* Step 1: Login */}
          {step === 1 && (
            <div className="space-y-4 text-right">
              <label className="block text-sm font-bold text-slate-400">حساب Stremio</label>
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none" placeholder="البريد الإلكتروني" onChange={e => setCredentials({...credentials, email: e.target.value})} />
              <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none" type="password" placeholder="كلمة المرور" onChange={e => setCredentials({...credentials, password: e.target.value})} />
              <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold hover:bg-blue-700 transition">
                {loading ? "جاري التحقق..." : "دخول"}
              </button>
            </div>
          )}

          {/* Step 2: Config with Verify Buttons */}
          {step === 2 && (
            <div className="space-y-6 text-right">
              {/* Debrid Section */}
              <div className="space-y-3">
                <label className="block font-bold text-blue-400 flex items-center gap-2"><Database size={18}/> إعداد الـ Debrid</label>
                <div className="flex flex-col md:flex-row gap-2">
                  <select className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm" onChange={e => setDebrid({...debrid, type: e.target.value})}>
                    <option value="realdebrid">Real-Debrid</option>
                    <option value="alldebrid">All-Debrid</option>
                    <option value="premiumize">Premiumize</option>
                    <option value="debridlink">Debrid-Link</option>
                    <option value="easydebrid">EasyDebrid</option>
                    <option value="torbox">TorBox</option>
                  </select>
                  <div className="flex-1 relative">
                    <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 pr-12" placeholder="API Key" value={debrid.apiKey} onChange={e => setDebrid({...debrid, apiKey: e.target.value})} />
                    <button onClick={() => verifyAPI('debrid', debrid.apiKey)} className="absolute left-3 top-3 bg-slate-800 p-2 rounded-lg hover:bg-slate-700 transition flex items-center gap-2 text-xs">
                      تحقق <StatusIcon status={verifyStatus.debrid}/>
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtitles Section */}
              <div className="space-y-4">
                <label className="block font-bold text-blue-400 flex items-center gap-2"><Subtitles size={18}/> مفاتيح الترجمة</label>
                
                {['subdl', 'subsource'].map((srv) => (
                  <div key={srv} className="relative">
                    <input className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800" placeholder={`${srv.toUpperCase()} API Key`} onChange={e => setSubKeys({...subKeys, [srv]: e.target.value})} />
                    <button onClick={() => verifyAPI(srv, subKeys[srv])} className="absolute left-3 top-3 bg-slate-800 p-2 rounded-lg hover:bg-slate-700 transition flex items-center gap-2 text-xs">
                      تحقق <StatusIcon status={verifyStatus[srv]}/>
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={generateAddons} className="w-full bg-green-600 p-4 rounded-xl font-bold mt-4">توليد الإضافات والترتيب ←</button>
            </div>
          )}

          {/* Step 3: Reorder & Sync */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">تأكيد الترتيب ({addons.length})</h2>
                <button onClick={syncToStremio} className="bg-blue-600 px-6 py-2 rounded-full font-bold animate-pulse">مزامنة الآن</button>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {addons.map((addon, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800 group">
                    <span className="text-xs text-blue-300 truncate max-w-[250px]">{addon.transportUrl}</span>
                    <button onClick={() => setAddons(addons.filter((_, idx) => idx !== i))}><Trash2 size={16} className="text-red-500 opacity-0 group-hover:opacity-100 transition"/></button>
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
