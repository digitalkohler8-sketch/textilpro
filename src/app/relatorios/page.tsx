'use client';

import { useState, useEffect } from 'react';

export default function RelatoriosPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [machines, setMachines] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [yarnStock, setYarnStock] = useState<any[]>([]);
    const [fabricStock, setFabricStock] = useState<any[]>([]);
    const [financeData, setFinanceData] = useState<any[]>([]);
    const [activeReport, setActiveReport] = useState('producao');

    useEffect(() => {
        fetch('/api/production-logs').then(r => r.json()).then(setLogs);
        fetch('/api/machines').then(r => r.json()).then(setMachines);
        fetch('/api/orders').then(r => r.json()).then(setOrders);
        fetch('/api/stock/yarn').then(r => r.json()).then(setYarnStock);
        fetch('/api/stock/fabric').then(r => r.json()).then(setFabricStock);
        fetch('/api/financeiro').then(r => r.json()).then(setFinanceData).catch(() => setFinanceData([]));
    }, []);

    // Eficiência por máquina
    const effByMachine = machines.map(m => {
        const machineLogs = logs.filter(l => l.maquinaId === m.id);
        const avgEff = machineLogs.length > 0 ? machineLogs.reduce((s, l) => s + (l.eficiencia || 0), 0) / machineLogs.length : 0;
        const totalProd = machineLogs.reduce((s, l) => s + (l.quantidadeProduzida || 0), 0);
        return { nome: m.nome, fabricante: m.fabricante, eficiencia: Number(avgEff.toFixed(1)), producaoTotal: totalProd, registros: machineLogs.length };
    });

    // Status das nitas
    const nitaStats = {
        total: orders.length,
        rascunho: orders.filter(o => o.status === 'rascunho').length,
        aprovada: orders.filter(o => o.status === 'aprovada').length,
        em_producao: orders.filter(o => o.status === 'em_producao').length,
        concluida: orders.filter(o => o.status === 'concluida').length,
        cancelada: orders.filter(o => o.status === 'cancelada').length,
    };

    const totalProducao = logs.reduce((s, l) => s + (l.quantidadeProduzida || 0), 0);
    const avgEff = logs.length > 0 ? logs.reduce((s, l) => s + (l.eficiencia || 0), 0) / logs.length : 0;

    // Estoque consolidado
    const totalFioKg = yarnStock.reduce((s, r) => s + (Number(r.quantidade) || 0), 0);
    const totalMalhaKg = fabricStock.reduce((s, r) => s + (Number(r.peso) || 0), 0);
    const totalItensEstoque = yarnStock.filter(r => r.fioNome || r.titulo).length + fabricStock.filter(r => r.malhaNome || r.tipo).length;

    // Consolidar fios por tipo
    const fioConsolidado = yarnStock.filter(r => r.fioNome || r.titulo).reduce((acc: any, r: any) => {
        const key = `${r.fioNome || r.titulo} | ${r.composicao || ''} | ${r.cor || ''}`;
        if (!acc[key]) acc[key] = { nome: r.fioNome || r.titulo, composicao: r.composicao || '', cor: r.cor || '', totalKg: 0, lotes: 0 };
        acc[key].totalKg += Number(r.quantidade) || 0;
        acc[key].lotes += 1;
        return acc;
    }, {} as Record<string, any>);

    // Consolidar malhas por tipo
    const malhaConsolidado = fabricStock.filter(r => r.malhaNome || r.tipo).reduce((acc: any, r: any) => {
        const key = `${r.malhaNome || r.tipo} | ${r.composicao || ''} | ${r.cor || ''}`;
        if (!acc[key]) acc[key] = { nome: r.malhaNome || r.tipo, composicao: r.composicao || '', cor: r.cor || '', totalKg: 0, rolos: 0 };
        acc[key].totalKg += Number(r.peso) || 0;
        acc[key].rolos += 1;
        return acc;
    }, {} as Record<string, any>);

    // Financeiro
    const totalPagar = financeData.filter(r => r.tipo === 'pagar' && r.status !== 'cancelado').reduce((s, r) => s + (Number(r.valor) || 0), 0);
    const totalReceber = financeData.filter(r => r.tipo === 'receber' && r.status !== 'cancelado').reduce((s, r) => s + (Number(r.valor) || 0), 0);
    const totalPago = financeData.filter(r => r.status === 'pago').reduce((s, r) => s + (Number(r.valor) || 0), 0);
    const totalVencido = financeData.filter(r => r.status === 'vencido').reduce((s, r) => s + (Number(r.valor) || 0), 0);

    const exportCSV = () => {
        let headers = '';
        let csvRows = '';

        if (activeReport === 'producao') {
            headers = 'Data,Nita,Máquina,Operador,Turno,Kg Produzido,Rolos,Eficiência,Parada(min)\n';
            csvRows = logs.map(l => `${l.data},${l.nitaNumero},${l.maquinaNome},${l.operador},${l.turno},${l.quantidadeProduzida},${l.numRolos},${l.eficiencia}%,${l.tempoParada}`).join('\n');
        } else if (activeReport === 'estoque') {
            headers = 'Categoria,Nome,Composição,Cor,Total (kg),Qtd Itens\n';
            const fioRows = Object.values(fioConsolidado).map((f: any) => `Fio,${f.nome},${f.composicao},${f.cor},${f.totalKg},${f.lotes}`);
            const malhaRows = Object.values(malhaConsolidado).map((m: any) => `Malha,${m.nome},${m.composicao},${m.cor},${m.totalKg},${m.rolos}`);
            csvRows = [...fioRows, ...malhaRows].join('\n');
        } else if (activeReport === 'financeiro') {
            headers = 'Descrição,Tipo,Valor,Vencimento,Pagamento,Status,Categoria,Entidade\n';
            csvRows = financeData.map(f => `${f.descricao},${f.tipo},${f.valor},${f.dataVencimento || ''},${f.dataPagamento || ''},${f.status},${f.categoria || ''},${f.entidade || ''}`).join('\n');
        }

        const blob = new Blob([headers + csvRows], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio-${activeReport}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <>
            <div className="page-header">
                <div><h1>📈 Relatórios</h1><p>Análise de produção, eficiência, estoque e financeiro</p></div>
                <button className="btn btn-primary" onClick={exportCSV}>📥 Exportar CSV</button>
            </div>

            <div className="tabs">
                <button className={`tab ${activeReport === 'producao' ? 'active' : ''}`} onClick={() => setActiveReport('producao')}>Produção</button>
                <button className={`tab ${activeReport === 'eficiencia' ? 'active' : ''}`} onClick={() => setActiveReport('eficiencia')}>Eficiência por Máquina</button>
                <button className={`tab ${activeReport === 'nitas' ? 'active' : ''}`} onClick={() => setActiveReport('nitas')}>Ordens de Produção</button>
                <button className={`tab ${activeReport === 'estoque' ? 'active' : ''}`} onClick={() => setActiveReport('estoque')}>Estoque</button>
                <button className={`tab ${activeReport === 'financeiro' ? 'active' : ''}`} onClick={() => setActiveReport('financeiro')}>Financeiro</button>
            </div>

            {activeReport === 'producao' && (
                <>
                    <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                        <div className="card"><div className="card-header"><span className="card-title">Produção Total</span></div><div className="card-value">{totalProducao.toLocaleString('pt-BR')} kg</div></div>
                        <div className="card"><div className="card-header"><span className="card-title">Eficiência Média</span></div><div className="card-value">{avgEff.toFixed(1)}%</div></div>
                        <div className="card"><div className="card-header"><span className="card-title">Registros</span></div><div className="card-value">{logs.length}</div></div>
                    </div>
                    <div className="table-container">
                        <div className="table-header"><h3>Registros de Produção</h3></div>
                        <table>
                            <thead><tr><th>Data</th><th>Nita</th><th>Máquina</th><th>Operador</th><th>Turno</th><th>Kg</th><th>Rolos</th><th>Eficiência</th></tr></thead>
                            <tbody>
                                {logs.map(l => (
                                    <tr key={l.id}>
                                        <td>{l.data ? new Date(l.data).toLocaleDateString('pt-BR') : '-'}</td><td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{l.nitaNumero}</td><td>{l.maquinaNome}</td><td>{l.operador}</td><td>{l.turno}</td><td style={{ fontWeight: 600 }}>{l.quantidadeProduzida}</td><td>{l.numRolos}</td>
                                        <td><span className={`badge ${l.eficiencia >= 90 ? 'badge-green' : l.eficiencia >= 87 ? 'badge-orange' : 'badge-red'}`}>{l.eficiencia}%</span></td>
                                    </tr>
                                ))}
                                {logs.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Nenhum dado de produção para gerar relatório</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeReport === 'eficiencia' && (
                <div className="table-container">
                    <div className="table-header"><h3>Eficiência por Máquina</h3></div>
                    <table>
                        <thead><tr><th>Máquina</th><th>Fabricante</th><th>Eficiência Média</th><th>Produção Total</th><th>Registros</th><th>Status</th></tr></thead>
                        <tbody>
                            {effByMachine.map(m => (
                                <tr key={m.nome}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.nome}</td><td>{m.fabricante}</td>
                                    <td>
                                        {m.registros > 0 ? (
                                            <span className={`badge ${m.eficiencia >= 90 ? 'badge-green' : m.eficiencia >= 87 ? 'badge-orange' : 'badge-red'}`}>{m.eficiencia}%</span>
                                        ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                    </td>
                                    <td>{m.producaoTotal > 0 ? `${m.producaoTotal} kg` : '—'}</td><td>{m.registros}</td>
                                    <td>
                                        <div className="progress-bar" style={{ width: '100px' }}>
                                            <div className={`progress-fill ${m.eficiencia >= 90 ? 'green' : m.eficiencia >= 87 ? 'orange' : m.eficiencia > 0 ? 'red' : 'blue'}`} style={{ width: `${m.eficiencia}%` }} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeReport === 'nitas' && (
                <>
                    <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                        <div className="card"><div className="card-header"><span className="card-title">Total de Nitas</span></div><div className="card-value">{nitaStats.total}</div></div>
                        <div className="card"><div className="card-header"><span className="card-title">Em Produção</span></div><div className="card-value" style={{ color: 'var(--accent-blue)' }}>{nitaStats.em_producao}</div></div>
                        <div className="card"><div className="card-header"><span className="card-title">Concluídas</span></div><div className="card-value" style={{ color: 'var(--accent-green)' }}>{nitaStats.concluida}</div></div>
                    </div>
                    <div className="chart-container">
                        <h3>Distribuição por Status</h3>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
                            {[{ label: 'Rascunho', value: nitaStats.rascunho, color: 'var(--accent-orange)' }, { label: 'Aprovada', value: nitaStats.aprovada, color: 'var(--accent-purple)' }, { label: 'Em Produção', value: nitaStats.em_producao, color: 'var(--accent-blue)' }, { label: 'Concluída', value: nitaStats.concluida, color: 'var(--accent-green)' }, { label: 'Cancelada', value: nitaStats.cancelada, color: 'var(--accent-red)' }].map(item => (
                                <div key={item.label} style={{ flex: 1, minWidth: '120px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '28px', fontWeight: 800, color: item.color }}>{item.value}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {activeReport === 'estoque' && (
                <>
                    <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                        <div className="card"><div className="card-header"><span className="card-title">🧵 Total de Fio</span></div><div className="card-value">{totalFioKg.toLocaleString('pt-BR')} kg</div></div>
                        <div className="card"><div className="card-header"><span className="card-title">🧶 Total de Malha</span></div><div className="card-value">{totalMalhaKg.toLocaleString('pt-BR')} kg</div></div>
                        <div className="card"><div className="card-header"><span className="card-title">📦 Total de Itens</span></div><div className="card-value">{totalItensEstoque}</div></div>
                        <div className="card"><div className="card-header"><span className="card-title">⚖️ Estoque Total</span></div><div className="card-value" style={{ color: 'var(--accent-green)' }}>{(totalFioKg + totalMalhaKg).toLocaleString('pt-BR')} kg</div></div>
                    </div>

                    <div className="table-container" style={{ marginBottom: '24px' }}>
                        <div className="table-header"><h3>🧵 Posição do Estoque de Fios</h3></div>
                        <table>
                            <thead><tr><th>Nome do Fio</th><th>Composição</th><th>Cor</th><th>Total (kg)</th><th>Nº Lotes</th></tr></thead>
                            <tbody>
                                {Object.values(fioConsolidado).map((f: any, i: number) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.nome}</td>
                                        <td>{f.composicao || '—'}</td>
                                        <td>{f.cor || '—'}</td>
                                        <td style={{ fontWeight: 600 }}>{f.totalKg.toLocaleString('pt-BR')} kg</td>
                                        <td>{f.lotes}</td>
                                    </tr>
                                ))}
                                {Object.keys(fioConsolidado).length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Nenhum fio em estoque</td></tr>}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-container">
                        <div className="table-header"><h3>🧶 Posição do Estoque de Malhas</h3></div>
                        <table>
                            <thead><tr><th>Nome da Malha</th><th>Composição</th><th>Cor</th><th>Total (kg)</th><th>Nº Rolos</th></tr></thead>
                            <tbody>
                                {Object.values(malhaConsolidado).map((m: any, i: number) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.nome}</td>
                                        <td>{m.composicao || '—'}</td>
                                        <td>{m.cor || '—'}</td>
                                        <td style={{ fontWeight: 600 }}>{m.totalKg.toLocaleString('pt-BR')} kg</td>
                                        <td>{m.rolos}</td>
                                    </tr>
                                ))}
                                {Object.keys(malhaConsolidado).length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Nenhuma malha em estoque</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeReport === 'financeiro' && (
                <>
                    <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                        <div className="card"><div className="card-header"><span className="card-title">💸 Total a Pagar</span></div><div className="card-value" style={{ color: 'var(--accent-red)' }}>R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>
                        <div className="card"><div className="card-header"><span className="card-title">💵 Total a Receber</span></div><div className="card-value" style={{ color: 'var(--accent-green)' }}>R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>
                        <div className="card"><div className="card-header"><span className="card-title">✅ Total Pago</span></div><div className="card-value">R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>
                        <div className="card"><div className="card-header"><span className="card-title">⚠️ Vencido</span></div><div className="card-value" style={{ color: 'var(--accent-red)' }}>R$ {totalVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>
                        <div className="card"><div className="card-header"><span className="card-title">📊 Saldo</span></div><div className="card-value" style={{ color: (totalReceber - totalPagar) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>R$ {(totalReceber - totalPagar).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>
                    </div>

                    <div className="table-container">
                        <div className="table-header"><h3>💰 Registros Financeiros</h3></div>
                        <table>
                            <thead><tr><th>Descrição</th><th>Tipo</th><th>Valor</th><th>Vencimento</th><th>Pagamento</th><th>Status</th><th>Categoria</th><th>Entidade</th></tr></thead>
                            <tbody>
                                {financeData.map(f => (
                                    <tr key={f.id}>
                                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{f.descricao}</td>
                                        <td><span className={`badge ${f.tipo === 'pagar' ? 'badge-red' : 'badge-green'}`}>{f.tipo === 'pagar' ? '💸 Pagar' : '💵 Receber'}</span></td>
                                        <td style={{ fontWeight: 600 }}>R$ {Number(f.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        <td>{f.dataVencimento ? new Date(f.dataVencimento).toLocaleDateString('pt-BR') : '—'}</td>
                                        <td>{f.dataPagamento ? new Date(f.dataPagamento).toLocaleDateString('pt-BR') : '—'}</td>
                                        <td><span className={`badge ${f.status === 'pago' ? 'badge-green' : f.status === 'vencido' ? 'badge-red' : f.status === 'cancelado' ? 'badge-red' : 'badge-orange'}`}>{f.status === 'pago' ? '✅ Pago' : f.status === 'vencido' ? '⚠️ Vencido' : f.status === 'cancelado' ? '❌ Cancelado' : '⏳ Pendente'}</span></td>
                                        <td>{f.categoria || '—'}</td>
                                        <td>{f.entidade || '—'}</td>
                                    </tr>
                                ))}
                                {financeData.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Nenhum registro financeiro. Adicione contas na página Financeiro.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </>
    );
}
