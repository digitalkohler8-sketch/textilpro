import { NextRequest, NextResponse } from 'next/server';
import { getAll, create, update, generateId } from '@/lib/db';

export async function GET() {
    return NextResponse.json(getAll('activities'));
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const activity = { id: generateId(), ...body, concluida: false, criadoEm: new Date().toISOString() };
    create('activities', activity);
    return NextResponse.json(activity, { status: 201 });
}

export async function PUT(request: NextRequest) {
    const body = await request.json();
    const { id, ...data } = body;
    const updated = update('activities', id, data);
    if (!updated) return NextResponse.json({ error: 'Atividade não encontrada' }, { status: 404 });
    return NextResponse.json(updated);
}
