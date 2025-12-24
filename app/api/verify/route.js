import { NextResponse } from 'next/server';

export async function POST(request) {
    const { service, type, key } = await request.json();

    try {
        let response;
        if (service === 'tmdb') {
            response = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${key}`);
        } else if (service === 'debrid') {
            if (type === 'realdebrid') {
                response = await fetch(`https://api.real-debrid.com/rest/1.0/user?auth_token=${key}`);
            } else if (type === 'torbox') {
                response = await fetch(`https://api.torbox.app/v1/api/user/me`, {
                    headers: { 'Authorization': `Bearer ${key}` }
                });
            } else if (type === 'alldebrid') {
                response = await fetch(`https://api.alldebrid.com/v4/user/details?agent=nano&apikey=${key}`);
            }
        }

        if (response && response.ok) {
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
