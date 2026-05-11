#!/bin/bash

# Colores para que se vea mejor
VERDE='\033[0;32m'
AZUL='\033[0;34m'
NC='\033[0m' # Sin color

echo -e "${AZUL}🚀 Iniciando actualización de chat-bot-itsolve...${NC}"

# 1. Obtener la versión actual antes del pull
VERSION_ANTERIOR=$(git rev-parse --short HEAD)
echo -e "🕒 Versión actual corriendo: ${VERDE}$VERSION_ANTERIOR${NC}"

# 2. Bajar cambios
echo "⬇️ Descargando cambios desde el repositorio..."
git fetch origin main > /dev/null
VERSION_NUEVA=$(git rev-parse --short origin/main)

if [ "$VERSION_ANTERIOR" == "$VERSION_NUEVA" ]; then
    echo -e "✨ ${VERDE}Ya estás en la última versión. No hay nada que actualizar.${NC}"
else
    echo -e "🆕 Se detectó una nueva versión: ${AZUL}$VERSION_NUEVA${NC}"
    
    # Hacer el pull
    git pull origin main
    
    # 3. Instalar dependencias si hubo cambios en package.json
    echo "📦 Actualizando dependencias..."
    npm install --quiet

    # 4. Reiniciar
    echo "🔄 Reiniciando aplicación..."
    # Cambiá 'all' por el nombre de tu proceso si tenés varios
    pm2 restart all --update-env > /dev/null

    # 5. Resumen final
    echo -e "\n-----------------------------------------------"
    echo -e "✅ ${VERDE}¡Actualización completada con éxito!${NC}"
    echo -e "📉 De: $VERSION_ANTERIOR"
    echo -e "📈 A:  ${VERDE}$VERSION_NUEVA${NC} (Corriendo ahora)"
    echo -e "-----------------------------------------------\n"
fi

# 6. Mostrar estado de PM2
pm2 status
