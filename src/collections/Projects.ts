import type { CollectionConfig } from 'payload'
import crypto from 'crypto'

const generateRandomCode = () => {
  return crypto.randomBytes(4).toString('hex') // 8 caracteres
}
const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: false,
      unique: true,
      index: true,
    },
    {
      name: 'autoGenerateCode',
      type: 'checkbox',
      label: 'Generar código automáticamente',
      defaultValue: true,
    },
    {
      name: 'status',
      label: 'Estado del proyecto',
      type: 'select',
      defaultValue: 'INPROGRESS',
      options: [
        {
          label: 'En progreso',
          value: 'INPROGRESS',
        },
        {
          label: 'Finalizado',
          value: 'COMPLETED',
        },
      ],
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'comment',
      type: 'textarea',
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && !data.code && data.autoGenerateCode !== false) {
          data.code = generateRandomCode()
        }
        return data
      },
    ],
  },
}

export default Projects
