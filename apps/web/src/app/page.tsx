import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-950 text-white">
        <h1 className="text-5xl font-bold mb-8">Ultimate AI Bot Dashboard</h1>
        <p className="text-xl mb-8 text-gray-400">Manage your server settings, AI configs, and moderation logs.</p>
        <Link href="/api/auth/signin" className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-medium transition-colors">
          Login with Discord
        </Link>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col p-24 bg-gray-950 text-white">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span>{session.user?.name}</span>
          <Link href="/api/auth/signout" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm transition-colors">
            Sign out
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <h2 className="text-2xl font-semibold mb-2">AI Configuration</h2>
          <p className="text-gray-400 mb-4">Set up your API keys and default models for the AI commands.</p>
          <Link href="/dashboard/ai" className="text-indigo-400 hover:text-indigo-300">Configure &rarr;</Link>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <h2 className="text-2xl font-semibold mb-2">Application Forms</h2>
          <p className="text-gray-400 mb-4">Manage custom applications and review submissions.</p>
          <Link href="/dashboard/applications" className="text-indigo-400 hover:text-indigo-300">Manage &rarr;</Link>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <h2 className="text-2xl font-semibold mb-2">Moderation Logs</h2>
          <p className="text-gray-400 mb-4">View recent kicks, bans, mutes, and warnings.</p>
          <Link href="/dashboard/logs" className="text-indigo-400 hover:text-indigo-300">View Logs &rarr;</Link>
        </div>
      </div>
    </main>
  )
}
