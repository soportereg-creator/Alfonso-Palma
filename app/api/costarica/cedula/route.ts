import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const identificacion = req.nextUrl.searchParams.get('identificacion') ?? '';

  try {
    const res = await fetch(
      `https://api.hacienda.go.cr/fe/ae?identificacion=${encodeURIComponent(identificacion)}`,
      { method: 'GET' }
    );

    const data = await res.json().catch(() => res.text());
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: 'Error al conectar con Hacienda CR', detail: String(err) },
      { status: 502 }
    );
  }
}
