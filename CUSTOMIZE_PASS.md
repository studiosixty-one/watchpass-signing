# Customizing Apple Wallet Passes

This guide explains all the ways you can customize your Apple Wallet passes.

## Current Pass Structure

The pass is generated in `netlify/functions/generate-pass.js` starting at line 133. Here's what you can customize:

## 1. Colors

Customize the pass appearance with colors:

```javascript
const passJSON = {
  // ... other fields ...
  foregroundColor: 'rgb(0, 0, 0)',      // Text color (black)
  backgroundColor: 'rgb(255, 255, 255)', // Background color (white)
  labelColor: 'rgb(128, 128, 128)',     // Label text color (gray)
  // You can also use hex: '#FF5733'
};
```

**Color Format Options:**
- `rgb(r, g, b)` - e.g., `rgb(255, 87, 51)`
- `rgba(r, g, b, a)` - e.g., `rgba(255, 87, 51, 0.9)`
- `#RRGGBB` - e.g., `#FF5733`
- `#RRGGBBAA` - e.g., `#FF5733E6`

## 2. Images

### Logo (Top of Pass)
- **Size**: 160x50 pixels (or 320x100 for @2x)
- **Format**: PNG with transparency
- **Location**: Upload to Supabase Storage at `wallet-assets/logo.png`

Add to pass JSON:
```javascript
const passJSON = {
  // ... other fields ...
  logoText: watch.brand, // Text shown if logo image missing
  // Logo image is automatically included if found in storage
};
```

### Icon (Notifications)
- Already set up! See `SETUP_ICONS.md`
- Sizes: 29x29, 58x58, 87x87 pixels

### Thumbnail (Optional)
- **Size**: 90x90 pixels (or 180x180 for @2x)
- **Format**: PNG with transparency
- **Location**: Upload to Supabase Storage at `wallet-assets/thumbnail.png`

Add to pass JSON:
```javascript
const passJSON = {
  // ... other fields ...
  generic: {
    // ... fields ...
    thumbnail: {
      // Will be included automatically if found in storage
    }
  }
};
```

### Strip Image (Background, Optional)
- **Size**: 320x84 pixels (or 640x168 for @2x)
- **Format**: PNG or JPEG
- **Location**: Upload to Supabase Storage at `wallet-assets/strip.png`

Add to pass JSON:
```javascript
const passJSON = {
  // ... other fields ...
  generic: {
    // ... fields ...
    // Strip image will be included automatically if found
  }
};
```

## 3. Fields

### Primary Fields (Large, Top)
```javascript
primaryFields: [
  { 
    key: 'brand', 
    label: 'Brand', 
    value: watch.brand,
    textAlignment: 'PKTextAlignmentLeft' // or Right, Center, Natural
  },
  { 
    key: 'model', 
    label: 'Model', 
    value: watch.model 
  }
]
```

### Secondary Fields (Medium, Middle)
```javascript
secondaryFields: [
  { 
    key: 'serial', 
    label: 'Serial Number', 
    value: watch.serialNumber 
  },
  { 
    key: 'uuid', 
    label: 'Ownership UUID', 
    value: ownershipUuid 
  }
]
```

### Auxiliary Fields (Small, Bottom)
```javascript
auxiliaryFields: [
  { 
    key: 'date', 
    label: 'Registered', 
    value: new Date(watch.createdAt).toLocaleDateString(),
    dateStyle: 'PKDateStyleShort', // or Medium, Long, Full
    timeStyle: 'PKDateStyleNone'
  },
  { 
    key: 'price', 
    label: 'Value', 
    value: `$${watch.price || 'N/A'}`,
    currencyCode: 'USD'
  }
]
```

### Header Fields (Top, Small)
```javascript
headerFields: [
  { 
    key: 'status', 
    label: 'Status', 
    value: 'Verified' 
  }
]
```

## 4. Barcode/QR Code

Add a scannable code to the pass:

```javascript
const passJSON = {
  // ... other fields ...
  barcodes: [
    {
      message: ownershipUuid, // What to encode
      format: 'PKBarcodeFormatQR', // or PKBarcodeFormatPDF417, PKBarcodeFormatAztec
      messageEncoding: 'iso-8859-1',
      altText: ownershipUuid // Text shown below barcode
    }
  ]
};
```

