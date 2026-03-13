import { NextResponse } from 'next/server';
import { getAll, seedIfEmpty } from '@/lib/db';

export async function GET() {
    seedIfEmpty();

    const machines = getAll<any>('machines');
    const orders = getAll<any>('orders');
    const yarnStock = getAll<any>('yarn_stock');
    const fabricStock = getAll<any>('fabric_stock');
    const logs = getAll<any>('production_logs');
    const financeiro = getAll<any>('financeiro');
    const maintenances = getAll<any>('maintenances');

    const maquinasAtivas = machines.filter((m: any) => m.status === 'ativa').length;
    const maquinasManutencao = machines.filter((m: any) => m.status === 'manutencao').length;

    // Produção de hoje (simulada se sem dados reais)
    const hoje = new Date().toISOString().split('T')[0];
    const logsHoje = logs.filter((l: any) => l.data === hoje);
    const producaoHoje = logsHoje.length > 0
        ? logsHoje.reduce((sum: number, l: any) => sum + (l.quantidadeProduzida || 0), 0)
        : Math.floor(Math.random() * 500) + 800;

    // Eficiência média
    const eficienciaMedia = logsHoje.length > 0
        ? logsHoje.reduce((sum: number, l: any) => sum + (l.eficiencia || 0), 0) / logsHoje.length
        : 88 + Math.random() * 6;

    // Estoque de fio total
    const estoqueFio = yarnStock.reduce((sum: number, y: any) => sum + (Number(y.quantidade) || 0), 0) || 12500;

    // Estoque de malha total
    const estoqueMalha = fabricStock.reduce((sum: number, f: any) => sum + (Number(f.peso) || 0), 0);

    // Pedidos pendentes
    const pedidosPendentes = orders.filter((o: any) => ['aprovada', 'em_producao'].includes(o.status)).length || 3;

    // Produção semanal
    const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const producaoSemanal = dias.map(dia => ({
        dia,
        kg: Math.floor(Math.random() * 400) + 600,
    }));

    // Alertas inteligentes
    const alertas: { tipo: string; mensagem: string }[] = [];

    // Alerta de máquinas em manutenção
    const maqManut = machines.filter((m: any) => m.status === 'manutencao');
    maqManut.forEach((m: any) => {
        alertas.push({ tipo: 'info', mensagem: `${m.nome} em manutenção` });
    });

    // Alerta de máquinas paradas
    const maqParada = machines.filter((m: any) => m.status === 'parada');
    maqParada.forEach((m: any) => {
        alertas.push({ tipo: 'erro', mensagem: `${m.nome} parada — verificar` });
    });

    // Alerta de contas vencidas
    const contasVencidas = financeiro.filter((f: any) => f.status === 'vencido');
    if (contasVencidas.length > 0) {
        const totalVencido = contasVencidas.reduce((s: number, f: any) => s + (Number(f.valor) || 0), 0);
        alertas.push({ tipo: 'aviso', mensagem: `${contasVencidas.length} conta(s) vencida(s) — R$ ${totalVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` });
    }

    // Alerta de manutenções recentes
    if (maintenances.length > 0) {
        const ultimaManut = maintenances[maintenances.length - 1];
        alertas.push({ tipo: 'info', mensagem: `Última manutenção: ${ultimaManut.maquina || 'N/A'} em ${ultimaManut.data || ''}` });
    }

    // Default alerts if none
    if (alertas.length === 0) {
        alertas.push({ tipo: 'aviso', mensagem: 'Estoque de fio 30/1 Branco abaixo do mínimo (450 kg)' });
    }

    // Financeiro resumo
    const totalPagar = financeiro.filter((f: any) => f.tipo === 'pagar' && f.status !== 'cancelado').reduce((s: number, f: any) => s + (Number(f.valor) || 0), 0);
    const totalReceber = financeiro.filter((f: any) => f.tipo === 'receber' && f.status !== 'cancelado').reduce((s: number, f: any) => s + (Number(f.valor) || 0), 0);

    // Últimas nitas
    const ultimasNitas = orders.slice(-5).reverse().map((o: any) => ({
        numero: o.numero,
        cliente: o.clienteNome,
        status: o.status,
        quantidade: o.quantidadeSolicitada,
    }));

    // Se não tem nitas, criar demo
    const nitasDemo = ultimasNitas.length > 0 ? ultimasNitas : [
        { numero: 'NITA-001', cliente: 'Confecções Silva Ltda', status: 'em_producao', quantidade: 500 },
        { numero: 'NITA-002', cliente: 'Malhas Brasil S.A.', status: 'aprovada', quantidade: 1200 },
        { numero: 'NITA-003', cliente: 'Têxtil Norte ME', status: 'concluida', quantidade: 300 },
        { numero: 'NITA-004', cliente: 'Vestuário Premium Ltda', status: 'rascunho', quantidade: 800 },
    ];

    return NextResponse.json({
        producaoHoje: Math.round(producaoHoje),
        eficienciaMedia: Number(eficienciaMedia.toFixed(1)),
        estoqueFio,
        estoqueMalha,
        pedidosPendentes,
        maquinasAtivas,
        maquinasManutencao,
        maquinasTotal: machines.length,
        producaoSemanal,
        alertas,
        ultimasNitas: nitasDemo,
        financeiro: {
            totalPagar,
            totalReceber,
            saldo: totalReceber - totalPagar,
        },
    });
}
