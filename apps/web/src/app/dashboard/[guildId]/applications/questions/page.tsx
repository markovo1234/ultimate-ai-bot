'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Question {
  id: string;
  label: string;
  style: string;
  required: boolean;
  order: number;
}

export default function QuestionsPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [label, setLabel] = useState('');
  const [style, setStyle] = useState('SHORT');
  const [required, setRequired] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let ignore = false;
    fetch(`/api/guild/${guildId}/questions`)
      .then((r) => r.json())
      .then((data) => {
        if (!ignore) setQuestions(data.questions ?? []);
      });
    return () => {
      ignore = true;
    };
  }, [guildId, reloadToken]);

  async function addQuestion(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch(`/api/guild/${guildId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, style, required }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Failed to add question');
      return;
    }
    setLabel('');
    setReloadToken((t) => t + 1);
  }

  async function removeQuestion(id: string) {
    await fetch(`/api/guild/${guildId}/questions?id=${id}`, { method: 'DELETE' });
    setReloadToken((t) => t + 1);
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-2">Application Form Questions</h1>
      <p className="text-gray-400 mb-6">Discord modals allow at most 5 questions. Members answer these with /apply.</p>

      <ul className="space-y-2 mb-6">
        {questions.map((q, i) => (
          <li key={q.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-md px-3 py-2">
            <span>
              {i + 1}. {q.label}{' '}
              <span className="text-xs text-gray-500">
                ({q.style.toLowerCase()}
                {q.required ? ', required' : ''})
              </span>
            </span>
            <button onClick={() => removeQuestion(q.id)} className="text-red-400 hover:text-red-300 text-sm">
              Remove
            </button>
          </li>
        ))}
        {questions.length === 0 && <p className="text-gray-500 text-sm">No questions yet.</p>}
      </ul>

      {questions.length < 5 && (
        <form onSubmit={addQuestion} className="space-y-3 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div>
            <label className="block text-sm mb-1">Question</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={45}
              required
              className="w-full bg-gray-950 border border-gray-800 rounded-md px-3 py-2"
              placeholder="Why do you want to join the team?"
            />
          </div>
          <div className="flex gap-4 items-center">
            <select value={style} onChange={(e) => setStyle(e.target.value)} className="bg-gray-950 border border-gray-800 rounded-md px-3 py-2">
              <option value="SHORT">Short answer</option>
              <option value="PARAGRAPH">Paragraph</option>
            </select>
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
              Required
            </label>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md font-medium text-sm">
            Add question
          </button>
        </form>
      )}
    </div>
  );
}
