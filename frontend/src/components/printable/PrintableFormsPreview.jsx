import React, { useState } from 'react';
import MillOrderRequestForm from './MillOrderRequestForm';
import StoreOutputRequestForm from './StoreOutputRequestForm';
import GatePassForm from './GatePassForm';
import './PrintableForms.css';

const PrintableFormsPreview = () => {
  const [selectedForm, setSelectedForm] = useState('all');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="forms-preview-container">
      <div className="preview-header no-print">
        <h1>📄 Printable Forms Preview</h1>
        <p>Visual preview of three essential warehouse management forms</p>
        <p style={{ fontSize: '10pt', color: '#999', marginTop: '10px' }}>
          These are print-ready forms that can be filled with actual data and printed for official use.
        </p>
        
        <div className="preview-controls">
          <button onClick={handlePrint}>🖨️ Print Forms</button>
          <select 
            value={selectedForm} 
            onChange={(e) => setSelectedForm(e.target.value)}
            style={{ 
              padding: '10px 15px', 
              fontSize: '12pt', 
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          >
            <option value="all">Show All Forms</option>
            <option value="mill">Mill Order Request Only</option>
            <option value="store">Store Output Request Only</option>
            <option value="gate">Gate Pass Only</option>
          </select>
        </div>
      </div>

      {(selectedForm === 'all' || selectedForm === 'mill') && (
        <>
          <MillOrderRequestForm />
          {selectedForm === 'all' && <div className="form-divider no-print">• • •</div>}
        </>
      )}

      {(selectedForm === 'all' || selectedForm === 'store') && (
        <>
          <StoreOutputRequestForm />
          {selectedForm === 'all' && <div className="form-divider no-print">• • •</div>}
        </>
      )}

      {(selectedForm === 'all' || selectedForm === 'gate') && (
        <GatePassForm />
      )}

      <div className="preview-header no-print" style={{ marginTop: '40px' }}>
        <h3>📋 Form Descriptions</h3>
        <div style={{ marginTop: '15px' }}>
          <div style={{ marginBottom: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
            <strong>1. Mill Order Request Form:</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '10pt' }}>
              Used by managers to request milling/production operations. Shows products to be produced, 
              raw materials needed, and requires approvals from relevant parties.
            </p>
          </div>
          <div style={{ marginBottom: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
            <strong>2. Store Output Request Form:</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '10pt' }}>
              Material release form given to the storekeeper to release items from inventory. 
              Includes item details, bin locations, batch numbers, and signature requirements.
            </p>
          </div>
          <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
            <strong>3. Gate Pass:</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '10pt' }}>
              Security document for items leaving or entering the premises. Includes carrier details, 
              vehicle information, and security verification checkpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableFormsPreview;

