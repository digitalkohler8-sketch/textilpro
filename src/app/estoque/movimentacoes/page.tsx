'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';

interface MovimentacaoRow {
    id?: string;
    data: string;
    tipo: string;
    categoria: string;
    itemNome: string;
    quantidade: string;
    motivo: string;
    documento: string;
    usuario: string;
    observacoes: string;
    _isNew?: boolean;
}

const emptyRow = (): MovimentacaoRow => ({
    data: new Date().toISOString().split('T')[0], tipo: 'entrada', categoria: 'fio',
    itemNome: '', quantidade: '', motivo: '', documento: '', usuario: '', observacoes: '', _isNew: true,
});

export default function MovimentacoesPage() {
    const [rows, setRows] = useState<MovimentacaoRow[]>([]);
    const [saved, setSaved] = useState(true);
    const [saving, setSaving] = useState(false);
    const [filterTipo, setFilterTipo] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('');
    const { showToast } = useToast();

    const fetchData = useCallback(() => {
        fetch('/api/stock/movements').then(r => r.json()).then((data: MovimentacaoRow[]) => {
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

    const updateRow = (idx: number, field: keyof MovimentacaoRow, value: string) => {
        const newRows = [...rows];
        (newRows[idx] as any)[field] = value;
        setRows(newRows);
        setSaved(false);
    };

    const addRow = () => { setRows([...rows, emptyRow()]); setSaved(false); };

    const deleteRow = async (idx: number) => {
        const row = rows[idx];
        if (row.id) { await fetch(`/api/stock/movements?id=${row.id}`, { method: 'DELETE' }); }
        const newRows = rows.filter((_, i) => i !== idx);
        setRows(newRows.length > 0 ? newRows : [emptyRow()]);
        showToast('Movimentação removida', 'info');
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            for (const row of rows) {
                if (!row.itemNome && !row.quantidade) continue;
                const payload = {
                    data: row.data, tipo: row.tipo, categoria: row.categoria,
                    itemNome: row.itemNome, quantidade: Number(row.quantidade) || 0,
                    motivo: row.motivo, documento: row.documento, usuario: row.usuario,
                    observacoes: row.observacoes,
                };
                if (row.id && !row._isNew) {
                    await fetch('/api/stock/movements', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, ...payload }) });
                } else if (row.itemNome || row.quantidade) {
                    await fetch('/api/stock/movements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                }
            }
            setSaved(true);
            showToast('Movimentações salvas com sucesso!', 'success');
            fetchData();
        } catch {
            showToast('Erro ao salvar movimentações', 'error');
        }
        setSaving(false);
    };

    // Filter
    const filteredRows = rows.filter(r => {
        const matchTipo = !filterTipo || r.tipo === filterTipo;
        const matchCategoria = !filterCategoria || r.categoria === filterCategoria;
        return matchTipo && matchCategoria;
    });

    // KPIs
    const totalEntradas = rows.filter(r => r.tipo === 'entrada').reduce((s, r) => s + (Number(r.quantidade) || 0), 0);
    const totalSaidas = rows.filter(r => r.tipo === 'saida').reduce((s, r) => s + (Number(r.quantidade) || 0), 0);
    const totalAjustes = rows.filter(r => r.tipo === 'ajuste').reduce((s, r) => s + (Number(r.quantidade) || 0), 0);

    return (
        <>
            <div className="page-header">
                <div><h1>🔄 Movimentações de Estoque</h1><p>Registre entradas, saídas e ajustes manualmente</p></div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {!saved && <span className="save-indicator unsaved">● Não salvo</span>}
                    {saving && <span className="save-indicator saving">⏳ Salvando...</span>}
                    {saved && !saving && rows.some(r => r.id) && <span className="save-indicator saved">✓ Salvo</span>}
                    <button className="btn btn-success" onClick={saveAll} disabled={saving}>💾 Salvar</button>
                </div>
            </div>

            <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                <div className="card">
                    <div className="card-header"><span className="card-title">↑ Entradas</span></div>
                    <div className="card-value" style={{ color: 'var(--accent-green)' }}>{totalEntradas.toLocaleString('pt-BR')} kg</div>
                </div>
                <div className="card">
                    <div className="card-header"><span className="card-title">↓ Saídas</span></div>
                    <div className="card-value" style={{ color: 'var(--accent-red)' }}>{totalSaidas.toLocaleString('pt-BR')} kg</div>
                </div>
                <div className="card">
                    <div className="card-header"><span className="card-title">⟳ Ajustes</span></div>
                    <div className="card-value" style={{ color: 'var(--accent-orange)' }}>{totalAjustes.toLocaleString('pt-BR')} kg</div>
                </div>
                <div className="card">
                    <div className="card-header"><span className="card-title">📊 Saldo</span></div>
                    <div className="card-value" style={{ color: 'var(--accent-blue)' }}>{(totalEntradas - totalSaidas + totalAjustes).toLocaleString('pt-BR')} kg</div>
                </div>
            </div>

            <div className="spreadsheet">
                <div className="spreadsheet-toolbar">
                    <div className="spreadsheet-toolbar-left">
                        <h3>📋 Movimentações</h3>
                        <span className="spreadsheet-count">{rows.filter(r => r.itemNome || r.quantidade).length} registros</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select className="spreadsheet-select" value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={{ width: '120px' }}>
                            <option value="">Todos</option>
                            <option value="entrada">Entradas</option>
                            <option value="saida">Saídas</option>
                            <option value="ajuste">Ajustes</option>
                        </select>
                        <select className="spreadsheet-select" value={filterCategoria} onChange={e => setFilterCategoria(e.target.value)} style={{ width: '120px' }}>
                            <option value="">Fio + Malha</option>
                            <option value="fio">Fio</option>
                            <option value="malha">Malha</option>
                        </select>
                        <button className="spreadsheet-add-row" onClick={addRow}>+ Nova Movimentação</button>
                    </div>
                </div>

                <div className="spreadsheet-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th className="row-num">#</th>
                                <th style={{ minWidth: '110px' }}>Data</th>
                                <th style={{ minWidth: '100px' }}>Tipo</th>
                                <th style={{ minWidth: '90px' }}>Categoria</th>
                                <th style={{ minWidth: '180px' }}>Item</th>
                                <th style={{ minWidth: '90px' }}>Qtd (kg)</th>
                                <th style={{ minWidth: '150px' }}>Motivo</th>
                                <th style={{ minWidth: '120px' }}>Documento / NF</th>
                                <th style={{ minWidth: '120px' }}>Usuário</th>
                                <th style={{ minWidth: '150px' }}>Observações</th>
                                <th style={{ width: '60px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map((row, idx) => {
                                const realIdx = rows.indexOf(row);
                                return (
                                    <tr key={row.id || `new-${idx}`}>
                                        <td className="row-num">{idx + 1}</td>
                                        <td><input className="spreadsheet-input" type="date" value={row.data} onChange={e => updateRow(realIdx, 'data', e.target.value)} /></td>
                                        <td>
                                            <select className="spreadsheet-select" value={row.tipo} onChange={e => updateRow(realIdx, 'tipo', e.target.value)}>
                                                <option value="entrada">↑ Entrada</option>
                                                <option value="saida">↓ Saída</option>
                                                <option value="ajuste">⟳ Ajuste</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select className="spreadsheet-select" value={row.categoria} onChange={e => updateRow(realIdx, 'categoria', e.target.value)}>
                                                <option value="fio">🧵 Fio</option>
                                                <option value="malha">🧶 Malha</option>
                                            </select>
                                        </td>
                                        <td><input className="spreadsheet-input" value={row.itemNome} onChange={e => updateRow(realIdx, 'itemNome', e.target.value)} placeholder="Nome do fio ou malha" /></td>
                                        <td><input className="spreadsheet-input" type="number" value={row.quantidade} onChange={e => updateRow(realIdx, 'quantidade', e.target.value)} placeholder="0" /></td>
                                        <td><input className="spreadsheet-input" value={row.motivo} onChange={e => updateRow(realIdx, 'motivo', e.target.value)} placeholder="Compra, venda..." /></td>
                                        <td><input className="spreadsheet-input" value={row.documento} onChange={e => updateRow(realIdx, 'documento', e.target.value)} placeholder="NF-001" /></td>
                                        <td><input className="spreadsheet-input" value={row.usuario} onChange={e => updateRow(realIdx, 'usuario', e.target.value)} placeholder="Responsável" /></td>
                                        <td><input className="spreadsheet-input" value={row.observacoes} onChange={e => updateRow(realIdx, 'observacoes', e.target.value)} placeholder="Obs..." /></td>
                                        <td>
                                            <div className="spreadsheet-actions">
                                                <button className="btn-icon delete" onClick={() => deleteRow(realIdx)} title="Excluir">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="spreadsheet-footer">
                    <button className="spreadsheet-add-row" onClick={addRow}>+ Adicionar Movimentação</button>
                    <span>{rows.filter(r => r.itemNome || r.quantidade).length} registro(s) — Entradas: {totalEntradas.toLocaleString('pt-BR')} kg | Saídas: {totalSaidas.toLocaleString('pt-BR')} kg</span>
                </div>
            </div>
        </>
    );
}
