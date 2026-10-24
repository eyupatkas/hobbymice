#!/bin/bash
# Transformice 1.889 sunucu baslatma scripti
# Kullanim: ./baslat.sh   (mongod ayakta degilse once onu kaldirir)
cd "$(dirname "$0")"

export JAVA_HOME=/opt/jdk22
export PATH=$JAVA_HOME/bin:$PATH

# MongoDB kontrol
if ! (echo > /dev/tcp/127.0.0.1/27017) 2>/dev/null; then
    echo "[*] MongoDB baslatiliyor..."
    /opt/mongodb/bin/mongod --dbpath /opt/mongodb/data --bind_ip 127.0.0.1 --port 27017 \
        --logpath /opt/mongodb/mongod.log --fork
    sleep 2
fi

if pgrep -f "org.transformice.Application" > /dev/null; then
    echo "[!] Sunucu zaten calisiyor (PID: $(pgrep -f 'org.transformice.Application'))"
    exit 1
fi

echo "[*] Transformice sunucusu baslatiliyor..."
nohup java -Xmx1G -cp "target/classes:target/dependency/*" org.transformice.Application > server.log 2>&1 &
echo "    PID: $!"
sleep 8
if tail -1 server.log | grep -q "started"; then
    echo "[OK] Sunucu acildi. Portlar: 11801 12801 13801 14801"
else
    echo "[!] Kontrol et: tail server.log"
fi
