import { externalUsersLogin, githubAuth } from '@/app/endpoints/Auth.endpoint'
import { createGitHubRepo } from '@/app/endpoints/Github.endpoint'
import { type CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },

    // Email added by default
  ],
  endpoints: [
    externalUsersLogin,
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
