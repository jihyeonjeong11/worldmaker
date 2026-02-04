// not possible. just keep codes
const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const path = require('path');

async function readCard() {
  const filePath = path.join(__dirname, '../Deck of Worlds_HQ Cards.pdf');

  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ url: filePath });
  const result = await parser.getText({ partial: [1] });

  console.log(result);
}

readCard();
