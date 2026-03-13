'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';

interface FornecedorRow {
    id?: string;
    nome: string;
    cnpj: string;
    email: string;
    telefone: string;
    cidade: string;
    estado: string;
    tipo: string;
    _isNew?: boolean;
}

const emptyRow = (): FornecedorRow => ({
    nome: '', cnpj: '', email: '', telefone: '', cidade: '', estado: '', tipo: 'Fio', _isNew: true,
});

export default function FornecedoresPage() {
    const [rows, setRows] = useState<FornecedorRow[]>([]);
    const [saved, setSaved] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    const fetchData = useCallback(() => {
        fetch('/api/suppliers').then(r => r.json()).then((data: FornecedorRow[]) => {
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

    const updateRow = (idx: number, field: keyof FornecedorRow, value: string) => {
        const newRows = [...rows];
        (newRows[idx] as any)[field] = value;
        setRows(newRows);
        setSaved(false);
    };

    const addRow = () => { setRows([...rows, emptyRow()]); setSaved(false); };

    const deleteRow = async (idx: number) => {
        const row = rows[idx];
        if (row.id) { await fetch(`/api/suppliers?id=${row.id}`, { method: 'DELETE' }); }
        const newRows = rows.filter((_, i) => i !== idx);
        setRows(newRows.length > 0 ? newRows : [emptyRow()]);
        showToast('Fornecedor removido', 'info');
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            for (const row of rows) {
                if (!row.nome) continue;
                const payload = {
                    nome: row.nome, cnpj: row.cnpj, email: row.email, telefone: row.telefone,
                    cidade: row.cidade, estado: row.estado, tipo: row.tipo,
                };
                if (row.id && !row._isNew) {
                    await fetch('/api/suppliers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, ...payload }) });
                } else if (row.nome) {
                    await fetch('/api/suppliers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                }
            }
            setSaved(true);
            showToast('Fornecedores salvos com sucesso!', 'success');
            fetchData();
        } catch {
            showToast('Erro ao salvar fornecedores', 'error');
        }
        setSaving(false);
    };

    return (
        <>
            <div className="page-header">
                <div><h1>🚚 Fornecedores</h1><p>Cadastro de fornecedores de fio, peças e serviços</p></div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {!saved && <span className="save-indicator unsaved">● Não salvo</span>}
                    {saving && <span className="save-indicator saving">⏳ Salvando...</span>}
                    {saved && !saving && rows.some(r => r.id) && <span className="save-indicator saved">✓ Salvo</span>}
                    <button className="btn btn-success" onClick={saveAll} disabled={saving}>💾 Salvar</button>
                </div>
            </div>

            <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                <div className="card"><div className="card-header"><span className="card-title">🚚 Total Fornecedores</span></div><div className="card-value">{rows.filter(r => r.nome).length}</div></div>
                <div className="card"><div className="card-header"><span className="card-title">🧵 Fornecedores de Fio</span></div><div className="card-value" style={{ color: 'var(--accent-blue)' }}>{rows.filter(r => r.tipo === 'Fio').length}</div></div>
                <div className="card"><div className="card-header"><span className="card-title">🔧 Fornecedores de Peças</span></div><div className="card-value" style={{ color: 'var(--accent-orange)' }}>{rows.filter(r => r.tipo === 'Peças').length}</div></div>
            </div>

            <div className="spreadsheet">
                <div className="spreadsheet-toolbar">
                    <div className="spreadsheet-toolbar-left">
                        <h3>📋 Lista de Fornecedores</h3>
                        <span className="spreadsheet-count">{rows.filter(r => r.nome).length} fornecedores</span>
                    </div>
                    <button className="spreadsheet-add-row" onClick={addRow}>+ Novo Fornecedor</button>
                </div>

                <div className="spreadsheet-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th className="row-num">#</th>
                                <th style={{ minWidth: '180px' }}>Nome / Razão Social</th>
                                <th style={{ minWidth: '140px' }}>CNPJ</th>
                                <th style={{ minWidth: '160px' }}>E-mail</th>
                                <th style={{ minWidth: '120px' }}>Telefone</th>
                                <th style={{ minWidth: '100px' }}>Cidade</th>
                                <th style={{ minWidth: '60px' }}>UF</th>
                                <th style={{ minWidth: '100px' }}>Tipo</th>
                                <th style={{ width: '60px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row.id || `new-${idx}`}>
                                    <td className="row-num">{idx + 1}</td>
                                    <td><input className="spreadsheet-input" value={row.nome} onChange={e => updateRow(idx, 'nome', e.target.value)} placeholder="Coteminas S.A." /></td>
                                    <td><input className="spreadsheet-input" value={row.cnpj} onChange={e => updateRow(idx, 'cnpj', e.target.value)} placeholder="00.000.000/0001-00" /></td>
                                    <td><input className="spreadsheet-input" value={row.email} onChange={e => updateRow(idx, 'email', e.target.value)} placeholder="vendas@empresa.com" /></td>
                                    <td><input className="spreadsheet-input" value={row.telefone} onChange={e => updateRow(idx, 'telefone', e.target.value)} placeholder="(47) 3333-2222" /></td>
                                    <td><input className="spreadsheet-input" value={row.cidade} onChange={e => updateRow(idx, 'cidade', e.target.value)} placeholder="Blumenau" /></td>
                                    <td>
                                        <select className="spreadsheet-select" value={row.estado} onChange={e => updateRow(idx, 'estado', e.target.value)}>
                                            <option value="">UF</option>
                                            {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                                                <option key={uf} value={uf}>{uf}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <select className="spreadsheet-select" value={row.tipo} onChange={e => updateRow(idx, 'tipo', e.target.value)}>
                                            <option value="Fio">🧵 Fio</option>
                                            <option value="Peças">🔧 Peças</option>
                                            <option value="Químico">🧪 Químico</option>
                                            <option value="Serviço">📐 Serviço</option>
                                            <option value="Outros">📦 Outros</option>
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
                                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    Nenhum fornecedor cadastrado. Clique em &quot;+ Novo Fornecedor&quot; para começar.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="spreadsheet-footer">
                    <button className="spreadsheet-add-row" onClick={addRow}>+ Adicionar Fornecedor</button>
                    <span>{rows.filter(r => r.nome).length} fornecedor(es)</span>
                </div>
            </div>
        </>
    );
}
