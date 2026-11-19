# PDF Download Test Instructions

## Current Status
The Quotation Management System is 68% complete (43/63 tasks). All core functionality is implemented, but PDF download may have issues.

## Testing Steps

### 1. Start the Application
```bash
# Terminal 1 - Start backend server
cd server
npm start

# Terminal 2 - Start frontend
cd client
npm start
```

### 2. Test Quotation PDF Download

1. Navigate to **Create Quotation** page
2. Fill in customer details:
   - Customer Name: Test Customer
   - Address: Test Address
   - City: Test City
   - Phone: 1234567890
   - Email: test@example.com

3. Add at least one item:
   - Select an item from dropdown
   - Modify quantity/rate if needed
   - Click "Add Items to Summary"

4. Click **"📄 Download PDF"** button

5. **Open Browser Console** (Press F12 → Console tab)

### 3. Check for Errors

Look for error messages in the console:

**Common Issues:**
- ❌ "Please fill in customer details..." → Form validation issue
- ❌ "Logo failed to load" → Image loading issue (non-critical)
- ❌ "Cannot read property..." → Data structure mismatch
- ✅ "PDF generation completed successfully" → Working!

### 4. Expected Behavior

**Success:**
- Console shows: "PDF generation completed successfully"
- PDF file downloads automatically
- Filename: `M-Marine-Quotation-XXX-DD-MM-YYYY-YYNK.pdf`

**PDF Should Contain:**
- M Marine Services logo and header
- "QUOTATION" title (not "INVOICE")
- Customer details
- Line items table
- Calculations (subtotal, GST, total, round-off)
- Amount in words
- Bank details
- Blue stripe on right edge

## Debugging

### If PDF doesn't download:

1. **Check Console Errors**
   - Copy the exact error message
   - Note which line of code failed

2. **Verify Data Structure**
   Open console and type:
   ```javascript
   // This will show what data is being passed
   console.log('QuotationData:', quotationData);
   console.log('CartItems:', cartItems);
   console.log('Calculations:', calculations);
   ```

3. **Check Network Tab**
   - Open F12 → Network tab
   - Try downloading again
   - Look for any failed API calls

### If PDF downloads but looks wrong:

1. **Wrong title (says "INVOICE" instead of "QUOTATION")**
   - The function might be calling the wrong generator

2. **Missing data in PDF**
   - Check that all fields in the form are filled
   - Verify calculations are showing in the preview panel

3. **Missing logo or icons**
   - Check that image files exist in `client/public/`:
     - marine-logo.jpg (or logo.jpeg)
     - icon-phone.jpg
     - icon-email.jpg
     - icon-location.jpg

## Quick Fixes

### Fix 1: Missing Images
If logo or icons are missing, the PDF will still generate but without images.
- Place images in `client/public/` folder
- Images should be JPEG format

### Fix 2: Field Name Mismatch
If you see errors about "customerName is undefined":
- The function expects `quotationData.customerName`
- Your form might be using a different field name

## Report Issues

If PDF still doesn't work after these steps, please provide:
1. **Exact error message** from console
2. **Screenshot** of the error
3. **Browser** you're using (Chrome, Firefox, etc.)
4. **What happens** when you click download (nothing? error? wrong file?)

## Next Steps

Once PDF download is confirmed working:
- ✅ Quotation system is 100% functional
- ✅ Ready to commit to GitHub
- ✅ Can proceed with deployment

## GitHub Repository
https://github.com/nkmarine01-cmyk/Invoice-System.git
