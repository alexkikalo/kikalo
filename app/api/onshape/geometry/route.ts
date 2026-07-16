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
      {
        error: 'Onshape API credentials are not configured',
        hint: 'Add ONSHAPE_NOVASHELL_ACCESS_KEY and ONSHAPE_NOVASHELL_SECRET_KEY in Vercel Environment Variables',
      },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const width = parseFloat(searchParams.get('width') || '4.72')
  const depth = parseFloat(searchParams.get('depth') || '3.74')
  const height = parseFloat(searchParams.get('height') || '1.77')

  if ([width, depth, height].some((v) => isNaN(v) || v <= 0)) {
    return NextResponse.json({ error: 'Invalid dimensions' }, { status: 400 })
  }

  const credentials = Buffer.from(`${accessKey}:${secretKey}`).toString('base64')

  // Multiple formats because Onshape quantity config variables accept different syntaxes
  const configCandidates = [
    `Width=${width.toFixed(3)}+in;Depth=${depth.toFixed(3)}+in;Height=${height.toFixed(3)}+in`,
    `Width=${width.toFixed(3)} inch;Depth=${depth.toFixed(3)} inch;Height=${height.toFixed(3)} inch`,
    `Width=${width.toFixed(3)};Depth=${depth.toFixed(3)};Height=${height.toFixed(3)}`,
    // Some older documents use lowercase or different separators
    `Width=${width};Depth=${depth};Height=${height}`,
  ]

  const did = 'c0783d484462993857a94bb1'
  const wid = 'd4a9f4803f10a4f65f2f8cf3'
  const eid = '7b6ee8c5ab24994b708ff864'
  const baseUrl = `https://cad.onshape.com/api/v6/partstudios/d/${did}/w/${wid}/e/${eid}/tessellatedfaces`

  const attempts: any[] = []

  for (const configString of configCandidates) {
    try {
      const encodedConfig = encodeURIComponent(configString)
      const url = `${baseUrl}?configuration=${encodedConfig}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: 'application/json;charset=UTF-8; qs=0.09',
        },
        // Onshape can be slow on cold tessellation
        // @ts-ignore
        next: { revalidate: 0 },
      })

      const responseText = await response.text()
      let data: any = null
      try {
        data = JSON.parse(responseText)
      } catch {
        // not JSON
      }

      if (!response.ok) {
        attempts.push({
          configString,
          status: response.status,
          body: responseText.slice(0, 500),
        })
        continue
      }

      // Check for geometry
      const faces = data?.bodies?.[0]?.faces?.length || 0
      if (faces === 0) {
        attempts.push({
          configString,
          status: 200,
          body: 'Empty geometry (0 faces)',
          keys: data ? Object.keys(data) : [],
        })
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
      attempts.push({
        configString,
        error: String(error),
      })
    }
  }

  console.error('Onshape geometry error (all formats failed):', attempts)

  return NextResponse.json(
    {
      error: 'Failed to fetch geometry from Onshape',
      hint: 'Check API keys, document access, and that Width/Depth/Height are the exact configuration parameter names in the Part Studio.',
      attempts,
      document: { did, wid, eid },
    },
    { status: 500 }
  )
}
