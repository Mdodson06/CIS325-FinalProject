import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import axios from 'axios';
import './App.css'

//Main Page
function Internal() {
  const [pageType, setPageType] = useState("generalSearch");
  const [username, setUsername] = useState("user"); //try to pass from App
  
  async function generalSearch(event){
    alert("Called");
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
  async function basicSearch(searchType) {
    var searchTerm = new FormData(document.getElementById('generalSearchForm')).get("search");
    //var urlData = Object.fromEntries(formData);
    var urlParams = new URLSearchParams();
    
    urlParams.append("tableName",searchType);
    urlParams.append("name",searchTerm)

    var searchTerm = new FormData(document.getElementById('generalSearchForm')).get("search");
    //var urlData = Object.fromEntries(formData);
    var urlParams = new URLSearchParams();
    
    urlParams.append("tableName",searchType);
    urlParams.append("name",searchTerm)
    const url = `http://localhost:8080/api/creation?${urlParams}`;

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
        const jsonArray = Object.values(json);
        var htmlText = '<table> <tr>';
        alert("Response: " + JSON.stringify(json));
        
        if(jsonArray.length <= 0) {
            alert("Empty needed: " + JSON.stringify(json))
            //hardcoded 
            htmlText += '<th>name</th>';
            htmlText += '<th>type</th>';
            htmlText += '</tr>'
            htmlText += "</table>"

        } else {
            const obs = Object.keys(jsonArray[0]);
            for (let i = 0; i < obs.length; i++) {
                htmlText += '<th>' + obs[i] + '</th>';
            }
            htmlText += '</tr>'
            for (let i = 0; i < jsonArray.length; i++) {
                var row = Object.values(jsonArray[i]);
                htmlText += '<tr>'
                for (let j = 0; j < row.length; j++) {
                    htmlText += '<td>' + row[j] + '</td>';                        
                }
                htmlText +="</tr>"
            }
            htmlText += "</table>"
        }
        document.getElementById("searchResults").innerHTML = htmlText;
      }).catch(error => {alert("Second error: "); alert(error)});





/* 
    //Blank form should just return a selection of all fields as handled currently
    /* if(formData.get('search').length <= 0) {
      alert("All fields must be filled");
    } * /
    const url = `http://localhost:8080/api/creation?${urlParams}`;
    //const url = `http://localhost:8080/api/creation?tableName=${searchType}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json'
        },
      })
      .then(response => {
        var json = response.json(); 
        const jsonArray = Object.values(json);
        var htmlText = '<table> <tr>';
        





        alert("Response: " + JSON.stringify(json));
        




        if(jsonArray.length <= 0) {
            alert("Empty needed: " + JSON.stringify(json))
            //hardcoded 
            htmlText += '<th>name</th>';
            htmlText += '<th>type</th>';
            htmlText += '</tr>'
            htmlText += "</table>"

        }
        else {
            const obs = Object.keys(jsonArray[0]);
            for (let i = 0; i < obs.length; i++) {
                htmlText += '<th>' + obs[i] + '</th>';
            }
            htmlText += '</tr>'
            for (let i = 0; i < jsonArray.length; i++) {
                var row = Object.values(jsonArray[i]);
                htmlText += '<tr>'
                for (let j = 0; j < row.length; j++) {
                    htmlText += '<td>' + row[j] + '</td>';                        
                }
                htmlText +="</tr>"
            }
            htmlText += "</table>"
        }
        document.getElementById("searchResults").innerHTML = htmlText;
    })
      .catch(error => {
        alert(error);
      }); */
  }

  if(pageType == "generalSearch") {
      return (
        <>
          <div>
            <form id="generalSearchForm" onSubmit={e => e.preventDefault()}>
              <div class="question">
                  <label for="search">Search: </label>
                  <input type="text" name="search" id="search"/>
              </div>
              <a>Advanced search</a>
              <button onClick={e=>basicSearch("character")}>Search characters</button>
            <button onClick={e=>basicSearch("world")}>Search Worlds</button>
            <button onClick={e=>basicSearch("all")}>Search All</button>
            </form>
          </div>
          <div>
            
          </div>
          <div id="searchResults"></div>
        </>
      )
    } else {
        return(
        <>
            <h1>Real type: {pageType}</h1>
        </>
        )
    }
  }
export default Internal
