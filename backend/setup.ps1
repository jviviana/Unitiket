# Script de configuración automática — UniTicket Backend
# Ejecutar desde la carpeta backend/ con:
#   powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   UniTicket Backend — Setup Automático    " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Python esté instalado
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ $pythonVersion detectado" -ForegroundColor Green
} catch {
    Write-Host "✗ Python no encontrado. Descárgalo de https://www.python.org/downloads/" -ForegroundColor Red
    Write-Host "  IMPORTANTE: Marca 'Add Python to PATH' durante la instalación." -ForegroundColor Yellow
    exit 1
}

# Crear entorno virtual
Write-Host "`n[1/5] Creando entorno virtual..." -ForegroundColor Yellow
python -m venv venv
Write-Host "✓ Entorno virtual creado en ./venv" -ForegroundColor Green

# Activar entorno virtual
Write-Host "`n[2/5] Activando entorno virtual..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
Write-Host "✓ Entorno virtual activado" -ForegroundColor Green

# Instalar dependencias
Write-Host "`n[3/5] Instalando dependencias..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet
Write-Host "✓ Dependencias instaladas" -ForegroundColor Green

# Crear .env si no existe
Write-Host "`n[4/5] Configurando variables de entorno..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Archivo .env creado (edítalo si es necesario)" -ForegroundColor Green
} else {
    Write-Host "✓ Archivo .env ya existe, se mantiene" -ForegroundColor Green
}

# Migraciones
Write-Host "`n[5/5] Inicializando base de datos..." -ForegroundColor Yellow
python manage.py migrate
Write-Host "✓ Base de datos inicializada (SQLite)" -ForegroundColor Green

# Datos de demostración
Write-Host ""
Write-Host "¿Cargar datos de demostración? (usuarios y tickets de ejemplo) [s/N]: " -ForegroundColor Cyan -NoNewline
$demo = Read-Host
if ($demo -eq 's' -or $demo -eq 'S') {
    python manage.py seed_demo
    Write-Host "✓ Datos de demostración cargados" -ForegroundColor Green
}

# Superusuario
Write-Host ""
Write-Host "¿Crear superusuario administrador ahora? [s/N]: " -ForegroundColor Cyan -NoNewline
$crear = Read-Host
if ($crear -eq 's' -or $crear -eq 'S') {
    python manage.py createsuperuser
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  ✓ Setup completado exitosamente!         " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar el servidor:" -ForegroundColor White
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow
Write-Host "  python manage.py runserver" -ForegroundColor Yellow
Write-Host ""
Write-Host "Panel de administración:" -ForegroundColor White
Write-Host "  http://127.0.0.1:8000/admin/" -ForegroundColor Yellow
Write-Host ""
Write-Host "API endpoints base:" -ForegroundColor White
Write-Host "  POST http://127.0.0.1:8000/api/auth/login/" -ForegroundColor Yellow
Write-Host "  GET  http://127.0.0.1:8000/api/tickets/" -ForegroundColor Yellow
Write-Host ""
