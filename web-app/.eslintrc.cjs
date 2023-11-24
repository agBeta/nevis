module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "indent": ["error", 4, { 
            // See https://stackoverflow.com/a/53055584.
            "SwitchCase": 1 
        }],
        "linebreak-style": ["error", "unix"],
        "quotes": ["error", "double"],
        "semi": ["error","always"],
        "no-unused-vars": ["warn"]
    }
};
