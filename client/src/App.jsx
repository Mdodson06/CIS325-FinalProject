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
      console.log(data)
    })
  }
  console.log(pageType);

  
  async function attemptSignup() {
    //alert("Called Signup");
    var formData = new FormData(document.getElementById('signupForm'));
    var urlData = Object.fromEntries(formData);
    //alert(JSON.stringify(urlData));
    //var urlParams = new URLSearchParams(urlData);
    
    if(formData.get('username').length <= 0 || formData.get('email').length <= 0 || formData.get('password').length <= 0) {
      alert("All fields must be filled");
    } else {
      const url = `http://localhost:8080/api/login/signup`;
      //alert(url);
      //alert(JSON.stringify(urlData));
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
        //alert("Success: " + result.entry);
        alert("Signed up successfully!");
        setLocked(false);
        setPageType("internal");
        setUsername(formData.get("username"));
      } else {
        if(result.error.includes("SQLITE_CONSTRAINT: UNIQUE"))
          alert("Username or email already taken");
        else
        alert("Failure: " + (result.error || "Unknown"));
      }
    }
  }
  async function attemptLogin(){
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
        //alert(entry);
        if(entry == "pass") {
          alert("Welcome " + json.message + "!");
          setLocked(false)
          setPageType("internal");
          setUsername(json.message);
        } else {
          alert("Incorrect username or password");
        }
      }).catch(error => {alert("Second error: "); alert(error)});
    }
  }

  async function logout() {
    //alert("Called");
    const response = await fetch('http://localhost:8080/api/login/logout/', {
      method: 'POST',
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
      const message = json.message;
      if(message != undefined) {
        alert(message);
        setLocked(true);
        setPageType("login");
        setUsername("user");
      } else if(json.error != undefined) {
        alert(json.error);
        setLocked(true);
        setPageType("login");
        setUsername("user");
      }
    }).catch(error => {alert("Second error: "); alert(error)});
  }

  async function updateAccount() {
    //alert("Called");
    var formData = new FormData(document.getElementById('updateAccountForm'));
    if(formData.get('oldPassword').length <= 0) {
      alert("Previous Password Required");
      return;
    }
    if(formData.get('username') == "" && formData.get('email') == "" && formData.get('newPassword') == "" && formData.get('confirmPassword') == ""){
      alert("No fields to update");
      return;
    }
    else if(formData.get('newPassword') != formData.get('confirmPassword')) {
      alert("New and confirm password not equal");
      return;
    }
    formData.delete('confirmPassword');
    var urlData = Object.fromEntries(formData);
    //var urlParams = new URLSearchParams(urlData);
    
    
    //alert(JSON.stringify(urlData));
    //alert(formData.get('oldPassword') + " is bigger than length 0");
    const response = await fetch('http://localhost:8080/api/login/update', {
      method: 'PUT',
      headers: {
      'Content-Type': 'application/json'
      },
      body:JSON.stringify(urlData)
    }).then(response => response.json())
    .then(json => {
      //alert("Recieved response");
      const message = json.message;
      if(message != undefined) {
        alert(message);
      } else if(json.error != undefined) {
          //alert(json.error);
          const errMessage = json.error;
          if(errMessage.includes("UNIQUE"))
            alert("Username or email already taken");
          else if (errMessage.includes("User not logged in")) {
            alert(errMessage);
            setLocked(true);
            setPageType("login");
            setUsername("user");
          }
          else alert(errMessage);
      } else {
        //alert("Message undefined but recieved");
      }
    }).catch(error => {
      alert(error);
    });
    //alert("recieved");
    /* var result = await response.json()
    .then(json => {
      //alert("Recieved response");
      const message = json.message;
      if(message != undefined) {
        alert(message);
      } else if(json.error != undefined) {
          //alert(json.error);
          const errMessage = json.error;
          if(errMessage.includes("UNIQUE"))
            alert("Username or email already taken");
          else if (errMessage.includes("User not logged in")) {
            alert(errMessage);
            setLocked(true);
            setPageType("login");
            setUsername("user");
          }
          else alert(errMessage);
      } else {
        //alert("Message undefined but recieved");
      }
    }).catch(error => {alert("Second error: "); alert(error)});
 */
  }
  async function deleteAccount() {
    //alert("Delete user called");
    var formData = new FormData(document.getElementById('deleteAccountForm'));
    
    if(formData.get('confirmDelete') != "DELETE") {
      alert("Must match 'DELETE' exactly");
      return;
    } 
    //alert(formData.get('oldPassword') + " is bigger than length 0");
    const response = await fetch('http://localhost:8080/api/login/deleteUser', {
      method: 'DELETE',
      headers: {
      'Content-Type': 'application/json'
      }
    })
    .catch(error => {
      alert(error);
    });
    //alert("recieved");
    var result = await response.json()
    .then(json => {
      //alert("Recieved response");
      const message = json.message;
      if(message != undefined) {
        alert(message);
      } else if(json.error != undefined) {
        alert(json.error);
      }else {
        //alert("Message undefined but recieved");
      }
      setLocked(true);
      setPageType("login");
      setUsername("user");
    }).catch(error => {alert("Second error: "); alert(error)});
  }


  //Returning 
  if (locked == true) {
    if(pageType == "login") {
      return (
        <>
        <div className='header'><h1>Creation Login</h1></div>
          <div className='body'>
            <form id="loginForm" onSubmit={e => e.preventDefault()}>
                <div className='question'>
                    <label for="username">Username: </label>
                    <input type="text" name="username" id="username"/>
                </div>
                <br/><br/>
                <div className='question'>
                    <label for="password">Password: </label>
                    <input type="password" name="password" id="password"/>
                </div>
                <p>Or click <a onClick={b =>{setPageType("signup")}}>here</a> to sign up!</p>
              <br/>
              <button type="submit" onClick={attemptLogin}>Log-in</button>
            </form>
          </div>
        </>
      )
    } else if(pageType == "signup") {
      return (
        <>
          <div class="header"><h1>Creation Signup</h1></div>
          <div className='body'>
            <form id="signupForm" onSubmit={e => e.preventDefault()}>
              <div class="question">
                  <label for="username">Username: </label>
                  <div class="questionGroup"><input type="text" name="username" id="newUsername"/>                  </div>
              </div>
              <div class="question">
                  <label for="email">Email: </label>
                  <div class="questionGroup"><input type="email" name="email" id="newEmail"/></div>
              </div>
              <div class="question">
                  <label for="password">Password: </label>
                  <div class="questionGroup"><input type="password" name="password" id="password"/></div>
              </div>
              <button type="submit" onClick={attemptSignup}>Sign up</button>
            </form>
          </div>
        </>
      )
    } else {
      return(
        <>
          ERROR 404: Page not found
        </>
      )
    }
  } else {
    if(pageType == "updateAccount") {
      return (<>
      <div className='header'>
      <div><h1 id="Title">Welcome {username}!</h1></div>
            <div id="dropWithTitle">
              {username}
              <div id="dropdown">
              <p onClick={e=>setPageType("updateAccount")}>Update</p>
              <p onClick={e=>setPageType("deleteAccount")}>Delete Account</p>
              <p onClick={e=>logout()}>Logout</p>
              </div>
            </div>
      </div>
      
              <div className='body'>
                <form id="updateAccountForm" onSubmit={e => e.preventDefault()}>
                  <div class="question">
                      <label for="username">Username: </label>
                      <div class="questionGroup"><input type="text" name="username" id="newUsername"/></div>
                  </div>
                  <div class="question">
                      <label for="email">Email: </label>
                      <div class="questionGroup"><input type="email" name="email" id="newEmail"/></div>
                  </div>
                  <div class="question">
                      <label for="newPassword">New Password: </label>
                      <div class="questionGroup"><input type="password" name="newPassword" id="newPassword"/></div>
                  </div>
                  <div class="question">
                      <label for="confirmPassword">Confirm New Password: </label>
                      <div class="questionGroup"><input type="password" name="confirmPassword" id="confirmPassword"/></div>
                  </div>
                  <div class="question">
                      <label for="oldPassword">*Old Password: </label>
                      <div class="questionGroup"><input type="password" name="oldPassword" id="oldPassword"/></div>
                  </div>
                  <button type="submit" onClick={updateAccount}>Update info</button>
                </form>
                <button onClick={e=>setPageType("internal")}>Back</button>
              </div>


      </>
      )
    } else if (pageType == "deleteAccount") {
      return (
      <>
      <div className='header'>
      <div><h1 id="Title">Welcome {username}!</h1></div>
            <div id="dropWithTitle">
              {username}
              <div id="dropdown">
              <p onClick={e=>setPageType("updateAccount")}>Update</p>
              <p onClick={e=>setPageType("deleteAccount")}>Delete Account</p>
              <p onClick={e=>logout()}>Logout</p>
              </div>
            </div>
      </div>
        <div className='body'>
          <form id="deleteAccountForm" onSubmit={e => e.preventDefault()}>
            <div class="question">
                <label for="confirmDelete">Type "DELETE" to confirm: </label>
                <div class="questionGroup"><input type="text" name="confirmDelete" id="confirmDelete"/></div>
            </div>
            <button onClick={e=>deleteAccount()}>Delete Account</button>      
            </form>
        <button onClick={e=>setPageType("internal")}>Back</button>
        </div>
      </>
      )
    }
    return (
      <>
        <div class="header">

            <div><h1 id="Title">Welcome {username}!</h1></div>
            <div id="dropWithTitle">
              {username}
              <div id="dropdown">
              <p onClick={e=>setPageType("updateAccount")}>Update</p>
              <p onClick={e=>setPageType("deleteAccount")}>Delete Account</p>
              <p onClick={e=>logout()}>Logout</p>
              </div>
            </div>
        </div>
        
        
        <div className='body'>
        <Internal />
        </div>
      </>
    )
  }
}

export default App
