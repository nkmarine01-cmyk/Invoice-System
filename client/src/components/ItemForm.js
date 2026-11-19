import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import './ItemForm.css';

const ItemForm = ({ onItemAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    variants: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [touched, setTouched] = useState({});

  const { name, description, variants, price } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const onBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    if (!description.trim()) {
      setError('Description is required');
      return false;
    }
    if (description.trim().length < 5) {
      setError('Description must be at least 5 characters');
      return false;
    }
    if (!price || price <= 0) {
      setError('Price must be greater than 0');
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const variantsArray = variants
        ? variants.split(',').map(v => v.trim()).filter(v => v)
        : [];

      const res = await axios.post(`${API_URL}/api/items`, {
        name: name.trim(),
        description: description.trim(),
        variants: variantsArray,
        price: parseFloat(price)
      });

      if (res.data.success) {
        setSuccess('Item added successfully!');
        setFormData({
          name: '',
          description: '',
          variants: '',
          price: ''
        });
        setTouched({});
        
        // Notify parent component
        if (onItemAdded) {
          onItemAdded(res.data.data);
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error adding item:', err);
      setError(
        err.response?.data?.error || 'Failed to add item. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="item-form-container">
      <h2>Add New Item</h2>
      <form onSubmit={onSubmit} className="item-form">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-group">
          <label htmlFor="name">
            Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={onChange}
            onBlur={() => onBlur('name')}
            placeholder="Enter item name"
            maxLength="100"
            className={touched.name && !name.trim() ? 'input-error' : ''}
          />
          {touched.name && !name.trim() && (
            <small className="error-text">Name is required</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            onBlur={() => onBlur('description')}
            placeholder="Enter item description"
            rows="4"
            maxLength="500"
            className={touched.description && !description.trim() ? 'input-error' : ''}
          />
          {touched.description && !description.trim() && (
            <small className="error-text">Description is required</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="variants">
            Variants <span className="optional">(optional)</span>
          </label>
          <input
            type="text"
            id="variants"
            name="variants"
            value={variants}
            onChange={onChange}
            placeholder="Enter variants separated by commas (e.g., Small, Medium, Large)"
          />
          <small className="form-hint">Separate multiple variants with commas</small>
        </div>

        <div className="form-group">
          <label htmlFor="price">
            Price (₹) <span className="required">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={price}
            onChange={onChange}
            onBlur={() => onBlur('price')}
            placeholder="0"
            step="1"
            min="0"
            className={touched.price && (!price || price <= 0) ? 'input-error' : ''}
          />
          {touched.price && (!price || price <= 0) && (
            <small className="error-text">Price must be greater than 0</small>
          )}
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? (
            <>
              <span className="btn-spinner"></span>
              Adding...
            </>
          ) : (
            'Add Item'
          )}
        </button>
      </form>
    </div>
  );
};

export default ItemForm;
