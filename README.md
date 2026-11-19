# M MARINE SERVICES - Invoice Management System

🚢 A professional invoice management system for marine engineering solutions and turnkey projects.

## 🌊 About M Marine Services

**M MARINE SERVICES** provides comprehensive marine engineering solutions including:
- Marine Engineering Solutions
- Engineering Turnkey Projects
- Mechanical, Electrical, and Safety Items
- IT Solutions for Marine Industry

**GSTIN**: 29AAYFN4510A1Z8

---

## 📋 Features

### ✅ Professional Invoice Generation
- Marine-themed professional design
- Tax Invoice numbering system
- GST (18%) calculation
- Automatic round-off to nearest rupee
- Amount in words (Indian format)
- PDF export with company branding

### ✅ Items Management
- Add products/services to catalog
- Manage inventory
- Quick item selection for invoices

### ✅ Invoice Dashboard
- View all generated invoices
- Track customer orders
- Export and manage records

### ✅ Database Integration
- MongoDB Atlas cloud database
- Secure data storage
- Real-time synchronization

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Shubham27082/INVOICE-MANAGEMENT-SYSTEM.git
cd INVOICE-MANAGEMENT-SYSTEM

# Install all dependencies
npm install
npm run install-all
```

### Configuration

Update `server/.env` with your MongoDB connection:
```env
PORT=5000
MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/invoice_management
```

### Initial Setup - Create Admin User

Before running the application for the first time, create the initial admin user:

```bash
# Navigate to server directory
cd server

# Run the seed script
npm run seed:user
```

**Default Login Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important:** Change the default password after first login in production!

For detailed instructions, see [server/SEED_SETUP.md](server/SEED_SETUP.md)

### Running the Application

```bash
# Run both frontend and backend
npm run dev
```

**Application URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 📁 Project Structure

```
invoice-management/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Invoice, Items, Dashboard components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   ├── controllers/       # Business logic
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── .env              # Environment variables
│   └── server.js
├── reference/             # Invoice template reference
│   ├── marine_invoice_template.jpeg
│   └── README.md
└── package.json          # Root scripts
```

---

## 🎨 Invoice Template

The system generates invoices matching the official M Marine Services format:

### Invoice Structure:
- **Header**: Company name, tagline, GSTIN
- **Invoice Details**: Tax Invoice No., Date
- **Customer Section**: TO:- details (name, address, contact)
- **Items Table**: SR.NO, DESCRIPTION, QTY, DENO, RATE, AMOUNT
- **Calculations**: Subtotal, GST 18%, Total, Round off
- **Footer**: Amount in words, Bank details, Contact information

### Sample Invoice Number Format:
`-020/17-07-2026/26NK`

---

## 🔧 Technologies Used

### Frontend
- **React.js** - UI framework
- **Axios** - HTTP client
- **jsPDF** - PDF generation
- **jsPDF-AutoTable** - Table formatting

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **CORS** - Cross-origin support
- **dotenv** - Environment variables

---

## 📊 API Endpoints

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get specific invoice
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

---

## 💡 Usage Guide

### Creating an Invoice:

1. **Navigate to "Create Invoice" tab**
2. **Fill Customer Details:**
   - Customer name/organization
   - Address and city
   - Phone and email
   - GSTIN (optional)

3. **Add Items:**
   - Select item from dropdown
   - Edit quantity, denomination, and rate
   - Items calculate automatically

4. **Review Calculations:**
   - Subtotal
   - GST (18%)
   - Round-off
   - Final total

5. **Generate:**
   - Click "Download PDF" for instant export
   - Click "Save Invoice" to store in database

---

## 🏦 Bank Details

**For Payments:**
- **Account No**: 0815073000000174
- **IFSC Code**: SIBL0000815
- **Bank**: SOUTH INDIAN BANK KARWAR

---

## 📞 Contact Information

**M MARINE SERVICES**

📱 +91 8149332389 / 8762850701  
✉️ naikvishal063@gmail.com  
📍 Off. 395 Gaonkarwada Near Ice Factory, Uttara Kannada Karnataka 581324

---

## 📝 License

ISC

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

*Built with ❤️ for the marine engineering industry*
