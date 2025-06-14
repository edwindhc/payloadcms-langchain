import { PayloadRequest, APIError } from 'payload'
import { z } from 'zod'
import {
  S3Client,
  CreateBucketCommand,
  BucketLocationConstraint,
  PutBucketPolicyCommand,
  PutPublicAccessBlockCommand,
  PutBucketWebsiteCommand,
} from '@aws-sdk/client-s3'

const createBucketSchema = z.object({
  bucketName: z.string().min(3),
  region: z.string().min(2).default('eu-north-1'),
  accessKeyId: z.string().default(process.env.AWS_ACCESS_KEY_ID!),
  secretAccessKey: z.string().default(process.env.AWS_SECRET_ACCESS_KEY!),
})

export const createS3BucketTool = {
  name: 'create_s3_bucket',
  description: 'Create an S3 bucket in AWS using IAM credentials',
  schema: createBucketSchema,
  handler:
    (_: PayloadRequest) =>
    async ({
      bucketName,
      region,
      accessKeyId,
      secretAccessKey,
    }: z.infer<typeof createBucketSchema>) => {
      try {
        const client = new S3Client({
          region,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        })

        // Crear bucket
        const createBucketCommand = new CreateBucketCommand({
          Bucket: bucketName,
          CreateBucketConfiguration:
            region === 'us-east-1'
              ? undefined
              : { LocationConstraint: region as BucketLocationConstraint },
        })

        await client.send(createBucketCommand)

        // Desactivar el bloqueo de acceso público
        const disablePublicAccessCommand = new PutPublicAccessBlockCommand({
          Bucket: bucketName,
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: false,
            IgnorePublicAcls: false,
            BlockPublicPolicy: false,
            RestrictPublicBuckets: false,
          },
        })

        await client.send(disablePublicAccessCommand)

        // Aplicar política pública de lectura
        const bucketPolicy = {
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'PublicReadGetObject',
              Effect: 'Allow',
              Principal: '*',
              Action: 's3:GetObject',
              Resource: `arn:aws:s3:::${bucketName}/*`,
            },
          ],
        }

        const policyCommand = new PutBucketPolicyCommand({
          Bucket: bucketName,
          Policy: JSON.stringify(bucketPolicy),
        })

        await client.send(policyCommand)

        // Activar alojamiento de sitios web estáticos
        const websiteConfigCommand = new PutBucketWebsiteCommand({
          Bucket: bucketName,
          WebsiteConfiguration: {
            IndexDocument: {
              Suffix: 'index.html',
            },
            ErrorDocument: {
              Key: 'error.html',
            },
          },
        })

        await client.send(websiteConfigCommand)

        return {
          success: true,
          message: `Bucket "${bucketName}" creado exitosamente en ${region}, configurado como público y habilitado para hosting estático.`,
          websiteURL: `http://${bucketName}.s3-website.${region}.amazonaws.com/`,
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Error al crear bucket:', error)
        throw new APIError(error.message || 'Error al crear el bucket', 500)
      }
    },
}
