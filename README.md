# FluxMonitor

**FluxMonitor** is an EDI (Electronic Data Interchange) traffic monitoring suite.

## Structure

* `/front-end` – A single-page application built with **React**, **Vite**, and **Ant Design**.
* `/back-end` – A modular **.NET ** Web API and asynchronous background **Worker Services** powered by **Entity Framework Core**.

---

# Local Setup

## 1. Prerequisites

Ensure you have the following installed on your machine:

* Node.js (v20 or higher) and `npm`
* `pnpm`
* .NET 10 SDK (Minium)
* Database Engine (choose one):

  * **Docker & Docker Compose** (for hybrid/containerized setup)
  * **MySQL** or **PostgreSQL** installed natively on your operating system (for a fully local setup)

---

## 2. Root Environment Configuration (Docker Users Only)

If you plan to use Docker for your database or full containerization, create your root configuration file.

### Create the local environment file

```bash
cp .env.example .env.local
```

### Configure database parameters

Open `.env.local` and adjust the values as required:

---

## 3. Back-end Configuration (.NET)

For security reasons, local database credentials and JWT security keys are excluded from source control.

You can run the database using one of the following strategies.

### Option A – Pure Local Setup (No Docker)

Use a locally installed MySQL or PostgreSQL instance running directly on your machine.

### Option B – Hybrid Setup (Database in Docker)

Start only the database container:

```bash
pnpm docker:up
```

### API Configuration

Navigate to the API project:

```bash
cd back-end/src/FluxMonitor.Api/
```

Create the local configuration file:

```bash
cp appsettings.Development.json.example appsettings.Development.json
```

Open `appsettings.Development.json` and update the connection string according to your selected setup.


### Restore Dependencies and Run the API

```bash
cd ../../
dotnet restore
dotnet run --project src/FluxMonitor.Api/
```

---

## 4. Front-end Configuration (React)

The front-end uses environment variables to dynamically configure the API endpoint.

Navigate to the front-end directory:

```bash
cd front-end
```

Create the local environment file:

```bash
cp .env.example .env.local
```

Ensure the API URL points to your local backend.


Install dependencies and start the development server:

```bash
cd ..
pnpm install
pnpm approve-builds
pnpm dev:front
```

The application will be available at:

```text
http://localhost:5173
```

---

# Docker Infrastructure & Full Containerization

The project includes a multi-provider `docker-compose.yml` that reads configuration directly from `.env.local`.

Supported database providers:

* MySQL (default)
* PostgreSQL
* SQL Server

---

## Option C – Full Containerized Stack

Run the complete platform inside Docker:

```bash
docker compose up --build
```

This starts:

* Database
* API
* Front-end

Once initialized:

| Service   | URL                   |
| --------- | --------------------- |
| API       | http://localhost:5001 |
| Front-end | http://localhost:3000 |

---

## Switching Database Providers

Open `docker-compose.yml` and enable your preferred database provider.

Available options:

* MySQL (default)
* PostgreSQL
* SQL Server

When switching providers, remember to update:

* The active `DatabaseProvider` configuration
* The API connection string inside the `flux-monitor-api` container configuration

---

# Global Workspace Commands

Execute all commands from the repository root.

### Start Front-end Development Server

```bash
pnpm dev:front
```

### Build Front-end Assets

```bash
pnpm build:front
```

### Start Database Infrastructure Containers

```bash
pnpm docker:up
```

### Stop Database Infrastructure Containers

```bash
pnpm docker:down
```

---

# Recommended Development Workflows

### Option A — Pure Native Development

Ideal for developers who prefer running everything locally without containers.

* Local database
* Local API
* Local Front-end

### Option B — Hybrid Development

Recommended for daily development.

* Database inside Docker
* API running locally
* Front-end running locally

Benefits:

* Isolated database environment
* Faster debugging experience
* Minimal Docker overhead

### Option C — Full Containerized Environment

Best for testing and onboarding.

* Database in Docker
* API in Docker
* Front-end in Docker

Benefits:

* Single startup command
* Fully reproducible environment
* Ideal for demonstrations, QA, and validation

---

With this setup, developers can choose the workflow that best fits their needs:

* **Option A** for a fully native development experience.
* **Option B** for a practical hybrid workflow with an isolated database.
* **Option C** for a completely containerized environment that can be launched with a single command.

Everything remains centralized, scalable, and easy to maintain.
