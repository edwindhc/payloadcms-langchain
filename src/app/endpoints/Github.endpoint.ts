import { APIError, headersWithCors, PayloadRequest } from 'payload'

export const createGitHubRepo = async (req: PayloadRequest) => {
  try {
    let data: { [key: string]: string } = {}

    if (req.data) {
      data = req.data as { [key: string]: string }
    } else if (req.body) {
      const bodyText = await new Response(req.body).text()
      data = JSON.parse(bodyText)
    }

    const { name } = data
    const access_token = process.env.GITHUB_TOKEN!

    if (!name) {
      throw new APIError('El nombre del repositorio es requerido', 400, null, true)
    }

    if (!access_token) {
      throw new APIError('El token de acceso es requerido', 400, null, true)
    }

    const githubResponse = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({
        name,
        description: 'Repositorio creado desde la app',
        private: false,
      }),
    })

    const repoData = await githubResponse.json()

    if (!githubResponse.ok) {
      console.error('GitHub API error:', repoData)
      throw new APIError(
        repoData.message || 'Error al crear el repositorio en GitHub',
        githubResponse.status,
        null,
        true,
      )
    }

    return Response.json(
      { success: true, repo: repoData },
      {
        headers: headersWithCors({ headers: new Headers({}), req }),
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error al crear repositorio:', error)

    if (error instanceof SyntaxError) {
      throw new APIError('Error en el formato de los datos enviados', 400, null, true)
    }

    if (error instanceof APIError) {
      throw error
    }

    throw new APIError('Ocurrió un error al crear el repositorio', 500, null, true)
  }
}
