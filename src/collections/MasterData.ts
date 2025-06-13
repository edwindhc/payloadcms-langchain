import type { CollectionConfig } from 'payload'

const MasterData: CollectionConfig = {
  slug: 'master-data',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
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
  ],
}

export default MasterData
