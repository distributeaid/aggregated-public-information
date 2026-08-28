# Docker Development Setup

This project uses a hybrid approach with Docker Compose `watch` feature and bind-mounts for an optimized development experience with hot-reloading capabilities.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or [Docker Engine](https://docs.docker.com/engine/install/ubuntu/)

## WSL2 Ubuntu + Docker Desktop Setup (for Windows users)

**IMPORTANT**: Ensure Docker Desktop is installed (if not yet installed, download and run the installer — it will prompt to enable WSL2 during setup)

Check WSL version support:
```powershell
wsl --version
```
If this command isn't recognized, update WSL first:
```powershell
wsl --update
```

### 1. Install Ubuntu as a WSL2 distro

Open **PowerShell** (regular user is fine, doesn't need to be Administrator for this):

```powershell
wsl --install -d Ubuntu
```

- This downloads and installs Ubuntu, and sets WSL2 as the default backend (WSL2 has been the default since Windows 10 2004+).
- On first launch it will prompt you to create a **UNIX username and password** — this is separate from your Windows login, and is your sudo user inside the distro.

Verify it installed as WSL2 (not the older WSL1):
```powershell
wsl -l -v
```
You should see something like:
```
  NAME              STATE           VERSION
* Ubuntu            Running         2
  docker-desktop    Running         2
  docker-desktop-data Stopped       2
```

> **Note:** `docker-desktop` and `docker-desktop-data` are internal distros Docker Desktop creates for itself — don't develop inside those. Your Ubuntu distro is what you'll actually use.

If Ubuntu shows as version 1, convert it:
```powershell
wsl --set-version Ubuntu 2
```

### 2. Point Docker Desktop at your Ubuntu distro

1. Open **Docker Desktop**.
2. Go to **Settings → General** and confirm **"Use the WSL 2 based engine"** is checked.
3. Go to **Settings → Resources → WSL Integration**.
4. Enable the toggle for **Ubuntu** (it may already be on by default if it's your only/first distro).
5. Click **Apply & Restart**.

This makes the `docker` and `docker compose` CLI commands available inside Ubuntu, talking to the Docker engine that Docker Desktop runs in the background — you don't need to install Docker Engine separately inside Ubuntu itself.

Verify from inside Ubuntu (open it via Start Menu, or `wsl -d Ubuntu` from PowerShell):
```bash
docker --version
docker compose version
docker run hello-world
```

### 3. Clone your project inside the Ubuntu filesystem

**IMPORTANT:** keep project files inside Ubuntu's native filesystem (e.g. `~/projects/...`), **not** under `/mnt/c/...`. Files under `/mnt/c/` are accessed across the Windows/Linux boundary, which is significantly slower for file I/O and Docker bind mounts than files native to the Linux filesystem.

Inside the Ubuntu terminal:

```bash
# Make sure git is installed
sudo apt update && sudo apt install -y git

# Create a projects directory in your Linux home
mkdir -p ~/projects
cd ~/projects

# Clone your repo
git clone <your-repo-url>
cd <your-repo-name>
```

### 4. Fix ownership/permissions

If you're hitting permission-denied errors when saving/deleting files from your editor or containers, reclaim ownership for your user:

```bash
sudo chown -R $USER:$USER .
```

This recursively sets the owner and group of everything in the current directory to your logged-in Linux user, which resolves the typical "permission denied" issues when an editor, Docker container (running as root by default), or another tool has written files owned by a different user.

### 5. Connect your editor to WSL
 
Most modern editors (VSCode, Cursor, Windsurf, Antigravity, and others built on the same architecture) support a "remote/WSL" mode: the editor UI runs on Windows, but it attaches to the Ubuntu filesystem so the terminal, language servers, linters, debuggers, and any tooling all run natively inside Linux — this is what avoids the cross-filesystem slowness and tooling mismatches you'd get from just opening `\\wsl$\...` as a regular folder.
 
General steps (specifics vary slightly by editor):
 
1. Install the editor's **WSL remote extension/plugin** if it's not bundled by default (in VSCode-derived editors this is typically named something like "WSL" or "Remote - WSL").
2. Open the editor normally (from Windows), then connect to WSL:
   - Open the **Command Palette** (usually `Ctrl+Shift+P`) and run a command like **"WSL: Connect to WSL"** or **"Reopen Folder in WSL"** (naming varies slightly by editor).
   - Alternatively, look for a **remote connection indicator** in the corner of the window (often bottom-left, a `><` style icon) — clicking it typically brings up a menu with a WSL-connect option.
   - Once connected, use **File → Open Folder** and browse to your project path inside Ubuntu (e.g. `\\wsl$\Ubuntu\home\<user>\projects\<project-name>`, or the editor's own file picker if it lets you browse the WSL filesystem directly).
3. Confirm you're actually connected to WSL and not just browsing the folder over a network path — editors typically show an indicator (often bottom-left) naming the connected distro, e.g. "WSL: ubuntu".

### 6. Quick sanity checklist
 
- `wsl -l -v` shows Ubuntu running WSL **version 2**
- Docker Desktop → Settings → Resources → WSL Integration has Ubuntu enabled
- `docker run hello-world` works from inside Ubuntu
- Project lives under `~/...` inside Ubuntu, not `/mnt/c/...`
- `sudo chown -R $USER:$USER .` run in the project dir if any permission errors appear
- Editor bottom-left shows "WSL: ubuntu" when editing

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

Docker compose `watch` feature does not provide a data sync between container and host i.e code changes generated in the container's files are not reflected as changes in the host files. Therefore, `/src`, `/config`, `/types`, `/public/uploads` and `/database` directories use bind-mounts for two-way data sync ensuring that the code changes in the container's files generated via Strapi UI actions are immediately reflected in the host files.

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
2. **Code Changes**: Edit files (via host or Strapi UI) and observe file changes under `/src`, `/types`, `/config`, `/public/uploads`, `/database` directories
3. **Dependency Changes**: Add/remove packages in `package.json` - image rebuilds automatically
4. **Stop**: Press `Ctrl+C` or run `docker compose down` (optionally, use `docker compose down --rmi all` to remove image)

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
