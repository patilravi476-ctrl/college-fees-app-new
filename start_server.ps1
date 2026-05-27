# start_server.ps1 - Native Windows Local Web Server
# Spins up a lightweight web server on port 8080 using built-in .NET HttpListener

$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Clear-Host
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  CPTC COLLEGE FEES PORTAL LOCAL WEB SERVER" -ForegroundColor Green -BackgroundColor Black
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Server running at:  http://localhost:$port/" -ForegroundColor Yellow
    Write-Host "Status:             Active and listening..." -ForegroundColor Green
    Write-Host "Press [Ctrl + C] in this window to stop the server." -ForegroundColor Red
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan

    # Launch browser automatically
    Start-Process "http://localhost:$port/"

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Resolve URL paths
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }
        
        # Clean query parameters and resolve absolute path
        $cleanPath = $urlPath.Split('?')[0]
        $filePath = Join-Path (Get-Location) $cleanPath.Replace("/", "\")
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Resolve MIME Types
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "text/plain"
            if ($ext -eq ".html" -or $ext -eq ".htm") { $contentType = "text/html; charset=utf-8" }
            elseif ($ext -eq ".css") { $contentType = "text/css" }
            elseif ($ext -eq ".js") { $contentType = "application/javascript" }
            elseif ($ext -eq ".json") { $contentType = "application/json" }
            elseif ($ext -eq ".png") { $contentType = "image/png" }
            elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
            elseif ($ext -eq ".svg") { $contentType = "image/svg+xml" }
            elseif ($ext -eq ".ico") { $contentType = "image/x-icon" }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "[200 OK] Served: $urlPath ($contentType)" -ForegroundColor Gray
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("File Not Found: $urlPath")
            $response.ContentType = "text/plain"
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            Write-Host "[404 Not Found] Request: $urlPath" -ForegroundColor Red
        }
        $response.Close()
    }
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
finally {
    $listener.Stop()
    Write-Host "Server Stopped." -ForegroundColor Yellow
}
