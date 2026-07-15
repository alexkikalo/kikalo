import { NextResponse } from 'next/server'

/**
 * Fetch tessellated geometry from Onshape with configuration
 * GET /api/onshape/geometry?width=xx&depth=yy&height=zz (in mm)
 */
export async function GET(request: Request) {
  const accessKey = process.env.ONSHAPE_NOVASHELL_ACCESS_KEY
  const secretKey = process.env.ONSHAPE_NOVASHELL_SECRET_KEY

  if (!accessKey || !secretKey) {
    return NextResponse.json(
      { error: 'Onshape API credentials are not configured' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const widthMm = parseFloat(searchParams.get('width') || '120')
  const depthMm = parseFloat(searchParams.get('depth') || '95')
  const heightMm = parseFloat(searchParams.get('height') || '45')

  const credentials = Buffer.from(`${accessKey}:${secretKey}`).toString('base64')

  // Convert mm to inches (model is in inches)
  const INCH = 25.4
  const widthIn = (widthMm / INCH).toFixed(3)
  const depthIn = (depthMm / INCH).toFixed(3)
  const heightIn = (heightMm / INCH).toFixed(3)

  // Build configuration string for Onshape
  // Format: Width=5.500;Depth=3.740;Height=1.770
  const configString = `Width=${widthIn};Depth=${depthIn};Height=${heightIn}`
  const encodedConfig = encodeURIComponent(configString)

  try {
    const url = `https://cad.onshape.com/api/v6/partstudios/d/c0783d484462993857a94bb1/w/d4a9f4803f10a4f65f2f8cf3/e/7b6ee8c5ab24994b708ff864/tessellatedfaces?configuration=${encodedConfig}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json;charset=UTF-8; qs=0.09',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          error: 'Failed to fetch geometry from Onshape',
          status: response.status,
          details: errorText,
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Geometry fetched with configuration',
      dimensionsMm: { width: widthMm, depth: depthMm, height: heightMm },
      dimensionsIn: { width: widthIn, depth: depthIn, height: heightIn },
      configString,
      facesCount: data.bodies?.[0]?.faces?.length || 0,
      raw: data,
    })
  } catch (error) {
    console.error('Onshape geometry error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch geometry', details: String(error) },
      { status: 500 }
    )
  }
}
