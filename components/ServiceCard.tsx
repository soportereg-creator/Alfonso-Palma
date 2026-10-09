'use client';

import { useState, useCallback } from 'react';

interface ResponseData {
  status: number;
  ok: boolean;
  data: unknown;
  time: number;
}

interface Field {
  key: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: 'text' | 'textarea' | 'number';
  rows?: number;
}

interface ServiceCardProps {
  id: string;
  icon: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST';
  fields?: Field[];
  apiPath: string; // internal Next.js API path
  getBody?: (values: Record<string, string>) => object;
  getQuery?: (values: Record<string, string>) => string;
  authToken?: string; // optional Bearer token
  extraHeaders?: Record<string, string>; // additional headers forwarded to proxy
  isBinary?: boolean; // for PDF
  binaryFileName?: string;
  extraNote?: string;
  description?: string;
  renderCustomResponse?: (data: unknown) => React.ReactNode;
  customExecute?: (values: Record<string, string>) => Promise<any>;
}

export default function ServiceCard({
  id,
  icon,
  name,
  endpoint,
  method,
  fields = [],
  apiPath,
  getBody,
  getQuery,
  authToken,
  extraHeaders,
  isBinary,
  binaryFileName = 'documento.pdf',
  extraNote,
  description,
  renderCustomResponse,
  customExecute,
}: ServiceCardProps) {
  const initValues: Record<string, string> = {};
  fields.forEach((f) => { initValues[f.key] = f.defaultValue ?? ''; });

  const [values, setValues] = useState<Record<string, string>>(initValues);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const execute = useCallback(async () => {
    setLoading(true);
    setResponse(null);
    setError(null);
    setPdfUrl(null);

    const start = performance.now();

    try {
      if (customExecute) {
        const data = await customExecute(values);
        const elapsed = Math.round(performance.now() - start);
        setResponse({ status: 200, ok: true, data, time: elapsed });
        return;
      }

      let url = apiPath;
      const fetchOptions: RequestInit = { method };

      if (method === 'POST' && getBody) {
        fetchOptions.headers = {
          'Content-Type': 'application/json',
          ...(extraHeaders ?? {}),
        };
        fetchOptions.body = JSON.stringify(getBody(values));
      }

      if (method === 'GET' && getQuery) {
        url = `${apiPath}?${getQuery(values)}`;
      }

      if (authToken) {
        fetchOptions.headers = {
          ...((fetchOptions.headers as Record<string, string>) ?? {}),
          ...(extraHeaders ?? {}),
          Authorization: `Bearer ${authToken}`,
        };
      } else if (extraHeaders && method === 'GET') {
        fetchOptions.headers = {
          ...((fetchOptions.headers as Record<string, string>) ?? {}),
          ...extraHeaders,
        };
      }

      const res = await fetch(url, fetchOptions);
      const elapsed = Math.round(performance.now() - start);

      if (isBinary) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        setPdfUrl(blobUrl);
        setResponse({ status: res.status, ok: res.ok, data: null, time: elapsed });
      } else {
        let data: unknown;
        try {
          data = await res.json();
        } catch {
          data = await res.text();
        }
        setResponse({ status: res.status, ok: res.ok, data, time: elapsed });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [values, apiPath, method, getBody, getQuery, authToken, isBinary, customExecute]);

  const copyJson = () => {
    if (!response?.data) return;
    navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatJson = (data: unknown): string => {
    return JSON.stringify(data, null, 2)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
      });
  };

  const shortEndpoint = endpoint.replace('https://', '').replace('http://', '');

  const renderGenericTable = (data: any) => {
    if (!data || typeof data !== 'object') return null;

    if (Array.isArray(data)) {
      if (data.length === 0) return null;
      const keys = Object.keys(data[0]);
      return (
        <table className="estatus-table">
          <thead>
            <tr>
              {keys.map(k => <th key={k}>{k.toUpperCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i}>
                {keys.map(k => {
                  const val = item[k];
                  const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
                  let isOk = false;
                  let isErr = false;
                  if (k.toLowerCase() === 'estatus' || k.toLowerCase() === 'estado') {
                    if (strVal.toLowerCase() === 'disponible' || strVal.toLowerCase() === 'exito') isOk = true;
                    else isErr = true;
                  }
                  return (
                    <td key={k}>
                      {(isOk || isErr) ? (
                        <span className={`estatus-badge ${isOk ? 'estatus-ok' : 'estatus-err'}`}>{strVal}</span>
                      ) : (
                        strVal
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      const keys = Object.keys(data);
      if (keys.length === 0) return null;
      return (
        <table className="estatus-table">
          <thead>
            <tr>
              <th>PROPIEDAD</th>
              <th>VALOR</th>
            </tr>
          </thead>
          <tbody>
            {keys.map(k => {
              const val = data[k];
              const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
              return (
                <tr key={k}>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{k}</td>
                  <td>{strVal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div className="service-card" id={id}>
      {/* Header */}
      <div className="service-card-header">
        <div className="service-card-title-group">
          <div className="service-icon">{icon}</div>
          <div>
            <div className="service-name">{name}</div>
            <div className="service-endpoint" title={endpoint}>{shortEndpoint}</div>
          </div>
        </div>
        <span className={`method-badge method-${method.toLowerCase()}`}>{method}</span>
      </div>

      {/* Body */}
      <div className="service-body">
        {description && (
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
            {description}
          </p>
        )}

        {extraNote && (
          <p style={{ fontSize: 12, color: 'var(--warning)', background: 'rgba(255,179,71,0.06)', border: '1px solid rgba(255,179,71,0.2)', borderRadius: 8, padding: '8px 12px' }}>
            ⚠️ {extraNote}
          </p>
        )}

        {fields.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fields.map((field) => (
              <div key={field.key} className="field-group">
                <label className="field-label" htmlFor={`${id}-${field.key}`}>
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={`${id}-${field.key}`}
                    className="field-input field-textarea"
                    rows={field.rows ?? 3}
                    placeholder={field.placeholder}
                    value={values[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                ) : (
                  <input
                    id={`${id}-${field.key}`}
                    type={field.type ?? 'text'}
                    className="field-input"
                    placeholder={field.placeholder}
                    value={values[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <button
          id={`${id}-execute`}
          className={`btn-execute${loading ? ' loading' : ''}`}
          onClick={execute}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Consultando...
            </>
          ) : (
            <>
              ▶ Ejecutar consulta
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="response-section">
          <div className="response-header">
            <div className="response-status">
              <span className="status-dot status-err" />
              <span style={{ color: 'var(--error)' }}>Error de red</span>
            </div>
          </div>
          <pre className="json-output" style={{ color: 'var(--error)' }}>{error}</pre>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="response-section">
          <div className="response-header">
            <div className="response-status">
              <span className={`status-dot ${response.ok ? 'status-ok' : 'status-err'}`} />
              <span style={{ color: response.ok ? 'var(--success)' : 'var(--error)' }}>
                HTTP {response.status}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="response-time">{response.time}ms</span>
              {!isBinary && response.data !== null && (
                <button className="btn-copy" onClick={copyJson}>
                  {copied ? '✓ Copiado' : '⧉ Copiar JSON'}
                </button>
              )}
            </div>
          </div>

          {isBinary && pdfUrl ? (
            <div style={{ padding: '16px 24px' }}>
              <a
                href={pdfUrl}
                download={binaryFileName}
                className="btn-pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                📄 Descargar PDF
              </a>
            </div>
          ) : (
            response.data !== null && (
              <>
                <div className="custom-response-wrapper" style={{ padding: '0 24px 16px', overflowX: 'auto' }}>
                  {renderCustomResponse ? renderCustomResponse(response.data) : renderGenericTable(response.data)}
                </div>
                <pre
                  className="json-output"
                  dangerouslySetInnerHTML={{ __html: formatJson(response.data) }}
                />
              </>
            )
          )}
        </div>
      )}
    </div>
  );
}
