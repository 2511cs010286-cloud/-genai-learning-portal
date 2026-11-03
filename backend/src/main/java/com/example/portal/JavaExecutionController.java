package com.example.portal;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.concurrent.*;

@RestController
@RequestMapping("/api/java")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500",
                        "http://localhost:5501", "http://127.0.0.1:5501",
                        "http://localhost:3000", "http://127.0.0.1:3000",
                        "null"})
public class JavaExecutionController {
    private static final int MAX_SOURCE_CHARS = 20_000;
    private static final int MAX_INPUT_CHARS = 10_000;
    private static final int MAX_OUTPUT_BYTES = 32_000;
    private static final long TIMEOUT_SECONDS = 5;

    public record ExecuteRequest(String sourceCode, String input) {}
    public record ExecuteResponse(boolean success, String output) {}

    @PostMapping("/execute")
    public ExecuteResponse execute(@RequestBody ExecuteRequest request) {
        String source = request == null ? null : request.sourceCode();
        String input = request == null || request.input() == null ? "" : request.input();

        if (source == null || source.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Java source code is required.");
        }
        if (source.length() > MAX_SOURCE_CHARS || input.length() > MAX_INPUT_CHARS) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Code or input is too large.");
        }
        if (!source.matches("(?s).*\\bpublic\\s+class\\s+Main\\b.*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Use the class name Main: public class Main { ... }");
        }

        Path workDir = null;
        try {
            workDir = Files.createTempDirectory("portal-java-");
            Path sourceFile = workDir.resolve("Main.java");
            Files.writeString(sourceFile, source, StandardCharsets.UTF_8);

            Process compile = new ProcessBuilder("javac", "-encoding", "UTF-8", "Main.java")
                    .directory(workDir.toFile()).redirectErrorStream(true).start();
            String compileOutput = readWithTimeout(compile, "", TIMEOUT_SECONDS);
            if (compile.exitValue() != 0) {
                return new ExecuteResponse(false, compileOutput);
            }

            Process run = new ProcessBuilder("java", "-Xmx64m", "-cp", workDir.toString(), "Main")
                    .directory(workDir.toFile()).redirectErrorStream(true).start();
            String runOutput = readWithTimeout(run, input, TIMEOUT_SECONDS);
            return new ExecuteResponse(run.exitValue() == 0, runOutput);
        } catch (TimeoutException ex) {
            return new ExecuteResponse(false, "Execution timed out (5-second limit).");
        } catch (IOException ex) {
            return new ExecuteResponse(false,
                    "Could not start javac/java. Install a JDK and add its bin folder to PATH. Details: " + ex.getMessage());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            return new ExecuteResponse(false, "Execution was interrupted.");
        } finally {
            if (workDir != null) deleteDirectory(workDir);
        }
    }

    private String readWithTimeout(Process process, String input, long timeoutSeconds)
            throws IOException, InterruptedException, TimeoutException {
        try (var stdin = process.getOutputStream()) {
            stdin.write(input.getBytes(StandardCharsets.UTF_8));
        }
        ExecutorService reader = Executors.newSingleThreadExecutor();
        try {
            Future<byte[]> output = reader.submit(() -> process.getInputStream().readNBytes(MAX_OUTPUT_BYTES));
            if (!process.waitFor(timeoutSeconds, TimeUnit.SECONDS)) {
                process.destroyForcibly();
                throw new TimeoutException();
            }
            byte[] bytes = output.get(1, TimeUnit.SECONDS);
            String text = new String(bytes, StandardCharsets.UTF_8);
            return text + (bytes.length >= MAX_OUTPUT_BYTES ? "\n[Output truncated]" : "");
        } catch (ExecutionException | java.util.concurrent.TimeoutException ex) {
            process.destroyForcibly();
            return "Could not collect program output.";
        } finally {
            reader.shutdownNow();
        }
    }

    private void deleteDirectory(Path dir) {
        try (var paths = Files.walk(dir)) {
            paths.sorted((a, b) -> b.compareTo(a)).forEach(path -> {
                try { Files.deleteIfExists(path); } catch (IOException ignored) {}
            });
        } catch (IOException ignored) {}
    }
}
