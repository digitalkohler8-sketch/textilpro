'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';

export default function AtividadesPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [deals, setDeals] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const { showToast } = useToast();
    const [form, setForm] = useState({ dealId: '', tipo: 'ligacao', descricao: '', data: new Date().toISOString().split('T')[0] });

    const fetchData = () => { fetch('/api/activities').then(r => r.json()).then(setActivities); fetch('/api/deals').then(r => r.json()).then(setDeals); };
    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async () => {
        try {
            await fetch('/api/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            showToast('Atividade criada com sucesso!', 'success');
        } catch {
            showToast('Erro ao criar atividade', 'error');
        }
        setShowModal(false); setForm({ dealId: '', tipo: 'ligacao', descricao: '', data: new Date().toISOString().split('T')[0] }); fetchData();
    };

    const handleToggle = async (a: any) => {
        try {
            await fetch('/api/activities', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: a.id, concluida: !a.concluida }) });
            fetchData();
        } catch {
            showToast('Erro ao atualizar atividade', 'error');
        }
    };

    const tipoIcon = (t: string) => { const map: any = { ligacao: '📞', email: '📧', reuniao: '🤝', visita: '🏢', outro: '📌' }; return map[t] || '📌'; };
    const pending = activities.filter(a => !a.concluida);
    const done = activities.filter(a => a.concluida);

    return (
        <>
            <div className="page-header"><div><h1>📆 Atividades</h1><p>Follow-ups e tarefas do CRM</p></div><button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nova Atividade</button></div>
            <div className="grid-2">
                <div>
                    <h3 style={{ marginBottom: '16px', color: 'var(--accent-orange)' }}>⏳ Pendentes ({pending.length})</h3>
                    {pending.map(a => (
                        <div key={a.id} className="card" style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => handleToggle(a)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid var(--border-color)', flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{tipoIcon(a.tipo)} {a.descricao}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{a.data ? new Date(a.data).toLocaleDateString('pt-BR') : ''} {deals.find(d => d.id === a.dealId)?.titulo ? `• ${deals.find(d => d.id === a.dealId)?.titulo}` : ''}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {pending.length === 0 && <div style={{ color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>Nenhuma atividade pendente</div>}
                </div>
                <div>
                    <h3 style={{ marginBottom: '16px', color: 'var(--accent-green)' }}>✅ Concluídas ({done.length})</h3>
                    {done.map(a => (
                        <div key={a.id} className="card" style={{ marginBottom: '10px', opacity: 0.6, cursor: 'pointer' }} onClick={() => handleToggle(a)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'var(--accent-green)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>✓</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', textDecoration: 'line-through' }}>{tipoIcon(a.tipo)} {a.descricao}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{a.data ? new Date(a.data).toLocaleDateString('pt-BR') : ''}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {done.length === 0 && <div style={{ color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>Nenhuma atividade concluída</div>}
                </div>
            </div>
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header"><h2>Nova Atividade</h2><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
                    <div className="modal-body">
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Tipo</label><select className="form-select" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}><option value="ligacao">📞 Ligação</option><option value="email">📧 E-mail</option><option value="reuniao">🤝 Reunião</option><option value="visita">🏢 Visita</option><option value="outro">📌 Outro</option></select></div>
                            <div className="form-group"><label className="form-label">Data</label><input className="form-input" type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Negócio Relacionado</label><select className="form-select" value={form.dealId} onChange={e => setForm({ ...form, dealId: e.target.value })}><option value="">Nenhum</option>{deals.map(d => <option key={d.id} value={d.id}>{d.titulo}</option>)}</select></div>
                        <div className="form-group"><label className="form-label">Descrição *</label><textarea className="form-textarea" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Descreva a atividade..." /></div>
                    </div>
                    <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={handleSubmit}>Criar</button></div>
                </div></div>
            )}
        </>
    );
}
