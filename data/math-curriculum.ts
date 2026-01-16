
import { Unit } from "./curriculum"; // Importing type from general curriculum file

// --------------------------------------------------------------------------------
// GRADE 1-6 SD MATH CURRICULUM (CORE OPERATIONS & FORMULAS)
// --------------------------------------------------------------------------------

export const mathCurriculumData: Unit[] = [
    // UNIT 1: Penjumlahan & Pengurangan (5 Lessons)
    {
        id: 5001,
        title: "Unit 1: Operasi Dasar (+ & -)",
        description: "Penjumlahan dan Pengurangan bilangan cacah.",
        guidebookContent: "# Penjumlahan & Pengurangan\n\nPenjumlahan adalah menggabungkan jumlah dua bilangan.\nPengurangan adalah mengambil sebagian dari suatu bilangan.",
        lessons: [
            {
                id: 500101, unitId: 5001, order: 1, title: "Penjumlahan Dasar", type: "STAR",
                challenges: [
                    { id: 5001011, type: "SELECT", question: "5 + 3 = ?", options: [{ id: 1, text: "8", correct: true }, { id: 2, text: "7", correct: false }, { id: 3, text: "9", correct: false }] },
                    { id: 5001012, type: "SELECT", question: "12 + 7 = ?", options: [{ id: 1, text: "19", correct: true }, { id: 2, text: "18", correct: false }, { id: 3, text: "20", correct: false }] },
                    { id: 5001013, type: "MATCH", question: "Pasangkan Hasil", pairs: [{ from: "2 + 3", to: "5" }, { from: "4 + 4", to: "8" }, { from: "6 + 1", to: "7" }, { from: "9 + 1", to: "10" }] }
                ]
            },
            {
                id: 500102, unitId: 5001, order: 2, title: "Penjumlahan Lanjutan", type: "PRACTICE",
                challenges: [
                    { id: 5001021, type: "SELECT", question: "15 + 8 = ?", options: [{ id: 1, text: "23", correct: true }, { id: 2, text: "22", correct: false }, { id: 3, text: "25", correct: false }] },
                    { id: 5001022, type: "SELECT", question: "27 + 13 = ?", options: [{ id: 1, text: "40", correct: true }, { id: 2, text: "39", correct: false }, { id: 3, text: "41", correct: false }] },
                    { id: 5001023, type: "MATCH", question: "Pasangkan", pairs: [{ from: "10 + 10", to: "20" }, { from: "25 + 5", to: "30" }, { from: "7 + 6", to: "13" }, { from: "100 + 50", to: "150" }] }
                ]
            },
            {
                id: 500103, unitId: 5001, order: 3, title: "Pengurangan Dasar", type: "STAR",
                challenges: [
                    { id: 5001031, type: "SELECT", question: "9 - 4 = ?", options: [{ id: 1, text: "5", correct: true }, { id: 2, text: "4", correct: false }, { id: 3, text: "6", correct: false }] },
                    { id: 5001032, type: "SELECT", question: "15 - 8 = ?", options: [{ id: 1, text: "7", correct: true }, { id: 2, text: "6", correct: false }, { id: 3, text: "8", correct: false }] },
                    { id: 5001033, type: "MATCH", question: "Pasangkan Pengurangan", pairs: [{ from: "10 - 5", to: "5" }, { from: "8 - 3", to: "5" }, { from: "12 - 4", to: "8" }] }
                ]
            },
            {
                id: 500104, unitId: 5001, order: 4, title: "Pengurangan Lanjutan", type: "PRACTICE",
                challenges: [
                    { id: 5001041, type: "SELECT", question: "30 - 12 = ?", options: [{ id: 1, text: "18", correct: true }, { id: 2, text: "22", correct: false }, { id: 3, text: "12", correct: false }] },
                    { id: 5001042, type: "SELECT", question: "50 - 25 = ?", options: [{ id: 1, text: "25", correct: true }, { id: 2, text: "20", correct: false }, { id: 3, text: "30", correct: false }] },
                    { id: 5001043, type: "MATCH", question: "Pasangkan", pairs: [{ from: "20 - 8", to: "12" }, { from: "50 - 25", to: "25" }, { from: "100 - 1", to: "99" }] }
                ]
            },
            {
                id: 500105, unitId: 5001, order: 5, title: "Campuran + & -", type: "STAR",
                challenges: [
                    { id: 5001051, type: "SELECT", question: "10 + 5 - 3 = ?", options: [{ id: 1, text: "12", correct: true }, { id: 2, text: "8", correct: false }, { id: 3, text: "15", correct: false }] },
                    { id: 5001052, type: "SELECT", question: "20 - 5 + 10 = ?", options: [{ id: 1, text: "25", correct: true }, { id: 2, text: "15", correct: false }, { id: 3, text: "30", correct: false }] },
                    { id: 5001053, type: "MATCH", question: "Hasil Campuran", pairs: [{ from: "5 + 5 - 2", to: "8" }, { from: "10 - 3 + 1", to: "8" }, { from: "7 + 3 - 5", to: "5" }] }
                ]
            }
        ]
    },


    // UNIT 2: Perkalian (5 Lessons)
    {
        id: 5002,
        title: "Unit 2: Perkalian (x)",
        description: "Menghafal perkalian 1 sampai 10.",
        guidebookContent: "# Perkalian\n\nPerkalian adalah penjumlahan berulang.\nContoh: 3 x 4 = 4 + 4 + 4 = 12.",
        lessons: [
            {
                id: 500201, unitId: 5002, order: 1, title: "Perkalian 1-3", type: "STAR", challenges: [
                    { id: 5002011, type: "SELECT", question: "2 x 3 = ?", options: [{ id: 1, text: "6", correct: true }, { id: 2, text: "5", correct: false }, { id: 3, text: "7", correct: false }] },
                    { id: 5002012, type: "SELECT", question: "3 x 3 = ?", options: [{ id: 1, text: "9", correct: true }, { id: 2, text: "6", correct: false }, { id: 3, text: "12", correct: false }] },
                    { id: 5002013, type: "MATCH", question: "Pasangkan", pairs: [{ from: "1 x 5", to: "5" }, { from: "2 x 4", to: "8" }, { from: "3 x 2", to: "6" }] }
                ]
            },
            {
                id: 500202, unitId: 5002, order: 2, title: "Perkalian 4-5", type: "PRACTICE", challenges: [
                    { id: 5002021, type: "SELECT", question: "4 x 5 = ?", options: [{ id: 1, text: "20", correct: true }, { id: 2, text: "15", correct: false }, { id: 3, text: "25", correct: false }] },
                    { id: 5002022, type: "SELECT", question: "5 x 5 = ?", options: [{ id: 1, text: "25", correct: true }, { id: 2, text: "20", correct: false }, { id: 3, text: "30", correct: false }] },
                    { id: 5002023, type: "MATCH", question: "Tabel 4-5", pairs: [{ from: "4 x 3", to: "12" }, { from: "5 x 4", to: "20" }, { from: "4 x 4", to: "16" }] }
                ]
            },
            {
                id: 500203, unitId: 5002, order: 3, title: "Perkalian 6-7", type: "STAR", challenges: [
                    { id: 5002031, type: "SELECT", question: "6 x 7 = ?", options: [{ id: 1, text: "42", correct: true }, { id: 2, text: "48", correct: false }, { id: 3, text: "36", correct: false }] },
                    { id: 5002032, type: "SELECT", question: "7 x 7 = ?", options: [{ id: 1, text: "49", correct: true }, { id: 2, text: "42", correct: false }, { id: 3, text: "56", correct: false }] },
                    { id: 5002033, type: "MATCH", question: "Tabel 6-7", pairs: [{ from: "6 x 6", to: "36" }, { from: "7 x 5", to: "35" }, { from: "6 x 8", to: "48" }] }
                ]
            },
            {
                id: 500204, unitId: 5002, order: 4, title: "Perkalian 8-9", type: "PRACTICE", challenges: [
                    { id: 5002041, type: "SELECT", question: "8 x 7 = ?", options: [{ id: 1, text: "56", correct: true }, { id: 2, text: "49", correct: false }, { id: 3, text: "63", correct: false }] },
                    { id: 5002042, type: "SELECT", question: "9 x 9 = ?", options: [{ id: 1, text: "81", correct: true }, { id: 2, text: "72", correct: false }, { id: 3, text: "90", correct: false }] },
                    { id: 5002043, type: "MATCH", question: "Tabel 8-9", pairs: [{ from: "8 x 8", to: "64" }, { from: "9 x 6", to: "54" }, { from: "8 x 9", to: "72" }] }
                ]
            },
            {
                id: 500205, unitId: 5002, order: 5, title: "Perkalian 10", type: "STAR", challenges: [
                    { id: 5002051, type: "SELECT", question: "10 x 7 = ?", options: [{ id: 1, text: "70", correct: true }, { id: 2, text: "17", correct: false }, { id: 3, text: "100", correct: false }] },
                    { id: 5002052, type: "SELECT", question: "10 x 10 = ?", options: [{ id: 1, text: "100", correct: true }, { id: 2, text: "20", correct: false }, { id: 3, text: "110", correct: false }] },
                    { id: 5002053, type: "MATCH", question: "Tabel 10", pairs: [{ from: "10 x 5", to: "50" }, { from: "10 x 8", to: "80" }, { from: "10 x 3", to: "30" }] }
                ]
            }
        ]
    },

    // UNIT 3: Pembagian (5 Lessons)
    {
        id: 5003,
        title: "Unit 3: Pembagian (:)",
        description: "Operasi kebalikan dari perkalian.",
        guidebookContent: "# Pembagian\n\nPembagian adalah pengurangan berulang sampai habis.\nContoh: 12 : 3 = 4.",
        lessons: [
            {
                id: 500301, unitId: 5003, order: 1, title: "Pembagian Mudah", type: "STAR", challenges: [
                    { id: 5003011, type: "SELECT", question: "10 : 2 = ?", options: [{ id: 1, text: "5", correct: true }, { id: 2, text: "4", correct: false }, { id: 3, text: "6", correct: false }] },
                    { id: 5003012, type: "SELECT", question: "12 : 3 = ?", options: [{ id: 1, text: "4", correct: true }, { id: 2, text: "3", correct: false }, { id: 3, text: "5", correct: false }] },
                    { id: 5003013, type: "MATCH", question: "Pasangkan", pairs: [{ from: "6 : 2", to: "3" }, { from: "8 : 4", to: "2" }, { from: "9 : 3", to: "3" }] }
                ]
            },
            {
                id: 500302, unitId: 5003, order: 2, title: "Pembagian Sedang", type: "PRACTICE", challenges: [
                    { id: 5003021, type: "SELECT", question: "20 : 4 = ?", options: [{ id: 1, text: "5", correct: true }, { id: 2, text: "4", correct: false }, { id: 3, text: "6", correct: false }] },
                    { id: 5003022, type: "SELECT", question: "25 : 5 = ?", options: [{ id: 1, text: "5", correct: true }, { id: 2, text: "4", correct: false }, { id: 3, text: "6", correct: false }] },
                    { id: 5003023, type: "MATCH", question: "Pasangkan", pairs: [{ from: "16 : 4", to: "4" }, { from: "18 : 6", to: "3" }, { from: "21 : 7", to: "3" }] }
                ]
            },
            {
                id: 500303, unitId: 5003, order: 3, title: "Pembagian Lanjutan", type: "STAR", challenges: [
                    { id: 5003031, type: "SELECT", question: "36 : 6 = ?", options: [{ id: 1, text: "6", correct: true }, { id: 2, text: "5", correct: false }, { id: 3, text: "7", correct: false }] },
                    { id: 5003032, type: "SELECT", question: "49 : 7 = ?", options: [{ id: 1, text: "7", correct: true }, { id: 2, text: "6", correct: false }, { id: 3, text: "8", correct: false }] },
                    { id: 5003033, type: "MATCH", question: "Pasangkan", pairs: [{ from: "42 : 6", to: "7" }, { from: "56 : 8", to: "7" }, { from: "63 : 9", to: "7" }] }
                ]
            },
            {
                id: 500304, unitId: 5003, order: 4, title: "Pembagian Besar", type: "PRACTICE", challenges: [
                    { id: 5003041, type: "SELECT", question: "64 : 8 = ?", options: [{ id: 1, text: "8", correct: true }, { id: 2, text: "7", correct: false }, { id: 3, text: "9", correct: false }] },
                    { id: 5003042, type: "SELECT", question: "81 : 9 = ?", options: [{ id: 1, text: "9", correct: true }, { id: 2, text: "8", correct: false }, { id: 3, text: "10", correct: false }] },
                    { id: 5003043, type: "MATCH", question: "Pasangkan", pairs: [{ from: "72 : 8", to: "9" }, { from: "100 : 10", to: "10" }, { from: "90 : 9", to: "10" }] }
                ]
            },
            {
                id: 500305, unitId: 5003, order: 5, title: "Pembagian Master", type: "STAR", challenges: [
                    { id: 5003051, type: "SELECT", question: "144 : 12 = ?", options: [{ id: 1, text: "12", correct: true }, { id: 2, text: "11", correct: false }, { id: 3, text: "13", correct: false }] },
                    { id: 5003052, type: "SELECT", question: "100 : 25 = ?", options: [{ id: 1, text: "4", correct: true }, { id: 2, text: "5", correct: false }, { id: 3, text: "3", correct: false }] },
                    { id: 5003053, type: "MATCH", question: "Pasangkan", pairs: [{ from: "50 : 10", to: "5" }, { from: "60 : 12", to: "5" }, { from: "80 : 20", to: "4" }] }
                ]
            }
        ]
    },

    // UNIT 4: Operasi Campuran (5 Lessons)
    {
        id: 5004,
        title: "Unit 4: Operasi Campuran",
        description: "Menggabungkan +, -, x, dan :.",
        guidebookContent: "# Aturan Operasi Hitung\n\nKerjakan Perkalian dan Pembagian dulu, baru Penjumlahan dan Pengurangan!\nKU-KA-BA-TA-KU (Kurung, Kali, Bagi, Tambah, Kurang)",
        lessons: [
            {
                id: 500401, unitId: 5004, order: 1, title: "Campuran + x", type: "STAR", challenges: [
                    { id: 5004011, type: "SELECT", question: "5 + 3 x 2 = ?", options: [{ id: 1, text: "11", correct: true }, { id: 2, text: "16", correct: false }, { id: 3, text: "10", correct: false }] },
                    { id: 5004012, type: "SELECT", question: "10 + 4 x 5 = ?", options: [{ id: 1, text: "30", correct: true }, { id: 2, text: "70", correct: false }, { id: 3, text: "25", correct: false }] },
                    { id: 5004013, type: "MATCH", question: "Pasangkan", pairs: [{ from: "2 + 3 x 4", to: "14" }, { from: "5 + 2 x 3", to: "11" }, { from: "1 + 9 x 1", to: "10" }] }
                ]
            },
            {
                id: 500402, unitId: 5004, order: 2, title: "Campuran - :", type: "PRACTICE", challenges: [
                    { id: 5004021, type: "SELECT", question: "20 - 12 : 3 = ?", options: [{ id: 1, text: "16", correct: true }, { id: 2, text: "2", correct: false }, { id: 3, text: "8", correct: false }] },
                    { id: 5004022, type: "SELECT", question: "15 - 10 : 2 = ?", options: [{ id: 1, text: "10", correct: true }, { id: 2, text: "2", correct: false }, { id: 3, text: "5", correct: false }] },
                    { id: 5004023, type: "MATCH", question: "Pasangkan", pairs: [{ from: "18 - 6 : 2", to: "15" }, { from: "20 - 8 : 4", to: "18" }, { from: "10 - 4 : 2", to: "8" }] }
                ]
            },
            {
                id: 500403, unitId: 5004, order: 3, title: "Dengan Kurung", type: "STAR", challenges: [
                    { id: 5004031, type: "SELECT", question: "(5 + 3) x 2 = ?", options: [{ id: 1, text: "16", correct: true }, { id: 2, text: "11", correct: false }, { id: 3, text: "14", correct: false }] },
                    { id: 5004032, type: "SELECT", question: "(20 - 5) : 3 = ?", options: [{ id: 1, text: "5", correct: true }, { id: 2, text: "3", correct: false }, { id: 3, text: "7", correct: false }] },
                    { id: 5004033, type: "MATCH", question: "Pasangkan", pairs: [{ from: "(2 + 3) x 4", to: "20" }, { from: "(10 - 2) : 2", to: "4" }, { from: "(6 + 6) : 3", to: "4" }] }
                ]
            },
            {
                id: 500404, unitId: 5004, order: 4, title: "Campuran Lengkap", type: "PRACTICE", challenges: [
                    { id: 5004041, type: "SELECT", question: "2 x 3 + 4 : 2 = ?", options: [{ id: 1, text: "8", correct: true }, { id: 2, text: "5", correct: false }, { id: 3, text: "10", correct: false }] },
                    { id: 5004042, type: "SELECT", question: "10 : 2 + 3 x 2 = ?", options: [{ id: 1, text: "11", correct: true }, { id: 2, text: "13", correct: false }, { id: 3, text: "16", correct: false }] },
                    { id: 5004043, type: "MATCH", question: "Pasangkan", pairs: [{ from: "4 x 2 + 6 : 3", to: "10" }, { from: "9 : 3 + 2 x 5", to: "13" }, { from: "8 - 2 x 2", to: "4" }] }
                ]
            },
            {
                id: 500405, unitId: 5004, order: 5, title: "Master Campuran", type: "STAR", challenges: [
                    { id: 5004051, type: "SELECT", question: "(10 + 5) x 2 - 10 = ?", options: [{ id: 1, text: "20", correct: true }, { id: 2, text: "30", correct: false }, { id: 3, text: "15", correct: false }] },
                    { id: 5004052, type: "SELECT", question: "100 : (5 + 5) + 5 = ?", options: [{ id: 1, text: "15", correct: true }, { id: 2, text: "10", correct: false }, { id: 3, text: "20", correct: false }] },
                    { id: 5004053, type: "MATCH", question: "Pasangkan", pairs: [{ from: "(8 + 2) x (3 + 2)", to: "50" }, { from: "100 : 10 + 10", to: "20" }, { from: "(15 - 5) x 3", to: "30" }] }
                ]
            }
        ]
    },

    // UNIT 5: Bangun Datar (5 Lessons)
    {
        id: 5005,
        title: "Unit 5: Rumus Bangun Datar",
        description: "Luas dan Keliling Persegi, Persegi Panjang, Segitiga.",
        guidebookContent: "# Bangun Datar\n\nPersegi: L = s x s, K = 4 x s\nPersegi Panjang: L = p x l, K = 2 x (p + l)\nSegitiga: L = 1/2 x a x t",
        lessons: [
            {
                id: 500501, unitId: 5005, order: 1, title: "Luas Persegi", type: "STAR", challenges: [
                    { id: 5005011, type: "SELECT", question: "Rumus Luas Persegi (sisi = s)?", options: [{ id: 1, text: "L = s x s", correct: true }, { id: 2, text: "L = 4 x s", correct: false }, { id: 3, text: "L = p x l", correct: false }] },
                    { id: 5005012, type: "SELECT", question: "Sisi = 5 cm. Berapa Luasnya?", options: [{ id: 1, text: "25 cm²", correct: true }, { id: 2, text: "20 cm²", correct: false }, { id: 3, text: "10 cm²", correct: false }] },
                    { id: 5005013, type: "MATCH", question: "Pasangkan Luas", pairs: [{ from: "s = 3", to: "9 cm²" }, { from: "s = 4", to: "16 cm²" }, { from: "s = 6", to: "36 cm²" }] }
                ]
            },
            {
                id: 500502, unitId: 5005, order: 2, title: "Keliling Persegi", type: "PRACTICE", challenges: [
                    { id: 5005021, type: "SELECT", question: "Rumus Keliling Persegi?", options: [{ id: 1, text: "K = 4 x s", correct: true }, { id: 2, text: "K = s x s", correct: false }, { id: 3, text: "K = 2 x s", correct: false }] },
                    { id: 5005022, type: "SELECT", question: "Sisi = 7 cm. Kelilingnya?", options: [{ id: 1, text: "28 cm", correct: true }, { id: 2, text: "49 cm", correct: false }, { id: 3, text: "14 cm", correct: false }] },
                    { id: 5005023, type: "MATCH", question: "Pasangkan Keliling", pairs: [{ from: "s = 5", to: "20 cm" }, { from: "s = 10", to: "40 cm" }, { from: "s = 8", to: "32 cm" }] }
                ]
            },
            {
                id: 500503, unitId: 5005, order: 3, title: "Luas Persegi Panjang", type: "STAR", challenges: [
                    { id: 5005031, type: "SELECT", question: "Rumus Luas Persegi Panjang?", options: [{ id: 1, text: "L = p x l", correct: true }, { id: 2, text: "L = 2 x (p + l)", correct: false }, { id: 3, text: "L = 4 x s", correct: false }] },
                    { id: 5005032, type: "SELECT", question: "p = 8 cm, l = 5 cm. Luasnya?", options: [{ id: 1, text: "40 cm²", correct: true }, { id: 2, text: "26 cm²", correct: false }, { id: 3, text: "13 cm²", correct: false }] },
                    { id: 5005033, type: "MATCH", question: "Pasangkan", pairs: [{ from: "p=4, l=3", to: "12 cm²" }, { from: "p=6, l=2", to: "12 cm²" }, { from: "p=10, l=5", to: "50 cm²" }] }
                ]
            },
            {
                id: 500504, unitId: 5005, order: 4, title: "Keliling Persegi Panjang", type: "PRACTICE", challenges: [
                    { id: 5005041, type: "SELECT", question: "Rumus Keliling Persegi Panjang?", options: [{ id: 1, text: "K = 2 x (p + l)", correct: true }, { id: 2, text: "K = p x l", correct: false }, { id: 3, text: "K = 4 x s", correct: false }] },
                    { id: 5005042, type: "SELECT", question: "p = 10 cm, l = 4 cm. Kelilingnya?", options: [{ id: 1, text: "28 cm", correct: true }, { id: 2, text: "40 cm²", correct: false }, { id: 3, text: "14 cm", correct: false }] },
                    { id: 5005043, type: "MATCH", question: "Pasangkan", pairs: [{ from: "p=5, l=3", to: "16 cm" }, { from: "p=7, l=2", to: "18 cm" }, { from: "p=6, l=6", to: "24 cm" }] }
                ]
            },
            {
                id: 500505, unitId: 5005, order: 5, title: "Luas Segitiga", type: "STAR", challenges: [
                    { id: 5005051, type: "SELECT", question: "Rumus Luas Segitiga?", options: [{ id: 1, text: "L = ½ x a x t", correct: true }, { id: 2, text: "L = a x t", correct: false }, { id: 3, text: "L = 3 x s", correct: false }] },
                    { id: 5005052, type: "SELECT", question: "Alas = 10 cm, Tinggi = 6 cm. Luasnya?", options: [{ id: 1, text: "30 cm²", correct: true }, { id: 2, text: "60 cm²", correct: false }, { id: 3, text: "16 cm²", correct: false }] },
                    { id: 5005053, type: "MATCH", question: "Pasangkan", pairs: [{ from: "a=8, t=4", to: "16 cm²" }, { from: "a=12, t=5", to: "30 cm²" }, { from: "a=6, t=6", to: "18 cm²" }] }
                ]
            }
        ]
    },


    // UNIT 6: Lingkaran (5 Lessons)
    {
        id: 5006,
        title: "Unit 6: Rumus Lingkaran",
        description: "Mengenal Pi (π), Jari-jari (r), dan Diameter (d).",
        guidebookContent: "# Lingkaran\n\nLuas = π x r²\nKeliling = 2 x π x r\nπ = 22/7 atau 3.14",
        lessons: [
            {
                id: 500601, unitId: 5006, order: 1, title: "Mengenal Lingkaran", type: "STAR", challenges: [
                    { id: 5006011, type: "SELECT", question: "Garis dari pusat ke tepi lingkaran disebut?", options: [{ id: 1, text: "Jari-jari", correct: true }, { id: 2, text: "Diameter", correct: false }, { id: 3, text: "Busur", correct: false }] },
                    { id: 5006012, type: "SELECT", question: "Diameter = 2 x ?", options: [{ id: 1, text: "Jari-jari", correct: true }, { id: 2, text: "Keliling", correct: false }, { id: 3, text: "Luas", correct: false }] },
                    { id: 5006013, type: "MATCH", question: "Pasangkan", pairs: [{ from: "r = 7", to: "d = 14" }, { from: "r = 10", to: "d = 20" }, { from: "d = 6", to: "r = 3" }] }
                ]
            },
            {
                id: 500602, unitId: 5006, order: 2, title: "Rumus Luas", type: "PRACTICE", challenges: [
                    { id: 5006021, type: "SELECT", question: "Rumus Luas Lingkaran?", options: [{ id: 1, text: "L = π x r²", correct: true }, { id: 2, text: "L = 2 x π x r", correct: false }, { id: 3, text: "L = π x d", correct: false }] },
                    { id: 5006022, type: "SELECT", question: "r = 7 cm. Luasnya? (π=22/7)", options: [{ id: 1, text: "154 cm²", correct: true }, { id: 2, text: "44 cm²", correct: false }, { id: 3, text: "49 cm²", correct: false }] },
                    { id: 5006023, type: "MATCH", question: "Pasangkan Luas", pairs: [{ from: "r = 14", to: "616 cm²" }, { from: "r = 21", to: "1386 cm²" }, { from: "r = 7", to: "154 cm²" }] }
                ]
            },
            {
                id: 500603, unitId: 5006, order: 3, title: "Rumus Keliling", type: "STAR", challenges: [
                    { id: 5006031, type: "SELECT", question: "Rumus Keliling Lingkaran?", options: [{ id: 1, text: "K = 2 x π x r", correct: true }, { id: 2, text: "K = π x r²", correct: false }, { id: 3, text: "K = π x d", correct: false }] },
                    { id: 5006032, type: "SELECT", question: "r = 7 cm. Kelilingnya? (π=22/7)", options: [{ id: 1, text: "44 cm", correct: true }, { id: 2, text: "154 cm", correct: false }, { id: 3, text: "22 cm", correct: false }] },
                    { id: 5006033, type: "MATCH", question: "Pasangkan Keliling", pairs: [{ from: "r = 14", to: "88 cm" }, { from: "r = 21", to: "132 cm" }, { from: "d = 14", to: "44 cm" }] }
                ]
            },
            {
                id: 500604, unitId: 5006, order: 4, title: "Soal Cerita Lingkaran", type: "PRACTICE", challenges: [
                    { id: 5006041, type: "SELECT", question: "Ban sepeda r=35cm. Kelilingnya?", options: [{ id: 1, text: "220 cm", correct: true }, { id: 2, text: "110 cm", correct: false }, { id: 3, text: "3850 cm", correct: false }] },
                    { id: 5006042, type: "SELECT", question: "Pizza r=14cm. Luasnya?", options: [{ id: 1, text: "616 cm²", correct: true }, { id: 2, text: "88 cm²", correct: false }, { id: 3, text: "196 cm²", correct: false }] },
                    { id: 5006043, type: "MATCH", question: "Pasangkan", pairs: [{ from: "Kolam r=7m", to: "L=154 m²" }, { from: "Jam r=10cm", to: "K≈62.8 cm" }, { from: "Kue r=5cm", to: "K≈31.4 cm" }] }
                ]
            },
            {
                id: 500605, unitId: 5006, order: 5, title: "Master Lingkaran", type: "STAR", challenges: [
                    { id: 5006051, type: "SELECT", question: "Keliling = 44 cm. Jari-jarinya?", options: [{ id: 1, text: "7 cm", correct: true }, { id: 2, text: "14 cm", correct: false }, { id: 3, text: "22 cm", correct: false }] },
                    { id: 5006052, type: "SELECT", question: "Luas = 154 cm². Jari-jarinya?", options: [{ id: 1, text: "7 cm", correct: true }, { id: 2, text: "14 cm", correct: false }, { id: 3, text: "11 cm", correct: false }] },
                    { id: 5006053, type: "MATCH", question: "Pasangkan", pairs: [{ from: "K=88cm", to: "r=14cm" }, { from: "L=616cm²", to: "r=14cm" }, { from: "K=132cm", to: "r=21cm" }] }
                ]
            }
        ]
    },

    // UNIT 7: Pecahan (5 Lessons)
    {
        id: 5007,
        title: "Unit 7: Pecahan Dasar",
        description: "Penjumlahan dan Pengurangan Pecahan.",
        guidebookContent: "# Pecahan\n\nPembilang/Penyebut\nSamakan penyebut untuk +/-",
        lessons: [
            {
                id: 500701, unitId: 5007, order: 1, title: "Mengenal Pecahan", type: "STAR", challenges: [
                    { id: 5007011, type: "SELECT", question: "1/2 artinya?", options: [{ id: 1, text: "Satu dari dua bagian", correct: true }, { id: 2, text: "Dua bagian", correct: false }, { id: 3, text: "Setengah kali dua", correct: false }] },
                    { id: 5007012, type: "SELECT", question: "3/4 > 1/2?", options: [{ id: 1, text: "Ya, benar", correct: true }, { id: 2, text: "Tidak", correct: false }] },
                    { id: 5007013, type: "MATCH", question: "Pasangkan", pairs: [{ from: "1/2", to: "50%" }, { from: "1/4", to: "25%" }, { from: "3/4", to: "75%" }] }
                ]
            },
            {
                id: 500702, unitId: 5007, order: 2, title: "Tambah Pecahan Sejenis", type: "PRACTICE", challenges: [
                    { id: 5007021, type: "SELECT", question: "1/4 + 2/4 = ?", options: [{ id: 1, text: "3/4", correct: true }, { id: 2, text: "3/8", correct: false }, { id: 3, text: "1/2", correct: false }] },
                    { id: 5007022, type: "SELECT", question: "2/5 + 2/5 = ?", options: [{ id: 1, text: "4/5", correct: true }, { id: 2, text: "4/10", correct: false }, { id: 3, text: "1", correct: false }] },
                    { id: 5007023, type: "MATCH", question: "Pasangkan", pairs: [{ from: "1/3 + 1/3", to: "2/3" }, { from: "1/2 + 1/2", to: "1" }, { from: "1/6 + 2/6", to: "3/6" }] }
                ]
            },
            {
                id: 500703, unitId: 5007, order: 3, title: "Kurang Pecahan Sejenis", type: "STAR", challenges: [
                    { id: 5007031, type: "SELECT", question: "3/4 - 1/4 = ?", options: [{ id: 1, text: "2/4", correct: true }, { id: 2, text: "2/0", correct: false }, { id: 3, text: "1/2", correct: false }] },
                    { id: 5007032, type: "SELECT", question: "5/6 - 2/6 = ?", options: [{ id: 1, text: "3/6", correct: true }, { id: 2, text: "3/0", correct: false }, { id: 3, text: "7/6", correct: false }] },
                    { id: 5007033, type: "MATCH", question: "Pasangkan", pairs: [{ from: "4/5 - 1/5", to: "3/5" }, { from: "1 - 1/2", to: "1/2" }, { from: "7/8 - 3/8", to: "4/8" }] }
                ]
            },
            {
                id: 500704, unitId: 5007, order: 4, title: "Pecahan Tak Sejenis", type: "PRACTICE", challenges: [
                    { id: 5007041, type: "SELECT", question: "1/2 + 1/4 = ?", options: [{ id: 1, text: "3/4", correct: true }, { id: 2, text: "2/6", correct: false }, { id: 3, text: "1/3", correct: false }] },
                    { id: 5007042, type: "SELECT", question: "1/3 + 1/6 = ?", options: [{ id: 1, text: "1/2", correct: true }, { id: 2, text: "2/9", correct: false }, { id: 3, text: "1/9", correct: false }] },
                    { id: 5007043, type: "MATCH", question: "Pasangkan", pairs: [{ from: "1/2 + 1/3", to: "5/6" }, { from: "1/4 + 1/2", to: "3/4" }, { from: "2/3 - 1/6", to: "1/2" }] }
                ]
            },
            {
                id: 500705, unitId: 5007, order: 5, title: "Master Pecahan", type: "STAR", challenges: [
                    { id: 5007051, type: "SELECT", question: "1/2 x 2 = ?", options: [{ id: 1, text: "1", correct: true }, { id: 2, text: "2/2", correct: false }, { id: 3, text: "1/4", correct: false }] },
                    { id: 5007052, type: "SELECT", question: "1/4 + 1/4 + 1/4 = ?", options: [{ id: 1, text: "3/4", correct: true }, { id: 2, text: "3/12", correct: false }, { id: 3, text: "1/12", correct: false }] },
                    { id: 5007053, type: "MATCH", question: "Pasangkan", pairs: [{ from: "1/2 x 1/2", to: "1/4" }, { from: "2/3 x 3", to: "2" }, { from: "3/4 - 1/4", to: "1/2" }] }
                ]
            }
        ]
    },

    // UNIT 8: Volume (5 Lessons)
    {
        id: 5008,
        title: "Unit 8: Volume Bangun Ruang",
        description: "Volume Kubus, Balok, dan Tabung.",
        guidebookContent: "# Volume\n\nKubus = s³\nBalok = p x l x t\nTabung = π x r² x t",
        lessons: [
            {
                id: 500801, unitId: 5008, order: 1, title: "Rumus Volume", type: "STAR", challenges: [
                    { id: 5008011, type: "MATCH", question: "Pasangkan Rumus", pairs: [{ from: "Kubus", to: "s x s x s" }, { from: "Balok", to: "p x l x t" }, { from: "Tabung", to: "π x r² x t" }] },
                    { id: 5008012, type: "SELECT", question: "Kubus dengan s=3cm. Volumenya?", options: [{ id: 1, text: "27 cm³", correct: true }, { id: 2, text: "9 cm³", correct: false }, { id: 3, text: "12 cm³", correct: false }] }
                ]
            },
            {
                id: 500802, unitId: 5008, order: 2, title: "Volume Kubus", type: "PRACTICE", challenges: [
                    { id: 5008021, type: "SELECT", question: "s = 5 cm. Volume?", options: [{ id: 1, text: "125 cm³", correct: true }, { id: 2, text: "25 cm³", correct: false }, { id: 3, text: "15 cm³", correct: false }] },
                    { id: 5008022, type: "SELECT", question: "s = 10 cm. Volume?", options: [{ id: 1, text: "1000 cm³", correct: true }, { id: 2, text: "100 cm³", correct: false }, { id: 3, text: "30 cm³", correct: false }] },
                    { id: 5008023, type: "MATCH", question: "Pasangkan", pairs: [{ from: "s = 2", to: "8 cm³" }, { from: "s = 4", to: "64 cm³" }, { from: "s = 6", to: "216 cm³" }] }
                ]
            },
            {
                id: 500803, unitId: 5008, order: 3, title: "Volume Balok", type: "STAR", challenges: [
                    { id: 5008031, type: "SELECT", question: "p=4, l=3, t=2. Volume?", options: [{ id: 1, text: "24 cm³", correct: true }, { id: 2, text: "9 cm³", correct: false }, { id: 3, text: "18 cm³", correct: false }] },
                    { id: 5008032, type: "SELECT", question: "p=10, l=5, t=2. Volume?", options: [{ id: 1, text: "100 cm³", correct: true }, { id: 2, text: "17 cm³", correct: false }, { id: 3, text: "50 cm³", correct: false }] },
                    { id: 5008033, type: "MATCH", question: "Pasangkan", pairs: [{ from: "5x4x3", to: "60 cm³" }, { from: "6x2x2", to: "24 cm³" }, { from: "10x10x1", to: "100 cm³" }] }
                ]
            },
            {
                id: 500804, unitId: 5008, order: 4, title: "Volume Tabung", type: "PRACTICE", challenges: [
                    { id: 5008041, type: "SELECT", question: "r=7, t=10. Volume? (π=22/7)", options: [{ id: 1, text: "1540 cm³", correct: true }, { id: 2, text: "440 cm³", correct: false }, { id: 3, text: "154 cm³", correct: false }] },
                    { id: 5008042, type: "SELECT", question: "r=14, t=5. Volume? (π=22/7)", options: [{ id: 1, text: "3080 cm³", correct: true }, { id: 2, text: "616 cm³", correct: false }, { id: 3, text: "440 cm³", correct: false }] },
                    { id: 5008043, type: "MATCH", question: "Pasangkan", pairs: [{ from: "r=7,t=1", to: "154 cm³" }, { from: "r=7,t=2", to: "308 cm³" }, { from: "r=14,t=1", to: "616 cm³" }] }
                ]
            },
            {
                id: 500805, unitId: 5008, order: 5, title: "Master Volume", type: "STAR", challenges: [
                    { id: 5008051, type: "SELECT", question: "Volume = 27cm³. Sisi kubus?", options: [{ id: 1, text: "3 cm", correct: true }, { id: 2, text: "9 cm", correct: false }, { id: 3, text: "27 cm", correct: false }] },
                    { id: 5008052, type: "SELECT", question: "Akuarium 50x30x20cm. Volumenya?", options: [{ id: 1, text: "30000 cm³", correct: true }, { id: 2, text: "100 cm³", correct: false }, { id: 3, text: "3000 cm³", correct: false }] },
                    { id: 5008053, type: "MATCH", question: "Pasangkan", pairs: [{ from: "V=64cm³ Kubus", to: "s=4cm" }, { from: "V=1000cm³ Kubus", to: "s=10cm" }, { from: "V=125cm³ Kubus", to: "s=5cm" }] }
                ]
            }
        ]
    },

    // UNIT 9: Kecepatan (5 Lessons)
    {
        id: 5009,
        title: "Unit 9: Kecepatan & Debit",
        description: "Rumus Jarak, Waktu, Kecepatan.",
        guidebookContent: "# Rumus JKW\n\nKecepatan = Jarak : Waktu\nJarak = Kecepatan x Waktu\nWaktu = Jarak : Kecepatan",
        lessons: [
            {
                id: 500901, unitId: 5009, order: 1, title: "Rumus Kecepatan", type: "STAR", challenges: [
                    { id: 5009011, type: "SELECT", question: "Rumus Kecepatan?", options: [{ id: 1, text: "K = J : W", correct: true }, { id: 2, text: "K = J x W", correct: false }, { id: 3, text: "K = W : J", correct: false }] },
                    { id: 5009012, type: "SELECT", question: "Jarak 100km, Waktu 2jam. Kecepatan?", options: [{ id: 1, text: "50 km/jam", correct: true }, { id: 2, text: "200 km/jam", correct: false }, { id: 3, text: "102 km/jam", correct: false }] },
                    { id: 5009013, type: "MATCH", question: "Pasangkan", pairs: [{ from: "J=60, W=2", to: "K=30" }, { from: "J=120, W=3", to: "K=40" }, { from: "J=150, W=3", to: "K=50" }] }
                ]
            },
            {
                id: 500902, unitId: 5009, order: 2, title: "Rumus Jarak", type: "PRACTICE", challenges: [
                    { id: 5009021, type: "SELECT", question: "Rumus Jarak?", options: [{ id: 1, text: "J = K x W", correct: true }, { id: 2, text: "J = K : W", correct: false }, { id: 3, text: "J = W : K", correct: false }] },
                    { id: 5009022, type: "SELECT", question: "K=60km/jam, W=3jam. Jarak?", options: [{ id: 1, text: "180 km", correct: true }, { id: 2, text: "20 km", correct: false }, { id: 3, text: "63 km", correct: false }] },
                    { id: 5009023, type: "MATCH", question: "Pasangkan", pairs: [{ from: "K=50, W=2", to: "J=100" }, { from: "K=80, W=1", to: "J=80" }, { from: "K=40, W=5", to: "J=200" }] }
                ]
            },
            {
                id: 500903, unitId: 5009, order: 3, title: "Rumus Waktu", type: "STAR", challenges: [
                    { id: 5009031, type: "SELECT", question: "Rumus Waktu?", options: [{ id: 1, text: "W = J : K", correct: true }, { id: 2, text: "W = J x K", correct: false }, { id: 3, text: "W = K : J", correct: false }] },
                    { id: 5009032, type: "SELECT", question: "J=200km, K=50km/jam. Waktu?", options: [{ id: 1, text: "4 jam", correct: true }, { id: 2, text: "250 jam", correct: false }, { id: 3, text: "150 jam", correct: false }] },
                    { id: 5009033, type: "MATCH", question: "Pasangkan", pairs: [{ from: "J=100, K=50", to: "W=2jam" }, { from: "J=300, K=60", to: "W=5jam" }, { from: "J=90, K=30", to: "W=3jam" }] }
                ]
            },
            {
                id: 500904, unitId: 5009, order: 4, title: "Soal Cerita JKW", type: "PRACTICE", challenges: [
                    { id: 5009041, type: "SELECT", question: "Mobil 80km/jam selama 2 jam. Jarak?", options: [{ id: 1, text: "160 km", correct: true }, { id: 2, text: "40 km", correct: false }, { id: 3, text: "82 km", correct: false }] },
                    { id: 5009042, type: "SELECT", question: "Sepeda 15km dalam 30 menit. Kecepatan?", options: [{ id: 1, text: "30 km/jam", correct: true }, { id: 2, text: "45 km/jam", correct: false }, { id: 3, text: "15 km/jam", correct: false }] },
                    { id: 5009043, type: "MATCH", question: "Pasangkan", pairs: [{ from: "Bus 240km, 4jam", to: "K=60km/jam" }, { from: "Pesawat 900km/jam, 2jam", to: "J=1800km" }, { from: "Kereta 450km, 90km/jam", to: "W=5jam" }] }
                ]
            },
            {
                id: 500905, unitId: 5009, order: 5, title: "Master JKW", type: "STAR", challenges: [
                    { id: 5009051, type: "SELECT", question: "Berangkat jam 8, tiba jam 11. K=60km/jam. Jarak?", options: [{ id: 1, text: "180 km", correct: true }, { id: 2, text: "120 km", correct: false }, { id: 3, text: "660 km", correct: false }] },
                    { id: 5009052, type: "SELECT", question: "A ke B 120km, K=40km/jam. B ke C 80km, K=40km/jam. Total waktu?", options: [{ id: 1, text: "5 jam", correct: true }, { id: 2, text: "3 jam", correct: false }, { id: 3, text: "200 jam", correct: false }] },
                    { id: 5009053, type: "MATCH", question: "Pasangkan", pairs: [{ from: "60km/jam, 90menit", to: "90km" }, { from: "100km, 2.5jam", to: "40km/jam" }, { from: "50km/jam, 3jam", to: "150km" }] }
                ]
            }
        ]
    },

    // UNIT 10: Statistika (5 Lessons)
    {
        id: 5010,
        title: "Unit 10: Statistika Dasar",
        description: "Mean (Rata-rata), Median (Tengah), Modus.",
        guidebookContent: "# Statistika\n\nMean = Jumlah data : Banyak data\nMedian = Nilai tengah\nModus = Data paling sering muncul",
        lessons: [
            {
                id: 501001, unitId: 5010, order: 1, title: "Mengenal Statistik", type: "STAR", challenges: [
                    { id: 5010011, type: "SELECT", question: "Modus adalah...", options: [{ id: 1, text: "Data paling sering muncul", correct: true }, { id: 2, text: "Nilai rata-rata", correct: false }, { id: 3, text: "Nilai tengah", correct: false }] },
                    { id: 5010012, type: "SELECT", question: "Median adalah...", options: [{ id: 1, text: "Nilai tengah data", correct: true }, { id: 2, text: "Nilai terbesar", correct: false }, { id: 3, text: "Nilai terkecil", correct: false }] },
                    { id: 5010013, type: "MATCH", question: "Pasangkan", pairs: [{ from: "Mean", to: "Rata-rata" }, { from: "Median", to: "Tengah" }, { from: "Modus", to: "Terbanyak" }] }
                ]
            },
            {
                id: 501002, unitId: 5010, order: 2, title: "Mencari Modus", type: "PRACTICE", challenges: [
                    { id: 5010021, type: "SELECT", question: "Data: 2,2,5,7. Modusnya?", options: [{ id: 1, text: "2", correct: true }, { id: 2, text: "5", correct: false }, { id: 3, text: "7", correct: false }] },
                    { id: 5010022, type: "SELECT", question: "Data: 3,5,5,5,8. Modusnya?", options: [{ id: 1, text: "5", correct: true }, { id: 2, text: "3", correct: false }, { id: 3, text: "8", correct: false }] },
                    { id: 5010023, type: "MATCH", question: "Pasangkan", pairs: [{ from: "1,1,2,3", to: "Modus=1" }, { from: "4,4,4,5", to: "Modus=4" }, { from: "7,8,8,9", to: "Modus=8" }] }
                ]
            },
            {
                id: 501003, unitId: 5010, order: 3, title: "Mencari Median", type: "STAR", challenges: [
                    { id: 5010031, type: "SELECT", question: "Data: 1,3,5,7,9. Mediannya?", options: [{ id: 1, text: "5", correct: true }, { id: 2, text: "3", correct: false }, { id: 3, text: "7", correct: false }] },
                    { id: 5010032, type: "SELECT", question: "Data: 2,4,6,8. Mediannya?", options: [{ id: 1, text: "5", correct: true }, { id: 2, text: "4", correct: false }, { id: 3, text: "6", correct: false }] },
                    { id: 5010033, type: "MATCH", question: "Pasangkan", pairs: [{ from: "1,2,3", to: "Med=2" }, { from: "5,10,15", to: "Med=10" }, { from: "2,4,6,8", to: "Med=5" }] }
                ]
            },
            {
                id: 501004, unitId: 5010, order: 4, title: "Mencari Mean", type: "PRACTICE", challenges: [
                    { id: 5010041, type: "SELECT", question: "Data: 4,6,8. Mean?", options: [{ id: 1, text: "6", correct: true }, { id: 2, text: "8", correct: false }, { id: 3, text: "18", correct: false }] },
                    { id: 5010042, type: "SELECT", question: "Data: 10,20,30,40. Mean?", options: [{ id: 1, text: "25", correct: true }, { id: 2, text: "20", correct: false }, { id: 3, text: "100", correct: false }] },
                    { id: 5010043, type: "MATCH", question: "Pasangkan", pairs: [{ from: "2,4,6", to: "Mean=4" }, { from: "5,5,5", to: "Mean=5" }, { from: "1,2,3,4", to: "Mean=2.5" }] }
                ]
            },
            {
                id: 501005, unitId: 5010, order: 5, title: "Master Statistik", type: "STAR", challenges: [
                    { id: 5010051, type: "SELECT", question: "Data: 3,3,5,7,7. Mean+Modus?", options: [{ id: 1, text: "8", correct: true }, { id: 2, text: "5", correct: false }, { id: 3, text: "10", correct: false }] },
                    { id: 5010052, type: "SELECT", question: "Nilai: 70,80,90. Rata-rata minimal berapa agar lulus 80?", options: [{ id: 1, text: "80", correct: true }, { id: 2, text: "70", correct: false }, { id: 3, text: "90", correct: false }] },
                    { id: 5010053, type: "MATCH", question: "Pasangkan", pairs: [{ from: "2,2,4,4,8", to: "Mean=4" }, { from: "1,1,1,9", to: "Modus=1" }, { from: "2,3,4,5,6", to: "Med=4" }] }
                ]
            }
        ]
    }
];

// MATH SECTIONS DATA
export interface MathSection {
    id: number;
    title: string;
    description: string;
    unitIds: number[];
}

export const mathSectionsData: MathSection[] = [
    {
        id: 1,
        title: "Section 1: Operasi Dasar",
        description: "Penjumlahan, Pengurangan, Perkalian, Pembagian",
        unitIds: [5001, 5002, 5003, 5004, 5005]
    },
    {
        id: 2,
        title: "Section 2: Rumus & Geometri",
        description: "Lingkaran, Pecahan, Volume, Kecepatan, Statistik",
        unitIds: [5006, 5007, 5008, 5009, 5010]
    }
];
