import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@ultimate/database';
import { getSession, requireGuildAdmin } from '@/lib/guildAuth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ guildId: string; appId: string }> }) {
  const { guildId, appId } = await params;
  if (!(await requireGuildAdmin(guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { status } = body as { status?: string };
  if (!status || !['ACCEPTED', 'DENIED', 'PENDING'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const session = await getSession();
  const updated = await prisma.applicationForm.updateMany({
    where: { id: appId, guildId },
    data: { status, reviewerId: session?.user?.id },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
