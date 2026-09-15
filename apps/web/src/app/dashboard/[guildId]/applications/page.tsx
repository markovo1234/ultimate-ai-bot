'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Application {
  id: string;
  userId: string;
  status: string;
  content: string;
  createdAt: string;
}

export default function ApplicationsPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let ignore = false;
    fetch(`/api/guild/${guildId}/applications`)
      .then((r) => r.json())
      .then((data) => {
        if (!ignore) {
          setApplications(data.applications ?? []);
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [guildId, reloadToken]);

  async function review(id: string, status: 'ACCEPTED' | 'DENIED') {
    await fetch(`/api/guild/${guildId}/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setReloadToken((t) => t + 1);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Applications</h1>
        <Link href={`/dashboard/${guildId}/applications/questions`} className="text-sm text-indigo-400 hover:text-indigo-300">
          Edit form questions &rarr;
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="text-gray-400">No applications submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            let answers: Record<string, string> = {};
            try {
              answers = JSON.parse(app.content);
            } catch {
              // ignore malformed content
            }
            return (
              <div key={app.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    User {app.userId} &bull; {new Date(app.createdAt).toLocaleString()}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      app.status === 'ACCEPTED'
                        ? 'bg-green-900 text-green-300'
                        : app.status === 'DENIED'
                          ? 'bg-red-900 text-red-300'
                          : 'bg-yellow-900 text-yellow-300'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                <dl className="space-y-1 mb-3">
                  {Object.entries(answers).map(([q, a]) => (
                    <div key={q}>
                      <dt className="text-xs text-gray-500">{q}</dt>
                      <dd className="text-sm">{a}</dd>
                    </div>
                  ))}
                </dl>

                {app.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button onClick={() => review(app.id, 'ACCEPTED')} className="bg-green-700 hover:bg-green-600 text-sm px-3 py-1.5 rounded-md">
                      Accept
                    </button>
                    <button onClick={() => review(app.id, 'DENIED')} className="bg-red-700 hover:bg-red-600 text-sm px-3 py-1.5 rounded-md">
                      Deny
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
