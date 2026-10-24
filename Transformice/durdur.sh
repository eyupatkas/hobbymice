#!/bin/bash
# Transformice sunucusunu durdurur
PID=$(pgrep -f "org.transformice.Application")
if [ -z "$PID" ]; then
    echo "Sunucu zaten kapali."
else
    kill "$PID" && echo "Sunucu durduruldu (PID: $PID)"
fi
