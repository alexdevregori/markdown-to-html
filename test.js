const showdown = require('showdown');

const converter = new showdown.Converter();
  converter.setOption("noHeaderId", "true")
  converter.setOption("headerLevelStart", 1)
  converter.setOption("underline", "true")

const string = "*Target Customer:*��Fraud analyst"

const replacement = string.replace(/(?<=\S)\*|\*(?=\S)/g, "**")

const html = converter.makeHtml(replacement)

console.log(html)