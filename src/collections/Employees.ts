import type { CollectionConfig } from 'payload'

const Employees: CollectionConfig = {
  slug: 'employees',
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
      name: 'surname',
      type: 'text',
      required: true,
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
    },
    {
      name: 'endDate',
      type: 'date',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'master-value',
      required: true,
    },
    {
      name: 'subCategory',
      type: 'relationship',
      relationTo: 'master-value',
      required: true,
    },
    {
      name: 'technology',
      type: 'relationship',
      relationTo: 'master-value',
      required: true,
    },
    {
      name: 'mainSkill',
      type: 'relationship',
      relationTo: 'master-value',
      required: true,
    },
    {
      name: 'secondarySkill',
      type: 'relationship',
      relationTo: 'master-value',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
    },
  ],
}

export default Employees
