import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import './ItemList.css';

const ItemList = ({ refreshTrigger }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/items`);
      
      if (res.data.success) {
        setItems(res.data.data);
        setError('');
      }
    } catch (err) {
      setError('Failed to fetch items. Please try again.');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const res = await axios.delete(`${API_URL}/api/items/${id}`);
      
      if (res.data.success) {
        setItems(items.filter(item => item._id !== id));
      }
    } catch (err) {
      alert('Failed to delete item. Please try again.');
      console.error('Error deleting item:', err);
    }
  };

  if (loading) {
    return (
      <div className="item-list-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="item-list-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="item-list-container">
      <div className="list-header">
        <h2>Items List</h2>
        <span className="item-count">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="9" strokeWidth="2"/>
            <line x1="9" y1="15" x2="15" y2="15" strokeWidth="2"/>
          </svg>
          <h3>No items yet</h3>
          <p>Add your first item using the form above</p>
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <div key={item._id} className="item-card">
              <div className="item-header">
                <h3 className="item-name">{item.name}</h3>
                <span className="item-price">Rs. {Math.round(item.price)}</span>
              </div>
              
              <p className="item-description">{item.description}</p>
              
              {item.variants && item.variants.length > 0 && (
                <div className="item-variants">
                  <strong>Variants:</strong>
                  <div className="variants-list">
                    {item.variants.map((variant, index) => (
                      <span key={index} className="variant-badge">
                        {variant}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="item-footer">
                <span className="item-date">
                  Added: {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(item._id)}
                  title="Delete item"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="3 6 5 6 21 6" strokeWidth="2"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2"/>
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemList;
