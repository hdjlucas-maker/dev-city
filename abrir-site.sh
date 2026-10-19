#!/bin/bash
# ==========================================================
#  abre-site.sh — liga um servidorzinho local e abre o site
#
#  Por que isso existe?
#  Os navegadores só deixam usar a CÂMERA quando o site roda
#  em "localhost". E para abrir no CELULAR, o telefone precisa
#  do endereço do seu computador na rede Wi-Fi.
#
#  Como usar: clique duas vezes neste arquivo (ou no terminal:
#  ./abrir-site.sh). Para parar, aperte Ctrl+C.
# ==========================================================

# Vai para a pasta onde este arquivo está
cd "$(dirname "$0")"

PORTA=8000

# Descobre o endereço deste computador na rede Wi-Fi
IP_LOCAL=$(hostname -I 2>/dev/null | awk '{print $1}')

echo ""
echo "  🎮 DEV CITY - servidor local"
echo "  -----------------------------"
echo "  No computador: http://localhost:$PORTA"
if [ -n "$IP_LOCAL" ]; then
    echo "  No CELULAR (mesma rede Wi-Fi): http://$IP_LOCAL:$PORTA"
    echo ""
    echo "  📱 Dica: no celular a selfie usa a câmera nativa,"
    echo "     e fica MUITO melhor do que no computador!"
fi
echo ""
echo "  Para parar: aperte Ctrl+C nesta janela"
echo ""

# Abre o navegador depois de 1 segundo (enquanto o servidor liga)
(sleep 1 && xdg-open "http://localhost:$PORTA" 2>/dev/null || echo "Abra o navegador em http://localhost:$PORTA") &

# python3 já vem instalado em quase todo Linux/Mac.
# O "-m http.server" transforma esta pasta num site.
python3 -m http.server $PORTA
