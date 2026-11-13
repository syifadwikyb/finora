const { Type } = require("@google/genai");

const categoryProp = {
    type: Type.STRING,
    description: "Nama kategori persis seperti di daftar milik pengguna.",
};
const accountProp = {
    type: Type.STRING,
    description: "Nama akun. Isi hanya jika nama kategori yang sama ada di beberapa akun.",
};
const dateProp = {
    type: Type.STRING,
    description: "Tanggal format YYYY-MM-DD. Kosongkan jika hari ini.",
};

const transactionParams = (extraDescription) => ({
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Judul singkat, mis. Makan siang." },
        amount: { type: Type.NUMBER, description: "Nominal dalam Rupiah, angka bulat." },
        category_name: categoryProp,
        account_name: accountProp,
        date: dateProp,
        description: { type: Type.STRING, description: extraDescription },
    },
    required: ["title", "amount", "category_name"],
});

const functionDeclarations = [
    {
        name: "add_expense",
        description: "Mencatat pengeluaran dari sebuah kategori.",
        parameters: transactionParams("Catatan opsional."),
    },
    {
        name: "add_income",
        description: "Mencatat pemasukan ke sebuah kategori.",
        parameters: transactionParams("Catatan opsional."),
    },
    {
        name: "move_money",
        description: "Memindahkan uang dari satu kategori ke kategori lain (Move Money).",
        parameters: {
            type: Type.OBJECT,
            properties: {
                from_category_name: categoryProp,
                from_account_name: accountProp,
                to_category_name: categoryProp,
                to_account_name: accountProp,
                amount: { type: Type.NUMBER, description: "Nominal dalam Rupiah, angka bulat." },
                note: { type: Type.STRING, description: "Catatan opsional." },
                date: dateProp,
            },
            required: ["from_category_name", "to_category_name", "amount"],
        },
    },
    {
        name: "create_category",
        description: "Membuat kategori baru, opsional di akun tertentu.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "Nama kategori baru." },
                account_name: { type: Type.STRING, description: "Nama akun tujuan (opsional)." },
            },
            required: ["name"],
        },
    },
];

module.exports = { functionDeclarations };