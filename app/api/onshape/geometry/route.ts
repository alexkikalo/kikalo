import { NextResponse } from 'next/server'

const DID = 'c0783d484462993857a94bb1'
const WID = 'd4a9f4803f10a4f65f2f8cf3'
const EID = '7b6ee8c5ab24994b708ff864'

// Exact ranges from the Onshape configuration variables
const ONSHAPE_RANGES = {
  width:  { min: 2, max: 10 },
  depth:  { min: 2, max: 10 },
  height: { min: 2, max: 10 },
}

/**
 * Fetch tessellated geometry from Onshape using live configuration variables.
 * GET /api/onshape/geometry?width=xx&depth=yy&height=zz
 *   [&hdmi=true&hdmiX=0.5&hdmiY=0.2]
 *   [&usbc=true&usbcX=0.5&usbcY=0.2]
 *
 * Parameter IDs (from /api/onshape/configuration):
 *   Width, Depth, Height
 *   Front_HDMI_01_X, Front_HDMI_01_Y, Front_HDMI_01
 *   Front_USBC_01_X, Front_USBC_01_Y, Front_USBC_01
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
  let height = parseFloat(searchParams.get('height') || '2.0')

  // HDMI
  const hdmiEnabled = searchParams.get('hdmi') === 'true'
  let hdmiX = parseFloat(searchParams.get('hdmiX') || '0')
  let hdmiY = parseFloat(searchParams.get('hdmiY') || '0')

  // USB-C
  const usbcEnabled = searchParams.get('usbc') === 'true'
  let usbcX = parseFloat(searchParams.get('usbcX') || '0')
  let usbcY = parseFloat(searchParams.get('usbcY') || '0')

  if ([width, depth, height].some((v) => isNaN(v) || v <= 0)) {
    return NextResponse.json({ error: 'Invalid dimensions' }, { status: 400 })
  }

  if (isNaN(hdmiX)) hdmiX = 0
  if (isNaN(hdmiY)) hdmiY = 0
  if (isNaN(usbcX)) usbcX = 0
  if (isNaN(usbcY)) usbcY = 0

  const original = {
    width, depth, height,
    hdmiEnabled, hdmiX, hdmiY,
    usbcEnabled, usbcX, usbcY,
  }

  // Clamp overall dimensions
  width = Math.min(ONSHAPE_RANGES.width.max, Math.max(ONSHAPE_RANGES.width.min, width))
  depth = Math.min(ONSHAPE_RANGES.depth.max, Math.max(ONSHAPE_RANGES.depth.min, depth))
  height = Math.min(ONSHAPE_RANGES.height.max, Math.max(ONSHAPE_RANGES.height.min, height))

  const credentials = Buffer.from(`${accessKey}:${secretKey}`).toString('base64')
  const authHeaders = {
    Authorization: `Basic ${credentials}`,
    Accept: 'application/json;charset=UTF-8; qs=0.09',
  }

  // Build port configuration segments using exact parameterIds
  const hx = hdmiX.toFixed(3)
  const hy = hdmiY.toFixed(3)
  const ux = usbcX.toFixed(3)
  const uy = usbcY.toFixed(3)

  const portParts = [
    // Full ports with +inch
    `Front_HDMI_01=${hdmiEnabled};Front_HDMI_01_X=${hx}+inch;Front_HDMI_01_Y=${hy}+inch;Front_USBC_01=${usbcEnabled};Front_USBC_01_X=${ux}+inch;Front_USBC_01_Y=${uy}+inch`,
    // Alternate unit
    `Front_HDMI_01=${hdmiEnabled};Front_HDMI_01_X=${hx}+in;Front_HDMI_01_Y=${hy}+in;Front_USBC_01=${usbcEnabled};Front_USBC_01_X=${ux}+in;Front_USBC_01_Y=${uy}+in`,
    // No unit fallback
    `Front_HDMI_01=${hdmiEnabled};Front_HDMI_01_X=${hx};Front_HDMI_01_Y=${hy};Front_USBC_01=${usbcEnabled};Front_USBC_01_X=${ux};Front_USBC_01_Y=${uy}`,
  ]

  const baseConfigs = [
    `Width=${width.toFixed(3)}+inch;Depth=${depth.toFixed(3)}+inch;Height=${height.toFixed(3)}+inch`,
    `Width=${width.toFixed(3)}+in;Depth=${depth.toFixed(3)}+in;Height=${height.toFixed(3)}+in`,
  ]

  const configCandidates: string[] = []
  for (const base of baseConfigs) {
    for (const ports of portParts) {
      configCandidates.push(`${base};${ports}`)
    }
  }

  const baseUrl = `https://cad.onshape.com/api/v6/partstudios/d/${DID}/w/${WID}/e/${EID}/tessellatedfaces`
  const attempts: any[] = []

  for (const configString of configCandidates) {
    try {
      const url = `${baseUrl}?configuration=${encodeURIComponent(configString)}`

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
          configString,
          status: response.status,
          body: responseText.slice(0, 500),
        })
        continue
      }

      const faces = data?.bodies?.[0]?.faces?.length || 0
      if (faces === 0) {
        attempts.push({
          configString,
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
        hdmi: { enabled: hdmiEnabled, x: hdmiX, y: hdmiY },
        usbc: { enabled: usbcEnabled, x: usbcX, y: usbcY },
        originalRequested: original,
        clamped: original.width !== width || original.depth !== depth || original.height !== height,
        configString,
        facesCount: faces,
        units: 'meters',
        raw: data,
      })
    } catch (error) {
      attempts.push({
        configString,
        error: String(error),
      })
    }
  }

  // Fallback: size only
  for (const base of baseConfigs) {
    try {
      const url = `${baseUrl}?configuration=${encodeURIComponent(base)}`
      const response = await fetch(url, { method: 'GET', headers: authHeaders })
      if (response.ok) {
        const data = await response.json()
        const faces = data?.bodies?.[0]?.faces?.length || 0
        if (faces > 0) {
          return NextResponse.json({
            success: true,
            message: 'Geometry fetched (port params rejected — size only)',
            dimensionsIn: { width, depth, height },
            hdmi: { enabled: hdmiEnabled, x: hdmiX, y: hdmiY },
            usbc: { enabled: usbcEnabled, x: usbcX, y: usbcY },
            originalRequested: original,
            clamped: true,
            configString: base,
            facesCount: faces,
            units: 'meters',
            warning: 'Port configuration parameters were rejected by Onshape. Showing size-only geometry.',
            attempts,
            raw: data,
          })
        }
      }
    } catch {
      /* continue */
    }
  }

  // Absolute last resort
  try {
    const response = await fetch(baseUrl, { method: 'GET', headers: authHeaders })
    if (response.ok) {
      const data = await response.json()
      const faces = data?.bodies?.[0]?.faces?.length || 0
      if (faces > 0) {
        return NextResponse.json({
          success: true,
          message: 'Geometry fetched (default config)',
          dimensionsIn: { width, depth, height },
          hdmi: { enabled: hdmiEnabled, x: hdmiX, y: hdmiY },
          usbc: { enabled: usbcEnabled, x: usbcX, y: usbcY },
          originalRequested: original,
          clamped: true,
          configString: '(default)',
          facesCount: faces,
          units: 'meters',
          warning: 'Custom configuration was rejected; showing default Onshape size',
          attempts,
          raw: data,
        })
      }
    }
  } catch {
    /* fall through */
  }

  console.error('Onshape geometry error (all formats failed):', attempts)

  return NextResponse.json(
    {
      error: 'Failed to fetch geometry from Onshape',
      hint: 'All configuration string formats failed. See attempts.',
      requested: original,
      clampedTo: { width, depth, height },
      onshapeRanges: ONSHAPE_RANGES,
      attempts,
      document: { did: DID, wid: WID, eid: EID },
    },
    { status: 500 }
  )
}
