import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');

function ensureDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function getFilePath(collection: string): string {
  ensureDir();
  const filePath = path.join(DB_DIR, `${collection}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf-8');
  }
  return filePath;
}

export function getAll<T>(collection: string): T[] {
  const filePath = getFilePath(collection);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T[];
}

export function getById<T extends { id: string }>(collection: string, id: string): T | null {
  const items = getAll<T>(collection);
  return items.find(item => item.id === id) || null;
}

export function create<T extends { id: string }>(collection: string, item: T): T {
  const items = getAll<T>(collection);
  items.push(item);
  const filePath = getFilePath(collection);
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');
  return item;
}

export function update<T extends { id: string }>(collection: string, id: string, data: Partial<T>): T | null {
  const items = getAll<T>(collection);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...data };
  const filePath = getFilePath(collection);
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');
  return items[index];
}

export function remove(collection: string, id: string): boolean {
  const items = getAll<{ id: string }>(collection);
  const filtered = items.filter(item => item.id !== id);
  if (filtered.length === items.length) return false;
  const filePath = getFilePath(collection);
  fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf-8');
  return true;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Seed initial data if empty
export function seedIfEmpty() {
  const machines = getAll('machines');
  if (machines.length === 0) {
    const initialMachines = [
      { id: generateId(), nome: 'Tear 01', fabricante: 'Mayer & Cie', modelo: 'OVJA 1.6 E', diametro: 30, gauge: 28, alimentadores: 90, rpmNominal: 26, tipoMalha: 'Jersey Simples', status: 'ativa', criadoEm: new Date().toISOString() },
      { id: generateId(), nome: 'Tear 02', fabricante: 'Orizio', modelo: 'JBSG', diametro: 34, gauge: 24, alimentadores: 96, rpmNominal: 24, tipoMalha: 'Rib', status: 'ativa', criadoEm: new Date().toISOString() },
      { id: generateId(), nome: 'Tear 03', fabricante: 'Mayer & Cie', modelo: 'OVJA 2.4 EM', diametro: 26, gauge: 20, alimentadores: 72, rpmNominal: 28, tipoMalha: 'Interlock', status: 'manutencao', criadoEm: new Date().toISOString() },
      { id: generateId(), nome: 'Tear 04', fabricante: 'Groz-Beckert', modelo: 'litespeed', diametro: 30, gauge: 28, alimentadores: 84, rpmNominal: 30, tipoMalha: 'Jersey Simples', status: 'ativa', criadoEm: new Date().toISOString() },
      { id: generateId(), nome: 'Tear 05', fabricante: 'Mayer & Cie', modelo: 'Relanit 3.2 HS', diametro: 32, gauge: 24, alimentadores: 108, rpmNominal: 22, tipoMalha: 'Piquet', status: 'ativa', criadoEm: new Date().toISOString() },
      { id: generateId(), nome: 'Tear 06', fabricante: 'Orizio', modelo: 'JBSN', diametro: 28, gauge: 28, alimentadores: 78, rpmNominal: 25, tipoMalha: 'Jersey Simples', status: 'parada', criadoEm: new Date().toISOString() },
    ];
    const filePath = getFilePath('machines');
    fs.writeFileSync(filePath, JSON.stringify(initialMachines, null, 2), 'utf-8');
  }

  const yarns = getAll('yarns');
  if (yarns.length === 0) {
    const initialYarns = [
      { id: generateId(), titulo: '30/1', composicao: '100% Algodão', cor: 'Branco', fornecedor: 'Coteminas', precoPorKg: 28.50, estoqueMinimo: 500, criadoEm: new Date().toISOString() },
      { id: generateId(), titulo: '24/1', composicao: '100% Algodão', cor: 'Preto', fornecedor: 'Paramount', precoPorKg: 32.00, estoqueMinimo: 300, criadoEm: new Date().toISOString() },
      { id: generateId(), titulo: '40/1', composicao: '100% Algodão Penteado', cor: 'Cru', fornecedor: 'Dalila', precoPorKg: 38.90, estoqueMinimo: 400, criadoEm: new Date().toISOString() },
      { id: generateId(), titulo: '28/1', composicao: '50% Algodão 50% Poliéster', cor: 'Mescla', fornecedor: 'Coteminas', precoPorKg: 25.80, estoqueMinimo: 600, criadoEm: new Date().toISOString() },
      { id: generateId(), titulo: '150D', composicao: '100% Poliéster', cor: 'Diversas', fornecedor: 'Unifi', precoPorKg: 22.00, estoqueMinimo: 400, criadoEm: new Date().toISOString() },
    ];
    const fp = getFilePath('yarns');
    fs.writeFileSync(fp, JSON.stringify(initialYarns, null, 2), 'utf-8');
  }

  const customers = getAll('customers');
  if (customers.length === 0) {
    const initialCustomers = [
      { id: generateId(), nome: 'Confecções Silva Ltda', cnpj: '12.345.678/0001-90', email: 'contato@silva.com', telefone: '(47) 3333-1111', cidade: 'Brusque', estado: 'SC', endereco: 'Rua das Indústrias, 100', categoria: 'A', criadoEm: new Date().toISOString() },
      { id: generateId(), nome: 'Malhas Brasil S.A.', cnpj: '98.765.432/0001-10', email: 'compras@malhasbrasil.com', telefone: '(11) 4444-2222', cidade: 'São Paulo', estado: 'SP', endereco: 'Av. Comercial, 500', categoria: 'A', criadoEm: new Date().toISOString() },
      { id: generateId(), nome: 'Têxtil Norte ME', cnpj: '11.222.333/0001-44', email: 'norte@textil.com', telefone: '(85) 5555-3333', cidade: 'Fortaleza', estado: 'CE', endereco: 'Rua da Malha, 200', categoria: 'B', criadoEm: new Date().toISOString() },
      { id: generateId(), nome: 'Vestuário Premium Ltda', cnpj: '44.555.666/0001-77', email: 'premium@vest.com', telefone: '(47) 6666-4444', cidade: 'Blumenau', estado: 'SC', endereco: 'Rua Textil, 80', categoria: 'B', criadoEm: new Date().toISOString() },
    ];
    const fp = getFilePath('customers');
    fs.writeFileSync(fp, JSON.stringify(initialCustomers, null, 2), 'utf-8');
  }

  const suppliers = getAll('suppliers');
  if (suppliers.length === 0) {
    const initialSuppliers = [
      { id: generateId(), nome: 'Coteminas S.A.', cnpj: '33.444.555/0001-00', email: 'vendas@coteminas.com', telefone: '(31) 1111-0000', cidade: 'Montes Claros', estado: 'MG', tipo: 'Fio', criadoEm: new Date().toISOString() },
      { id: generateId(), nome: 'Paramount Têxteis', cnpj: '55.666.777/0001-22', email: 'comercial@paramount.com', telefone: '(11) 2222-1111', cidade: 'São Paulo', estado: 'SP', tipo: 'Fio', criadoEm: new Date().toISOString() },
      { id: generateId(), nome: 'Agulhas Groz-Beckert', cnpj: '77.888.999/0001-33', email: 'brasil@groz-beckert.com', telefone: '(47) 3333-2222', cidade: 'Blumenau', estado: 'SC', tipo: 'Peças', criadoEm: new Date().toISOString() },
    ];
    const fp = getFilePath('suppliers');
    fs.writeFileSync(fp, JSON.stringify(initialSuppliers, null, 2), 'utf-8');
  }
}
