const { isVersionOlder } = require('../../source/rabbitmq-analysis');

describe('isVersionOlder', () => {
    test('should return true if current version is older', () => {
        expect.assertions(1);
        expect(isVersionOlder('3.9.3.2', '3.13.0')).toBe(true);
    });

    test('should return true if current version is newer', () => {
        expect.assertions(1);
        expect(isVersionOlder('3.13.3', '3.13.0')).toBe(false);
    });

    test('should return false if versions are the same', () => {
        expect.assertions(1);
        expect(isVersionOlder('3.13', '3.13.0')).toBe(false);
    });
});