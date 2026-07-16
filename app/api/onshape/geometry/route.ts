import { NextResponse } from 'next/server'

/**
 * Fetch tessellated geometry from Onshape (values in inches)
 * GET /api/onshape/geometry?width=xx&depth=yy&height=zz
 *
 * Configuration parameters are named: Width, Depth, Height
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

  // Prefer unit-aware string (common for quantity config variables)
  // Fallback formats are tried if the first fails.
  const configCandidates = [
    `Width=${width.toFixed(3)}+in;Depth=${depth.toFixed(3)}+in;Height=${height.toFixed(3)}+in`,
    `Width=${width.toFixed(3)} inch;Depth=${depth.toFixed(3)} inch;Height=${height.toFixed(3)} inch`,
    `Width=${width.toFixed(3)};Depth=${depth.toFixed(3)};Height=${height.toFixed(3)}`,
  ]

  const baseUrl = 'https://cad.onshape.com/api/v6/partstudios/d/c0783d484462993857a94bb1/w/d4a9f4803f10a4f65f2f8cf3/e/7b6ee8c5ab24994b708ff864/tessellatedfaces'

  let lastError: any = null

  for (const configString of configCandidates) {
    try {
      const encodedConfig = encodeURIComponent(configString)
      const url = `${baseUrl}?configuration=${encodedConfig}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Accept': 'application/json;charset=UTF-8; qs=0.09',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        lastError = { status: response.status, details: errorText, configString }
        continue // try next format
      }

      const data = await response.json()

      // Sanity check: we got some geometry
      const faces = data.bodies?.[0]?.faces?.length || 0
      if (faces === 0) {
        lastError = { status: 200, details: 'Empty geometry returned', configString }
        continue
      }

      return NextResponse.json({
        success: true,
        message: 'Geometry fetched',
        dimensionsIn: { width, depth, height },
        configString,
        facesCount: faces,
        raw: data,
      })
    } catch (error) {
      lastError = { details: String(error), configString }
    }
  }

  console.error('Onshape geometry error (all formats failed):', lastError)
  return NextResponse.json(
    {
      error: 'Failed to fetch geometry from Onshape',
      details: lastError,
    },
    { status: 500 }
  )
}
