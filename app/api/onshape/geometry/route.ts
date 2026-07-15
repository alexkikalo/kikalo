import { NextResponse } from 'next/server'

/**
 * Fetch tessellated geometry from Onshape
 * GET /api/onshape/geometry
 *
 * Query params (future):
 * - width, depth, height: custom dimensions
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
  const width = searchParams.get('width')
  const depth = searchParams.get('depth')
  const height = searchParams.get('height')

  const credentials = Buffer.from(`${accessKey}:${secretKey}`).toString('base64')

  // Build configuration string if dimensions are provided
  // Note: This assumes your model uses Configuration parameters.
  // If using Variables, we may need a different approach.
  let configurationParam = ''
  if (width && depth && height) {
    // Example encoding - adjust based on your actual parameter IDs
    configurationParam = `?configuration=Width%3D${width}%3BDepth%3D${depth}%3BHeight%3D${height}`
  }

  try {
    // Fetch tessellated faces (good for rendering)
    const url = `https://cad.onshape.com/api/v6/partstudios/d/c0783d484462993857a94bb1/w/d4a9f4803f10a4f65f2f8cf3/e/7b6ee8c5ab24994b708ff864/tessellatedfaces${configurationParam}`

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
      message: 'Geometry fetched successfully',
      hasConfiguration: !!configurationParam,
      dimensions: { width, depth, height },
      facesCount: data.bodies?.[0]?.faces?.length || 0,
      // In production we would process and return simplified mesh data here
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
