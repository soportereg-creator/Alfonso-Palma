'use client';

import { useState } from 'react';
import Link from 'next/link';
import ServiceCard from '@/components/ServiceCard';

export default function CostaRicaPage() {
  const [token, setToken] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [prefijo, setPrefijo] = useState('');
  const [llave, setLlave] = useState('');
  const [activeTab, setActiveTab] = useState('cr-cedula');

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError(null);
    setLoginSuccess(false);

    try {
      const res = await fetch('/api/costarica/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefijo, llave }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data?.message ?? data?.error ?? 'Error al autenticar');
        return;
      }

      // Try common token fields
      const tkn = data?.token ?? data?.access_token ?? data?.Bearer ?? data?.bearer ?? '';
      if (tkn) {
        setToken(tkn);
        setLoginSuccess(true);
      } else {
        setLoginError('No se encontró token en la respuesta. Revisa la respuesta completa.');
        console.warn('Login response:', data);
      }
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Error de red');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="page-wrapper page-costarica">
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
                🇨🇷 Costa Rica
              </div>
              <h1 className="page-title">Servicios INFILE<br />Costa Rica</h1>
              <p className="page-subtitle">API Hacienda CR y portal de documentos electrónicos INFILE CR</p>
            </div>
          </div>
        </section>

        {/* Token Status Banner */}
        <div style={{ marginBottom: 16 }}>
          <div className={`token-banner${token ? '' : ' no-token'}`}>
            {token ? (
              <>✓ Token activo — Login exitoso. Puedes usar los servicios de Consulta de Documentos y PDF.</>
            ) : (
              <>⚠️ Ingresa tus credenciales en la pestaña de Login para habilitar Consulta de Documentos y PDF.</>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button className={`tab-button ${activeTab === 'cr-cedula' ? 'active' : ''}`} onClick={() => setActiveTab('cr-cedula')}>Actividad Emisor</button>
          <button className={`tab-button ${activeTab === 'cr-login' ? 'active' : ''}`} onClick={() => setActiveTab('cr-login')}>Login INFILE</button>
          <button className={`tab-button ${activeTab === 'cr-documento' ? 'active' : ''}`} onClick={() => setActiveTab('cr-documento')}>Consultar Documento</button>
          <button className={`tab-button ${activeTab === 'cr-pdf' ? 'active' : ''}`} onClick={() => setActiveTab('cr-pdf')}>Descargar PDF</button>
        </div>

        <div className="service-full-width" style={{ paddingBottom: 80 }}>
          {activeTab === 'cr-cedula' && (
            <ServiceCard
              id="cr-cedula"
              icon="🔍"
              name="Consulta de Actividad Emisor (Cédula Fiscal)"
              description="Servicio de Hacienda CR para verificar la situación tributaria de un contribuyente."
              endpoint="https://api.hacienda.go.cr/fe/ae?identificacion={identificacion}"
              method="GET"
              apiPath="/api/costarica/cedula"
              fields={[
                {
                  key: 'identificacion',
                  label: 'Cédula / Identificación Fiscal',
                  placeholder: '3101956518',
                  defaultValue: '3101956518',
                },
              ]}
              getQuery={(vals) => `identificacion=${vals.identificacion}`}
            />
          )}

          {activeTab === 'cr-login' && (
            <div className="service-card" id="cr-login">
              <div className="service-card-header">
                <div className="service-card-title-group">
                  <div className="service-icon">🔐</div>
                  <div>
                    <div className="service-name">Login INFILE CR</div>
                    <div className="service-endpoint">api-gateway-staging.infile.com/api/cr/v1/login</div>
                  </div>
                </div>
                <span className="method-badge method-post">POST</span>
              </div>
              <div className="service-body">
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Autenticación en la plataforma de INFILE Costa Rica para obtener el token necesario para los demás servicios.
                </p>
                <div className="field-group">
                  <label className="field-label" htmlFor="cr-prefijo">Prefijo (Identificador Emisor)</label>
                  <input
                    id="cr-prefijo"
                    type="text"
                    className="field-input"
                    placeholder="TU_PREFIJO"
                    value={prefijo}
                    onChange={(e) => setPrefijo(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="cr-llave">Llave API</label>
                  <input
                    id="cr-llave"
                    type="password"
                    className="field-input"
                    placeholder="TU_LLAVE_API"
                    value={llave}
                    onChange={(e) => setLlave(e.target.value)}
                  />
                </div>

                <button
                  id="cr-login-execute"
                  className={`btn-execute${loginLoading ? ' loading' : ''}`}
                  onClick={handleLogin}
                  disabled={loginLoading || !prefijo || !llave}
                  style={{ background: token ? 'var(--cr-primary)' : undefined }}
                >
                  {loginLoading ? (
                    <><span className="spinner" /> Autenticando...</>
                  ) : token ? (
                    <>✓ Token obtenido — Re-autenticar</>
                  ) : (
                    <>🔐 Obtener Token</>
                  )}
                </button>

                {loginError && (
                  <p style={{ fontSize: 13, color: 'var(--error)', background: 'rgba(255,77,109,0.06)', border: '1px solid rgba(255,77,109,0.2)', borderRadius: 8, padding: '8px 12px' }}>
                    ❌ {loginError}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'cr-documento' && (
            <ServiceCard
              id="cr-documento"
              icon="📋"
              name="Consulta de Documentos MH"
              description="Recupera el XML o JSON de un documento electrónico firmado."
              endpoint="https://api-gateway-staging.infile.com/api/cr/v1/consultar/{uuid}"
              method="GET"
              apiPath="/api/costarica/documento"
              fields={[
                {
                  key: 'uuid',
                  label: 'UUID del Documento',
                  placeholder: '6A5EA0E9-0EB7DE03',
                  defaultValue: '6A5EA0E9-0EB7DE03',
                },
              ]}
              getQuery={(vals) => `uuid=${vals.uuid}`}
              authToken={token}
              extraNote={token ? undefined : 'Requiere token de Login INFILE CR'}
            />
          )}

          {activeTab === 'cr-pdf' && (
            <ServiceCard
              id="cr-pdf"
              icon="📄"
              name="Consulta de PDF del Documento"
              description="Recupera el formato PDF de la representación gráfica del documento electrónico."
              endpoint="https://report-engine-regional-staging.infile.com/api/cr/v1/documento/{uuid}?tipo_documento=pdf"
              method="GET"
              apiPath="/api/costarica/pdf"
              fields={[
                {
                  key: 'uuid',
                  label: 'UUID del Documento',
                  placeholder: '6A5EA0E9-0EB7DE03',
                  defaultValue: '6A5EA0E9-0EB7DE03',
                },
              ]}
              getQuery={(vals) => `uuid=${vals.uuid}`}
              authToken={token}
              isBinary
              binaryFileName="documento.pdf"
              extraNote={token ? undefined : 'Requiere token de Login INFILE CR'}
            />
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
