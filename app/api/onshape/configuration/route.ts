import { NextResponse } from 'next/server'

/**
 * Get configuration information from the Onshape element
 * GET /api/onshape/configuration
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

  const credentials = Buffer.from(`${accessKey}:${secretKey}`).toString('base64')

  try {
    const response = await fetch(
      'https://cad.onshape.com/api/v6/elements/d/c0783d484462993857a94bb1/w/d4a9f4803f10a4f65f2f8cf3/e/7b6ee8c5ab24994b708ff864/configuration',
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
          error: 'Failed to fetch configuration from Onshape',
          status: response.status,
          details: errorText,
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      configurationParameters: data.configurationParameters || [],
      currentConfiguration: data.currentConfiguration || [],
      raw: data, // Include raw response for debugging
    })
  } catch (error) {
    console.error('Onshape configuration error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configuration', details: String(error) },
      { status: 500 }
    )
  }
}
