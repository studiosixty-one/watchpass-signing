// Netlify Serverless Function for Apple Wallet Pass Signing
// This handles the actual PKCS#7 signing that Deno Edge Functions can't easily do

// Using a simpler approach: we'll create the pass structure and sign it manually
// This avoids needing pass templates

const crypto = require('crypto');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

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
    const certBase64 = process.env.APPLE_PASS_CERT_BASE64;

    if (!teamId || !certBase64 || !certPassword) {
      return {
        statusCode: 500,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Missing required environment variables',
          required: ['APPLE_TEAM_ID', 'APPLE_PASS_CERT_BASE64', 'APPLE_PASS_CERT_PASSWORD'],
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

    // Calculate SHA1 hash for manifest
    const passJsonHash = crypto.createHash('sha1').update(passJsonContent).digest('hex');

    // Create manifest.json
    const manifest = {
      'pass.json': passJsonHash,
    };
    const manifestContent = JSON.stringify(manifest);

    // Sign manifest.json with PKCS#7
    // We need to extract the private key from the .p12 certificate
    const certBuffer = Buffer.from(certBase64, 'base64');
    
    // Write certificate to temp file (Netlify functions have /tmp directory)
    const tmpDir = '/tmp';
    const certPath = path.join(tmpDir, 'cert.p12');
    const manifestPath = path.join(tmpDir, 'manifest.json');
    const signaturePath = path.join(tmpDir, 'signature');
    
    fs.writeFileSync(certPath, certBuffer);
    fs.writeFileSync(manifestPath, manifestContent);

    try {
      // Extract private key and certificate from .p12
      // Use openssl to extract the key (Netlify functions have openssl available)
      const keyPath = path.join(tmpDir, 'key.pem');
      const certPemPath = path.join(tmpDir, 'cert.pem');
      
      // Extract private key
      execSync(
        `openssl pkcs12 -in ${certPath} -nocerts -nodes -passin pass:${certPassword} -out ${keyPath}`,
        { stdio: 'pipe' }
      );
      
      // Extract certificate
      execSync(
        `openssl pkcs12 -in ${certPath} -clcerts -nokeys -passin pass:${certPassword} -out ${certPemPath}`,
        { stdio: 'pipe' }
      );

      // Sign manifest.json with PKCS#7
      execSync(
        `openssl smime -binary -sign -certfile ${certPemPath} -signer ${certPemPath} -inkey ${keyPath} -in ${manifestPath} -out ${signaturePath} -outform DER -nodetach`,
        { stdio: 'pipe' }
      );

      // Read signature
      const signature = fs.readFileSync(signaturePath);

      // Create .pkpass ZIP file
      const zip = new JSZip();
      zip.file('pass.json', passJsonContent);
      zip.file('manifest.json', manifestContent);
      zip.file('signature', signature);

      // Generate ZIP
      const pkpassBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      });

      // Clean up temp files
      [certPath, keyPath, certPemPath, manifestPath, signaturePath].forEach((file) => {
        try {
          if (fs.existsSync(file)) fs.unlinkSync(file);
        } catch (e) {
          // Ignore cleanup errors
        }
      });

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
