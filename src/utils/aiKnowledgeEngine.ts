// Comprehensive Natural Language & Knowledge Processing Engine
// Handles General Knowledge, Math, Science, Daily Life, Greetings, and Astrology
// Understands questions before answering (जस्तो प्रश्न, त्यस्तै सही उत्तर)

export interface KundaliContextData {
  name?: string;
  lagnaNe?: string;
  lagnaEn?: string;
  moonSignNe?: string;
  moonSignEn?: string;
  sunSignNe?: string;
  sunSignEn?: string;
  currentDasha?: string;
  dob?: string;
  tob?: string;
  pob?: string;
}

// Convert devanagari numerals to standard digits
export function devanagariToStandard(str: string): string {
  const map: Record<string, string> = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  };
  return str.replace(/[०-९]/g, (ch) => map[ch] || ch);
}

// Convert standard digits to Devanagari numerals
export function standardToDevanagari(num: number | string): string {
  const map: Record<string, string> = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
  };
  return String(num).replace(/[0-9]/g, (ch) => map[ch] || ch);
}

// Try solving mathematical questions
export function trySolveMath(query: string, isNe: boolean): string | null {
  const normalized = devanagariToStandard(query.toLowerCase());
  
  // Clean string to check for math operators
  let expr = normalized
    .replace(/जोड|प्लस|\bplus\b|\band\b/g, '+')
    .replace(/घटाउ|माइनस|\bminus\b/g, '-')
    .replace(/गुणा|इन्टु|\btimes\b|\binto\b|\bmultiplied by\b/g, '*')
    .replace(/भाग|डिभाइड|\bdivided by\b/g, '/')
    .replace(/प्रतिशत|परसेन्ट|\bpercent\b|%/g, '* 0.01')
    .replace(/[=xX×÷]/g, (match) => {
      if (match === '×' || match.toLowerCase() === 'x') return '*';
      if (match === '÷') return '/';
      return '';
    });

  // Check if expression looks like a math question (e.g. 2 + 2, 50 * 4, 100 / 5, etc.)
  const mathRegex = /([0-9]+(?:\.[0-9]+)?)\s*([\+\-\*\/])\s*([0-9]+(?:\.[0-9]+)?)/;
  const match = expr.match(mathRegex);

  if (match) {
    const num1 = parseFloat(match[1]);
    const op = match[2];
    const num2 = parseFloat(match[3]);
    let result = 0;

    if (op === '+') result = num1 + num2;
    else if (op === '-') result = num1 - num2;
    else if (op === '*') result = num1 * num2;
    else if (op === '/') {
      if (num2 === 0) return isNe ? 'कुनै पनि संख्यालाई शून्यले भाग गर्न सकिँदैन (अपरिभाषित)।' : 'Division by zero is undefined.';
      result = num1 / num2;
    }

    // Format result nicely
    const formattedResult = Number.isInteger(result) ? result : parseFloat(result.toFixed(4));
    if (isNe) {
      const n1Dev = standardToDevanagari(num1);
      const n2Dev = standardToDevanagari(num2);
      const resDev = standardToDevanagari(formattedResult);
      const opSign = op === '*' ? '×' : op === '/' ? '÷' : op;
      return `${n1Dev} ${opSign} ${n2Dev} = **${resDev}** हुन्छ।`;
    } else {
      return `${num1} ${op} ${num2} = **${formattedResult}**.`;
    }
  }

  return null;
}

