import { time } from "node:console";
import { spec } from "node:test/reporters";
import { ObjectId } from "mongodb";

// This would be a good place for reusable validation or date/time formatting helpers.
const exportedMethods = {

generateRandomPasswords(numPasswords, length = 10) {
  if (length < 8 || length > 12) {
    throw "Password length must be between 8-12 chars";
  }
  const passwords = [];
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specials = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
  const allChars = uppercase + lowercase + numbers + specials;

  function getRandomChar(str) {
    return str[Math.floor(Math.random() * str.length)];// converts an index from 0 to the length of the string into a random character from that string
  }

  for (let i = 0; i < numPasswords; i++) {
    let passwordChars = [];

    // guarantee required character types
    passwordChars.push(getRandomChar(uppercase));
    passwordChars.push(getRandomChar(numbers));
    passwordChars.push(getRandomChar(specials));

    // fill remaining length with randoms from all character sets
    while (passwordChars.length < length) {
      passwordChars.push(getRandomChar(allChars));
    }
    // shuffle password characters
    passwordChars.sort(() => Math.random() - 0.5);
    passwords.push(passwordChars.join(''));
  }

  return passwords;
},

  validateDate(ao){
  //accquired on 
    let monthsToDays = {
      '01': 31,
      '02': 28, // account for leap year mod the year number by 4 and == 0 
      '03': 31,
      '04': 30,
      '05': 31,
      '06': 30,
      '07': 31,
      '08': 31,
      '09': 30,
      '10': 31,
      '11': 30,
      '12': 31
    };
    //break string into parts (--/ , /--/, and /--)
    const parts = ao.split(/\//);//using a slash literal regex to match split the string on all parts 

    if (parts.length !== 3){
      throw 'date format incorrect. (MM/DD/YYYY)';
    }
    const month = parts[0];
    if (month.length !== 2){
      throw 'date format incorrect. (MM/DD/YYYY)';
    }
    const  day = parts[1];
    if (day.length !== 2){
      throw 'date format incorrect. (MM/DD/YYYY)';
    }
    const year = parts[2];
      if (year.length !== 4){
      throw 'date format incorrect. (MM/DD/YYYY)';
    }

    //check the month format 
    let monthNum = parseInt(month);
    //console.log(monthNum);
    if(month.length !== 2  || Number.isNaN(monthNum) || !(monthNum <= 12 && monthNum >=1) ){
      throw 'date month formatted incorrectly';
    }
    //check the day format
    let dayNum = parseInt(day);
    let yearNum = parseInt(year);
    if(!yearNum ||  Number.isNaN(yearNum)){
      'date year formatted incorrectly';
    }

    let bool1 = yearNum % 4===0;
    let isLeapYear = false;
    if(bool1){
      if(yearNum % 100 ===0){
        if(yearNum % 400 ===0){
          isLeapYear = true;
        }else{
          isLeapYear = false;
        }
      }else{
        isLeapYear = true;
      }
    }else{
      isLeapYear = false;
    }


    monthsToDays['02'] = isLeapYear ? 29 : 28;
    if(day.length !== 2 || Number.isNaN(dayNum) ||  !(dayNum >= 1 && dayNum <= monthsToDays[month]) ){
      throw 'date day formatted incorrectly';
    }
    return ao;
  },

  checkId(id, varName) {
    if (!id) throw `Error: You must provide a(n) ${varName}`;
    if (typeof id !== 'string') throw `Error:${varName} must be a string`;
    id = id.trim();
    if (id.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces`;
    if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
    return id;
  },

  checkString(strVal, varName= "none") {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
  },

  checkStringArray(arr, varName) {
    //We will allow an empty array for this,
    //if it's not empty, we will make sure all tags are strings
    if (!arr || !Array.isArray(arr))
      throw `You must provide an array of ${varName}`;
    for (let i in arr) {
      if (typeof arr[i] !== 'string' || arr[i].trim().length === 0) {
        throw `One or more elements in ${varName} array is not a string or is an empty string`;
      }
      arr[i] = arr[i].trim();
    }
    return arr;
  },

  CheckName(name,type=""){// make sure that first name is a string first 
    try {
        name = this.checkString(name.trim(),type);
    } catch (error) {
        throw(error);
    }
    //check that the length is between 2-20 chars
    if(name.length <2 || name.length >20){throw "name length must be between 2-20 chars!";}
    for(let i = 0;i<name.length; i++){
        let asciiVal = name.charCodeAt(i); //https://www.geeksforgeeks.org/javascript/how-to-convert-character-to-ascii-code-using-javascript/
        if(!((asciiVal <= 122 && asciiVal >= 97 )|| (asciiVal <= 90 && asciiVal >= 65 ))){
            throw "Name must contain only valid characters! (A-Z,a-z)";
        }
    }
    return name;
  },

    CheckHandle(handle){// make sure that first name is a string first 
    try {
        handle = this.checkString(handle.trim(),"handle");
    } catch (error) {
        throw(error);
    }
    //check that the length is between 2-20 chars
    if(handle.length <5 || handle.length >12){throw "name length must be between 5-12 chars!";}
    for(let i = 0;i<handle.length; i++){
        let asciiVal = handle.charCodeAt(i); //https://www.geeksforgeeks.org/javascript/how-to-convert-character-to-ascii-code-using-javascript/
        if(!((asciiVal <= 122 && asciiVal >= 97 )|| (asciiVal <= 90 && asciiVal >= 65 )||
        (asciiVal <= 57 && asciiVal >= 48))){
            throw "handle must contain only valid characters! (A-Z,a-z,1-9)";
        }
    }
    return handle;
  },  
 CheckPassword(pw){// make sure that first name is a string first 
    try {
        pw = this.checkString(pw.trim(),"password");
    } catch (error) {
        throw(error);
    }
    let upperCaseFound = false;
    let specialCharFound = false;
    let numberFound = false;
    let isPasswordValid = false;
    //check that the length is >=8 chars
    if(pw.length <8){throw "password length must be at least 8 chars!";}
    for(let i = 0;i<pw.length; i++){
        let asciiVal = pw.charCodeAt(i); 
        if(upperCaseFound && specialCharFound && numberFound){
            isPasswordValid = true;
            break;
        }
        if(asciiVal <= 90 && asciiVal >= 65 ){upperCaseFound = true;}
        else if(asciiVal <= 57 && asciiVal >= 48){numberFound = true;}
        else if((asciiVal <= 47 && asciiVal >= 33 ) || (asciiVal <= 64 && asciiVal >= 58 )||
            (asciiVal <= 96 && asciiVal >= 91 ) || (asciiVal <= 126 && asciiVal >= 123 )){
            specialCharFound = true;
        }else if(!(asciiVal <= 122 && asciiVal >= 97)){ //if its not a lower case letter, than the symbol is not allowed
        throw `Password contains invalid symbol(s)! , asciiVal:${asciiVal}`;
      }
    }
    console.log(`upperCaseFound: ${upperCaseFound}`);
    console.log(`numberFound: ${numberFound}`);
    console.log(`specialCharFound: ${specialCharFound}`);
    return  upperCaseFound && specialCharFound && numberFound;
},

    CheckStringWithLength(str,minLength=0,maxLength=1){// make sure that first name is a string first 
    try {
        str = this.checkString(str.trim(),"string");
    } catch (error) {
        throw(error);
    }
    //check that the length is between 2-20 chars
    if(str.length <minLength || str.length >maxLength){throw `name length must be between ${minLength}-${maxLength} chars!`;}
    return str;
  }, 

  GetDate(){
    let date = new Date();
    let Month = date.getMonth()+1;
    let dateString = `${ Month<10 ? "0"+Month : Month}/${date.getDate() <10 ? "0"+date.getDate() : date.getDate()}/${date.getFullYear()}`; 
    return dateString;
  },

    GetLastAccessed(){
        const currentDate = new Date();
        let standardHours = currentDate.getHours() > 12 ? currentDate.getHours() -12 : currentDate.getHours();
        let Month = currentDate.getMonth()+1;
        let timeString =`${Month <10 ? "0"+Month : Month}/${currentDate.getDate() <10 ? "0"+currentDate.getDate() : currentDate.getDate()}/${currentDate.getFullYear()} ${standardHours <10 ? "0"+standardHours : standardHours}:${currentDate.getMinutes() <10 ? "0"+currentDate.getMinutes() : currentDate.getMinutes()}${currentDate.getHours() >= 12 ? "PM" : "AM"}`; 
        return timeString;
    },

    GetTime(){
        const currentDate = new Date();
        let standardHours = currentDate.getHours() > 12 ? currentDate.getHours() -12 : currentDate.getHours();
        let timeString =`${standardHours <10 ? "0"+standardHours : standardHours}:${currentDate.getMinutes() <10 ? "0"+currentDate.getMinutes() : currentDate.getMinutes()}${currentDate.getHours() >= 12 ? "PM" : "AM"}`; 
        return timeString;
    }
};

export default exportedMethods;
