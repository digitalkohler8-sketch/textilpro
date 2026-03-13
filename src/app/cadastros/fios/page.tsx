'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';

interface FioRow {
    id?: string;
    titulo: string;
    composicao: string;
    cor: string;
    fornecedor: string;
    precoPorKg: string;
    estoqueMinimo: string;
    torque: string;
    filamentos: string;
    observacoes: string;
    _isNew?: boolean;
}

const emptyRow = (): FioRow => ({
    titulo: '', composicao: '', cor: '', fornecedor: '', precoPorKg: '',
    estoqueMinimo: '', torque: '', filamentos: '', observacoes: '', _isNew: true,
});

export default function TiposFioPage() {
    const [rows, setRows] = useState<FioRow[]>([]);
    const [saved, setSaved] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    const fetchData = useCallback(() => {
        fetch('/api/yarns').then(r => r.json()).then((data: FioRow[]) => {
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

    const updateRow = (idx: number, field: keyof FioRow, value: string) => {
        const newRows = [...rows];
        (newRows[idx] as any)[field] = value;
        setRows(newRows);
        setSaved(false);
    };

    const addRow = () => { setRows([...rows, emptyRow()]); setSaved(false); };

    const deleteRow = async (idx: number) => {
        const row = rows[idx];
        if (row.id) { await fetch(`/api/yarns?id=${row.id}`, { method: 'DELETE' }); }
        const newRows = rows.filter((_, i) => i !== idx);
        setRows(newRows.length > 0 ? newRows : [emptyRow()]);
        showToast('Tipo de fio removido', 'info');
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            for (const row of rows) {
                if (!row.titulo && !row.composicao) continue;
                const payload = { titulo: row.titulo, composicao: row.composicao, cor: row.cor, fornecedor: row.fornecedor, precoPorKg: Number(row.precoPorKg) || 0, estoqueMinimo: Number(row.estoqueMinimo) || 0, torque: row.torque, filamentos: row.filamentos, observacoes: row.observacoes };
                if (row.id && !row._isNew) {
                    await fetch('/api/yarns', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, ...payload }) });
                } else {
                    await fetch('/api/yarns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                }
            }
            setSaved(true);
            showToast('Tipos de fio salvos com sucesso!', 'success');
            fetchData();
        } catch {
            showToast('Erro ao salvar tipos de fio', 'error');
        }
        setSaving(false);
    };

    return (
        <>
            <div className="page-header">
                <div><h1>🎨 Tipos de Fio</h1><p>Cadastro de tipos de fio disponíveis na malharia</p></div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {!saved && <span className="save-indicator unsaved">● Não salvo</span>}
                    {saving && <span className="save-indicator saving">⏳ Salvando...</span>}
                    {saved && !saving && rows.some(r => r.id) && <span className="save-indicator saved">✓ Salvo</span>}
                    <button className="btn btn-success" onClick={saveAll} disabled={saving}>💾 Salvar</button>
                </div>
            </div>

            <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                <div className="card"><div className="card-header"><span className="card-title">🎨 Tipos Cadastrados</span></div><div className="card-value">{rows.filter(r => r.titulo || r.composicao).length}</div></div>
                <div className="card"><div className="card-header"><span className="card-title">🧵 Fornecedores</span></div><div className="card-value" style={{ color: 'var(--accent-blue)' }}>{new Set(rows.filter(r => r.fornecedor).map(r => r.fornecedor)).size}</div></div>
            </div>

            <div className="spreadsheet">
                <div className="spreadsheet-toolbar">
                    <div className="spreadsheet-toolbar-left">
                        <h3>📋 Tipos de Fio Cadastrados</h3>
                        <span className="spreadsheet-count">{rows.filter(r => r.titulo || r.composicao).length} tipos</span>
                    </div>
                    <button className="spreadsheet-add-row" onClick={addRow}>+ Novo Tipo</button>
                </div>

                <div className="spreadsheet-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th className="row-num">#</th>
                                <th style={{ minWidth: '90px' }}>Título (Ne)</th>
                                <th style={{ minWidth: '130px' }}>Composição</th>
                                <th style={{ minWidth: '90px' }}>Cor</th>
                                <th style={{ minWidth: '130px' }}>Fornecedor</th>
                                <th style={{ minWidth: '90px' }}>Preço/kg (R$)</th>
                                <th style={{ minWidth: '90px' }}>Est. Mínimo (kg)</th>
                                <th style={{ minWidth: '80px' }}>Torque</th>
                                <th style={{ minWidth: '80px' }}>Filamentos</th>
                                <th style={{ minWidth: '150px' }}>Observações</th>
                                <th style={{ width: '60px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row.id || `new-${idx}`}>
                                    <td className="row-num">{idx + 1}</td>
                                    <td><input className="spreadsheet-input" value={row.titulo} onChange={e => updateRow(idx, 'titulo', e.target.value)} placeholder="30/1, 24/1..." /></td>
                                    <td><input className="spreadsheet-input" value={row.composicao} onChange={e => updateRow(idx, 'composicao', e.target.value)} placeholder="100% Algodão" /></td>
                                    <td><input className="spreadsheet-input" value={row.cor} onChange={e => updateRow(idx, 'cor', e.target.value)} placeholder="Branco" /></td>
                                    <td><input className="spreadsheet-input" value={row.fornecedor} onChange={e => updateRow(idx, 'fornecedor', e.target.value)} placeholder="Coteminas" /></td>
                                    <td><input className="spreadsheet-input" type="number" step="0.01" value={row.precoPorKg} onChange={e => updateRow(idx, 'precoPorKg', e.target.value)} placeholder="0,00" /></td>
                                    <td><input className="spreadsheet-input" type="number" value={row.estoqueMinimo} onChange={e => updateRow(idx, 'estoqueMinimo', e.target.value)} placeholder="0" /></td>
                                    <td><input className="spreadsheet-input" value={row.torque} onChange={e => updateRow(idx, 'torque', e.target.value)} placeholder="S, Z..." /></td>
                                    <td><input className="spreadsheet-input" value={row.filamentos} onChange={e => updateRow(idx, 'filamentos', e.target.value)} placeholder="1, 2..." /></td>
                                    <td><input className="spreadsheet-input" value={row.observacoes} onChange={e => updateRow(idx, 'observacoes', e.target.value)} placeholder="Obs..." /></td>
                                    <td>
                                        <div className="spreadsheet-actions"><button className="btn-icon delete" onClick={() => deleteRow(idx)} title="Excluir">🗑️</button></div>
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr><td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    Nenhum tipo de fio cadastrado. Clique em &quot;+ Novo Tipo&quot; para começar.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="spreadsheet-footer">
                    <button className="spreadsheet-add-row" onClick={addRow}>+ Adicionar Tipo</button>
                    <span>{rows.filter(r => r.titulo || r.composicao).length} tipo(s) cadastrado(s)</span>
                </div>
            </div>
        </>
    );
}
