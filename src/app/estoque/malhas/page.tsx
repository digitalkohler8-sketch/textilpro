'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';

interface MalhaRow {
    id?: string;
    malhaNome: string;
    tipo: string;
    composicao: string;
    cor: string;
    largura: string;
    peso: string;
    rolo: string;
    data: string;
    observacoes: string;
    _isNew?: boolean;
}

const emptyRow = (): MalhaRow => ({
    malhaNome: '', tipo: '', composicao: '', cor: '', largura: '', peso: '',
    rolo: '', data: new Date().toISOString().split('T')[0], observacoes: '', _isNew: true,
});

export default function EstoqueMalhasPage() {
    const [rows, setRows] = useState<MalhaRow[]>([]);
    const [saved, setSaved] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    const fetchData = useCallback(() => {
        fetch('/api/stock/fabric').then(r => r.json()).then((data: MalhaRow[]) => {
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

    const updateRow = (idx: number, field: keyof MalhaRow, value: string) => {
        const newRows = [...rows];
        (newRows[idx] as any)[field] = value;
        setRows(newRows);
        setSaved(false);
    };

    const addRow = () => { setRows([...rows, emptyRow()]); setSaved(false); };

    const deleteRow = async (idx: number) => {
        const row = rows[idx];
        if (row.id) { await fetch(`/api/stock/fabric?id=${row.id}`, { method: 'DELETE' }); }
        const newRows = rows.filter((_, i) => i !== idx);
        setRows(newRows.length > 0 ? newRows : [emptyRow()]);
        showToast('Item removido do estoque', 'info');
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            for (const row of rows) {
                if (!row.malhaNome && !row.tipo) continue;
                const payload = {
                    malhaNome: row.malhaNome, tipo: row.tipo, composicao: row.composicao,
                    cor: row.cor, largura: row.largura, peso: Number(row.peso) || 0,
                    rolo: row.rolo, data: row.data, observacoes: row.observacoes,
                };
                if (row.id && !row._isNew) {
                    await fetch('/api/stock/fabric', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, ...payload }) });
                } else if (row.malhaNome || row.tipo) {
                    await fetch('/api/stock/fabric', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                }
            }
            setSaved(true);
            showToast('Estoque de malhas salvo com sucesso!', 'success');
            fetchData();
        } catch {
            showToast('Erro ao salvar estoque', 'error');
        }
        setSaving(false);
    };

    const totalKg = rows.reduce((s, r) => s + (Number(r.peso) || 0), 0);
    const totalItens = rows.filter(r => r.malhaNome || r.tipo).length;

    return (
        <>
            <div className="page-header">
                <div><h1>🧶 Estoque de Malhas</h1><p>Controle de malhas produzidas e em estoque</p></div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {!saved && <span className="save-indicator unsaved">● Não salvo</span>}
                    {saving && <span className="save-indicator saving">⏳ Salvando...</span>}
                    {saved && !saving && rows.some(r => r.id) && <span className="save-indicator saved">✓ Salvo</span>}
                    <button className="btn btn-success" onClick={saveAll} disabled={saving}>💾 Salvar</button>
                </div>
            </div>

            <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                <div className="card"><div className="card-header"><span className="card-title">⚖️ Total em Estoque</span></div><div className="card-value">{totalKg.toLocaleString('pt-BR')} kg</div></div>
                <div className="card"><div className="card-header"><span className="card-title">📦 Rolos/Itens</span></div><div className="card-value">{totalItens}</div></div>
            </div>

            <div className="spreadsheet">
                <div className="spreadsheet-toolbar">
                    <div className="spreadsheet-toolbar-left">
                        <h3>📋 Estoque de Malhas</h3>
                        <span className="spreadsheet-count">{totalItens} itens</span>
                    </div>
                    <button className="spreadsheet-add-row" onClick={addRow}>+ Novo Registro</button>
                </div>

                <div className="spreadsheet-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th className="row-num">#</th>
                                <th style={{ minWidth: '130px' }}>Nome da Malha</th>
                                <th style={{ minWidth: '100px' }}>Tipo</th>
                                <th style={{ minWidth: '130px' }}>Composição</th>
                                <th style={{ minWidth: '80px' }}>Cor</th>
                                <th style={{ minWidth: '80px' }}>Largura</th>
                                <th style={{ minWidth: '80px' }}>Peso (kg)</th>
                                <th style={{ minWidth: '80px' }}>Rolo</th>
                                <th style={{ minWidth: '110px' }}>Data</th>
                                <th style={{ minWidth: '130px' }}>Observações</th>
                                <th style={{ width: '60px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row.id || `new-${idx}`}>
                                    <td className="row-num">{idx + 1}</td>
                                    <td><input className="spreadsheet-input" value={row.malhaNome} onChange={e => updateRow(idx, 'malhaNome', e.target.value)} placeholder="Jersey Simples" /></td>
                                    <td>
                                        <select className="spreadsheet-select" value={row.tipo} onChange={e => updateRow(idx, 'tipo', e.target.value)}>
                                            <option value="">Selecione</option>
                                            <option value="Jersey">Jersey</option>
                                            <option value="Rib">Rib</option>
                                            <option value="Interlock">Interlock</option>
                                            <option value="Piquet">Piquet</option>
                                            <option value="Moletom">Moletom</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                    </td>
                                    <td><input className="spreadsheet-input" value={row.composicao} onChange={e => updateRow(idx, 'composicao', e.target.value)} placeholder="100% Algodão" /></td>
                                    <td><input className="spreadsheet-input" value={row.cor} onChange={e => updateRow(idx, 'cor', e.target.value)} placeholder="Branco" /></td>
                                    <td><input className="spreadsheet-input" value={row.largura} onChange={e => updateRow(idx, 'largura', e.target.value)} placeholder='1,80m' /></td>
                                    <td><input className="spreadsheet-input" type="number" value={row.peso} onChange={e => updateRow(idx, 'peso', e.target.value)} placeholder="0" /></td>
                                    <td><input className="spreadsheet-input" value={row.rolo} onChange={e => updateRow(idx, 'rolo', e.target.value)} placeholder="R-001" /></td>
                                    <td><input className="spreadsheet-input" type="date" value={row.data} onChange={e => updateRow(idx, 'data', e.target.value)} /></td>
                                    <td><input className="spreadsheet-input" value={row.observacoes} onChange={e => updateRow(idx, 'observacoes', e.target.value)} placeholder="Obs..." /></td>
                                    <td>
                                        <div className="spreadsheet-actions">
                                            <button className="btn-icon delete" onClick={() => deleteRow(idx)} title="Excluir">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr><td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    Nenhuma malha em estoque. Clique em &quot;+ Novo Registro&quot; para adicionar.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="spreadsheet-footer">
                    <button className="spreadsheet-add-row" onClick={addRow}>+ Adicionar Registro</button>
                    <span>{totalItens} item(ns) — Total: {totalKg.toLocaleString('pt-BR')} kg</span>
                </div>
            </div>
        </>
    );
}
