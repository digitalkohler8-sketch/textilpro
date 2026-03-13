'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';

interface ClienteRow {
    id?: string;
    nome: string;
    cnpj: string;
    email: string;
    telefone: string;
    cidade: string;
    estado: string;
    endereco: string;
    categoria: string;
    _isNew?: boolean;
}

const emptyRow = (): ClienteRow => ({
    nome: '', cnpj: '', email: '', telefone: '', cidade: '', estado: '', endereco: '', categoria: 'B', _isNew: true,
});

export default function ClientesPage() {
    const [rows, setRows] = useState<ClienteRow[]>([]);
    const [saved, setSaved] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    const fetchData = useCallback(() => {
        fetch('/api/customers').then(r => r.json()).then((data: ClienteRow[]) => {
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

    const updateRow = (idx: number, field: keyof ClienteRow, value: string) => {
        const newRows = [...rows];
        (newRows[idx] as any)[field] = value;
        setRows(newRows);
        setSaved(false);
    };

    const addRow = () => { setRows([...rows, emptyRow()]); setSaved(false); };

    const deleteRow = async (idx: number) => {
        const row = rows[idx];
        if (row.id) { await fetch(`/api/customers?id=${row.id}`, { method: 'DELETE' }); }
        const newRows = rows.filter((_, i) => i !== idx);
        setRows(newRows.length > 0 ? newRows : [emptyRow()]);
        showToast('Cliente removido', 'info');
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            for (const row of rows) {
                if (!row.nome) continue;
                const payload = {
                    nome: row.nome, cnpj: row.cnpj, email: row.email, telefone: row.telefone,
                    cidade: row.cidade, estado: row.estado, endereco: row.endereco, categoria: row.categoria,
                };
                if (row.id && !row._isNew) {
                    await fetch('/api/customers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, ...payload }) });
                } else if (row.nome) {
                    await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                }
            }
            setSaved(true);
            showToast('Clientes salvos com sucesso!', 'success');
            fetchData();
        } catch {
            showToast('Erro ao salvar clientes', 'error');
        }
        setSaving(false);
    };

    return (
        <>
            <div className="page-header">
                <div><h1>👥 Clientes</h1><p>Cadastro de clientes da malharia</p></div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {!saved && <span className="save-indicator unsaved">● Não salvo</span>}
                    {saving && <span className="save-indicator saving">⏳ Salvando...</span>}
                    {saved && !saving && rows.some(r => r.id) && <span className="save-indicator saved">✓ Salvo</span>}
                    <button className="btn btn-success" onClick={saveAll} disabled={saving}>💾 Salvar</button>
                </div>
            </div>

            <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                <div className="card"><div className="card-header"><span className="card-title">👥 Total Clientes</span></div><div className="card-value">{rows.filter(r => r.nome).length}</div></div>
                <div className="card"><div className="card-header"><span className="card-title">⭐ Categoria A</span></div><div className="card-value" style={{ color: 'var(--accent-green)' }}>{rows.filter(r => r.categoria === 'A').length}</div></div>
                <div className="card"><div className="card-header"><span className="card-title">📊 Categoria B</span></div><div className="card-value" style={{ color: 'var(--accent-blue)' }}>{rows.filter(r => r.categoria === 'B').length}</div></div>
            </div>

            <div className="spreadsheet">
                <div className="spreadsheet-toolbar">
                    <div className="spreadsheet-toolbar-left">
                        <h3>📋 Lista de Clientes</h3>
                        <span className="spreadsheet-count">{rows.filter(r => r.nome).length} clientes</span>
                    </div>
                    <button className="spreadsheet-add-row" onClick={addRow}>+ Novo Cliente</button>
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
                                <th style={{ minWidth: '160px' }}>Endereço</th>
                                <th style={{ minWidth: '80px' }}>Cat.</th>
                                <th style={{ width: '60px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row.id || `new-${idx}`}>
                                    <td className="row-num">{idx + 1}</td>
                                    <td><input className="spreadsheet-input" value={row.nome} onChange={e => updateRow(idx, 'nome', e.target.value)} placeholder="Confecções Silva Ltda" /></td>
                                    <td><input className="spreadsheet-input" value={row.cnpj} onChange={e => updateRow(idx, 'cnpj', e.target.value)} placeholder="00.000.000/0001-00" /></td>
                                    <td><input className="spreadsheet-input" value={row.email} onChange={e => updateRow(idx, 'email', e.target.value)} placeholder="contato@empresa.com" /></td>
                                    <td><input className="spreadsheet-input" value={row.telefone} onChange={e => updateRow(idx, 'telefone', e.target.value)} placeholder="(47) 3333-1111" /></td>
                                    <td><input className="spreadsheet-input" value={row.cidade} onChange={e => updateRow(idx, 'cidade', e.target.value)} placeholder="Brusque" /></td>
                                    <td>
                                        <select className="spreadsheet-select" value={row.estado} onChange={e => updateRow(idx, 'estado', e.target.value)}>
                                            <option value="">UF</option>
                                            {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                                                <option key={uf} value={uf}>{uf}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td><input className="spreadsheet-input" value={row.endereco} onChange={e => updateRow(idx, 'endereco', e.target.value)} placeholder="Rua..." /></td>
                                    <td>
                                        <select className="spreadsheet-select" value={row.categoria} onChange={e => updateRow(idx, 'categoria', e.target.value)}>
                                            <option value="A">⭐ A</option>
                                            <option value="B">📊 B</option>
                                            <option value="C">📋 C</option>
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
                                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    Nenhum cliente cadastrado. Clique em &quot;+ Novo Cliente&quot; para começar.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="spreadsheet-footer">
                    <button className="spreadsheet-add-row" onClick={addRow}>+ Adicionar Cliente</button>
                    <span>{rows.filter(r => r.nome).length} cliente(s)</span>
                </div>
            </div>
        </>
    );
}
