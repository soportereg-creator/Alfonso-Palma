import Link from 'next/link';

export default function HomePage() {
  const countries = [
    {
      id: 'panama',
      flag: '🇵🇦',
      name: 'Panamá',
      desc: 'Servicios de facturación electrónica PAC — Consultas y eventos INFILE Panamá.',
      services: [
        'Consulta de RUC (Registro Único de Contribuyente)',
        'Evento de Anulación de Comprobante',
        'Consulta de CUFE',
      ],
      theme: 'panama',
      color: '#00c6fb',
    },
    {
      id: 'dominicana',
      flag: '🇩🇴',
      name: 'República Dominicana',
      desc: 'Servicios de la DGII — Estado del sistema de facturación electrónica.',
      services: [
        'Consulta de RNC',
        'Ventanas de Mantenimiento',
        'Obtener Estatus del Sistema',
        'Verificar Ambiente ECF',
      ],
      theme: 'dominicana',
      color: '#4f7eff',
    },
    {
      id: 'costarica',
      flag: '🇨🇷',
      name: 'Costa Rica',
      desc: 'Servicios del Ministerio de Hacienda y API INFILE CR para documentos electrónicos.',
      services: [
        'Login INFILE CR (obtener token)',
        'Consulta de Actividad Emisor (Cédula Fiscal)',
        'Consulta de Documentos MH',
        'Descarga de PDF del Documento',
      ],
      theme: 'costarica',
      color: '#00e676',
    },
  ];

  return (
    <div className="page-wrapper">
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
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              v1.0 · Multi-País
            </span>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="container">
        <section className="hero">
          <div className="hero-badge">
            <span>🌐</span>
            <span>Panamá · República Dominicana · Costa Rica</span>
          </div>
          <h1 className="hero-title">
            Portal de Consultas<br />
            <span className="gradient-text">Multi-País</span>
          </h1>
          <p className="hero-subtitle">
            Plataforma centralizada para probar y consultar los servicios de
            facturación electrónica de INFILE en toda la región.
          </p>
        </section>

        {/* Country Cards */}
        <section className="countries-grid">
          {countries.map((country) => (
            <Link
              key={country.id}
              href={`/${country.id}`}
              className={`country-card ${country.theme}`}
              id={`card-${country.id}`}
            >
              <span className="country-flag">{country.flag}</span>
              <h2 className="country-name">{country.name}</h2>
              <p className="country-desc">{country.desc}</p>
              <ul className="country-services-list">
                {country.services.map((svc) => (
                  <li key={svc} className="service-pill">
                    {svc}
                  </li>
                ))}
              </ul>
              <div className="country-cta">
                <span>Explorar servicios</span>
                <span className="arrow">→</span>
              </div>
            </Link>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} INFILE · Portal Multi-País · Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
}
