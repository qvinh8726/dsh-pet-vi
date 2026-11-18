param([string]$Installer = 'dist-app/DSH-Pet-Viet-1.0.1-vi-Windows-x64-Setup.exe')
$ErrorActionPreference = 'Stop'
$packageRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$installerPath = (Resolve-Path (Join-Path $packageRoot $Installer)).Path
$registryRoot = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall'
$existing = Get-ChildItem $registryRoot | Get-ItemProperty | Where-Object { $_.DisplayName -eq 'DSH Pet Việt' }
if ($existing) { throw 'Đã có DSH Pet Việt được cài; không chạy phép thử để tránh ảnh hưởng bản đang dùng.' }
$testRoot = Join-Path $env:TEMP ('dsh-pet-vi-installer-' + [guid]::NewGuid().ToString('N'))
$destination = Join-Path $testRoot 'installed'
New-Item -ItemType Directory -Path $testRoot | Out-Null
$env:DSH_HOME = Join-Path $testRoot 'dsh-home'
$env:DSH_PET_USER_DATA_DIR = Join-Path $testRoot 'electron-profile'
$env:DSH_PET_VERIFY_IN_PLACE = '1'
$env:DSH_PET_RELEASE_ARTIFACTS = Join-Path $packageRoot 'temp/installer-verification'
New-Item -ItemType Directory -Path $env:DSH_PET_RELEASE_ARTIFACTS -Force | Out-Null
$result = [ordered]@{ installer = $installerPath; destination = $destination; install = 'pending'; launch = 'pending'; uninstall = 'pending' }
try {
    $setup = Start-Process -FilePath $installerPath -ArgumentList @('/S', "/D=$destination") -PassThru -Wait
    if ($setup.ExitCode -ne 0) { throw "Bộ cài trả mã $($setup.ExitCode)" }
    $installed = Get-ChildItem $registryRoot | Get-ItemProperty | Where-Object { $_.DisplayName -eq 'DSH Pet Việt' }
    if (-not $installed) { throw 'Thiếu mục gỡ cài đặt trong registry.' }
    if ([IO.Path]::GetFullPath(($installed.DisplayIcon -replace ',0$', '')).Trim('"') -ne (Join-Path $destination 'dsh-pet-vi.exe')) { throw 'Bộ cài ghi sai thư mục đích thử nghiệm.' }
    foreach ($name in @('dsh-pet-vi.exe', 'resources/app.asar', 'HUONG-DAN.md', 'GIAY-PHEP-MA-NGUON.txt', 'GHI-CONG-VA-BAN-QUYEN.md')) {
        if (-not (Test-Path (Join-Path $destination $name))) { throw "Thiếu tệp cài đặt: $name" }
    }
    $result.install = 'PASS'
    & node (Join-Path $PSScriptRoot 'verify-release.mjs') (Join-Path $destination 'dsh-pet-vi.exe')
    if ($LASTEXITCODE -ne 0) { throw 'Kiểm tra ứng dụng sau cài thất bại.' }
    $result.launch = 'PASS'
} finally {
    $uninstaller = Join-Path $destination 'Uninstall dsh-pet-vi.exe'
    # Chỉ chạy bộ gỡ trong đúng thư mục thử đã tạo; không suy ra từ cấu hình người dùng.
    if ((Test-Path $uninstaller) -and $destination.StartsWith($testRoot + '\')) {
        $remove = Start-Process -FilePath $uninstaller -ArgumentList @('/S', "_?=$destination") -PassThru -Wait
        if ($remove.ExitCode -eq 0) {
            $remaining = Get-ChildItem $registryRoot | Get-ItemProperty | Where-Object { $_.DisplayName -eq 'DSH Pet Việt' }
            if (-not $remaining -and -not (Test-Path (Join-Path $destination 'dsh-pet-vi.exe'))) { $result.uninstall = 'PASS' }
        }
    }
    $result | ConvertTo-Json | Out-File -FilePath (Join-Path $env:DSH_PET_RELEASE_ARTIFACTS 'installer-summary.json') -Encoding utf8
    $result | ConvertTo-Json | Write-Output
}
if ($result.uninstall -ne 'PASS') { throw 'Bộ gỡ chưa hoàn tất kiểm tra.' }
