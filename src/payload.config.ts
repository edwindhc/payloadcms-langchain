import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import Projects from './collections/Projects'
import MasterData from './collections/MasterData'
import MasterValue from './collections/MasterValue'
import Employees from './collections/Employees'
import Teams from './collections/Teams'
import Conversations from './collections/Conversations'
import seed from './seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const seedDB = process.env.SEED_DB === 'true'
export default buildConfig({
  cors: '*',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  onInit: async (args) => {
    if (seedDB) {
      await seed(args)
    }
  },
  collections: [Users, Media, Projects, MasterData, MasterValue, Employees, Teams, Conversations],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    multiTenantPlugin({
      debug: true,
      tenantsSlug: 'projects',

      tenantField: {
        name: 'proyecto', // change to tenant correct field
      },

      tenantsArrayField: {
        includeDefaultField: true,
        arrayFieldName: 'projects',
        arrayTenantFieldName: 'proyecto',
      },

      tenantSelectorLabel: 'Seleccionar Proyecto',
      userHasAccessToAllTenants: () => true,
      collections: {
        conversations: {},
        teams: {},
        projects: {
          useTenantAccess: true,
        },
      },
    }),
  ],
})
