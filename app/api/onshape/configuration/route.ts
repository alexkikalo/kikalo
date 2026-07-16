import { NextResponse } from 'next/server'

const DID = 'c0783d484462993857a94bb1'
const WID = 'd4a9f4803f10a4f65f2f8cf3'
const EID = '7b6ee8c5ab24994b708ff864'

/**
 * Get configuration definition from the Onshape Part Studio
 * GET /api/onshape/configuration
 */
export async function GET() {
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

  const credentials = Buffer.from(`${accessKey}:${secretKey}`).toString('base64')

  try {
    const response = await fetch(
      `https://cad.onshape.com/api/v6/elements/d/${DID}/w/${WID}/e/${EID}/configuration`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: 'application/json;charset=UTF-8; qs=0.09',
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
          document: { did: DID, wid: WID, eid: EID },
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    const params = data.configurationParameters || []

    // Flatten into a simple, readable list for debugging
    const summary = params.map((p: any) => {
      const msg = p.message || p
      return {
        parameterId: p.parameterId || msg.parameterId,
        parameterName: p.parameterName || msg.parameterName,
        type: p.btType || p.typeName || msg.btType,
        quantityType: msg.quantityType,
        units: msg.rangeAndDefault?.units || msg.rangeAndDefault?.message?.units,
        min: msg.rangeAndDefault?.minValue || msg.rangeAndDefault?.message?.minValue,
        max: msg.rangeAndDefault?.maxValue || msg.rangeAndDefault?.message?.maxValue,
        default: msg.rangeAndDefault?.defaultValue || msg.rangeAndDefault?.message?.defaultValue || msg.defaultValue,
      }
    })

    return NextResponse.json({
      success: true,
      count: summary.length,
      parameters: summary,
      currentConfiguration: data.currentConfiguration || [],
      document: { did: DID, wid: WID, eid: EID },
      raw: data,
    })
  } catch (error) {
    console.error('Onshape configuration error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configuration', details: String(error) },
      { status: 500 }
    )
  }
}
