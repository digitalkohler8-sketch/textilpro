import { NextRequest, NextResponse } from 'next/server';
import { getAll, create, update, remove, generateId } from '@/lib/db';

const COLLECTION = 'stock_movements';

export async function GET() {
    return NextResponse.json(getAll(COLLECTION));
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const item = {
        id: generateId(),
        ...body,
        criadoEm: new Date().toISOString(),
    };
    create(COLLECTION, item);
    return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
    const body = await request.json();
    const { id, ...data } = body;
    const updated = update(COLLECTION, id, data);
    if (!updated) return NextResponse.json({ error: 'Movimentação não encontrada' }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
    remove(COLLECTION, id);
    return NextResponse.json({ success: true });
}
