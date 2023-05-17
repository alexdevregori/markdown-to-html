const csv = require('csv-parser');
const fs = require('fs');
const showdown = require('showdown');
const csvWriter = require('csv-write-stream');



function convertCsvToHtml(inputFilePath) {
  const outputFilePath = 'output.csv';
  const readStream = fs.createReadStream(inputFilePath);
  
  const converter = new showdown.Converter();
  converter.setOption("noHeaderId", "true")
  converter.setOption("headerLevelStart", 1)
  converter.setOption("underline", "true")

  const writer = csvWriter({ headers: ['html'] });

  const dataToWrite = [];

  writer.pipe(fs.createWriteStream(outputFilePath));

  const replacements = [
    { regex: /\#/g, replacement: '1. ' },
    { regex: /\#\#/g, replacement: '    1. ' },
    { regex: /\#\#\#/g, replacement: '        1. ' },
    { regex: /h1./g, replacement: '#' },
    { regex: /h2./g, replacement: '##' },
    { regex: /h3./g, replacement: '##' },
    { regex: /"h3./g, replacement: '##' },
    { regex: /h4./g, replacement: '##' },
    { regex: /\{\^\}/g, replacement: '' },
    { regex: /Â/g, replacement: '' },
    { regex: /€/g, replacement: '' },
    { regex: /â/g, replacement: '' },
    { regex: /™/g, replacement: '' },
    { regex: /(?<!\w)\*\*(?!\w)/g, replacement: '    +' },
    { regex: /(?<!\w)\*\*\*(?!\w)/g, replacement: '        +' },
    { regex: /(?<=\S)\*|\*(?=\S)/g, replacement: '**' },
    { regex: /(?<!https?:\/\/\S+)\+/g, replacement: '__' },
    // add more replacement objects as needed
  ];

  function applyReplacements(markdown) {
    replacements.forEach(replacement => {
      markdown = markdown.replace(replacement.regex, replacement.replacement);
    });
    return markdown;
  }

  const replaceTransform = replacements.reduce((acc, cur) =>
   {
    return acc.pipe(replace(cur.regex, cur.replacement));
  }, new require('stream').PassThrough({ objectMode: true }));


  readStream
    .pipe(csv())
    .on('data', (data) => {
      const markdownText = data[Object.keys(data)[0]];
      const updatedMarkdownText = applyReplacements(markdownText)
      const htmlText = converter.makeHtml(updatedMarkdownText);    
      dataToWrite.push({ html: htmlText });
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
      dataToWrite.forEach((data) => writer.write(data));
      writer.end();
      console.log('CSV file written successfully');
    });
}

// define a function to replace text in a stream using a regular expression
function replace(regex, replacement) {
  return require('stream').Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      const data = chunk.toString().replace(regex, replacement);
      this.push(data);
      callback();
    }
  });
}

convertCsvToHtml('input.csv');
