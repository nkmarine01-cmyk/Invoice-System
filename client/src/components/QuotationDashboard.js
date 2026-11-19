import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { jsPDF } from 'jspdf';
// eslint-disable-next-line no-unused-vars
import autoTable from 'jspdf-autotable';
import './QuotationDashboard.css';

const QuotationDashboard = () => {
  const [Quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_URL}/api/Quotations`);
      
      if (res.data.success) {
        console.log('Fetched Quotations:', res.data.data);
        console.log('First Quotation structure:', res.data.data[0]);
        setQuotations(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching Quotations:', err);
      setError('Failed to fetch Quotations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, QuotationNumber) => {
    if (!window.confirm(`Are you sure you want to delete Quotation ${QuotationNumber}?`)) {
      return;
    }

    try {
      const res = await axios.delete(`${API_URL}/api/Quotations/${id}`);
      
      if (res.data.success) {
        setQuotations(Quotations.filter(Quotation => Quotation._id !== id));
        alert('Quotation deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting Quotation:', err);
      alert('Failed to delete Quotation. Please try again.');
    }
  };

  const handleDownloadPDF = (Quotation) => {
    const doc = new jsPDF();
    
    // HealthyChef Header with green background
    doc.setFillColor(76, 175, 80);
    doc.rect(0, 0, 210, 35, 'F');
    
    // HealthyChef Logo/Title
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('HealthyChef', 105, 15, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Making Healthy Eating Easy & Accessible', 105, 23, { align: 'center' });
    
    // Quotation title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Quotation', 105, 32, { align: 'center' });
    
    // Quotation Details Box
    doc.setFillColor(245, 245, 245);
    doc.rect(140, 42, 55, 18, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(`Quotation #: ${Quotation.QuotationNumber}`, 142, 48);
    doc.text(`Date: ${new Date(Quotation.QuotationDate).toLocaleDateString('en-IN')}`, 142, 54);
    
    // Bill To Section
    doc.setFontSize(11);
    doc.setTextColor(76, 175, 80);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 20, 48);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(Quotation.customer.name, 20, 56);
    doc.setFontSize(9);
    doc.text(Quotation.customer.phoneNumber, 20, 62);
    doc.text(Quotation.customer.email, 20, 68);
    
    const addressLines = doc.splitTextToSize(Quotation.customer.billingAddress, 80);
    doc.text(addressLines, 20, 74);
    
    const tableStartY = 74 + (addressLines.length * 5) + 8;
    
    // Prepare table data
    const tableData = Quotation.items.map((item, index) => {
      const itemSubtotal = item.price * item.quantity;
      const gstAmount = (itemSubtotal * item.gst) / 100;
      let discountAmount = 0;
      
      if (item.discountType === 'percentage') {
        discountAmount = (itemSubtotal * item.discount) / 100;
      } else {
        discountAmount = item.discount;
      }
      
      const itemTotal = itemSubtotal + gstAmount - discountAmount;
      
      return [
        index + 1,
        item.itemName,
        item.quantity,
        `Rs. ${Math.round(item.price)}`,
        `${item.gst}%`,
        item.discountType === 'percentage' 
          ? `${item.discount}%` 
          : `Rs. ${Math.round(item.discount)}`,
        `Rs. ${Math.round(itemTotal)}`
      ];
    });
    
    // Items Table with HealthyChef green theme
    autoTable(doc, {
      startY: tableStartY,
      head: [['#', 'Item', 'Qty', 'Price', 'GST', 'Discount', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [76, 175, 80],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 5
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50],
        cellPadding: 4
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'left', cellWidth: 65 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'right', cellWidth: 22 },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'center', cellWidth: 22 },
        6: { halign: 'right', cellWidth: 25, fontStyle: 'bold' }
      },
      margin: { left: 20, right: 20 },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      }
    });
    
    let finalY = doc.lastAutoTable.finalY + 10;
    
    // Calculations Summary Box with green accent
    const summaryX = 115;
    const summaryWidth = 75;
    
    doc.setDrawColor(76, 175, 80);
    doc.setLineWidth(0.5);
    doc.setFillColor(250, 250, 250);
    doc.rect(summaryX, finalY, summaryWidth, 45, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    
    // Format numbers properly
    const subtotal = Math.round(parseFloat(Quotation.calculations.subtotal));
    const totalGST = Math.round(parseFloat(Quotation.calculations.totalGST));
    const totalDiscount = Math.round(parseFloat(Quotation.calculations.totalDiscount));
    const grandTotal = Math.round(parseFloat(Quotation.calculations.grandTotal));
    
    // Subtotal
    doc.text('Subtotal:', summaryX + 5, finalY + 10);
    doc.text(`Rs. ${subtotal}`, summaryX + summaryWidth - 5, finalY + 10, { align: 'right' });
    
    // GST
    doc.text('Total GST:', summaryX + 5, finalY + 20);
    doc.text(`Rs. ${totalGST}`, summaryX + summaryWidth - 5, finalY + 20, { align: 'right' });
    
    // Discount
    doc.text('Total Discount:', summaryX + 5, finalY + 30);
    doc.text(`-Rs. ${totalDiscount}`, summaryX + summaryWidth - 5, finalY + 30, { align: 'right' });
    
    // Divider line
    doc.setDrawColor(76, 175, 80);
    doc.setLineWidth(1);
    doc.line(summaryX + 5, finalY + 34, summaryX + summaryWidth - 5, finalY + 34);
    
    // Grand Total with green color
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(76, 175, 80);
    doc.text('Grand Total:', summaryX + 5, finalY + 42);
    doc.text(`Rs. ${grandTotal}`, summaryX + summaryWidth - 5, finalY + 42, { align: 'right' });
    
    // Terms & Conditions
    finalY = finalY + 55;
    
    if (finalY > 240) {
      doc.addPage();
      finalY = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(76, 175, 80);
    doc.text('Terms & Conditions:', 20, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    
    const terms = [
      '1. Payment is due within 30 days of Quotation date.',
      '2. Late payments may incur additional charges.',
      '3. All prices are in INR unless otherwise specified.',
      '4. Goods remain the property of the seller until payment is received in full.',
      '5. Please include Quotation number with payment.'
    ];
    
    let termsY = finalY + 7;
    terms.forEach(term => {
      doc.text(term, 20, termsY);
      termsY += 5;
    });
    
    // Footer with HealthyChef branding
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Green footer bar
      doc.setFillColor(76, 175, 80);
      doc.rect(0, 285, 210, 12, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(`Page ${i} of ${pageCount}`, 20, 291);
      doc.text('HealthyChef - Fueling Your Body with the Best Ingredients', 105, 291, { align: 'center' });
      doc.text('Thank you!', 190, 291, { align: 'right' });
    }
    
    // Save PDF
    doc.save(`HealthyChef_Quotation_${Quotation.QuotationNumber}.pdf`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="Quotation-dashboard">
        <div className="dashboard-header">
          <h1>Quotation Dashboard</h1>
          <p>View and manage all Quotations</p>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading Quotations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="Quotation-dashboard">
        <div className="dashboard-header">
          <h1>Quotation Dashboard</h1>
          <p>View and manage all Quotations</p>
        </div>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchQuotations} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="Quotation-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Quotation Dashboard</h1>
          <p>View and manage all Quotations</p>
        </div>
        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-label">Total Quotations</span>
            <span className="stat-value">{Quotations.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">
              ₹{Quotations.reduce((sum, inv) => sum + parseFloat(inv.calculations.grandTotal), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {Quotations.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
            <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
            <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2"/>
            <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2"/>
            <polyline points="10 9 9 9 8 9" strokeWidth="2"/>
          </svg>
          <h3>No Quotations yet</h3>
          <p>Create your first Quotation to see it here</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="Quotation-table">
            <thead>
              <tr>
                <th>Quotation Number</th>
                <th>Customer Name</th>
                <th>Date</th>
                <th>Items</th>
                <th>Grand Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Quotations.map((Quotation) => (
                <tr key={Quotation._id}>
                  <td className="Quotation-number">{Quotation.QuotationNumber || 'N/A'}</td>
                  <td className="customer-name">{Quotation.customer?.name || 'N/A'}</td>
                  <td className="Quotation-date">{formatDate(Quotation.QuotationDate)}</td>
                  <td className="items-count">{Quotation.items?.length || 0} items</td>
                  <td className="grand-total">₹{Quotation.calculations?.grandTotal ? parseFloat(Quotation.calculations.grandTotal).toFixed(2) : '0.00'}</td>
                  <td className="actions">
                    <button
                      className="btn-view"
                      onClick={() => alert('View details coming soon!')}
                      title="View Quotation"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    <button
                      className="btn-download-pdf"
                      onClick={() => handleDownloadPDF(Quotation)}
                      title="Download PDF"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                    <button
                      className="btn-delete-Quotation"
                      onClick={() => handleDelete(Quotation._id, Quotation.QuotationNumber)}
                      title="Delete Quotation"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuotationDashboard;
