# 🛠️ DevOps Task Manager

A professional, containerized Node.js & Express microservice engineered for high-availability, seamless container orchestration, and rapid CI/CD deployment. This repository demonstrates best practices in modern DevOps engineering, including structured observability logs, system health diagnostics, and container lifecycle management.

---

## 🌟 Key Features

*   **⚡ Lightweight Express Microservice**: High-performance Node.js runtime environment.
*   **🐳 Production-Ready Containerization**: Optimized multi-stage-ready `Dockerfile` with layer caching and a `.dockerignore` strategy.
*   **🎛️ Docker Compose Orchestration**: Seamless service provisioning and local port-mapping configurations.
*   **🩺 Comprehensive Health Diagnostics**: System resource monitoring (RSS, Heap memory metrics, system uptime) configured for Kubernetes liveness/readiness probes or Docker Healthchecks.
*   **📋 Structured Request Logging**: High-visibility console logging formatted specifically for DevOps log aggregation and log-scraping tools.
*   **🛑 Graceful Process Shutdown**: Active TCP connection draining on lifecycle termination signals (`SIGINT` & `SIGTERM`) to prevent connection dropping.

---

## 🏗️ Project Architecture & Directory Structure

Here is an overview of the project structure and the purpose of each file:

```text
devops-task-manager/
├── index.js             # Express application server code (Entrypoint, routes, middlewares & shutdown handlers)
├── package.json         # Project metadata, scripts, and production dependencies
├── package-lock.json    # Exact dependency tree lockfile for reproducible builds
├── Dockerfile           # Docker image building instructions
├── docker-compose.yml   # Multi-container local orchestration configuration
├── .dockerignore        # List of paths and files excluded from the Docker build context
├── .gitignore           # List of files and folders untracked by Git
└── README.md            # Extensive system documentation and setup guide
```

---

## 🛠️ Technology Stack

*   **Runtime**: [Node.js](https://nodejs.org/) (version 20)
*   **Web Framework**: [Express.js](https://expressjs.com/) (version 5.x)
*   **Containerization**: [Docker](https://www.docker.com/)
*   **Orchestration**: [Docker Compose](https://docs.docker.com/compose/)
*   **CI/CD Pipeline**: GitHub Actions & DockerHub

---

## 🚀 Getting Started

### Local Development Setup

To run the application directly on your local system:

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd devops-task-manager
    ```

2.  **Install Production Dependencies**:
    ```bash
    npm install
    ```

3.  **Start the Local Server**:
    ```bash
    node index.js
    ```
    *   **Default Port**: The server starts on port `5000` (or the port defined in your `PORT` environment variable).
    *   **Access the API**: Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 🐳 Containerization & Orchestration

This project is built to run natively within containerized environments. Below are the commands to build and manage the service using Docker.

### Running with Docker

1.  **Build the Docker Image**:
    ```bash
    docker build -t devops-task-manager .
    ```

2.  **Run the Container**:
    ```bash
    docker run -d -p 5000:5000 --name task-manager-service devops-task-manager
    ```
    *   `-d`: Runs the container in detached (background) mode.
    *   `-p 5000:5000`: Maps port `5000` on your host system to port `5000` inside the container.
    *   `--name`: Assigns a readable name to the container instance.

3.  **View Container Logs**:
    ```bash
    docker logs -f task-manager-service
    ```

### Running with Docker Compose

For a unified environment startup, utilize Docker Compose.

*   **Spin Up the Infrastructure**:
    ```bash
    docker compose up --build
    ```
    *   The `--build` flag ensures that the image is rebuilt with any recent code edits.

*   **Teardown the Infrastructure**:
    ```bash
    docker compose down
    ```

---

## 🔌 API Endpoints Documentation

The service exposes the following endpoints for consumption and health monitoring:

### 1. Root Endpoint

*   **Endpoint**: `GET /`
*   **Description**: Verification endpoint to confirm the service is live.
*   **Response (Plain Text)**:
    ```text
    DevOps Task Manager API is running.
    ```

### 2. Comprehensive Health Diagnostics

*   **Endpoint**: `GET /health`
*   **Description**: Crucial for cluster container orchestrators (like Kubernetes, AWS ECS, or HashiCorp Nomad) to determine application health.
*   **Response Format (JSON)**:
    ```json
    {
      "status": "healthy",
      "timestamp": "2026-05-30T19:35:00.000Z",
      "uptime": "120.45 seconds",
      "memoryUsage": {
        "rss": "28.50 MB",
        "heapTotal": "7.50 MB",
        "heapUsed": "4.20 MB"
      },
      "environment": "development",
      "nodeVersion": "v20.x.x"
    }
    ```

---

## 🛠️ DevOps & Production Operations

### Observability Logs

Every incoming HTTP request is logged in a structured, standard format to `stdout`. This facilitates seamless log parsing with tools like **Fluentbit**, **Promtail**, **Logstash**, or **Datadog Agent**:

```text
[2026-05-30T19:30:15.123Z] GET /health - Client IP: ::ffff:127.0.0.1
```

### Graceful Signal Management

In production clusters (such as Kubernetes pods), rolling updates send `SIGTERM` / `SIGINT` signals to the containers. 

Our application intercepts these signals to:
1.  **Stop accepting new client connections**.
2.  **Allow existing active connections to drain completely** (up to a 10-second safety window).
3.  **Release resources cleanly** (e.g. database handles, open sockets).
4.  **Exit safely with code `0`**, eliminating orphan processes.

---

## 🤖 CI/CD Automation Pipeline

The repository is pre-configured to support automated deployments. Once code is pushed to the primary branch, a GitHub Actions workflow can be defined to:

1.  **Trigger on Push/PR**: Automatically run builds on branch pushes.
2.  **Lint & Test**: Ensure syntax and structural checks pass.
3.  **Build Docker Image**: Package the updated application source.
4.  **Push to DockerHub**: Tag and upload the image to a central Docker registry.

### Required Secrets for CI/CD Setup

To activate image registry pushing, configure these variables inside your GitHub Repository's **Settings > Secrets and variables > Actions**:
*   `DOCKERHUB_USERNAME`: Your DockerHub account username.
*   `DOCKERHUB_TOKEN`: A personal access token generated from DockerHub.

---

## 👥 Authors & Maintainers

*   **Kajal Pandey** - *Initial DevOps Engineering & Application Setup*
