export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600">
            <span className="text-xl">✦</span>
          </div>
          <h1 className="text-2xl font-bold text-white">DocuQuery</h1>
          <p className="mt-1 text-sm text-neutral-500">Real-Time Multimodal RAG Agent</p>
        </div>
        {children}
      </div>
    </div>
  )
}
