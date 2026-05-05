$Context = [System.Security.SecurityContext]::Capture()

$uri = "ws://127.0.0.1:8080/webSocket"
$ws = New-Object System.Net.WebSockets.ClientWebSocket
$cts = New-Object System.Threading.CancellationTokenSource

Write-Host "Testing HTTP connectivity..."
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8080/" -Method Head -ErrorAction Stop
    Write-Host "HTTP Root OK. Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "HTTP Root Check Failed: $_" -ForegroundColor Yellow
}

try {
    Write-Host "Connecting to WebSocket at $uri..."
    $task = $ws.ConnectAsync($uri, $cts.Token)
    $task.Wait()
    
    if ($ws.State -eq 'Open') {
        Write-Host "Connected successfully!" -ForegroundColor Green
        
        # Send message
        $message = "Hello from PowerShell"
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($message)
        $segment = New-Object System.ArraySegment[byte] -ArgumentList $buffer
        $task = $ws.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)
        $task.Wait()
        Write-Host "Sent message: $message"
        
        # Receive message
        $rcvBuffer = New-Object byte[] 1024
        $rcvSegment = New-Object System.ArraySegment[byte] -ArgumentList $rcvBuffer
        $rcvTask = $ws.ReceiveAsync($rcvSegment, $cts.Token)
        $rcvTask.Wait()
        
        $receivedMessage = [System.Text.Encoding]::UTF8.GetString($rcvBuffer, 0, $rcvTask.Result.Count)
        Write-Host "Received: $receivedMessage" -ForegroundColor Cyan
        
         # Close
        $closeTask = $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", $cts.Token)
        $closeTask.Wait()

    } else {
        Write-Host "Failed to connect. State: $($ws.State)" -ForegroundColor Red
    }
} catch {
    Write-Host "EXCEPTION:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.InnerException) {
        Write-Host "INNER EXCEPTION 1:" -ForegroundColor Red
        Write-Host $_.Exception.InnerException.Message -ForegroundColor Red
        if ($_.Exception.InnerException.InnerException) {
            Write-Host "INNER EXCEPTION 2:" -ForegroundColor Red
            Write-Host $_.Exception.InnerException.InnerException.Message -ForegroundColor Red
        }
    }
}
