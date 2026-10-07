$folder = "Lagu"
$outputFolder = "Lagu_128kbps"
New-Item -ItemType Directory -Force -Path $outputFolder | Out-Null

Get-ChildItem -Path $folder -Include *.mp3,*.mpeg -Recurse | ForEach-Object {
    $file = $_.FullName
    $name = $_.Name

    $bitrateStr = & .\ffprobe.exe -v error -select_streams a:0 -show_entries stream=bit_rate -of csv=p=0 "$file"
    $bitrate = [int]($bitrateStr / 1000)

    Write-Host "$name -> $bitrate kbps"

    if ($bitrate -gt 128) {
        $outPath = Join-Path $outputFolder $name
        & .\ffmpeg.exe -y -i "$file" -b:a 128k "$outPath" 2>$null
        Write-Host "  -> Diturunin ke 128kbps" -ForegroundColor Green
    } else {
        Copy-Item "$file" -Destination (Join-Path $outputFolder $name)
        Write-Host "  -> Sudah rendah, disalin apa adanya" -ForegroundColor Yellow
    }
}

Write-Host "`nSelesai! Semua file hasil ada di folder: $outputFolder"
