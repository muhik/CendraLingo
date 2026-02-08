export type ChallengeType = "SELECT" | "ASSIST" | "MATCH" | "LISTEN" | "SPEAK";

export interface Option {
    id: number;
    text: string;
    correct: boolean;
    audio?: string;
    imageSrc?: string;
}

export interface Pair {
    from: string; // e.g. "Book"
    to: string;   // e.g. "Buku"
    audioFrom?: string;
    audioTo?: string;
}

export interface StoryContext {
    image: string;
    video?: string; // New
    speaker: string;
    text: string;
    audio?: string;
    dialogue?: { // NEW: For Multi-turn conversations
        speaker: string;
        text: string;
        image?: string; // Optional override
        side?: "left" | "right";
    }[];
}

export interface Challenge {
    id: number;
    type: ChallengeType;
    question: string;
    audioQuestion?: string;
    options?: Option[]; // For SELECT
    initialWords?: string[]; // For ASSIST/LISTEN
    correctSentence?: string; // For ASSIST/LISTEN
    pairs?: Pair[]; // For MATCH
    storyContext?: StoryContext; // For Dialogue enhancements
}


export type LessonType = "STAR" | "VIDEO" | "PRACTICE" | "STORY" | "HEADSET";

export interface Lesson {
    id: number;
    unitId: number;
    title: string;
    order: number;
    type?: LessonType;
    challenges: Challenge[];
}

export interface Unit {
    id: number;
    title: string;
    description: string;
    guidebookContent?: string;
    lessons: Lesson[];
}

// 5-LEVEL CURRICULUM (UNITS 1-5)

