import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@ultimate/database';
import { requireGuildAdmin } from '@/lib/guildAuth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!(await requireGuildAdmin(guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const logs = await prisma.moderationLog.findMany({
    where: { guildId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ logs });
}
