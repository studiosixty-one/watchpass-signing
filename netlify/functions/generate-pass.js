// Netlify Function that fetches certificate from Supabase Storage
// This avoids the 4KB Lambda environment variable limit

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const forge = require('node-forge');
const { PNG } = require('pngjs');

// Cache certificate in memory (Lambda container reuse)
let cachedCertificate = null;
let certCacheTime = 0;
const CACHE_TTL = 3600000; // 1 hour

async function getCertificate() {
  // Check cache first
  if (cachedCertificate && Date.now() - certCacheTime < CACHE_TTL) {
    return cachedCertificate;
  }

  // Fetch from Supabase Storage
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  const certPath = process.env.CERT_STORAGE_PATH || 'wallet-certificates/certificate.p12';

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }

  try {
    const response = await fetch(`${supabaseUrl}/storage/v1/object/${certPath}`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch certificate: ${response.status} ${response.statusText}`);
    }

    const certBuffer = await response.arrayBuffer();
    const certBase64 = Buffer.from(certBuffer).toString('base64');

    // Cache it
    cachedCertificate = certBase64;
    certCacheTime = Date.now();

    return certBase64;
  } catch (error) {
    console.error('Error fetching certificate:', error);
    throw error;
  }
}

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { watch, ownershipUuid } = JSON.parse(event.body);

    if (!watch || !ownershipUuid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing watch or ownershipUuid' }),
      };
    }

    // Get environment variables
    const passTypeId = process.env.APPLE_PASS_TYPE_ID;
    const teamId = process.env.APPLE_TEAM_ID;
    const orgName = process.env.APPLE_ORG_NAME;
    const certPassword = process.env.APPLE_PASS_CERT_PASSWORD;

    if (!passTypeId || !teamId || !orgName || !certPassword) {
      return {
        statusCode: 500,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Missing required environment variables',
          required: ['APPLE_PASS_TYPE_ID', 'APPLE_TEAM_ID', 'APPLE_ORG_NAME', 'APPLE_PASS_CERT_PASSWORD'],
        }),
      };
    }

    // Fetch certificate from Supabase Storage
    let certBase64;
    try {
      certBase64 = await getCertificate();
    } catch (certError) {
      return {
        statusCode: 500,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Failed to fetch certificate',
          message: certError.message,
          solution: 'Upload certificate to Supabase Storage and set SUPABASE_URL, SUPABASE_SERVICE_KEY, and CERT_STORAGE_PATH',
        }),
      };
    }

    // Create pass JSON
    const passJSON = {
      formatVersion: 1,
      passTypeIdentifier: passTypeId,
      serialNumber: watch.serialNumber,
      teamIdentifier: teamId,
      organizationName: orgName,
      description: 'Watch Ownership Certificate',
      logoText: watch.brand,
      foregroundColor: 'rgb(0, 0, 0)',
      backgroundColor: 'rgb(255, 255, 255)',
      generic: {
        primaryFields: [
          { key: 'brand', label: 'Brand', value: watch.brand },
          { key: 'model', label: 'Model', value: watch.model },
        ],
        secondaryFields: [
          { key: 'serial', label: 'Serial Number', value: watch.serialNumber },
          { key: 'uuid', label: 'Ownership UUID', value: ownershipUuid },
        ],
      },
    };

    const passJsonContent = JSON.stringify(passJSON);

    // Apple Wallet requires icon images - create placeholder icons
    const iconSizes = [
      { name: 'icon.png', size: 29 },
      { name: 'icon@2x.png', size: 58 },
      { name: 'icon@3x.png', size: 87 }
    ];
    
    // Create properly sized placeholder icons using pngjs
    // Apple requires specific sizes: 29x29, 58x58, 87x87 pixels
    const createPlaceholderIcon = (size) => {
      const png = new PNG({ width: size, height: size });
      
      // Fill with a simple color (light gray with transparency)
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (size * y + x) << 2;
          png.data[idx] = 200;     // R
          png.data[idx + 1] = 200; // G
          png.data[idx + 2] = 200; // B
          png.data[idx + 3] = 255; // A (opaque)
        }
      }
      
      // Convert to buffer
      return PNG.sync.write(png);
    };
    
    // Create icon files
    const iconFiles = {};
    iconSizes.forEach(icon => {
      iconFiles[icon.name] = createPlaceholderIcon(icon.size);
    });

    // Calculate SHA1 hashes for all files (pass.json + icons)
    const fileHashes = {
      'pass.json': crypto.createHash('sha1').update(passJsonContent).digest('hex')
    };
    
    iconSizes.forEach(icon => {
      fileHashes[icon.name] = crypto.createHash('sha1').update(iconFiles[icon.name]).digest('hex');
    });
    
    // Create manifest.json with all file hashes
    const manifestContent = JSON.stringify(fileHashes);

    // Sign manifest.json with PKCS#7 using node-forge
    const certBuffer = Buffer.from(certBase64, 'base64');
    
    try {
      // Convert .p12 to base64 DER format for forge
      const p12Der = forge.util.decode64(certBase64);
      
      // Parse .p12 file
      const p12Asn1 = forge.asn1.fromDer(p12Der);
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, certPassword);
      
      // Extract private key and certificate
      let privateKey = null;
      let certificate = null;
      
      // Get keybags and certbags
      const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
      
      // Get the first key
      if (keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]) {
        privateKey = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
      }
      
      // Get the first certificate
      if (certBags[forge.pki.oids.certBag]) {
        certificate = certBags[forge.pki.oids.certBag][0].cert;
      }
      
      if (!privateKey || !certificate) {
        throw new Error('Failed to extract private key or certificate from .p12 file');
      }
      
      // Apple requires the WWDR (Worldwide Developer Relations) intermediate certificate
      let wwdrCertificate = null;
      const wwdrCertBase64 = process.env.WWDR_CERT_BASE64;
      
      if (wwdrCertBase64) {
        try {
          const wwdrDer = forge.util.decode64(wwdrCertBase64);
          const wwdrAsn1 = forge.asn1.fromDer(wwdrDer);
          wwdrCertificate = forge.pki.certificateFromAsn1(wwdrAsn1);
        } catch (e) {
          console.warn('Failed to parse WWDR certificate:', e.message);
        }
      }
      
      // Create PKCS#7 signed data (detached signature)
      const p7 = forge.pkcs7.createSignedData();
      p7.content = forge.util.createBuffer(manifestContent, 'utf8');
      p7.addCertificate(certificate);
      
      // Add WWDR certificate if available (required by Apple)
      if (wwdrCertificate) {
        p7.addCertificate(wwdrCertificate);
      }
      
      // Add signer with proper attributes for Apple Wallet
      p7.addSigner({
        key: privateKey,
        certificate: certificate,
        digestAlgorithm: forge.pki.oids.sha1,
        authenticatedAttributes: [{
          type: forge.pki.oids.contentType,
          value: forge.pki.oids.data
        }, {
          type: forge.pki.oids.messageDigest
        }, {
          type: forge.pki.oids.signingTime,
          value: new Date()
        }]
      });
      
      // Sign with detached signature (Apple Wallet requirement)
      p7.sign({ detached: true });
      
      // Convert to DER format
      const derBuffer = forge.asn1.toDer(p7.toAsn1()).getBytes();
      const signature = Buffer.from(derBuffer, 'binary');

      // Create .pkpass ZIP file
      const zip = new JSZip();
      zip.file('pass.json', passJsonContent);
      zip.file('manifest.json', manifestContent);
      zip.file('signature', signature);
      
      // Add required icon files
      iconSizes.forEach(icon => {
        zip.file(icon.name, iconFiles[icon.name]);
      });

      // Generate ZIP
      const pkpassBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      });

      // No temp files to clean up (using in-memory processing)

      // Return the .pkpass file
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/vnd.apple.pkpass',
          'Content-Disposition': `attachment; filename="watch-${watch.serialNumber}.pkpass"`,
        },
        body: pkpassBuffer.toString('base64'),
        isBase64Encoded: true,
      };
    } catch (signError) {
      console.error('Signing error:', signError);
      return {
        statusCode: 500,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Failed to sign pass',
          message: signError.message,
          details: process.env.NETLIFY_DEV ? signError.stack : undefined,
        }),
      };
    }
  } catch (error) {
    console.error('Error generating pass:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error.message,
        details: process.env.NETLIFY_DEV ? error.stack : undefined,
      }),
    };
  }
};