export const curriculumData: Unit[] = [
    // --------------------------------------------------------------------------------
    // UNIT 1: THE FOUNDATION
    // --------------------------------------------------------------------------------
    {
        id: 1,
        title: "Unit 1: Welcome & Basics",
        description: "Dasar-Dasar: Sapaan, Angka, Warna, Benda",
        guidebookContent: `
# Welcome & Basics 👋

Selamat datang di Unit 1! Di sini kita akan membangun pondasi bahasa Inggrismu.

## 1. Greetings (Sapaan)
- **Hello** = Halo
- **Good Morning** = Selamat Pagi
- **My name is...** = Nama saya adalah...

## 2. Subject Pronouns (Kata Ganti)
| English | Indonesia |
|---------|-----------|
| **I** | Saya |
| **You** | Kamu |
| **He** | Dia (Laki-laki) |
| **She** | Dia (Perempuan) |

## 3. Numbers & Colors
Kita akan belajar berhitung 1-20 dan mengenal warna-warni dasar seperti **Red**, **Blue**, dan **Green**.
        `,
        lessons: [
            // Block 1: Greetings (EXPANDED ~9 Questions)
            {
                id: 101, unitId: 1, order: 1, title: "Greetings", type: "STAR",
                challenges: [
                    {
                        id: 1011, type: "SELECT", question: "Bahasa Inggris 'Halo'?",
                        options: [
                            { id: 1, text: "Hello", correct: true, audio: "Hello" },
                            { id: 2, text: "Goodbye", correct: false, audio: "Goodbye" },
                            { id: 3, text: "Thank You", correct: false, audio: "Thank You" }
                        ]
                    },
                    {
                        id: 1012, type: "ASSIST", question: "Terjemahkan: 'Selamat Pagi'",
                        initialWords: ["Good", "Morning", "Night", "Hello", "Bye"],
                        correctSentence: "Good Morning"
                    },
                    {
                        id: 1013, type: "MATCH", question: "Pasangkan kata berikut:",
                        pairs: [
                            { from: "Hello", to: "Halo" },
                            { from: "Good Morning", to: "Selamat Pagi" },
                            { from: "Name", to: "Nama" },
                            { from: "My", to: "Saya (Milik)" },
                            { from: "Is", to: "Adalah" }
                        ]
                    },
                    {
                        id: 1014, type: "SELECT", question: "Apa arti 'Red'?",
                        options: [
                            { id: 1, text: "Merah", correct: true },
                            { id: 2, text: "Biru", correct: false },
                            { id: 3, text: "Hijau", correct: false }
                        ]
                    },
                    {
                        id: 1015, type: "MATCH", question: "Pasangkan Angka",
                        pairs: [
                            { from: "One", to: "Satu" },
                            { from: "Two", to: "Dua" },
                            { from: "Three", to: "Tiga" },
                            { from: "Good", to: "Baik" }
                        ]
                    },
                    {
                        id: 1016, type: "LISTEN", question: "Tulis apa yang Anda dengar:",
                        audioQuestion: "My name is Budi",
                        initialWords: ["My", "name", "is", "Budi", "you", "are"],
                        correctSentence: "My name is Budi"
                    },
                    {
                        id: 1017, type: "ASSIST", question: "Susun: 'Halo nama saya Andi'",
                        initialWords: ["Hello", "my", "name", "is", "Andi"],
                        correctSentence: "Hello my name is Andi"
                    },
                    {
                        id: 1018, type: "SELECT", question: "Bahasa Inggris 'Sampai Jumpa'?",
                        options: [
                            { id: 1, text: "Goodbye", correct: true },
                            { id: 2, text: "Good morning", correct: false },
                            { id: 3, text: "Hello", correct: false }
                        ]
                    },
                    {
                        id: 1019, type: "LISTEN", question: "Dengarkan:",
                        audioQuestion: "Good morning",
                        initialWords: ["Good", "morning", "night", "hello"],
                        correctSentence: "Good morning"
                    },
                    {
                        id: 10110, type: "SELECT", question: "Pilih kata yang hilang: '_____ morning.'",
                        options: [
                            { id: 1, text: "Good", correct: true },
                            { id: 2, text: "Bad", correct: false },
                            { id: 3, text: "Night", correct: false }
                        ]
                    },
                    {
                        id: 10111, type: "ASSIST", question: "Lengkapi kalimatnya: 'Halo, apa kabar?'",
                        initialWords: ["Hello", "how", "are", "you", "is"],
                        correctSentence: "Hello how are you"
                    },
                    {
                        id: 10112, type: "SELECT", question: "Pilih kata yang hilang: 'My _____ is Budi.'",
                        options: [
                            { id: 1, text: "name", correct: true },
                            { id: 2, text: "you", correct: false },
                            { id: 3, text: "halo", correct: false }
                        ]
                    }
                ]
            },
            // TEMPORARILY DISABLED FOR TESTING (Guest Flow: 1 Block Only)
            /*
            // Block 2: Personal Pronouns (EXPANDED ~9 Questions)
            {
                id: 102, unitId: 1, order: 2, title: "Subject Pronouns", type: "VIDEO",
                challenges: [
                    {
                        id: 1021, type: "SELECT", question: "Bahasa Inggris 'Saya'",
                        options: [
                            { id: 1, text: "I", correct: true, audio: "I" },
                            { id: 2, text: "You", correct: false, audio: "You" },
                            { id: 3, text: "He", correct: false, audio: "He" }
                        ]
                    },
                    {
                        id: 1022, type: "MATCH", question: "Pasangkan Kata Ganti",
                        pairs: [
                            { from: "I", to: "Saya" },
                            { from: "You", to: "Kamu" },
                            { from: "He", to: "Dia (Lk)" },
                            { from: "She", to: "Dia (Pr)" },
                            { from: "We", to: "Kita" }
                        ]
                    },
                    {
                        id: 1023, type: "ASSIST", question: "Susun: 'Kamu pintar'",
                        initialWords: ["You", "are", "smart", "I", "am"],
                        correctSentence: "You are smart"
                    },
                    {
                        id: 1024, type: "SELECT", question: "Bahasa Inggris 'Mereka'?",
                        options: [
                            { id: 1, text: "They", correct: true },
                            { id: 2, text: "We", correct: false },
                            { id: 3, text: "She", correct: false }
                        ]
                    },
                    {
                        id: 1025, type: "MATCH", question: "Pasangkan",
                        pairs: [
                            { from: "They", to: "Mereka" },
                            { from: "It", to: "Itu (Benda)" },
                            { from: "Are", to: "Adalah (Jamak)" },
                            { from: "Am", to: "Adalah (Saya)" },
                            { from: "Is", to: "Adalah (Dia)" }
                        ]
                    },
                    {
                        id: 1026, type: "LISTEN", question: "Dengarkan:",
                        audioQuestion: "She is smart",
                        initialWords: ["She", "is", "smart", "he", "good"],
                        correctSentence: "She is smart"
                    },
                    {
                        id: 1027, type: "ASSIST", question: "Susun: 'Saya senang'",
                        initialWords: ["I", "am", "happy", "is", "sad"],
                        correctSentence: "I am happy"
                    },
                    {
                        id: 1028, type: "SELECT", question: "Dia (Perempuan) adalah...",
                        options: [
                            { id: 1, text: "She", correct: true },
                            { id: 2, text: "He", correct: false },
                            { id: 3, text: "It", correct: false }
                        ]
                    },
                    {
                        id: 1029, type: "MATCH", question: "Review Kata Ganti",
                        pairs: [
                            { from: "You", to: "Kamu" },
                            { from: "We", to: "Kami/Kita" },
                            { from: "They", to: "Mereka" },
                            { from: "I", to: "Aku" },
                            { from: "He", to: "Dia" }
                        ]
                    },
                    // NEW SENTENCE GAMES
                    {
                        id: 10210, type: "ASSIST", question: "Lengkapi: 'Mereka senang'",
                        initialWords: ["They", "are", "happy", "is", "we"],
                        correctSentence: "They are happy"
                    },
                    {
                        id: 10211, type: "SELECT", question: "Pilih kata yang hilang: 'She _____ smart.'",
                        options: [
                            { id: 1, text: "is", correct: true },
                            { id: 2, text: "are", correct: false },
                            { id: 3, text: "am", correct: false }
                        ]
                    }
                ]
            },
            // Block 3: Numbers 1-10 (EXPANDED ~9 Questions)
            {
                id: 103, unitId: 1, order: 3, title: "Numbers 1-10", type: "PRACTICE",
                challenges: [
                    {
                        id: 1031, type: "MATCH", question: "Berhitung 1-5",
                        pairs: [
                            { from: "One", to: "Satu" },
                            { from: "Two", to: "Dua" },
                            { from: "Three", to: "Tiga" },
                            { from: "Four", to: "Empat" },
                            { from: "Five", to: "Lima" }
                        ]
                    },
                    {
                        id: 1032, type: "SELECT", question: "Angka 'Sepuluh'?",
                        options: [
                            { id: 1, text: "Ten", correct: true, audio: "Ten" },
                            { id: 2, text: "Nine", correct: false, audio: "Nine" },
                            { id: 3, text: "Eleven", correct: false, audio: "Eleven" }
                        ]
                    },
                    {
                        id: 1033, type: "LISTEN", question: "Tulis angkanya:",
                        audioQuestion: "Twenty",
                        initialWords: ["Twenty", "Twelve", "Two", "Ten"],
                        correctSentence: "Twenty"
                    },
                    {
                        id: 1034, type: "MATCH", question: "Berhitung 6-10",
                        pairs: [
                            { from: "Six", to: "Enam" },
                            { from: "Seven", to: "Tujuh" },
                            { from: "Eight", to: "Delapan" },
                            { from: "Nine", to: "Sembilan" },
                            { from: "Ten", to: "Sepuluh" }
                        ]
                    },
                    {
                        id: 1035, type: "SELECT", question: "Angka 'Tiga'?",
                        options: [
                            { id: 1, text: "Three", correct: true },
                            { id: 2, text: "Tree", correct: false },
                            { id: 3, text: "Free", correct: false }
                        ]
                    },
                    {
                        id: 1036, type: "ASSIST", question: "Susun: 'Satu dua tiga'",
                        initialWords: ["One", "two", "three", "four", "five"],
                        correctSentence: "One two three"
                    },
                    {
                        id: 1037, type: "MATCH", question: "Belasan",
                        pairs: [
                            { from: "Eleven", to: "Sebelas" },
                            { from: "Twelve", to: "Dua belas" },
                            { from: "Thirteen", to: "Tiga belas" },
                            { from: "Fourteen", to: "Empat belas" },
                            { from: "Fifteen", to: "Lima belas" }
                        ]
                    },
                    {
                        id: 1038, type: "LISTEN", question: "Dengarkan:",
                        audioQuestion: "Seven",
                        initialWords: ["Seven", "Eleven", "Heaven"],
                        correctSentence: "Seven"
                    },
                    {
                        id: 1039, type: "SELECT", question: "Angka 'Dua Belas'?",
                        options: [
                            { id: 1, text: "Twelve", correct: true },
                            { id: 2, text: "Twenty", correct: false },
                            { id: 3, text: "Two", correct: false }
                        ]
                    },
                    // NEW SENTENCE GAMES
                    {
                        id: 10310, type: "SELECT", question: "Pilih kata yang hilang: 'One, Two, _____'",
                        options: [
                            { id: 1, text: "Three", correct: true },
                            { id: 2, text: "Five", correct: false },
                            { id: 3, text: "Zero", correct: false }
                        ]
                    },
                    {
                        id: 10311, type: "ASSIST", question: "Lengkapi: 'Saya punya dua kucing'",
                        initialWords: ["I", "have", "two", "cats", "one"],
                        correctSentence: "I have two cats"
                    }
                ]
            },
            // Block 4: Colors (EXPANDED ~8 Questions)
            {
                id: 104, unitId: 1, order: 4, title: "Colors", type: "STORY",
                challenges: [
                    {
                        id: 1041, type: "SELECT", question: "Warna 'Merah'?",
                        options: [
                            { id: 1, text: "Red", correct: true, audio: "Red" },
                            { id: 2, text: "Blue", correct: false, audio: "Blue" },
                            { id: 3, text: "Green", correct: false, audio: "Green" }
                        ]
                    },
                    {
                        id: 1042, type: "MATCH", question: "Warna & Bentuk",
                        pairs: [
                            { from: "Red", to: "Merah" },
                            { from: "Blue", to: "Biru" },
                            { from: "Circle", to: "Lingkaran" },
                            { from: "Square", to: "Kotak" },
                            { from: "Yellow", to: "Kuning" }
                        ]
                    },
                    {
                        id: 1043, type: "ASSIST", question: "Susun: 'Apel itu merah'",
                        initialWords: ["The", "apple", "is", "red", "blue", "circle"],
                        correctSentence: "The apple is red"
                    },
                    {
                        id: 1044, type: "SELECT", question: "Warna 'Hijau'?",
                        options: [
                            { id: 1, text: "Green", correct: true },
                            { id: 2, text: "Grey", correct: false },
                            { id: 3, text: "Grain", correct: false }
                        ]
                    },
                    {
                        id: 1045, type: "MATCH", question: "Warna Campuran",
                        pairs: [
                            { from: "Purple", to: "Ungu" },
                            { from: "Orange", to: "Jingga" },
                            { from: "Pink", to: "Merah Muda" },
                            { from: "Black", to: "Hitam" },
                            { from: "White", to: "Putih" }
                        ]
                    },
                    {
                        id: 1046, type: "LISTEN", question: "Dengarkan:",
                        audioQuestion: "Blue sky",
                        initialWords: ["Blue", "sky", "red", "cloud"],
                        correctSentence: "Blue sky"
                    },
                    {
                        id: 1047, type: "SELECT", question: "Bentuk 'Segitiga'?",
                        options: [
                            { id: 1, text: "Triangle", correct: true },
                            { id: 2, text: "Square", correct: false },
                            { id: 3, text: "Circle", correct: false }
                        ]
                    },
                    {
                        id: 1048, type: "ASSIST", question: "Susun: 'Saya suka biru'",
                        initialWords: ["I", "like", "blue", "red", "love"],
                        correctSentence: "I like blue"
                    },
                    // NEW SENTENCE GAMES
                    {
                        id: 1049, type: "SELECT", question: "Pilih kata yang hilang: 'The sky is _____.'",
                        options: [
                            { id: 1, text: "Blue", correct: true },
                            { id: 2, text: "Green", correct: false },
                            { id: 3, text: "Red", correct: false }
                        ]
                    },
                    {
                        id: 10410, type: "ASSIST", question: "Lengkapi: 'Pisang itu kuning'",
                        initialWords: ["The", "banana", "is", "yellow", "purple"],
                        correctSentence: "The banana is yellow"
                    }
                ]
            },
            // Block 5: Common Objects (EXPANDED ~8 Questions)
            {
                id: 105, unitId: 1, order: 5, title: "Common Objects", type: "HEADSET",
                challenges: [
                    {
                        id: 1051, type: "MATCH", question: "Benda Sekitar",
                        pairs: [
                            { from: "Book", to: "Buku" },
                            { from: "Table", to: "Meja" },
                            { from: "Pen", to: "Pena" },
                            { from: "Phone", to: "HP" },
                            { from: "Chair", to: "Kursi" }
                        ]
                    },
                    {
                        id: 1052, type: "SELECT", question: "Saya punya...",
                        storyContext: { image: "/mascot.svg", speaker: "Cendra", text: "I have a pen." },
                        options: [
                            { id: 1, text: "Pena", correct: true },
                            { id: 2, text: "Pensil", correct: false },
                            { id: 3, text: "Penghapus", correct: false }
                        ]
                    },
                    {
                        id: 1053, type: "LISTEN", question: "Dengarkan:",
                        audioQuestion: "The pen is on the table",
                        initialWords: ["The", "pen", "is", "on", "the", "table", "chair"],
                        correctSentence: "The pen is on the table"
                    },
                    {
                        id: 1054, type: "MATCH", question: "Elektronik",
                        pairs: [
                            { from: "Computer", to: "Komputer" },
                            { from: "Screen", to: "Layar" },
                            { from: "Mouse", to: "Mouse" },
                            { from: "Key", to: "Kunci" },
                            { from: "Door", to: "Pintu" }
                        ]
                    },
                    {
                        id: 1055, type: "SELECT", question: "Buka...",
                        options: [
                            { id: 1, text: "The Door", correct: true },
                            { id: 2, text: "The Floor", correct: false },
                            { id: 3, text: "The Wall", correct: false }
                        ]
                    },
                    {
                        id: 1056, type: "ASSIST", question: "Susun: 'Buku itu biru'",
                        initialWords: ["The", "book", "is", "blue", "red"],
                        correctSentence: "The book is blue"
                    },
                    {
                        id: 1057, type: "SELECT", question: "Duduk di...",
                        options: [
                            { id: 1, text: "Chair", correct: true },
                            { id: 2, text: "Table", correct: false },
                            { id: 3, text: "Pen", correct: false }
                        ]
                    },
                    {
                        id: 1058, type: "LISTEN", question: "Dengarkan:",
                        audioQuestion: "Open your book",
                        initialWords: ["Open", "your", "book", "close", "door"],
                        correctSentence: "Open your book"
                    },
                    // NEW SENTENCE GAMES
                    {
                        id: 1059, type: "SELECT", question: "Pilih kata yang hilang: 'I open the _____.'",
                        options: [
                            { id: 1, text: "Door", correct: true },
                            { id: 2, text: "Table", correct: false },
                            { id: 3, text: "Pen", correct: false }
                        ]
                    },
                    {
                        id: 10510, type: "ASSIST", question: "Lengkapi: 'Ini adalah komputer'",
                        initialWords: ["This", "is", "a", "computer", "am"],
                        correctSentence: "This is a computer"
                    }
                ]
            },
            // Block 6: Shapes
            {
                id: 106, unitId: 1, order: 6, title: "Shapes", type: "STAR",
                challenges: [
                    {
                        id: 1061, type: "MATCH", question: "Bentuk",
                        pairs: [
                            { from: "Circle", to: "Lingkaran" },
                            { from: "Square", to: "Kotak" },
                            { from: "Triangle", to: "Segitiga" },
                            { from: "Star", to: "Bintang" },
                            { from: "Heart", to: "Hati" }
                        ]
                    },
                    {
                        id: 1062, type: "SELECT", question: "Bentuk 'Segitiga'?",
                        options: [
                            { id: 1, text: "Triangle", correct: true },
                            { id: 2, text: "Square", correct: false },
                            { id: 3, text: "Circle", correct: false }
                        ]
                    },
                    {
                        id: 1063, type: "LISTEN", question: "Dengarkan:",
                        audioQuestion: "It is a circle",
                        initialWords: ["It", "is", "a", "circle", "square"],
                        correctSentence: "It is a circle"
                    }
                ]
            },
            // Block 7: Numbers 11-20
            {
                id: 107, unitId: 1, order: 7, title: "Numbers 11-20", type: "PRACTICE",
                challenges: [
                    {
                        id: 1071, type: "MATCH", question: "Angka Besar",
                        pairs: [
                            { from: "Eleven", to: "Sebelas" },
                            { from: "Twelve", to: "Dua belas" },
                            { from: "Twenty", to: "Dua puluh" },
                            { from: "Fifteen", to: "Lima belas" },
                            { from: "Eighteen", to: "Delapan belas" }
                        ]
                    },
                    {
                        id: 1072, type: "SELECT", question: "Angka '20'?",
                        options: [
                            { id: 1, text: "Twenty", correct: true },
                            { id: 2, text: "Twelve", correct: false },
                            { id: 3, text: "Two", correct: false }
                        ]
                    },
                    {
                        id: 1073, type: "ASSIST", question: "Susun: 'Saya punya 11 apel'",
                        initialWords: ["I", "have", "eleven", "apples", "ten"],
                        correctSentence: "I have eleven apples"
                    }
                ]
            },
            // Block 8: Review & Practice
            {
                id: 108, unitId: 1, order: 8, title: "Review & Practice", type: "HEADSET", // Chest Icon Logic handles Last Item
                challenges: [
                    {
                        id: 1081, type: "MATCH", question: "Campuran",
                        pairs: [
                            { from: "Red", to: "Merah" },
                            { from: "One", to: "Satu" },
                            { from: "Hello", to: "Halo" },
                            { from: "Book", to: "Buku" },
                            { from: "Mother", to: "Ibu" }
                        ]
                    },
                    {
                        id: 1082, type: "SELECT", question: "Apa ini?",
                        options: [
                            { id: 1, text: "Apple", correct: true },
                            { id: 2, text: "Car", correct: false },
                            { id: 3, text: "Dog", correct: false }
                        ]
                    },
                    {
                        id: 1083, type: "LISTEN", question: "Dengarkan:",
                        audioQuestion: "Goodbye my friend",
                        initialWords: ["Goodbye", "my", "friend", "hello"],
                        correctSentence: "Goodbye my friend"
                    }
                ]
            }
            */
        ]
    },

    // --------------------------------------------------------------------------------
    // UNIT 2: MY WORLD
    // --------------------------------------------------------------------------------
    {
        id: 2,
        title: "Unit 2: Family & Friends",
        description: "Keluarga, Rumah, Hewan, Sifat, Emosi",
        guidebookContent: `
# My World 🌍
 
Mari bercerita tentang dunia kita!
 
## 1. Family (Keluarga)
- **Mother** / **Mom** = Ibu
- **Father** / **Dad** = Ayah
- **Brother** = Saudara Laki-laki
- **Sister** = Saudara Perempuan
 
## 2. My House (Rumahku)
Ruangan di rumah:
- **Kitchen** = Dapur
- **Bedroom** = Kamar Tidur
- **Bathroom** = Kamar Mandi
 
## 3. Emotions (Emosi)
- **Happy** 😄
- **Sad** 😢
- **Angry** 😡
- **Tired** 😴
`,
        lessons: [
            // Block 1: Family Members
            {
                id: 201, unitId: 2, order: 1, type: "STAR", title: "Family Members",
                challenges: [
                    {
                        id: 2011, type: "MATCH", question: "Keluarga",
                        pairs: [
                            { from: "Father", to: "Ayah" },
                            { from: "Mother", to: "Ibu" },
                            { from: "Brother", to: "Kakak (Lk)" },
                            { from: "Sister", to: "Kakak (Pr)" },
                            { from: "Grandma", to: "Nenek" }
                        ]
                    },
                    {
                        id: 2012, type: "ASSIST", question: "Terjemahkan: 'Ibu saya'",
                        initialWords: ["My", "mother", "father", "is"],
                        correctSentence: "My mother"
                    },
                    // NEW SENTENCE GAMES
                    {
                        id: 2013, type: "SELECT", question: "Pilih kata yang hilang: 'This is my _____.'",
                        options: [
                            { id: 1, text: "Father", correct: true },
                            { id: 2, text: "Car", correct: false },
                            { id: 3, text: "Apple", correct: false }
                        ]
                    },
                    // NEW STORY MODE (Conversation)
                    {
                        id: 2018, type: "SELECT", question: "Siapa yang diajak bicara?",
                        storyContext: {
                            image: "/mascot_head.png",
                            speaker: "Vikram",
                            text: "Conversation",
                            dialogue: [
                                { speaker: "Girl", text: "Hello Vikram!", side: "left", image: "/mascot_head.png" },
                                { speaker: "Vikram", text: "Hi Sarah!", side: "right", image: "/boy_head.png" },
                                { speaker: "Girl", text: "Goodbye Vikram.", side: "left", image: "/mascot_head.png" }
                            ]
                        },
                        options: [
                            { id: 1, text: "Sarah", correct: true },
                            { id: 2, text: "Budi", correct: false },
                            { id: 3, text: "Mom", correct: false }
                        ]
                    },
                    {
                        id: 2014, type: "ASSIST", question: "Lengkapi: 'Saya sayang ibu saya'",
                        initialWords: ["I", "love", "my", "mother", "you"],
                        correctSentence: "I love my mother"
                    },
                    {
                        id: 2015, type: "SELECT", question: "Siapa saudara laki-laki?",
                        options: [
                            { id: 1, text: "Brother", correct: true },
                            { id: 2, text: "Sister", correct: false },
                            { id: 3, text: "Mother", correct: false }
                        ]
                    },
                    {
                        id: 2016, type: "MATCH", question: "Keluarga Besar",
                        pairs: [
                            { from: "Grandpa", to: "Kakek" },
                            { from: "Uncle", to: "Paman" },
                            { from: "Aunt", to: "Bibi" },
                            { from: "Cousin", to: "Sepupu" },
                            { from: "Family", to: "Keluarga" }
                        ]
                    },
                    {
                        id: 2017, type: "LISTEN", question: "Dengarkan:",
                        audioQuestion: "My father is tall",
                        initialWords: ["My", "father", "is", "tall", "short"],
                        correctSentence: "My father is tall"
                    }
                ]
            },
            // Block 2: My House
            {
                id: 202, unitId: 2, order: 2, type: "VIDEO", title: "My House",
                challenges: [
                    {
                        id: 2021, type: "SELECT", question: "Tempat memasak?",
                        options: [
                            { id: 1, text: "Kitchen", correct: true },
                            { id: 2, text: "Bedroom", correct: false },
                            { id: 3, text: "Garden", correct: false }
                        ]
                    },
                    {
                        id: 2022, type: "MATCH", question: "Ruangan",
                        pairs: [
                            { from: "Bedroom", to: "Kamar Tidur" },
                            { from: "Bathroom", to: "Kamar Mandi" },
                            { from: "Kitchen", to: "Dapur" },
                            { from: "Living Room", to: "R. Tamu" },
                            { from: "Garage", to: "Garasi" }
                        ]
                    },
                    // NEW STORY MODE
                    {
                        id: 2028, type: "SELECT", question: "Dimana Ibu berada?",
                        storyContext: {
                            image: "/mascot_head.png",
                            speaker: "Vikram",
                            text: "Conversation",
                            dialogue: [
                                { speaker: "Vikram", text: "Where is Mom?", side: "right", image: "/boy_head.png" },
                                { speaker: "Sister", text: "She is in the kitchen.", side: "left", image: "/girl_head.png" },
                                { speaker: "Vikram", text: "Is she cooking?", side: "right", image: "/boy_head.png" }
                            ]
                        },
                        options: [
                            { id: 1, text: "In the kitchen", correct: true },
                            { id: 2, text: "In the bedroom", correct: false },
                            { id: 3, text: "In the garden", correct: false }
                        ]
                    },
                    // NEW SENTENCE GAMES
                    {
                        id: 2023, type: "SELECT", question: "Pilih kata yang hilang: 'I sleep in the _____.'",
                        options: [
                            { id: 1, text: "Bedroom", correct: true },
                            { id: 2, text: "Kitchen", correct: false },
                            { id: 3, text: "Garage", correct: false }
                        ]
                    },
                    {
                        id: 2024, type: "ASSIST", question: "Lengkapi: 'Dapur itu bersih'",
                        initialWords: ["The", "kitchen", "is", "clean", "dirty"],
                        correctSentence: "The kitchen is clean"
                    },
                    {
                        id: 2025, type: "SELECT", question: "Mobil ada di...",
                        options: [
                            { id: 1, text: "Garage", correct: true },
                            { id: 2, text: "Bedroom", correct: false },
                            { id: 3, text: "Garden", correct: false }
                        ]
                    },
                    {
                        id: 2026, type: "MATCH", question: "Benda di Rumah",
                        pairs: [
                            { from: "Bed", to: "Kasur" },
                            { from: "Lamp", to: "Lampu" },
                            { from: "Door", to: "Pintu" },
                            { from: "Window", to: "Jendela" },
                            { from: "Floor", to: "Lantai" }
                        ]
                    },
                    {
                        id: 2027, type: "ASSIST", question: "Susun: 'Ini kamarku'",
                        initialWords: ["This", "is", "my", "room", "kitchen"],
                        correctSentence: "This is my room"
                    }
                ]
            },
            // Block 3: Pets & Animals
            {
                id: 203, unitId: 2, order: 3, type: "PRACTICE", title: "Pets & Animals",
                challenges: [
                    {
                        id: 2031, type: "MATCH", question: "Hewan Peliharaan",
                        pairs: [
                            { from: "Cat", to: "Kucing" },
                            { from: "Dog", to: "Anjing" },
                            { from: "Bird", to: "Burung" },
                            { from: "Fish", to: "Ikan" },
                            { from: "Rabbit", to: "Kelinci" }
                        ]
                    },
                    {
                        id: 2032, type: "SELECT", question: "Suara 'Meow'?",
                        options: [
                            { id: 1, text: "Cat", correct: true },
                            { id: 2, text: "Dog", correct: false },
                            { id: 3, text: "Bird", correct: false }
                        ]
                    },
                    // NEW SENTENCE GAMES
                    {
                        id: 2033, type: "SELECT", question: "Pilih kata yang hilang: 'The cat says _____.'",
                        options: [
                            { id: 1, text: "Meow", correct: true },
                            { id: 2, text: "Moo", correct: false },
                            { id: 3, text: "Quack", correct: false }
                        ]
                    },
                    {
                        id: 2034, type: "ASSIST", question: "Lengkapi: 'Anjing itu lari'",
                        initialWords: ["The", "dog", "runs", "fly", "cat"],
                        correctSentence: "The dog runs"
                    },
                    {
                        id: 2035, type: "MATCH", question: "Makanan Hewan",
                        pairs: [
                            { from: "Fish", to: "Ikan" },
                            { from: "Carrot", to: "Wortel" },
                            { from: "Bone", to: "Tulang" },
                            { from: "Grass", to: "Rumput" },
                            { from: "Seed", to: "Biji" }
                        ]
                    },
                    {
                        id: 2036, type: "LISTEN", question: "Dengarkan:",
                        audioQuestion: "I have a fish",
                        initialWords: ["I", "have", "a", "fish", "dog"],
                        correctSentence: "I have a fish"
                    },
                    {
                        id: 2037, type: "SELECT", question: "Kelinci suka...",
                        options: [
                            { id: 1, text: "Carrot", correct: true },
                            { id: 2, text: "Pizza", correct: false },
                            { id: 3, text: "Cola", correct: false }
                        ]
                    }
                ]
            },
            // Block 4: Describing People
            {
                id: 204, unitId: 2, order: 4, type: "STORY", title: "Describing People",
                challenges: [
                    {
                        id: 2041, type: "MATCH", question: "Sifat Fisik",
                        pairs: [
                            { from: "Tall", to: "Tinggi" },
                            { from: "Short", to: "Pendek" },
                            { from: "Beautiful", to: "Cantik" },
                            { from: "Handsome", to: "Ganteng" },
                            { from: "Young", to: "Muda" }
                        ]
                    },
                    {
                        id: 2042, type: "ASSIST", question: "Susun: 'Dia cantik'",
                        initialWords: ["She", "is", "beautiful", "he", "handsome"],
                        correctSentence: "She is beautiful"
                    },
                    {
                        id: 2043, type: "SELECT", question: "Siapa dia? (Ganteng)",
                        options: [
                            { id: 1, text: "Handsome", correct: true },
                            { id: 2, text: "Ugly", correct: false },
                            { id: 3, text: "Short", correct: false }
                        ]
                    },
                    {
                        id: 2044, type: "MATCH", question: "Lawan Kata",
                        pairs: [
                            { from: "Tall", to: "Tinggi" },
                            { from: "Short", to: "Pendek" },
                            { from: "Old", to: "Tua" },
                            { from: "Young", to: "Muda" },
                            { from: "Bird", to: "Burung" }
                        ]
                    },
                    {
                        id: 2045, type: "LISTEN", question: "Dengarkan:",
                        audioQuestion: "You are young",
                        initialWords: ["You", "are", "young", "old", "is"],
                        correctSentence: "You are young"
                    }
                ]
            },
            // Block 5: Emotions
            {
                id: 205, unitId: 2, order: 5, type: "HEADSET", title: "Emotions",
                challenges: [
                    {
                        id: 2051, type: "SELECT", question: "Saya sedih 😢",
                        options: [
                            { id: 1, text: "I am sad", correct: true },
                            { id: 2, text: "I am happy", correct: false },
                            { id: 3, text: "I am angry", correct: false }
                        ]
                    },
                    {
                        id: 2052, type: "MATCH", question: "Perasaan",
                        pairs: [
                            { from: "Happy", to: "Senang" },
                            { from: "Sad", to: "Sedih" },
                            { from: "Angry", to: "Marah" },
                            { from: "Tired", to: "Lelah" },
                            { from: "Hungry", to: "Lapar" }
                        ]
                    },
                    // NEW STORY MODE
                    {
                        id: 2056, type: "SELECT", question: "Kenapa dia menangis?",
                        storyContext: {
                            image: "/mascot_head.png",
                            speaker: "Vikram",
                            text: "Conversation",
                            dialogue: [
                                { speaker: "Vikram", text: "Why are you crying?", side: "right", image: "/boy_head.png" },
                                { speaker: "Girl", text: "I am sad.", side: "left", image: "/girl_head.png" },
                                { speaker: "Vikram", text: "Don't be sad.", side: "right", image: "/boy_head.png" }
                            ]
                        },
                        options: [
                            { id: 1, text: "She is sad", correct: true },
                            { id: 2, text: "She is happy", correct: false },
                            { id: 3, text: "She is hungry", correct: false }
                        ]
                    },
                    {
                        id: 2053, type: "SELECT", question: "Saya lapar 😋",
                        options: [
                            { id: 1, text: "I am hungry", correct: true },
                            { id: 2, text: "I am thirsty", correct: false },
                            { id: 3, text: "I am angry", correct: false }
                        ]
                    },
                    {
                        id: 2054, type: "ASSIST", question: "Susun: 'Kamu lelah'",
                        initialWords: ["You", "are", "tired", "happy"],
                        correctSentence: "You are tired"
                    },
                    {
                        id: 2055, type: "LISTEN", question: "Dengarkan:",
                        audioQuestion: "I am happy",
                        initialWords: ["I", "am", "happy", "sad"],
                        correctSentence: "I am happy"
                    }
                ]
            },
            // Block 6: Daily Routine (New)
            {
                id: 206, unitId: 2, order: 6, title: "Daily Routine", type: "VIDEO",
                challenges: [
                    {
                        id: 2061, type: "MATCH", question: "Kegiatan Harian",
                        pairs: [
                            { from: "Wake up", to: "Bangun" },
                            { from: "Sleep", to: "Tidur" },
                            { from: "Eat", to: "Makan" },
                            { from: "Drink", to: "Minum" },
                            { from: "Work", to: "Kerja" }
                        ]
                    },
                    {
                        id: 2062, type: "SELECT", question: "Saya bangun pagi...",
                        options: [
                            { id: 1, text: "I wake up", correct: true },
                            { id: 2, text: "I sleep", correct: false },
                            { id: 3, text: "I eat", correct: false }
                        ]
                    },
                    {
                        id: 2063, type: "ASSIST", question: "Susun: 'Saya tidur malam'",
                        initialWords: ["I", "sleep", "at", "night", "morning"],
                        correctSentence: "I sleep at night"
                    }
                ]
            },
            // Block 7: Feelings & Emotions 2
            {
                id: 207, unitId: 2, order: 7, title: "More Feelings", type: "STAR",
                challenges: [
                    {
                        id: 2071, type: "MATCH", question: "Emosi Lain",
                        pairs: [
                            { from: "Scared", to: "Takut" },
                            { from: "Excited", to: "Bersemangat" },
                            { from: "Bored", to: "Bosan" },
                            { from: "Hungry", to: "Lapar" },
                            { from: "Thirsty", to: "Haus" }
                        ]
                    },
                    {
                        id: 2072, type: "SELECT", question: "Saya lapar...",
                        options: [
                            { id: 1, text: "I am hungry", correct: true },
                            { id: 2, text: "I am thirsty", correct: false },
                            { id: 3, text: "I am full", correct: false }
                        ]
                    }
                ]
            },
            // Block 8: Review My World
            {
                id: 208, unitId: 2, order: 8, title: "Review: My World", type: "HEADSET",
                challenges: [
                    {
                        id: 2081, type: "MATCH", question: "Review Unit 2",
                        pairs: [
                            { from: "Mother", to: "Ibu" },
                            { from: "House", to: "Rumah" },
                            { from: "Cat", to: "Kucing" },
                            { from: "Happy", to: "Senang" },
                            { from: "Sleep", to: "Tidur" }
                        ]
                    },
                    {
                        id: 2082, type: "SELECT", question: "Dimana Ayah?",
                        options: [
                            { id: 1, text: "Where is Father?", correct: true },
                            { id: 2, text: "Who is Father?", correct: false },
                            { id: 3, text: "When is Father?", correct: false }
                        ]
                    }
                ]
            }
        ]
    },

    // --------------------------------------------------------------------------------
    // UNIT 3: FOOD & DRINK
    // --------------------------------------------------------------------------------
    {
        id: 3,
        title: "Unit 3: Food & Drink",
        description: "Makanan, Minuman, Rasa, Memesan",
        guidebookContent: `
# Food & Drink 🍔
 
Enaknya makan apa ya?
 
## 1. Meals (Waktu Makan)
- **Breakfast** = Sarapan 🌅
- **Lunch** = Makan Siang ☀️
- **Dinner** = Makan Malam 🌙
 
## 2. Ordering (Memesan)
Gunakan **"I would like..."** agar lebih sopan daripada "I want".
- "I would like fried rice, please."
 
## 3. Tastes (Rasa)
- **Sweet** = Manis
- **Spicy** = Pedas 🌶️
- **Salty** = Asin
`,
        lessons: [
            // Block 1: Fruits & Veggies
            {
                id: 31, unitId: 3, order: 1, type: "STAR", title: "Fruits & Veggies",
                challenges: [
                    {
                        id: 311, type: "MATCH", question: "Buah & Sayur",
                        pairs: [
                            { from: "Apple", to: "Apel" },
                            { from: "Banana", to: "Pisang" },
                            { from: "Carrot", to: "Wortel" },
                            { from: "Tomato", to: "Tomat" },
                            { from: "Orange", to: "Jeruk" }
                        ]
                    },
                    {
                        id: 312, type: "SELECT", question: "Wortel warnanya...",
                        options: [
                            { id: 1, text: "Orange", correct: true },
                            { id: 2, text: "Blue", correct: false },
                            { id: 3, text: "Purple", correct: false }
                        ]
                    },
                    {
                        id: 313, type: "MATCH", question: "Sayuran",
                        pairs: [
                            { from: "Potato", to: "Kentang" },
                            { from: "Tomato", to: "Tomat" },
                            { from: "Corn", to: "Jagung" },
                            { from: "Broccoli", to: "Brokoli" },
                            { from: "Chili", to: "Cabai" }
                        ]
                    },
                    {
                        id: 314, type: "ASSIST", question: "Susun: 'Saya suka pisang'",
                        initialWords: ["I", "like", "banana", "apple"],
                        correctSentence: "I like banana"
                    },
                    {
                        id: 315, type: "SELECT", question: "Apel warnanya...",
                        options: [
                            { id: 1, text: "Red", correct: true },
                            { id: 2, text: "Blue", correct: false },
                            { id: 3, text: "Black", correct: false }
                        ]
                    },
                    // NEW STORY MODE
                    {
                        id: 316, type: "SELECT", question: "Buah apa yang dia suka?",
                        storyContext: {
                            image: "/mascot_head.png",
                            speaker: "Vikram",
                            text: "Conversation",
                            dialogue: [
                                { speaker: "Girl", text: "I want a fruit.", side: "left", image: "/girl_head.png" },
                                { speaker: "Vikram", text: "Do you like apples?", side: "right", image: "/boy_head.png" },
                                { speaker: "Girl", text: "Yes, I like red apples.", side: "left", image: "/girl_head.png" }
                            ]
                        },
                        options: [
                            { id: 1, text: "Red Apple", correct: true },
                            { id: 2, text: "Banana", correct: false },
                            { id: 3, text: "Grapes", correct: false }
                        ]
                    }
                ]
            },
            // Block 2: Meals
            {
                id: 32, unitId: 3, order: 2, type: "VIDEO", title: "Meals of Day",
                challenges: [
                    {
                        id: 321, type: "MATCH", question: "Waktu Makan",
                        pairs: [
                            { from: "Breakfast", to: "Sarapan" },
                            { from: "Lunch", to: "Makan Siang" },
                            { from: "Dinner", to: "Makan Malam" },
                            { from: "Snack", to: "Cemilan" },
                            { from: "Midnight", to: "Tengah Malam" }
                        ]
                    },
                    {
                        id: 322, type: "ASSIST", question: "Susun: 'Saya makan sarapan'",
                        initialWords: ["I", "eat", "breakfast", "dinner"],
                        correctSentence: "I eat breakfast"
                    },
                    {
                        id: 323, type: "SELECT", question: "Kapan makan malam?",
                        options: [
                            { id: 1, text: "Night", correct: true },
                            { id: 2, text: "Morning", correct: false },
                            { id: 3, text: "Noon", correct: false }
                        ]
                    },
                    {
                        id: 324, type: "LISTEN", question: "Dengarkan:",
                        audioQuestion: "Lunch is ready",
                        initialWords: ["Lunch", "is", "ready", "dinner"],
                        correctSentence: "Lunch is ready"
                    },
                    {
                        id: 325, type: "MATCH", question: "Jam Makan",
                        pairs: [
                            { from: "7 AM", to: "Sarapan" },
                            { from: "12 PM", to: "Makan Siang" },
                            { from: "7 PM", to: "Makan Malam" },
                            { from: "Snack", to: "Cemilan" },
                            { from: "Coffee", to: "Ngopi" }
                        ]
                    }
                ]
            },
            // Block 3: Ordering
            {
                id: 33, unitId: 3, order: 3, type: "PRACTICE", title: "Restaurant",
                challenges: [
                    {
                        id: 331, type: "SELECT", question: "Pelayan membawakan...",
                        options: [
                            { id: 1, text: "The Menu", correct: true },
                            { id: 2, text: " The Car", correct: false },
                            { id: 3, text: "The Bed", correct: false }
                        ]
                    },
                    {
                        id: 332, type: "LISTEN", question: "Dengarkan pesanan:",
                        audioQuestion: "I would like chicken",
                        initialWords: ["I", "would", "like", "chicken", "beef", "want"],
                        correctSentence: "I would like chicken"
                    },
                    // NEW STORY MODE
                    {
                        id: 336, type: "SELECT", question: "Apa yang dipesan pelanggan?",
                        storyContext: {
                            image: "/mascot_head.png",
                            speaker: "Waiter",
                            text: "Conversation",
                            dialogue: [
                                { speaker: "Waiter", text: "Hello, what would you like?", side: "left", image: "/mascot_head.png" },
                                { speaker: "Customer", text: "I would like fried rice.", side: "right", image: "/boy_head.png" },
                                { speaker: "Waiter", text: "Anything to drink?", side: "left", image: "/mascot_head.png" },
                                { speaker: "Customer", text: "Water, please.", side: "right", image: "/boy_head.png" }
                            ]
                        },
                        options: [
                            { id: 1, text: "Fried Rice & Water", correct: true },
                            { id: 2, text: "Chicken & Cola", correct: false },
                            { id: 3, text: "Pizza & Milk", correct: false }
                        ]
                    },
                    {
                        id: 333, type: "SELECT", question: "Sopan santun meminta...",
                        options: [
                            { id: 1, text: "I would like...", correct: true },
                            { id: 2, text: "I want...", correct: false },
                            { id: 3, text: "Give me...", correct: false }
                        ]
                    },
                    {
                        id: 334, type: "ASSIST", question: "Susun: 'Saya mau air'",
                        initialWords: ["I", "would", "like", "water", "fire"],
                        correctSentence: "I would like water"
                    },
                    {
                        id: 335, type: "MATCH", question: "Di Restoran",
                        pairs: [
                            { from: "Menu", to: "Daftar Menu" },
                            { from: "Chef", to: "Koki" },
                            { from: "Waiter", to: "Pelayan (Lk)" },
                            { from: "Waitress", to: "Pelayan (Pr)" },
                            { from: "Bill", to: "Tagihan" }
                        ]
                    }
                ]
            },
            // Block 4: Tastes
            {
                id: 34, unitId: 3, order: 4, type: "STORY", title: "Tastes",
                challenges: [
                    {
                        id: 341, type: "MATCH", question: "Rasa",
                        pairs: [
                            { from: "Sweet", to: "Manis" },
                            { from: "Spicy", to: "Pedas" },
                            { from: "Sour", to: "Asam" },
                            { from: "Bitter", to: "Pahit" },
                            { from: "Salty", to: "Asin" }
                        ]
                    },
                    {
                        id: 342, type: "SELECT", question: "Cabai itu...",
                        options: [
                            { id: 1, text: "Spicy", correct: true },
                            { id: 2, text: "Sweet", correct: false },
                            { id: 3, text: "Cold", correct: false }
                        ]
                    },
                    {
                        id: 343, type: "LISTEN", question: "Dengarkan:",
                        audioQuestion: "This soup is salty",
                        initialWords: ["This", "soup", "is", "salty", "sweet"],
                        correctSentence: "This soup is salty"
                    },
                    {
                        id: 344, type: "MATCH", question: "Contoh Rasa",
                        pairs: [
                            { from: "Candy", to: "Manis" },
                            { from: "Lemon", to: "Asam" },
                            { from: "Coffee", to: "Pahit" },
                            { from: "Salt", to: "Asin" },
                            { from: "Chili", to: "Pedas" }
                        ]
                    },
                    {
                        id: 345, type: "ASSIST", question: "Susun: 'Kopi ini pahit'",
                        initialWords: ["This", "coffee", "is", "bitter", "sweet"],
                        correctSentence: "This coffee is bitter"
                    },
                    // NEW STORY MODE
                    {
                        id: 346, type: "SELECT", question: "Bagaimana rasa mie tersebut?",
                        storyContext: {
                            image: "/mascot_head.png",
                            speaker: "Vikram",
                            text: "Conversation",
                            dialogue: [
                                { speaker: "Vikram", text: "This noodle is very spicy!", side: "right", image: "/boy_head.png" },
                                { speaker: "Girl", text: "Really? Do you like it?", side: "left", image: "/girl_head.png" },
                                { speaker: "Vikram", text: "No, I need water.", side: "right", image: "/boy_head.png" }
                            ]
                        },
                        options: [
                            { id: 1, text: "It is spicy", correct: true },
                            { id: 2, text: "It is sweet", correct: false },
                            { id: 3, text: "It is cold", correct: false }
                        ]
                    }
                ]
            },
            // Block 5: Cooking
            {
                id: 35, unitId: 3, order: 5, type: "HEADSET", title: "Cooking",
                challenges: [
                    {
                        id: 351, type: "MATCH", question: "Memasak",
                        pairs: [
                            { from: "Cook", to: "Masak" },
                            { from: "Fry", to: "Goreng" },
                            { from: "Boil", to: "Rebus" },
                            { from: "Cut", to: "Potong" },
                            { from: "Wash", to: "Cuci" }
                        ]
                    },
                    {
                        id: 352, type: "ASSIST", question: "Susun: 'Saya goreng telur'",
                        initialWords: ["I", "fry", "an", "egg", "boil"],
                        correctSentence: "I fry an egg"
                    },
                    {
                        id: 353, type: "SELECT", question: "Alat untuk memotong?",
                        options: [
                            { id: 1, text: "Knife", correct: true },
                            { id: 2, text: "Spoon", correct: false },
                            { id: 3, text: "Fork", correct: false }
                        ]
                    },
                    {
                        id: 354, type: "MATCH", question: "Alat Dapur",
                        pairs: [
                            { from: "Knife", to: "Pisau" },
                            { from: "Spoon", to: "Sendok" },
                            { from: "Fork", to: "Garpu" },
                            { from: "Pan", to: "Wajan" },
                            { from: "Plate", to: "Piring" }
                        ]
                    },
                    {
                        id: 355, type: "LISTEN", question: "Dengarkan:",
                        audioQuestion: "Wash the vegetables",
                        initialWords: ["Wash", "the", "vegetables", "fruit"],
                        correctSentence: "Wash the vegetables"
                    }
                ]
            }
        ]
    },

    // --------------------------------------------------------------------------------
    // UNIT 4: TIME & ROUTINE
    // --------------------------------------------------------------------------------
    {
        id: 4,
        title: "Unit 4: My Daily Life",
        description: "Jam, Hari, Rutinitas Pagi, Sekolah/Kerja",
        guidebookContent: `
# Time & Routine ⏰
 
Mengatur waktu itu penting! 
 
## 1. Days (Hari)
- Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.
 
## 2. Telling Time (Jam)
- **7:00** = Seven o'clock
- **7:30** = Half past seven
 
## 3. Frequency (Seberapa Sering)
- **Always** = Selalu (100%)
- **Usually** = Biasanya (80%)
- **Sometimes** = Kadang-kadang (50%)
- **Never** = Tidak pernah (0%)
`,
        lessons: [
            // Block 1: Days
            {
                id: 41, unitId: 4, order: 1, type: "STAR", title: "Days & Months",
                challenges: [
                    {
                        id: 411, type: "MATCH", question: "Hari",
                        pairs: [
                            { from: "Monday", to: "Senin" },
                            { from: "Sunday", to: "Minggu" },
                            { from: "Friday", to: "Jumat" },
                            { from: "Wednesday", to: "Rabu" },
                            { from: "Saturday", to: "Sabtu" }
                        ]
                    }
                ]
            },
            // Block 2: Telling Time
            {
                id: 42, unitId: 4, order: 2, type: "VIDEO", title: "Telling Time",
                challenges: [
                    {
                        id: 421, type: "SELECT", question: "Jam berapa ini? (9:00)",
                        options: [
                            { id: 1, text: "Nine o'clock", correct: true },
                            { id: 2, text: "Ten o'clock", correct: false },
                            { id: 3, text: "Noon", correct: false }
                        ]
                    }
                ]
            },
            // Block 3: Morning Routine
            {
                id: 43, unitId: 4, order: 3, type: "PRACTICE", title: "Morning Routine",
                challenges: [
                    {
                        id: 431, type: "MATCH", question: "Rutinitas Pagi",
                        pairs: [
                            { from: "Wake up", to: "Bangun" },
                            { from: "Shower", to: "Mandi" },
                            { from: "Brush teeth", to: "Sikat gigi" },
                            { from: "Breakfast", to: "Sarapan" },
                            { from: "Get dressed", to: "Berpakaian" }
                        ]
                    }
                ]
            },
            // Block 4: Work & School
            {
                id: 44, unitId: 4, order: 4, type: "STORY", title: "Work & School",
                challenges: [
                    {
                        id: 441, type: "SELECT", question: "Saya belajar di...",
                        options: [
                            { id: 1, text: "School", correct: true },
                            { id: 2, text: "Hospital", correct: false },
                            { id: 3, text: "Park", correct: false }
                        ]
                    }
                ]
            },
            // Block 5: Frequency
            {
                id: 45, unitId: 4, order: 5, type: "HEADSET", title: "Frequency",
                challenges: [
                    {
                        id: 451, type: "MATCH", question: "Seberapa Sering",
                        pairs: [
                            { from: "Always", to: "Selalu" },
                            { from: "Never", to: "Tidak pernah" },
                            { from: "Sometimes", to: "Kadang" },
                            { from: "Usually", to: "Biasanya" },
                            { from: "Rarely", to: "Jarang" }
                        ]
                    }
                ]
            }
        ]
    },

    // --------------------------------------------------------------------------------
    // UNIT 5: GOING PLACES
    // --------------------------------------------------------------------------------
    {
        id: 5,
        title: "Unit 5: Travel & City",
        description: "Tempat, Transportasi, Arah, Cuaca",
        guidebookContent: `
# Travel & City ✈️
 
Ayo jalan-jalan!
 
## 1. Places (Tempat)
- **School** = Sekolah
- **Hospital** = Rumah Sakit
- **Bank** = Bank
- **Airport** = Bandara
 
## 2. Directions (Arah)
- **Turn Left** = Belok Kiri ⬅️
- **Turn Right** = Belok Kanan ➡️
- **Go Straight** = Lurus ⬆️
 
## 3. Weather (Cuaca)
- **Sunny** = Cerah ☀️
- **Rainy** = Hujan 🌧️
- **SNowy** = Bersalju ❄️
`,
        lessons: [
            // Block 1: Places
            {
                id: 51, unitId: 5, order: 1, type: "STAR", title: "Places in Town",
                challenges: [
                    {
                        id: 511, type: "MATCH", question: "Tempat",
                        pairs: [
                            { from: "School", to: "Sekolah" },
                            { from: "Hospital", to: "RS" },
                            { from: "Bank", to: "Bank" },
                            { from: "Park", to: "Taman" },
                            { from: "Market", to: "Pasar" }
                        ]
                    }
                ]
            },
            // Block 2: Transportation
            {
                id: 52, unitId: 5, order: 2, type: "VIDEO", title: "Transportation",
                challenges: [
                    {
                        id: 521, type: "SELECT", question: "Pesawat terbang?",
                        options: [
                            { id: 1, text: "Airplane", correct: true },
                            { id: 2, text: "Bus", correct: false },
                            { id: 3, text: "Car", correct: false }
                        ]
                    }
                ]
            },
            // Block 3: Directions
            {
                id: 53, unitId: 5, order: 3, type: "PRACTICE", title: "Directions",
                challenges: [
                    {
                        id: 531, type: "MATCH", question: "Arah",
                        pairs: [
                            { from: "Left", to: "Kiri" },
                            { from: "Right", to: "Kanan" },
                            { from: "Straight", to: "Lurus" },
                            { from: "Stop", to: "Berhenti" },
                            { from: "Go", to: "Jalan" }
                        ]
                    }
                ]
            },
            // Block 4: Hotel
            {
                id: 54, unitId: 5, order: 4, type: "STORY", title: "Booking a Hotel",
                challenges: [
                    {
                        id: 541, type: "SELECT", question: "Tempat tidur di hotel?",
                        options: [
                            { id: 1, text: "Room", correct: true },
                            { id: 2, text: "Lobby", correct: false },
                            { id: 3, text: "Kitchen", correct: false }
                        ]
                    }
                ]
            },
            // Block 5: Weather
            {
                id: 55, unitId: 5, order: 5, type: "HEADSET", title: "Weather",
                challenges: [
                    {
                        id: 551, type: "MATCH", question: "Cuaca",
                        pairs: [
                            { from: "Sunny", to: "Cerah" },
                            { from: "Rainy", to: "Hujan" },
                            { from: "Cloudy", to: "Berawan" },
                            { from: "Windy", to: "Berangin" },
                            { from: "Hot", to: "Panas" }
                        ]
                    }
                ]
            }
        ]
    },

    // --------------------------------------------------------------------------------
    // UNIT 6: SHOPPING & STYLE
    // --------------------------------------------------------------------------------
    {
        id: 6,
        title: "Unit 6: Shopping & Style",
        description: "Belanja, Baju, Ukuran, Harga",
        guidebookContent: `
# Shopping & Style 🛍️
 
Waktunya belanja!
 
## 1. Clothes (Pakaian)
- **Shirt** = Kemeja 👔
- **Pants** = Celana 👖
- **Shoes** = Sepatu 👞
- **Dress** = Gaun 👗
 
## 2. Sizes (Ukuran)
- **Small** (S) = Kecil
- **Medium** (M) = Sedang
- **Large** (L) = Besar
 
## 3. At the Store (Di Toko)
- **"How much is this?"** = Berapa harganya?
- **Expensive** = Mahal 💰
- **Cheap** = Murah 🏷️
`,
        lessons: [
            // Block 1: Clothes
            {
                id: 61, unitId: 6, order: 1, type: "STAR", title: "Clothes",
                challenges: [
                    {
                        id: 611, type: "MATCH", question: "Pakaian",
                        pairs: [
                            { from: "Shirt", to: "Kemeja" },
                            { from: "Pants", to: "Celana" },
                            { from: "Shoes", to: "Sepatu" },
                            { from: "Hat", to: "Topi" },
                            { from: "Dress", to: "Gaun" }
                        ]
                    }
                ]
            },
            // Block 2: Sizes
            {
                id: 62, unitId: 6, order: 2, type: "VIDEO", title: "Sizes & Colors",
                challenges: [
                    {
                        id: 621, type: "SELECT", question: "Ukuran 'Besar'?",
                        options: [
                            { id: 1, text: "Large", correct: true },
                            { id: 2, text: "Small", correct: false },
                            { id: 3, text: "Medium", correct: false }
                        ]
                    }
                ]
            },
            // Block 3: Store
            {
                id: 63, unitId: 6, order: 3, type: "PRACTICE", title: "At the Store",
                challenges: [
                    {
                        id: 631, type: "LISTEN", question: "Dengarkan:",
                        audioQuestion: "How much is this?",
                        initialWords: ["How", "much", "is", "this", "that", "price"],
                        correctSentence: "How much is this"
                    }
                ]
            },
            // Block 4: Money
            {
                id: 64, unitId: 6, order: 4, type: "STORY", title: "Money",
                challenges: [
                    {
                        id: 641, type: "MATCH", question: "Uang",
                        pairs: [
                            { from: "Dollar", to: "Dolar" },
                            { from: "Price", to: "Harga" },
                            { from: "Expensive", to: "Mahal" },
                            { from: "Cheap", to: "Murah" },
                            { from: "Change", to: "Kembalian" }
                        ]
                    }
                ]
            },
            // Block 5: Returns
            {
                id: 65, unitId: 6, order: 5, type: "HEADSET", title: "Returns",
                challenges: [
                    {
                        id: 651, type: "SELECT", question: "Barang rusak?",
                        options: [
                            { id: 1, text: "Broken", correct: true },
                            { id: 2, text: "New", correct: false },
                            { id: 3, text: "Good", correct: false }
                        ]
                    }
                ]
            }
        ]
    },

    // --------------------------------------------------------------------------------
    // UNIT 7: HOBBIES & INTERESTS
    // --------------------------------------------------------------------------------
    {
        id: 7,
        title: "Unit 7: Hobbies & Interests",
        description: "Olahraga, Musik, Film, Kemampuan",
        guidebookContent: `
# Hobbies & Interests 🎨
 
Apa hobi kamu?
 
## 1. Sports (Olahraga)
- **Soccer** = Sepakbola ⚽
- **Basketball** = Basket 🏀
- **Swimming** = Renang 🏊
 
## 2. Abilities (Kemampuan)
Gunakan **Can** (Bisa) dan **Cannot/Can't** (Tidak bisa).
- "I can swim" (Saya bisa renang)
- "I cannot dance" (Saya tidak bisa menari)
 
## 3. Likes (Kesukaan)
- **Love** = Sangat suka ❤️
- **Like** = Suka 👍
- **Hate** = Benci 👎
`,
        lessons: [
            // Block 1: Sports
            {
                id: 71, unitId: 7, order: 1, type: "STAR", title: "Sports",
                challenges: [
                    {
                        id: 711, type: "MATCH", question: "Olahraga",
                        pairs: [
                            { from: "Soccer", to: "Sepakbola" },
                            { from: "Running", to: "Lari" },
                            { from: "Swimming", to: "Renang" },
                            { from: "Basketball", to: "Basket" },
                            { from: "Badminton", to: "Bulu tangkis" }
                        ]
                    }
                ]
            },
            // Block 2: Music & Movies
            {
                id: 72, unitId: 7, order: 2, type: "VIDEO", title: "Music & Movies",
                challenges: [
                    {
                        id: 721, type: "SELECT", question: "Film lucu?",
                        options: [
                            { id: 1, text: "Comedy", correct: true },
                            { id: 2, text: "Horror", correct: false },
                            { id: 3, text: "Action", correct: false }
                        ]
                    }
                ]
            },
            // Block 3: Weekend
            {
                id: 73, unitId: 7, order: 3, type: "PRACTICE", title: "Weekend Activities",
                challenges: [
                    {
                        id: 731, type: "MATCH", question: "Aktivitas",
                        pairs: [
                            { from: "Gaming", to: "Main Game" },
                            { from: "Hiking", to: "Mendaki" },
                            { from: "Picnic", to: "Piknik" },
                            { from: "Reading", to: "Membaca" },
                            { from: "Fishing", to: "Memancing" }
                        ]
                    }
                ]
            },
            // Block 4: Abilities
            {
                id: 74, unitId: 7, order: 4, type: "STORY", title: "Abilities",
                challenges: [
                    {
                        id: 741, type: "ASSIST", question: "Susun: 'Saya bisa renang'",
                        initialWords: ["I", "can", "swim", "cannot", "fly"],
                        correctSentence: "I can swim"
                    }
                ]
            },
            // Block 5: Likes/Dislikes
            {
                id: 75, unitId: 7, order: 5, type: "HEADSET", title: "Likes & Dislikes",
                challenges: [
                    {
                        id: 751, type: "SELECT", question: "Saya benci...",
                        options: [
                            { id: 1, text: "I hate", correct: true },
                            { id: 2, text: "I love", correct: false },
                            { id: 3, text: "I like", correct: false }
                        ]
                    }
                ]
            }
        ]
    },

    // --------------------------------------------------------------------------------
    // UNIT 8: HEALTH & BODY
    // --------------------------------------------------------------------------------
    {
        id: 8,
        title: "Unit 8: Health & Body",
        description: "Anggota Tubuh, Gejala Sakit, Dokter",
        guidebookContent: `
# Health & Body 🏥
 
Jaga kesehatanmu!
 
## 1. Body Parts (Tubuh)
- **Head** = Kepala
- **Hand** = Tangan
- **Stomach** = Perut
- **Leg** = Kaki
 
## 2. Symptoms (Gejala)
- **Headache** = Sakit kepala 🤕
- **Fever** = Demam 🤒
- **Cough** = Batuk 😷
 
## 3. Pharmacy (Apotek)
- **Medicine** = Obat 💊
- **Vitamin** = Vitamin
`,
        lessons: [
            // Block 1: Body Parts
            {
                id: 81, unitId: 8, order: 1, type: "STAR", title: "Body Parts",
                challenges: [
                    {
                        id: 811, type: "MATCH", question: "Anggota Tubuh",
                        pairs: [
                            { from: "Head", to: "Kepala" },
                            { from: "Hand", to: "Tangan" },
                            { from: "Leg", to: "Kaki" },
                            { from: "Eye", to: "Mata" },
                            { from: "Ear", to: "Telinga" }
                        ]
                    }
                ]
            },
            // Block 2: Symptoms
            {
                id: 82, unitId: 8, order: 2, type: "VIDEO", title: "Symptoms",
                challenges: [
                    {
                        id: 821, type: "SELECT", question: "Saya demam",
                        options: [
                            { id: 1, text: "I have a fever", correct: true },
                            { id: 2, text: "I am happy", correct: false },
                            { id: 3, text: "I hurt my leg", correct: false }
                        ]
                    }
                ]
            },
            // Block 3: Pharmacy
            {
                id: 83, unitId: 8, order: 3, type: "PRACTICE", title: "At the Pharmacy",
                challenges: [
                    {
                        id: 831, type: "MATCH", question: "Apotek",
                        pairs: [
                            { from: "Medicine", to: "Obat" },
                            { from: "Pill", to: "Pil" },
                            { from: "Vitamin", to: "Vitamin" },
                            { from: "Prescription", to: "Resep" },
                            { from: "Bandage", to: "Perban" }
                        ]
                    }
                ]
            },
            // Block 4: Doctor
            {
                id: 84, unitId: 8, order: 4, type: "STORY", title: "Doctor's Visit",
                challenges: [
                    {
                        id: 841, type: "SELECT", question: "Dokter bilang...",
                        storyContext: { image: "/mascot.svg", speaker: "Doctor", text: "You need to rest." },
                        options: [
                            { id: 1, text: "Istirahat", correct: true },
                            { id: 2, text: "Lari", correct: false },
                            { id: 3, text: "Kerja", correct: false }
                        ]
                    }
                ]
            },
            // Block 5: Habits
            {
                id: 85, unitId: 8, order: 5, type: "HEADSET", title: "Healthy Habits",
                challenges: [
                    {
                        id: 851, type: "MATCH", question: "Kebiasaan Sehat",
                        pairs: [
                            { from: "Exercise", to: "Olahraga" },
                            { from: "Sleep well", to: "Tidur nyenyak" },
                            { from: "Drink water", to: "Minum air" },
                            { from: "Wash hands", to: "Cuci tangan" },
                            { from: "Eat fruit", to: "Makan buah" }
                        ]
                    }
                ]
            }
        ]
    },

    // --------------------------------------------------------------------------------
    // UNIT 9: TIME TRAVELER (PAST)
    // --------------------------------------------------------------------------------
    {
        id: 9,
        title: "Unit 9: My Past",
        description: "Masa Lalu, Kemarin, Cerita Liburan",
        guidebookContent: `
# My Past (Masa Lalu) 🕰️
 
Belajar menceritakan apa yang SUDAH terjadi.
 
## 1. Past Time (Waktu Lampau)
- **Yesterday** = Kemarin
- **Last night** = Tadi malam
- **Last week** = Minggu lalu
 
## 2. Regular Verbs (+ed)
Banyak kata kerja tinggal ditambah **-ed**:
- Walk -> **Walked** (Berjalan)
- Cook -> **Cooked** (Memasak)
- Play -> **Played** (Bermain)
 
## 3. Irregular Verbs (Tidak Beraturan)
Hati-hati! Kata-kata ini berubah total:
- Go -> **Went** (Pergi)
- Eat -> **Ate** (Makan)
- Sleep -> **Slept** (Tidur)
`,
        lessons: [
            // Block 1: Yesterday
            {
                id: 91, unitId: 9, order: 1, type: "STAR", title: "Yesterday",
                challenges: [
                    {
                        id: 911, type: "MATCH", question: "Waktu Lampau",
                        pairs: [
                            { from: "Yesterday", to: "Kemarin" },
                            { from: "Last night", to: "Tadi malam" },
                            { from: "Last week", to: "Minggu lalu" },
                            { from: "Last year", to: "Tahun lalu" },
                            { from: "Today", to: "Hari ini" }
                        ]
                    }
                ]
            },
            // Block 2: Regular Verbs
            {
                id: 92, unitId: 9, order: 2, type: "VIDEO", title: "Regular Verbs",
                challenges: [
                    {
                        id: 921, type: "SELECT", question: "Saya bermain bola kemarin",
                        options: [
                            { id: 1, text: "I played soccer", correct: true },
                            { id: 2, text: "I play soccer", correct: false },
                            { id: 3, text: "I playing soccer", correct: false }
                        ]
                    }
                ]
            },
            // Block 3: Irregular Verbs
            {
                id: 93, unitId: 9, order: 3, type: "PRACTICE", title: "Irregular Verbs",
                challenges: [
                    {
                        id: 931, type: "MATCH", question: "Perubahan Kata",
                        pairs: [
                            { from: "Go -> Went", to: "Pergi" },
                            { from: "Eat -> Ate", to: "Makan" },
                            { from: "Sleep -> Slept", to: "Tidur" },
                            { from: "Drink -> Drank", to: "Minum" },
                            { from: "See -> Saw", to: "Melihat" }
                        ]
                    }
                ]
            },
            // Block 4: Vacation
            {
                id: 94, unitId: 9, order: 4, type: "STORY", title: "Vacation Stories",
                challenges: [
                    {
                        id: 941, type: "ASSIST", question: "Susun: 'Saya pergi ke Bali'",
                        initialWords: ["I", "went", "to", "Bali", "go", "gone"],
                        correctSentence: "I went to Bali"
                    }
                ]
            },
            // Block 5: Childhood
            {
                id: 95, unitId: 9, order: 5, type: "HEADSET", title: "Childhood Memories",
                challenges: [
                    {
                        id: 951, type: "SELECT", question: "Saat saya muda...",
                        options: [
                            { id: 1, text: "When I was young", correct: true },
                            { id: 2, text: "When I am young", correct: false },
                            { id: 3, text: "When I will be young", correct: false }
                        ]
                    }
                ]
            }
        ]
    },

    // --------------------------------------------------------------------------------
    // UNIT 10: FUTURE PLANS
    // --------------------------------------------------------------------------------
    {
        id: 10,
        title: "Unit 10: Future Plans",
        description: "Masa Depan, Rencana, Cita-cita",
        guidebookContent: `
# Future Plans 🚀
 
Apa rencanamu besok?
 
## 1. Future Time (Waktu Depan)
- **Tomorrow** = Besok
- **Next week** = Minggu depan
- **Tonight** = Malam ini
 
## 2. Will vs Going to
- **Will**: Janji / Spontan ("I will help you")
- **Going to**: Rencana pasti ("I am going to Bali")
 
## 3. Dreams (Cita-cita)
- "I want to be a pilot" (Saya ingin jadi pilot)
- "I will be rich" (Saya akan kaya)
`,
        lessons: [
            // Block 1: Next Week
            {
                id: 1001, unitId: 10, order: 1, type: "STAR", title: "Next Week",
                challenges: [
                    {
                        id: 10011, type: "MATCH", question: "Waktu Depan",
                        pairs: [
                            { from: "Tomorrow", to: "Besok" },
                            { from: "Next Week", to: "Minggu Depan" },
                            { from: "Next Month", to: "Bulan Depan" },
                            { from: "Tonight", to: "Nanti Malam" },
                            { from: "Soon", to: "Segera" }
                        ]
                    }
                ]
            },
            // Block 2: Going To
            {
                id: 1002, unitId: 10, order: 2, type: "VIDEO", title: "Going To",
                challenges: [
                    {
                        id: 10021, type: "ASSIST", question: "Susun: 'Saya akan makan'",
                        initialWords: ["I", "am", "going", "to", "eat", "will"],
                        correctSentence: "I am going to eat"
                    }
                ]
            },
            // Block 3: Will
            {
                id: 1003, unitId: 10, order: 3, type: "PRACTICE", title: "Using Will",
                challenges: [
                    {
                        id: 10031, type: "SELECT", question: "Saya akan telepon kamu",
                        options: [
                            { id: 1, text: "I will call you", correct: true },
                            { id: 2, text: "I call you", correct: false },
                            { id: 3, text: "I called you", correct: false }
                        ]
                    }
                ]
            },
            // Block 4: Dreams
            {
                id: 1004, unitId: 10, order: 4, type: "STORY", title: "Dreams",
                challenges: [
                    {
                        id: 10041, type: "MATCH", question: "Cita-cita",
                        pairs: [
                            { from: "Pilot", to: "Pilot" },
                            { from: "Doctor", to: "Dokter" },
                            { from: "Rich", to: "Kaya" },
                            { from: "Singer", to: "Penyanyi" },
                            { from: "Teacher", to: "Guru" }
                        ]
                    }
                ]
            },
            // Block 5: Appointments
            {
                id: 1005, unitId: 10, order: 5, type: "HEADSET", title: "Appointments",
                challenges: [
                    {
                        id: 10051, type: "SELECT", question: "Ayo bertemu jam 5",
                        options: [
                            { id: 1, text: "Let's meet at 5", correct: true },
                            { id: 2, text: "Let's go at 5", correct: false },
                            { id: 3, text: "Meet me 5", correct: false }
                        ]
                    }
                ]
            }
        ]
    }
];

// --------------------------------------------------------------------------------
// SECTION DEFINITIONS
// --------------------------------------------------------------------------------
export interface Section {
    id: number;
    title: string;
    description: string;
    unitIds: number[]; // Explicitly map units to sections
}

export const sectionsData: Section[] = [
    {
        id: 1,
        title: "Section 1: Newbie Explorer",
        description: "Start your journey!",
        unitIds: [1, 2, 3, 4, 5]
    },
    {
        id: 2,
        title: "Section 2: The Challenger",
        description: "Prove your skills!",
        unitIds: [6, 7, 8, 9, 10]
    }
];
