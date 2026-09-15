import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@ultimate/database';
import { requireGuildAdmin } from '@/lib/guildAuth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!(await requireGuildAdmin(guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const questions = await prisma.applicationQuestion.findMany({ where: { guildId }, orderBy: { order: 'asc' } });
  return NextResponse.json({ questions });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!(await requireGuildAdmin(guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const count = await prisma.applicationQuestion.count({ where: { guildId } });
  if (count >= 5) {
    return NextResponse.json({ error: 'Discord modals support at most 5 questions' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const { label, style, required } = body as { label?: string; style?: string; required?: boolean };
  if (!label || typeof label !== 'string') {
    return NextResponse.json({ error: 'label is required' }, { status: 400 });
  }

  await prisma.guildSettings.upsert({ where: { id: guildId }, create: { id: guildId }, update: {} });
  const question = await prisma.applicationQuestion.create({
    data: {
      guildId,
      label: label.slice(0, 45),
      style: style === 'PARAGRAPH' ? 'PARAGRAPH' : 'SHORT',
      required: required ?? true,
      order: count,
    },
  });

  return NextResponse.json({ question });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!(await requireGuildAdmin(guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  await prisma.applicationQuestion.deleteMany({ where: { id, guildId } });
  return NextResponse.json({ ok: true });
}
