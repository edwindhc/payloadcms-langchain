import { githubAuth } from '@/app/endpoints/Auth.endpoint'
import { createGitHubRepo } from '@/app/endpoints/Github.endpoint'
import { type CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
  endpoints: [
    {
      path: '/auth/github/callback',
      method: 'post',
      handler: githubAuth,
    },
    {
      path: '/github/create-repo',
      method: 'post',
      handler: createGitHubRepo,
    },
  ],
}
