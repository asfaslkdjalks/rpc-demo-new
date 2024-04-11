// pages/api/route.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { corsHeaders } from '../../app/util/corsHeaders';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);

  if (req.method === 'OPTIONS') {
    // Handle OPTIONS request (CORS preflight)
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    // Handle POST request
    try {
      const { userOp, entrypoint } = req.body.params;
      console.log(entrypoint);

      const data = {
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_paymasterAndDataForUserOperation',
        params: [userOp, entrypoint, '0x14A34'],
      };

      const paymasterResult = await fetch('https://paymaster.base.org', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!paymasterResult.ok) {
        throw new Error(`HTTP error! status: ${paymasterResult.status}`);
      }

      const result = await paymasterResult.json();

      res.status(200).json({
        id: 1,
        jsonrpc: '2.0',
        result: { paymasterAndData: result.result },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to process the request' });
    }
    return;
  }

  // For non-POST or OPTIONS methods
  res.setHeader('Allow', ['POST', 'OPTIONS']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
