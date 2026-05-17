import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
        SyncWatch
      </div>
      <p className="text-gray-400 text-lg mb-10 max-w-lg">
        Upload screenshots from multiple signage displays and instantly detect drift, mismatches, and visual desync.
      </p>
      <div className="flex gap-4">
        <Link
          href="/groups"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold transition"
        >
          Create screen group
        </Link>
        <Link
          href="/reports"
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-semibold transition"
        >
          View reports
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-6 text-left max-w-2xl w-full">
        {[
          { title: 'Upload screenshots', desc: 'Group displays together and upload screenshots from each screen' },
          { title: 'Pixel comparison', desc: 'pixelmatch computes exact diff between screens, generating a visual diff image' },
          { title: 'Sync score + AI analysis', desc: 'Get an overall sync score, outlier detection, and AI-written summary' },
        ].map(f => (
          <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="font-semibold text-gray-200 mb-1 text-sm">{f.title}</div>
            <div className="text-gray-500 text-xs">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
