import { NextRequest, NextResponse } from 'next/server';
import { getAll, create, generateId } from '@/lib/db';

export async function GET() {
    return NextResponse.json(getAll('production_logs'));
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const log = { id: generateId(), ...body, criadoEm: new Date().toISOString() };
    create('production_logs', log);
    return NextResponse.json(log, { status: 201 });
}
