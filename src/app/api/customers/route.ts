import { NextRequest, NextResponse } from 'next/server';
import { getAll, create, update, remove, generateId, seedIfEmpty } from '@/lib/db';

export async function GET() {
    seedIfEmpty();
    return NextResponse.json(getAll('customers'));
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const customer = { id: generateId(), ...body, criadoEm: new Date().toISOString() };
    create('customers', customer);
    return NextResponse.json(customer, { status: 201 });
}

export async function PUT(request: NextRequest) {
    const body = await request.json();
    const { id, ...data } = body;
    const updated = update('customers', id, data);
    if (!updated) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
    remove('customers', id);
    return NextResponse.json({ success: true });
}
