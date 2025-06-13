import { Payload } from 'payload'

export const seedEmployees = async (payload: Payload): Promise<void> => {
  const developerCategory = await payload.find({
    collection: 'master-value',
    where: {
      name: {
        equals: 'Developer',
      },
    },
  })

  const reactTech = await payload.find({
    collection: 'master-value',
    where: {
      name: {
        equals: 'React',
      },
    },
  })

  const frontendSkill = await payload.find({
    collection: 'master-value',
    where: {
      name: {
        equals: 'Frontend Development',
      },
    },
  })

  const backendSkill = await payload.find({
    collection: 'master-value',
    where: {
      name: {
        equals: 'Backend Development',
      },
    },
  })

  const ecommerceProject = await payload.find({
    collection: 'projects',
    where: {
      code: {
        equals: 'PROJ001',
      },
    },
  })

  const employees = [
    {
      name: 'Alice',
      surname: 'Johnson',
      startDate: '2024-01-01',
      email: 'alice.johnson@example.com',
      category: developerCategory.docs[0].id,
      subCategory: developerCategory.docs[0].id,
      technology: reactTech.docs[0].id,
      mainSkill: frontendSkill.docs[0].id,
      secondarySkill: backendSkill.docs[0].id,
      project: ecommerceProject.docs[0].id,
      projects: '1',
    },
  ]

  for (const employee of employees) {
    await payload.create({
      collection: 'employees',
      data: employee,
    })
  }
}
