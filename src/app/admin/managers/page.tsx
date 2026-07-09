import { prisma } from "@/lib/prisma";

export default async function ManagerManagementPage() {
  const managers = await prisma.user.findMany({
    where: { Role: 'Manager' },
    orderBy: { DateRegistered: 'desc' }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Manager Accounts</h1>
          <p className="text-gray-500 mt-1">Dedicated accounts for Café & Library Managers.</p>
        </div>
        <button className="bg-olive text-white px-4 py-2 rounded font-semibold hover:bg-olive-dark">
          + Create Manager Account
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {managers.map((u) => (
              <tr key={u.UserID}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.FirstName} {u.LastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{u.Email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {u.Status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-olive hover:text-olive-dark mr-4">Reset Password</button>
                  <button className="text-red-600 hover:text-red-900">Revoke Access</button>
                </td>
              </tr>
            ))}
            {managers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No manager accounts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
