import { PayloadRequest, APIError } from 'payload'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import sodium from 'libsodium-wrappers'

const addGithubWorkflowSchema = z.object({
  projectName: z.string().min(1),
  awsAccessKeyId: z.string().min(1).default(process.env.AWS_ACCESS_KEY_ID!),
  awsSecretAccessKey: z.string().min(1).default(process.env.AWS_SECRET_ACCESS_KEY!),
  awsS3Bucket: z.string().min(1),
  repo: z.string().min(1), // ejemplo: "usuario/repo"
  githubToken: z.string().min(1).default(process.env.GITHUB_TOKEN!), // GitHub personal access token
})

export const githubWorkflowTools = [
  {
    name: 'add_github_actions_workflow',
    description: 'Add a GitHub Actions workflow and set encrypted AWS secrets',
    schema: addGithubWorkflowSchema,
    handler:
      (_: PayloadRequest) =>
      async ({
        projectName,
        awsAccessKeyId,
        awsSecretAccessKey,
        awsS3Bucket,
        repo,
        githubToken,
      }: z.infer<typeof addGithubWorkflowSchema>) => {
        try {
          const workflowsPath = path.join(process.cwd(), projectName, '.github', 'workflows')
          fs.mkdirSync(workflowsPath, { recursive: true })

          const workflowFilePath = path.join(workflowsPath, 'deploy.yml')

          const workflowContent = `name: Deploy React App to S3

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build

      - name: Deploy to S3
        uses: jakejarvis/s3-sync-action@master
        with:
          args: --delete
        env:
          AWS_S3_BUCKET: \${{ secrets.AWS_S3_BUCKET }}
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          SOURCE_DIR: dist`

          fs.writeFileSync(workflowFilePath, workflowContent)

          // Subir workflow al repo
          const projectPath = path.join(process.cwd(), projectName)
          execSync('git config --global user.email "github-actions@github.com"', {
            cwd: projectPath,
          })
          execSync('git config --global user.name "GitHub Actions"', { cwd: projectPath })
          execSync('git add .', { cwd: projectPath })
          execSync('git commit -m "Add GitHub Actions workflow"', { cwd: projectPath })
          execSync('git push', { cwd: projectPath })

          // Obtener la public key del repo
          const publicKeyRes = await fetch(
            `https://api.github.com/repos/${repo}/actions/secrets/public-key`,
            {
              headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: 'application/vnd.github+json',
              },
            },
          )

          const publicKeyData = await publicKeyRes.json()
          if (!publicKeyRes.ok) {
            throw new APIError(
              'Error al obtener la clave pública del repo de GitHub',
              publicKeyRes.status,
            )
          }

          const { key: publicKeyBase64, key_id } = publicKeyData

          await sodium.ready
          const publicKey = sodium.from_base64(publicKeyBase64, sodium.base64_variants.ORIGINAL)

          const encrypt = (value: string) => {
            const messageBytes = sodium.from_string(value)
            const encryptedBytes = sodium.crypto_box_seal(messageBytes, publicKey)
            return sodium.to_base64(encryptedBytes, sodium.base64_variants.ORIGINAL)
          }
          console.log(
            awsAccessKeyId,
            awsSecretAccessKey,
            awsS3Bucket,
            ' awsAccessKeyId, awsSecretAccessKey, awsS3Bucket',
          )
          const secrets = {
            AWS_ACCESS_KEY_ID: awsAccessKeyId,
            AWS_SECRET_ACCESS_KEY: awsSecretAccessKey,
            AWS_S3_BUCKET: awsS3Bucket,
          }

          for (const [key, value] of Object.entries(secrets)) {
            const encrypted = encrypt(value)

            const res = await fetch(`https://api.github.com/repos/${repo}/actions/secrets/${key}`, {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: 'application/vnd.github+json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                encrypted_value: encrypted,
                key_id,
              }),
            })

            if (!res.ok) {
              const err = await res.json()
              console.error(`Error al subir el secret ${key}:`, err)
              throw new APIError(`Error al establecer el secret ${key}`, res.status)
            }
          }

          return {
            success: true,
            message: 'Workflow creado y secrets configurados en GitHub',
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error('Error creando workflow:', error)
          throw new APIError(error.message || 'Ocurrió un error general', 500)
        }
      },
  },
]
