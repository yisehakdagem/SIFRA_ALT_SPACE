export default function AuditLogsPage() {
  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Audit Logs</h1>
      <p className="text-gray-600 mb-6">Security and activity tracking log.</p>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date().toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">admin@sifra.et</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="bg-beige text-olive-dark px-2 rounded-full text-xs font-bold">LOGIN</span></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Successful authentication</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(Date.now() - 3600000).toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">manager@sifra.et</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="bg-green-100 text-green-800 px-2 rounded-full text-xs font-bold">ORDER_CREATED</span></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Processed order in POS</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
