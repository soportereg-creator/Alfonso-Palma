import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const rnc = req.nextUrl.searchParams.get('rnc') ?? '';

  try {
    const res = await fetch(
      `https://api-dgii.dominicantechnology.com/api/v1/rnc/${encodeURIComponent(rnc)}`,
      { method: 'GET' }
    );

    const data = await res.json().catch(() => res.text());
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: 'Error al conectar con el servidor DGII', detail: String(err) },
      { status: 502 }
    );
  }
}
