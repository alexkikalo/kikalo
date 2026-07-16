import { NextResponse } from 'next/server'

const DID = 'c0783d484462993857a94bb1'
const WID = 'd4a9f4803f10a4f65f2f8cf3'
const EID = '7b6ee8c5ab24994b708ff864'

// Ranges defined in the Onshape Part Studio configuration variables
const ONSHAPE_RANGES = {
  width:  { min: 2, max: 6 },
  depth:  { min: 2, max: 3 },
  height: { min: 2, max: 6 },
}

/**
 * Fetch tessellated geometry from Onshape using live configuration variables.
 * GET /api/onshape/geometry?width=xx&depth=yy&height=zz
 *
 * Parameter IDs are confirmed: Width, Depth, Height (quantity / LENGTH / inch)
 */
export async function GET(request: Request) {
  const accessKey = process.env.ONSHAPE_NOVASHELL_ACCESS_KEY
  const secretKey = process.env.ONSHAPE_NOVASHELL_SECRET_KEY

  if (!accessKey || !secretKey) {
    return NextResponse.json(
      {
        error: 'Onshape API credentials are not configured',
        hint: 'Add ONSHAPE_NOVASHELL_ACCESS_KEY and ONSHAPE_NOVASHELL_SECRET_KEY in Vercel',
      },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  let width = parseFloat(searchParams.get('width') || '4.72')
  let depth = parseFloat(searchParams.get('depth') || '3.74')
  let height = parseFloat(searchParams.get('height') || '1.77')

  if ([width, depth, height].some((v) => isNaN(v) || v <= 0)) {
    return NextResponse.json({ error: 'Invalid dimensions' }, { status: 400 })
  }

  // Clamp to the ranges defined in the Onshape configuration variables
  // (sending values outside min/max often causes the tessellation to fail)
  const original = { width, depth, height }
  width = Math.min(ONSHAPE_RANGES.width.max, Math.max(ONSHAPE_RANGES.width.min, width))
  depth = Math.min(ONSHAPE_RANGES.depth.max, Math.max(ONSHAPE_RANGES.depth.min, depth))
  height = Math.min(ONSHAPE_RANGES.height.max, Math.max(ONSHAPE_RANGES.height.min, height))

  const credentials = Buffer.from(`${accessKey}:${secretKey}`).toString('base64')
  const authHeaders = {
    Authorization: `Basic ${credentials}`,
    Accept: 'application/json;charset=UTF-8; qs=0.09',
  }

  // Confirmed working formats for quantity configuration variables (LENGTH / inch).
  // The currentConfiguration in Onshape uses expression style "2 in".
  // Onshape accepts both "+inch" and "+in" in the configuration query string.
  const configCandidates = [
    // Most common / recommended
    `Width=${width.toFixed(3)}+inch;Depth=${depth.toFixed(3)}+inch;Height=${height.toFixed(3)}+inch`,
    `Width=${width.toFixed(3)}+in;Depth=${depth.toFixed(3)}+in;Height=${height.toFixed(3)}+in`,
    // Expression style (matches what Onshape shows internally)
    `Width=${width.toFixed(3)} in;Depth=${depth.toFixed(3)} in;Height=${height.toFixed(3)} in`,
    // Bare numbers (sometimes works when units are implied)
    `Width=${width.toFixed(3)};Depth=${depth.toFixed(3)};Height=${height.toFixed(3)}`,
    // Default (no configuration) — useful connectivity check
    '',
  ]

  const baseUrl = `https://cad.onshape.com/api/v6/partstudios/d/${DID}/w/${WID}/e/${EID}/tessellatedfaces`
  const attempts: any[] = []

  for (const configString of configCandidates) {
    try {
      const url = configString
        ? `${baseUrl}?configuration=${encodeURIComponent(configString)}`
        : baseUrl

      const response = await fetch(url, {
        method: 'GET',
        headers: authHeaders,
      })

      const responseText = await response.text()
      let data: any = null
      try {
        data = JSON.parse(responseText)
      } catch {
        /* ignore */
      }

      if (!response.ok) {
        attempts.push({
          configString: configString || '(none)',
          status: response.status,
          body: responseText.slice(0, 500),
        })
        continue
      }

      const faces = data?.bodies?.[0]?.faces?.length || 0
      if (faces === 0) {
        attempts.push({
          configString: configString || '(none)',
          status: 200,
          body: '0 faces returned',
          topKeys: data ? Object.keys(data) : [],
        })
        continue
      }

      return NextResponse.json({
        success: true,
        message: 'Geometry fetched',
        dimensionsIn: { width, depth, height },
        originalRequested: original,
        clamped: original.width !== width || original.depth !== depth || original.height !== height,
        configString: configString || '(default)',
        facesCount: faces,
        raw: data,
      })
    } catch (error) {
      attempts.push({
        configString: configString || '(none)',
        error: String(error),
      })
    }
  }

  console.error('Onshape geometry error (all formats failed):', attempts)

  return NextResponse.json(
    {
      error: 'Failed to fetch geometry from Onshape',
      hint: 'All configuration string formats failed. See attempts for details.',
      requested: original,
      clampedTo: { width, depth, height },
      onshapeRanges: ONSHAPE_RANGES,
      attempts,
      document: { did: DID, wid: WID, eid: EID },
    },
    { status: 500 }
  )
}
