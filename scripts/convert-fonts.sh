#!/bin/bash
# Script para converter TTF para WOFF2 e copiar para public/fonts
# Requer: npm install -g ttf2woff2 OU brew install woff2

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Converting Outfit fonts to WOFF2...${NC}"

# Caminho para os arquivos baixados (ajuste se necessário)
FONT_DIR="$HOME/Downloads/Outfit/static"
OUTPUT_DIR="./public/fonts"

# Criar diretório de saída se não existir
mkdir -p "$OUTPUT_DIR"

# Verificar se ttf2woff2 está instalado
if ! command -v ttf2woff2 &> /dev/null && ! command -v woff2_compress &> /dev/null; then
    echo "Installing ttf2woff2..."
    npm install -g ttf2woff2
fi

# Converter os arquivos necessários
convert_font() {
    local input="$1"
    local output="$2"
    
    if [ -f "$input" ]; then
        if command -v ttf2woff2 &> /dev/null; then
            ttf2woff2 "$input" "$output"
        else
            woff2_compress "$input"
            mv "${input%.ttf}.woff2" "$output"
        fi
        echo -e "${GREEN}✓ Converted: $(basename $output)${NC}"
    else
        echo "⚠ File not found: $input"
    fi
}

# Mapear os arquivos TTF para os nomes esperados
convert_font "$FONT_DIR/Outfit-Regular.ttf" "$OUTPUT_DIR/Outfit-400.woff2"
convert_font "$FONT_DIR/Outfit-Medium.ttf" "$OUTPUT_DIR/Outfit-500.woff2"
convert_font "$FONT_DIR/Outfit-SemiBold.ttf" "$OUTPUT_DIR/Outfit-600.woff2"
convert_font "$FONT_DIR/Outfit-Bold.ttf" "$OUTPUT_DIR/Outfit-700.woff2"

echo -e "${BLUE}Conversion complete!${NC}"
echo "Files created in: $OUTPUT_DIR"
