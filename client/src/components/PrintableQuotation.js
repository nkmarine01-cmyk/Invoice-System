import React from 'react';
import './PrintableQuotation.css';

const PrintableQuotation = ({ QuotationData, cartItems, calculations, gst }) => {
  const companyDetails = {
    name: 'M MARINE SERVICES',
    tagline: 'All Types Of Marine Engineering Solution, Engineering Turnkey Projects, Service In Mechanical, Electrical, Safety Items, Service In Mechanical & IT Solution',
    gstin: '29AAYFN4510A1Z8',
    accountNo: '0815073000000174',
    ifsc: 'SIBL0000815',
    bankName: 'SOUTH INDIAN BANK KARWAR',
    phone: '+91 8149332389 / 8762850701',
    email: 'naikvishal063@gmail.com',
    address: 'Off. 395 Gaonkarwada Near Ice Factory, Uttara Kannada Karnataka 581324'
  };

  // Convert number to words (Indian format)
  const numberToWords = (num) => {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';

    const convertHundreds = (n) => {
      let str = '';
      if (n > 99) {
        str += units[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n > 19) {
        str += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 9) {
        str += teens[n - 10] + ' ';
        return str;
      }
      if (n > 0) {
        str += units[n] + ' ';
      }
      return str;
    };

    let result = '';
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const hundred = num;

    if (crore > 0) result += convertHundreds(crore) + 'Crore ';
    if (lakh > 0) result += convertHundreds(lakh) + 'Lakh ';
    if (thousand > 0) result += convertHundreds(thousand) + 'Thousand ';
    if (hundred > 0) result += convertHundreds(hundred);

    return result.trim() + ' Only';
  };

  // Ensure minimum rows for professional look
  const displayItems = [...cartItems];
  while (displayItems.length < 5) {
    displayItems.push({
      _id: `empty-${displayItems.length}`,
      description: '',
      quantity: '',
      deno: '',
      rate: '',
      isEmpty: true
    });
  }

  return (
    <div className="printable-Quotation-container">
      <div className="printable-Quotation">
        {/* Header Section */}
        <div className="Quotation-header">
          <div className="header-left">
            <img src="/logo.jpeg" alt="M Marine Services Logo" className="company-logo" />
          </div>
          <div className="header-right">
            <p className="company-description">{companyDetails.tagline}</p>
            <p className="company-gstin"><strong>GSTIN Number : {companyDetails.gstin}</strong></p>
          </div>
        </div>

        <div className="header-divider"></div>

        {/* Quotation Title */}
        <div className="Quotation-title-section">
          <h2 className="Quotation-title">Quotation</h2>
        </div>

        {/* Customer and Quotation Details */}
        <div className="Quotation-details-section">
          <div className="customer-details">
            <p className="to-label"><strong>TO:-</strong></p>
            <p className="customer-name">{QuotationData.customerName?.toUpperCase() || ''}</p>
            <p className="customer-address">{QuotationData.customerAddress?.toUpperCase() || ''}</p>
            <p className="customer-city">{QuotationData.customerCity?.toUpperCase() || ''}</p>
          </div>
          <div className="Quotation-meta">
            <p className="Quotation-number"><strong>TAX Quotation NO. :{QuotationData.QuotationNumber}</strong></p>
            <p className="Quotation-date">DATE :-{QuotationData.QuotationDate}</p>
          </div>
        </div>

        {/* Quotation Table */}
        <table className="Quotation-table">
          <thead>
            <tr>
              <th className="col-sr">SR.<br/>NO.</th>
              <th className="col-description">DESCRIPTION</th>
              <th className="col-qty">QTY</th>
              <th className="col-deno">DENO</th>
              <th className="col-rate">RATE</th>
              <th className="col-amount">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item, index) => (
              <tr key={item._id || index} className={item.isEmpty ? 'empty-row' : ''}>
                <td className="text-center">{!item.isEmpty ? index + 1 : ''}</td>
                <td className="text-left">{item.description || ''}</td>
                <td className="text-center">{item.quantity ? String(item.quantity).padStart(2, '0') : ''}</td>
                <td className="text-center">{item.deno || ''}</td>
                <td className="text-right">{item.rate ? parseFloat(item.rate).toFixed(2) : ''}</td>
                <td className="text-right">
                  {!item.isEmpty && item.rate && item.quantity 
                    ? (item.rate * item.quantity).toFixed(2) 
                    : ''}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td colSpan="5" className="text-right"><strong>SUB TOTAL</strong></td>
              <td className="text-right"><strong>{calculations.subtotal || '0.00'}</strong></td>
            </tr>
            <tr className="total-row">
              <td colSpan="5" className="text-right"><strong>GST {gst} %</strong></td>
              <td className="text-right"><strong>{calculations.totalGST || '0.00'}</strong></td>
            </tr>
            <tr className="total-row">
              <td colSpan="5" className="text-right"><strong>TOTAL</strong></td>
              <td className="text-right"><strong>{calculations.grandTotal || '0.00'}</strong></td>
            </tr>
            <tr className="total-row">
              <td colSpan="5" className="text-right"><strong>Round off</strong></td>
              <td className="text-right"><strong>{calculations.finalTotal || '0.00'}</strong></td>
            </tr>
          </tfoot>
        </table>

        {/* Amount in Words */}
        <div className="amount-in-words">
          <p><strong>IN WORDS:- </strong>Rupees {numberToWords(Math.round(parseFloat(calculations.finalTotal || 0)))}.</p>
        </div>

        {/* Bank Details and Signature Area */}
        <div className="footer-section">
          <div className="bank-details">
            <p><strong>Acc no. :- </strong>{companyDetails.accountNo}</p>
            <p><strong>IFSC :- </strong>{companyDetails.ifsc}</p>
            <p>{companyDetails.bankName}</p>
          </div>
          <div className="signature-area">
            <p className="for-company">For M MARINE SERVICES</p>
            {/* No stamp or signature as per requirements */}
          </div>
        </div>

        <div className="footer-divider"></div>

        {/* Contact Information */}
        <div className="contact-section">
          <p className="contact-item"><span className="icon">O=Up</span> {companyDetails.phone}</p>
          <p className="contact-item"><span className="icon"></span> <a href={`mailto:${companyDetails.email}`}>{companyDetails.email}</a></p>
          <p className="contact-item"><span className="icon">O=Ui</span> {companyDetails.address}</p>
        </div>

        {/* Blue Stripe */}
        <div className="blue-stripe"></div>
        <div className="blue-triangle"></div>
      </div>
    </div>
  );
};

export default PrintableQuotation;
