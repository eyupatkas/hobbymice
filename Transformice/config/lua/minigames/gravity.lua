-- #gravity — Yerçekimi kaosu: Yerçekimi sürekli değişir, hayatta kalmaya çalış!
-- Kazanma: odada 2+ fare varken son hayatta kalan olmak. Tek başına oynanırsa
-- tur zaman dolduğunda yenilenir (döngü koruması).

local alive = {}
local wins = {}
local nextFlip = 4000

local GRAVITIES = {
    { 0, 1 },   -- normal
    { 0, -1 },  -- tavan
    { -1, 0 },  -- sol duvar
    { 1, 0 },   -- sağ duvar
    { 0, 2 },   -- ağır
    { 0, 0.2 }, -- hafif
}

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
    tfm.exec.chatMessage("<N>🌀 Yerçekimi Kaosu! Yerçekimi sürekli değişir — 2+ oyuncu varken son kalan kazanır. Skorun: "
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
    nextFlip = 4000
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

    if currentTime >= nextFlip then
        local g = GRAVITIES[math.random(#GRAVITIES)]
        tfm.exec.setWorldGravity(g[1], g[2])
        nextFlip = currentTime + math.random(4000, 8000)
    end

    local n, last = countAlive()
    local total = countPlayers()

    if n == 1 and total >= 2 then
        wins[last] = (wins[last] or 0) + 1
        tfm.exec.setPlayerScore(last, wins[last])
        tfm.exec.chatMessage("<VP>🏆 " .. last .. " yerçekimi kaosunda hayatta kaldı!</VP>")
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
