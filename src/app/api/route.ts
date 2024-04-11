import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '../util/corsHeaders';

// This function is the Middleware handler
export default async function middleware(req: NextRequest) {
  // Allow all CORS requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { headers: corsHeaders });
  }

  // Handling POST requests
  if (req.method === 'POST') {
    // Parse the request body
    const body = await req.json();
    const [userOp, entrypoint] = body.params;
    console.log(entrypoint);

    const data = {
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_paymasterAndDataForUserOperation',
      params: [userOp, entrypoint, '0x14A34'],
    };

    // Proxy the request to an external API
    const paymasterResult = await fetch('https://paymaster.base.org', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Parse the response from the external API
    const result = await paymasterResult.json();

    // Return the response to the client
    return new NextResponse(JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      result: { paymasterAndData: result.result },
    }), { headers: corsHeaders });
  }

  // For other HTTP methods, or if no method matches, continue processing other routes
  return NextResponse.next();
}
