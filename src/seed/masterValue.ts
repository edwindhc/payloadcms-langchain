import { Payload } from 'payload'

export const seedMasterValue = async (payload: Payload): Promise<void> => {
  const categories = await payload.find({
    collection: 'master-data',
    where: {
      code: {
        equals: 'CATEGORY',
      },
    },
  })

  const technologies = await payload.find({
    collection: 'master-data',
    where: {
      code: {
        equals: 'TECHNOLOGY',
      },
    },
  })

  const skills = await payload.find({
    collection: 'master-data',
    where: {
      code: {
        equals: 'SKILL',
      },
    },
  })

  const masterValues = [
    // Categories
    {
      name: 'Developer',
      description: 'Software Developer',
      type: categories.docs[0].id,
    },
    {
      name: 'Designer',
      description: 'UI/UX Designer',
      type: categories.docs[0].id,
    },
    // Technologies
    {
      name: 'React',
      description: 'React.js Framework',
      type: technologies.docs[0].id,
    },
    {
      name: 'Node.js',
      description: 'Node.js Runtime',
      type: technologies.docs[0].id,
    },
    // Skills
    {
      name: 'Frontend Development',
      description: 'Frontend Development Skills',
      type: skills.docs[0].id,
    },
    {
      name: 'Backend Development',
      description: 'Backend Development Skills',
      type: skills.docs[0].id,
    },
  ]

  for (const value of masterValues) {
    await payload.create({
      collection: 'master-value',
      data: value,
    })
  }
}
