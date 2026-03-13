'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';

interface MaquinaRow {
    id?: string;
    nome: string;
    fabricante: string;
    modelo: string;
    diametro: string;
    gauge: string;
    alimentadores: string;
    rpmNominal: string;
    tipoMalha: string;
    status: string;
    _isNew?: boolean;
}

const emptyRow = (): MaquinaRow => ({
    nome: '', fabricante: '', modelo: '', diametro: '', gauge: '', alimentadores: '',
    rpmNominal: '', tipoMalha: '', status: 'ativa', _isNew: true,
});

export default function MaquinasPage() {
    const [rows, setRows] = useState<MaquinaRow[]>([]);
    const [saved, setSaved] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    const fetchData = useCallback(() => {
        fetch('/api/machines').then(r => r.json()).then((data: MaquinaRow[]) => {
            setRows(data.length > 0 ? data : [emptyRow()]);
            setSaved(true);
        });
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveAll(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    const updateRow = (idx: number, field: keyof MaquinaRow, value: string) => {
        const newRows = [...rows];
        (newRows[idx] as any)[field] = value;
        setRows(newRows);
        setSaved(false);
    };

    const addRow = () => { setRows([...rows, emptyRow()]); setSaved(false); };

    const deleteRow = async (idx: number) => {
        const row = rows[idx];
        if (row.id) { await fetch(`/api/machines?id=${row.id}`, { method: 'DELETE' }); }
        const newRows = rows.filter((_, i) => i !== idx);
        setRows(newRows.length > 0 ? newRows : [emptyRow()]);
        showToast('Máquina removida', 'info');
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            for (const row of rows) {
                if (!row.nome) continue;
                const payload = {
                    nome: row.nome, fabricante: row.fabricante, modelo: row.modelo,
                    diametro: Number(row.diametro) || 0, gauge: Number(row.gauge) || 0,
                    alimentadores: Number(row.alimentadores) || 0, rpmNominal: Number(row.rpmNominal) || 0,
                    tipoMalha: row.tipoMalha, status: row.status,
                };
                if (row.id && !row._isNew) {
                    await fetch('/api/machines', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, ...payload }) });
                } else if (row.nome) {
                    await fetch('/api/machines', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                }
            }
            setSaved(true);
            showToast('Máquinas salvas com sucesso!', 'success');
            fetchData();
        } catch {
            showToast('Erro ao salvar máquinas', 'error');
        }
        setSaving(false);
    };

    const ativas = rows.filter(r => r.status === 'ativa').length;
    const manutencao = rows.filter(r => r.status === 'manutencao').length;
    const paradas = rows.filter(r => r.status === 'parada').length;

    return (
        <>
            <div className="page-header">
                <div><h1>🏭 Máquinas</h1><p>Cadastro de teares e máquinas da malharia</p></div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {!saved && <span className="save-indicator unsaved">● Não salvo</span>}
                    {saving && <span className="save-indicator saving">⏳ Salvando...</span>}
                    {saved && !saving && rows.some(r => r.id) && <span className="save-indicator saved">✓ Salvo</span>}
                    <button className="btn btn-success" onClick={saveAll} disabled={saving}>💾 Salvar</button>
                </div>
            </div>

            <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                <div className="card"><div className="card-header"><span className="card-title">✅ Ativas</span></div><div className="card-value" style={{ color: 'var(--accent-green)' }}>{ativas}</div></div>
                <div className="card"><div className="card-header"><span className="card-title">🔧 Em Manutenção</span></div><div className="card-value" style={{ color: 'var(--accent-orange)' }}>{manutencao}</div></div>
                <div className="card"><div className="card-header"><span className="card-title">🛑 Paradas</span></div><div className="card-value" style={{ color: 'var(--accent-red)' }}>{paradas}</div></div>
                <div className="card"><div className="card-header"><span className="card-title">📊 Total</span></div><div className="card-value">{rows.filter(r => r.nome).length}</div></div>
            </div>

            <div className="spreadsheet">
                <div className="spreadsheet-toolbar">
                    <div className="spreadsheet-toolbar-left">
                        <h3>📋 Lista de Máquinas</h3>
                        <span className="spreadsheet-count">{rows.filter(r => r.nome).length} máquinas</span>
                    </div>
                    <button className="spreadsheet-add-row" onClick={addRow}>+ Nova Máquina</button>
                </div>

                <div className="spreadsheet-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th className="row-num">#</th>
                                <th style={{ minWidth: '120px' }}>Nome</th>
                                <th style={{ minWidth: '120px' }}>Fabricante</th>
                                <th style={{ minWidth: '120px' }}>Modelo</th>
                                <th style={{ minWidth: '80px' }}>Diâm. (pol)</th>
                                <th style={{ minWidth: '70px' }}>Gauge</th>
                                <th style={{ minWidth: '80px' }}>Aliment.</th>
                                <th style={{ minWidth: '80px' }}>RPM Nom.</th>
                                <th style={{ minWidth: '120px' }}>Tipo Malha</th>
                                <th style={{ minWidth: '100px' }}>Status</th>
                                <th style={{ width: '60px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row.id || `new-${idx}`}>
                                    <td className="row-num">{idx + 1}</td>
                                    <td><input className="spreadsheet-input" value={row.nome} onChange={e => updateRow(idx, 'nome', e.target.value)} placeholder="Ex: Tear 01" /></td>
                                    <td><input className="spreadsheet-input" value={row.fabricante} onChange={e => updateRow(idx, 'fabricante', e.target.value)} placeholder="Mayer & Cie" /></td>
                                    <td><input className="spreadsheet-input" value={row.modelo} onChange={e => updateRow(idx, 'modelo', e.target.value)} placeholder="OVJA 1.6" /></td>
                                    <td><input className="spreadsheet-input" type="number" value={row.diametro} onChange={e => updateRow(idx, 'diametro', e.target.value)} placeholder="30" /></td>
                                    <td><input className="spreadsheet-input" type="number" value={row.gauge} onChange={e => updateRow(idx, 'gauge', e.target.value)} placeholder="28" /></td>
                                    <td><input className="spreadsheet-input" type="number" value={row.alimentadores} onChange={e => updateRow(idx, 'alimentadores', e.target.value)} placeholder="90" /></td>
                                    <td><input className="spreadsheet-input" type="number" value={row.rpmNominal} onChange={e => updateRow(idx, 'rpmNominal', e.target.value)} placeholder="26" /></td>
                                    <td>
                                        <select className="spreadsheet-select" value={row.tipoMalha} onChange={e => updateRow(idx, 'tipoMalha', e.target.value)}>
                                            <option value="">Selecione</option>
                                            <option value="Jersey Simples">Jersey Simples</option>
                                            <option value="Rib">Rib</option>
                                            <option value="Interlock">Interlock</option>
                                            <option value="Piquet">Piquet</option>
                                            <option value="Moletom">Moletom</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select className="spreadsheet-select" value={row.status} onChange={e => updateRow(idx, 'status', e.target.value)}>
                                            <option value="ativa">✅ Ativa</option>
                                            <option value="manutencao">🔧 Manutenção</option>
                                            <option value="parada">🛑 Parada</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div className="spreadsheet-actions">
                                            <button className="btn-icon delete" onClick={() => deleteRow(idx)} title="Excluir">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr><td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    Nenhuma máquina cadastrada. Clique em &quot;+ Nova Máquina&quot; para começar.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="spreadsheet-footer">
                    <button className="spreadsheet-add-row" onClick={addRow}>+ Adicionar Máquina</button>
                    <span>{rows.filter(r => r.nome).length} máquina(s) — {ativas} ativa(s)</span>
                </div>
            </div>
        </>
    );
}
