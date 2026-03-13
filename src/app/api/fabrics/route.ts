import { NextRequest, NextResponse } from 'next/server';
import { getAll, create, update, remove, generateId } from '@/lib/db';

export async function GET() {
    return NextResponse.json(getAll('fabrics'));
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const fabric = { id: generateId(), ...body, criadoEm: new Date().toISOString() };
    create('fabrics', fabric);
    return NextResponse.json(fabric, { status: 201 });
}

export async function PUT(request: NextRequest) {
    const body = await request.json();
    const { id, ...data } = body;
    const updated = update('fabrics', id, data);
    if (!updated) return NextResponse.json({ error: 'Malha não encontrada' }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
    remove('fabrics', id);
    return NextResponse.json({ success: true });
}
