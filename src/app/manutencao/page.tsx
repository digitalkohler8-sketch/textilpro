'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';

interface ManutencaoRow {
    id?: string;
    maquina: string;
    data: string;
    tipo: string;
    descricao: string;
    pecasTrocadas: string;
    responsavel: string;
    custo: string;
    observacoes: string;
    _isNew?: boolean;
}

const emptyRow = (): ManutencaoRow => ({
    maquina: '', data: new Date().toISOString().split('T')[0], tipo: 'preventiva',
    descricao: '', pecasTrocadas: '', responsavel: '', custo: '', observacoes: '', _isNew: true,
});

export default function ManutencaoPage() {
    const [rows, setRows] = useState<ManutencaoRow[]>([]);
    const [saved, setSaved] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    const fetchData = useCallback(() => {
        fetch('/api/maintenances').then(r => r.json()).then((data: ManutencaoRow[]) => {
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

    const updateRow = (idx: number, field: keyof ManutencaoRow, value: string) => {
        const newRows = [...rows];
        (newRows[idx] as any)[field] = value;
        setRows(newRows);
        setSaved(false);
    };

    const addRow = () => { setRows([...rows, emptyRow()]); setSaved(false); };

    const deleteRow = async (idx: number) => {
        const row = rows[idx];
        if (row.id) { await fetch(`/api/maintenances?id=${row.id}`, { method: 'DELETE' }); }
        const newRows = rows.filter((_, i) => i !== idx);
        setRows(newRows.length > 0 ? newRows : [emptyRow()]);
        showToast('Manutenção removida', 'info');
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            for (const row of rows) {
                if (!row.maquina && !row.descricao) continue;
                const payload = {
                    maquina: row.maquina, data: row.data, tipo: row.tipo,
                    descricao: row.descricao, pecasTrocadas: row.pecasTrocadas,
                    responsavel: row.responsavel, custo: row.custo, observacoes: row.observacoes,
                };
                if (row.id && !row._isNew) {
                    await fetch('/api/maintenances', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, ...payload }) });
                } else if (row.maquina || row.descricao) {
                    await fetch('/api/maintenances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                }
            }
            setSaved(true);
            showToast('Manutenções salvas com sucesso!', 'success');
            fetchData();
        } catch {
            showToast('Erro ao salvar manutenções', 'error');
        }
        setSaving(false);
    };

    const totalCusto = rows.reduce((s, r) => s + (Number(r.custo) || 0), 0);
    const preventivas = rows.filter(r => r.tipo === 'preventiva').length;
    const corretivas = rows.filter(r => r.tipo === 'corretiva').length;

    return (
        <>
            <div className="page-header">
                <div><h1>🔧 Manutenções</h1><p>Registro e acompanhamento de manutenções das máquinas</p></div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {!saved && <span className="save-indicator unsaved">● Não salvo</span>}
                    {saving && <span className="save-indicator saving">⏳ Salvando...</span>}
                    {saved && !saving && rows.some(r => r.id) && <span className="save-indicator saved">✓ Salvo</span>}
                    <button className="btn btn-success" onClick={saveAll} disabled={saving}>💾 Salvar</button>
                </div>
            </div>

            <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                <div className="card"><div className="card-header"><span className="card-title">🔧 Preventivas</span></div><div className="card-value" style={{ color: 'var(--accent-blue)' }}>{preventivas}</div></div>
                <div className="card"><div className="card-header"><span className="card-title">⚡ Corretivas</span></div><div className="card-value" style={{ color: 'var(--accent-orange)' }}>{corretivas}</div></div>
                <div className="card"><div className="card-header"><span className="card-title">💰 Custo Total</span></div><div className="card-value">R$ {totalCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>
                <div className="card"><div className="card-header"><span className="card-title">📊 Total</span></div><div className="card-value">{rows.filter(r => r.maquina || r.descricao).length}</div></div>
            </div>

            <div className="spreadsheet">
                <div className="spreadsheet-toolbar">
                    <div className="spreadsheet-toolbar-left">
                        <h3>📋 Registros de Manutenção</h3>
                        <span className="spreadsheet-count">{rows.filter(r => r.maquina || r.descricao).length} registros</span>
                    </div>
                    <button className="spreadsheet-add-row" onClick={addRow}>+ Nova Manutenção</button>
                </div>

                <div className="spreadsheet-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th className="row-num">#</th>
                                <th style={{ minWidth: '120px' }}>Máquina</th>
                                <th style={{ minWidth: '110px' }}>Data</th>
                                <th style={{ minWidth: '110px' }}>Tipo</th>
                                <th style={{ minWidth: '200px' }}>Descrição do Serviço</th>
                                <th style={{ minWidth: '150px' }}>Peças Trocadas</th>
                                <th style={{ minWidth: '110px' }}>Responsável</th>
                                <th style={{ minWidth: '100px' }}>Custo (R$)</th>
                                <th style={{ minWidth: '150px' }}>Observações</th>
                                <th style={{ width: '60px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row.id || `new-${idx}`}>
                                    <td className="row-num">{idx + 1}</td>
                                    <td><input className="spreadsheet-input" value={row.maquina} onChange={e => updateRow(idx, 'maquina', e.target.value)} placeholder="Ex: Tear 01" /></td>
                                    <td><input className="spreadsheet-input" type="date" value={row.data} onChange={e => updateRow(idx, 'data', e.target.value)} /></td>
                                    <td>
                                        <select className="spreadsheet-select" value={row.tipo} onChange={e => updateRow(idx, 'tipo', e.target.value)}>
                                            <option value="preventiva">🔧 Preventiva</option>
                                            <option value="corretiva">⚡ Corretiva</option>
                                            <option value="preditiva">📊 Preditiva</option>
                                        </select>
                                    </td>
                                    <td><input className="spreadsheet-input" value={row.descricao} onChange={e => updateRow(idx, 'descricao', e.target.value)} placeholder="Troca de agulhas..." /></td>
                                    <td><input className="spreadsheet-input" value={row.pecasTrocadas} onChange={e => updateRow(idx, 'pecasTrocadas', e.target.value)} placeholder="Agulhas, platinas..." /></td>
                                    <td><input className="spreadsheet-input" value={row.responsavel} onChange={e => updateRow(idx, 'responsavel', e.target.value)} placeholder="Técnico" /></td>
                                    <td><input className="spreadsheet-input" type="number" step="0.01" value={row.custo} onChange={e => updateRow(idx, 'custo', e.target.value)} placeholder="0,00" /></td>
                                    <td><input className="spreadsheet-input" value={row.observacoes} onChange={e => updateRow(idx, 'observacoes', e.target.value)} placeholder="Obs..." /></td>
                                    <td>
                                        <div className="spreadsheet-actions">
                                            <button className="btn-icon delete" onClick={() => deleteRow(idx)} title="Excluir">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    Nenhuma manutenção registrada. Clique em &quot;+ Nova Manutenção&quot; para começar.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="spreadsheet-footer">
                    <button className="spreadsheet-add-row" onClick={addRow}>+ Adicionar Manutenção</button>
                    <span>{rows.filter(r => r.maquina || r.descricao).length} registro(s) — Custo: R$ {totalCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>
        </>
    );
}
