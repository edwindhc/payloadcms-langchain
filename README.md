# PayloadCMS + LangChain Integration POC

This project is a proof of concept (POC) that demonstrates the powerful integration between PayloadCMS and LangChain. The goal is to create a framework that enables rapid development of AI agents by leveraging the best of both worlds:

- **PayloadCMS**: Provides a robust content management system with a beautiful admin UI, flexible data modeling, and powerful API capabilities
- **LangChain**: Offers a comprehensive framework for building AI applications with language models

This integration allows developers to:
- Quickly create and manage AI agents through an intuitive admin interface
- Store and version agent configurations, prompts, and settings in a structured way
- Leverage PayloadCMS's built-in authentication and access control for agent management
- Utilize LangChain's extensive toolkit for building sophisticated AI applications
- Deploy agents with minimal configuration while maintaining full control over their behavior

## Quick start

This template can be deployed directly from our Cloud hosting and it will setup MongoDB and cloud S3 object storage for media.

## Quick Start - local setup

To spin up this template locally, follow these steps:

### Clone

After you click the `Deploy` button above, you'll want to have standalone copy of this repo on your machine. If you've already cloned this repo, skip to [Development](#development).

### Development

1. First [clone the repo](#clone) if you have not done so already
2. `cd my-project && cp .env.example .env` to copy the example environment variables. You'll need to add the `MONGODB_URI` from your Cloud project to your `.env` if you want to use S3 storage and the MongoDB database that was created for you.

3. `pnpm install && pnpm dev` to install dependencies and start the dev server
4. open `http://localhost:3000` to open the app in your browser

That's it! Changes made in `./src` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

#### Docker (Optional)

If you prefer to use Docker for local development instead of a local MongoDB instance, the provided docker-compose.yml file can be used.

To do so, follow these steps:

- Modify the `MONGODB_URI` in your `.env` file to `mongodb://127.0.0.1/<dbname>`
- Modify the `docker-compose.yml` file's `MONGODB_URI` to match the above `<dbname>`
- Run `docker-compose up` to start the database, optionally pass `-d` to run in the background.

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/main/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Media

  This is the uploads enabled collection. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

### Migrations

Payload provides a powerful migration system to help you manage database schema changes over time. Here's how to work with migrations:

1. **Creating Migrations**
   - Run `pnpm payload migrate:create` to create a new migration file
   - This will generate a timestamped file in the `src/migrations` directory

2. **Running Migrations**
   - Use `pnpm payload migrate` to run all pending migrations
   - Use `pnpm payload migrate:status` to check the status of migrations
   - Use `pnpm payload migrate:fresh` to reset the database and run all migrations

3. **Migration Files**
   - Each migration file exports `up` and `down` functions
   - The `up` function is run when applying the migration
   - The `down` function is run when rolling back the migration

For more details, check out the [Migrations Documentation](https://payloadcms.com/docs/database/overview#migrations).

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development), the docker-compose file will automatically use the `.env` file in your project root
1. Next run `docker-compose up`
1. Follow [steps 4 and 5 from above](#development) to login and create your first admin user

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
