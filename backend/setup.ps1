# Script de configuracion automatica UniTicket Backend
# Ejecutar desde la carpeta backend/ con:
# powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host '============================================'
Write-Host '   UniTicket Backend - Setup Automatico    '
Write-Host '============================================'

# Verificar que Python este instalado
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python detectado: $pythonVersion"
} catch {
    Write-Host 'Error: Python no encontrado.'
    exit 1
}

# Crear entorno virtual
Write-Host '[1/5] Creando entorno virtual...'
if (-not (Test-Path 'venv')) {
    python -m venv venv
}

# Instalar dependencias
Write-Host '[2/5] Instalando dependencias...'
& .\venv\Scripts\python.exe -m pip install --upgrade pip --quiet
& .\venv\Scripts\python.exe -m pip install -r requirements.txt --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Error al instalar dependencias.' -ForegroundColor Red
    exit 1
}
Write-Host 'Dependencias instaladas.'

# Crear .env si no existe
Write-Host '[3/5] Configurando variables de entorno...'
if (-not (Test-Path '.env')) {
    Copy-Item '.env.example' '.env'
    Write-Host 'Archivo .env creado.'
} else {
    Write-Host 'Archivo .env ya existe.'
}

# Migraciones
Write-Host '[4/5] Preparando e inicializando base de datos...'
Write-Host '(Generando migraciones...)' -ForegroundColor Gray
& .\venv\Scripts\python.exe manage.py makemigrations tickets
& .\venv\Scripts\python.exe manage.py migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Error: Fallo la migracion de la base de datos.' -ForegroundColor Red
    exit 1
}
Write-Host 'Base de datos inicializada correctamente.' -ForegroundColor Green

# Datos de demostracion
$demo = Read-Host '¿Cargar datos de demostracion? [s/N]'
if ($demo -eq 's' -or $demo -eq 'S') {
    & .\venv\Scripts\python.exe manage.py seed_demo
}

# Superusuario
$crear = Read-Host '¿Crear superusuario administrador? [s/N]'
if ($crear -eq 's' -or $crear -eq 'S') {
    & .\venv\Scripts\python.exe manage.py createsuperuser
}

Write-Host '============================================'
Write-Host '  Setup completado exitosamente!' -ForegroundColor Green
Write-Host '============================================'
Write-Host 'Para iniciar el servidor:'
Write-Host '  .\venv\Scripts\Activate.ps1'
Write-Host '  python manage.py runserver'
###powershell -ExecutionPolicy Bypass -File setup.ps1 // para ejecutar el scriptS