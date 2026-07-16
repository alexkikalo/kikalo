import { NextResponse } from 'next/server'

const DID = 'c0783d484462993857a94bb1'
const WID = 'd4a9f4803f10a4f65f2f8cf3'
const EID = '7b6ee8c5ab24994b708ff864'

/**
 * Fetch tessellated geometry from Onshape using live configuration variables.
 * GET /api/onshape/geometry?width=xx&depth=yy&height=zz
 *
 * Automatically discovers the real parameterIds for Width/Depth/Height
 * from the Part Studio configuration definition.
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
  const width = parseFloat(searchParams.get('width') || '4.72')
  const depth = parseFloat(searchParams.get('depth') || '3.74')
  const height = parseFloat(searchParams.get('height') || '1.77')

  if ([width, depth, height].some((v) => isNaN(v) || v <= 0)) {
    return NextResponse.json({ error: 'Invalid dimensions' }, { status: 400 })
  }

  const credentials = Buffer.from(`${accessKey}:${secretKey}`).toString('base64')
  const authHeaders = {
    Authorization: `Basic ${credentials}`,
    Accept: 'application/json;charset=UTF-8; qs=0.09',
  }

  // 1. Discover real configuration parameters
  let configParams: any[] = []
  try {
    const confRes = await fetch(
      `https://cad.onshape.com/api/v6/elements/d/${DID}/w/${WID}/e/${EID}/configuration`,
      { headers: authHeaders }
    )
    if (confRes.ok) {
      const confData = await confRes.json()
      configParams = confData.configurationParameters || []
    }
  } catch (e) {
    console.warn('Could not fetch configuration definition', e)
  }

  // Helper to find a parameter by friendly name (case-insensitive)
  const findParam = (names: string[]) => {
    for (const name of names) {
      const p = configParams.find(
        (c: any) =>
          (c.parameterName || '').toLowerCase() === name.toLowerCase() ||
          (c.parameterId || '').toLowerCase() === name.toLowerCase()
      )
      if (p) return p
    }
    return null
  }

  const widthParam = findParam(['Width', 'width', 'W', 'Overall Width', 'Overall_Width'])
  const depthParam = findParam(['Depth', 'depth', 'D', 'Overall Depth', 'Overall_Depth', 'Length'])
  const heightParam = findParam(['Height', 'height', 'H', 'Overall Height', 'Overall_Height'])

  // Build candidate configuration strings
  const configCandidates: string[] = []

  // A) Using discovered parameterIds + proper units (best)
  if (widthParam && depthParam && heightParam) {
    const wId = widthParam.parameterId
    const dId = depthParam.parameterId
    const hId = heightParam.parameterId

    // Prefer the unit declared on the quantity parameter
    const unit =
      widthParam.rangeAndDefault?.units ||
      widthParam.message?.rangeAndDefault?.message?.units ||
      'in'

    configCandidates.push(
      `${wId}=${width.toFixed(3)}+${unit};${dId}=${depth.toFixed(3)}+${unit};${hId}=${height.toFixed(3)}+${unit}`
    )
    configCandidates.push(
      `${wId}=${width.toFixed(3)};${dId}=${depth.toFixed(3)};${hId}=${height.toFixed(3)}`
    )
  }

  // B) Friendly names (what you confirmed)
  configCandidates.push(
    `Width=${width.toFixed(3)}+in;Depth=${depth.toFixed(3)}+in;Height=${height.toFixed(3)}+in`
  )
  configCandidates.push(
    `Width=${width.toFixed(3)}+inch;Depth=${depth.toFixed(3)}+inch;Height=${height.toFixed(3)}+inch`
  )
  configCandidates.push(
    `Width=${width.toFixed(3)};Depth=${depth.toFixed(3)};Height=${height.toFixed(3)}`
  )

  // C) No configuration at all (returns default size – useful as last resort / connectivity check)
  configCandidates.push('')

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
          body: responseText.slice(0, 400),
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
        configString: configString || '(default)',
        facesCount: faces,
        discoveredParams: configParams.map((p: any) => ({
          parameterId: p.parameterId,
          parameterName: p.parameterName,
          type: p.btType || p.typeName,
        })),
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
      hint: 'All configuration formats failed. Check the discoveredParams and attempts below.',
      discoveredParams: configParams.map((p: any) => ({
        parameterId: p.parameterId,
        parameterName: p.parameterName,
        type: p.btType || p.typeName,
        units: p.rangeAndDefault?.units || p.message?.rangeAndDefault?.message?.units,
      })),
      attempts,
      document: { did: DID, wid: WID, eid: EID },
    },
    { status: 500 }
  )
}
