import { NextRequest, NextResponse } from 'next/server';
import { getAll, create, update, remove, generateId } from '@/lib/db';

export async function GET() {
    return NextResponse.json(getAll('deals'));
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const deal = {
        id: generateId(),
        ...body,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
    };
    create('deals', deal);
    return NextResponse.json(deal, { status: 201 });
}

export async function PUT(request: NextRequest) {
    const body = await request.json();
    const { id, ...data } = body;
    data.atualizadoEm = new Date().toISOString();
    const updated = update('deals', id, data);
    if (!updated) return NextResponse.json({ error: 'Deal não encontrado' }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
    remove('deals', id);
    return NextResponse.json({ success: true });
}
