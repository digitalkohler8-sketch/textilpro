'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';

export default function FichasTecnicasPage() {
    const [sheets, setSheets] = useState<any[]>([]);
    const [machines, setMachines] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const { showToast } = useToast();
    const [form, setForm] = useState({ nome: '', tipoMalha: '', maquinaId: '', diametro: '', gauge: '', alimentadores: '', rpm: '', tituloFio: '', composicaoFio: '', gramatura: '', largura: '', comprimentoPonto: '', observacoes: '' });

    const fetchData = () => { fetch('/api/tech-sheets').then(r => r.json()).then(setSheets); fetch('/api/machines').then(r => r.json()).then(setMachines); };
    useEffect(() => { fetchData(); }, []);

    const calcProducao = () => {
        const d = Number(form.diametro); const g = Number(form.gauge); const f = Number(form.alimentadores); const rpm = Number(form.rpm); const sl = Number(form.comprimentoPonto);
        if (!d || !g || !f || !rpm || !sl) return 0;
        const totalNeedles = Math.PI * d * g;
        const stitchesPerRev = totalNeedles * f;
        const yarnPerRev = stitchesPerRev * (sl / 1000);
        const yarnPerHour = yarnPerRev * rpm * 60;
        const kgPerHour = yarnPerHour / 1000 * 0.9;
        return Number(kgPerHour.toFixed(2));
    };

    const handleMachineSelect = (id: string) => {
        const m = machines.find(x => x.id === id);
        if (m) { setForm({ ...form, maquinaId: id, diametro: String(m.diametro), gauge: String(m.gauge), alimentadores: String(m.alimentadores), rpm: String(m.rpmNominal) }); }
    };

    const handleSubmit = async () => {
        const m = machines.find(x => x.id === form.maquinaId);
        const payload = { ...form, maquinaNome: m?.nome || '', diametro: Number(form.diametro), gauge: Number(form.gauge), alimentadores: Number(form.alimentadores), rpm: Number(form.rpm), gramatura: Number(form.gramatura), largura: Number(form.largura), comprimentoPonto: Number(form.comprimentoPonto), producaoTeorica: calcProducao() };
        try {
            if (editItem) {
                await fetch('/api/tech-sheets', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editItem.id, ...payload }) });
                showToast('Ficha técnica atualizada!', 'success');
            }
            else {
                await fetch('/api/tech-sheets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                showToast('Ficha técnica criada!', 'success');
            }
        } catch {
            showToast('Erro ao salvar ficha', 'error');
        }
        setShowModal(false); setEditItem(null); setForm({ nome: '', tipoMalha: '', maquinaId: '', diametro: '', gauge: '', alimentadores: '', rpm: '', tituloFio: '', composicaoFio: '', gramatura: '', largura: '', comprimentoPonto: '', observacoes: '' }); fetchData();
    };

    const handleEdit = (s: any) => { setEditItem(s); setForm({ nome: s.nome, tipoMalha: s.tipoMalha, maquinaId: s.maquinaId, diametro: String(s.diametro), gauge: String(s.gauge), alimentadores: String(s.alimentadores), rpm: String(s.rpm), tituloFio: s.tituloFio, composicaoFio: s.composicaoFio, gramatura: String(s.gramatura), largura: String(s.largura), comprimentoPonto: String(s.comprimentoPonto), observacoes: s.observacoes || '' }); setShowModal(true); };
    const handleDelete = async (id: string) => {
        if (confirm('Excluir ficha técnica?')) {
            try {
                await fetch(`/api/tech-sheets?id=${id}`, { method: 'DELETE' });
                fetchData();
                showToast('Ficha técnica excluída', 'info');
            } catch {
                showToast('Erro ao excluir ficha', 'error');
            }
        }
    };

    return (
        <>
            <div className="page-header"><div><h1>📄 Fichas Técnicas</h1><p>Fichas técnicas de malha com cálculo de produção teórica</p></div><button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ nome: '', tipoMalha: '', maquinaId: '', diametro: '', gauge: '', alimentadores: '', rpm: '', tituloFio: '', composicaoFio: '', gramatura: '', largura: '', comprimentoPonto: '', observacoes: '' }); setShowModal(true); }}>+ Nova Ficha</button></div>
            <div className="table-container">
                <table>
                    <thead><tr><th>Nome</th><th>Malha</th><th>Máquina</th><th>Fio</th><th>Gramatura</th><th>Produção Teórica</th><th>Ações</th></tr></thead>
                    <tbody>
                        {sheets.map(s => (<tr key={s.id}><td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.nome}</td><td>{s.tipoMalha}</td><td>{s.maquinaNome}</td><td>{s.tituloFio} {s.composicaoFio}</td><td>{s.gramatura} g/m²</td><td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>{s.producaoTeorica} kg/h</td><td><div style={{ display: 'flex', gap: '6px' }}><button className="btn btn-ghost btn-sm" onClick={() => handleEdit(s)}>✏️</button><button className="btn btn-ghost btn-sm" onClick={() => handleDelete(s.id)}>🗑️</button></div></td></tr>))}
                        {sheets.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Nenhuma ficha técnica</td></tr>}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
                    <div className="modal-header"><h2>{editItem ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'}</h2><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
                    <div className="modal-body">
                        <div className="form-row"><div className="form-group"><label className="form-label">Nome da Ficha *</label><input className="form-input" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Jersey 30/1 Branco" /></div><div className="form-group"><label className="form-label">Tipo de Malha</label><select className="form-select" value={form.tipoMalha} onChange={e => setForm({ ...form, tipoMalha: e.target.value })}><option value="">Selecione</option><option>Jersey Simples</option><option>Rib</option><option>Interlock</option><option>Piquet</option><option>Moletom</option></select></div></div>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', margin: '16px 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dados do Tear</h4>
                        <div className="form-group"><label className="form-label">Máquina</label><select className="form-select" value={form.maquinaId} onChange={e => handleMachineSelect(e.target.value)}><option value="">Selecione (preenche dados automaticamente)</option>{machines.map(m => <option key={m.id} value={m.id}>{m.nome} — {m.fabricante} {m.modelo}</option>)}</select></div>
                        <div className="form-row"><div className="form-group"><label className="form-label">Diâmetro (pol)</label><input className="form-input" type="number" value={form.diametro} onChange={e => setForm({ ...form, diametro: e.target.value })} /></div><div className="form-group"><label className="form-label">Gauge (ag/pol)</label><input className="form-input" type="number" value={form.gauge} onChange={e => setForm({ ...form, gauge: e.target.value })} /></div></div>
                        <div className="form-row"><div className="form-group"><label className="form-label">Alimentadores</label><input className="form-input" type="number" value={form.alimentadores} onChange={e => setForm({ ...form, alimentadores: e.target.value })} /></div><div className="form-group"><label className="form-label">RPM</label><input className="form-input" type="number" value={form.rpm} onChange={e => setForm({ ...form, rpm: e.target.value })} /></div></div>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', margin: '16px 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dados do Fio</h4>
                        <div className="form-row"><div className="form-group"><label className="form-label">Título do Fio</label><input className="form-input" value={form.tituloFio} onChange={e => setForm({ ...form, tituloFio: e.target.value })} placeholder="Ex: 30/1" /></div><div className="form-group"><label className="form-label">Composição</label><input className="form-input" value={form.composicaoFio} onChange={e => setForm({ ...form, composicaoFio: e.target.value })} placeholder="Ex: 100% Algodão" /></div></div>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', margin: '16px 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dados da Malha</h4>
                        <div className="form-row"><div className="form-group"><label className="form-label">Gramatura (g/m²)</label><input className="form-input" type="number" value={form.gramatura} onChange={e => setForm({ ...form, gramatura: e.target.value })} /></div><div className="form-group"><label className="form-label">Largura (cm)</label><input className="form-input" type="number" value={form.largura} onChange={e => setForm({ ...form, largura: e.target.value })} /></div></div>
                        <div className="form-group"><label className="form-label">Comprimento do Ponto (mm)</label><input className="form-input" type="number" step="0.1" value={form.comprimentoPonto} onChange={e => setForm({ ...form, comprimentoPonto: e.target.value })} /></div>
                        <div style={{ background: 'var(--accent-green-light)', padding: '16px', borderRadius: 'var(--radius-sm)', textAlign: 'center', margin: '16px 0' }}>
                            <div style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 600, marginBottom: '4px' }}>PRODUÇÃO TEÓRICA CALCULADA</div>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-green)' }}>{calcProducao()} kg/h</div>
                        </div>
                        <div className="form-group"><label className="form-label">Observações</label><textarea className="form-textarea" value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>
                    </div>
                    <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={handleSubmit}>{editItem ? 'Salvar' : 'Criar Ficha'}</button></div>
                </div></div>
            )}
        </>
    );
}
