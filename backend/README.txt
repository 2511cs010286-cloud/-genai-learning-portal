Start from this folder with: mvn spring-boot:run
API: POST http://localhost:8080/api/java/execute
JSON body: {"sourceCode":"public class Main { public static void main(String[] args) { System.out.println(\"Hi\"); } }","input":""}
Requires JDK 17+ and Maven. Local demo only; not a secure sandbox.
