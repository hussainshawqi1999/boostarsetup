import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { authKey, addons } = body;

    // 1. الخطوة الجديدة: جلب محتوى المانيفست لكل إضافة قبل إرسالها لستريميو
    // هذا هو الحل لخطأ: expected struct manifest
    const enrichedAddons = await Promise.all(addons.map(async (addon) => {
      try {
        // نجلب ملف الـ JSON من الرابط (مثلاً رابط Torrentio أو Subsource)
        const manifestRes = await fetch(addon.transportUrl);
        const manifestJson = await manifestRes.json();

        return {
          transportUrl: addon.transportUrl,
          transportName: "http", // أو https، ستريميو يقبل http كبروتوكول
          manifest: manifestJson // <--- هذا هو الحقل الناقص الذي سبب المشكلة
        };
      } catch (e) {
        console.error(`Failed to fetch manifest for ${addon.transportUrl}`, e);
        return null; // نتجاوز الإضافة التي تفشل
      }
    }));

    // تصفية أي إضافات فشل تحميلها (عشان ما نرسل null)
    const validAddons = enrichedAddons.filter(a => a !== null);

    if (validAddons.length === 0) {
      return NextResponse.json({ error: "فشل تحميل بيانات جميع الإضافات، تأكد من الروابط" }, { status: 400 });
    }

    // 2. إرسال القائمة الكاملة (مع المانيفست) لستريميو
    const response = await fetch('https://api.strem.io/api/addonCollectionSet', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: "AddonCollectionSet",
        authKey: authKey,
        addons: validAddons // نرسل القائمة "المعبأة" بالبيانات
      })
    });

    // معالجة الرد (حتى لو فارغ)
    const text = await response.text();
    if (!text || text.trim() === "") {
      return NextResponse.json({ result: { success: true } });
    }

    try {
      const data = JSON.parse(text);
      // إذا رد ستريميو بخطأ، نعرضه
      if (data.error) {
        return NextResponse.json(data, { status: 400 });
      }
      return NextResponse.json(data);
    } catch (e) {
      // أحياناً النجاح لا يعود بـ JSON
      return NextResponse.json({ result: { success: true } });
    }

  } catch (error) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
