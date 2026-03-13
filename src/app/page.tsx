'use client';

import { useState, useEffect } from 'react';

interface DashboardData {
  producaoHoje: number;
  eficienciaMedia: number;
  estoqueFio: number;
  estoqueMalha: number;
  pedidosPendentes: number;
  maquinasAtivas: number;
  maquinasManutencao: number;
  maquinasTotal: number;
  producaoSemanal: { dia: string; kg: number }[];
  alertas: { tipo: string; mensagem: string }[];
  ultimasNitas: { numero: string; cliente: string; status: string; quantidade: number }[];
  financeiro: { totalPagar: number; totalReceber: number; saldo: number };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⏳</div>
        <h3>Carregando...</h3>
      </div>
    );
  }

  const d = data || {
    producaoHoje: 0, eficienciaMedia: 0, estoqueFio: 0, estoqueMalha: 0,
    pedidosPendentes: 0, maquinasAtivas: 0, maquinasManutencao: 0, maquinasTotal: 0,
    producaoSemanal: [], alertas: [], ultimasNitas: [],
    financeiro: { totalPagar: 0, totalReceber: 0, saldo: 0 },
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral da sua malharia</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="/producao/nitas" className="btn btn-primary">📋 Nova Nita</a>
          <a href="/financeiro" className="btn btn-secondary">💰 Financeiro</a>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Produção Hoje</span>
            <div className="card-icon" style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)' }}>🏭</div>
          </div>
          <div className="card-value">{d.producaoHoje.toLocaleString('pt-BR')} kg</div>
          <div className="card-footer">
            <span className="card-trend-up">↑ 12%</span>
            <span style={{ color: 'var(--text-muted)' }}>vs. ontem</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Eficiência Média</span>
            <div className="card-icon" style={{ background: d.eficienciaMedia >= 90 ? 'var(--accent-green-light)' : d.eficienciaMedia >= 87 ? 'var(--accent-orange-light)' : 'var(--accent-red-light)', color: d.eficienciaMedia >= 90 ? 'var(--accent-green)' : d.eficienciaMedia >= 87 ? 'var(--accent-orange)' : 'var(--accent-red)' }}>📊</div>
          </div>
          <div className="card-value">{d.eficienciaMedia.toFixed(1)}%</div>
          <div className="card-footer">
            <span className={d.eficienciaMedia >= 90 ? 'badge badge-green' : d.eficienciaMedia >= 87 ? 'badge badge-orange' : 'badge badge-red'}>
              {d.eficienciaMedia >= 90 ? '● Ótimo' : d.eficienciaMedia >= 87 ? '● Atenção' : '● Crítico'}
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Estoque de Fio</span>
            <div className="card-icon" style={{ background: 'var(--accent-purple-light)', color: 'var(--accent-purple)' }}>🧵</div>
          </div>
          <div className="card-value">{d.estoqueFio.toLocaleString('pt-BR')} kg</div>
          <div className="card-footer">
            <span style={{ color: 'var(--text-muted)' }}>Malha: {d.estoqueMalha.toLocaleString('pt-BR')} kg</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Pedidos Pendentes</span>
            <div className="card-icon" style={{ background: 'var(--accent-orange-light)', color: 'var(--accent-orange)' }}>📋</div>
          </div>
          <div className="card-value">{d.pedidosPendentes}</div>
          <div className="card-footer">
            <span style={{ color: 'var(--text-muted)' }}>{d.maquinasAtivas}/{d.maquinasTotal} ativas • {d.maquinasManutencao} manutenção</span>
          </div>
        </div>
      </div>

      {/* Gráfico e Alertas */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        <div className="chart-container">
          <h3>📈 Produção Semanal (kg)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', padding: '20px 0' }}>
            {d.producaoSemanal.map((item, i) => {
              const max = Math.max(...d.producaoSemanal.map(v => v.kg));
              const height = max > 0 ? (item.kg / max) * 160 : 0;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.kg}</span>
                  <div style={{
                    width: '100%',
                    height: `${height}px`,
                    background: 'var(--gradient-blue)',
                    borderRadius: '6px 6px 2px 2px',
                    minHeight: '4px',
                    transition: 'height 0.5s ease',
                  }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.dia}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>🔔 Alertas</h3>
          {d.alertas.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Nenhum alerta no momento</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {d.alertas.map((alert, i) => (
                <div key={i} style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: alert.tipo === 'erro' ? 'var(--accent-red-light)' : alert.tipo === 'aviso' ? 'var(--accent-orange-light)' : 'var(--accent-blue-light)',
                  fontSize: '13px',
                  color: alert.tipo === 'erro' ? 'var(--accent-red)' : alert.tipo === 'aviso' ? 'var(--accent-orange)' : 'var(--accent-blue)',
                  fontWeight: 500,
                }}>
                  {alert.tipo === 'erro' ? '🔴' : alert.tipo === 'aviso' ? '🟡' : 'ℹ️'} {alert.mensagem}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resumo Financeiro + Atalhos */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>💰 Resumo Financeiro</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '120px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>A Pagar</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-red)' }}>
                R$ {d.financeiro.totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '120px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>A Receber</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-green)' }}>
                R$ {d.financeiro.totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '120px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Saldo</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: d.financeiro.saldo >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                R$ {d.financeiro.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          <a href="/financeiro" className="btn btn-secondary btn-sm" style={{ marginTop: '16px', display: 'inline-block' }}>Ver detalhes →</a>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>⚡ Atalhos Rápidos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <a href="/producao/nitas" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s' }}>
              📋 Nitas (OPs)
            </a>
            <a href="/estoque/fios" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s' }}>
              🧵 Estoque de Fios
            </a>
            <a href="/cadastros/maquinas" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s' }}>
              🏭 Máquinas
            </a>
            <a href="/manutencao" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s' }}>
              🔧 Manutenções
            </a>
            <a href="/financeiro" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s' }}>
              💰 Financeiro
            </a>
            <a href="/relatorios" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s' }}>
              📈 Relatórios
            </a>
          </div>
        </div>
      </div>

      {/* Últimas Nitas */}
      <div className="table-container">
        <div className="table-header">
          <h3>📋 Últimas Ordens de Produção</h3>
          <a href="/producao/nitas" className="btn btn-sm btn-secondary">Ver Todas</a>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nita</th>
              <th>Cliente</th>
              <th>Quantidade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {d.ultimasNitas.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Nenhuma nita registrada ainda
                </td>
              </tr>
            ) : (
              d.ultimasNitas.map((nita, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{nita.numero}</td>
                  <td>{nita.cliente}</td>
                  <td>{nita.quantidade} kg</td>
                  <td>
                    <span className={`badge ${nita.status === 'concluida' ? 'badge-green' :
                      nita.status === 'em_producao' ? 'badge-blue' :
                        nita.status === 'aprovada' ? 'badge-purple' :
                          nita.status === 'cancelada' ? 'badge-red' :
                            'badge-orange'
                      }`}>
                      {nita.status === 'concluida' ? 'Concluída' :
                        nita.status === 'em_producao' ? 'Em Produção' :
                          nita.status === 'aprovada' ? 'Aprovada' :
                            nita.status === 'cancelada' ? 'Cancelada' :
                              'Rascunho'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
