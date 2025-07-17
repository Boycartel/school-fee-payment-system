export default function AdminAnalyticsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-fpb-blue text-white">
      {/* Header Skeleton */}
      <header className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-700 rounded animate-pulse"></div>
              <div className="w-48 h-6 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="w-32 h-10 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Title Skeleton */}
        <div className="mb-8">
          <div className="w-48 h-8 bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="w-64 h-5 bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Filters Skeleton */}
        <div className="bg-fpb-blue-light border border-gray-700 rounded-lg p-6 mb-8">
          <div className="w-24 h-6 bg-gray-700 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="w-20 h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="w-full h-10 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-fpb-blue-light border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="w-24 h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="w-16 h-8 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-fpb-blue-light border border-gray-700 rounded-lg">
              <div className="p-6 border-b border-gray-700">
                <div className="w-40 h-6 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="p-6">
                <div className="w-full h-64 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Data Table Skeleton */}
        <div className="bg-fpb-blue-light border border-gray-700 rounded-lg">
          <div className="p-6 border-b border-gray-700">
            <div className="w-48 h-6 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="w-64 h-4 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="p-6">
            {/* Table Header Skeleton */}
            <div className="grid grid-cols-6 gap-4 mb-4 pb-3 border-b border-gray-700">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
            {/* Table Rows Skeleton */}
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4 py-3 border-b border-gray-700">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="w-full h-4 bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="bg-fpb-blue-light border-t border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="w-80 h-4 bg-gray-700 rounded animate-pulse mx-auto"></div>
        </div>
      </footer>
    </div>
  )
}
