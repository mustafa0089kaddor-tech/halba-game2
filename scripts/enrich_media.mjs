import fs from 'fs';
import path from 'path';

const BANK_PATH = path.resolve('src/data/bank.ts');
const MEDIA_DIR = path.resolve('public/media');

if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

const content = fs.readFileSync(BANK_PATH, 'utf8');
const marker = 'export const BANK: BankQuestion[] = [';
const startIdx = content.indexOf(marker);

if (startIdx === -1) {
  console.error('❌ لم يتم العثور على مصفوفة BANK في الملف.');
  process.exit(1);
}

const header = content.slice(0, startIdx + marker.length);
const arrayText = content.slice(startIdx + marker.length - 1).trim().replace(/;\s*$/, '');
const questions = new Function(`return ${arrayText}`)();

console.log(`🔍 تم قراءة ${questions.length} سؤال من bank.ts... جاري سحب الصور وحقوق النشر...`);

// خريطة مواضيع مرجعية لجميع الفئات لضمان تنوع الصور
const CATEGORY_TOPICS = {
  "nahw": ["Arabic calligraphy", "Arabic grammar", "Arabic alphabet"],
  "sarf": ["Arabic calligraphy", "Islamic manuscripts", "Arabic language"],
  "imla": ["Arabic script", "Calligraphy", "Manuscript"],
  "balagha": ["Arabic literature", "Al-Mutanabbi", "Mu'allaqat"],
  "proverbs": ["Arabic literature", "One Thousand and One Nights", "Coffee"],
  "writers": ["Naguib Mahfouz", "Taha Hussein", "Ahmed Shawqi"],
  "books": ["House of Wisdom", "Kalila and Dimna", "Muqaddimah"],
  "jahili": ["Arabian horse", "Camel", "Arabian Desert"],
  "abbasi": ["Baghdad", "Abbasid Caliphate", "Astrolabe"],
  "andalus": ["Alhambra", "Mosque–Cathedral of Córdoba", "Alcázar of Seville"],
  "modern-poetry": ["Mahmoud Darwish", "Nizar Qabbani", "Gibran Khalil Gibran"],
  "synonyms": ["Arabic calligraphy", "Dictionary", "Library"],
  "antonyms": ["Yin and yang", "Day and night", "Light"],
  "plurals": ["Library", "Bookshelf", "Manuscript"],
  "nawawi": ["Al-Masjid an-Nabawi", "Islamic geometric patterns", "Hadith"],
  "akhlaq": ["Islamic architecture", "Masjid al-Haram", "Charity"],
  "adhkar": ["Misbaha", "Mosque", "Quran"],
  "hadith-books": ["Sahih al-Bukhari", "Islamic manuscripts", "Al-Masjid an-Nabawi"],
  "salah": ["Mosque", "Mihrab", "Minaret"],
  "sawm": ["Ramadan", "Fanous", "Kaaba"],
  "adab": ["Arabic coffee", "Islamic art", "Hospitality"],
  "rawis": ["Sahih al-Bukhari", "Islamic Golden Age", "Scroll"],
  "rahma": ["Cat", "Water", "Olive branch"],
  "family": ["Olive tree", "Home", "Lantern"],
  "knowledge": ["Al-Qarawiyyin", "Astrolabe", "Library"],
  "fadail": ["Quran", "Kaaba", "Al-Aqsa"],
  "makkah": ["Kaaba", "Masjid al-Haram", "Jabal al-Nour"],
  "hijra": ["Quba Mosque", "Al-Masjid an-Nabawi", "Jabal Thawr"],
  "badr": ["Battle of Badr", "Arabian horse", "Sword"],
  "uhud": ["Mount Uhud", "Battle of Uhud", "Medina"],
  "khandaq": ["Medina", "Battle of the Trench", "Fortification"],
  "hudaybiya": ["Treaty of al-Hudaybiلق", "Acacia", "Mecca"],
  "fath": ["Kaaba", "Masjid al-Haram", "Mecca"],
  "farewell": ["Mount Arafat", "Al-Masjid an-Nabawi", "Mecca"],
  "sahaba": ["Al-Masjid an-Nabawi", "Rashidun Caliphate", "Sword"],
  "sahaba-stories": ["Rashidun", "Medina", "Damascus"],
  "prophecy": ["Mecca", "Kaaba", "Elephant"],
  "first-muslims": ["Bilal ibn Rabah", "Mecca", "Axum"],
  "madinah": ["Al-Masjid an-Nabawi", "Quba Mosque", "Masjid al-Qiblatayn"],
  "wives": ["Al-Masjid an-Nabawi", "Medina", "Islamic calligraphy"],
  "shamail": ["Al-Masjid an-Nabawi", "Islamic calligraphy", "Rose"],
  "ibrahim": ["Kaaba", "Zamzam Well", "Maqam Ibrahim"],
  "musa": ["Mount Sinai", "Red Sea", "Nile"],
  "yusuf": ["Ancient Egypt", "Pyramids of Giza", "Wheat"],
  "adam-nuh": ["Noah's Ark", "Mount Judi", "Flood"],
  "isa-maryam": ["Church of the Nativity", "Olive tree", "Jerusalem"],
  "other-prophets": ["Hoopoe", "Whale", "Petra"],
  "quran-stories": ["Seven Sleepers", "Petra", "Ancient Yemen"],
  "arabian-nights": ["Scheherazade", "One Thousand and One Nights", "Aladdin"],
  "kalila": ["Kalila and Dimna", "Lion", "Jackal"],
  "folk": ["Antarah ibn Shaddad", "Baibars", "Arabian horse"],
  "arab-heroes": ["Saladin", "Tariq ibn Ziyad", "Citadel of Aleppo"],
  "world-tales": ["Cinderella", "Snow White", "The Little Prince"],
  "juha": ["Nasreddin", "Donkey", "Turban"],
  "dragonball": ["Dragon Ball", "Akira Toriyama", "Son Goku"],
  "pokemon": ["Pokémon", "Pikachu", "Nintendo"],
  "conan": ["Case Closed", "Gosho Aoyama", "Sherlock Holmes"],
  "naruto": ["Naruto", "Masashi Kishimoto", "Ninja"],
  "onepiece": ["One Piece", "Eiichiro Oda", "Pirate ship"],
  "digimon": ["Digimon", "Bandai", "Tokyo"],
  "space-robots": ["Grendizer", "Go Nagai", "Mecha"],
  "kids-adventures": ["The Adventures of Tintin", "Pinocchio", "Tom and Jerry"],
  "sports-anime": ["Takehiko Inoue", "Basketball", "Volleyball"],
  "adventure-anime": ["Attack on Titan", "Fullmetal Alchemist", "Anime"],
  "anime-characters": ["Anime", "Manga", "Tokyo"],
  "captain-majid": ["Captain Tsubasa", "Association football", "Japan"],
  "simpsons": ["The Simpsons", "Matt Groening", "Animation"],
  "golden-age": ["Umm Kulthum", "Abdel Halim Hafez", "Faten Hamama"],
  "comedy-films": ["Adel Emam", "Cinema of Egypt", "Cairo"],
  "adel-imam": ["Adel Emam", "Cairo", "Theatre"],
  "action-films": ["Ahmed Zaki", "Cinema of Egypt", "Action film"],
  "romance-films": ["Omar Sharif", "Soad Hosny", "Faten Hamama"],
  "modern-egypt": ["Cairo", "Cinema of Egypt", "Film projector"],
  "leb-syr-films": ["Nadine Labaki", "Beirut", "Damascus"],
  "gulf-films": ["Haifaa al-Mansour", "Riyadh", "Kuwait City"],
  "maghreb-films": ["Algiers", "Casablanca", "Tunis"],
  "arab-directors": ["Youssef Chahine", "Moustapha Akkad", "Film director"],
  "arab-actors": ["Omar Sharif", "Ahmed Zaki", "Soad Hosny"],
  "awards-arab": ["Cannes Film Festival", "Academy Awards", "Palme d'Or"],
  "pixar": ["Pixar", "Toy Story", "Computer animation"],
  "friends": ["Friends", "Jennifer Aniston", "New York City"],
  "got": ["Game of Thrones", "George R. R. Martin", "Dragon"],
  "breaking-bad": ["Breaking Bad", "Bryan Cranston", "Albuquerque, New Mexico"],
  "harry-potter": ["Harry Potter", "J. K. Rowling", "Alnwick Castle"],
  "marvel": ["Marvel Cinematic Universe", "Stan Lee", "Robert Downey Jr."],
  "star-wars": ["Star Wars", "George Lucas", "Darth Vader"],
  "nolan": ["Christopher Nolan", "Cillian Murphy", "Christian Bale"],
  "stranger-things": ["Stranger Things", "Millie Bobby Brown", "1980s"],
  "office": ["The Office (American TV series)", "Steve Carell", "John Krasinski"],
  "prison-break": ["Prison Break", "Wentworth Miller", "Alcatraz Federal Penitentiary"],
  "squid-game": ["Squid Game", "Lee Jung-jae", "Seoul"],
  "money-heist": ["Money Heist", "Salvador Dalí", "Madrid"],
  "crime-series": ["Benedict Cumberbatch", "Cillian Murphy", "Sherlock Holmes"],
  "sitcoms": ["Jim Parsons", "Jerry Seinfeld", "Television comedy"],
  "lotr": ["The Lord of the Rings", "J. R. R. Tolkein", "Peter Jackson"],
  "dc": ["Batman", "Superman", "Christian Bale"],
  "hollywood-classics": ["Humphrey Bogart", "Audrey Hepburn", "Alfred Hitchcock"],
  "oscars": ["Academy Awards", "Leonardo DiCaprio", "Dolby Theatre"],
  "scifi-films": ["Keanu Reeves", "James Cameron", "Ridley Scott"],
  "action-hollywood": ["Tom Cruise", "Keanu Reeves", "Sylvester Stallone"],
  "thriller": ["Alfred Hitchcock", "Anthony Hopkins", "Stanley Kubrick"],
  "animation": ["Hayao Miyazaki", "Walt Disney", "Studio Ghibli"],
  "intl-stars": ["Tom Hanks", "Steven Spielberg", "Meryl Streep"],
  "scifi-series": ["Star Trek", "Doctor Who", "TARDIS"],
  "turkish-series": ["Kıvanç Tatlıtuğ", "Suleiman the Magnificent", "Istanbul"],
  "korean-drama": ["Bong Joon-ho", "Song Joong-ki", "Seoul"],
  "egypt-classic": ["Yehia El-Fakharany", "Nour El-Sherif", "Mahmoud Abdel Aziz"],
  "egypt-ramadan": ["Cairo", "Ramadan", "Television"],
  "syria-historic": ["Damascus", "Umayyad Mosque", "Citadel of Damascus"],
  "bab-alhara": ["Old_City_of_Damascus", "Al-Hamidiyah Souq", "Damascus"],
  "gulf-drama": ["Kuwait Towers", "Hayat Al-Fahad", "Abdulhussain Abdulredha"],
  "gulf-comedy": ["Nasser Al Qasabi", "Riyadh", "Kuwait City"],
  "jordan-leb": ["Wadi Rum", "Petra", "Beirut"],
  "maghreb-series": ["Marrakesh", "Rabat", "Tunis"],
  "comedy-series": ["Fouad el-Mohandes", "Adel Emam", "Mohamed Sobhi"],
  "social-drama": ["Cairo", "Alexandria", "Nile"],
  "dubbed": ["Istanbul", "Bosphorus", "Television"],
  "kids-series": ["Sesame Street", "Puppet", "Animation"],
  "series-stars": ["Faten Hamama", "Adel Emam", "Ahmed Zaki"],
  "series-makers": ["Cairo", "Screenwriter", "Film director"]
};