**Barcode Formats:**
- `PKBarcodeFormatQR` - QR Code (recommended)
- `PKBarcodeFormatPDF417` - PDF417
- `PKBarcodeFormatAztec` - Aztec Code

## 5. Pass Type Styles

You can use different pass styles instead of `generic`:

### Event Ticket
```javascript
const passJSON = {
  // ... other fields ...
  eventTicket: {
    primaryFields: [...],
    secondaryFields: [...],
    auxiliaryFields: [...],
    backFields: [...] // Fields shown when pass is flipped
  }
};
```

### Boarding Pass
```javascript
const passJSON = {
  // ... other fields ...
  boardingPass: {
    primaryFields: [...],
    secondaryFields: [...],
    auxiliaryFields: [...],
    transitType: 'PKTransitTypeAir' // or Bus, Boat, Train, Generic
  }
};
```

### Store Card
```javascript
const passJSON = {
  // ... other fields ...
  storeCard: {
    primaryFields: [...],
    secondaryFields: [...],
    auxiliaryFields: [...]
  }
};
```

## 6. Localization

Add translations for different languages:

```javascript
const passJSON = {
  // ... other fields ...
  localization: {
    'en': {
      'brand': 'Brand',
      'model': 'Model'
    },
    'es': {
      'brand': 'Marca',
      'model': 'Modelo'
    }
  }
};
```

## 7. Web Service (Pass Updates)

Enable push notifications when pass data changes:

```javascript
const passJSON = {
  // ... other fields ...
  webServiceURL: 'https://your-api.com/passes',
  authenticationToken: 'your-auth-token',
  // When ownership changes, send push notification to update pass
};
```

## 8. Expiration & Relevance

```javascript
const passJSON = {
  // ... other fields ...
  expirationDate: '2025-12-31T23:59:59Z', // ISO 8601 format
  voided: false, // Set to true to invalidate pass
  relevantDate: new Date().toISOString(), // When pass becomes relevant
  locations: [ // Show pass when near these locations
    {
      latitude: 37.7749,
      longitude: -122.4194,
      relevantText: 'Near San Francisco'
    }
  ]
};
```

## Example: Fully Customized Pass

```javascript
const passJSON = {
  formatVersion: 1,
  passTypeIdentifier: passTypeId,
  serialNumber: watch.serialNumber,
  teamIdentifier: teamId,
  organizationName: orgName,
  description: 'Watch Ownership Certificate',
  logoText: watch.brand,
  
  // Colors
  foregroundColor: 'rgb(255, 255, 255)',
  backgroundColor: 'rgb(30, 30, 30)',
  labelColor: 'rgb(200, 200, 200)',
  
  // Barcode
  barcodes: [{
    message: ownershipUuid,
    format: 'PKBarcodeFormatQR',
    messageEncoding: 'iso-8859-1',
    altText: ownershipUuid
  }],
  
  // Fields
  generic: {
    primaryFields: [
      { 
        key: 'brand', 
        label: 'Brand', 
        value: watch.brand,
        textAlignment: 'PKTextAlignmentLeft'
      }
    ],
    secondaryFields: [
      { 
        key: 'serial', 
        label: 'Serial', 
        value: watch.serialNumber 
      },
      { 
        key: 'model', 
        label: 'Model', 
        value: watch.model 
      }
    ],
    auxiliaryFields: [
      { 
        key: 'date', 
        label: 'Registered', 
        value: new Date(watch.createdAt).toLocaleDateString()
      }
    ]
  }
};
```

## Where to Make Changes

Edit `pass-signing-service/netlify/functions/generate-pass.js` starting at line 133 where `passJSON` is created.

After making changes:
1. Commit and push to GitHub
2. Netlify will automatically redeploy
3. Test pass generation in your app

## Testing Customizations

1. Make changes to `passJSON` in the function
2. Deploy to Netlify
3. Generate a new pass in your iOS app
4. Check Apple Wallet to see changes
5. Iterate as needed

## Resources

- [Apple Pass Design Guidelines](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html)
- [Pass JSON Reference](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html#//apple_ref/doc/uid/TP40012195-CH4-SW1)

