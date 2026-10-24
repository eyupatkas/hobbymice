-- #vampir — Klasik enfeksiyon modu: Tek vampir, tüm farelere bulaşmaya çalışır!
-- Kazanma: hayatta kalan fare süre bitene dek dayanırsa; vampir herkesi
-- enfekte ederse vampir kazanır. Döngü koruması: vampir seçimi için en az 3 fare.

local survivors = {}   -- isim -> true (hayatta ve insan)
local wins = {}        -- isim -> kazanma sayısı
local vampire = nil

local function chat(msg, name)
    tfm.exec.chatMessage(msg, name)
end

local function countPlayers()
    local n = 0
    for _ in pairs(tfm.get.room.playerList) do n = n + 1 end
    return n
end

function eventNewPlayer(name)
    wins[name] = wins[name] or 0
    tfm.exec.setPlayerScore(name, wins[name] or 0)
    chat("<N>🧛 Vampir modülü! Vampire dokunma — süre bitene dek hayatta kal. Skorun: "
        .. (wins[name] or 0), name)
end

function eventNewGame()
    survivors = {}
    vampire = nil
    tfm.exec.disableAutoShaman()
    tfm.exec.disableAutoNewGame()
    tfm.exec.setGameTime(90)

    local names = {}
    for name in pairs(tfm.get.room.playerList) do
        survivors[name] = true
        table.insert(names, name)
    end

    if #names < 3 then
        chat("<N>Vampir başlaması için en az 3 fare gerekli (şu an " .. #names .. "). Arkadaşlarını çağır!</N>")
        return
    end

    vampire = names[math.random(#names)]
    tfm.exec.setVampirePlayer(vampire, true)
    chat("<ROSE>🧛 " .. vampire .. " vampir oldu! Kaçın!</ROSE>")
end

function eventPlayerDied(name)
    survivors[name] = nil
end

function eventPlayerLeft(name)
    survivors[name] = nil
end

function eventPlayerVampire(name)
    survivors[name] = nil
end

function eventLoop(currentTime, remainingTime)
    if remainingTime <= 0 then
        -- süre bitti: hayatta kalan insanlar kazandı
        local winners = {}
        for name in pairs(survivors) do
            local p = tfm.get.room.playerList[name]
            if p and not p.isDead and not p.isVampire then
                table.insert(winners, name)
            end
        end
        if #winners > 0 then
            for _, w in ipairs(winners) do
                wins[w] = (wins[w] or 0) + 1
                tfm.exec.setPlayerScore(w, wins[w])
            end
            chat("<VP>🏆 Hayatta kalanlar kazandı: " .. table.concat(winners, ", ") .. "!</VP>")
        else
            chat("<N>Süre doldu — hayatta kalan yok.</N>")
        end
        vampire = nil
        tfm.exec.newGame()
        return
    end

    if not vampire and countPlayers() >= 3 then
        eventNewGame()
        return
    end

    if vampire then
        -- herkes enfekte oldu mu? (insan kalmadıysa vampir kazanır)
        local humans = 0
        for name in pairs(survivors) do
            local p = tfm.get.room.playerList[name]
            if p and not p.isDead and not p.isVampire then
                humans = humans + 1
            end
        end
        if humans == 0 then
            chat("<ROSE>🧛 Vampir ordusu kazandı: " .. vampire .. " başlattı!</ROSE>")
            vampire = nil
            tfm.exec.newGame()
        end
    end
end

function eventChatCommand(name, cmd)
    if cmd == "skor" then
        chat("<J>Skorun: " .. (wins[name] or 0) .. "</J>", name)
    end
end
