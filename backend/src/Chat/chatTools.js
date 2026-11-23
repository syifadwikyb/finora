const { Type } = require("@google/genai");

const categoryProp = {
    type: Type.STRING,
    description: "Category name exactly as listed in the user's categories.",
};
const accountProp = {
    type: Type.STRING,
    description: "Account name. Only set it if the same category name exists in several accounts.",
};
const dateProp = {
    type: Type.STRING,
    description: "Date as YYYY-MM-DD. Leave empty for today.",
};
const amountProp = {
    type: Type.NUMBER,
    description: "Amount in Rupiah, whole number.",
};

// Ciri-ciri record yang sudah ada (dipakai server untuk mencari, bukan ID)
const matchTransactionProps = {
    match_title: { type: Type.STRING, description: "Part of the title of the existing transaction." },
    match_amount: { type: Type.NUMBER, description: "Amount of the existing transaction in Rupiah, if the user said it." },
    match_date: { type: Type.STRING, description: "Date of the existing transaction as YYYY-MM-DD, if the user said it." },
    match_category_name: { type: Type.STRING, description: "Category of the existing transaction, if the user said it." },
    match_type: { type: Type.STRING, description: "Either expense or income, if the user said it." },
};

const matchMoveProps = {
    match_from_category_name: { type: Type.STRING, description: "Source category of the existing move." },
    match_to_category_name: { type: Type.STRING, description: "Destination category of the existing move." },
    match_amount: { type: Type.NUMBER, description: "Amount of the existing move in Rupiah, if the user said it." },
    match_date: { type: Type.STRING, description: "Date of the existing move as YYYY-MM-DD, if the user said it." },
    match_note: { type: Type.STRING, description: "Part of the note of the existing move." },
};

const matchCategoryProps = {
    match_name: { type: Type.STRING, description: "Name of the existing category, exactly as listed." },
    match_account_name: accountProp,
};

const matchAccountProps = {
    match_name: { type: Type.STRING, description: "Name of the existing account, exactly as listed." },
};

const transactionParams = (extraDescription) => ({
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Short title, e.g. Lunch." },
        amount: amountProp,
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
        description: "Record an expense from a category.",
        parameters: transactionParams("Optional note."),
    },
    {
        name: "add_income",
        description: "Record income into a category.",
        parameters: transactionParams("Optional note."),
    },
    {
        name: "move_money",
        description: "Move money from one category to another (Move Money).",
        parameters: {
            type: Type.OBJECT,
            properties: {
                from_category_name: categoryProp,
                from_account_name: accountProp,
                to_category_name: categoryProp,
                to_account_name: accountProp,
                amount: amountProp,
                note: { type: Type.STRING, description: "Optional note." },
                date: dateProp,
            },
            required: ["from_category_name", "to_category_name", "amount"],
        },
    },
    {
        name: "create_category",
        description: "Create a new category, optionally in a specific account.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "Name of the new category." },
                account_name: { type: Type.STRING, description: "Target account name (optional)." },
            },
            required: ["name"],
        },
    },
    {
        name: "create_account",
        description: "Create a new account (for example a bank account, cash wallet, or e-wallet).",
        parameters: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "Name of the new account, e.g. Bank BCA." },
                type: {
                    type: Type.STRING,
                    description: "Account type, e.g. bank, cash, or e-wallet. Leave empty if the user did not say.",
                },
            },
            required: ["name"],
        },
    },
    {
        name: "update_transaction",
        description:
            "Edit an existing transaction. Describe the existing one with the match_ fields and give the new values in the new_ fields.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                ...matchTransactionProps,
                new_title: { type: Type.STRING, description: "New title." },
                new_amount: { type: Type.NUMBER, description: "New amount in Rupiah." },
                new_date: { type: Type.STRING, description: "New date as YYYY-MM-DD." },
                new_category_name: { type: Type.STRING, description: "New category name." },
                new_account_name: accountProp,
                new_description: { type: Type.STRING, description: "New note. Empty string clears it." },
            },
        },
    },
    {
        name: "delete_transaction",
        description:
            "Delete one existing transaction. Describe it with the match_ fields. Only use when the user clearly asks to delete.",
        parameters: {
            type: Type.OBJECT,
            properties: { ...matchTransactionProps },
        },
    },
    {
        name: "update_move",
        description:
            "Edit an existing move. Describe the existing one with the match_ fields and give the new values in the new_ fields.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                ...matchMoveProps,
                new_from_category_name: { type: Type.STRING, description: "New source category." },
                new_from_account_name: accountProp,
                new_to_category_name: { type: Type.STRING, description: "New destination category." },
                new_to_account_name: accountProp,
                new_amount: { type: Type.NUMBER, description: "New amount in Rupiah." },
                new_date: { type: Type.STRING, description: "New date as YYYY-MM-DD." },
                new_note: { type: Type.STRING, description: "New note. Empty string clears it." },
            },
        },
    },
    {
        name: "delete_move",
        description:
            "Delete one existing move. Describe it with the match_ fields. Only use when the user clearly asks to delete.",
        parameters: {
            type: Type.OBJECT,
            properties: { ...matchMoveProps },
        },
    },
    {
        name: "update_category",
        description:
            "Rename a category or move it to another account. Describe the existing category with the match_ fields and give new values in the new_ fields.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                ...matchCategoryProps,
                new_name: { type: Type.STRING, description: "New category name." },
                new_account_name: { type: Type.STRING, description: "Name of the account to move the category to." },
            },
        },
    },
    {
        name: "delete_category",
        description: "Delete one existing category. Only use when the user clearly asks to delete it.",
        parameters: {
            type: Type.OBJECT,
            properties: { ...matchCategoryProps },
        },
    },
    {
        name: "update_account",
        description:
            "Rename an account or change its type. Describe the existing account with match_name and give new values in the new_ fields.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                ...matchAccountProps,
                new_name: { type: Type.STRING, description: "New account name." },
                new_type: { type: Type.STRING, description: "New account type, e.g. bank, cash, or e-wallet." },
            },
        },
    },
    {
        name: "delete_account",
        description: "Delete one existing account. Only use when the user clearly asks to delete it.",
        parameters: {
            type: Type.OBJECT,
            properties: { ...matchAccountProps },
        },
    },
];

module.exports = { functionDeclarations };