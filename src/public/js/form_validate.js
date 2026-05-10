
//################ HELPER FUNCTION DECLARATIONS ####################

function checkString(strVal, varName= "none") {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
}

function checkStringArray(arr, varName) {
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
  }

function CheckName(name="",value=""){// make sure that first name is a string first 
    try {
        name = checkString(name.trim(),value);
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
  }

function CheckHandle(handle){// make sure that first name is a string first 
    try {
        handle = checkString(handle.trim(),"handle");
    } catch (error) {
        throw(error);
    }
    //check that the length is between 5-25 chars
    if(handle.length <5 || handle.length >25){throw "Username length must be between 5-25 chars!";}
    for(let i = 0;i<handle.length; i++){
        let asciiVal = handle.charCodeAt(i); //https://www.geeksforgeeks.org/javascript/how-to-convert-character-to-ascii-code-using-javascript/
        if(!((asciiVal <= 122 && asciiVal >= 97 )|| (asciiVal <= 90 && asciiVal >= 65 )||
        (asciiVal <= 57 && asciiVal >= 48)) && asciiVal !== 45 && asciiVal !== 95){ //allow - and _ in the handle, but no other special chars
            throw "Username must contain only valid characters! (A-Z,a-z,1-9,-,_)";
        }
    }
    return handle;
  }

function CheckPassword(pw){// make sure that first name is a string first 
    try {
        pw = checkString(pw.trim(),"password");
    } catch (error) {
        throw(error);
    }
    let upperCaseFound = false;
    let specialCharFound = false;
    let numberFound = false;
    //check that the length is >=8 chars
    if(pw.length <8){throw "password length must be at least 8 chars!";}
    for(let i = 0;i<pw.length; i++){
        let asciiVal = pw.charCodeAt(i); 
        if(asciiVal <= 90 && asciiVal >= 65 ){upperCaseFound = true;}
        else if(asciiVal <= 57 && asciiVal >= 48){numberFound = true;}
        else if((asciiVal <= 47 && asciiVal >= 33 ) || (asciiVal <= 64 && asciiVal >= 58 )||
            (asciiVal <= 96 && asciiVal >= 91 ) || (asciiVal <= 126 && asciiVal >= 123 )){
            specialCharFound = true;
        }else if(!(asciiVal <= 122 && asciiVal >= 97)){ //if its not a lower case letter, than the symbol is not allowed
        throw `Password contains invalid symbol(s)! , asciiVal:${asciiVal}`;
      }
    }
    // console.log(upperCaseFound);
    // console.log(numberFound);
    // console.log(specialCharFound);
    return upperCaseFound && specialCharFound && numberFound;
}

    
function CheckStringWithLength(str,minLength=0,maxLength=1){// make sure that first name is a string first 
    try {
        str = checkString(str.trim(),"string");
    } catch (error) {
        throw(error);
    }
    //check that the length is between 2-20 chars
    if(str.length <minLength || str.length >maxLength){throw `name length must be between ${minLength}-${maxLength} chars!`;}
    return str;
}


//################ FIND ELEMENTS IN THE DOM HERE  ####################
let signupForm = document.getElementById('signup-form');
let signinForm = document.getElementById('signin-form');
let errorListSI = document.getElementById('ErrorListSignIn');
let errorListSU = document.getElementById('ErrorListSignUp');

//################ SIGNUP FORM CHECKING ####################
console.log("SIGNUP FORM CLIENT SIDE CHECKING ACTIVE");
//input validation for sign up form 
if(signupForm){
    //#1. Gather all input values from the form 
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();

        errorListSU.innerHTML = '' //clear the old errors from last failed submission
        let errors = [];


        // Get our inputs
        let email = document.getElementById('email').value.trim();
        let firstName = document.getElementById('firstName').value.trim();
        let lastName = document.getElementById('lastName').value.trim();
        let username = document.getElementById('username').value.trim();
        let password = document.getElementById('password').value.trim();
        let confirmPassword = document.getElementById('confirmPassword').value.trim();
        let dateOfBirth = document.getElementById('dateOfBirth').value;


        //input checking 
        //if element is bad append child to the error list 

        try{
            firstName = CheckName(firstName.trim(),"First Name");
        }catch(error){
            errors.push(`${error}`);
        }

        try{
            lastName = CheckName(lastName.trim(), "Last Name");
        }catch(error){
            errors.push(`${error}`);
        }

        try{
            username = CheckHandle(username.trim().toLowerCase());
        }catch(error){
            errors.push(`Invalid username given: ${error}`);
        }

        let isValidPassword = false;
        try{
            isValidPassword =CheckPassword(password.trim());
        }catch(error){
            errors.push(`invalid password value given: ${error}`);
        }
        if(!isValidPassword){
            errors.push(`Password is invalid`);
        }

        try{
            CheckPassword(confirmPassword.trim());
        }catch(error){
            errors.push(`invalid confirmed password value given: ${error}`);
        }
        if(confirmPassword !== password){
            errors.push("passwords do not match!");
        }


        try{
            checkString(email.trim());
        }catch(error){
            errors.push(`email not a string: ${error}`);
        }
        /*the expression says this:
        1. the email must start with 1 or more (+) of these chars [A-Za-z0-9!#$&'*\/=?^`{}~]
        2.after that, it follows the format of .validText.ValidText2. for 0 or more of them (*), if there is a dot, it must be followed by valid text([A-Za-z0-9!#$&'*\/=?^`{}~]+)
        3. Must have 1 @ followed by or or more chars in this [A-Za-z0-9]
        4. dots . must be escaped (learned the hard way via debugging) \.
        5. email must end in one of the four big TLD's 
        */
        const emailRegex = /^[A-Za-z0-9!#$&'*\/=?^`{}~]+(\.[A-Za-z0-9!#$&'*\/=?^`{}~]+)*@[A-Za-z0-9-]+\.(com|org|gov|edu|ai)$/;
        if(!emailRegex.test(email)){
            errors.push("email formatted incorrectly");
        }
        
        const MIN_USER_AGE =13
        let today = new Date();
        const dobDate = new Date(dateOfBirth);

        if (isNaN(dobDate.getTime())) {
            errors.push("Invalid date of birth format");
        }

        //might have to consider leap years in the approach 
        const minDate = new Date(today.getFullYear() - MIN_USER_AGE,today.getMonth(),today.getDate());
        if (dobDate>minDate){ //user DOB is after the minimum age cutoff (ie. they are younger than the min age)
            errors.push("Must be 13 years or older to use Bitecheck!");
        }
        
        //if no input errors (form is valid)
        
        if(errors.length >0){
            errorListSU.hidden = false;
            for (let err of errors) {
                let li = document.createElement('li');
                li.innerText = err;
                errorListSU.appendChild(li);
            }

        }else{// form is filled out correctly
            errorListSU.hidden = true;
            signupForm.submit();
        }
    });
}
//################ SIGN-IN FORM CHECKING ####################

