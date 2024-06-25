const { validateInputs } = require('../../source/rabbitmq-analysis');

describe('validateInputs', () => {
    let resultDiv;

    beforeEach(() => {
        resultDiv = document.createElement('div');
        document.body.appendChild(resultDiv);
    });

    afterEach(() => {
        document.body.removeChild(resultDiv);
    });

    test('should return false and display error if nodes are not provided', () => {
        expect.assertions(2);
        const result = validateInputs('26.0', { files: [new File([''], 'file')] }, null, resultDiv);
        expect(result).toBe(false);
        expect(resultDiv.innerHTML).toBe('<div class=\"error\">Please enter a valid number of nodes.</div>');
    });

    test('should return false and display error if Erlang/OTP version is not provided', () => {
        expect.assertions(2);
        const result = validateInputs(null, { files: [new File([''], 'file')] }, 3, resultDiv);
        expect(result).toBe(false);
        expect(resultDiv.innerHTML).toBe('<p class="error">Please choose an Erlang/OTP version.</p>');
    });

    test('should return false and display error if no file is uploaded', () => {
        expect.assertions(2);
        const result = validateInputs('26.0', { files: [] }, 3, resultDiv);
        expect(result).toBe(false);
        expect(resultDiv.innerHTML).toBe('<p class="error">Please upload a definition file.</p>');
    });

    test('should return false and display error if file size is too large', () => {
        expect.assertions(2);
        // Mock the file object with a size greater than MAX_SIZE
        const largeFile = {
            size: 2000 * 1024 * 1024, // 15 MB
            name: 'largeFile',
            type: 'application/json'
        };
        const result = validateInputs('26.0', { files: [largeFile] }, 3, resultDiv);
        expect(result).toBe(false);
        expect(resultDiv.textContent).toBe('The definition file is too large. Please upload a file smaller than 1 GB.');
    });

    test('should return true if all inputs are valid', () => {
        expect.assertions(2);
        const validFile = {
            size: 5 * 1024 * 1024, // 5 MB
            name: 'validFile',
            type: 'application/json'
        };
        const result = validateInputs('26.0', { files: [validFile] }, 3, resultDiv);
        expect(result).toBe(true);
        expect(resultDiv.innerHTML).toBe('');
    });
});