# 📖 EasyDict - Complete Product & Engineering Roadmap

> **Vision**: A dictionary app that explains words the way a smart friend would - in plain language, with real sentences, Hindi translation, and voice recognition. No jargon. No complexity.

---

## 🧠 Product Overview

### Core Value Proposition
Unlike traditional dictionaries that explain words *using more complex words*, EasyDict:
- Explains every word in **ELI5 (Explain Like I'm 5)** language
- Generates **contextual example sentences** using AI (Gemini Flash)
- Provides **Hindi translations**
- Gives **pronunciation audio**
- Lets users **speak a word** to look it up - like Shazam, but for words
- Is always **one tap away** from the notification panel / quick tile

---

## 🏗️ Tech Stack Decisions

| Layer | Technology | Reason |
|---|---|---|
| Framework | **Expo (React Native)** | Cross-platform iOS + Android, fast dev |
| Language | **TypeScript** | Type safety, better DX |
| Navigation | **Expo Router** | File-based routing, deep linking ready |
| Backend / DB | **Firebase** | Firestore for word cache, Auth, Storage |
| AI | **Gemini 2.0 Flash-Lite** | Cheapest Gemini model, fast responses |
| Speech-to-Text | **Voice API via @react-native-voice/voice** | For word recognition feature (Shazam for words) |
| TTS (Pronunciation) | **expo-speech** | Native text-to-speech for pronunciation |
| Hindi Translation | **Gemini prompt (same call)** | No extra API needed |
| State | **Zustand** | Lightweight, simple |
| Version Control | **Git + GitHub** | Alpha versioning (alpha1, alpha2...) |

---

## 🔥 Firebase Architecture

### Firestore Structure
```
/words/{wordId}
  ├── word: string              (lowercase canonical)
  ├── eli5: string              (AI-generated plain explanation)
  ├── exampleSentence: string   (AI-generated)
  ├── hindiTranslation: string  (AI-generated)
  ├── phonetic: string          (IPA or simplified)
  ├── partOfSpeech: string      (noun/verb/adj...)
  ├── fetchedAt: timestamp
  └── fetchCount: number        (how many times searched)
```

**Caching Logic (critical cost saver)**:
1. User searches word -> Check Firestore first
2. If exists -> Return cached data (zero AI cost)
3. If not exists -> Call Gemini -> Store in Firestore -> Return to user
4. Result: **Every word is only ever AI-generated once, ever, across all users**

---

## 📱 Feature Specification

### Must-Have (MVP)
| # | Feature | Description |
|---|---|---|
| F1 | Word Search | Type any English word, get ELI5 meaning |
| F2 | AI Meaning | Gemini generates simple explanation |
| F3 | Example Sentence | AI generates natural sentence |
| F4 | Hindi Translation | Shown below definition |
| F5 | Pronunciation | Tap speaker icon to play TTS |
| F6 | Word Cache (Firebase) | Never AI-generate same word twice |
| F7 | Quick Access Tile | Android notification panel shortcut / quick action |
| F8 | Voice Word Input | Speak the word -> recognized -> searched |
| F9 | Recent Searches | Local history of looked-up words |

### Nice-to-Have (Post-Alpha)
- Word of the Day widget
- Offline mode for cached words
- Share card (beautiful definition image to WhatsApp etc.)
- Streak tracking (learn 5 words/day)

---

## 🗺️ Alpha Release Milestones

### Alpha 1 - Project Skeleton + Git Init (Current Phase)
**Tag**: `alpha1`
- Expo project initialized with TypeScript + Expo Router
- Git repo created, linked to GitHub
- Core dependencies installed (Firebase, Gemini, UI, Voice)
- **Deliverable**: App launches with placeholder tabs and project skeleton ready.

### Alpha 2 - Core Search + AI Integration
**Tag**: `alpha2`
- Search screen with text input
- Gemini API integration (gemini-2.0-flash-lite)
- ELI5 meaning + Example sentence + Hindi translation in single prompt
- Basic results display card
- **Deliverable**: Type a word, see AI-generated meaning

### Alpha 3 - Firebase Caching + Pronunciation
**Tag**: `alpha3`
- Firebase initialized and connected
- Firestore read-before-write logic (check cache first)
- expo-speech integration for pronunciation
- **Deliverable**: Words load from cache; pronunciation works

### Alpha 4 - Voice Word Recognition
**Tag**: `alpha4`
- @react-native-voice/voice integration
- Shazam-style "tap to listen" button on search screen
- User speaks word -> STT extracts word -> auto-searches
- **Deliverable**: Search by speaking a word

### Alpha 5 - Quick Access
**Tag**: `alpha5`
- Android: Quick Settings tile using expo-quick-actions or native module
- Deep link: easydict://search opens search directly
- **Deliverable**: Open search from outside the app via quick button

### Alpha 6 - History, Polish & UX
**Tag**: `alpha6`
- Recent searches screen (local AsyncStorage)
- Premium dark-mode UI polish and animations
- **Deliverable**: Feels like a real, polished product

---

## 🤖 Gemini Prompt Design (Single Call Strategy)

One Gemini call returns all data - keeps costs near zero:

```json
{
  "eli5": "Explain in 2-3 simple sentences, like talking to a 10-year-old",
  "exampleSentence": "One natural, modern sentence using the word",
  "hindiTranslation": "Hindi translation in Devanagari script",
  "partOfSpeech": "noun / verb / adjective / etc."
}
```

**Cost estimate**: Using `gemini-2.0-flash-lite`, it's ~$0.0001 per unique word. With Firebase caching, this makes it practically free no matter how many users we scale to.

---

## ❓ Feedback & Clarifications Needed Before Alpha 2

I have generated this preliminary roadmap. Here are my questions/suggestions for improvements:
1. **GitHub Setup**: Do you have a remote GitHub repository created to which I should push? Since I'm making local git commits and branching, I can push it to your repo if you provide the GitHub URL.
2. **Firebase Setup**: Do you have an active Firebase project? If not, please go to the Firebase Console, create one for "EasyDict" and provide me the web config/keys. Let's do this when we get to Alpha 3.
3. **Gemini API Key**: Do you have a Gemini API key from Google AI Studio ready?
4. **Quick Access**: Setting up Android quick settings tiles in Expo often requires custom native code/config plugins. We will explore `expo-quick-actions` to see how nicely it supports notification tiles, otherwise, we'll implement a robust deep-link that you can trigger from quick shortcuts. Is that acceptable?
5. **UI/UX Aesthetics**: Should we design the app fully dark-mode with sleek glassmorphism to look premium as intended, or do you have any specific color themes in mind?

If everything looks great, we will start initializing the basic connectors right away!
