import type { Collection, Endpoint } from 'payload'
import { APIError, headersWithCors, PayloadRequest, generatePayloadCookie } from 'payload'
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

// A custom endpoint that can be reached by POST request
// at: /api/users/external-users/login
export const externalUsersLogin: Endpoint = {
  handler: async (req) => {
    let data: { [key: string]: string } = {}

    try {
      if (typeof req.json === 'function') {
        data = await req.json()
      }
    } catch (error) {
      // swallow error, data is already empty object
    }
    console.log(data, ' data')
    const { password, username } = data

    if (!username || !password) {
      throw new APIError('Username and Password are required for login.', 400, null, true)
    }

    const foundUser = await req.payload.find({
      collection: 'users',
      where: {
        or: [
          {
            and: [
              {
                email: {
                  equals: username,
                },
              },
            ],
          },
        ],
      },
    })

    if (foundUser.totalDocs > 0) {
      try {
        const loginAttempt = await req.payload.login({
          collection: 'users',
          data: {
            email: foundUser.docs[0].email,
            password,
          },
          req,
        })

        if (loginAttempt?.token) {
          const collection: Collection = (req.payload.collections as { [key: string]: Collection })[
            'users'
          ]
          const cookie = generatePayloadCookie({
            collectionAuthConfig: collection.config.auth,
            cookiePrefix: req.payload.config.cookiePrefix,
            token: loginAttempt.token,
          })

          return Response.json(loginAttempt, {
            headers: headersWithCors({
              headers: new Headers({
                'Set-Cookie': cookie,
              }),
              req,
            }),
            status: 200,
          })
        }

        throw new APIError(
          'Unable to login with the provided username and password.',
          400,
          null,
          true,
        )
      } catch (e) {
        throw new APIError(
          'Unable to login with the provided username and password.',
          400,
          null,
          true,
        )
      }
    }

    throw new APIError('Unable to login with the provided username and password.', 400, null, true)
  },
  method: 'post',
  path: '/external-users/login',
}
