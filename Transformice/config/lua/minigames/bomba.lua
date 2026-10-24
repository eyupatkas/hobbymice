-- #bomba — Bomba yağmuru: Gökyüzünden yağan patlamalardan kaç!
-- Kazanma: odada 2+ fare varken son hayatta kalan olmak. Tek başına oynanırsa
-- tur zaman dolduğunda yenilenir (döngü koruması).

local alive = {}
local wins = {}

local function countAlive()
    local n, last = 0, nil
    for name in pairs(alive) do
        local p = tfm.get.room.playerList[name]
        if p and not p.isDead then
            n = n + 1
            last = name
        end
    end
    return n, last
end

local function countPlayers()
    local n = 0
    for _ in pairs(tfm.get.room.playerList) do n = n + 1 end
    return n
end

function eventNewPlayer(name)
    wins[name] = wins[name] or 0
    tfm.exec.setPlayerScore(name, wins[name] or 0)
    tfm.exec.chatMessage("<N>💣 Bomba Yağmuru! Patlamalardan kaç — 2+ oyuncu varken son kalan kazanır. Skorun: "
        .. (wins[name] or 0), name)
end

function eventNewGame()
    alive = {}
    for name in pairs(tfm.get.room.playerList) do
        alive[name] = true
    end
    tfm.exec.disableAutoShaman()
    tfm.exec.disableAutoNewGame()
    tfm.exec.setGameTime(120)
end

function eventPlayerDied(name)
    alive[name] = nil
end

function eventPlayerLeft(name)
    alive[name] = nil
end

function eventLoop(currentTime, remainingTime)
    if remainingTime <= 0 then
        tfm.exec.newGame()
        return
    end

    -- İlk 3 sn güvenli bölge; sonrası %35 ihtimalle 1-3 patlama
    if currentTime > 3000 and math.random() < 0.35 then
        for _ = 1, math.random(1, 3) do
            tfm.exec.explosion(math.random(60, 760), math.random(60, 360),
                (math.random() - 0.5) * 6, (math.random() - 0.5) * 6, 14, false, true)
        end
    end

    local n, last = countAlive()
    local total = countPlayers()

    if n == 1 and total >= 2 then
        wins[last] = (wins[last] or 0) + 1
        tfm.exec.setPlayerScore(last, wins[last])
        tfm.exec.chatMessage("<VP>🏆 " .. last .. " bombalardan sağ çıktı! Kazandın!</VP>")
        tfm.exec.newGame()
    elseif n == 0 then
        tfm.exec.chatMessage("<N>Kimse hayatta kalamadı! Sıradaki tur…</N>")
        tfm.exec.newGame()
    end
end

function eventChatCommand(name, cmd)
    if cmd == "skor" then
        tfm.exec.chatMessage("<J>Skorun: " .. (wins[name] or 0) .. "</J>", name)
    end
end
