import { APIError, headersWithCors, PayloadRequest } from 'payload'
export const githubAuth = async (req: PayloadRequest) => {
  try {
    let data: { [key: string]: string } = {}

    if (req.data) {
      data = req.data as { [key: string]: string }
    } else if (req.body) {
      const bodyText = await new Response(req.body).text()
      data = JSON.parse(bodyText)
    }
    const { code } = data
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret:
          process.env.GITHUB_CLIENT_SECRET || '647e9600a8176ae4d27b40b356b75a758733b16b',
        code,
      }),
    })
    const tokenData = await tokenResponse.json()
    if (tokenData.error) {
      throw new APIError('No se pudo obtener el token', 400, null, true)
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    return Response.json(
      {
        token: tokenData.access_token,
        user: userData,
      },
      {
        headers: headersWithCors({
          headers: new Headers({}),
          req,
        }),
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error seeding team:', error)
    throw new APIError('Ocurrió un error', 400, null, true)
  }
}