//input validation for sign in form 
if(signinForm){
    //#1. Gather all input values from the form 
    signinForm.addEventListener('submit', (event) => {
        event.preventDefault();

        errorListSI.innerHTML = '' //clear the old errors from last failed submission
        let errors = [];

        // Get our inputs

        let email = document.getElementById('email').value.trim();
        let password = document.getElementById('password').value;

        //input checking 
        //if element is bad append child to the error list 

        const emailRegex = /^[A-Za-z0-9!#$&'*\/=?^`{}~]+(\.[A-Za-z0-9!#$&'*\/=?^`{}~]+)*@[A-Za-z0-9-]+\.(com|org|gov|edu|ai)$/;
        if(!emailRegex.test(email)){
            errors.push("email formatted incorrectly");
        }

        let isValidPassword = false;
        try{
            isValidPassword =CheckPassword(password.trim());
        }catch(error){
            errors.push(`Email or Password is invalid`);
        }
        if(!isValidPassword){
            errors.push(`Email or Password is invalid`);
        }


        //if no input errors (form is valid)
        if(errors.length >0){
            errorListSI.hidden = false;
            for (let err of errors) {
                let li = document.createElement('li');
                li.innerText = err;
                errorListSI.appendChild(li);
            }

        }else{// form is filled out correctly
            errorListSI.hidden = true;
            signinForm.submit();
        }
    });
}
