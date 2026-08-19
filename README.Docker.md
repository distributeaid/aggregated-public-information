# Docker Development Setup

This project uses a hybrid approach with Docker Compose `watch` feature and bind-mounts for an optimized development experience with hot-reloading capabilities.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or [Docker Engine](https://docs.docker.com/engine/install/ubuntu/)

## Quick Start

**IMPORTANT**: Ensure there is a `.env` file at the project root with necessary environment variables.

Start the development environment:

```bash
docker compose up --watch
```

Application will be available at http://localhost:1337.

## Architecture

### Dockerfile.dev

The development Dockerfile is optimized for local development:

- **Base Image**: `ubuntu:24.04` (Ubuntu-based image with manually installed Node.js 20.0.0 binary)
- **Node.js Installation**: Downloads and extracts Node.js binary for better compatibility
- **Working Directory**: `/app`
- **Dependency Installation**: Uses BuildKit cache mount for faster, cached yarn installations
- **Immutable Mode**: Dependencies are installed with `--immutable` flag for reproducible builds
- **Development Command**: Runs `yarn develop` to start Strapi in development mode

### Docker Compose Configuration

The `docker-compose.yml` file defines a single service `backend-dev` with the following features:

- **Image**: `backend:dev` (built locally, never pulled from registry)
- **Platform**: `linux/amd64` (forces the container to run on x86_64 (amd64) architecture for better compatibility, especially on Apple Silicon Macs (M1/M2/M3))
- **Container Name**: `backend-dev`
- **Port Mapping**: `1337:1337` (host:container)
- **Environment File**: `.env`

## Docker Compose Watch + Bind Mounts

The setup utilizes a hybrid approach with Docker Compose watch and bind-mounts for intelligent file synchronization and automatic rebuilds. Different file types trigger different actions:

### Source Code Changes (Hot Reload)

Docker compose `watch` feature does not provide a data sync between container and host i.e code changes generated in the container's files are not reflected as changes in the host files. Therefore, files in `/src` use bind-mounts for two-way data sync ensuring that the code changes in the container's files generated via Strapi UI actions are immediately reflected in the host files.

Files in `/config` and `/public` directories:

- **Action**: `sync`
- **Behavior**: Files are synced to the container without restart, changes are hot-reloaded

### Configuration Changes (Restart Required)

Files in `/types` directory:

- **Action**: `sync+restart`
- **Behavior**: Files are synced and the container is restarted to apply configuration changes

### Dependency Changes (Rebuild Required)

Dependency files:

- `package.json`
- `yarn.lock`
- `.yarnrc.yml`
- `.yarn/` directory
- **Action**: `rebuild`
- **Behavior**: The Docker image is rebuilt to install new/updated dependencies and the container is replaced with the new image

## Development Workflow

1. **Initial Setup**: Run `docker compose up --watch` to build and start the container
2. **Code Changes**: Edit files in `/src` or `/config` or `/public` - changes sync automatically with hot-reload
3. **Config Changes**: Edit config files - container restarts automatically
4. **Dependency Changes**: Add/remove packages in `package.json` - image rebuilds automatically
5. **Stop**: Press `Ctrl+C` or run `docker compose down` (optionally, use `docker compose down --rmi all` to remove image)

## Troubleshooting

### Port Already in Use

If port 1337 is already in use, modify the port mapping in `docker-compose.yml`:

```yaml
ports:
  - 1338:1337 # Use port 1338 on host
```

### Dependency Issues

If you encounter dependency-related errors, force a rebuild:

```bash
docker compose up --watch --force-recreate
```

### Stale Cache

To clear Docker cache and rebuild from scratch:

```bash
docker compose down
docker system prune -f
docker compose up --watch
```

### Watch Not Working

Ensure your Docker Compose version is `2.22.0` or higher:

```bash
docker compose version
```

## References

- [Docker Compose Watch](https://docs.docker.com/compose/file-watch/)
