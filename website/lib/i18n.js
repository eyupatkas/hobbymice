'use strict';
// HobbyMice site coklu-dil sozlugü — TEK KAYNAK.
// KURAL: her anahtar HERY dilde dolu olmak ZORUNDA. Eksik anahtar,
// scripts/check-i18n.js tarafindan build'i DÜSÜRÜR (çeviri zorunludur —
// sessizce baska dile düsme yok). Calisma aninda t() da eksikte HATA firlatir.
// Yeni metin eklerken 4 dili birden ekle; unutursan build asamasi seni uyarir.
// Basliklarda kalin bolum '**' ile isaretlenir (bilesen <b>'ye cevirir).

const LANGS = ['tr', 'en', 'fr', 'es'];

const MESSAGES = {
  // ---- header / footer gezinme ----
  'nav.home': { tr: 'Ana Sayfa', en: 'Home', fr: 'Accueil', es: 'Inicio' },
  'nav.forum': { tr: 'Forum', en: 'Forum', fr: 'Forum', es: 'Foro' },
  'nav.blog': { tr: 'Blog', en: 'Blog', fr: 'Blog', es: 'Blog' },
  'nav.rank': { tr: 'Sıralama', en: 'Ranking', fr: 'Classement', es: 'Clasificación' },
  'nav.play': { tr: 'Oyna', en: 'Play', fr: 'Jouer', es: 'Jugar' },
  'nav.login': { tr: 'Giriş Yap', en: 'Log in', fr: 'Connexion', es: 'Entrar' },
  'nav.logout': { tr: 'Çıkış', en: 'Log out', fr: 'Déconnexion', es: 'Salir' },
  'nav.account': { tr: 'Hesabım', en: 'My account', fr: 'Mon compte', es: 'Mi cuenta' },
  'nav.admin': { tr: 'Yönetim', en: 'Admin', fr: 'Admin', es: 'Admin' },
  'nav.howto': { tr: 'Nasıl Oynanır', en: 'How to Play', fr: 'Comment jouer', es: 'Cómo jugar' },
  'nav.download': { tr: 'İndir', en: 'Download', fr: 'Télécharger', es: 'Descargar' },
  'nav.community': { tr: 'Topluluk', en: 'Community', fr: 'Communauté', es: 'Comunidad' },
  'nav.game': { tr: 'Oyun', en: 'Game', fr: 'Jeu', es: 'Juego' },
  'nav.accountH': { tr: 'Hesap', en: 'Account', fr: 'Compte', es: 'Cuenta' },
  'nav.sitemap': { tr: 'Site Haritası', en: 'Sitemap', fr: 'Plan du site', es: 'Mapa del sitio' },
  'nav.launcher': { tr: 'Launcher', en: 'Launcher', fr: 'Launcher', es: 'Launcher' },
  'nav.updates': { tr: 'Güncellemeler', en: 'Updates', fr: 'Mises à jour', es: 'Actualizaciones' },
  'nav.createAccount': { tr: 'Hesap Oluştur', en: 'Create Account', fr: 'Créer un compte', es: 'Crear cuenta' },

  // ---- footer metinleri ----
  'foot.about': {
    tr: 'HobbyMice; Transformice tabanlı, dünyanın dört bir yanındaki oyunculara hitap eden bağımsız bir hayran sunucusudur. Tarayıcıdan ya da bilgisayarından — indirmeden veya indirerek — tamamen ücretsiz oynanır.',
    en: 'HobbyMice is an independent fan server based on Transformice, welcoming players from all around the world. Play free in your browser or on your computer — with or without a download.',
    fr: 'HobbyMice est un serveur fan indépendant basé sur Transformice, ouvert aux joueurs du monde entier. Jouez gratuitement dans votre navigateur ou sur votre ordinateur — avec ou sans téléchargement.',
    es: 'HobbyMice es un servidor fan independiente basado en Transformice, abierto a jugadores de todo el mundo. Juega gratis en tu navegador o en tu ordenador — con o sin descarga.',
  },
  'foot.fan': {
    tr: 'bağımsız bir hayran sunucusudur',
    en: 'an independent fan server',
    fr: 'un serveur fan indépendant',
    es: 'un servidor fan independiente',
  },
  'foot.rights': {
    tr: "Transformice™ ve ilgili markaların sahibi Atelier 801'dir. Bu site Atelier 801 ile bağlantılı değildir.",
    en: 'Transformice™ and related trademarks are owned by Atelier 801. This site is not affiliated with Atelier 801.',
    fr: 'Transformice™ et les marques associées appartiennent à Atelier 801. Ce site n’est pas affilié à Atelier 801.',
    es: 'Transformice™ y las marcas relacionadas son propiedad de Atelier 801. Este sitio no está afiliado a Atelier 801.',
  },

  // ---- arkadaş sohbeti widget'ı ----
  'chat.title': { tr: 'Arkadaş Sohbeti', en: 'Friends Chat', fr: 'Chat entre amis', es: 'Chat de amigos' },
  'chat.hint': {
    tr: 'Oyundaki arkadaşlarınla birebir sohbet — canlı destek değildir 🐭',
    en: 'Private chat with your in-game friends — not live support 🐭',
    fr: 'Discute en privé avec tes amis du jeu — pas un support en direct 🐭',
    es: 'Charla en privado con tus amigos del juego — no es soporte en vivo 🐭',
  },
  'chat.loginText': {
    tr: 'Bu pencere oyun arkadaşlarınla sohbet içindir; canlı destek değildir. Sohbet etmek için giriş yap.',
    en: 'This panel is for chatting with your in-game friends; it is not live support. Log in to chat.',
    fr: 'Ce panneau sert à discuter avec tes amis du jeu ; ce n’est pas un support en direct. Connecte-toi pour discuter.',
    es: 'Este panel es para conversar con tus amigos del juego; no es soporte en vivo. Inicia sesión para conversar.',
  },
  'chat.loginBtn': { tr: 'Giriş Yap', en: 'Log in', fr: 'Connexion', es: 'Entrar' },
  'chat.noFriends': {
    tr: 'Henüz arkadaşın yok. Oyunda arkadaş eklediğin fareler burada görünür.',
    en: 'No friends yet. Mice you befriend in game will appear here.',
    fr: 'Pas encore d’amis. Les souris que tu ajoutes en jeu apparaîtront ici.',
    es: 'Aún no tienes amigos. Los ratones que agregues en el juego aparecerán aquí.',
  },
  'chat.noFriendsBtn': { tr: 'Oyuna Git', en: 'Play Now', fr: 'Jouer', es: 'Jugar' },
  'chat.empty': { tr: 'Sohbetin başlangıcısın ✨', en: 'Start of the conversation ✨', fr: 'Début de la conversation ✨', es: 'Inicio de la conversación ✨' },
  'chat.typing': { tr: 'yazıyor…', en: 'typing…', fr: 'écrit…', es: 'escribiendo…' },
  'chat.placeholder': { tr: 'Mesaj yaz…', en: 'Type a message…', fr: 'Écris un message…', es: 'Escribe un mensaje…' },

  // ---- HERO ----
  'hero.badge': {
    tr: 'HobbyMice Sunucusu Aktif · v1.889',
    en: 'HobbyMice Server Online · v1.889',
    fr: 'Serveur HobbyMice en ligne · v1.889',
    es: 'Servidor HobbyMice en línea · v1.889',
  },
  'hero.title1': {
    tr: 'Peynirin Peşinde',
    en: 'Chase the Cheese,',
    fr: 'Course au fromage,',
    es: 'Persigue el queso,',
  },
  'hero.title2': {
    tr: 'Efsanevi Bir Macera!',
    en: 'an Epic Adventure Awaits!',
    fr: 'une aventure épique t’attend !',
    es: 'te espera una aventura épica!',
  },
  'hero.desc': {
    tr: 'HobbyMice, sevimli farelerin peynir kapıp deliğe koştuğu, dostlukların ve kızgın şamanların buluştuğu ücretsiz çevrimiçi oyundur. İndirmeye gerek yok — tarayıcında tek tıkla başla!',
    en: 'HobbyMice is a free online game where cute mice grab cheese and dash to the hole, where friendships meet angry shamans. No download needed — start in your browser with one click!',
    fr: 'HobbyMice est un jeu en ligne gratuit où d’adorables souris attrapent le fromage et courent au trou, où l’amitié rencontre les chamans en colère. Aucun téléchargement — lance-toi en un clic depuis ton navigateur !',
    es: 'HobbyMice es un juego en línea gratis donde ratones adorables atrapan queso y corren hacia la cueva, donde la amistad se encuentra con los chamanes furiosos. Sin descargas — ¡empieza en tu navegador con un clic!',
  },
  'hero.btnPlay': {
    tr: '▶ HEMEN OYNA',
    en: '▶ PLAY NOW',
    fr: '▶ JOUER MAINTENANT',
    es: '▶ JUGAR AHORA',
  },
  'hero.btnDownload': {
    tr: '⬇ Bilgisayara İndir (Launcher)',
    en: '⬇ Download for PC (Launcher)',
    fr: '⬇ Télécharger pour PC (Launcher)',
    es: '⬇ Descargar para PC (Launcher)',
  },
  'hero.chipFree': {
    tr: '✓ Tamamen Ücretsiz',
    en: '✓ Completely Free',
    fr: '✓ Totalement gratuit',
    es: '✓ Completamente gratis',
  },
  'hero.chipNoInstall': {
    tr: '✓ Kurulum Gerektirmez (Ruffle)',
    en: '✓ No Installation Needed (Ruffle)',
    fr: '✓ Aucune installation (Ruffle)',
    es: '✓ Sin instalación (Ruffle)',
  },
  'hero.chipVersion': {
    tr: '✓ Sürüm 1.889 Güncel',
    en: '✓ Up to Date v1.889',
    fr: '✓ Version 1.889 à jour',
    es: '✓ Versión 1.889 actualizada',
  },
  'hero.chipCommunity': {
    tr: '✓ %100 Küresel Topluluk',
    en: '✓ 100% Global Community',
    fr: '✓ Communauté 100% mondiale',
    es: '✓ Comunidad 100% global',
  },

  // ---- NEDEN HOBBYMICE (özellik kartları) ----
  'feat.title': {
    tr: 'Neden **HobbyMice?**',
    en: 'Why **HobbyMice?**',
    fr: 'Pourquoi **HobbyMice ?**',
    es: '¿Por qué **HobbyMice?**',
  },
  'feat.sub': {
    tr: 'Hızlı, güvenli ve nostaljik bir Transformice deneyimi için her detayı özenle hazırladık.',
    en: 'We carefully crafted every detail for a fast, safe and nostalgic Transformice experience.',
    fr: 'Nous avons soigné chaque détail pour une expérience Transformice rapide, sûre et nostalgique.',
    es: 'Cuidamos cada detalle para una experiencia de Transformice rápida, segura y nostálgica.',
  },
  'feat.f1t': { tr: 'Tarayıcıda Anında Oyna', en: 'Instant Play in Browser', fr: 'Jeu instantané dans le navigateur', es: 'Juega al instante en el navegador' },
  'feat.f1d': {
    tr: 'Flash yükleme derdine son! Modern tarayıcında Ruffle WebAssembly motoru ile Chrome, Edge, Firefox ve Safari üzerinden tek tıkla doğrudan oyuna gir.',
    en: 'No more Flash hassle! Powered by the Ruffle WebAssembly engine, jump straight into the game with one click from Chrome, Edge, Firefox and Safari.',
    fr: 'Fini les soucis de Flash ! Grâce au moteur Ruffle WebAssembly, entre dans le jeu en un clic depuis Chrome, Edge, Firefox et Safari.',
    es: '¡Adiós problemas con Flash! Con el motor Ruffle WebAssembly, entra al juego con un clic desde Chrome, Edge, Firefox y Safari.',
  },
  'feat.f2t': { tr: 'PVP & Özel Oyun Modları', en: 'PVP & Special Game Modes', fr: 'PVP & modes de jeu spéciaux', es: 'PVP y modos de juego especiales' },
  'feat.f2d': {
    tr: 'Survivor, Racing, Bootcamp, Defilante ve Lua mini oyunları. Şaman becerilerini geliştir, rakiplerini alt et ve sıralamada zirveye tırman.',
    en: 'Survivor, Racing, Bootcamp, Defilante and Lua mini-games. Level up your shaman skills, outplay rivals and climb to the top of the rankings.',
    fr: 'Survivor, Racing, Bootcamp, Defilante et mini-jeux Lua. Améliore tes compétences de chamane, bats tes rivaux et grimace au sommet du classement.',
    es: 'Survivor, Racing, Bootcamp, Defilante y minijuegos Lua. Mejora tus habilidades de chamán, vence a tus rivales y sube a la cima del ranking.',
  },
  'feat.f3t': { tr: 'Sonsuz Harita & Editör', en: 'Endless Maps & Editor', fr: 'Cartes infinies & éditeur', es: 'Mapas infinitos y editor' },
  'feat.f3d': {
    tr: 'Topluluk tarafından tasarlanan binlerce harita ve gelişmiş harita editörü. Kendi özgün parkurlarını oluştur, yayınla ve diğer farelerle paylaş.',
    en: 'Thousands of community-designed maps and a powerful map editor. Create your own unique courses, publish them and share with other mice.',
    fr: 'Des milliers de cartes conçues par la communauté et un éditeur puissant. Crée tes propres parcours, publie-les et partage-les avec les autres souris.',
    es: 'Miles de mapas diseñados por la comunidad y un potente editor. Crea tus propios recorridos, publícalos y compártelos con otros ratones.',
  },
  'feat.f4t': { tr: 'Canlı Küresel Topluluk', en: 'Vibrant Global Community', fr: 'Communauté mondiale vivante', es: 'Comunidad global vibrante' },
  'feat.f4d': {
    tr: 'Dünyanın dört bir yanından peynir sever fareler burada! Kabile kur, sohbet et, klan savaşlarına katıl veya forumda taktiklerini ve rehberlerini paylaş.',
    en: 'Cheese-loving mice from all around the world are here! Build a tribe, chat, join clan wars or share your tactics and guides on the forum.',
    fr: 'Les souris amoureuses du fromage du monde entier sont là ! Crée une tribu, discute, participe aux guerres de clans ou partage tes tactiques sur le forum.',
    es: '¡Los ratones amantes del queso de todo el mundo están aquí! Crea una tribu, chatea, únete a guerras de clanes o comparte tus tácticas en el foro.',
  },

  // ---- OYUN MODLARI ----
  'modes.title': {
    tr: 'Her Tarza Uygun **Oyun Modları**',
    en: 'Game Modes for **Every Taste**',
    fr: 'Des modes de jeu pour **tous les goûts**',
    es: 'Modos de juego para **todos los gustos**',
  },
  'modes.sub': {
    tr: 'Tek bir modla sınırlı kalma! İster arkadaşlarınla yarış, ister hayatta kal, ister şaman yeteneklerini konuştur.',
    en: 'Don’t settle for one mode! Race with friends, survive, or show off your shaman skills.',
    fr: 'Ne te limite pas à un seul mode ! Course avec tes amis, survie, ou montre tes talents de chamane.',
    es: '¡No te limites a un solo modo! Compite con amigos, sobrevive o lucir tus habilidades de chamán.',
  },
  'modes.m1tag': { tr: 'Klasik Mod', en: 'Classic Mode', fr: 'Mode classique', es: 'Modo clásico' },
  'modes.m1t': { tr: 'Vanilla Odaları', en: 'Vanilla Rooms', fr: 'Salons Vanilla', es: 'Salas Vanilla' },
  'modes.m1d': {
    tr: 'Orijinal Transformice haritaları. Şamanın kurduğu tahta ve köprülerle peynire ulaş, deliğe dön ve kabilene puan kazandır.',
    en: 'Original Transformice maps. Reach the cheese using the shaman’s planks and bridges, return to the hole and score for your tribe.',
    fr: 'Les cartes Transformice originales. Atteins le fromage grâce aux planches et ponts du chamane, retourne au trou et marque pour ta tribu.',
    es: 'Mapas originales de Transformice. Llega al queso con las tablas y puentes del chamán, vuelve a la cueva y suma puntos para tu tribu.',
  },
  'modes.m2tag': { tr: 'PVP & Refleks', en: 'PVP & Reflexes', fr: 'PVP & réflexes', es: 'PVP y reflejos' },
  'modes.m2t': { tr: 'Survivor', en: 'Survivor', fr: 'Survivor', es: 'Survivor' },
  'modes.m2d': {
    tr: 'Kızgın şaman gülleler fırlatıyor! Zeminlerden ustaca kaç, şamanın saldırılarını savuştur ve ayakta kalan son fare sen ol.',
    en: 'The angry shaman hurls cannonballs! Dodge the floors cleverly, deflect the shaman’s attacks and be the last mouse standing.',
    fr: 'Le chamane furieux lance des boulets ! Esquive habilement, pare les attaques du chamane et sois la dernière souris debout.',
    es: '¡El chamán furioso lanza balas de cañón! Esquiva con astucia, repela los ataques del chamán y sé el último ratón en pie.',
  },
  'modes.m3tag': { tr: 'Hız Parkuru', en: 'Speed Run', fr: 'Course de vitesse', es: 'Carrera de velocidad' },
  'modes.m3t': { tr: 'Racing', en: 'Racing', fr: 'Racing', es: 'Racing' },
  'modes.m3d': {
    tr: 'Şaman yok, yardım yok, yalnızca saf hız! Engelleri rekor sürede aşarak fare deliğine ilk giren ol ve First unvanını kap.',
    en: 'No shaman, no help, just pure speed! Clear obstacles in record time, be the first into the mouse hole and claim the First title.',
    fr: 'Pas de chamane, pas d’aide, juste de la vitesse ! Franchis les obstacles en temps record, entre le premier dans le trou et décroche le titre First.',
    es: 'Sin chamán, sin ayuda, ¡solo velocidad pura! Superar los obstáculos en tiempo récord, entra primero a la cueva y gana el título First.',
  },
  'modes.m4tag': { tr: 'Ustalık Testi', en: 'Mastery Test', fr: 'Test de maîtrise', es: 'Prueba de maestría' },
  'modes.m4t': { tr: 'Bootcamp', en: 'Bootcamp', fr: 'Bootcamp', es: 'Bootcamp' },
  'modes.m4d': {
    tr: 'Wall-jump, corner-jump ve zorlu tırmanma teknikleri gerektiren ekstrem parkurlar. Sabır ve mutlak ustalık gerektirir.',
    en: 'Extreme courses requiring wall-jumps, corner-jumps and advanced climbing techniques. Demands patience and absolute mastery.',
    fr: 'Des parcours extrêmes exigeant wall-jump, corner-jump et techniques d’escalade avancées. Patience et maîtrise absolue requises.',
    es: 'Recorridos extremos que requieren wall-jump, corner-jump y técnicas avanzadas de escalada. Exige paciencia y dominio absoluto.',
  },

  // ---- NASIL OYNANIR ----
  'how.title': {
    tr: 'Nasıl **Oynanır?**',
    en: 'How to **Play?**',
    fr: 'Comment **jouer ?**',
    es: '¿Cómo **se juega?**',
  },
  'how.sub': {
    tr: 'Transformice oynamak hiç bu kadar kolay olmamıştı. Sadece üç basit adımda peynirin peşine düşebilirsin.',
    en: 'Playing Transformice has never been easier. In just three simple steps you’re off chasing cheese.',
    fr: 'Jouer à Transformice n’a jamais été aussi simple. En trois étapes, tu cours déjà après le fromage.',
    es: 'Jugar a Transformice nunca fue tan fácil. En solo tres pasos estarás persiguiendo el queso.',
  },
  'how.s1t': { tr: 'Tarayıcıda Başla veya İndir', en: 'Start in Browser or Download', fr: 'Commence dans le navigateur ou télécharge', es: 'Empieza en el navegador o descarga' },
  'how.s1d': {
    tr: 'Hemen OYNA butonuna basarak doğrudan tarayıcında açabilir ya da daha yüksek FPS için Windows Launcher sürümünü indirebilirsin.',
    en: 'Hit the PLAY button to open it right in your browser, or download the Windows Launcher for even higher FPS.',
    fr: 'Appuie sur JOUER pour l’ouvrir dans ton navigateur, ou télécharge le Launcher Windows pour encore plus de FPS.',
    es: 'Pulsa JUGAR para abrirlo en tu navegador, o descarga el Launcher de Windows para más FPS.',
  },
  'how.s2t': { tr: 'Ücretsiz Profilini Oluştur', en: 'Create Your Free Profile', fr: 'Crée ton profil gratuit', es: 'Crea tu perfil gratis' },
  'how.s2d': {
    tr: 'Oyun açıldığında kullanıcı adını belirle ve Create Account ile hesabını anında kaydet. E-posta zorunluluğu yok, 30 saniyede hazırsın!',
    en: 'Once the game opens, pick a nickname and register instantly with Create Account. No email required — you’re ready in 30 seconds!',
    fr: 'Une fois le jeu ouvert, choisis un pseudo et inscris-toi instantanément avec Create Account. Sans e-mail — prêt en 30 secondes !',
    es: 'Cuando se abra el juego, elige un apodo y regístrate al instante con Create Account. Sin correo obligatorio — ¡listo en 30 segundos!',
  },
  'how.s3t': { tr: 'Peyniri Kap & Şaman Ol!', en: 'Grab Cheese & Become Shaman!', fr: 'Attrape le fromage & deviens chamane !', es: '¡Atrapa el queso y sé chamán!' },
  'how.s3d': {
    tr: 'Ok tuşlarıyla engelleri aş, dev peyniri sırtla ve deliğe dön. Sıran geldiğinde şaman olup arkadaşlarına köprü kur, onları kurtar!',
    en: 'Jump over obstacles with the arrow keys, carry the giant cheese back to the hole. When it’s your turn, become the shaman and save your friends!',
    fr: 'Saute par-dessus les obstacles avec les flèches, porte le fromage géant jusqu’au trou. À ton tour, deviens chamane et sauve tes amis !',
    es: 'Salta los obstáculos con las flechas, carga el queso gigante y vuelve a la cueva. Cuando te toque, ¡sé chamán y salva a tus amigos!',
  },
  'how.c1': { tr: 'veya Yön Tuşları ile Hareket & Zıplama', en: 'or Arrow Keys to Move & Jump', fr: 'ou flèches pour bouger & sauter', es: 'o flechas para moverte y saltar' },
  'how.c2': { tr: 'Eğilme & Fare Deliğine Giriş', en: 'Duck & Enter the Mouse Hole', fr: 'S’accroupir & entrer dans le trou', es: 'Agacharse y entrar en la cueva' },
  'how.c3': { tr: 'Görünmez Nesne / Şaman Seçimi', en: 'Invisible Object / Shaman Selection', fr: 'Objet invisible / sélection chamane', es: 'Objeto invisible / selección de chamán' },
  'how.c4': { tr: 'Şaman Eşya Kısayolları', en: 'Shaman Item Shortcuts', fr: 'Raccourcis d’objets de chamane', es: 'Atajos de objetos de chamán' },

  // ---- LAUNCHER ----
  'launcher.title': {
    tr: 'Masaüstü Deneyimi: **HobbyMice Launcher**',
    en: 'Desktop Experience: **HobbyMice Launcher**',
    fr: 'Expérience bureau : **HobbyMice Launcher**',
    es: 'Experiencia de escritorio: **HobbyMice Launcher**',
  },
  'launcher.desc': {
    tr: 'Daha akıcı bir oyun, kusursuz klavye tepki süresi ve özel ses efektleri için özel olarak geliştirilen resmi Windows Launcher ile oyna. İndir, ZIP\'ten çıkar ve doğrudan çalıştır!',
    en: 'Play with our official Windows Launcher, built for smoother gameplay, flawless keyboard response and custom sound effects. Download, extract from ZIP and run — no install!',
    fr: 'Joue avec notre Launcher Windows officiel, conçu pour un jeu plus fluide, une réponse clavier parfaite et des effets sonores dédiés. Télécharge, extrais du ZIP et lance — sans installation !',
    es: 'Juega con nuestro Launcher oficial de Windows, creado para un juego más fluido, respuesta de teclado perfecta y efectos de sonido propios. Descarga, extrae del ZIP y ejecuta — ¡sin instalación!',
  },
  'launcher.perk1': { tr: '⚡ Yüksek FPS & Akıcı Performans', en: '⚡ High FPS & Smooth Performance', fr: '⚡ FPS élevés & fluidité', es: '⚡ FPS altos y fluidez' },
  'launcher.perk2': { tr: '🔄 Otomatik Sürüm Güncellemesi', en: '🔄 Automatic Version Updates', fr: '🔄 Mises à jour automatiques', es: '🔄 Actualizaciones automáticas' },
  'launcher.perk3': { tr: '🎶 Özel Giriş Müzikleri & Sesler', en: '🎶 Custom Login Music & Sounds', fr: '🎶 Musiques & sons de connexion exclusifs', es: '🎶 Música y sonidos de inicio exclusivos' },
  'launcher.perk4': { tr: '🛡️ Kurulum Gerektirmez (Taşınabilir ZIP)', en: '🛡️ No Installation Needed (Portable ZIP)', fr: '🛡️ Aucune installation (ZIP portable)', es: '🛡️ Sin instalación (ZIP portátil)' },
  'launcher.btn': {
    tr: '⬇ Launcher İndir (Windows)',
    en: '⬇ Download Launcher (Windows)',
    fr: '⬇ Télécharger le Launcher (Windows)',
    es: '⬇ Descargar Launcher (Windows)',
  },
  'launcher.version': {
    tr: 'Sürüm 1.889 · Windows 7 / 8 / 10 / 11 ·',
    en: 'Version 1.889 · Windows 7 / 8 / 10 / 11 ·',
    fr: 'Version 1.889 · Windows 7 / 8 / 10 / 11 ·',
    es: 'Versión 1.889 · Windows 7 / 8 / 10 / 11 ·',
  },
  'launcher.details': {
    tr: 'Ayrıntılar ve kurulum →',
    en: 'Details and setup →',
    fr: 'Détails et installation →',
    es: 'Detalles e instalación →',
  },
  'launcher.figcap': {
    tr: 'Resmi HobbyMice Launcher — ana ekran',
    en: 'Official HobbyMice Launcher — main screen',
    fr: 'Launcher officiel HobbyMice — écran principal',
    es: 'Launcher oficial de HobbyMice — pantalla principal',
  },

  // ---- BLOG ÖNİZLEME + PLAYBAND ----
  'posts.title': {
    tr: 'Blog ve Duyurulardan **Son Haberler**',
    en: 'Latest from the **Blog & Announcements**',
    fr: 'Dernières nouvelles du **blog & annonces**',
    es: 'Lo último del **blog y anuncios**',
  },
  'posts.sub': {
    tr: 'Oyun güncellemeleri, şaman taktikleri, topluluk etkinlikleri ve kabile rehberleri.',
    en: 'Game updates, shaman tactics, community events and tribe guides.',
    fr: 'Mises à jour du jeu, tactiques de chamane, événements communautaires et guides de tribu.',
    es: 'Actualizaciones del juego, tácticas de chamán, eventos de la comunidad y guías de tribu.',
  },
  'posts.all': {
    tr: 'Tüm Yazıları Oku →',
    en: 'Read All Posts →',
    fr: 'Lire tous les articles →',
    es: 'Leer todas las entradas →',
  },
  'posts.forum': {
    tr: 'Topluluk Forumuna Git →',
    en: 'Go to Community Forum →',
    fr: 'Aller au forum de la communauté →',
    es: 'Ir al foro de la comunidad →',
  },
  'posts.empty': {
    tr: 'Henüz blog yazısı bulunmuyor. Yeni rehberler çok yakında burada olacak! 🧀',
    en: 'No blog posts yet. New guides are coming very soon! 🧀',
    fr: 'Pas encore d’articles. De nouveaux guides arrivent très bientôt ! 🧀',
    es: 'Aún no hay entradas. ¡Nuevas guías muy pronto! 🧀',
  },
  'band.title': {
    tr: 'Peynir Macerası Seni Bekliyor! 🧀',
    en: 'Your Cheese Adventure Awaits! 🧀',
    fr: 'Ton aventure fromagère t’attend ! 🧀',
    es: '¡Tu aventura del queso te espera! 🧀',
  },
  'band.desc': {
    tr: 'Kayıt olmak sadece 30 saniye sürer. Binlerce fare arasına katıl, şamanını geliştir ve peynirleri deliğe ilk taşıyan sen ol!',
    en: 'Signing up takes just 30 seconds. Join thousands of mice, level up your shaman and be the first to carry the cheese into the hole!',
    fr: 'L’inscription prend 30 secondes. Rejoins des milliers de souris, améliore ton chamane et sois le premier à rapporter le fromage !',
    es: 'Registrarse toma solo 30 segundos. Únete a miles de ratones, mejora tu chamán y ¡sé el primero en llevar el queso a la cueva!',
  },
  'band.btn': {
    tr: '▶ ÜCRETSİZ HEMEN OYNA',
    en: '▶ PLAY FREE NOW',
    fr: '▶ JOUER GRATUITEMENT',
    es: '▶ JUGAR GRATIS AHORA',
  },

  // ---- ANA SAYFA İSTATİSTİKLERİ ----
  'stats.online': { tr: 'Şu An Oyunda', en: 'Playing Now', fr: 'En jeu maintenant', es: 'Jugando ahora' },
  'stats.players': { tr: 'Kayıtlı Fare', en: 'Registered Mice', fr: 'Souris inscrites', es: 'Ratones registrados' },
  'stats.cheese': { tr: 'Toplanan Peynir', en: 'Cheese Collected', fr: 'Fromages collectés', es: 'Quesos recogidos' },
  'stats.maps': { tr: 'Özgün Harita', en: 'Unique Maps', fr: 'Cartes uniques', es: 'Mapas únicos' },

  // ---- EKONOMİ ŞERİDİ (çarkıfelek + günlük görevler + haftalık yarışma) ----
  'eco.title': { tr: '🎈 HobbyMice Ekonomisi', en: '🎈 HobbyMice Economy', fr: '🎈 Économie HobbyMice', es: '🎈 Economía de HobbyMice' },
  'eco.desc': { tr: 'Her gün oyna, ödül topla: çarkıfelek, günlük görevler ve haftalık peynir yarışması — hepsi ücretsiz!', en: 'Play daily, collect rewards: fortune wheel, daily quests and the weekly cheese contest — all free!', fr: 'Jouez chaque jour, récoltez des récompenses : roue de la fortune, quêtes quotidiennes et le concours hebdomadaire de fromages — tout est gratuit !', es: 'Juega a diario, recoge premios: ruleta de la fortuna, misiones diarias y el concurso semanal de quesos — ¡todo gratis!' },
  'eco.wheel': { tr: '🎡 /cark — Günde bir ücretsiz çark: peynir, çilek ve sürpriz hediyeler', en: '🎡 /cark — One free spin a day: cheese, strawberries and surprise gifts', fr: '🎡 /cark — Une rotation gratuite par jour : fromages, fraises et cadeaux surprises', es: '🎡 /cark — Un giro gratis al día: quesos, fresas y regalos sorpresa' },
  'eco.quests': { tr: '📋 /gorev — 3 günlük görev, her gün yenilenir; biten görev peynir, dolan sepet çilek verir', en: '📋 /gorev — 3 daily quests, refreshed every day; each finished quest gives cheese, a full basket gives strawberries', fr: '📋 /gorev — 3 quêtes quotidiennes, renouvelées chaque jour ; chaque quête terminée donne du fromage, un panier plein donne des fraises', es: '📋 /gorev — 3 misiones diarias, se renuevan cada día; cada misión completa da queso, la cesta llena da fresas' },
  'eco.weekly': { tr: '🏁 /haftalik — Haftanın en iyi 3 faresi çilek + Şampiyon Fare unvanı kazanır', en: '🏁 /haftalik — The top 3 mice of the week win strawberries + the Weekly Champion title', fr: '🏁 /haftalik — Les 3 meilleures souris de la semaine gagnent des fraises + le titre Champion de la Semaine', es: '🏁 /haftalik — Los 3 mejores ratones de la semana ganan fresas + el título Campeón Semanal' },

  // ---- oyuncu kartı sayfası (/oyuncu) ----
  'player.notFound.title': { tr: 'Oyuncu bulunamadı', en: 'Player not found', fr: 'Joueur introuvable', es: 'Jugador no encontrado' },
  'player.notFound.named': { tr: '«{n}» adında kayıtlı bir fare yok.', en: 'No mouse registered as «{n}».', fr: 'Aucune souris enregistrée sous «{n}».', es: 'No hay un ratón registrado como «{n}».' },
  'player.notFound.unspecified': { tr: 'Oyuncu belirtilmedi.', en: 'No player specified.', fr: 'Aucun joueur spécifié.', es: 'No se especificó jugador.' },
  'player.playNow': { tr: '🧀 Hemen Oyna', en: '🧀 Play Now', fr: '🧀 Jouer maintenant', es: '🧀 Juega ahora' },
  'player.joined': { tr: 'Katılım:', en: 'Joined:', fr: 'Inscription :', es: 'Registro:' },
  'player.playTime': { tr: 'Oyun süresi: {n} dk', en: 'Play time: {n} min', fr: 'Temps de jeu : {n} min', es: 'Tiempo de juego: {n} min' },
  'player.cheese': { tr: 'Peynir', en: 'Cheese', fr: 'Fromage', es: 'Queso' },
  'player.first': { tr: 'First', en: 'First', fr: 'First', es: 'First' },
  'player.bootcamp': { tr: 'Bootcamp', en: 'Bootcamp', fr: 'Bootcamp', es: 'Bootcamp' },
  'player.racing': { tr: 'Racing', en: 'Racing', fr: 'Racing', es: 'Racing' },
  'player.saves': { tr: 'Kurtarma', en: 'Saves', fr: 'Sauvetages', es: 'Salvamentos' },
  'player.shamanLevel': { tr: 'Şaman Seviyesi', en: 'Shaman Level', fr: 'Niveau de chamane', es: 'Nivel de chamán' },
  'player.forumActivity': { tr: 'Forum Etkinliği', en: 'Forum Activity', fr: 'Activité sur le forum', es: 'Actividad del foro' },
  'player.topics': { tr: 'Konuları', en: 'Topics', fr: 'Sujets', es: 'Temas' },
  'player.replies': { tr: 'Cevapları', en: 'Replies', fr: 'Réponses', es: 'Respuestas' },
  'player.economy': { tr: '🎈 Oyun Ekonomisi', en: '🎈 Game Economy', fr: '🎈 Économie du jeu', es: '🎈 Economía del juego' },
  'player.mission.1': { tr: '🧀 Peynir topla', en: '🧀 Collect cheese', fr: '🧀 Ramasse du fromage', es: '🧀 Recoge queso' },
  'player.mission.2': { tr: '🙏 Şaman olarak fare kurtar', en: '🙏 Save mice as shaman', fr: '🙏 Sauve des souris en tant que chamane', es: '🙏 Salva ratones como chamán' },
  'player.mission.3': { tr: '🕳️ Peyniri deliğe ulaştır', en: '🕳️ Bring the cheese to the hole', fr: '🕳️ Apporte le fromage au trou', es: '🕳️ Lleva el queso a la ratonera' },
  'player.mission.4': { tr: '🏁 Racing turunu bitir', en: '🏁 Finish a racing round', fr: '🏁 Termine un tour de racing', es: '🏁 Termina una ronda de racing' },
  'player.mission.5': { tr: '🎈 Defilante turunu bitir', en: '🏁 Finish a defilante round', fr: '🏁 Termine un tour de defilante', es: '🏁 Termina una ronda de defilante' },
  'player.mission.6': { tr: '🛒 Markette eşya satın al', en: '🛒 Buy an item in the shop', fr: '🛒 Achète un objet à la boutique', es: '🛒 Compra un artículo en la tienda' },
  'player.mission.7': { tr: '🌟 Şaman olarak tur başlat', en: '🌟 Start a round as shaman', fr: '🌟 Commence un tour en tant que chamane', es: '🌟 Comienza una ronda como chamán' },
  'player.mission.unknown': { tr: '❓ Görev #{n}', en: '❓ Mission #{n}', fr: '❓ Mission #{n}', es: '❓ Misión #{n}' },
  'player.strawberryBasket': { tr: '🍓 Çilek Sepeti', en: '🍓 Strawberry Basket', fr: '🍓 Panier de fraises', es: '🍓 Cesta de fresas' },
  'player.missionUnit': { tr: 'görev', en: 'missions', fr: 'missions', es: 'misiones' },
  'player.wheel.label': { tr: '🎡 Çarkıfelek:', en: '🎡 Wheel:', fr: '🎡 Roue :', es: '🎡 Ruleta:' },
  'player.wheel.done': { tr: 'bugün çevrildi ✓ (yarın yenisi)', en: 'spun today ✓ (come back tomorrow)', fr: "déjà tournée aujourd'hui ✓ (reviens demain)", es: 'girada hoy ✓ (vuelve mañana)' },
  'player.wheel.notToday': { tr: 'bugün çevrilmemi — /cark ile ücretsiz döndür!', en: 'not spun today — spin for free with /cark!', fr: "pas tournée aujourd'hui — tourne gratuitement avec /cark !", es: 'sin girar hoy — ¡gira gratis con /cark!' },
  'player.weekly.label': { tr: '🏁 Haftalık yarışma:', en: '🏁 Weekly contest:', fr: '🏁 Concours hebdo :', es: '🏁 Concurso semanal:' },
  'player.weekly.none': { tr: 'bu hafta henüz peynir yok', en: 'no cheese yet this week', fr: 'pas de fromage cette semaine', es: 'sin queso esta semana' },
  'player.week': { tr: 'hafta', en: 'week', fr: 'semaine', es: 'semana' },
  'player.latestTopics': { tr: 'Son Konuları', en: 'Latest Topics', fr: 'Derniers sujets', es: 'Últimos temas' },
  'player.joinCta': { tr: '🧀 Bu fareyle oynamak için hemen katıl!', en: '🧀 Join now and play with this mouse!', fr: '🧀 Rejoins la partie et joue avec cette souris !', es: '🧀 ¡Únete y juega con este ratón!' },

  // ---- hesabım sayfası (/profil) ----
  'prof.intro': { tr: 'Hesabın hem oyunda hem sitede bu. İstatistikler oyun veritabanından canlı gelir.', en: 'This is your account in the game and on the site. Stats come live from the game database.', fr: "Voici ton compte dans le jeu et sur le site. Les stats viennent en direct de la base du jeu.", es: 'Esta es tu cuenta en el juego y en el sitio. Las estadísticas llegan en vivo de la base del juego.' },
  'prof.hardSaves': { tr: 'Zor Kurtarma', en: 'Hard Saves', fr: 'Sauvetages difficiles', es: 'Salvamentos difíciles' },
  'prof.forumReplies': { tr: 'Forum cevabı', en: 'Forum replies', fr: 'Réponses du forum', es: 'Respuestas del foro' },
  'prof.achievements': { tr: 'Başarımlar', en: 'Achievements', fr: 'Succès', es: 'Logros' },
  'prof.a1.name': { tr: 'Peynir Sever', en: 'Cheese Lover', fr: 'Amateur de fromage', es: 'Amante del queso' },
  'prof.a1.desc': { tr: '100 peynir topla', en: 'Collect 100 cheese', fr: 'Ramasse 100 fromages', es: 'Recoge 100 quesos' },
  'prof.a2.name': { tr: 'Peynir Kralı', en: 'Cheese King', fr: 'Roi du fromage', es: 'Rey del queso' },
  'prof.a2.desc': { tr: '1.000 peynir topla', en: 'Collect 1,000 cheese', fr: 'Ramasse 1 000 fromages', es: 'Recoge 1.000 quesos' },
  'prof.a3.name': { tr: 'İlk First', en: 'First First', fr: 'Premier First', es: 'Primer First' },
  'prof.a3.desc': { tr: 'İlk firstünü al', en: 'Get your first first', fr: 'Obtiens ton premier first', es: 'Consigue tu primer first' },
  'prof.a4.name': { tr: 'First Avcısı', en: 'First Hunter', fr: 'Chasseur de firsts', es: 'Cazador de firsts' },
  'prof.a4.desc': { tr: '10 first topla', en: 'Collect 10 firsts', fr: 'Ramasse 10 firsts', es: 'Consigue 10 firsts' },
  'prof.a5.name': { tr: 'Kaptan Şaman', en: 'Captain Shaman', fr: 'Chamane capitaine', es: 'Chamán capitán' },
  'prof.a5.desc': { tr: 'Toplam 100 kurtarma', en: '100 total saves', fr: '100 sauvetages au total', es: '100 salvamentos en total' },
  'prof.a6.name': { tr: 'Efsane Şaman', en: 'Legendary Shaman', fr: 'Chamane légendaire', es: 'Chamán legendario' },
  'prof.a6.desc': { tr: 'Toplam 500 kurtarma', en: '500 total saves', fr: '500 sauvetages au total', es: '500 salvamentos en total' },
  'prof.a7.name': { tr: 'Serinin Gücü', en: 'Streak Power', fr: 'Puissance de série', es: 'Poder de racha' },
  'prof.a7.desc': { tr: '3 gün üst üste giriş (günlük ödül serisi)', en: 'Log in 3 days in a row (daily reward streak)', fr: 'Connecte-toi 3 jours de suite (série de récompenses)', es: 'Entra 3 días seguidos (racha de recompensas)' },
  'prof.a8.name': { tr: 'Sadık Fare', en: 'Loyal Mouse', fr: 'Souris fidèle', es: 'Ratón leal' },
  'prof.a8.desc': { tr: '7 gün üst üste giriş', en: 'Log in 7 days in a row', fr: 'Connecte-toi 7 jours de suite', es: 'Entra 7 días seguidos' },
  'prof.a9.name': { tr: 'Erken Dönem', en: 'Early Days', fr: 'Premiers jours', es: 'Primeros días' },
  'prof.a9.desc': { tr: '30+ gündür oyundasın', en: 'You have played for 30+ days', fr: 'Tu joues depuis plus de 30 jours', es: 'Llevas más de 30 días jugando' },
  'prof.myTopics': { tr: 'Konularım', en: 'My Topics', fr: 'Mes sujets', es: 'Mis temas' },
  'prof.noTopics': { tr: 'Henüz konu açmamışsın.', en: 'You have not started a topic yet.', fr: "Tu n'as pas encore créé de sujet.", es: 'Aún no has creado ningún tema.' },
  'prof.openFirst': { tr: 'İlk konunu aç!', en: 'Start your first topic!', fr: 'Crée ton premier sujet !', es: '¡Crea tu primer tema!' },
  'prof.registered': { tr: 'Kayıt:', en: 'Registered:', fr: 'Inscription :', es: 'Registro:' },
  'prof.rankWhere': { tr: '🏆 Sıralamada neredeyim?', en: '🏆 Where do I rank?', fr: '🏆 Quel est mon classement ?', es: '🏆 ¿En qué puesto estoy?' },
};

