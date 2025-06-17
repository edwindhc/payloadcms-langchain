import { Payload } from 'payload'

type ProjectStatus = 'INPROGRESS' | 'COMPLETED'

export const seedProjects = async (payload: Payload): Promise<void> => {
  const projects: Array<{
    name: string
    description: string
    status: ProjectStatus
    code: string
  }> = [
    {
      name: 'E-commerce Platform',
      description: 'Modern e-commerce platform development',
      status: 'INPROGRESS',
      code: 'PROJ001',
      // code is optional; will be auto-generated
    },
    {
      name: 'Mobile App',
      description: 'Cross-platform mobile application',
      status: 'COMPLETED',
      code: 'PROJ002',
    },
  ]

  for (const project of projects) {
    await payload.create({
      collection: 'projects',
      data: project,
    })
  }
}