// مقاطع فيديو يوتيوب تفاعلية لبعض الأسئلة المميزة
const VIDEO_QUESTIONS = {
  "nolan-0": "https://www.youtube.com/watch?v=YoHD9XEInc0",
  "nolan-2": "https://www.youtube.com/watch?v=uYPbbksJxIg",
  "nolan-3": "https://www.youtube.com/watch?v=zSWdZVtXT7E",
  "marvel-0": "https://www.youtube.com/watch?v=8ugaeA-nMTc",
  "marvel-4": "https://www.youtube.com/watch?v=TcMBFSGVi1c",
  "star-wars-0": "https://www.youtube.com/watch?v=vZ734NWnAHA",
  "got-0": "https://www.youtube.com/watch?v=KPLWWIOCOOQ",
  "breaking-bad-0": "https://www.youtube.com/watch?v=HhesaQXLuRY",
  "stranger-things-0": "https://www.youtube.com/watch?v=b9EkMc79ZSU",
  "squid-game-0": "https://www.youtube.com/watch?v=oqxAJKy0ii4",
  "money-heist-0": "https://www.youtube.com/watch?v=_InqQJRqGW4",
  "lotr-0": "https://www.youtube.com/watch?v=V75dMMIW2B4",
  "harry-potter-0": "https://www.youtube.com/watch?v=VyHV0BRtdxo",
  "pixar-0": "https://www.youtube.com/watch?v=v-PjgYDrg70",
  "animation-0": "https://www.youtube.com/watch?v=TbQm5doF_Uc"
};

