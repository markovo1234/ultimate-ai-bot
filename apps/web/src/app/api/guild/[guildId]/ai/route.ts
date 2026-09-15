import { NextRequest, NextResponse } from 'next/server';
import { prisma, encrypt } from '@ultimate/database';
import { requireGuildAdmin } from '@/lib/guildAuth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!(await requireGuildAdmin(guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const config = await prisma.aIConfig.findUnique({ where: { guildId } });
  return NextResponse.json({ configured: !!config, provider: config?.provider ?? null });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!(await requireGuildAdmin(guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { provider, apiKey } = body as { provider?: string; apiKey?: string };

  if (!provider || !['openai', 'anthropic', 'gemini'].includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }
  if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 8) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 400 });
  }

  await prisma.guildSettings.upsert({ where: { id: guildId }, create: { id: guildId }, update: {} });
  await prisma.aIConfig.upsert({
    where: { guildId },
    create: { guildId, provider, encryptedKey: encrypt(apiKey) },
    update: { provider, encryptedKey: encrypt(apiKey) },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!(await requireGuildAdmin(guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await prisma.aIConfig.delete({ where: { guildId } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
