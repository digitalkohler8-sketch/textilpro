import { NextResponse } from 'next/server';
import { getAll, create, update, remove, generateId } from '@/lib/db';

const COLLECTION = 'maintenances';

export async function GET() {
    const items = getAll(COLLECTION);
    return NextResponse.json(items);
}

export async function POST(request: Request) {
    const body = await request.json();
    const item = create(COLLECTION, {
        id: generateId(),
        ...body,
        criadoEm: new Date().toISOString(),
    });
    return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: Request) {
    const body = await request.json();
    const { id, ...data } = body;
    const item = update(COLLECTION, id, data);
    return NextResponse.json(item);
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) { remove(COLLECTION, id); }
    return NextResponse.json({ ok: true });
}
