import { useState } from 'react'
import axios from 'axios';
import './App.css'
import Internal from './Internal.jsx'


//Main Page
function App() {
  const [locked, setLocked] = useState(true)
  const [pageType, setPageType] = useState("login");
  const [username, setUsername] = useState("user");
  const getBackend = () => {
    axios.get('http://localhost:8080').then((data) => {
      //this console.log will be in our frontend console
      console.log(data)
    })
  }
  console.log(pageType);

  
  async function attemptSignup(event) {
    alert("Called Signup");
    var formData = new FormData(document.getElementById('signupForm'));
    var urlData = Object.fromEntries(formData);
    //alert(JSON.stringify(urlData));
    //var urlParams = new URLSearchParams(urlData);
    
    if(formData.get('username').length <= 0 || formData.get('email').length <= 0 || formData.get('password').length <= 0) {
      alert("All fields must be filled");
    } else {
      const url = `http://localhost:8080/api/login/signup`;
      alert(url);
      alert(JSON.stringify(urlData));
      const response = await fetch(url, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body:JSON.stringify(urlData)
      })
      .catch(error => {
        alert(error);
      });   
      const result = await response.json();
      if(result.entry != undefined) {
        alert("Success: " + result.entry);
        setLocked(false);
        setPageType("generalSearch");
        setUsername(formData.get("username"));
      } else {
        alert("Failure: " + (result.error || "Unknown"));
      }
    }
  }
  async function attemptLogin(event){
    //alert("Called");
    var formData = new FormData(document.getElementById('loginForm'));
    var urlData = Object.fromEntries(formData);
    var urlParams = new URLSearchParams(urlData);
    
    if(formData.get('username').length <= 0 || formData.get('password').length <= 0) {
      alert("All fields must be filled");
    } else {
      const url = `http://localhost:8080/api/login/loginAttempt?${urlParams}`;
      //alert(url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json'
        },
      })
      .catch(error => {
        alert(error);
      });
      
      var result = await response.json()
      .then(json => {  
        //alert("Recieved response");
        const entry = json.entry;
        alert(entry);
        if(entry == "pass") {
          alert("Welcome " + json.message + "!");
          setLocked(false)
          setPageType("generalSearch");
          setUsername(json.message);
        } 
      }).catch(error => {alert("Second error: "); alert(error)});
    }
  }

  if (locked == true) {
    if(pageType == "login") {
      return (
        <>
          <h1 class="header">Creation Login</h1>
          <div>
            <form id="loginForm" onSubmit={e => e.preventDefault()}>
              <div class="question">
                  <label for="username">Username/Email: </label>
                  <input type="text" name="username" id="username"/>
              </div>
              <br/><br/>
              <div class="question">
                  <label for="password">Password: </label>
                  <input type="password" name="password" id="password"/>
              </div>
              <br/><br/>
              <button type="submit" onClick={attemptLogin}>Log-in</button>
            </form>
          </div>
          <p>Or click <a onClick={b =>{setPageType("signup")}}>here</a> to sign up!</p>
        </>
      )
    } else if(pageType == "signup") {
      return (
        <>
          <h1 class="header">Creation Signup</h1>
          <p>{locked}</p>
          <div>
            <form id="signupForm" onSubmit={e => e.preventDefault()}>
              <div class="question">
                  <label for="username">Username: </label>
                  <input type="text" name="username" id="newUsername"/>
              </div>
              <div class="question">
                  <label for="email">Email: </label>
                  <input type="email" name="email" id="newEmail"/>
              </div>
              <div class="question">
                  <label for="password">Password: </label>
                  <input type="password" name="password" id="newPassword"/>
              </div>
              <button type="submit" onClick={attemptSignup}>Sign up</button>
            </form>
          </div>
        </>
      )
    } else {
      return(
        <>
          <h1>Real type: {pageType}</h1>
        </>
      )
    }
  } else {
    return (
      <>
        <h1>Welcome {username}!</h1>
        <Internal />
      </>
    )
  }
}

export default App
