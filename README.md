# SQL Injection Interactive Demo

## Problem

SQL Injection (SQLi) remains one of the most critical and widespread vulnerabilities in web applications. It occurs when an application improperly concatenates user input into SQL database queries, allowing malicious actors to alter the query's structure. This can lead to unauthorized data access, authentication bypass, data loss, and sometimes even full system compromise.

Many developers learn about SQL injection theoretically but lack a safe, practical environment to see exactly how these attacks manipulate the database and how defensive mechanisms prevent them.

## Solution

The **SQL Injection Interactive Demo** is an educational web application designed to teach developers, QA engineers, and cybersecurity students about SQL Injection vulnerabilities through hands-on learning.

It provides an isolated, local sandbox where users can execute benign injection payloads and observe the results in real-time. Crucially, the application provides a side-by-side comparison of **Vulnerable Code** (using dangerous string concatenation) and **Secure Code** (using parameterized queries/prepared statements), making the abstract concepts of SQLi concrete and visible.

## How It Works

The application provides a split-screen interface where users select a scenario (e.g., Authentication Bypass, Data Exfiltration).

1. **Input Payload**: The user inputs a classic SQLi payload (like `' OR '1'='1`) into a simulated UI element (like a login form).
2. **Execution**: The user can choose to run this payload against a vulnerable backend endpoint, a secure backend endpoint, or both simultaneously.
3. **Visualization**: The interface clearly displays:
   - The exact raw SQL query constructed by the backend before hitting the database.
   - The execution time.
   - The data returned from the database (or the database error encountered).
4. **Comparison**: By comparing the vulnerable execution (which typically succeeds in the attack) and the secure execution (which treats the payload as a literal string), users immediately see the value of parameterized queries.

### Scenarios Covered
*   **Scenario A: Authentication Bypass (Classic In-Band)** - Bypassing login checks.
*   **Scenario B: Data Exfiltration (UNION-based)** - Stealing data from unrelated tables via search inputs.
*   **Scenario C: Error-based / Blind** - Exploiting unvalidated numeric inputs to force errors or alter logic.

### Safe Environment
The application is designed to be completely ephemeral. It runs in isolated Docker containers, and the database user executing the vulnerable queries (`demouser`) has heavily restricted permissions (only `SELECT`). Even if a user attempts a destructive attack, the application provides an instant "Reset Database" button to restore the sandbox to its initial pristine state.

## Architecture Diagram

\`\`\`text
                                      +------------------------------------+
                                      |                                    |
                                      |  User Interface (React + Vite)     |
                                      |  - Scenario Selection              |
                                      |  - Payload Input                   |
                                      |  - Side-by-Side Results Display    |
                                      |                                    |
                                      +-----------------+------------------+
                                                        |
                                            HTTP / JSON | (Vulnerable & Secure Endpoints)
                                                        v
+-------------------------------------------------------+-------------------------------------------------------+
|                                  Backend API (Node.js + Express)                                              |
|                                                                                                               |
|   +--------------------------+                                            +--------------------------+        |
|   |   Vulnerable Endpoints   |                                            |     Secure Endpoints     |        |
|   |   (String Concatenation) |                                            |  (Parameterized Queries) |        |
|   +-----------+--------------+                                            +-------------+------------+        |
|               |                                                                         |                     |
|               | (Uses Restricted 'demouser')               (Uses Restricted 'demouser') |                     |
|               |                                                                         |                     |
+---------------+-------------------------------------------------------------------------+---------------------+
                |                                                                         |
                |                                                                         |
                |                               Raw SQL Executions                        |
                +---------------------------------------+---------------------------------+
                                                        |
                                                        v
                                      +------------------------------------+
                                      |                                    |
                                      |  Database Sandbox (PostgreSQL)     |
                                      |  - Restricted User ('demouser')    |
                                      |  - Ephemeral Data Schema           |
                                      |  - Reset Function (Admin Only)     |
                                      |                                    |
                                      +------------------------------------+
\`\`\`

## Getting Started

### Prerequisites
* Docker
* Docker Compose

### Running the Application

**CRITICAL DEPLOYMENT RULE:** This application is intentionally vulnerable to critical security flaws by design. It **MUST NOT** be deployed to the public internet or production environments. It is meant exclusively for local execution.

1. Clone the repository to your local machine.
2. Navigate to the root of the project directory.
3. Start the application using Docker Compose:

   \`\`\`bash
   docker compose up --build
   \`\`\`
   *(Note: Depending on your docker version, you may need to use `docker-compose up --build`)*

4. Once all services are running, open your web browser and navigate to:
   \`\`\`
   http://localhost:5173
   \`\`\`

5. To stop the application and clean up containers, press `Ctrl+C` in your terminal, and then optionally run:
   \`\`\`bash
   docker compose down
   \`\`\`

## Built With
* **Frontend**: React, Vite, Tailwind CSS, Lucide React (Icons)
* **Backend**: Node.js, Express, `pg` (node-postgres)
* **Database**: PostgreSQL (Containerized)