/**
 * Translates the given key strictly. Eksik anahtar/çeviri HATA firlatir —
 * sessiz fallback yok (çeviri zorunludur).
 * @param {string} lang One of LANGS.
 * @param {string} key Message key.
 * @returns {string} The translated text.
 */
function t(lang, key) {
  const entry = MESSAGES[key];
  if (!entry) throw new Error('i18n: bilinmeyen anahtar: ' + key);
  const value = entry[lang];
  if (value == null || value === '') throw new Error('i18n: eksik çeviri: ' + key + ' (' + lang + ')');
  return value;
}

/**
 * Validates every key exists in every language. Build oncesi calisir;
 * tek bir eksik bile build'i dusurur.
 * @returns {{keys: number, langs: string[]}} Summary.
 */
function validateTranslations() {
  const missing = [];
  for (const [key, entry] of Object.entries(MESSAGES)) {
    for (const lang of LANGS) {
      if (entry[lang] == null || entry[lang] === '') missing.push(key + ' (' + lang + ')');
    }
  }
  if (missing.length) {
    throw new Error('Çeviri eksik — build durduruldu. Eksikler: ' + missing.join(', '));
  }
  return { keys: Object.keys(MESSAGES).length, langs: LANGS.length };
}

module.exports = { LANGS, MESSAGES, t, validateTranslations };
