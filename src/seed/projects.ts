import { Payload } from 'payload'

export const seedProjects = async (payload: Payload): Promise<void> => {
  const projects = [
    {
      code: 'PROJ001',
      name: 'E-commerce Platform',
      description: 'Modern e-commerce platform development',
      status: 'ACTIVE',
      firmRate: '100',
      manager: 'John Doe',
    },
    {
      code: 'PROJ002',
      name: 'Mobile App',
      description: 'Cross-platform mobile application',
      status: 'PLANNING',
      firmRate: '90',
      manager: 'Jane Smith',
    },
  ]

  for (const project of projects) {
    await payload.create({
      collection: 'projects',
      data: project,
    })
  }
}
