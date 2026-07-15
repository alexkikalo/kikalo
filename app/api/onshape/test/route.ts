import { NextResponse } from 'next/server'

/**
 * Test endpoint to verify Onshape API connectivity
 * GET /api/onshape/test
 */
export async function GET() {
  const accessKey = process.env.ONSHAPE_NOVASHELL_ACCESS_KEY
  const secretKey = process.env.ONSHAPE_NOVASHELL_SECRET_KEY

  if (!accessKey || !secretKey) {
    return NextResponse.json(
      { error: 'Onshape API credentials are not configured' },
      { status: 500 }
    )
  }

  // Basic Auth header for Onshape
  const credentials = Buffer.from(`${accessKey}:${secretKey}`).toString('base64')

  try {
    // Simple test call - get element information
    const response = await fetch(
      'https://cad.onshape.com/api/v6/elements/d/c0783d484462993857a94bb1/w/d4a9f4803f10a4f65f2f8cf3/e/7b6ee8c5ab24994b708ff864',
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Accept': 'application/json;charset=UTF-8; qs=0.09',
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { 
          error: 'Onshape API request failed', 
          status: response.status,
          details: errorText 
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Onshape',
      elementName: data.name || 'Unknown',
      elementType: data.elementType || 'Unknown',
    })
  } catch (error) {
    console.error('Onshape API error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to Onshape', details: String(error) },
      { status: 500 }
    )
  }
}
