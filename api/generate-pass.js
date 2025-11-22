// Vercel Serverless Function for Apple Wallet Pass Signing
// This handles the actual PKCS#7 signing that Deno Edge Functions can't easily do

const { Pass } = require('passkit-generator');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { watch, ownershipUuid } = req.body;

    if (!watch || !ownershipUuid) {
      return res.status(400).json({ error: 'Missing watch or ownershipUuid' });
    }

    // Get environment variables
    const passTypeId = process.env.APPLE_PASS_TYPE_ID || 'pass.com.watchpass.app';
    const teamId = process.env.APPLE_TEAM_ID;
    const orgName = process.env.APPLE_ORG_NAME || 'WatchPass';
    const certPassword = process.env.APPLE_PASS_CERT_PASSWORD;
    const certBase64 = process.env.APPLE_PASS_CERT_BASE64;

    if (!teamId || !certBase64 || !certPassword) {
      return res.status(500).json({ 
        error: 'Missing required environment variables',
        required: ['APPLE_TEAM_ID', 'APPLE_PASS_CERT_BASE64', 'APPLE_PASS_CERT_PASSWORD']
      });
    }

    // Decode certificate
    const certificate = Buffer.from(certBase64, 'base64');

    // Create pass model (minimal - we'll override fields)
    const pass = await Pass({
      model: './models/Generic.pass', // You'll need to create this template
      certificates: {
        wwdr: './certs/wwdr.pem', // Apple's WWDR certificate
        signerCert: certificate,
        signerKey: certificate,
        signerKeyPassphrase: certPassword
      },
      overrides: {
        passTypeIdentifier: passTypeId,
        teamIdentifier: teamId,
        organizationName: orgName,
        serialNumber: watch.serialNumber,
        description: 'Watch Ownership Certificate',
        logoText: watch.brand,
        foregroundColor: 'rgb(0, 0, 0)',
        backgroundColor: 'rgb(255, 255, 255)',
        generic: {
          primaryFields: [
            {
              key: 'brand',
              label: 'Brand',
              value: watch.brand
            },
            {
              key: 'model',
              label: 'Model',
              value: watch.model
            }
          ],
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
        }
      }
    });

    // Generate the .pkpass file
    const passBuffer = await pass.generate();

    // Return the pass
    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', `attachment; filename="watch-${watch.serialNumber}.pkpass"`);
    res.send(passBuffer);

  } catch (error) {
    console.error('Error generating pass:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
};

