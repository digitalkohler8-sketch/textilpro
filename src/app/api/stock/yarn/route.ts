import { NextRequest, NextResponse } from 'next/server';
import { getAll, create, update, remove, generateId } from '@/lib/db';

export async function GET() {
    return NextResponse.json(getAll('yarn_stock'));
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const entry = { id: generateId(), ...body, criadoEm: new Date().toISOString() };
    create('yarn_stock', entry);
    // Register stock movement
    create('stock_movements', {
        id: generateId(),
        tipo: body.tipo || 'entrada',
        categoria: 'fio',
        itemId: body.fioId || entry.id,
        itemNome: body.fioNome || body.titulo || '',
        quantidade: body.quantidade,
        motivo: 'Entrada de estoque',
        documento: body.notaFiscal || '',
        usuario: 'Admin',
        criadoEm: new Date().toISOString(),
    });
    return NextResponse.json(entry, { status: 201 });
}

export async function PUT(request: NextRequest) {
    const body = await request.json();
    const { id, ...data } = body;
    const item = update('yarn_stock', id, data);
    return NextResponse.json(item);
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) { remove('yarn_stock', id); }
    return NextResponse.json({ ok: true });
}
