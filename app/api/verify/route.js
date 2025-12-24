// app/api/sync/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://api.strem.io/api/addonCollectionSet', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Stremio/1.6.0' 
      },
      body: JSON.stringify({
        type: "AddonCollectionSet", // الحقل الضروري لتعريف الطلب
        authKey: body.authKey,
        addons: body.addons
      })
    });

    // التحقق من حالة الاستجابة قبل محاولة قراءتها
    if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ error: errorText || "Stremio API Error" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
