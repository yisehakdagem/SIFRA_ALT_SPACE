"use client";

import { useState, useEffect } from "react";

export default function CafePOSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [tabs, setTabs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout states
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutMethod, setCheckoutMethod] = useState<"Cash" | "Chapa">("Cash");
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [pendingTxRef, setPendingTxRef] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Elegant UI States
  const [showNewTabModal, setShowNewTabModal] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [toast, setToast] = useState<{ message: string, type: "error" | "success" } | null>(null);

  const showToastMessage = (message: string, type: "error" | "success" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    const [pRes, tRes] = await Promise.all([
      fetch("/api/cafe/products"),
      fetch("/api/cafe/orders/pending")
    ]);
    if (pRes.ok) setProducts(await pRes.json());
    if (tRes.ok) setTabs(await tRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTabName.trim()) return;
    
    const res = await fetch("/api/cafe/orders/pending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderName: newTabName })
    });
    
    if (res.ok) {
      const newTab = await res.json();
      setTabs([...tabs, newTab]);
      setActiveTab(newTab);
      setShowNewTabModal(false);
      setNewTabName("");
      showToastMessage("Tab created successfully!", "success");
    } else {
      showToastMessage("Failed to create tab.");
    }
  };

  const syncTabItems = async (tab: any, items: any[]) => {
    const updatedTab = { ...tab, OrderItems: items.map(i => ({
      ProductID: i.ProductID,
      Quantity: i.quantity,
      Product: { ...i }
    })) };
    
    setTabs(tabs.map(t => t.OrderID === tab.OrderID ? updatedTab : t));
    setActiveTab(updatedTab);

    await fetch(`/api/cafe/orders/${tab.OrderID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map(i => ({ productId: i.ProductID, quantity: i.quantity, unitPrice: i.SellingPrice }))
      })
    });
  };

  const addToTab = (product: any) => {
    if (!activeTab) return showToastMessage("Please select or create a tab first!");
    if (product.CurrentStock <= 0) return showToastMessage("This item is out of stock!");
    
    const currentItems = activeTab.OrderItems || [];
    let newItems = [];
    
    const existing = currentItems.find((i: any) => i.ProductID === product.ProductID);
    if (existing) {
      newItems = currentItems.map((i: any) => 
        i.ProductID === product.ProductID ? { ...i.Product, quantity: i.Quantity + 1 } : { ...i.Product, quantity: i.Quantity }
      );
    } else {
      newItems = currentItems.map((i: any) => ({ ...i.Product, quantity: i.Quantity }));
      newItems.push({ ...product, quantity: 1 });
    }
    
    syncTabItems(activeTab, newItems);
  };

  const removeFromTab = (productID: string) => {
    if (!activeTab) return;
    const currentItems = activeTab.OrderItems || [];
    const newItems = currentItems.filter((i: any) => i.ProductID !== productID).map((i: any) => ({ ...i.Product, quantity: i.Quantity }));
    syncTabItems(activeTab, newItems);
  };

  const handleCheckoutInit = () => {
    if (!activeTab || (activeTab.OrderItems || []).length === 0) return;
    setShowCheckout(true);
    setCheckoutMethod("Cash");
    setQrCodeData(null);
  };

  const processPayment = async () => {
    if (checkoutMethod === "Chapa") {
      const amount = calculateTotal(activeTab);
      const res = await fetch("/api/chapa/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          firstName: "Cafe",
          lastName: "Customer",
          title: `Order ${activeTab.OrderID}`,
          returnUrl: window.location.href
        })
      });

      if (res.ok) {
        const data = await res.json();
        setQrCodeData(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.checkout_url)}`);
        setPendingTxRef(data.tx_ref);
      } else {
        showToastMessage("Failed to initialize Chapa payment.");
      }
      return;
    }
    await finalizeCheckout("Cash");
  };

  const verifyChapaPayment = async () => {
    if (!pendingTxRef) return;
    setVerifying(true);
    const res = await fetch(`/api/chapa/verify?tx_ref=${pendingTxRef}`);
    const data = await res.json();
    setVerifying(false);

    if (data.success) {
      await finalizeCheckout("Chapa", pendingTxRef);
    } else {
      showToastMessage(data.message || "Payment not verified yet.");
    }
  };

  const finalizeCheckout = async (method: string, txRef?: string) => {
    const res = await fetch("/api/cafe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: activeTab.OrderID, paymentMethod: method, txRef })
    });
    
    if (res.ok) {
      showToastMessage("Order Paid Successfully!", "success");
      setShowCheckout(false);
      setActiveTab(null);
      fetchData(); 
    } else {
      showToastMessage("Failed to complete order.");
    }
  };

  const calculateTotal = (tab: any) => {
    if (!tab || !tab.OrderItems) return 0;
    return tab.OrderItems.reduce((acc: number, item: any) => acc + (item.Quantity * item.Product.SellingPrice), 0);
  };

  if (loading) return <div>Loading POS...</div>;

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl z-50 text-white font-bold transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      {/* Left Sidebar: Tabs */}
      <div className="w-64 bg-white p-4 rounded-lg shadow flex flex-col">
        <button onClick={() => setShowNewTabModal(true)} className="w-full bg-olive text-white py-3 rounded-lg font-bold hover:bg-olive-dark mb-4 transition-colors">
          + New Order
        </button>
        <div className="flex-1 overflow-y-auto space-y-2">
          {tabs.map(tab => (
            <button 
              key={tab.OrderID} 
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left p-4 rounded-lg transition-colors border ${activeTab?.OrderID === tab.OrderID ? 'bg-gold-light/20 border-gold shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}
            >
              <div className="font-bold text-gray-900">{tab.OrderName || "Unknown Order"}</div>
              <div className="text-sm text-gray-500 mt-1">{calculateTotal(tab)} ETB {tab.OrderItems?.length || 0} items</div>
            </button>
          ))}
          {tabs.length === 0 && <p className="text-gray-400 text-center mt-4">No active orders</p>}
        </div>
      </div>

      {/* Middle: Products Grid */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
          {activeTab && <span className="bg-olive/10 text-olive px-4 py-1 rounded-full font-bold">Editing: {activeTab.OrderName}</span>}
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map(p => (
            <button 
              key={p.ProductID} 
              onClick={() => addToTab(p)}
              disabled={p.CurrentStock <= 0}
              className={`p-4 border rounded-xl text-left transition-all ${p.CurrentStock > 0 ? 'hover:border-gold hover:shadow-md cursor-pointer' : 'opacity-50 cursor-not-allowed bg-gray-50'}`}
            >
              <div className="font-bold text-lg text-gray-900">{p.ProductName}</div>
              <div className="text-gray-500 text-sm mt-1">{p.SellingPrice} ETB</div>
              <div className={`text-xs mt-3 font-semibold ${p.CurrentStock > 0 ? 'text-olive' : 'text-red-500'}`}>
                {p.CurrentStock > 0 ? `Stock: ${p.CurrentStock}` : 'Out of Stock'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Sidebar: Current Tab */}
      <div className="w-80 bg-white p-6 rounded-lg shadow flex flex-col relative">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          {activeTab ? `Order: ${activeTab.OrderName}` : "No Order Selected"}
        </h2>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {!activeTab ? (
            <div className="text-gray-400 text-center mt-10">Select an order from the left</div>
          ) : (activeTab.OrderItems || []).length === 0 ? (
            <div className="text-gray-400 text-center mt-10">Order is empty. Add items from the menu.</div>
          ) : (
            activeTab.OrderItems.map((item: any) => (
              <div key={item.ProductID} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-semibold text-gray-900">{item.Product.ProductName}</div>
                  <div className="text-sm text-gray-500">{item.Product.SellingPrice} ETB x {item.Quantity}</div>
                </div>
                <div className="font-bold text-gray-900 flex items-center gap-4">
                  <span>{item.Product.SellingPrice * item.Quantity}</span>
                  <button onClick={() => removeFromTab(item.ProductID)} className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer">×</button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="pt-6 border-t mt-4">
          <div className="flex justify-between items-center text-xl font-bold mb-6">
            <span>Total:</span>
            <span className="text-gold">{calculateTotal(activeTab)} ETB</span>
          </div>
          <button 
            onClick={handleCheckoutInit}
            disabled={!activeTab || (activeTab.OrderItems || []).length === 0}
            className="w-full bg-olive text-white py-4 rounded-xl font-bold text-lg hover:bg-olive-dark disabled:opacity-50 transition-colors"
          >
            Checkout Order
          </button>
        </div>

        {/* Checkout Overlay Modal */}
        {showCheckout && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col p-6 rounded-lg border border-gray-200">
            <h3 className="text-2xl font-bold mb-6 text-center">Complete Payment</h3>
            
            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => { setCheckoutMethod("Cash"); setQrCodeData(null); }}
                className={`flex-1 py-3 rounded-lg font-bold border-2 transition-all ${checkoutMethod === "Cash" ? 'border-olive bg-olive/10 text-olive' : 'border-gray-200 text-gray-500'}`}
              >
                Cash
              </button>
              <button 
                onClick={() => setCheckoutMethod("Chapa")}
                className={`flex-1 py-3 rounded-lg font-bold border-2 transition-all ${checkoutMethod === "Chapa" ? 'border-olive bg-olive/10 text-olive' : 'border-gray-200 text-gray-500'}`}
              >
                Chapa (Digital)
              </button>
            </div>

            {checkoutMethod === "Chapa" ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                {!qrCodeData ? (
                  <button onClick={processPayment} className="bg-[#00A859] text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-[#008f4c]">
                    Generate Chapa Link
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="font-bold text-gray-900 mb-4">Customer: Scan to Pay</p>
                    <img src={qrCodeData} alt="Chapa QR" className="mx-auto border p-2 rounded-xl shadow-sm mb-6" />
                    <button onClick={verifyChapaPayment} disabled={verifying} className="w-full bg-olive text-white py-3 rounded-lg font-bold disabled:opacity-50">
                      {verifying ? "Verifying..." : "Verify Payment"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-end">
                <button onClick={processPayment} className="w-full bg-olive text-white py-4 rounded-xl font-bold text-lg">
                  Confirm Cash Received
                </button>
              </div>
            )}

            <button onClick={() => setShowCheckout(false)} className="mt-4 w-full py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-lg">
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* New Tab Modal */}
      {showNewTabModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96 max-w-[90%]">
            <h3 className="text-2xl font-bold mb-4 font-serif text-olive">Create New Order</h3>
            <form onSubmit={handleCreateTabSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer or Table Name</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  placeholder="e.g. Table 4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-olive focus:border-olive" 
                />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowNewTabModal(false)} className="flex-1 py-3 text-gray-600 font-bold border border-gray-200 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-olive text-white font-bold rounded-lg hover:bg-olive-dark">
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
