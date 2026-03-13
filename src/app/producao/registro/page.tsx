'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';

export default function RegistroProducaoPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [machines, setMachines] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const { showToast } = useToast();
    const [form, setForm] = useState({ nitaId: '', maquinaId: '', operador: '', turno: 'manha', quantidadeProduzida: '', numRolos: '', tempoProducao: '', tempoParada: '', motivoParada: '', data: new Date().toISOString().split('T')[0] });

    const fetchData = () => { fetch('/api/production-logs').then(r => r.json()).then(setLogs); fetch('/api/orders').then(r => r.json()).then(setOrders); fetch('/api/machines').then(r => r.json()).then(setMachines); };
    useEffect(() => { fetchData(); }, []);

    const calcEficiencia = () => {
        const prod = Number(form.quantidadeProduzida);
        const tempo = Number(form.tempoProducao);
        const parada = Number(form.tempoParada) / 60;
        if (!prod || !tempo) return 0;
        const tempoEfetivo = tempo - parada;
        const teorico = tempo * 15; // ~15 kg/h teórico médio
        return Math.min(Number(((prod / teorico) * 100).toFixed(1)), 100);
    };

    const handleSubmit = async () => {
        const nita = orders.find(o => o.id === form.nitaId);
        const machine = machines.find(m => m.id === form.maquinaId);
        const eficiencia = calcEficiencia();
        try {
            await fetch('/api/production-logs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, nitaNumero: nita?.numero || '', maquinaNome: machine?.nome || '', quantidadeProduzida: Number(form.quantidadeProduzida), numRolos: Number(form.numRolos), tempoProducao: Number(form.tempoProducao), tempoParada: Number(form.tempoParada), eficiencia }) });
            showToast('Produção registrada com sucesso!', 'success');
        } catch {
            showToast('Erro ao registrar produção', 'error');
        }
        setShowModal(false); setForm({ nitaId: '', maquinaId: '', operador: '', turno: 'manha', quantidadeProduzida: '', numRolos: '', tempoProducao: '', tempoParada: '', motivoParada: '', data: new Date().toISOString().split('T')[0] }); fetchData();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Deseja excluir este registro?')) {
            try {
                await fetch(`/api/production-logs?id=${id}`, { method: 'DELETE' });
                fetchData();
                showToast('Registro de produção excluído', 'info');
            } catch {
                showToast('Erro ao excluir registro', 'error');
            }
        }
    };

    const turnoLabel = (t: string) => t === 'manha' ? '☀️ Manhã' : t === 'tarde' ? '🌤️ Tarde' : '🌙 Noite';

    return (
        <>
            <div className="page-header"><div><h1>⚙️ Registro de Produção</h1><p>Registre a produção diária por máquina e turno</p></div><button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Novo Registro</button></div>
            <div className="table-container">
                <table>
                    <thead><tr><th>Data</th><th>Nita</th><th>Máquina</th><th>Operador</th><th>Turno</th><th>Produzido</th><th>Rolos</th><th>Eficiência</th><th>Parada</th><th>Ações</th></tr></thead>
                    <tbody>
                        {logs.map(l => (
                            <tr key={l.id}>
                                <td>{l.data ? new Date(l.data).toLocaleDateString('pt-BR') : '-'}</td>
                                <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{l.nitaNumero}</td>
                                <td>{l.maquinaNome}</td><td>{l.operador}</td><td>{turnoLabel(l.turno)}</td>
                                <td style={{ fontWeight: 600 }}>{l.quantidadeProduzida} kg</td><td>{l.numRolos}</td>
                                <td><span className={`badge ${l.eficiencia >= 90 ? 'badge-green' : l.eficiencia >= 87 ? 'badge-orange' : 'badge-red'}`}>{l.eficiencia}%</span></td>
                                <td>{l.tempoParada > 0 ? `${l.tempoParada} min` : '-'}</td>
                                <td>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(l.id)} title="Excluir">🗑️</button>
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Nenhum registro de produção</td></tr>}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
                    <div className="modal-header"><h2>Novo Registro de Produção</h2><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
                    <div className="modal-body">
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Data *</label><input className="form-input" type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></div>
                            <div className="form-group"><label className="form-label">Turno *</label><select className="form-select" value={form.turno} onChange={e => setForm({ ...form, turno: e.target.value })}><option value="manha">Manhã (06h-14h)</option><option value="tarde">Tarde (14h-22h)</option><option value="noite">Noite (22h-06h)</option></select></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Nita / OP</label><select className="form-select" value={form.nitaId} onChange={e => setForm({ ...form, nitaId: e.target.value })}><option value="">Selecione</option>{orders.filter(o => ['aprovada', 'em_producao'].includes(o.status)).map(o => <option key={o.id} value={o.id}>{o.numero} — {o.clienteNome}</option>)}</select></div>
                            <div className="form-group"><label className="form-label">Máquina *</label><select className="form-select" value={form.maquinaId} onChange={e => setForm({ ...form, maquinaId: e.target.value })}><option value="">Selecione</option>{machines.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}</select></div>
                        </div>
                        <div className="form-group"><label className="form-label">Operador</label><input className="form-input" value={form.operador} onChange={e => setForm({ ...form, operador: e.target.value })} placeholder="Nome do operador" /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Quantidade Produzida (kg) *</label><input className="form-input" type="number" value={form.quantidadeProduzida} onChange={e => setForm({ ...form, quantidadeProduzida: e.target.value })} /></div>
                            <div className="form-group"><label className="form-label">Nº de Rolos</label><input className="form-input" type="number" value={form.numRolos} onChange={e => setForm({ ...form, numRolos: e.target.value })} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Tempo de Produção (horas)</label><input className="form-input" type="number" value={form.tempoProducao} onChange={e => setForm({ ...form, tempoProducao: e.target.value })} /></div>
                            <div className="form-group"><label className="form-label">Tempo de Parada (minutos)</label><input className="form-input" type="number" value={form.tempoParada} onChange={e => setForm({ ...form, tempoParada: e.target.value })} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Motivo da Parada</label><input className="form-input" value={form.motivoParada} onChange={e => setForm({ ...form, motivoParada: e.target.value })} placeholder="Ex: Troca de fio, quebra de agulha..." /></div>
                        <div style={{ background: calcEficiencia() >= 90 ? 'var(--accent-green-light)' : calcEficiencia() >= 87 ? 'var(--accent-orange-light)' : 'var(--accent-red-light)', padding: '14px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>EFICIÊNCIA CALCULADA</div>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: calcEficiencia() >= 90 ? 'var(--accent-green)' : calcEficiencia() >= 87 ? 'var(--accent-orange)' : 'var(--accent-red)' }}>{calcEficiencia()}%</div>
                        </div>
                    </div>
                    <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={handleSubmit}>Registrar</button></div>
                </div></div>
            )}
        </>
    );
}
