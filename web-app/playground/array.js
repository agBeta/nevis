const arr1 = [
    {key1: 231, key2: "a", omit: "456456"},
    {key1: 35345, key2: "b", omit: "23012"},
];

const arr2 = arr1.map(function dropOmit({omit, ...keep}){
    return keep;
});

console.log(arr2);
// prints: [ { key1: 231, key2: 'a' }, { key1: 35345, key2: 'b' } ]
