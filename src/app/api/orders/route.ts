import { NextRequest, NextResponse } from 'next/server';
import { getAll, create, update, remove, generateId, seedIfEmpty } from '@/lib/db';

export async function GET() {
    seedIfEmpty();
    const orders = getAll('orders');
    return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const orders = getAll<any>('orders');
    const numero = `NITA-${String(orders.length + 1).padStart(3, '0')}`;
    const order = {
        id: generateId(),
        numero,
        ...body,
        quantidadeProduzida: 0,
        status: body.status || 'rascunho',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
    };
    create('orders', order);
    return NextResponse.json(order, { status: 201 });
}

export async function PUT(request: NextRequest) {
    const body = await request.json();
    const { id, ...data } = body;
    data.atualizadoEm = new Date().toISOString();
    const updated = update('orders', id, data);
    if (!updated) return NextResponse.json({ error: 'Nita não encontrada' }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
    remove('orders', id);
    return NextResponse.json({ success: true });
}
