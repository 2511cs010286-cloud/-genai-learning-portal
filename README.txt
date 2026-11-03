GEN AI LEARNING PORTAL — WITH JAVA CODE RUNNER

PROJECT STRUCTURE
- index.html, style.css, script.js: frontend
- backend/: Spring Boot API that compiles and runs Java code

REQUIREMENTS
1. JDK 17 or newer (must include javac and java).
2. Maven 3.9+ OR use the included Maven Wrapper if you add one.
3. VS Code (optional).

RUN THE BACKEND (Windows PowerShell)
1. Open the project folder in VS Code.
2. Open a terminal and run:
   cd backend
   mvn spring-boot:run
3. Keep this terminal open. The API runs at http://localhost:8080.

RUN THE FRONTEND
1. Open the project root (the folder containing index.html) in VS Code.
2. Install the Live Server extension if needed.
3. Right-click index.html → Open with Live Server.
4. Log in as a student, then choose "Java Runner".
5. Use `public class Main` and click "Run Java".

EXAMPLE
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}

IMPORTANT SECURITY NOTE
This is a LOCAL DEVELOPMENT / LEARNING DEMO. The backend executes submitted Java
programs as operating-system processes under the account running Spring Boot.
Timeouts and output limits are included, but this is NOT a secure sandbox.
Do not expose port 8080 to the internet or allow untrusted users to submit code.
For a public classroom deployment, run submissions in isolated containers
(e.g. Docker with no network, strict CPU/memory/process limits) or use a
dedicated code-execution service.

TROUBLESHOOTING
- If `mvn` is not recognized: install Apache Maven and add its `bin` directory
  to Windows PATH, then close and reopen the VS Code terminal.
- Check `java -version` and `javac -version`. Both must work. If javac is not
  recognized, install a full JDK (not only a JRE) and configure JAVA_HOME/PATH.
- If the browser cannot connect, start the backend first and refresh the page.
- Live Server usually uses port 5500. If you use another port, add that origin
  to @CrossOrigin in JavaExecutionController.java.
