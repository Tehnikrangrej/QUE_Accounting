module.exports = (invoice, tenant) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Tax Invoice</title>

<style>
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    color: #000;
    padding: 35px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    border-bottom: 2px solid #999;
    padding-bottom: 10px;
  }

  .logo-box {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .logo-box img {
    height: 55px;
  }

  .company-details {
    font-size: 11px;
    line-height: 1.4;
  }

  .invoice-title {
    text-align: right;
    font-size: 16px;
    font-weight: bold;
    color: #003366;
  }

  .top-info {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
  }

  .info-box {
    width: 32%;
    border: 1px solid #ccc;
    padding: 8px;
  }

  .info-box strong {
    color: #003366;
  }

  .address-row {
    display: flex;
    gap: 10px;
    margin-top: 15px;
  }

  .address-box {
    width: 50%;
    border: 1px solid #ccc;
    padding: 8px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  thead th {
    background: #003366;
    color: #fff;
    padding: 8px;
    font-size: 11px;
    text-align: left;
  }

  tbody td {
    padding: 8px;
    font-size: 11px;
    border-bottom: 1px solid #ddd;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }

  .tax-summary,
  .total-summary {
    width: 48%;
    border: 1px solid #ccc;
    padding: 10px;
  }

  .total-summary div {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .total-highlight {
    background: #003366;
    color: #fff;
    padding: 8px;
    font-weight: bold;
  }

  .words {
    margin-top: 15px;
    border-top: 1px solid #ccc;
    padding-top: 8px;
    font-size: 11px;
  }

  .bank {
    margin-top: 15px;
    border-top: 1px solid #ccc;
    padding-top: 10px;
    font-size: 11px;
  }

  .note {
    margin-top: 10px;
    border-top: 1px solid #ccc;
    padding-top: 8px;
    font-size: 11px;
  }

  .signature {
    margin-top: 40px;
    text-align: right;
    font-size: 11px;
  }
</style>
</head>

<body>

<!-- HEADER -->
<div class="header">
  <div class="logo-box">
    ${tenant.companyLogo ? `<img src="${tenant.companyLogo}" />` : ""}
    <div class="company-details">
      <strong>${tenant.companyName}</strong><br/>
      ${tenant.address}<br/>
      ${tenant.city || ""} ${tenant.country || ""}<br/>
      TRN: ${tenant.trn}
    </div>
  </div>

  <div class="invoice-title">
    TAX INVOICE<br/>
    ${invoice.invoiceNumber}
  </div>
</div>

<!-- TOP META -->
<div class="top-info">
  <div class="info-box">
    <strong>Invoice Date</strong><br/>
    ${new Date(invoice.invoiceDate).toDateString()}<br/><br/>
    <strong>P.O. No.</strong><br/>
    ${invoice.poNumber || "-"}
  </div>

  <div class="info-box">
    <strong>Due Date</strong><br/>
    ${new Date(invoice.dueDate).toDateString()}<br/><br/>
    <strong>P.O. Date</strong><br/>
    ${invoice.poDate ? new Date(invoice.poDate).toDateString() : "-"}
  </div>

  <div class="info-box">
    <strong>Terms</strong><br/>
    ${invoice.terms || "—"}
  </div>
</div>

<!-- ADDRESS -->
<div class="address-row">
  <div class="address-box">
    <strong>BILL TO</strong><br/>
    ${invoice.customer.company}<br/>
    ${invoice.customer.address}<br/>
    ${invoice.customer.city}, ${invoice.customer.country}<br/>
    TRN: ${invoice.customer.vatNumber || "-"}
  </div>

  <div class="address-box">
    <strong>SHIP TO</strong><br/>
    ${invoice.customer.company}<br/>
    ${invoice.customer.address}<br/>
    ${invoice.customer.city}, ${invoice.customer.country}<br/>
    TRN: ${invoice.customer.vatNumber || "-"}
  </div>
</div>

<!-- ITEMS -->
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Item & Description</th>
      <th>Hours</th>
      <th>Rate</th>
      <th>Tax %</th>
      <th>Tax</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    ${invoice.items.map((i, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${i.description}</td>
        <td>${i.hours}</td>
        <td>${i.rate}</td>
        <td>${i.taxPercent}</td>
        <td>${i.taxAmount}</td>
        <td>${i.amount}</td>
      </tr>
    `).join("")}
  </tbody>
</table>

<!-- SUMMARY -->
<div class="summary-row">
  <div class="tax-summary">
    <strong>TAX SUMMARY</strong><br/><br/>
    Currency: ${invoice.currency}<br/>
    Taxable Amount: ${invoice.subTotal}<br/>
    Standard Rate: ${invoice.totalTax}
  </div>

  <div class="total-summary">
    <div><span>Sub Total</span><span>${invoice.subTotal}</span></div>
    <div><span>Total Tax</span><span>${invoice.totalTax}</span></div>
    <div class="total-highlight">
      <span>Total (${invoice.currency})</span>
      <span>${invoice.grandTotal}</span>
    </div>
  </div>
</div>

<div class="words">
  <strong>Total in Words:</strong>
  ${invoice.grandTotal} ${invoice.currency} Only
</div>

<!-- BANK -->
<div class="bank">
  <strong>Bank Details</strong><br/>
  Bank Name: ${tenant.bankName}<br/>
  Account Name: ${tenant.accountName}<br/>
  IBAN: ${tenant.iban}<br/>
  Swift: ${tenant.swiftCode}
</div>

<div class="note">
  <strong>Note:</strong><br/>
  Thank you for your business
</div>

<div class="signature">
  Authorized Signature
</div>

</body>
</html>
`;
