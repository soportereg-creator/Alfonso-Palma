import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const res = await fetch(
      'https://api-gateway-staging.infile.com/api/cr/v1/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json().catch(() => res.text());
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: 'Error al conectar con INFILE CR', detail: String(err) },
      { status: 502 }
    );
  }
}
