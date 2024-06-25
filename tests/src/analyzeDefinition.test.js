// Currently, We only check the try catch error in this function

if (typeof TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

const { analyzeDefinition } = require('../../source/rabbitmq-analysis');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

global.FileReader = jest.fn().mockImplementation(() => {
  const reader = {
    readAsText: function(file) {
      if (this.onload) {
        this.onload({
          target: {
            result: file instanceof Blob ? file.contents : null,
          },
        });
      }
    },
    onload: null,
  };
  return reader;
});

console.error = jest.fn();

function createMockFileList(files) {
  if (!files.length) {
    files = [new Blob([''], { type: 'application/json' })];
  }

  const fileList = {
    length: files.length,
    item: (index) => files[index],
    [Symbol.iterator]: function* () {
      for (let i = 0; i < files.length; i++) {
        yield files[i];
      }
    },
  };

  files.forEach((file, index) => {
    fileList[index] = file;
  });

  return fileList;
}

describe('analyzeDefinition', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="nodes" value="3" />
      <select id="erlangVersion">
        <option value="24">24</option>
      </select>
      <input type="file" id="definitions" />
      <div id="result"></div>
    `;
  });

  it('should display an error message when JSON parsing fails', () => {
    expect.assertions(2);
    const fileInput = document.getElementById('definitions');
    const invalidJSONFile = new Blob(['{ invalid JSON }'], { type: 'application/json' });
    invalidJSONFile.contents = '{ invalid JSON }';
    const mockFileList = createMockFileList([invalidJSONFile]);
    Object.defineProperty(fileInput, 'files', {
      value: mockFileList,
      writable: true
    });

    analyzeDefinition();

    return new Promise((resolve) => {
      setTimeout(() => {
        const resultDiv = document.getElementById('result');
        expect(resultDiv.textContent).toContain('Error parsing the definition file. Please ensure it is a valid JSON file.');
        expect(console.error).toHaveBeenCalled();
        resolve();
      }, 0);
    });
  });
});