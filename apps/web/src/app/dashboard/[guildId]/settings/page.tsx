'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function SettingsPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [prefix, setPrefix] = useState('!');
  const [welcomeChannel, setWelcomeChannel] = useState('');
  const [logChannel, setLogChannel] = useState('');
  const [autoModEnabled, setAutoModEnabled] = useState(false);
  const [bannedWords, setBannedWords] = useState('');
  const [maxMentions, setMaxMentions] = useState(5);
  const [autoModLogChannel, setAutoModLogChannel] = useState('');
  const [aiModerationEnabled, setAiModerationEnabled] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/guild/${guildId}/settings`)
      .then((r) => r.json())
      .then((data) => {
        setPrefix(data.prefix);
        setWelcomeChannel(data.welcomeChannel);
        setLogChannel(data.logChannel);
        setAutoModEnabled(data.autoMod.enabled);
        setBannedWords(data.autoMod.bannedWords);
        setMaxMentions(data.autoMod.maxMentions);
        setAutoModLogChannel(data.autoMod.logChannelId);
        setAiModerationEnabled(data.autoMod.aiModerationEnabled);
        setLoading(false);
      });
  }, [guildId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const res = await fetch(`/api/guild/${guildId}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prefix,
        welcomeChannel,
        logChannel,
        autoMod: { enabled: autoModEnabled, bannedWords, maxMentions, logChannelId: autoModLogChannel, aiModerationEnabled },
      }),
    });
    setStatus(res.ok ? 'Saved.' : 'Failed to save.');
  }

  if (loading) return <p className="text-gray-400">Loading...</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Server Settings</h1>
      <form onSubmit={save} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">General</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Command prefix (legacy)</label>
              <input
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Welcome channel ID</label>
              <input
                value={welcomeChannel}
                onChange={(e) => setWelcomeChannel(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2"
                placeholder="Channel ID"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">General log channel ID</label>
              <input
                value={logChannel}
                onChange={(e) => setLogChannel(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2"
                placeholder="Channel ID"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Auto-moderation</h2>
          <div className="space-y-3">
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={autoModEnabled} onChange={(e) => setAutoModEnabled(e.target.checked)} />
              Enabled
            </label>
            <div>
              <label className="block text-sm mb-1">Banned words (comma-separated)</label>
              <input
                value={bannedWords}
                onChange={(e) => setBannedWords(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Max mentions per message</label>
              <input
                type="number"
                min={1}
                value={maxMentions}
                onChange={(e) => setMaxMentions(Number(e.target.value))}
                className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Auto-mod log channel ID</label>
              <input
                value={autoModLogChannel}
                onChange={(e) => setAutoModLogChannel(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2"
                placeholder="Channel ID"
              />
            </div>
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={aiModerationEnabled} onChange={(e) => setAiModerationEnabled(e.target.checked)} />
              Also classify messages with the configured AI provider (catches things keyword/mention rules miss; requires AI Configuration to be set up first, and sends message text to your chosen provider)
            </label>
          </div>
        </div>

        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md font-medium text-sm">
          Save settings
        </button>
        {status && <p className="text-sm text-gray-400">{status}</p>}
      </form>
    </div>
  );
}
