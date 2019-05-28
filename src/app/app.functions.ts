export function assert(precondition: any) {
    if (!precondition) {
        throw new Error('Assertion Failed!');
    }
}
