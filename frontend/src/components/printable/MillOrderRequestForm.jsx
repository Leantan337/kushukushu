import React from 'react';
import './PrintableForms.css';

const MillOrderRequestForm = ({ orderData = {} }) => {
  // Sample data for preview
  const data = {
    requestNumber: orderData.requestNumber || 'MOR-2024-001',
    date: orderData.date || new Date().toLocaleDateString(),
    branch: orderData.branch || 'Main Branch',
    requestedBy: orderData.requestedBy || 'Manager Name',
    department: orderData.department || 'Production',
    items: orderData.items || [
      { product: 'Tella', quantity: 100, unit: 'kg', rawMaterial: 'Teff', rawQty: 120, remarks: '' },
      { product: 'White Teff Flour', quantity: 50, unit: 'kg', rawMaterial: 'White Teff', rawQty: 55, remarks: 'Urgent' },
    ],
    expectedDate: orderData.expectedDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    priority: orderData.priority || 'Normal',
    notes: orderData.notes || '',
  };

  return (
    <div className="printable-form">
      <div className="form-header">
        <div className="company-logo">
          <div className="logo-placeholder">[COMPANY LOGO]</div>
        </div>
        <div className="form-title">
          <h1>MILL ORDER REQUEST FORM</h1>
          <p className="form-subtitle">Production Request Document</p>
        </div>
        <div className="form-number">
          <strong>Request No:</strong>
          <div className="number-box">{data.requestNumber}</div>
        </div>
      </div>

      <div className="form-section">
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Date:</span>
            <span className="value">{data.date}</span>
          </div>
          <div className="info-item">
            <span className="label">Branch:</span>
            <span className="value">{data.branch}</span>
          </div>
          <div className="info-item">
            <span className="label">Requested By:</span>
            <span className="value">{data.requestedBy}</span>
          </div>
          <div className="info-item">
            <span className="label">Department:</span>
            <span className="value">{data.department}</span>
          </div>
          <div className="info-item">
            <span className="label">Priority:</span>
            <span className="value priority-badge">{data.priority}</span>
          </div>
          <div className="info-item">
            <span className="label">Expected Completion:</span>
            <span className="value">{data.expectedDate}</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Production Order Details</h3>
        <table className="form-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '20%' }}>Product to Mill</th>
              <th style={{ width: '12%' }}>Quantity</th>
              <th style={{ width: '8%' }}>Unit</th>
              <th style={{ width: '20%' }}>Raw Material</th>
              <th style={{ width: '12%' }}>Raw Qty</th>
              <th style={{ width: '23%' }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td><strong>{item.product}</strong></td>
                <td className="text-right">{item.quantity}</td>
                <td>{item.unit}</td>
                <td>{item.rawMaterial}</td>
                <td className="text-right">{item.rawQty}</td>
                <td className="small-text">{item.remarks}</td>
              </tr>
            ))}
            {/* Empty rows for manual filling */}
            {[...Array(3)].map((_, i) => (
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
        </table>
      </div>

      {data.notes && (
        <div className="form-section">
          <h3 className="section-title">Additional Notes</h3>
          <div className="notes-box">{data.notes}</div>
        </div>
      )}

      <div className="form-section">
        <div className="signature-grid">
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">Requested By (Manager)</div>
            <div className="signature-details">
              <p>Name: _____________________</p>
              <p>Date: _____________________</p>
            </div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">Approved By (Owner)</div>
            <div className="signature-details">
              <p>Name: _____________________</p>
              <p>Date: _____________________</p>
            </div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">Received By (Mill Operator)</div>
            <div className="signature-details">
              <p>Name: _____________________</p>
              <p>Date: _____________________</p>
            </div>
          </div>
        </div>
      </div>

      <div className="form-footer">
        <p className="footer-text">This is an official production request document. Please keep for records.</p>
        <p className="footer-text small">Generated on {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default MillOrderRequestForm;

