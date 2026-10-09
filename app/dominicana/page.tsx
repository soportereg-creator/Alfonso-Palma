'use client';

import { useState } from 'react';

import Link from 'next/link';
import ServiceCard from '@/components/ServiceCard';

export default function DominicanaPage() {
  const [activeTab, setActiveTab] = useState('rd-rnc');

  const renderRNCTable = (resData: any) => {
    if (!resData) return null;
    const data = resData.data ? resData.data : resData;
    const item = Array.isArray(data) ? data[0] : data;
    if (!item || typeof item !== 'object') return null;
    return (
      <table className="estatus-table">
        <thead>
          <tr>
            <th>RNC</th>
            <th>Razón Social</th>
            <th>Actividad Económica</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{item.rnc || item.RNC || ''}</td>
            <td>{item.razonSocial || item.razon_social || item.nombre || item.Nombre || ''}</td>
            <td>{item.actividadEconomica || item.actividad_economica || item.ActividadEconomica || ''}</td>
            <td>{item.fecha_inicio || item.fecha || item.Fecha || item.fecha_registro || ''}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  const renderMantenimientoTable = (resData: any) => {
    if (!resData) return null;
    let list = Array.isArray(resData) 
      ? resData 
      : (resData.ventanaMantenimientos || resData.data || resData.ventanas || resData.lista || []);
      
    if (!Array.isArray(list) || list.length === 0) {
      if (typeof resData === 'object' && resData !== null && !resData.error && Object.keys(resData).length > 0) {
        list = [resData];
      } else {
        return null;
      }
    }
    return (
      <table className="estatus-table">
        <thead>
          <tr>
            <th>Ambiente</th>
            <th>Horario (Inicio a Fin)</th>
            <th>Días</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item: any, i: number) => {
            const diasStr = Array.isArray(item.dias) 
              ? item.dias.join(', ') 
              : (item.dias || item.Dias || item.days || '');
              
            return (
              <tr key={i}>
                <td>{item.ambiente || item.Ambiente || item.environment || ''}</td>
                <td>{`${item.horaInicio || item.HoraInicio || item.hora_inicio || ''} - ${item.horaFin || item.HoraFin || item.hora_fin || ''}`}</td>
                <td>{diasStr}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const executeVerificarAmbiente = async () => {
    const results = [];
    for (let i = 1; i <= 3; i++) {
      try {
        const res = await fetch(`/api/dominicana/ambiente?ambiente=${i}`);
        const text = await res.text();
        let estatus = text.replace(/["']/g, ''); // in case it returns plain text with quotes
        try {
          const obj = JSON.parse(text);
          estatus = obj.estatus || obj.estado || obj.status || text;
        } catch(e) {
          // not json
        }
        results.push({
          Ambiente: `Ambiente ${i}`,
          Estado: estatus
        });
      } catch (err) {
        results.push({
          Ambiente: `Ambiente ${i}`,
          Estado: 'Error'
        });
      }
    }
    return results;
  };

  return (
    <div className="page-wrapper page-dominicana">
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
                🇩🇴 República Dominicana
              </div>
              <h1 className="page-title">Servicios DGII<br />República Dominicana</h1>
              <p className="page-subtitle">Estado del sistema ECF y consultas de la Dirección General de Impuestos Internos</p>
            </div>
          </div>
        </section>

        {/* Services */}
        <div className="tabs-container">
          <button className={`tab-button ${activeTab === 'rd-rnc' ? 'active' : ''}`} onClick={() => setActiveTab('rd-rnc')}>Consulta de RNC</button>
          <button className={`tab-button ${activeTab === 'rd-mantenimiento' ? 'active' : ''}`} onClick={() => setActiveTab('rd-mantenimiento')}>Ventanas Mantenimiento</button>
          <button className={`tab-button ${activeTab === 'rd-estatus' ? 'active' : ''}`} onClick={() => setActiveTab('rd-estatus')}>Obtener Estatus</button>
          <button className={`tab-button ${activeTab === 'rd-ambiente' ? 'active' : ''}`} onClick={() => setActiveTab('rd-ambiente')}>Verificar Ambiente</button>
        </div>

        <div className="service-full-width">
          {activeTab === 'rd-rnc' && (
            <ServiceCard
              id="rd-rnc"
              icon="🔍"
              name="Consulta de RNC"
              description="Servicio para consultar los datos de un contribuyente a partir de su RNC o Cédula."
              endpoint="https://api-dgii.dominicantechnology.com/api/v1/rnc/{rnc}"
              method="GET"
              apiPath="/api/dominicana/rnc"
              fields={[
                {
                  key: 'rnc',
                  label: 'RNC (Registro Nacional de Contribuyentes)',
                  placeholder: '101566477',
                  defaultValue: '101566477',
                },
              ]}
              getQuery={(vals) => `rnc=${vals.rnc}`}
              renderCustomResponse={renderRNCTable}
            />
          )}

          {activeTab === 'rd-mantenimiento' && (
            <ServiceCard
              id="rd-mantenimiento"
              icon="🔧"
              name="Ventanas de Mantenimiento"
              description="Consulta las ventanas de mantenimiento programadas por la DGII."
              endpoint="https://statusecf.dgii.gov.do/api/EstatusServicios/ObtenerVentanasMantenimiento"
              method="GET"
              apiPath="/api/dominicana/mantenimiento"
              renderCustomResponse={renderMantenimientoTable}
            />
          )}

          {activeTab === 'rd-estatus' && (
            <ServiceCard
              id="rd-estatus"
              icon="📊"
              name="Obtener Estatus"
              description="Devuelve el estado actual de los diferentes servicios y plataformas ECF."
              endpoint="https://statusecf.dgii.gov.do/api/EstatusServicios/ObtenerEstatus"
              method="GET"
              apiPath="/api/dominicana/estatus"
            />
          )}

          {activeTab === 'rd-ambiente' && (
            <ServiceCard
              id="rd-ambiente"
              icon="🌐"
              name="Verificar Ambiente ECF"
              description="Verifica la disponibilidad de los 3 ambientes de certificación o producción ECF al mismo tiempo."
              endpoint="https://statusecf.dgii.gov.do/api/EstatusServicios/VerificarEstado?ambiente={1,2,3}"
              method="GET"
              apiPath="/api/dominicana/ambiente"
              customExecute={executeVerificarAmbiente}
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
