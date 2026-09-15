'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function AIConfigPage() {
  const { guildId } = useParams<{ guildId: string }>();

  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/guild/${guildId}/ai`)
      .then((r) => r.json())
      .then((data) => {
        setConfigured(data.configured);
        if (data.provider) setProvider(data.provider);
      });
  }, [guildId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const res = await fetch(`/api/guild/${guildId}/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey }),
    });
    setLoading(false);
    if (res.ok) {
      setStatus('Saved. The key is encrypted at rest and never shown again.');
      setConfigured(true);
      setApiKey('');
    } else {
      const data = await res.json().catch(() => ({}));
      setStatus(data.error ?? 'Failed to save.');
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-2">AI Configuration</h1>
      <p className="text-gray-400 mb-6">
        {configured === null ? 'Loading...' : configured ? 'An AI key is currently configured for this server.' : 'No AI key configured yet.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="gemini">Google Gemini</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            required
            minLength={8}
            className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">Encrypted with AES-256 before it touches the database. Never displayed again after saving.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 rounded-md font-medium"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>

        {status && <p className="text-sm text-gray-400">{status}</p>}
      </form>
    </div>
  );
}
