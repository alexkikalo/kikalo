import { NextResponse } from 'next/server'

/**
 * Fetch tessellated geometry from Onshape (values in inches)
 * GET /api/onshape/geometry?width=xx&depth=yy&height=zz
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
  const width = parseFloat(searchParams.get('width') || '4.72')
  const depth = parseFloat(searchParams.get('depth') || '3.74')
  const height = parseFloat(searchParams.get('height') || '1.77')

  const credentials = Buffer.from(`${accessKey}:${secretKey}`).toString('base64')

  // Build configuration string (values already in inches)
  const configString = `Width=${width.toFixed(3)};Depth=${depth.toFixed(3)};Height=${height.toFixed(3)}`
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
      message: 'Geometry fetched',
      dimensionsIn: { width, depth, height },
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
