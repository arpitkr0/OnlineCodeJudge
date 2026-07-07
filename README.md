# JudgeX - Online Code Judge

### A High-Performance, Distributed, and Sandboxed Code Execution Engine Built with Spring Boot, Kafka, Docker, and PostgreSQL.

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2+-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java 17](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-Distributed%20Queue-231F20?style=for-the-badge&logo=apachekafka&logoColor=white)](https://kafka.apache.org/)
[![Docker](https://img.shields.io/badge/Docker-Container%20Sandbox-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Relational%20DB-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🌟 Executive Summary & Backend Engineering Highlights

**JudgeX** is an enterprise-grade, scalable algorithm evaluation engine and online coding platform designed to securely compile, execute, and evaluate untrusted user code against rigorous algorithmic constraints. Built from the ground up to reflect modern distributed systems architecture, JudgeX demonstrates advanced backend engineering practices:

* 🚀 **Asynchronous Event-Driven Architecture**: Decouples high-throughput HTTP submission traffic from compute-heavy code compilation and execution using **Apache Kafka** and **Zookeeper**. Submissions are ingested instantly and dispatched asynchronously across worker pools.
* 🛡️ **Hardened Container Sandboxing (Docker-in-Docker)**: Protects host infrastructure from malicious code, fork bombs, and resource exhaustion. Every evaluation runs inside ephemeral, non-root Docker containers with zero network access (`--network=none`), memory and CPU quotas, read-only root filesystems, PID limits, and Linux kernel capability dropping (`--cap-drop=ALL`).
* ⏱️ **High-Precision Algorithmic Timing & Verdict Evaluation**: Implements sub-millisecond POSIX nanosecond timing inside container shells (`$((end - start))`) to measure pure algorithm execution duration—excluding JVM startup or compilation overhead. Guarantees competitive programming accuracy (`AC`, `WA`, `TLE`, `MLE`, `CE`, `RE`).
* ⚡ **Real-Time WebSocket Streaming**: Utilizes **STOMP over WebSocket** to push live evaluation progress and instant verdict updates to the user interface, eliminating inefficient REST polling.
* 💥 **Fault Tolerance & Dead Letter Queues (DLQ)**: Implements robust Kafka DLQ consumer patterns. Poison-pill submissions or container crashes are trapped and routed to a dedicated dead-letter topic without halting worker threads or crashing the consumer group.
* 📈 **Horizontal Worker Scalability**: Stateless worker nodes independently consume from Kafka topic partitions. Scaling evaluation throughput is as simple as adding container instances (`--scale worker=N`).

---

## 🏗️ Distributed System Architecture

```mermaid
flowchart TD
    subgraph Client Layer
        UI[React / Tailwind / Monaco UI]
    end

    subgraph API & Gateway Layer
        API[Spring Boot API Gateway & Controller]
        AUTH[JWT Security & Role Filter]
    end

    subgraph Event Streaming & Messaging
        K[(Apache Kafka: code-submissions)]
        DLQ[(Kafka DLQ: code-submissions-dlq)]
        ZK[Zookeeper]
    end

    subgraph Distributed Execution Workers
        W1[Worker Node 1<br/>Consumer Thread]
        W2[Worker Node 2<br/>Consumer Thread]
        WN[Worker Node N<br/>Consumer Thread]
    </subgraph>

    subgraph Sandboxed Execution Engine
        D1[Docker Sandbox<br/>Memory/CPU/Network Guard]
        D2[Docker Sandbox<br/>Memory/CPU/Network Guard]
        DN[Docker Sandbox<br/>Memory/CPU/Network Guard]
    </subgraph>

    subgraph Storage & Realtime Push
        DB[(PostgreSQL Database)]
        WS[WebSocket STOMP Broker]
    end

    UI -- "1. POST /api/submissions (JWT)" --> API
    API -- "2. Validate & Authorize" --> AUTH
    API -- "3. Persist PENDING" --> DB
    API -- "4. Publish Submission Event" --> K
    K -- "5. Consume Async Task" --> W1 & W2 & WN
    K -. "Poison Pill / Crash" .-> DLQ
    W1 -- "6. Spawn Ephemeral Container" --> D1
    W2 -- "6. Spawn Ephemeral Container" --> D2
    WN -- "6. Spawn Ephemeral Container" --> DN
    D1 & D2 & DN -- "7. Return Execution Metrics & Logs" --> W1 & W2 & WN
    W1 & W2 & WN -- "8. Evaluate Verdict & Save" --> DB
    W1 & W2 & WN -- "9. Push Live Verdict" --> WS
    WS -- "10. Real-Time UI Update" --> UI
```

---

## 📦 Backend Core Modules

| Module | Technical Description & Key Responsibilities |
| :--- | :--- |
| **`com.codejudge.auth`** | Implements stateless authentication and authorization using **JSON Web Tokens (JWT)** and **BCrypt** password hashing. Enforces role-based access control (`ROLE_USER`, `ROLE_ADMIN`) via custom Spring Security filter chains. |
| **`com.codejudge.problem`** | Manages coding problem specifications, markdown descriptions, constraints, and test case persistence. Implements pagination, difficulty sorting, and automatic startup data seeding of classic competitive programming challenges (Codeforces & LeetCode). |
| **`com.codejudge.submission`** | Handles code submission ingestion, history retrieval, and user submission tracking. Optimized with JPA `@EntityGraph` and custom queries to separate sample-test runs from official competition submissions. |
| **`com.codejudge.execution`** | The heart of the evaluation engine. Contains the **Kafka Consumer Listener**, **WorkerManager**, language-specific **Executor Factory**, and **VerdictEvaluator**. Evaluates stdout/stderr against test case expectations and enforces time/memory constraints. |
| **`com.codejudge.resilience`** | Dedicated Dead Letter Queue (DLQ) consumer service that intercepts unhandled exceptions, deserialization failures, and container timeouts, gracefully updating submission states to `SYSTEM_ERROR`. |
| **`com.codejudge.realtime`** | WebSocket STOMP notification service that broadcasts granular submission state transitions (`PENDING` $\rightarrow$ `RUNNING` $\rightarrow$ `ACCEPTED`) directly to subscribed frontend clients. |

---

## 🛡️ Sandbox Security & Supported Languages

Every user submission is executed in an isolated sandbox with the following Docker security flags:
`--rm` `--network=none` `--memory=<limit>m` `--cpus=<limit>` `--pids-limit=64` `--read-only` `--cap-drop=ALL` `--security-opt=no-new-privileges`

| Language | Sandbox Image | Compilation & Execution Strategy | Timing Accuracy |
| :--- | :--- | :--- | :--- |
| **Java 17** | `judge-java:latest` | Compiles via `javac Main.java`, then executes `java Main` inside container. | Measures strictly `java Main` execution after compilation. |
| **Python 3** | `judge-python:latest` | Direct execution via `python main.py` wrapped in Linux `timeout`. | Sub-millisecond POSIX shell timestamp difference. |
| **C++ 17** | `judge-cpp:latest` | Highly optimized compilation via `g++ -std=c++17 -O2 main.cpp -o main`. | Measures binary `./main` execution speed after build. |

---

## 🔌 REST API & Endpoints

### Authentication & Users
* `POST /api/auth/register` — Register a new user account
* `POST /api/auth/login` — Authenticate and receive a JWT Bearer token
* `GET /api/auth/me` — Retrieve current authenticated profile

### Problem Management
* `GET /api/problems` — Paginated list of problems with difficulty filtering
* `GET /api/problems/{id}` — Fetch detailed problem description, sample test cases, and memory/time limits
* `POST /api/problems` *(Admin)* — Create a new algorithmic challenge
* `PUT /api/problems/{id}` *(Admin)* — Update existing problem specification
* `POST /api/problems/{id}/testcases` *(Admin)* — Add hidden or sample evaluation test cases

### Submissions & Execution
* `POST /api/submissions` — Submit code (Java, Python, C++) for asynchronous evaluation
* `GET /api/submissions/{id}` — Retrieve granular verdict, execution runtime, memory consumed, and test case logs
* `GET /api/submissions/me` — Fetch paginated submission history for the logged-in user

📖 **Interactive API Documentation**: When running locally, visit the live OpenAPI / Swagger UI at:
`http://localhost:8080/swagger-ui.html`

---

## 📊 Verdict System

The evaluation engine categorizes code execution into 9 deterministic states:
* 🟡 `PENDING`: Queued in Kafka awaiting an available worker node.
* 🔵 `RUNNING`: Container spawned; currently executing against test cases.
* 🟢 `ACCEPTED`: All test cases passed within memory and time constraints!
* 🔴 `WRONG_ANSWER`: Output mismatch on one or more test cases.
* 🟠 `TIME_LIMIT_EXCEEDED`: Execution exceeded the allowed millisecond threshold per test case.
* 🟣 `MEMORY_LIMIT_EXCEEDED`: Container process exceeded the RAM allocation and was terminated by Linux OOM killer.
* 🟤 `COMPILATION_ERROR`: Syntax errors during `javac` or `g++` compilation stages.
* ⚫ `RUNTIME_ERROR`: Unhandled exceptions, segmentation faults, or non-zero exit codes during execution.
* ⚪ `SYSTEM_ERROR`: Caught by DLQ due to internal infrastructure or Docker daemon faults.

---

## 🚀 Setup & Execution Guide (Docker Compose)

JudgeX is designed for seamless deployment using Docker Compose, bundling the database, message broker, backend API, frontend static files, and dynamic worker nodes into a single cohesive environment.

### 1. Prerequisite
Ensure **Docker Desktop** is running on your Windows/Linux/macOS system.

### 2. First-Time Sandbox Setup
Build the custom language execution sandbox images once from the root directory:
```bash
docker build -t judge-java:latest docker/judge-java
docker build -t judge-python:latest docker/judge-python
docker build -t judge-cpp:latest docker/judge-cpp
```

### 3. Launch the Platform (Production Detached Mode)
Start PostgreSQL, Zookeeper, Kafka, API Server, and Worker nodes in the background:
```bash
docker compose up -d --build
```

💡 **Simulate High-Throughput Distributed Contest Scaling**:  
To scale out the evaluation engine across multiple concurrent worker containers:
```bash
docker compose up -d --build --scale worker=4
```

### 4. Accessing the App & Default Credentials
* 🌐 **Web Interface**: [http://localhost:8080](http://localhost:8080)
* 📜 **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

**Default Admin Account**:
```text
Username: admin
Password: admin123
```

---

## 🔄 Daily Operations & Maintenance

* **Start the system** (after initial build):
  ```bash
  docker compose up -d
  # Or with 4 worker nodes:
  docker compose up -d --scale worker=4
  ```
* **Stop all containers**:
  ```bash
  docker compose down
  ```
* **Rebuild after modifying Java Backend or React Frontend code**:
  ```bash
  docker compose up -d --build
  ```
* **Rebuild a specific language sandbox** (e.g. after editing `docker/judge-python/Dockerfile`):
  ```bash
  docker build -t judge-python:latest docker/judge-python
  docker compose up -d
  ```

---

## 🧪 Testing & Verification

The codebase includes comprehensive unit and integration test suites covering JWT security filters, Kafka producer/consumer serialization, repository queries, and verdict evaluation math.

To run the automated test suite:
```bash
cd backend
mvn test
```

---

## 💻 Frontend UI Features

The built-in React frontend is served directly from Spring Boot's static resources (`src/main/resources/static`) and features:
* **Monaco Code Editor**: VS Code-powered syntax highlighting, code folding, and auto-indentation for Java, Python, and C++.
* **Real-Time WebSocket Updates**: Live progress badge indicators that transition seamlessly from *Pending* to *Running* to *Accepted*.
* **Interactive Problem Workspace**: Split-pane layout with sample test case runner, custom input testing, and detailed error logs.
* **Responsive Dark/Glassmorphism Theme**: Crafted with Tailwind CSS and Lucide icons for a premium developer experience.

---

<p align="center">
  <b>Built with ❤️ demonstrating Scalable Backend Engineering & Distributed Systems Design.</b>
</p>
