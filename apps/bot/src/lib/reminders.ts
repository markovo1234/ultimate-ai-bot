import { ChannelType, type Client } from 'discord.js';
import { prisma } from '@ultimate/database';

const POLL_INTERVAL_MS = 30 * 1000;

export function startReminderLoop(client: Client) {
  setInterval(async () => {
    try {
      const due = await prisma.reminder.findMany({ where: { remindAt: { lte: new Date() } }, take: 50 });
      for (const reminder of due) {
        // Delete before sending so a slow/failed send can't cause a duplicate on the next tick
        await prisma.reminder.delete({ where: { id: reminder.id } }).catch(() => {});

        const channel = await client.channels.fetch(reminder.channelId).catch(() => null);
        // Exclude PartialGroupDMChannel - it's technically "text based" in discord.js's
        // types but has no send() (bots can't be in group DMs, this is unreachable at
        // runtime since reminders are only ever created from a guild channel, but the
        // type checker doesn't know that).
        if (channel?.isTextBased() && channel.type !== ChannelType.GroupDM) {
          await channel.send(`⏰ <@${reminder.userId}> reminder: ${reminder.message}`).catch(() => {});
        }
      }
    } catch (error) {
      console.error('Reminder loop error:', error);
    }
  }, POLL_INTERVAL_MS);
}
