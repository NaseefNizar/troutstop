function fnameValidate(){
  let name=document.getElementById("fname").value;
  console.log(name);
   if(name ==""){
    document.getElementById("FName").innerHTML="please enter a valid firstname";
    return false
     }else{
      document.getElementById("FName").innerHTML="";
        return true
     }
}



function lnameValidate(){
  let name=document.getElementById("lname").value;
  console.log(name);
   if(name ==""){
    document.getElementById("LName").innerHTML="please enter a valid lastname";
    return false
     }else{
      document.getElementById("LName").innerHTML="";
        return true
     }
}
function emailValidate(){
  let emailId=document.getElementById("email").value;
  console.log("emailId"+emailId);
  if(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(emailId)==false){
    document.getElementById("Email").innerHTML="Enter valid email ";
    return false;
  }else{
    document.getElementById("Email").innerHTML="";
    return true;
  }
}
function numberValidate(){
  let number=document.getElementById("phonenumber").value;
   if(/^[0-9]+$/.test(number)==false){
    document.getElementById("Phonenumber").innerHTML="please enter a valid number";
    return false
   }
  else if(number.length != 10){
    document.getElementById("Phonenumber").innerHTML="please enter 10 digits";
    return false
     }else{
      document.getElementById("Phonenumber").innerHTML="";
        return true
     }
}
function zipValidate(){
  let number=document.getElementById("zip").value;
   if(/^[0-9]+$/.test(number)==false){
    document.getElementById("zipcode").innerHTML="please enter valid zip";
    return false
   }
  else if(number.length != 6){
    document.getElementById("Zipcode").innerHTML="enter valid zip";
    return false
     }else{
      document.getElementById("Zipcode").innerHTML="";
        return true
     }
}
let password; 
function passwordValidate(){
  password=document.getElementById("password").value; 
  console.log(password);
   if(password.length <6){
    document.getElementById("Password").innerHTML="Enter valid password";
    return false
     }else{
      document.getElementById("Password").innerHTML="";
        return true
     }
}
function passwordValidate2(){
  let password2=document.getElementById("password2").value;
  console.log(password2)
   if(password2 != password || password2==""){
    document.getElementById("Password2").innerHTML="Password not match";
    return false
     }else{
      document.getElementById("Password2").innerHTML="";
      return true
     }
    }

function loginValidate(){
      if(emailValidate()&&passwordValidate()){
        return true
      }else{
        return false
      }
    }

function validate(){
  if(fnameValidate()&&lnameValidate()&&emailValidate()&&numberValidate()&&zipValidate()&&passwordValidate()&&passwordValidate2()){
    return true
  }else{
    return false
  }
}







