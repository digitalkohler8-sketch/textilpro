// ===== MÁQUINAS =====
export interface Machine {
    id: string;
    nome: string;
    fabricante: string;
    modelo: string;
    diametro: number;
    gauge: number;
    alimentadores: number;
    rpmNominal: number;
    tipoMalha: string;
    status: 'ativa' | 'manutencao' | 'parada';
    criadoEm: string;
}

// ===== FIOS =====
export interface Yarn {
    id: string;
    titulo: string;
    composicao: string;
    cor: string;
    fornecedor: string;
    precoPorKg: number;
    estoqueMinimo: number;
    criadoEm: string;
}

// ===== ESTOQUE DE FIO =====
export interface YarnStock {
    id: string;
    fioId: string;
    lote: string;
    quantidade: number; // kg
    localizacao: string;
    dataEntrada: string;
    fornecedor: string;
    notaFiscal: string;
    criadoEm: string;
}

// ===== MALHAS =====
export interface Fabric {
    id: string;
    tipo: string;
    composicao: string;
    gramatura: number;
    largura: number;
    rendimento: number;
    criadoEm: string;
}

// ===== ESTOQUE DE MALHA =====
export interface FabricStock {
    id: string;
    malhaId: string;
    rolo: string;
    peso: number; // kg
    metragem: number;
    cor: string;
    lote: string;
    dataEntrada: string;
    criadoEm: string;
}

// ===== MOVIMENTAÇÕES =====
export interface StockMovement {
    id: string;
    tipo: 'entrada' | 'saida' | 'ajuste';
    categoria: 'fio' | 'malha';
    itemId: string;
    itemNome: string;
    quantidade: number;
    motivo: string;
    documento: string;
    usuario: string;
    criadoEm: string;
}

// ===== FICHA TÉCNICA =====
export interface TechSheet {
    id: string;
    nome: string;
    tipoMalha: string;
    maquinaId: string;
    maquinaNome: string;
    diametro: number;
    gauge: number;
    alimentadores: number;
    rpm: number;
    tituloFio: string;
    composicaoFio: string;
    gramatura: number;
    largura: number;
    comprimentoPonto: number;
    producaoTeorica: number; // kg/h
    observacoes: string;
    criadoEm: string;
}

// ===== NITA / ORDEM DE PRODUÇÃO =====
export interface ProductionOrder {
    id: string;
    numero: string;
    clienteId: string;
    clienteNome: string;
    fichaTecnicaId: string;
    fichaTecnicaNome: string;
    maquinaId: string;
    maquinaNome: string;
    fioId: string;
    fioNome: string;
    quantidadeSolicitada: number; // kg
    quantidadeProduzida: number;
    status: 'rascunho' | 'aprovada' | 'em_producao' | 'concluida' | 'cancelada';
    dataEntrega: string;
    observacoes: string;
    criadoEm: string;
    atualizadoEm: string;
}

// ===== REGISTRO DE PRODUÇÃO =====
export interface ProductionLog {
    id: string;
    nitaId: string;
    nitaNumero: string;
    maquinaId: string;
    maquinaNome: string;
    operador: string;
    turno: 'manha' | 'tarde' | 'noite';
    quantidadeProduzida: number;
    numRolos: number;
    tempoProducao: number; // horas
    tempoParada: number; // minutos
    motivoParada: string;
    eficiencia: number; // %
    data: string;
    criadoEm: string;
}

// ===== STATUS DA MÁQUINA (AO VIVO) =====
export interface MachineStatus {
    id: string;
    maquinaId: string;
    maquinaNome: string;
    fabricante: string;
    nitaAtual: string;
    rpmAtual: number;
    rpmNominal: number;
    producaoAcumulada: number;
    metaProducao: number;
    eficiencia: number;
    status: 'produzindo' | 'parada' | 'manutencao';
    ultimaAtualizacao: string;
}

// ===== CLIENTES =====
export interface Customer {
    id: string;
    nome: string;
    cnpj: string;
    email: string;
    telefone: string;
    cidade: string;
    estado: string;
    endereco: string;
    categoria: 'A' | 'B' | 'C';
    criadoEm: string;
}

// ===== FORNECEDORES =====
export interface Supplier {
    id: string;
    nome: string;
    cnpj: string;
    email: string;
    telefone: string;
    cidade: string;
    estado: string;
    tipo: string;
    criadoEm: string;
}

// ===== NOTA FISCAL =====
export interface Invoice {
    id: string;
    numero: string;
    clienteId: string;
    clienteNome: string;
    clienteCnpj: string;
    tipo: 'saida' | 'entrada';
    status: 'rascunho' | 'emitida' | 'cancelada';
    valorTotal: number;
    itens: InvoiceItem[];
    dataEmissao: string;
    observacoes: string;
    criadoEm: string;
}

export interface InvoiceItem {
    id: string;
    descricao: string;
    quantidade: number;
    unidade: string;
    valorUnitario: number;
    valorTotal: number;
}

// ===== CRM =====
export interface CRMDeal {
    id: string;
    titulo: string;
    clienteId: string;
    clienteNome: string;
    valor: number;
    etapa: 'prospecto' | 'contato' | 'proposta' | 'negociacao' | 'fechado_ganho' | 'fechado_perdido';
    probabilidade: number;
    responsavel: string;
    dataPrevisao: string;
    observacoes: string;
    criadoEm: string;
    atualizadoEm: string;
}

export interface CRMActivity {
    id: string;
    dealId: string;
    tipo: 'ligacao' | 'email' | 'reuniao' | 'visita' | 'outro';
    descricao: string;
    data: string;
    concluida: boolean;
    criadoEm: string;
}
