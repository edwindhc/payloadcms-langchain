import { Payload } from 'payload'

export const seedTeams = async (payload: Payload, tenantId: string): Promise<void> => {
  const employees = await payload.find({
    collection: 'employees',
    where: {
      proyecto: {
        equals: tenantId,
      },
    },
    limit: 3,
  })

  if (!employees.docs.length) {
    console.warn('No employees found to add to team')
    return
  }

  const teamData = {
    name: 'Development Team',
    description: 'Main development team for the project',
    members: employees.docs.map((emp) => emp.id),
    leader: employees.docs[0].id,
    status: 'active',
  }

  try {
    await payload.create({
      collection: 'teams',
      data: teamData,
    })
    console.log('Successfully seeded team')
  } catch (error) {
    console.error('Error seeding team:', error)
  }
}
