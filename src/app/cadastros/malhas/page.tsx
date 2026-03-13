'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';

interface FabricRow {
    id?: string;
    tipo: string;
    composicao: string;
    gramatura: string;
    largura: string;
    rendimento: string;
    tipoFio: string;
    tituloFio: string;
    numFios: string;
    estrutura: string;
    observacoes: string;
    _isNew?: boolean;
}

const emptyRow = (): FabricRow => ({
    tipo: '', composicao: '', gramatura: '', largura: '', rendimento: '',
    tipoFio: '', tituloFio: '', numFios: '', estrutura: '', observacoes: '', _isNew: true,
});

export default function TiposMalhaPage() {
    const [rows, setRows] = useState<FabricRow[]>([]);
    const [saved, setSaved] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    const fetchData = useCallback(() => {
        fetch('/api/fabrics').then(r => r.json()).then((data: FabricRow[]) => {
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

    const updateRow = (idx: number, field: keyof FabricRow, value: string) => {
        const newRows = [...rows];
        (newRows[idx] as any)[field] = value;
        setRows(newRows);
        setSaved(false);
    };

    const addRow = () => { setRows([...rows, emptyRow()]); setSaved(false); };

    const deleteRow = async (idx: number) => {
        const row = rows[idx];
        if (row.id) { await fetch(`/api/fabrics?id=${row.id}`, { method: 'DELETE' }); }
        const newRows = rows.filter((_, i) => i !== idx);
        setRows(newRows.length > 0 ? newRows : [emptyRow()]);
        showToast('Tipo de malha removido', 'info');
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            for (const row of rows) {
                if (!row.tipo) continue;
                const payload = { tipo: row.tipo, composicao: row.composicao, gramatura: Number(row.gramatura) || 0, largura: Number(row.largura) || 0, rendimento: Number(row.rendimento) || 0, tipoFio: row.tipoFio, tituloFio: row.tituloFio, numFios: row.numFios, estrutura: row.estrutura, observacoes: row.observacoes };
                if (row.id && !row._isNew) {
                    await fetch('/api/fabrics', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, ...payload }) });
                } else {
                    await fetch('/api/fabrics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                }
            }
            setSaved(true);
            showToast('Tipos de malha salvos com sucesso!', 'success');
            fetchData();
        } catch {
            showToast('Erro ao salvar tipos de malha', 'error');
        }
        setSaving(false);
    };

    return (
        <>
            <div className="page-header">
                <div><h1>📐 Tipos de Malha</h1><p>Cadastro de tipos de malha produzidos pela malharia</p></div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {!saved && <span className="save-indicator unsaved">● Não salvo</span>}
                    {saving && <span className="save-indicator saving">⏳ Salvando...</span>}
                    {saved && !saving && rows.some(r => r.id) && <span className="save-indicator saved">✓ Salvo</span>}
                    <button className="btn btn-success" onClick={saveAll} disabled={saving}>💾 Salvar</button>
                </div>
            </div>

            <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                <div className="card"><div className="card-header"><span className="card-title">📐 Tipos Cadastrados</span></div><div className="card-value">{rows.filter(r => r.tipo).length}</div></div>
                <div className="card"><div className="card-header"><span className="card-title">🧵 Composições Diferentes</span></div><div className="card-value" style={{ color: 'var(--accent-purple)' }}>{new Set(rows.filter(r => r.composicao).map(r => r.composicao)).size}</div></div>
            </div>

            <div className="spreadsheet">
                <div className="spreadsheet-toolbar">
                    <div className="spreadsheet-toolbar-left">
                        <h3>📋 Tipos de Malha Cadastrados</h3>
                        <span className="spreadsheet-count">{rows.filter(r => r.tipo).length} tipos</span>
                    </div>
                    <button className="spreadsheet-add-row" onClick={addRow}>+ Novo Tipo</button>
                </div>

                <div className="spreadsheet-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th className="row-num">#</th>
                                <th style={{ minWidth: '140px' }}>Tipo de Malha</th>
                                <th style={{ minWidth: '130px' }}>Composição</th>
                                <th style={{ minWidth: '100px' }}>Tipo de Fio</th>
                                <th style={{ minWidth: '90px' }}>Título do Fio</th>
                                <th style={{ minWidth: '80px' }}>Nº Fios</th>
                                <th style={{ minWidth: '100px' }}>Estrutura</th>
                                <th style={{ minWidth: '90px' }}>Gramatura (g/m²)</th>
                                <th style={{ minWidth: '80px' }}>Largura (cm)</th>
                                <th style={{ minWidth: '90px' }}>Rendimento (m/kg)</th>
                                <th style={{ minWidth: '150px' }}>Observações</th>
                                <th style={{ width: '60px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row.id || `new-${idx}`}>
                                    <td className="row-num">{idx + 1}</td>
                                    <td><input className="spreadsheet-input" value={row.tipo} onChange={e => updateRow(idx, 'tipo', e.target.value)} placeholder="Jersey Simples" /></td>
                                    <td><input className="spreadsheet-input" value={row.composicao} onChange={e => updateRow(idx, 'composicao', e.target.value)} placeholder="100% Algodão" /></td>
                                    <td><input className="spreadsheet-input" value={row.tipoFio} onChange={e => updateRow(idx, 'tipoFio', e.target.value)} placeholder="Algodão, PES..." /></td>
                                    <td><input className="spreadsheet-input" value={row.tituloFio} onChange={e => updateRow(idx, 'tituloFio', e.target.value)} placeholder="30/1, 24/1..." /></td>
                                    <td><input className="spreadsheet-input" value={row.numFios} onChange={e => updateRow(idx, 'numFios', e.target.value)} placeholder="1, 2..." /></td>
                                    <td>
                                        <select className="spreadsheet-select" value={row.estrutura} onChange={e => updateRow(idx, 'estrutura', e.target.value)}>
                                            <option value="">Selecione</option>
                                            <option value="Circular">Circular</option>
                                            <option value="Flat">Flat</option>
                                            <option value="Urdume">Urdume</option>
                                            <option value="Trama">Trama</option>
                                        </select>
                                    </td>
                                    <td><input className="spreadsheet-input" type="number" value={row.gramatura} onChange={e => updateRow(idx, 'gramatura', e.target.value)} placeholder="0" /></td>
                                    <td><input className="spreadsheet-input" type="number" value={row.largura} onChange={e => updateRow(idx, 'largura', e.target.value)} placeholder="0" /></td>
                                    <td><input className="spreadsheet-input" type="number" step="0.01" value={row.rendimento} onChange={e => updateRow(idx, 'rendimento', e.target.value)} placeholder="0" /></td>
                                    <td><input className="spreadsheet-input" value={row.observacoes} onChange={e => updateRow(idx, 'observacoes', e.target.value)} placeholder="Obs..." /></td>
                                    <td>
                                        <div className="spreadsheet-actions"><button className="btn-icon delete" onClick={() => deleteRow(idx)} title="Excluir">🗑️</button></div>
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr><td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    Nenhum tipo de malha cadastrado. Clique em &quot;+ Novo Tipo&quot; para começar.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="spreadsheet-footer">
                    <button className="spreadsheet-add-row" onClick={addRow}>+ Adicionar Tipo</button>
                    <span>{rows.filter(r => r.tipo).length} tipo(s) cadastrado(s)</span>
                </div>
            </div>
        </>
    );
}
