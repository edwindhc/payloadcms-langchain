/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIError, PayloadRequest } from 'payload'
import { z } from 'zod'
import { execSync } from 'child_process'
import path from 'path'

const createViteSchema = z.object({
  projectName: z.string().min(1),
  repoUrl: z.string().url(),
})

const createRepoSchema = z.object({
  name: z.string().min(1),
  access_token: z.string().min(1),
})

export const createViteProjectTool = [
  {
    name: 'create_vite_project',
    description: 'Create a Vite React TypeScript project and push it to GitHub',
    schema: createViteSchema,
    handler:
      (_: PayloadRequest) =>
      async ({ projectName, repoUrl }: { projectName: string; repoUrl: string }) => {
        const projectPath = path.join(process.cwd(), projectName)

        try {
          execSync(`npm create vite@latest ${projectName} -- --template react-ts`, {
            stdio: 'inherit',
          })

          execSync('git init', { cwd: projectPath })
          execSync('git add .', { cwd: projectPath })
          execSync('git commit -m "Initial commit"', { cwd: projectPath })

          execSync(`git remote add origin ${repoUrl}`, { cwd: projectPath })
          execSync('git branch -M main', { cwd: projectPath })
          execSync('git push -u origin main', { cwd: projectPath })

          return { success: true, message: `Proyecto '${projectName}' creado y subido a GitHub` }
        } catch (error: any) {
          return { success: false, error: error.message || String(error) }
        }
      },
  },
  {
    name: 'create_github_repo',
    description: 'Create a GitHub repository using GitHub API',
    schema: createRepoSchema,
    handler:
      (_: PayloadRequest) =>
      async ({ name }: { name: string }) => {
        try {
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
            throw new APIError(
              repoData.message || 'Error al crear el repositorio en GitHub',
              githubResponse.status,
              null,
              true,
            )
          }

          return { success: true, repo: repoData }
        } catch (error: any) {
          if (error instanceof SyntaxError) {
            throw new APIError('Error en el formato de los datos enviados', 400, null, true)
          }
          if (error instanceof APIError) {
            throw error
          }
          throw new APIError('Ocurrió un error al crear el repositorio', 500, null, true)
        }
      },
  },
]