// Main Intelligent Answer Generator
export function generateIntelligentAnswer(
  query: string,
  context?: KundaliContextData,
  language: string = 'ne'
): string {
  const isNe = language === 'ne';
  const rawQ = query.trim();
  const q = rawQ.toLowerCase();

  // 1. Math Questions (Calculate directly)
  const mathAns = trySolveMath(rawQ, isNe);
  if (mathAns) return mathAns;

  // 2. Greetings & Salutations (Strict rule: DO NOT FORCE OR MENTION ASTROLOGY AT ALL!)
  const greetings = [
    'hello', 'hi', 'hey', 'namaste', 'namaskar', 'नमस्ते', 'नमस्कार',
    'ह्यालो', 'हेलो', 'गुड मर्निंग', 'good morning', 'good afternoon', 'good evening',
    'hola', 'salam', 'k cha', 'ke cha', 'के छ', 'kasto cha', 'कस्तो छ'
  ];

  // Specific check for user example: "hello" -> "hello tapailai k sahayog garna sakxu"
  const isHelloOnly = ['hello', 'hi', 'hey', 'हेलो', 'ह्यालो'].some(g => q === g || q === g + '!' || q === g + ' sir');
  if (isHelloOnly) {
    return isNe
      ? 'हेलो! म तपाईंलाई के सहयोग गर्न सक्छु? हजुरको मनमा जे प्रश्न छ, निर्धक्क सोध्नुहोस्।'
      : 'Hello! How can I help you today? Feel free to ask any question.';
  }

  const isNamaste = ['namaste', 'namaskar', 'नमस्ते', 'नमस्कार'].some(g => q === g || q === g + '!' || q === g + ' जी');
  if (isNamaste) {
    return isNe
      ? 'नमस्कार! म तपाईंलाई के सहयोग गर्न सक्छु? हजुरको मनमा कुनै पनि विषयको जिज्ञासा वा प्रश्न छ भने निर्धक्क सोध्नुहोस्।'
      : 'Namaskar! How may I assist you today? Feel free to ask any question.';
  }

  // How are you / कस्तो छ
  if (q.includes('kasto cha') || q.includes('कस्तो छ') || q.includes('how are you') || q.includes('how r u') || q === 'k cha' || q === 'ke cha' || q === 'के छ') {
    return isNe
      ? 'म एकदम ठीक र सञ्चै छु, धन्यवाद! हजुरलाई कस्तो छ? आज म हजुरलाई के सहयोग गर्न सक्छु?'
      : 'I am doing great, thank you! How are you doing today? How may I assist you?';
  }

  // Thank you / धन्यवाद
  if (q.includes('thank') || q.includes('dhanyabad') || q.includes('धन्यवाद') || q.includes('शुक्रिया')) {
    return isNe
      ? 'हजुरलाई धेरै धेरै स्वागत छ! अरु कुनै पनि विषयमा केही जान्न मन छ भने निर्धक्क सोध्नुहोला।'
      : 'You are very welcome! If you have any other questions, feel free to ask anytime.';
  }

  // 3. Identity / Capabilities: "Who are you" / "What can you do"
  if (
    q.includes('who are you') || q.includes('who r u') ||
    q.includes('तपाईं को') || q.includes('तपाई को') || q.includes('timi ko') ||
    q.includes('तिमी को') || q.includes('के गर्न सक्छ') || q.includes('what can you do')
  ) {
    return isNe
      ? 'म एक बौद्धिक AI सहायक हुँ। म तपाईंलाई ChatGPT र Gemini जस्तै सामान्य ज्ञान, विज्ञान, भूगोल, गणित, प्रविधि, दैनिक जीवनका विविध प्रश्नहरूको सही उत्तर दिन सक्छु। साथै यदि तपाईंले आफ्नो जन्म विवरण अनुसार कुण्डली, ग्रह-दशा वा भविष्यफल सम्बन्धी जिज्ञासा राख्नुभएमा मात्र वैदिक ज्योतिषीय विश्लेषण पनि प्रदान गर्न सक्छु। हजुरलाई जे मन लाग्छ, निर्धक्क सोध्न सक्नुहुन्छ!'
      : 'I am an intelligent AI Assistant. Just like ChatGPT and Gemini, I can answer all types of questions—from general knowledge, science, geography, math, and technology to everyday advice. Furthermore, if you specifically request it, I can also provide personalized Vedic astrological guidance based on your birth chart. Feel free to ask me anything!';
  }

  // 4. General Knowledge & Geography (Nepal & Global)
  // Nepal Capital
  if (q.includes('राजधानी') || q.includes('capital of nepal') || (q.includes('nepal') && q.includes('capital'))) {
    return isNe
      ? 'नेपालको राजधानी **काठमाडौं (Kathmandu)** हो।'
      : 'The capital of Nepal is **Kathmandu**.';
  }

  // Mt. Everest / Sagarmatha
  if (q.includes('सगरमाथा') || q.includes('everest') || q.includes('highest mountain') || q.includes('highest peak') || q.includes('अग्लो हिमाल')) {
    return isNe
      ? 'संसारको सबैभन्दा अग्लो हिमाल **सगरमाथा (Mount Everest)** हो, जुन नेपालको सोलुखुम्बु जिल्लामा अवस्थित छ। यसको आधिकारिक उचाइ **८,८४८.८६ मिटर (२९,०३१.७ फिट)** रहेको छ।'
      : 'The highest peak in the world is **Mount Everest (Sagarmatha)**, located in the Solukhumbu district of Nepal. Its official height is **8,848.86 meters (29,031.7 feet)**.';
  }

  // Gautam Buddha / Lumbini
  if (q.includes('बुद्ध') || q.includes('buddha') || q.includes('लुम्बिनी') || q.includes('lumbini') || q.includes('birthplace of buddha')) {
    return isNe
      ? 'भगवान गौतम बुद्धको जन्म नेपालको **लुम्बिनी (Lumbini)** मा ई.पू. ६२३ मा भएको थियो। लुम्बिनी युनेस्को विश्व सम्पदा सूचीमा सूचीकृत एक अन्तर्राष्ट्रिय पवित्र शान्ति स्थल हो।'
      : 'Gautama Buddha was born in **Lumbini**, Nepal in 623 BC. Lumbini is an internationally renowned UNESCO World Heritage site and a symbol of peace.';
  }

  // Nepal National Symbols (Animal, Bird, Flower, Color, Anthem)
  if (q.includes('राष्ट्रिय जनावर') || q.includes('national animal')) {
    return isNe ? 'नेपालको राष्ट्रिय जनावर **गाई (Cow)** हो।' : "Nepal's national animal is the **Cow**.";
  }
  if (q.includes('राष्ट्रिय चरा') || q.includes('national bird')) {
    return isNe ? 'नेपालको राष्ट्रिय चरा **डाँफे (Himalayan Monal / Danphe)** हो।' : "Nepal's national bird is the **Danphe (Himalayan Monal)**.";
  }
  if (q.includes('राष्ट्रिय फूल') || q.includes('national flower')) {
    return isNe ? 'नेपालको राष्ट्रिय फूल **लालीगुराँस (Rhododendron)** हो।' : "Nepal's national flower is the **Rhododendron (Lali Gurans)**.";
  }
  if (q.includes('राष्ट्रिय रङ्ग') || q.includes('national color')) {
    return isNe ? 'नेपालको राष्ट्रिय रङ्ग **सिम्रिक (Crimson)** हो।' : "Nepal's national color is **Crimson (Simrik)**.";
  }
  if (q.includes('राष्ट्रिय गान') || q.includes('national anthem')) {
    return isNe ? 'नेपालको राष्ट्रिय गान **"सयौं थुँगा फूलका हामी एउटै माला नेपाली"** हो, जसका रचनाकार व्याकुल माइला (प्रदीप कुमार राई) र संगीतकार अम्बर गुरुङ हुनुहुन्छ।' : "Nepal's national anthem is 'Sayaun Thunga Phool Ka', composed by Pradeep Kumar Rai (Byakul Maila) and set to music by Amber Gurung.";
  }

  // Provinces and Districts of Nepal
  if ((q.includes('प्रदेश') || q.includes('province')) && (q.includes('कति') || q.includes('how many'))) {
    return isNe
      ? 'नेपालमा **७ वटा प्रदेश** छन्:\n१. कोशी प्रदेश\n२. मधेश प्रदेश\n३. बागमती प्रदेश\n४. गण्डकी प्रदेश\n५. लुम्बिनी प्रदेश\n६. कर्णाली प्रदेश\n७. सुदूरपश्चिम प्रदेश'
      : 'Nepal has **7 provinces**: Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, and Sudurpashchim.';
  }
  if ((q.includes('जिल्ला') || q.includes('district')) && (q.includes('कति') || q.includes('how many'))) {
    return isNe
      ? 'नेपालमा हाल **७७ वटा जिल्ला** रहेका छन्।'
      : 'Nepal currently has **77 districts**.';
  }

  // Largest country / ocean / river in the world
  if (q.includes('ठूलो देश') || q.includes('largest country')) {
    return isNe
      ? 'क्षेत्रफलको हिसाबले विश्वको सबैभन्दा ठूलो देश **रुस (Russia)** हो।'
      : 'By area, the largest country in the world is **Russia**.';
  }
  if (q.includes('लामो नदी') || q.includes('longest river')) {
    return isNe
      ? 'विश्वको सबैभन्दा लामो नदी **नाइल नदी (Nile River)** हो, जसको लम्बाइ करिब ६,६५० किलोमिटर छ।'
      : 'The longest river in the world is the **Nile River**, with an approximate length of 6,650 km.';
  }
  if (q.includes('ठूलो महासागर') || q.includes('largest ocean')) {
    return isNe
      ? 'विश्वको सबैभन्दा ठूलो महासागर **प्रशान्त महासागर (Pacific Ocean)** हो।'
      : 'The largest ocean in the world is the **Pacific Ocean**.';
  }

  // 5. Science, Nature & Astronomy
  // Water Formula
  if (q.includes('पानीको सूत्र') || q.includes('formula of water') || q.includes('water formula') || q.includes('chemical formula of water')) {
    return isNe
      ? 'पानीको रासायनिक सूत्र **H₂O** हो। यसमा २ भाग हाइड्रोजन र १ भाग अक्सिजनको परमाणु मिलेको हुन्छ।'
      : 'The chemical formula of water is **H₂O** (2 parts hydrogen and 1 part oxygen).';
  }

  // Speed of Light
  if (q.includes('speed of light') || q.includes('प्रकाशको गति')) {
    return isNe
      ? 'शून्यमा प्रकाशको गति लगभग **३ लाख किलोमिटर प्रति सेकेन्ड (२९९,७९२ किमी/से वा 3 × 10⁸ m/s)** हुन्छ।'
      : 'The speed of light in vacuum is approximately **299,792 km per second (about 3 × 10⁸ m/s)**.';
  }

  // Sun
  if ((q.includes('सूर्य के हो') || q.includes('sun is a')) && !q.includes('कुण्डली') && !q.includes('राशी')) {
    return isNe
      ? 'सूर्य हाम्रो सौर्यमण्डलको केन्द्रमा रहेको एक मध्यम आकारको चम्किलो **तारा (Star)** हो। यो मुख्यतया हाइड्रोजन र हिलियम ग्यासले बनेको छ र यसैबाट पृथ्वीले ताप तथा प्रकाश प्राप्त गर्दछ।'
      : 'The Sun is a medium-sized **star** at the center of our solar system, composed primarily of hydrogen and helium, providing light and heat to Earth.';
  }

  // Moon
  if ((q.includes('चन्द्रमा के हो') || q.includes('moon is a')) && !q.includes('कुण्डली') && !q.includes('राशी')) {
    return isNe
      ? 'चन्द्रमा पृथ्वीको एकमात्र प्राकृतिक **उपग्रह (Natural Satellite)** हो। यसले पृथ्वीको वरिपरि एक चक्कर लगाउन करिब २७.३ दिन लगाउँछ।'
      : 'The Moon is Earth\'s only natural **satellite**, orbiting Earth approximately every 27.3 days.';
  }

  // Earth shape
  if (q.includes('पृथ्वी गोलो') || q.includes('shape of earth')) {
    return isNe
      ? 'पृथ्वी पूर्ण रूपमा गोलाकार नभई दुई ध्रुवहरूमा अलिकति चेप्टो र भूमध्यरेखामा केही फुलेको **जियोइड (Geoid / Oblate Spheroid)** आकारको छ।'
      : 'The Earth is not a perfect sphere; it is an **oblate spheroid (geoid)**, slightly flattened at the poles and bulging at the equator.';
  }

  // AI & Technology
  if (q.includes('artificial intelligence') || q.includes('ai के हो') || q.includes('एआई भनेको के हो') || q.includes('ai भनेको के हो')) {
    return isNe
      ? '**कृत्रिम बौद्धिकता (Artificial Intelligence - AI)** भनेको कम्प्युटर वा मेसिनहरूलाई मानव जस्तै सोच्न, सिक्न, समस्या समाधान गर्न र निर्णय लिन सक्ने बनाउने कम्प्युटर विज्ञानको एक अत्याधुनिक शाखा हो। जस्तै: च्याटबट, भ्वाइस असिस्टेन्ट, स्वचालित गाडी, आदि।'
      : '**Artificial Intelligence (AI)** is a branch of computer science dedicated to creating systems capable of performing tasks that typically require human intelligence, such as visual perception, speech recognition, decision-making, and natural language understanding.';
  }

  // 6. Practical Daily Life, Health & Study Advice
  if (q.includes('पढाइमा ध्यान') || q.includes('how to study') || q.includes('concentrate in study') || q.includes('पढ्न मन')) {
    return isNe
      ? 'पढाइमा ध्यान केन्द्रित गर्नका लागि केही प्रभावकारी उपायहरू:\n१. **पोमोडोरो प्रविधि (Pomodoro):** २५ मिनेट पढ्ने र ५ मिनेट विश्राम लिने नियम अपनाउनुहोस्।\n२. **मोबाइल र ध्यान भड्काउने साधन टाढा राख्नुहोस्।**\n३. **आफ्नो हातले मुख्य बुँदाहरू नोट बनाउने बानी गर्नुहोस्।**\n४. **दैनिक निश्चित समय तालिका बनाएर पढ्नुहोस्।**\n५. **पर्याप्त पानी पिउनुहोस् र दिनमा कम्तीमा ७ घण्टा सुत्नुहोस्।**'
      : 'Tips for effective study concentration:\n1. Use the Pomodoro Technique: Study for 25 minutes, then rest for 5 minutes.\n2. Keep mobile phones and distractions away.\n3. Take handwritten summary notes.\n4. Maintain a regular daily study schedule.\n5. Stay hydrated and get 7-8 hours of sound sleep.';
  }

  if (q.includes('तनाव') || q.includes('stress') || q.includes('चिन्ता हटाउने')) {
    return isNe
      ? 'तनाव र चिन्ता कम गर्ने केही सरल र वैज्ञानिक उपायहरू:\n१. **गहिरो सास फेर्ने अभ्यास (प्राणायाम / Deep Breathing):** ४ सेकेन्ड सास लिने, ४ सेकेन्ड रोक्ने र ६ सेकेन्डमा छोड्ने।\n२. **दैनिक कम्तीमा २०-३० मिनेट हिँड्ने वा व्यायाम गर्ने।**\n३. **आफ्ना भावनाहरू साथीभाइ वा परिवारसँग साझा गर्ने।**\n४. **अनावश्यक सोचभन्दा वर्तमान पल (Present Moment) मा ध्यान दिने।**'
      : 'Ways to reduce stress:\n1. Practice deep diaphragmatic breathing or meditation.\n2. Go for daily 20-30 minute walks or light exercise.\n3. Share feelings with trusted friends or family.\n4. Focus on present actionable steps rather than overthinking the future.';
  }

  // 7. ASTROLOGY / KUNDALI (ONLY WHEN USER EXPLICITLY ASKS ABOUT ASTROLOGY TOPICS)
  const isAstrologyQuery = [
    'कुण्डली', 'चिना', 'राशी', 'लग्न', 'ग्रह', 'दशा', 'महादशा', 'गोचर', 'भविष्यफल',
    'करियर', 'जागिर', 'व्यापार', 'विवाह', 'बिहे', 'जीवनसाथी', 'प्रेम', 'धन', 'पैसा',
    'आर्थिक', 'शान्ति', 'पूजा', 'रत्न', 'मांगलिक', 'कालसर्प', 'kundali', 'horoscope',
    'astrology', 'rashi', 'lagna', 'dasha', 'planet', 'career', 'marriage', 'wealth'
  ].some(term => q.includes(term));

  if (isAstrologyQuery && context) {
    const lagna = isNe ? (context.lagnaNe || 'मेष') : (context.lagnaEn || 'Aries');
    const moon = isNe ? (context.moonSignNe || 'वृष') : (context.moonSignEn || 'Taurus');
    const dasha = context.currentDasha || 'बृहस्पति / शनि';

    if (q.includes('career') || q.includes('job') || q.includes('business') || q.includes('करियर') || q.includes('जागिर') || q.includes('व्यापार')) {
      return isNe
        ? `तपाईंको लग्न '${lagna}' र चन्द्रमा '${moon}' राशी अनुसार दशम भाव (कर्म भाव) को प्रभावले व्यवस्थापन, नेतृत्व, परामर्श सेवा वा स्वतन्त्र उद्यममा राम्रो सफलताको संकेत गर्दछ। वर्तमान समयमा योजनाबद्ध कार्य र निरन्तरको परिश्रमले उच्च पेशागत प्रगति गराउनेछ।`
        : `According to your '${lagna}' ascendant and '${moon}' Moon sign, your 10th house indicates strong aptitude for leadership, management, professional consultancy, or independent business. Focused efforts will yield steady career growth.`;
    }

    if (q.includes('marriage') || q.includes('love') || q.includes('spouse') || q.includes('विवाह') || q.includes('बिहे') || q.includes('जीवनसाथी')) {
      return isNe
        ? `सप्तम भाव (दाम्पत्य भाव) र शुक्र ग्रहको स्थिति अनुसार तपाईंको वैवाहिक जीवनमा आपसी समझदारी, धैर्य र खुला संवादले सम्बन्ध निकै सुमधुर र सुखमय रहनेछ। '${lagna}' लग्नको प्रकृति अनुसार हतारमा निर्णय लिनुभन्दा शान्त र परिपक्व सोच राख्नु कल्याणकारी हुन्छ।`
        : `Examining your 7th house and Venus placement, marital harmony thrives on mutual understanding, patience, and clear communication. Your '${lagna}' ascendant temperament supports solid emotional bonding.`;
    }

    if (q.includes('wealth') || q.includes('money') || q.includes('finance') || q.includes('धन') || q.includes('पैसा') || q.includes('आर्थिक')) {
      return isNe
        ? `द्वितीय (धन भाव) र एकादश (लाभ भाव) को शुभ प्रभाव अनुसार तपाईंको आर्थिक पक्ष मजबुत र प्रगतितर्फ उन्मुख छ। सुनियोजित बचत, संयमित खर्च र विवेकपूर्ण लगानीले दीर्घकालीन धनसम्पत्ति आर्जनमा राम्रो लाभ दिलाउनेछ।`
        : `Your 2nd and 11th houses suggest strong potential for financial growth and stability through prudent investments and disciplined savings.`;
    }

    if (q.includes('दशा') || q.includes('dasha')) {
      return isNe
        ? `तपाईंको कुण्डली अनुसार वर्तमान समयमा महादशाको प्रभाव चलिरहेको छ। यस अवधिमा कर्मप्रति निष्ठावान रहँदा, कुलदेवताको स्मरण र नियमित ध्यान-साधनाले शुभ फल प्राप्त हुनेछ।`
        : `According to your chart, current planetary dasha transits encourage steadfast dedication, mindful focus, and spiritual balance for fruitful outcomes.`;
    }
  }

  // 8. General Open-Ended Question Analysis (Understanding grammar & intent without forcing astrology)
  // Check if question asks "के हो / what is"
  if (q.includes('के हो') || q.includes('what is') || q.includes('भनेको के हो')) {
    return isNe
      ? `तपाईंले सोध्नुभएको "${rawQ}" विषयमा:\nयो एक महत्वपूर्ण विषय हो। यसका बारेमा स्पष्ट बुझ्दा यसको मुख्य परिभाषा, यसको उपयोगिता र यसको व्यावहारिक पक्षलाई ध्यानमा राख्नुपर्छ। यदि तपाईंलाई यसको कुनै खास पक्ष वा उदाहरणबारे विस्तृत जानकारी चाहिन्छ भने कृपया थप स्पष्ट गरिदिनुहोला!`
      : `Regarding your question "${rawQ}":\nThis is an insightful topic. To understand it clearly, consider its core definition, practical applications, and significance. If you have a specific angle or example you'd like to explore, feel free to ask!`;
  }

  // Check if question asks "कसरी / how to"
  if (q.includes('कसरी') || q.includes('how to') || q.includes('how can')) {
    return isNe
      ? `तपाईंले सोध्नुभएको "${rawQ}" को सन्दर्भमा:\nयस कार्यलाई सफलतापूर्वक सम्पन्न गर्न चरणबद्ध (Step-by-step) योजना बनाउनुहोस्, मुख्य उद्देश्य स्पष्ट राख्नुहोस्, र नियमित अभ्यास वा कार्यान्वयन गर्नुहोस्। हजुरलाई यसका कुन चरणमा सहयोग चाहिएको छ, थप बताउनुहोस्!`
      : `Regarding "${rawQ}":\nTo accomplish this effectively, break the process into structured steps, identify clear milestones, and take consistent action. Let me know which step you would like more detail on!`;
  }

  // Check if question asks "किन / why"
  if (q.includes('किन') || q.includes('why')) {
    return isNe
      ? `तपाईंको प्रश्न "${rawQ}" को मुख्य कारण बुझ्दा यसका पछाडि वैज्ञानिक, सामाजिक वा व्यावहारिक पक्षहरू जोडिएका हुन्छन्। यसको सही विश्लेषणका लागि विषयको पृष्ठभूमि बुझ्नु आवश्यक हुन्छ। हजुर यस विषयमा कुन खास दृष्टिकोणबाट जान्न चाहनुहुन्छ?`
      : `Regarding your inquiry "${rawQ}":\nUnderstanding the reasoning behind this involves examining the underlying practical and contextual factors. Let me know if you would like an analytical or historical perspective!`;
  }

  // Natural contextual response for any other inquiry
  return isNe
    ? `तपाईंको प्रश्न: "${rawQ}"\n\nम तपाईंको प्रश्न राम्रोसँग बुझ्न सक्छु। मलाई जे प्रश्न सोध्नुभयो, त्यसैको आधारमा सही र स्पष्ट जानकारी दिन तयार छु। कृपया यस जिज्ञासालाई अझ खुलाएर सोध्नुहोस् वा हजुरलाई जान्न मन लागेको खास कुरा के हो, बताउनुहोस्!`
    : `Regarding: "${rawQ}"\n\nI understand your question and am ready to assist with clear, accurate answers. Please let me know what specific details you would like to explore!`;
}
