import React from 'react';
import './PrintableForms.css';

const GatePassForm = ({ passData = {} }) => {
  // Sample data for preview
  const data = {
    passNumber: passData.passNumber || 'GP-2024-001',
    date: passData.date || new Date().toLocaleDateString(),
    time: passData.time || new Date().toLocaleTimeString(),
    type: passData.type || 'Outward', // Outward or Inward
    branch: passData.branch || 'Main Branch',
    carrierName: passData.carrierName || 'John Doe',
    carrierPhone: passData.carrierPhone || '+251-XXX-XXX-XXX',
    vehicleNumber: passData.vehicleNumber || 'AA 12345',
    driverName: passData.driverName || 'Driver Name',
    destination: passData.destination || 'Customer Location / Retail Store',
    purpose: passData.purpose || 'Product Delivery - Order #ORD-2024-001',
    items: passData.items || [
      { itemCode: 'FP-001', description: 'Tella Flour', quantity: 100, unit: 'kg', value: '15,000.00', remarks: 'Sealed bags' },
      { itemCode: 'FP-002', description: 'White Teff Flour', quantity: 50, unit: 'kg', value: '12,500.00', remarks: 'Sealed bags' },
      { itemCode: 'PKG-001', description: 'Empty Bags (Return)', quantity: 20, unit: 'pcs', value: '0.00', remarks: 'Return items' },
    ],
    returnExpected: passData.returnExpected || 'Same Day',
    authorizedBy: passData.authorizedBy || 'Manager Name',
    validUntil: passData.validUntil || new Date().toLocaleDateString(),
  };

  const totalValue = data.items.reduce((sum, item) => {
    return sum + parseFloat(item.value.replace(/,/g, '') || 0);
  }, 0);

  return (
    <div className="printable-form gate-pass">
      <div className="form-header">
        <div className="company-logo">
          <div className="logo-placeholder">[COMPANY LOGO]</div>
        </div>
        <div className="form-title">
          <h1>GATE PASS</h1>
          <p className="form-subtitle">{data.type} Pass</p>
        </div>
        <div className="form-number">
          <strong>Pass No:</strong>
          <div className="number-box gate-pass-number">{data.passNumber}</div>
        </div>
      </div>

      <div className="gate-pass-validity">
        <strong>⚠ VALID UNTIL: {data.validUntil} | {data.time}</strong>
      </div>

      <div className="form-section">
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Issue Date:</span>
            <span className="value">{data.date}</span>
          </div>
          <div className="info-item">
            <span className="label">Issue Time:</span>
            <span className="value">{data.time}</span>
          </div>
          <div className="info-item">
            <span className="label">Branch:</span>
            <span className="value">{data.branch}</span>
          </div>
          <div className="info-item">
            <span className="label">Pass Type:</span>
            <span className="value">
              <span className={`type-badge ${data.type.toLowerCase()}`}>{data.type}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Carrier & Vehicle Details</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Carrier Name:</span>
            <span className="value"><strong>{data.carrierName}</strong></span>
          </div>
          <div className="info-item">
            <span className="label">Phone:</span>
            <span className="value">{data.carrierPhone}</span>
          </div>
          <div className="info-item">
            <span className="label">Vehicle No:</span>
            <span className="value"><strong>{data.vehicleNumber}</strong></span>
          </div>
          <div className="info-item">
            <span className="label">Driver Name:</span>
            <span className="value">{data.driverName}</span>
          </div>
          <div className="info-item full-width">
            <span className="label">Destination:</span>
            <span className="value">{data.destination}</span>
          </div>
          <div className="info-item full-width">
            <span className="label">Purpose:</span>
            <span className="value">{data.purpose}</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Items Being Transported</h3>
        <table className="form-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '12%' }}>Item Code</th>
              <th style={{ width: '30%' }}>Description</th>
              <th style={{ width: '12%' }}>Quantity</th>
              <th style={{ width: '8%' }}>Unit</th>
              <th style={{ width: '13%' }}>Est. Value (Birr)</th>
              <th style={{ width: '20%' }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td><code>{item.itemCode}</code></td>
                <td><strong>{item.description}</strong></td>
                <td className="text-right">{item.quantity}</td>
                <td>{item.unit}</td>
                <td className="text-right">{item.value}</td>
                <td className="small-text">{item.remarks}</td>
              </tr>
            ))}
            {/* Empty rows */}
            {[...Array(2)].map((_, i) => (
              <tr key={`empty-${i}`} className="empty-row">
                <td>{data.items.length + i + 1}</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td colSpan="5" className="text-right"><strong>Total Estimated Value:</strong></td>
              <td className="text-right"><strong>{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="form-section">
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Expected Return:</span>
            <span className="value">{data.returnExpected}</span>
          </div>
          <div className="info-item">
            <span className="label">Authorized By:</span>
            <span className="value"><strong>{data.authorizedBy}</strong></span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="signature-grid signature-grid-4">
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">Prepared By</div>
            <div className="signature-details">
              <p>Name: _____________________</p>
              <p>Time: _____________________</p>
            </div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">Authorized By</div>
            <div className="signature-details">
              <p>Name: {data.authorizedBy}</p>
              <p>Time: _____________________</p>
            </div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">Security Out (Gate)</div>
            <div className="signature-details">
              <p>Name: _____________________</p>
              <p>Time: _____________________</p>
            </div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">Security In (Return)</div>
            <div className="signature-details">
              <p>Name: _____________________</p>
              <p>Time: _____________________</p>
            </div>
          </div>
        </div>
      </div>

      <div className="gate-pass-instructions">
        <h4>⚠ SECURITY INSTRUCTIONS:</h4>
        <div className="instructions-grid">
          <div>
            <strong>Before Exit:</strong>
            <ul>
              <li>Verify all items listed match physical items</li>
              <li>Check carrier ID and vehicle documents</li>
              <li>Confirm authorization signatures</li>
              <li>Record exact exit time</li>
            </ul>
          </div>
          <div>
            <strong>Upon Return (if applicable):</strong>
            <ul>
              <li>Check for returned items</li>
              <li>Note any discrepancies</li>
              <li>Record return time</li>
              <li>Forward to relevant department</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="form-footer">
        <div className="footer-stamps">
          <div className="stamp-box">
            <p className="stamp-label">Company Seal</p>
          </div>
          <div className="stamp-box">
            <p className="stamp-label">Security Stamp</p>
          </div>
        </div>
        <p className="footer-text"><strong>IMPORTANT:</strong> This pass must be presented to security. Invalid without proper authorization.</p>
        <p className="footer-text small">Form No: F-SEC-001 | Rev: 02 | Generated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default GatePassForm;

