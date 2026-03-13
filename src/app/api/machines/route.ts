import { NextRequest, NextResponse } from 'next/server';
import { getAll, create, update, remove, generateId, seedIfEmpty } from '@/lib/db';

export async function GET() {
    seedIfEmpty();
    const machines = getAll('machines');
    return NextResponse.json(machines);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const machine = {
        id: generateId(),
        ...body,
        criadoEm: new Date().toISOString(),
    };
    create('machines', machine);
    return NextResponse.json(machine, { status: 201 });
}

export async function PUT(request: NextRequest) {
    const body = await request.json();
    const { id, ...data } = body;
    const updated = update('machines', id, data);
    if (!updated) return NextResponse.json({ error: 'Máquina não encontrada' }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
    const removed = remove('machines', id);
    if (!removed) return NextResponse.json({ error: 'Máquina não encontrada' }, { status: 404 });
    return NextResponse.json({ success: true });
}