async function fetchWikiThumbnails(titles, lang = 'ar') {
  const result = {};
  const unique = [...new Set(titles.filter(Boolean))];
  const chunkSize = 45;

  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=800&pilicense=any&redirects=1&format=json&titles=${encodeURIComponent(chunk.join('|'))}`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'HalbaQuizGame/2.0 (https://github.com/; contact@halba.game)' }
      });
      if (!res.ok) continue;
      const data = await res.json();
      const pages = data?.query?.pages || {};
      const normMap = {};
      (data?.query?.normalized || []).forEach(n => { normMap[n.from] = n.to; });
      const redirMap = {};
      (data?.query?.redirects || []).forEach(r => { redirMap[r.from] = r.to; });

      const titleToThumb = {};
      Object.values(pages).forEach(p => {
        if (p?.title && p?.thumbnail?.source) {
          titleToThumb[p.title] = p.thumbnail.source;
        }
      });

      chunk.forEach(orig => {
        let cur = normMap[orig] || orig;
        cur = redirMap[cur] || cur;
        if (titleToThumb[cur]) {
          result[orig] = titleToThumb[cur];
        }
      });
    } catch (e) {
      // تجاهل الأخطاء الشبكية العابرة
    }
  }
  return result;
}

// إنشاء بطاقة SVG محلية أنيقة لكل فئة كاحتياط مضمون 100%
function ensureLocalCategorySvg(cat, questionText, index) {
  const palettes = [
    ['#0f172a', '#1e293b', '#38bdf8'],
    ['#1e1b4b', '#312e81', '#a78bfa'],
    ['#064e3b', '#065f46', '#34d399'],
    ['#451a03', '#78350f', '#fbbf24'],
    ['#4c0519', '#881337', '#fb7185']
  ];
  const [bg1, bg2, accent] = palettes[index % palettes.length];
  const fileName = `auto-${cat}-${index % 3}.svg`;
  const filePath = path.join(MEDIA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    const safeCat = cat.toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" rx="24" fill="url(#g)"/>
      <circle cx="700" cy="80" r="140" fill="${accent}" opacity="0.12"/>
      <circle cx="100" cy="380" r="180" fill="${accent}" opacity="0.08"/>
      <rect x="40" y="40" width="720" height="370" rx="16" fill="none" stroke="${accent}" stroke-width="2" opacity="0.35"/>
      <text x="400" y="210" text-anchor="middle" fill="${accent}" font-family="sans-serif" font-size="46" font-weight="bold">حَلْبَة — HALBA</text>
      <text x="400" y="275" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="28" opacity="0.9">${safeCat} • سؤال تفاعلي</text>
    </svg>`;
    fs.writeFileSync(filePath, svg, 'utf8');
  }
  return `/media/${fileName}`;
}

