import type { CollectionConfig } from 'payload'

const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'status',
      type: 'text',
      required: true,
    },
    {
      name: 'firmRate',
      type: 'text',
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
    {
      name: 'manager',
      type: 'text',
      required: true,
    },
  ],
}

export default Projects
