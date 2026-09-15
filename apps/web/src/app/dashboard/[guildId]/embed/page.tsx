'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function EmbedBuilderPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#5865F2');
  const [footer, setFooter] = useState('');
  const [channelId, setChannelId] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function send() {
    setSending(true);
    setStatus(null);
    const embed = {
      title: title || undefined,
      description: description || undefined,
      color: parseInt(color.replace('#', ''), 16),
      footer: footer ? { text: footer } : undefined,
    };

    const res = await fetch(`/api/guild/${guildId}/embed/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId, embed }),
    });
    setSending(false);
    const data = await res.json().catch(() => ({}));
    setStatus(res.ok ? 'Sent!' : (data.error ?? 'Failed to send.'));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold mb-6">Embed Builder</h1>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-20 bg-gray-900 border border-gray-800 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Footer</label>
            <input value={footer} onChange={(e) => setFooter(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Channel ID</label>
            <input
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="Right-click a channel in Discord -> Copy Channel ID"
              className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2"
            />
          </div>
          <button
            onClick={send}
            disabled={sending || !channelId}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 rounded-md font-medium text-sm"
          >
            {sending ? 'Sending...' : 'Send to channel'}
          </button>
          {status && <p className="text-sm text-gray-400">{status}</p>}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Preview</h2>
        <div className="bg-gray-900 rounded-md p-4 border-l-4" style={{ borderLeftColor: color }}>
          {title && <p className="font-semibold mb-1">{title}</p>}
          {description && <p className="text-sm text-gray-300 whitespace-pre-wrap">{description}</p>}
          {footer && <p className="text-xs text-gray-500 mt-3">{footer}</p>}
          {!title && !description && !footer && <p className="text-sm text-gray-600">Nothing to preview yet.</p>}
        </div>
      </div>
    </div>
  );
}
