import { NextResponse } from 'next/server';

const DGII_API_KEY = process.env.DGII_API_KEY ?? 'apikey 41dfbe1d-17ea-4980-9709-822bbecb4901';

export async function GET() {
  try {
    const res = await fetch(
      'https://statusecf.dgii.gov.do/api/EstatusServicios/ObtenerEstatus',
      {
        method: 'GET',
        headers: { authorization: DGII_API_KEY },
      }
    );

    const data = await res.json().catch(() => res.text());
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: 'Error al conectar con DGII', detail: String(err) },
      { status: 502 }
    );
  }
}
