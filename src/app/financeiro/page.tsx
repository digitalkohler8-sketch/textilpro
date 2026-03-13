'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';

interface FinanceiroRow {
    id?: string;
    descricao: string;
    tipo: string;
    valor: string;
    dataVencimento: string;
    dataPagamento: string;
    status: string;
    categoria: string;
    entidade: string;
    formaPagamento: string;
    observacoes: string;
    _isNew?: boolean;
}

const emptyRow = (): FinanceiroRow => ({
    descricao: '', tipo: 'pagar', valor: '', dataVencimento: '', dataPagamento: '',
    status: 'pendente', categoria: '', entidade: '', formaPagamento: '', observacoes: '', _isNew: true,
});

export default function FinanceiroPage() {
    const [rows, setRows] = useState<FinanceiroRow[]>([]);
    const [saved, setSaved] = useState(true);
    const [saving, setSaving] = useState(false);
    const [filterTipo, setFilterTipo] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const { showToast } = useToast();

    const fetchData = useCallback(() => {
        fetch('/api/financeiro').then(r => r.json()).then((data: FinanceiroRow[]) => {
            setRows(data.length > 0 ? data : [emptyRow()]);
            setSaved(true);
        });
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Ctrl+S to save
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveAll();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    const updateRow = (idx: number, field: keyof FinanceiroRow, value: string) => {
        const newRows = [...rows];
        (newRows[idx] as any)[field] = value;
        if (field === 'dataVencimento' || field === 'status') {
            const row = newRows[idx];
            if (row.status === 'pendente' && row.dataVencimento) {
                const vencimento = new Date(row.dataVencimento);
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                if (vencimento < hoje) {
                    row.status = 'vencido';
                }
            }
        }
        if (field === 'status' && value === 'pago' && !newRows[idx].dataPagamento) {
            newRows[idx].dataPagamento = new Date().toISOString().split('T')[0];
        }
        setRows(newRows);
        setSaved(false);
    };

    const addRow = () => { setRows([...rows, emptyRow()]); setSaved(false); };

    const deleteRow = async (idx: number) => {
        const row = rows[idx];
        if (row.id) { await fetch(`/api/financeiro?id=${row.id}`, { method: 'DELETE' }); }
        const newRows = rows.filter((_, i) => i !== idx);
        setRows(newRows.length > 0 ? newRows : [emptyRow()]);
        showToast('Registro removido', 'info');
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            for (const row of rows) {
                if (!row.descricao && !row.valor) continue;
                const payload = {
                    descricao: row.descricao, tipo: row.tipo, valor: row.valor,
                    dataVencimento: row.dataVencimento, dataPagamento: row.dataPagamento,
                    status: row.status, categoria: row.categoria, entidade: row.entidade,
                    formaPagamento: row.formaPagamento, observacoes: row.observacoes,
                };
                if (row.id && !row._isNew) {
                    await fetch('/api/financeiro', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, ...payload }) });
                } else if (row.descricao || row.valor) {
                    await fetch('/api/financeiro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                }
            }
            setSaved(true);
            showToast('Dados financeiros salvos com sucesso!', 'success');
            fetchData();
        } catch {
            showToast('Erro ao salvar dados', 'error');
        }
        setSaving(false);
    };

    const filteredRows = rows.filter(r => {
        const matchTipo = !filterTipo || r.tipo === filterTipo;
        const matchStatus = !filterStatus || r.status === filterStatus;
        return matchTipo && matchStatus;
    });

    const totalPagar = rows.filter(r => r.tipo === 'pagar' && r.status !== 'cancelado').reduce((s, r) => s + (Number(r.valor) || 0), 0);
    const totalReceber = rows.filter(r => r.tipo === 'receber' && r.status !== 'cancelado').reduce((s, r) => s + (Number(r.valor) || 0), 0);
    const totalVencido = rows.filter(r => r.status === 'vencido').reduce((s, r) => s + (Number(r.valor) || 0), 0);
    const totalPago = rows.filter(r => r.status === 'pago').reduce((s, r) => s + (Number(r.valor) || 0), 0);
    const saldo = totalReceber - totalPagar;

    return (
        <>
            <div className="page-header">
                <div><h1>💰 Financeiro</h1><p>Contas a pagar e receber — controle manual via planilha</p></div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {!saved && <span className="save-indicator unsaved">● Alterações não salvas</span>}
                    {saving && <span className="save-indicator saving">⏳ Salvando...</span>}
                    {saved && !saving && rows.some(r => r.id) && <span className="save-indicator saved">✓ Salvo</span>}
                    <button className="btn btn-success" onClick={saveAll} disabled={saving}>💾 Salvar</button>
                </div>
            </div>

            <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                <div className="card">
                    <div className="card-header"><span className="card-title">💸 Total a Pagar</span></div>
                    <div className="card-value" style={{ color: 'var(--accent-red)' }}>R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="card">
                    <div className="card-header"><span className="card-title">💵 Total a Receber</span></div>
                    <div className="card-value" style={{ color: 'var(--accent-green)' }}>R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="card">
                    <div className="card-header"><span className="card-title">📊 Saldo</span></div>
                    <div className="card-value" style={{ color: saldo >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="card">
                    <div className="card-header"><span className="card-title">⚠️ Vencido</span></div>
                    <div className="card-value" style={{ color: 'var(--accent-red)' }}>R$ {totalVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="card">
                    <div className="card-header"><span className="card-title">✅ Pago</span></div>
                    <div className="card-value" style={{ color: 'var(--accent-green)' }}>R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
            </div>

            <div className="spreadsheet">
                <div className="spreadsheet-toolbar">
                    <div className="spreadsheet-toolbar-left">
                        <h3>📋 Contas a Pagar / Receber</h3>
                        <span className="spreadsheet-count">{rows.filter(r => r.descricao || r.valor).length} registros</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select className="spreadsheet-select" value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={{ width: '130px' }}>
                            <option value="">Todos os Tipos</option>
                            <option value="pagar">A Pagar</option>
                            <option value="receber">A Receber</option>
                        </select>
                        <select className="spreadsheet-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '130px' }}>
                            <option value="">Todos os Status</option>
                            <option value="pendente">Pendente</option>
                            <option value="pago">Pago</option>
                            <option value="vencido">Vencido</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                        <button className="spreadsheet-add-row" onClick={addRow}>+ Nova Conta</button>
                    </div>
                </div>

                <div className="spreadsheet-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th className="row-num">#</th>
                                <th style={{ minWidth: '200px' }}>Descrição</th>
                                <th style={{ minWidth: '100px' }}>Tipo</th>
                                <th style={{ minWidth: '110px' }}>Valor (R$)</th>
                                <th style={{ minWidth: '120px' }}>Vencimento</th>
                                <th style={{ minWidth: '120px' }}>Pagamento</th>
                                <th style={{ minWidth: '100px' }}>Status</th>
                                <th style={{ minWidth: '120px' }}>Categoria</th>
                                <th style={{ minWidth: '150px' }}>Fornecedor / Cliente</th>
                                <th style={{ minWidth: '120px' }}>Forma Pgto</th>
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
                                        <td><input className="spreadsheet-input" value={row.descricao} onChange={e => updateRow(realIdx, 'descricao', e.target.value)} placeholder="Ex: Compra de fio algodão" /></td>
                                        <td>
                                            <select className="spreadsheet-select" value={row.tipo} onChange={e => updateRow(realIdx, 'tipo', e.target.value)}>
                                                <option value="pagar">💸 A Pagar</option>
                                                <option value="receber">💵 A Receber</option>
                                            </select>
                                        </td>
                                        <td><input className="spreadsheet-input" type="number" step="0.01" value={row.valor} onChange={e => updateRow(realIdx, 'valor', e.target.value)} placeholder="0,00" /></td>
                                        <td><input className="spreadsheet-input" type="date" value={row.dataVencimento} onChange={e => updateRow(realIdx, 'dataVencimento', e.target.value)} /></td>
                                        <td><input className="spreadsheet-input" type="date" value={row.dataPagamento} onChange={e => updateRow(realIdx, 'dataPagamento', e.target.value)} /></td>
                                        <td>
                                            <select className="spreadsheet-select" value={row.status} onChange={e => updateRow(realIdx, 'status', e.target.value)}>
                                                <option value="pendente">⏳ Pendente</option>
                                                <option value="pago">✅ Pago</option>
                                                <option value="vencido">⚠️ Vencido</option>
                                                <option value="cancelado">❌ Cancelado</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select className="spreadsheet-select" value={row.categoria} onChange={e => updateRow(realIdx, 'categoria', e.target.value)}>
                                                <option value="">Selecione</option>
                                                <option value="Matéria-prima">🧵 Matéria-prima</option>
                                                <option value="Energia">⚡ Energia</option>
                                                <option value="Manutenção">🔧 Manutenção</option>
                                                <option value="Salários">👷 Salários</option>
                                                <option value="Transporte">🚚 Transporte</option>
                                                <option value="Impostos">📋 Impostos</option>
                                                <option value="Venda">💼 Venda</option>
                                                <option value="Serviço">📐 Serviço</option>
                                                <option value="Outros">📦 Outros</option>
                                            </select>
                                        </td>
                                        <td><input className="spreadsheet-input" value={row.entidade} onChange={e => updateRow(realIdx, 'entidade', e.target.value)} placeholder="Nome..." /></td>
                                        <td>
                                            <select className="spreadsheet-select" value={row.formaPagamento} onChange={e => updateRow(realIdx, 'formaPagamento', e.target.value)}>
                                                <option value="">Selecione</option>
                                                <option value="Boleto">📄 Boleto</option>
                                                <option value="PIX">📱 PIX</option>
                                                <option value="Transferência">🏦 Transferência</option>
                                                <option value="Cartão">💳 Cartão</option>
                                                <option value="Dinheiro">💵 Dinheiro</option>
                                                <option value="Cheque">📝 Cheque</option>
                                            </select>
                                        </td>
                                        <td><input className="spreadsheet-input" value={row.observacoes} onChange={e => updateRow(realIdx, 'observacoes', e.target.value)} placeholder="Obs..." /></td>
                                        <td>
                                            <div className="spreadsheet-actions">
                                                <button className="btn-icon delete" onClick={() => deleteRow(realIdx)} title="Excluir">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredRows.length === 0 && (
                                <tr><td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    Nenhum registro encontrado. Clique em &quot;+ Nova Conta&quot; para começar.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="spreadsheet-footer">
                    <button className="spreadsheet-add-row" onClick={addRow}>+ Adicionar Conta</button>
                    <span>{rows.filter(r => r.descricao || r.valor).length} registro(s) — Saldo: R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>
        </>
    );
}
