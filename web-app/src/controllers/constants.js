export default Object.freeze({
    actionState: Object.freeze({
        // cache is stored on RAM. Don't waste RAM space to store "NOT_INITIATED" string for all actions. instead store 0.
        NOT_INITIATED: 1,
        PROCESSING: 2,
        FINISHED: 3,
    }),
});
