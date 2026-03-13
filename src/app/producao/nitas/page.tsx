'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';

export default function NitasPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [machines, setMachines] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [yarns, setYarns] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [search, setSearch] = useState('');
    const { showToast } = useToast();
    const [form, setForm] = useState({
        clienteId: '', clienteNome: '', maquinaId: '', maquinaNome: '',
        fioId: '', fioNome: '', fichaTecnicaId: '', fichaTecnicaNome: '',
        quantidadeSolicitada: '', dataEntrega: '', observacoes: '', status: 'rascunho'
    });

    const fetchData = () => {
        fetch('/api/orders').then(r => r.json()).then(setOrders);
        fetch('/api/machines').then(r => r.json()).then(setMachines);
        fetch('/api/customers').then(r => r.json()).then(setCustomers);
        fetch('/api/yarns').then(r => r.json()).then(setYarns);
    };
    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async () => {
        const customer = customers.find(c => c.id === form.clienteId);
        const machine = machines.find(m => m.id === form.maquinaId);
        const yarn = yarns.find(y => y.id === form.fioId);
        const payload = {
            ...form,
            clienteNome: customer?.nome || '',
            maquinaNome: machine?.nome || '',
            fioNome: yarn ? `${yarn.titulo} ${yarn.cor}` : '',
            quantidadeSolicitada: Number(form.quantidadeSolicitada),
        };
        try {
            if (editItem) {
                await fetch('/api/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editItem.id, ...payload }) });
                showToast('Ordem de produção atualizada!', 'success');
            } else {
                await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                showToast('Ordem de produção criada!', 'success');
            }
        } catch {
            showToast('Erro ao salvar ordem', 'error');
        }
        setShowModal(false); setEditItem(null); fetchData();
        setForm({ clienteId: '', clienteNome: '', maquinaId: '', maquinaNome: '', fioId: '', fioNome: '', fichaTecnicaId: '', fichaTecnicaNome: '', quantidadeSolicitada: '', dataEntrega: '', observacoes: '', status: 'rascunho' });
    };

    const handleEdit = (o: any) => {
        setEditItem(o);
        setForm({ clienteId: o.clienteId || '', clienteNome: o.clienteNome || '', maquinaId: o.maquinaId || '', maquinaNome: o.maquinaNome || '', fioId: o.fioId || '', fioNome: o.fioNome || '', fichaTecnicaId: o.fichaTecnicaId || '', fichaTecnicaNome: o.fichaTecnicaNome || '', quantidadeSolicitada: String(o.quantidadeSolicitada || ''), dataEntrega: o.dataEntrega || '', observacoes: o.observacoes || '', status: o.status || 'rascunho' });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Deseja excluir esta nita?')) {
            try {
                await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
                fetchData();
                showToast('Nita excluída com sucesso', 'info');
            } catch {
                showToast('Erro ao excluir nita', 'error');
            }
        }
    };

    const statusLabel = (s: string) => {
        const map: any = { rascunho: 'Rascunho', aprovada: 'Aprovada', em_producao: 'Em Produção', concluida: 'Concluída', cancelada: 'Cancelada' };
        return map[s] || s;
    };

    const statusBadge = (s: string) => {
        const map: any = { rascunho: 'badge-orange', aprovada: 'badge-purple', em_producao: 'badge-blue', concluida: 'badge-green', cancelada: 'badge-red' };
        return map[s] || 'badge-orange';
    };

    const filtered = orders.filter(o => {
        const matchStatus = !filterStatus || o.status === filterStatus;
        const matchSearch = !search || o.numero?.toLowerCase().includes(search.toLowerCase()) || o.clienteNome?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <>
            <div className="page-header">
                <div><h1>📋 Nitas — Ordens de Produção</h1><p>Gerencie suas ordens de produção</p></div>
                <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ clienteId: '', clienteNome: '', maquinaId: '', maquinaNome: '', fioId: '', fioNome: '', fichaTecnicaId: '', fichaTecnicaNome: '', quantidadeSolicitada: '', dataEntrega: '', observacoes: '', status: 'rascunho' }); setShowModal(true); }}>+ Nova Nita</button>
            </div>

            <div className="filter-bar">
                <div className="search-bar">
                    <span className="search-bar-icon">🔍</span>
                    <input type="text" placeholder="Buscar por número ou cliente..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '180px' }}>
                    <option value="">Todos os Status</option>
                    <option value="rascunho">Rascunho</option>
                    <option value="aprovada">Aprovada</option>
                    <option value="em_producao">Em Produção</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                </select>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr><th>Nita</th><th>Cliente</th><th>Máquina</th><th>Fio</th><th>Qtd. Solicitada</th><th>Qtd. Produzida</th><th>Entrega</th><th>Status</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                        {filtered.map(o => (
                            <tr key={o.id}>
                                <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{o.numero}</td>
                                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{o.clienteNome}</td>
                                <td>{o.maquinaNome}</td>
                                <td>{o.fioNome}</td>
                                <td>{o.quantidadeSolicitada} kg</td>
                                <td>{o.quantidadeProduzida || 0} kg</td>
                                <td>{o.dataEntrega ? new Date(o.dataEntrega).toLocaleDateString('pt-BR') : '-'}</td>
                                <td><span className={`badge ${statusBadge(o.status)}`}>{statusLabel(o.status)}</span></td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(o)}>✏️</button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(o.id)}>🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Nenhuma nita encontrada. Clique em &quot;+ Nova Nita&quot; para criar.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editItem ? `Editar ${editItem.numero}` : 'Nova Nita'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Cliente *</label>
                                    <select className="form-select" value={form.clienteId} onChange={e => setForm({ ...form, clienteId: e.target.value })}>
                                        <option value="">Selecione o cliente</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label className="form-label">Máquina *</label>
                                    <select className="form-select" value={form.maquinaId} onChange={e => setForm({ ...form, maquinaId: e.target.value })}>
                                        <option value="">Selecione a máquina</option>
                                        {machines.filter(m => m.status === 'ativa').map(m => <option key={m.id} value={m.id}>{m.nome} — {m.fabricante}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Fio *</label>
                                    <select className="form-select" value={form.fioId} onChange={e => setForm({ ...form, fioId: e.target.value })}>
                                        <option value="">Selecione o fio</option>
                                        {yarns.map(y => <option key={y.id} value={y.id}>{y.titulo} — {y.composicao} — {y.cor}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label className="form-label">Quantidade (kg) *</label>
                                    <input className="form-input" type="number" value={form.quantidadeSolicitada} onChange={e => setForm({ ...form, quantidadeSolicitada: e.target.value })} placeholder="Ex: 500" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Data de Entrega</label>
                                    <input className="form-input" type="date" value={form.dataEntrega} onChange={e => setForm({ ...form, dataEntrega: e.target.value })} />
                                </div>
                                <div className="form-group"><label className="form-label">Status</label>
                                    <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                        <option value="rascunho">Rascunho</option><option value="aprovada">Aprovada</option><option value="em_producao">Em Produção</option><option value="concluida">Concluída</option><option value="cancelada">Cancelada</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group"><label className="form-label">Observações</label>
                                <textarea className="form-textarea" value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} placeholder="Observações sobre esta ordem de produção..." />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSubmit}>{editItem ? 'Salvar' : 'Criar Nita'}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
