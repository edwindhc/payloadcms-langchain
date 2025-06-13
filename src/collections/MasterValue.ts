import type { CollectionConfig } from 'payload'

const MasterValue: CollectionConfig = {
  slug: 'master-value',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
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
      name: 'type',
      type: 'relationship',
      relationTo: 'master-data',
      required: true,
    },
  ],
}

export default MasterValue
