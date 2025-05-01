const chars = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  ..."abcdefghijklmnopqrstuvwxyz",
  ..."0123456789",
  "-", "_", ".", "~",
  ":", "/", "?", "#", "[", "]", "@",
  "!", "$", "&", "'", "(", ")", "*", "+", ",", ";", "="
];


const bitsToNum = {
  '0000': 0,
  '0001': 1,
  '0010': 2,
  '0011': 3,
  '0100': 4,
  '0101': 5,
  '0110': 6,  
  '0111': 7,
  '1000': 8,
  '1001': 9,
  '1010': 10,
  '1011': 11,
  '1100': 12,
  '1101': 13,
  '1110': 14, 
  '1111': 15,
}
// Create reverse dictionary: 7-bit binary -> character
const bitToChar = {};
chars.forEach((char, i) => {
  bitToChar[i.toString(2).padStart(7, '0')] = char;
});
// Create 7-bit binary dictionary
const charTo7bit = {};
chars.forEach((char, i) => {
  charTo7bit[char] = i.toString(2).padStart(7, '0');
});

function encodeUrlTo7bitAscii(url) {
  
  console.log(charTo7bit)
  // Convert URL to 7-bit binary stream
  let bitStream = '';
  for (const c of url) {
    if (!charTo7bit[c]) {
      throw new Error(`Unsupported character: "${c}"`);
    }
    bitStream += charTo7bit[c];
  }
  console.log(bitStream)
  // Pad the bit stream to be divisible by 8
  const padding = (8 - (bitStream.length % 8)) % 8;
  bitStream = bitStream.padEnd(bitStream.length + padding, '0');

  // Convert 8-bit chunks to ASCII characters
  // let result = '';
  // for (let i = 0; i < bitStream.length; i += 8) {
  //   const byte = bitStream.slice(i, i + 8);
  //   result += String.fromCharCode(parseInt(byte, 2));
  // }
  
  let result = '';
  for (let i = 0; i < bitStream.length; i += 4) {
    const byte = bitStream.slice(i, i + 4);
    // console.log(byte)
    // console.log(bitsToNum[byte])
    result+= bitsToNum[byte]
    // result += String.fromCharCode(parseInt(byte, 2));
  }
console.log(result)
  return result;
}

function decode7bitAsciiToUrl(encodedStr) {

  
  // Convert each character to 8-bit binary and build bit stream
  let bitStream = '';
  for (const c of encodedStr) {
    bitStream += c.charCodeAt(0).toString(2).padStart(8, '0');
  }

  // Read 7-bit chunks and convert back to characters
  let result = '';
  for (let i = 0; i + 7 <= bitStream.length; i += 7) {
    const chunk = bitStream.slice(i, i + 7);
    if (bitToChar[chunk]) {
      result += bitToChar[chunk];
    } else {
      // Ignore padding or invalid bits at the end
      break;
    }
  }
  
  return result;
}

function asciiToNumbers(str) {
  const result = [];
  for (let i = 0; i < str.length; i++) {
    result.push(str.charCodeAt(i)); // Convert each char to its ASCII value
  }
  return result;
}

function numbersToAscii(numbers) {
  return numbers.map(num => String.fromCharCode(num)).join(''); // Convert each number to char and join them into a string
}

const url = 'www.programiz.com/javascript/online-compiler'
const encodedascii = encodeUrlTo7bitAscii(url)
// const encodednums = asciiToNumbers(encodedascii)
// console.log('Encoded:', encodedascii)
 
// const decoded = decode7bitAsciiToUrl(numbersToAscii(encodednums))

// console.log('Decoded:', decoded)


const bin  = '0110000011000001100001000000010100101010110101000010000001010110011010010011001000100110011100000000111000101000010011010000110100011001101001011110011010010110000111000101011010001001010010101101100001101010000100111010010101000100100111001111001111100011100010100001001100101001010001001001010011110010101'

const counts = []
let prev = bin[0]
let currcount = 1

for(let i=1; i<bin.length; i++){
    if(bin[i]==prev){
        currcount++;
    }else{
        prev = bin[i];
        counts.push(currcount)
        currcount = 1
    }
}

console.log(counts.join(''))