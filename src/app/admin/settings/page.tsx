export default function SystemSettingsPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">System Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-8 space-y-8">
        <div>
          <h3 className="text-xl font-bold mb-4 border-b pb-2">Library Rules</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Maximum Borrowing Duration (Days)</span>
              <input type="number" defaultValue="14" className="border p-2 rounded w-24 text-center" />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Maximum Books Per Customer</span>
              <input type="number" defaultValue="3" className="border p-2 rounded w-24 text-center" />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Late Return Fine (ETB per day)</span>
              <input type="number" defaultValue="5" className="border p-2 rounded w-24 text-center" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4 border-b pb-2">Café Settings</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Accept Digital Payments</span>
              <input type="checkbox" defaultChecked className="h-5 w-5" />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Tax Rate (%)</span>
              <input type="number" defaultValue="15" className="border p-2 rounded w-24 text-center" />
            </div>
          </div>
        </div>

        <button className="bg-olive text-white px-6 py-2 rounded font-bold hover:bg-olive-dark w-full">Save Settings</button>
      </div>
    </div>
  );
}
