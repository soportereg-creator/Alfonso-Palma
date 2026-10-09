import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const uuid = req.nextUrl.searchParams.get('uuid') ?? '';
  const authorization = req.headers.get('authorization') ?? '';

  try {
    const res = await fetch(
      `https://report-engine-regional-staging.infile.com/api/cr/v1/documento/${encodeURIComponent(uuid)}?tipo_documento=pdf`,
      {
        method: 'GET',
        headers: authorization ? { Authorization: authorization } : {},
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: 'Error al obtener el PDF', detail: errText },
        { status: res.status }
      );
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="documento-${uuid}.pdf"`,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: 'Error al conectar con el servicio de PDF', detail: String(err) },
      { status: 502 }
    );
  }
}
