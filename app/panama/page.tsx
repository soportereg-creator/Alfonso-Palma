'use client';

import { useState } from 'react';
import Link from 'next/link';
import ServiceCard from '@/components/ServiceCard';

type Env = 'test' | 'prod';

export default function PanamaPage() {
  const [env, setEnv] = useState<Env>('test');
  const [activeTab, setActiveTab] = useState('panama-creds');

  const renderRUCTable = (resData: any) => {
    if (!resData) return null;
    let data = resData;
    if (resData.respuesta_pac && resData.respuesta_pac.ruc) {
      data = resData.respuesta_pac.ruc;
    } else if (resData.respuesta_pac) {
      data = resData.respuesta_pac;
    }
    const item = Array.isArray(data) ? data[0] : data;
    if (!item || typeof item !== 'object') return null;
    return (
      <table className="estatus-table">
        <thead>
          <tr>
            <th>RUC</th>
            <th>Nombre</th>
            <th>Tipo de Contribuyente</th>
            <th>RUC Afiliado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{item.dRuc || ''}</td>
            <td>{item.dNomb || ''}</td>
            <td>{item.dTipoRec || item.dTipoRuc || ''}</td>
            <td>{item.iAfilFE !== undefined ? String(item.iAfilFE) : ''}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  const renderStatusTable = (resData: any) => {
    if (!resData) return null;
    let item = resData.respuesta_pac || (Array.isArray(resData) ? resData[0] : resData);
    if (Array.isArray(item)) {
      item = item[0]; // Extract if respuesta_pac is an array
    }
    if (!item || typeof item !== 'object') return null;
    
    // Sometimes the response code is in dCodRes or it has an 'estado'
    const msg = item.dMsgRes || item.dMsRes || '';
    const respuesta = item.respuesta || item.dCodRes || item.estado || (msg ? 'Completado' : JSON.stringify(item));
    
    return (
      <table className="estatus-table">
        <thead>
          <tr>
            <th>Mensaje</th>
            <th>Respuesta</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{msg}</td>
            <td>
              <span className={`estatus-badge ${String(respuesta).toLowerCase().includes('exito') || String(respuesta) === '0680' || String(respuesta) === '1' ? 'estatus-ok' : ''}`}>
                {respuesta}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  // Panama API credentials
  const [usuarioApi, setUsuarioApi] = useState('1-555-999');
  const [llaveApi,   setLlaveApi]   = useState('a671bd1a7619417312c98e27b');
  const [llaveFirma, setLlaveFirma] = useState('R1UFDLW24AL3TP4GL3DNZ5PPWG6DUSGP');
  const [credsSet,   setCredsSet]   = useState(true); // default values pre-loaded

  // Panama PDF state
  const [pdfCufe, setPdfCufe] = useState('FE011000000000001-555-999-9900012026072300099000080010123083476384');
  const [pdfCopied, setPdfCopied] = useState(false);

  const pdfBaseUrl = env === 'prod'
    ? 'https://certificador.infilepac.com/pac/v1/dev/descargas/pdf/'
    : 'https://certificador-test.infilepac.com/pac/v1/dev/descargas/pdf/';

  const generatedPdfUrl = pdfCufe.trim() ? `${pdfBaseUrl}${pdfCufe.trim()}` : '';

  const handleCopyPdfUrl = () => {
    if (!generatedPdfUrl) return;
    navigator.clipboard.writeText(generatedPdfUrl);
    setPdfCopied(true);
    setTimeout(() => setPdfCopied(false), 2000);
  };

  const extraHeaders: Record<string, string> = {
    'usuario-api': usuarioApi,
    'llave-api':   llaveApi,
    'llave-firma': llaveFirma,
  };

  const handleSaveCreds = () => {
    setCredsSet(true);
  };

  return (
    <div className="page-wrapper page-panama">
      {/* Header */}
      <header className="site-header">
        <div className="container">
          <nav className="nav-inner">
            <a href="/" className="logo">
              <div className="logo-icon">🌎</div>
              <span className="logo-text">
                <span>INFILE</span> Portal
              </span>
            </a>
            <Link href="/" className="nav-back">
              ← Países
            </Link>
          </nav>
        </div>
      </header>

      <main className="container">
        {/* Page Hero */}
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="page-title-group">
              <div className="country-tag">
                🇵🇦 Panamá
              </div>
              <h1 className="page-title">Servicios PAC<br />Panamá</h1>
              <p className="page-subtitle">Consultas y eventos de facturación electrónica — INFILE PAC Unificado</p>
            </div>

            {/* Environment Toggle */}
            <div className="env-toggle-wrapper">
              <span className="env-toggle-label">Ambiente:</span>
              <div className="env-toggle" role="group" aria-label="Seleccionar ambiente">
                <button
                  id="btn-env-test"
                  className={`env-btn ${env === 'test' ? 'active-test' : ''}`}
                  onClick={() => setEnv('test')}
                >
                  Test
                </button>
                <button
                  id="btn-env-prod"
                  className={`env-btn ${env === 'prod' ? 'active-prod' : ''}`}
                  onClick={() => setEnv('prod')}
                >
                  Prod
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Status banner */}
        <div style={{ marginBottom: 16 }}>
          <div
            className={`token-banner${credsSet ? '' : ' no-token'}`}
          >
            {credsSet ? (
              <>✓ Credenciales activas — Los headers se enviarán en cada consulta</>
            ) : (
              <>⚠️ Modifica los campos en la pestaña de Credenciales y guárdalos para aplicar</>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button className={`tab-button ${activeTab === 'panama-creds' ? 'active' : ''}`} onClick={() => setActiveTab('panama-creds')}>Credenciales</button>
          <button className={`tab-button ${activeTab === 'panama-ruc' ? 'active' : ''}`} onClick={() => setActiveTab('panama-ruc')}>Consulta de RUC</button>
          <button className={`tab-button ${activeTab === 'panama-anulacion' ? 'active' : ''}`} onClick={() => setActiveTab('panama-anulacion')}>Anulación</button>
          <button className={`tab-button ${activeTab === 'panama-cufe' ? 'active' : ''}`} onClick={() => setActiveTab('panama-cufe')}>Consulta CUFE</button>
          <button className={`tab-button ${activeTab === 'panama-pdf' ? 'active' : ''}`} onClick={() => setActiveTab('panama-pdf')}>Descargar PDF</button>
        </div>

        <div className="service-full-width" style={{ paddingBottom: 80 }}>
          {activeTab === 'panama-creds' && (
            <div className="service-card" id="panama-creds">
              <div className="service-card-header">
                <div className="service-card-title-group">
                  <div className="service-icon">🔑</div>
                  <div>
                    <div className="service-name">Credenciales de Acceso API</div>
                    <div className="service-endpoint">
                      Headers: usuario-api · llave-api · llave-firma
                    </div>
                  </div>
                </div>
                <span className="method-badge" style={{ background: 'rgba(0,198,251,0.12)', color: 'var(--panama-primary)', border: '1px solid rgba(0,198,251,0.2)' }}>
                  HEADER
                </span>
              </div>
              <div className="service-body">
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Configura las credenciales necesarias para acceder a los servicios PAC.
                </p>
                <div className="field-group">
                  <label className="field-label" htmlFor="panama-usuario-api">usuario-api</label>
                  <input
                    id="panama-usuario-api"
                    type="text"
                    className="field-input"
                    placeholder="1-555-999"
                    value={usuarioApi}
                    onChange={(e) => { setUsuarioApi(e.target.value); setCredsSet(false); }}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="panama-llave-api">llave-api</label>
                  <input
                    id="panama-llave-api"
                    type="password"
                    className="field-input"
                    placeholder="llave de API"
                    value={llaveApi}
                    onChange={(e) => { setLlaveApi(e.target.value); setCredsSet(false); }}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="panama-llave-firma">llave-firma</label>
                  <input
                    id="panama-llave-firma"
                    type="password"
                    className="field-input"
                    placeholder="llave de firma"
                    value={llaveFirma}
                    onChange={(e) => { setLlaveFirma(e.target.value); setCredsSet(false); }}
                  />
                </div>
                <button
                  id="panama-creds-save"
                  className="btn-execute"
                  onClick={handleSaveCreds}
                  style={{ background: credsSet ? 'var(--panama-primary)' : undefined }}
                >
                  {credsSet ? '✓ Credenciales guardadas — Actualizar' : '💾 Guardar credenciales'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'panama-ruc' && (
            <ServiceCard
              id="panama-ruc"
              icon="🔍"
              name="Consulta de RUC"
              description="Verifica los datos y validez de un RUC ante la DGI de Panamá."
              endpoint={`https://infile-pac-unificado.herokuapp.com/api/v1/consultas/unificado/${env}/json/ruc_dv`}
              method="POST"
              apiPath={`/api/panama/ruc?env=${env}`}
              extraHeaders={extraHeaders}
              fields={[
                {
                  key: 'ruc',
                  label: 'RUC',
                  placeholder: '263-2-1080',
                  defaultValue: '263-2-1080',
                },
                {
                  key: 'tipo_contribuyente',
                  label: 'Tipo Contribuyente',
                  placeholder: '2',
                  defaultValue: '2',
                  type: 'number',
                },
              ]}
              getBody={(vals) => ({
                ruc: vals.ruc,
                tipo_contribuyente: parseInt(vals.tipo_contribuyente) || 2,
              })}
              renderCustomResponse={renderRUCTable}
            />
          )}

          {activeTab === 'panama-anulacion' && (
            <ServiceCard
              id="panama-anulacion"
              icon="🚫"
              name="Evento de Anulación"
              description="Registra la anulación de un documento electrónico mediante su CUFE."
              endpoint={`https://infile-pac-unificado.herokuapp.com/api/v1/eventos/unificado/${env}/json/anulacion`}
              method="POST"
              apiPath={`/api/panama/anulacion?env=${env}`}
              extraHeaders={extraHeaders}
              fields={[
                {
                  key: 'cufe',
                  label: 'CUFE',
                  placeholder: 'FE011000000000001-...',
                  defaultValue: 'FE011000000000001-555-999-9900012026072300099000080010123083476383',
                },
                {
                  key: 'motivo_anulacion',
                  label: 'Motivo de Anulación',
                  placeholder: 'Descripción del motivo...',
                  defaultValue: 'Cancelacion del negocio',
                },
              ]}
              getBody={(vals) => ({
                cufe: vals.cufe,
                motivo_anulacion: vals.motivo_anulacion,
              })}
              renderCustomResponse={renderStatusTable}
            />
          )}

          {activeTab === 'panama-cufe' && (
            <ServiceCard
              id="panama-cufe"
              icon="🧾"
              name="Consulta de CUFE"
              description="Recupera la información y estado de un documento a partir de su CUFE."
              endpoint={`https://infile-pac-unificado.herokuapp.com/api/v1/consultas/unificado/${env}/json/factura`}
              method="POST"
              apiPath={`/api/panama/cufe?env=${env}`}
              extraHeaders={extraHeaders}
              fields={[
                {
                  key: 'cufe',
                  label: 'CUFE',
                  placeholder: 'FE011000000000001-...',
                  defaultValue: 'FE011000000000001-555-999-9900012026072300099000080010123083476384',
                },
              ]}
              getBody={(vals) => ({
                cufe: vals.cufe,
              })}
              renderCustomResponse={renderStatusTable}
            />
          )}

          {activeTab === 'panama-pdf' && (
            <div className="service-card" id="panama-pdf">
              <div className="service-card-header">
                <div className="service-card-title-group">
                  <div className="service-icon">📄</div>
                  <div>
                    <div className="service-name">Consulta de PDF</div>
                    <div className="service-endpoint">
                      {pdfBaseUrl}{'{cufe}'}
                    </div>
                  </div>
                </div>
                <span className="method-badge method-get">
                  GET / PDF
                </span>
              </div>
              <div className="service-body">
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Genera la representación gráfica (PDF) a partir del CUFE de un documento electrónico.
                </p>
                <div className="field-group">
                  <label className="field-label" htmlFor="panama-pdf-cufe">CUFE</label>
                  <input
                    id="panama-pdf-cufe"
                    type="text"
                    className="field-input"
                    placeholder="FE011000000000001-..."
                    value={pdfCufe}
                    onChange={(e) => setPdfCufe(e.target.value)}
                  />
                </div>

                {/* Dynamic Link Box */}
                <div className="field-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="field-label" style={{ margin: 0 }}>
                      Link del PDF ({env === 'prod' ? 'PRODUCCIÓN' : 'TEST'})
                    </label>
                    <button
                      id="panama-pdf-copy"
                      type="button"
                      className="btn-copy"
                      onClick={handleCopyPdfUrl}
                      style={{ fontSize: 11, padding: '3px 8px' }}
                    >
                      {pdfCopied ? '✓ Copiado' : '📋 Copiar link'}
                    </button>
                  </div>
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '12px',
                      color: 'var(--panama-primary)',
                      wordBreak: 'break-all',
                      lineHeight: 1.5,
                    }}
                  >
                    {generatedPdfUrl || `${pdfBaseUrl}<ingresa-el-cufe>`}
                  </div>
                </div>

                {/* Action Button */}
                <div>
                  <a
                    id="panama-pdf-open"
                    href={generatedPdfUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-execute"
                    style={{
                      textDecoration: 'none',
                      textAlign: 'center',
                      background: 'var(--panama-primary)',
                      color: '#070711',
                      fontWeight: 600,
                      pointerEvents: pdfCufe.trim() ? 'auto' : 'none',
                      opacity: pdfCufe.trim() ? 1 : 0.5,
                    }}
                  >
                    Abrir PDF en nueva pestaña ↗
                  </a>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  💡 El link se arma automáticamente según el ambiente seleccionado ({env === 'prod' ? 'Producción' : 'Test'}) ingresando únicamente el CUFE.
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} INFILE · Portal Multi-País</p>
        </div>
      </footer>
    </div>
  );
}
