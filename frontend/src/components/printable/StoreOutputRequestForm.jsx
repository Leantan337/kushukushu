import React from 'react';
import './PrintableForms.css';

const StoreOutputRequestForm = ({ requestData = {} }) => {
  // Sample data for preview
  const data = {
    requestNumber: requestData.requestNumber || 'SOR-2024-001',
    date: requestData.date || new Date().toLocaleDateString(),
    time: requestData.time || new Date().toLocaleTimeString(),
    branch: requestData.branch || 'Main Branch',
    requestedBy: requestData.requestedBy || 'Manager Name',
    department: requestData.department || 'Production Department',
    purpose: requestData.purpose || 'Production - Mill Order #MOR-2024-001',
    items: requestData.items || [
      { itemCode: 'RM-001', itemName: 'Teff (White)', quantity: 120, unit: 'kg', binLocation: 'A-12', batchNo: 'B2024-05' },
      { itemCode: 'RM-002', itemName: 'Teff (Red)', quantity: 80, unit: 'kg', binLocation: 'A-13', batchNo: 'B2024-06' },
      { itemCode: 'PKG-001', itemName: 'Plastic Bags (5kg)', quantity: 50, unit: 'pcs', binLocation: 'C-05', batchNo: 'P2024-12' },
    ],
    authorizedBy: requestData.authorizedBy || '',
    receivedBy: requestData.receivedBy || '',
  };

  return (
    <div className="printable-form">
      <div className="form-header">
        <div className="company-logo">
          <div className="logo-placeholder">[COMPANY LOGO]</div>
        </div>
        <div className="form-title">
          <h1>STORE OUTPUT REQUEST</h1>
          <p className="form-subtitle">Material Release Form</p>
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
            <span className="label">Time:</span>
            <span className="value">{data.time}</span>
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
          <div className="info-item full-width">
            <span className="label">Purpose:</span>
            <span className="value">{data.purpose}</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Items to be Released from Store</h3>
        <table className="form-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '12%' }}>Item Code</th>
              <th style={{ width: '25%' }}>Item Description</th>
              <th style={{ width: '12%' }}>Quantity</th>
              <th style={{ width: '8%' }}>Unit</th>
              <th style={{ width: '12%' }}>Bin Location</th>
              <th style={{ width: '12%' }}>Batch No.</th>
              <th style={{ width: '14%' }}>Condition</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td><code>{item.itemCode}</code></td>
                <td><strong>{item.itemName}</strong></td>
                <td className="text-right">{item.quantity}</td>
                <td>{item.unit}</td>
                <td className="text-center">{item.binLocation}</td>
                <td className="text-center small-text">{item.batchNo}</td>
                <td className="text-center">☐ Good ☐ Damaged</td>
              </tr>
            ))}
            {/* Empty rows for manual filling */}
            {[...Array(4)].map((_, i) => (
              <tr key={`empty-${i}`} className="empty-row">
                <td>{data.items.length + i + 1}</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td className="text-center">☐ Good ☐ Damaged</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="form-section">
        <div className="info-box">
          <h4>Instructions for Store Keeper:</h4>
          <ul>
            <li>Verify the identity of the person collecting the materials</li>
            <li>Check item conditions before release</li>
            <li>Update stock records immediately after release</li>
            <li>Obtain signature from the receiver</li>
            <li>Keep this form for store records</li>
          </ul>
        </div>
      </div>

      <div className="form-section">
        <div className="signature-grid">
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">Requested By</div>
            <div className="signature-details">
              <p>Name: {data.requestedBy || '_____________________'}</p>
              <p>Signature: _____________________</p>
              <p>Date: {data.date}</p>
            </div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">Released By (Store Keeper)</div>
            <div className="signature-details">
              <p>Name: _____________________</p>
              <p>Signature: _____________________</p>
              <p>Date: _____________________</p>
            </div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">Received By</div>
            <div className="signature-details">
              <p>Name: _____________________</p>
              <p>Signature: _____________________</p>
              <p>Date: _____________________</p>
            </div>
          </div>
        </div>
      </div>

      <div className="form-footer">
        <div className="footer-stamps">
          <div className="stamp-box">
            <p className="stamp-label">Store Stamp</p>
          </div>
          <div className="stamp-box">
            <p className="stamp-label">Department Stamp</p>
          </div>
        </div>
        <p className="footer-text">This form must be retained for audit purposes. Validity: Issue date only.</p>
        <p className="footer-text small">Form No: F-WH-003 | Rev: 01 | Date: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default StoreOutputRequestForm;

