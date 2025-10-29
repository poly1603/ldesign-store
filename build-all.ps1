# Build All Packages Script
# 构建所有 @ldesign/store 子包

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Building @ldesign/store packages" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# 进入 store 目录
$storeDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $storeDir

# 包列表
$packages = @(
  "core",
  "vue",
  "react",
  "solid",
  "svelte",
  "angular",
  "alpine",
  "preact",
  "qwik",
  "astro",
  "lit",
  "nextjs",
  "nuxtjs",
  "remix",
  "sveltekit"
)

$successCount = 0
$failCount = 0
$failedPackages = @()

# 安装和构建每个包
foreach ($pkg in $packages) {
  Write-Host "[$($packages.IndexOf($pkg) + 1)/$($packages.Count)] Building $pkg..." -ForegroundColor Green
  
  try {
    Set-Location "packages/$pkg"
    
    # 安装依赖
    Write-Host "  Installing dependencies..." -ForegroundColor Gray
    pnpm install --silent
    
    # 构建
    Write-Host "  Building..." -ForegroundColor Gray
    pnpm build
    
    Write-Host "  ✓ $pkg built successfully" -ForegroundColor Green
    $successCount++
    
    Set-Location ../..
  }
  catch {
    Write-Host "  ✗ Failed to build $pkg" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    $failCount++
    $failedPackages += $pkg
    Set-Location ../..
  }
  
  Write-Host ""
}

# 输出总结
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Build Summary" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Total packages: $($packages.Count)" -ForegroundColor White
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

if ($failCount -gt 0) {
  Write-Host ""
  Write-Host "Failed packages:" -ForegroundColor Red
  foreach ($pkg in $failedPackages) {
    Write-Host "  - $pkg" -ForegroundColor Red
  }
}
else {
  Write-Host ""
  Write-Host "🎉 All packages built successfully!" -ForegroundColor Cyan
}

Write-Host "=================================" -ForegroundColor Cyan



