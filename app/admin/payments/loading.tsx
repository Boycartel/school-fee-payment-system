export default function AdminPaymentsLoading() {
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
        {/* Title and Actions Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="w-48 h-8 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="w-64 h-5 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="w-24 h-10 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-32 h-10 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Search and Filters Skeleton */}
        <div className="bg-fpb-blue-light border border-gray-700 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="w-16 h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="w-full h-10 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div>
              <div className="w-20 h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="w-full h-10 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div>
              <div className="w-16 h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="w-full h-10 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div>
              <div className="w-24 h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="w-full h-10 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-fpb-blue-light border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="w-32 h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Payments Table Skeleton */}
        <div className="bg-fpb-blue-light border border-gray-700 rounded-lg">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="w-32 h-6 bg-gray-700 rounded animate-pulse"></div>
              <div className="w-24 h-4 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-700">
                <tr>
                  {[...Array(8)].map((_, i) => (
                    <th key={i} className="text-left py-3 px-4">
                      <div className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(10)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-700">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="w-full h-4 bg-gray-700 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Skeleton */}
          <div className="p-6 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="w-32 h-4 bg-gray-700 rounded animate-pulse"></div>
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
                ))}
              </div>
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
