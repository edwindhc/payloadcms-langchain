import { Payload } from 'payload'
import { seedMasterData } from './masterData'
import { seedMasterValue } from './masterValue'
import { seedProjects } from './projects'
import { seedEmployees } from './employees'

export const seed = async (payload: Payload): Promise<void> => {
  try {
    await seedMasterData(payload)
    await seedMasterValue(payload)
    await seedProjects(payload)
    await seedEmployees(payload)

    payload.logger.info('Seed completed successfully')
  } catch (error) {
    payload.logger.error('Error during seed:', error)
    throw error
  }
}

export default seed
