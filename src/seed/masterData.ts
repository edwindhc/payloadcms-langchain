import { Payload } from 'payload'

export const seedMasterData = async (payload: Payload): Promise<void> => {
  const masterDataTypes = [
    {
      code: 'CATEGORY',
      name: 'Categories',
      description: 'Employee categories',
    },
    {
      code: 'TECHNOLOGY',
      name: 'Technologies',
      description: 'Technology stack',
    },
    {
      code: 'SKILL',
      name: 'Skills',
      description: 'Employee skills',
    },
  ]
  const list = await payload.find({
    collection: 'master-data',
  })
  if (list.docs.length > 0) {
    return
  }
  for (const data of masterDataTypes) {
    await payload.create({
      collection: 'master-data',
      data,
    })
  }
}
