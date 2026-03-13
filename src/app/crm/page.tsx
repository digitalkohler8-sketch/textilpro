'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';

export default function CRMPage() {
    const [deals, setDeals] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const { showToast } = useToast();
    const [form, setForm] = useState({ titulo: '', clienteId: '', clienteNome: '', valor: '', etapa: 'prospecto', probabilidade: '50', responsavel: '', dataPrevisao: '', observacoes: '' });

    const fetchData = () => {
        fetch('/api/deals').then(r => r.json()).then(setDeals);
        fetch('/api/customers').then(r => r.json()).then(setCustomers);
    };
    useEffect(() => { fetchData(); }, []);

    const etapas = [
        { key: 'prospecto', label: 'Prospecto', color: 'var(--text-muted)' },
        { key: 'contato', label: 'Contato', color: 'var(--accent-blue)' },
        { key: 'proposta', label: 'Proposta', color: 'var(--accent-purple)' },
        { key: 'negociacao', label: 'Negociação', color: 'var(--accent-orange)' },
        { key: 'fechado_ganho', label: 'Fechado ✓', color: 'var(--accent-green)' },
        { key: 'fechado_perdido', label: 'Perdido ✗', color: 'var(--accent-red)' },
    ];

    const handleSubmit = async () => {
        const customer = customers.find(c => c.id === form.clienteId);
        const payload = { ...form, clienteNome: customer?.nome || '', valor: Number(form.valor), probabilidade: Number(form.probabilidade) };
        try {
            await fetch('/api/deals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            showToast('Negócio criado com sucesso!', 'success');
        } catch {
            showToast('Erro ao criar negócio', 'error');
        }
        setShowModal(false); fetchData();
        setForm({ titulo: '', clienteId: '', clienteNome: '', valor: '', etapa: 'prospecto', probabilidade: '50', responsavel: '', dataPrevisao: '', observacoes: '' });
    };

    const handleMove = async (deal: any, newEtapa: string) => {
        try {
            await fetch('/api/deals', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deal.id, etapa: newEtapa }) });
            fetchData();
            showToast(`Negócio movido para ${etapas.find(e => e.key === newEtapa)?.label}`, 'success');
        } catch {
            showToast('Erro ao mover negócio', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Deseja excluir este negócio?')) {
            try {
                await fetch(`/api/deals?id=${id}`, { method: 'DELETE' });
                fetchData();
                showToast('Negócio excluído', 'info');
            } catch {
                showToast('Erro ao excluir negócio', 'error');
            }
        }
    };

    const totalPipeline = deals.filter(d => !d.etapa.startsWith('fechado')).reduce((s, d) => s + (d.valor || 0), 0);
    const totalGanho = deals.filter(d => d.etapa === 'fechado_ganho').reduce((s, d) => s + (d.valor || 0), 0);

    return (
        <>
            <div className="page-header">
                <div>
                    <h1>💼 CRM — Pipeline de Vendas</h1>
                    <p>Gerencie suas negociações e oportunidades</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Novo Negócio</button>
            </div>

            <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                <div className="card">
                    <div className="card-header"><span className="card-title">Total no Pipeline</span></div>
                    <div className="card-value">R$ {totalPipeline.toLocaleString('pt-BR')}</div>
                </div>
                <div className="card">
                    <div className="card-header"><span className="card-title">Negócios Ganhos</span></div>
                    <div className="card-value" style={{ color: 'var(--accent-green)' }}>R$ {totalGanho.toLocaleString('pt-BR')}</div>
                </div>
                <div className="card">
                    <div className="card-header"><span className="card-title">Total de Negócios</span></div>
                    <div className="card-value">{deals.length}</div>
                </div>
            </div>

            <div className="pipeline">
                {etapas.filter(e => !e.key.startsWith('fechado')).map(etapa => {
                    const etapaDeals = deals.filter(d => d.etapa === etapa.key);
                    return (
                        <div key={etapa.key} className="pipeline-column">
                            <div className="pipeline-column-header">
                                <span className="pipeline-column-title" style={{ color: etapa.color }}>{etapa.label}</span>
                                <span className="pipeline-column-count">{etapaDeals.length}</span>
                            </div>
                            {etapaDeals.map(deal => (
                                <div key={deal.id} className="pipeline-card">
                                    <div className="pipeline-card-title">{deal.titulo}</div>
                                    <div className="pipeline-card-info">{deal.clienteNome}</div>
                                    <div style={{ marginTop: '8px', fontWeight: 700, color: 'var(--accent-green)', fontSize: '14px' }}>
                                        R$ {(deal.valor || 0).toLocaleString('pt-BR')}
                                    </div>
                                    <div style={{ marginTop: '10px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {etapas.filter(e => e.key !== etapa.key && !e.key.startsWith('fechado')).slice(0, 3).map(e => (
                                            <button key={e.key} className="btn btn-ghost btn-sm" style={{ fontSize: '10px', padding: '3px 8px' }} onClick={() => handleMove(deal, e.key)}>
                                                → {e.label}
                                            </button>
                                        ))}
                                        <button className="btn btn-ghost btn-sm" style={{ fontSize: '10px', padding: '3px 8px', color: 'var(--accent-green)' }} onClick={() => handleMove(deal, 'fechado_ganho')}>✓ Ganho</button>
                                        <button className="btn btn-ghost btn-sm" style={{ fontSize: '10px', padding: '3px 8px', color: 'var(--accent-red)' }} onClick={() => handleDelete(deal.id)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                            {etapaDeals.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '12px' }}>Nenhum negócio</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Novo Negócio</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group"><label className="form-label">Título *</label><input className="form-input" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Fornecimento de malha Jersey" /></div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Cliente</label>
                                    <select className="form-select" value={form.clienteId} onChange={e => setForm({ ...form, clienteId: e.target.value })}>
                                        <option value="">Selecione</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label className="form-label">Valor (R$)</label><input className="form-input" type="number" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Etapa</label>
                                    <select className="form-select" value={form.etapa} onChange={e => setForm({ ...form, etapa: e.target.value })}>
                                        {etapas.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label className="form-label">Previsão de Fechamento</label><input className="form-input" type="date" value={form.dataPrevisao} onChange={e => setForm({ ...form, dataPrevisao: e.target.value })} /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Observações</label><textarea className="form-textarea" value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSubmit}>Criar Negócio</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
