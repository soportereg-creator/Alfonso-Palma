import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const env = req.nextUrl.searchParams.get('env') ?? 'test';
  const body = await req.json();

  const usuarioApi = req.headers.get('usuario-api') ?? '';
  const llaveApi   = req.headers.get('llave-api')   ?? '';
  const llaveFirma = req.headers.get('llave-firma')  ?? '';

  try {
    const res = await fetch(
      `https://infile-pac-unificado.herokuapp.com/api/v1/eventos/unificado/${env}/json/anulacion`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(usuarioApi && { 'usuario-api': usuarioApi }),
          ...(llaveApi   && { 'llave-api':   llaveApi   }),
          ...(llaveFirma && { 'llave-firma':  llaveFirma }),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json().catch(() => res.text());
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: 'Error al conectar con el servidor', detail: String(err) },
      { status: 502 }
    );
  }
}

