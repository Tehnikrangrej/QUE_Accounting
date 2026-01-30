module.exports = (invoice, tenant) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    color: #000;
    padding: 40px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #999;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }

  .logo {
    width: 120px;
  }

  .logo img {
    max-width: 100%;
    height: auto;
  }

  .company-info {
    text-align: left;
    font-size: 11px;
    line-height: 1.4;
  }

  .company-info .name {
    font-weight: bold;
    font-size: 13px;
    margin-bottom: 2px;
  }

  .invoice-title {
    text-align: right;
    font-size: 15px;
    font-weight: bold;
    color: #0a3d91;
  }

  .invoice-number {
    font-size: 11px;
    font-weight: normal;
    color: #000;
  }


  .company {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .company img {
    height: 55px;
    object-fit: contain;
  }

  .company-details {
    line-height: 1.4;
  }

  .company-details strong {
    font-size: 13px;
  }

  .tax-box {
    text-align: right;
    font-weight: bold;
    color: #0a3d91;
    font-size: 15px;
  }

  /* ===== META ===== */
  .meta {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 15px;
  }

  .meta-box {
    border: 1px solid #ccc;
    padding: 8px;
  }

  /* ===== ADDRESS ===== */
  .address-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 15px;
  }

  .address-box {
    border: 1px solid #ccc;
    padding: 8px;
  }

  .address-box strong {
    color: #0a3d91;
  }

  /* ===== TABLE ===== */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }

  thead th {
    background: #0a3d91;
    color: #fff;
    padding: 8px;
    font-size: 11px;
    text-align: center;
  }

  tbody td {
    padding: 8px;
    font-size: 11px;
    border-bottom: 1px solid #ddd;
  }

  tbody td:nth-child(2) {
    text-align: left;
  }

  tbody td:not(:nth-child(2)) {
    text-align: center;
  }

  /* ===== SUMMARY ===== */
  .summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 15px;
  }

  .summary-box {
    border: 1px solid #ccc;
    padding: 8px;
  }

  .totals table {
    width: 100%;
    border-collapse: collapse;
  }

  .totals td {
    padding: 6px;
    font-size: 11px;
  }

  .total-highlight {
    background: #0a3d91;
    color: #fff;
    font-weight: bold;
  }

  /* ===== BANK ===== */
  .bank {
    border-top: 1px solid #ccc;
    margin-top: 20px;
    padding-top: 10px;
  }

  /* ===== FOOTER ===== */
  .footer {
    margin-top: 35px;
    text-align: right;
    font-size: 11px;
  }
</style>
</head>

<body>
<div class="header">

  <!-- LEFT: LOGO -->
  <div class="logo">
    ${tenant.companyLogo ? `<img src="${tenant.companyLogo}" />` : ""}
  </div>

  <!-- CENTER: COMPANY INFO -->
  <div class="company-info">
    <div class="name">${tenant.companyName}</div>
    ${tenant.address}<br/>
    ${tenant.website || ""}<br/>
    TRN: ${tenant.trn}
  </div>

  <!-- RIGHT: INVOICE -->
  <div class="invoice-title">
    TAX INVOICE<br/>
    <span class="invoice-number">${invoice.invoiceNumber}</span>
  </div>

</div>

<!-- META -->
<div class="meta">
  <div class="meta-box">
    <strong>Invoice Date</strong><br/>
    ${new Date(invoice.invoiceDate).toDateString()}<br/><br/>
    <strong>P.O. No.</strong><br/>
    ${invoice.poNumber || "-"}
  </div>

  <div class="meta-box">
    <strong>Due Date</strong><br/>
    ${new Date(invoice.dueDate).toDateString()}<br/><br/>
    <strong>P.O. Date</strong><br/>
    ${invoice.poDate ? new Date(invoice.poDate).toDateString() : "-"}
  </div>

  <div class="meta-box">
    <strong>Terms</strong><br/>
    ${invoice.terms || tenant.defaultTerms || ""}
  </div>
</div>

<!-- BILL / SHIP -->
<div class="address-row">
  <div class="address-box">
    <strong>BILL TO</strong><br/>
    ${invoice.customer.company}<br/>
    ${invoice.customer.billingStreet}<br/>
    ${invoice.customer.billingCity}, ${invoice.customer.billingCountry}<br/>
    TRN: ${invoice.customer.vatNumber || "-"}
  </div>

  <div class="address-box">
    <strong>SHIP TO</strong><br/>
    ${invoice.customer.company}<br/>
    ${invoice.customer.shippingStreet}<br/>
    ${invoice.customer.shippingCity}, ${invoice.customer.shippingCountry}<br/>
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
<div class="summary">
  <div class="summary-box">
    <strong>TAX SUMMARY</strong><br/><br/>
    Currency: AED (United Arab Emirates Dirham)<br/><br/>
    Taxable Amount: ${invoice.subTotal}<br/>
    Standard Rate (5%): ${invoice.totalTax}
  </div>

  <div class="summary-box totals">
    <table>
      <tr><td>Sub Total</td><td align="right">${invoice.subTotal}</td></tr>
      <tr><td>Total Tax</td><td align="right">${invoice.totalTax}</td></tr>
      <tr class="total-highlight">
        <td>Total (AED)</td>
        <td align="right">${invoice.grandTotal}</td>
      </tr>
    </table>
  </div>
</div>

<!-- BANK -->
<div class="bank">
  <strong>BANK DETAILS</strong><br/><br/>
  Bank Name: ${tenant.bankName}<br/>
  Account Name: ${tenant.accountName}<br/>
  IBAN: ${tenant.iban}<br/>
  Swift: ${tenant.swiftCode}
</div>

<div class="footer">
  Authorized Signature
</div>

</body>
</html>
`;
