import type { CollectionConfig } from 'payload'

const Teams: CollectionConfig = {
  slug: 'teams',
  admin: {
    useAsTitle: 'name',
    group: 'Organization',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Team Name',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Team Description',
    },
    {
      name: 'members',
      type: 'relationship',
      relationTo: 'employees',
      hasMany: true,
      label: 'Team Members',
    },
    {
      name: 'leader',
      type: 'relationship',
      relationTo: 'employees',
      required: true,
      label: 'Team Leader',
    },
  ],
}

export default Teams
