//  @ts-nocheck
//  Based on https://stackoverflow.com/questions/23318037/size-of-json-object-in-kbs-mbs.

//  See https://stackoverflow.com/a/4850316.
//      https://home.unicode.org/technical-quick-start-guide/.

//  Some glossed-over fundamentals regarding JSON.stringify function:
//  https://stackoverflow.com/questions/27253150/json-stringify-to-utf-8.
//  https://github.com/tc39/proposal-well-formed-stringify.
//  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#well-formed_json.stringify


console.log("abcd    (b)", getSizeInBytes("abcd"));
console.log("よんもじ (b)", getSizeInBytes("よんもじ"));
console.log("کلمه    (b)", getSizeInBytes("کلمه"));
console.log("\n");


// Roughly similar database schema of blog
const obj1 = {
    authorId: "t".repeat(24),
    blogTitle: "t".repeat(100),
    blogBody: "t".repeat(2000),
    blogTopic: "t".repeat(70),
};

console.log("without base64 img embeded (kb): ", getSizeInBytes(obj1) / 1000);
// Where does +35 below come from? Testing a 22kb image in https://www.base64-image.de/.
console.log("some base64 img embeded (kb): ", getSizeInBytes(obj1) / 1000 + 35);


function getSizeInBytes(param) {
    if (typeof param === "string") {
        return new TextEncoder().encode(JSON.stringify(param)).length;
    }
    return new TextEncoder().encode(JSON.stringify(JSON.stringify(param))).length;
}


