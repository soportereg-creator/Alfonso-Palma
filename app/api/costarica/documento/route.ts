import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const uuid = req.nextUrl.searchParams.get('uuid') ?? '';
  const authorization = req.headers.get('authorization') ?? '';

  try {
    const res = await fetch(
      `https://api-gateway-staging.infile.com/api/cr/v1/consultar/${encodeURIComponent(uuid)}`,
      {
        method: 'GET',
        headers: authorization ? { Authorization: authorization } : {},
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