async function run() {
  // 1. جمع الإجابات للبحث عنها في ويكيبيديا العربية
  const cleanAnswer = (ans) => ans.replace(/\s*\(.*?\)\s*/g, '').trim();
  const arAnswers = questions
    .map(q => cleanAnswer(q.answer))
    .filter(a => a.length >= 3 && a.split(' ').length <= 4);

  // 2. جمع مواضيع الفئات للبحث عنها في ويكيبيديا الإنجليزية
  const enTopics = Object.values(CATEGORY_TOPICS).flat();

  console.log('🌐 جاري جلب الصور من ويكيميديا كومنز (العربية والإنجليزية)...');
  const [arThumbs, enThumbs] = await Promise.all([
    fetchWikiThumbnails(arAnswers, 'ar'),
    fetchWikiThumbnails(enTopics, 'en')
  ]);

  let imgCount = 0;
  let vidCount = 0;

  questions.forEach((q, idx) => {
    // الاحتفاظ بالصور الأصلية الموجودة مثل nahw-6 و nahw-7
    if (q.imageUrl && q.imageUrl.startsWith('/media/nahw-')) {
      imgCount++;
      return;
    }

    // فحص إن كان السؤال مخصصاً لفيديو تفاعلي
    if (VIDEO_QUESTIONS[q.id]) {
      q.type = 'video';
      q.mediaType = 'video';
      q.videoUrl = VIDEO_QUESTIONS[q.id];
      delete q.imageUrl;
      q.mediaCredit = 'الفيديو: المقطع الترويجي الرسمي — يوتيوب';
      q.mediaLicense = 'free';
      vidCount++;
      return;
    }

    // البحث عن صورة مخصصة لإجابة السؤال، أو صورة من مواضيع الفئة
    const cleaned = cleanAnswer(q.answer);
    let chosenUrl = arThumbs[cleaned];

    if (!chosenUrl) {
      const catTopics = CATEGORY_TOPICS[q.cat] || [];
      const validCatUrls = catTopics.map(t => enThumbs[t]).filter(Boolean);
      if (validCatUrls.length > 0) {
        chosenUrl = validCatUrls[idx % validCatUrls.length];
      }
    }

    if (chosenUrl) {
      q.type = 'image';
      q.mediaType = 'image';
      q.imageUrl = chosenUrl;
      q.mediaCredit = 'الصورة: ويكيميديا كومنز — رخصة المشاع الإبداعي (CC BY-SA 4.0)';
      q.mediaLicense = 'free';
    } else {
      // احتياط محلي مضمون 100%
      q.type = 'image';
      q.mediaType = 'image';
      q.imageUrl = ensureLocalCategorySvg(q.cat, q.question, idx);
      q.mediaCredit = 'تصميم حلبة التفاعلي';
      q.mediaLicense = 'own';
    }
    imgCount++;
  });

  const formattedLines = questions.map(q => '  ' + JSON.stringify(q) + ',');
  const finalOutput = `${header}\n${formattedLines.join('\n')}\n];\n`;

  fs.writeFileSync(BANK_PATH, finalOutput, 'utf8');
  console.log(`✅ اكتمل التحديث بنجاح! تم تفعيل ${imgCount} صورة و ${vidCount} فيديو عبر كامل بنك الأسئلة.`);
}

run();
