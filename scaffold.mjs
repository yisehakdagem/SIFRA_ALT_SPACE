import fs from 'fs';
import path from 'path';

const basePath = path.join(process.cwd(), 'src', 'app');

const pages = [
  // Public
  { route: 'books', name: 'CatalogPage' },
  { route: 'books/[id]', name: 'BookDetailsPage' },
  { route: 'cafe', name: 'CafeMenuPage' },
  { route: 'events', name: 'EventsPage' },
  { route: 'events/[id]', name: 'EventDetailsPage' },
  
  // Auth
  { route: 'login', name: 'LoginPage' },
  { route: 'register', name: 'RegisterPage' },

  // Customer
  { route: 'customer', name: 'CustomerDashboardPage' },
  { route: 'customer/profile', name: 'CustomerProfilePage' },
  { route: 'customer/borrowings', name: 'CustomerBorrowingsPage' },
  { route: 'customer/wishlist', name: 'CustomerWishlistPage' },
  { route: 'customer/events', name: 'CustomerEventsPage' },

  // Manager
  { route: 'manager', name: 'ManagerDashboardPage' },
  { route: 'manager/books', name: 'BookManagementPage' },
  { route: 'manager/books/add', name: 'AddBookPage' },
  { route: 'manager/books/[id]', name: 'EditBookPage' },
  { route: 'manager/books/[id]/copies', name: 'ManageCopiesPage' },
  { route: 'manager/borrowings', name: 'BorrowingManagementPage' },
  { route: 'manager/pos', name: 'CafePOSPage' },
  { route: 'manager/orders', name: 'OrdersHistoryPage' },
  { route: 'manager/inventory', name: 'InventoryManagementPage' },
  { route: 'manager/inventory/restock', name: 'RestockPage' },
  { route: 'manager/inventory/history', name: 'InventoryHistoryPage' },
  { route: 'manager/events', name: 'EventManagementPage' },
  { route: 'manager/events/add', name: 'AddEventPage' },
  { route: 'manager/events/[id]', name: 'EditEventPage' },
  { route: 'manager/events/[id]/registrations', name: 'EventRegistrationsPage' },
  { route: 'manager/reports', name: 'ManagerReportsPage' },

  // Admin
  { route: 'admin', name: 'AdminDashboardPage' },
  { route: 'admin/users', name: 'UserManagementPage' },
  { route: 'admin/reports', name: 'AdminReportsPage' },
  { route: 'admin/settings', name: 'SystemSettingsPage' },
  { route: 'admin/audit', name: 'AuditLogsPage' },
];

function generatePage(route, name) {
  const dir = path.join(basePath, route);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, 'page.tsx');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `export default function ${name}() {\n  return (\n    <div className="p-8">\n      <h1 className="text-2xl font-bold">${name}</h1>\n    </div>\n  );\n}\n`);
    console.log(`Created ${route}/page.tsx`);
  }
}

pages.forEach(p => generatePage(p.route, p.name));
