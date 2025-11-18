# PowerShell script to find an available port starting from 3004
# This prevents conflicts with previous deployments or other processes

$startPort = 3004
$maxPort = 3010  # Try up to 3010

Write-Host "Searching for available port starting from $startPort..." -ForegroundColor Yellow

for ($port = $startPort; $port -le $maxPort; $port++) {
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("127.0.0.1", $port)
        $tcpClient.Close()
        Write-Host "Port $port is in use" -ForegroundColor Red
    }
    catch {
        # Port is available
        Write-Host "Port $port is available" -ForegroundColor Green
        $env:PORT = $port
        Write-Host "Starting development server on port $port" -ForegroundColor Cyan
        exit 0
    }
}

Write-Host "No available ports found between $startPort and $maxPort" -ForegroundColor Red
exit 1
