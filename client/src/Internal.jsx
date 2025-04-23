import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import axios from 'axios';
import './App.css'

//Main Page
function Internal() {
  const [pageType, setPageType] = useState("generalSearch");
  //const [ids, setIDs] = useState([]); //{} ? 
  const [tableType, setTableType] = useState("character");
  //const [openEntity,setOpenEntity] = useState(-1);
  //const [tableJson, setTableJson] = useState("");
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
        let htmlText = `<table> <tr>`;
        //alert("Response: " + JSON.stringify(json));
        //setIDs([]);
        if(jsonArray.length <= 0) {
            //alert("Empty needed: " + JSON.stringify(json))
            //hardcoded 
            htmlText += `<th>name</th>`;
            htmlText += `<th>type</th>`;
            htmlText += `</tr>`;
            htmlText += `</table>`;

        } else {
            const obs = Object.keys(jsonArray[0]);
            for (let i = 0; i < obs.length; i++) {
                htmlText += `<th> ${obs[i]} </th>`;
            }
            htmlText += `</tr>`
            for (let i = 0; i < jsonArray.length; i++) {
                var row = Object.values(jsonArray[i]);
                //setIDs(curr => [...curr,row[i]]); //*HOLD
                htmlText += `<tr>`; //TODO: Try to turn to map so can use onClick 
                for (let j = 0; j < row.length; j++) {
                    htmlText += `<td> ${row[j]} </td>`;                        
                }
                htmlText +=`</tr>`;
            }
            htmlText += `</table>`;
        }
        //if(tableType == "all") setTableJson(prev => [...prev, htmlText]);
        document.getElementById("searchResults").innerHTML = htmlText;
        

      }).catch(error => {/* alert("Second error: ");  */alert(error)});
    }

      async function advancedSearchAll() {
      //setIDs(ids.filter(a=>false));
      //alert("**IDS PRE SEARCH: " + ids);
      await advancedSearch("character");
      const characterHTML = document.getElementById("searchResults").innerHTML;
      //const holdIndexes = ids;
      //alert("held indexes: " + holdIndexes);
      await advancedSearch("world");
      //alert("characterHTML: " + characterHTML);
      const worldHTML = document.getElementById("searchResults").innerHTML;
      document.getElementById("searchResults").innerHTML = `<div>${characterHTML}${worldHTML}</div>`
      //setIDs(prevIDS => [...holdIndexes, prevIDS]);
      //alert("*IDS (all help): " + ids);
    }
    //Only checks for character so far 
    async function advancedSearch(searchType) {
      //alert("Called");
      var form = new FormData(document.getElementById('advancedSearchForm'));
      //var urlData = Object.fromEntries(formData);
      var urlParams = new URLSearchParams();
      urlParams.append("tableName",searchType);

      //check each id for data
      for(var pair of form.entries()) {
        if(pair[1] != "") {//if the form has info
          //alert(pair[0] + ": " + pair[1]);
          urlParams.append(pair[0],pair[1]);
        }
      }
     
      const url = `http://localhost:8080/api/creation/advanced?${urlParams}`;
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
          
          var htmlText = `${searchType} <table> <tr>`;
          //alert("Response: " + JSON.stringify(json));
          if(tableType!="all"){
            //alert("tableType not all");
            //setIDs([]);
          }
          if(jsonArray.length <= 0) {
              //alert("Empty needed: " + JSON.stringify(json))
              //hardcoded 
              if(searchType=="character") {
                htmlText +=`<strong>Character</strong>`
                htmlText += `<th>id</th>`;
                htmlText += `<th>name</th>`;
                htmlText += `<th>age</th>`;
                htmlText += `<th>pronouns</th>`;
                htmlText += `<th>gender</th>`;
                htmlText += `<th>sexuality</th>`;
                htmlText += `<th>race</th>`;
                htmlText += `<th>backstory</th>`;
                htmlText += `<th>colorPallete</th>`;
                htmlText += `<th>world</th>`;
                htmlText += `</tr>`;
                htmlText += `</table>`;
              }
              
              else if(searchType == "world") {
              htmlText +=`<strong>World</strong>`;
              htmlText += `<th>id</th>`;
              htmlText += `<th>name</th>`;
              htmlText += `<th>landscape</th>`;
              htmlText += `<th>landmarks</th>`;
              htmlText += `<th>colorPallete</th>`;
              htmlText += `<th>backstory</th>`;
              htmlText += `</tr>`;
              htmlText += `</table>`;
              }  
          } else {
              const obs = Object.keys(jsonArray[0]);
              for (let i = 0; i < obs.length; i++) { //1 to skip over id
                htmlText += `<th> ${obs[i]} </th>`;
              }
              htmlText += `</tr>`;
              //prepare id array 
              var tempIDs = [];
              for (let i = 0; i < jsonArray.length; i++) { 
                  var row = Object.values(jsonArray[i]);
                  htmlText += `<tr>`;
                  //setIDs([...ids,row[0]]);

                  for (let j = 0; j < row.length; j++) { 
                    if(j == 0) {
                      tempIDs.push(row[j]);
                      //alert("ROW ID: " + row[j]);
                      //alert("STATE ID: " + ids);
                      
                    }  
                    //else {
                      htmlText += `<td> ${row[j]}</td>`;
                    //}
                  }
                  htmlText +=`</tr>`;
              }
              htmlText += `</table>`;
              //alert("TEMPIDS: " + tempIDs[0]);
              //setIDs(tempIDs);
              //alert(`**IDS ${searchType} ` + ids);
              
          }
          document.getElementById("searchResults").innerHTML = htmlText;
        }).catch(error => {/* alert("Second error: "); */ alert(error)});
      }
  
    /* async function updateField(fieldID) {
      let tableID = -1;
      if(fieldID < 0) { 
        alert("Invalid row");
      }
      try {
        tableID = ids.at(fieldID);
      } catch (error) {
        alert("Invalid row");
        return;
      }

      alert("Called");
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
    
    
    alert(JSON.stringify(urlData));
    //alert(formData.get('oldPassword') + " is bigger than length 0");
    const response = await fetch(`http://localhost:8080/api/creation/${urlParams}`, {
      method: 'PUT',
      headers: {
      'Content-Type': 'application/json'
      },
      body:JSON.stringify(urlData)
    })
    .catch(error => {
      alert(error);
    });
    alert("recieved");
    var result = await response.json()
    .then(json => {
      //alert("Recieved response");
      const message = json.message;
      if(message != undefined) {
        alert(message);
      } else if(json.error != undefined) {
        alert(json.error);
        setLocked(true);
        setPageType("login");
        setUsername("user");
      }else {
        alert("Message undefined but recieved");
      }
    }).catch(error => {alert("Second error: "); alert(error)});

    } */
    
    async function newField(insertType){


    }

    async function updateField(){

    }

    async function deleteField(){
      alert("Delete field called");
    var formData = new FormData(document.getElementById('deleteForm'));
    
    if(formData.get('confirm') != "DELETE") {
      alert("Must match 'DELETE' exactly");
      return;
    } 
    const id= formData.get("id");

    const response = await fetch(`http://localhost:8080/api/creation/${tableType}/${id}`, {
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
        //alert(message);
      } else if(json.error != undefined) {
        alert(json.error);
      }else {
        //alert("Message undefined but recieved");
      }
      setPageType("generalSearch");
    }).catch(error => {alert("Second error: "); alert(error)});
    }















  if(pageType == "generalSearch") {
      return (
        <>
          <div>
            <div>
            <button onClick={e=>{setPageType("newField")}}>New</button>
            <button onClick={e=>{setPageType("updateField")}}>Update</button>
            <button onClick={e=>{setPageType("deleteField")}}>Delete</button>
            </div>
              <div class="question">
              <p>By:</p>
                <input type="radio" id="characterTable" name="tableType" onChange={e=>setTableType("character")}/>
                <label for="characterTable">Character</label>
                <br/>
                <input type="radio" id="worldTable" name="tableType" onChange={e=>setTableType("world")}/>
                <label for="worldTable">World</label>
                <br/>
                <input type="radio" id="allTables" name="tableType" onChange={e=>setTableType("all")}/>
                <label for="allTables">All</label>
              </div>
          </div>

          <div>
            
            <form id="generalSearchForm" onSubmit={e => e.preventDefault()}>
              <div class="question">
                  <label for="search">Search: </label>
                  <input type="text" name="search" id="search"/>
                  <button onClick={e=>basicSearch(tableType)}>Search</button>

              </div>
              <a onClick={e=>setPageType("advancedSearch")}>Advanced</a>
            {/* <button onClick={e=>basicSearch("character")}>Search characters</button>
            <button onClick={e=>basicSearch("world")}>Search Worlds</button>
            <button onClick={e=>basicSearch("all")}>Search All</button> */}
            </form>
          </div>
          <div id="searchResults">
            
          </div>
        </>
      )
    }else if (pageType=="deleteField"){
      return(<>
        <div class="question">
        <form id="deleteForm" onSubmit={e => e.preventDefault()}>
          <div class="question">
            <label for="id">Delete ID: </label>
            <input type="text" name="id" id="id"/>
            </div>
            <p>From:</p>
            <div class="question">

              <input type="radio" id="characterTable" name="tableType" onChange={e=>setTableType("character")}/>
              <label for="characterTable">Character</label>
              <br/>
              <input type="radio" id="worldTable" name="tableType" onChange={e=>setTableType("world")}/>
              <label for="worldTable">World</label>
              <br/>
              <input type="radio" id="allTables" name="tableType" onChange={e=>setTableType("all")}/>
              <label for="allTables">All</label>
            </div>
            <div class="question">
            <br/>
            <label for="confirm">Type "DELETE" to confirm: </label>
            <input type="text" name="confirm" id="confirm"/>
            <button onClick={e=>deleteField()}>Submit</button>
          </div>
          
        </form>
        <div id="searchResults"></div>  
        <button onClick={e=>setPageType("generalSearch")}>Back</button>
        </div>
      </>)
    
    } else {// if(pageType == "advancedSearch") {
      return (
        <>
          <div>
            <div>
              <button onClick={e=>{setPageType("newField")}}>New</button>
              <button onClick={e=>{setPageType("updateField")}}>Update</button>
              <button onClick={e=>{setPageType("deleteField")}}>Delete</button>
            </div>
            <div class="question">
              By:<br/>
              <input type="radio" id="characterTable" name="tableType" onChange={e=>setTableType("character")}/>
              <label for="characterTable">Character</label>
              <br/>
              <input type="radio" id="worldTable" name="tableType" onChange={e=>setTableType("world")}/>
              <label for="worldTable">World</label>
              <br/>
              {(pageType=="advancedSearch") ?
                <>
                  <input type="radio" id="allTables" name="tableType" onChange={e=>setTableType("all")}/>
                  <label for="allTables">All</label>
                </> 
                : (tableType == "all") ? setTableType("character") :<></>
              }
              
            </div>
            
            {/* getting form type based on selection dynamically */}
            <div>
            <form id="advancedSearchForm" onSubmit={e => e.preventDefault()}>
            {(pageType == "updateField") ? 
            <>
            <div class="question">
              <label for="id">Update ID: </label>
              <input type="text" name="id" id="id"/>
            </div>
            </> : <></>
            }
            {(tableType=="character") ? 
              <>
              <div class="question">
                  <label for="name">Name: </label>
                  <input type="text" name="name" id="name"/>
              </div>
              <div class="question">
                  <label for="age">Age: </label>
                  <input type="text" name="age" id="age"/>
              </div>
              <div class="question">
                  <label for="pronouns">Pronouns: </label>
                  <input type="text" name="pronouns" id="pronouns"/>
              </div>
              <div class="question">
                  <label for="gender">Gender: </label>
                  <input type="text" name="gender" id="gender"/>
              </div>
              <div class="question">
                  <label for="sexuality">Sexuality: </label>
                  <input type="text" name="sexuality" id="sexuality"/>
              </div>
              <div class="question">
                  <label for="race">Race: </label>
                  <input type="text" name="race" id="race"/>
              </div>
              <div class="question">
                  <label for="worldName">Home World: </label>
                  <input type="text" name="worldName" id="worldName"/>
              </div>             
              { (pageType == advancedSearch) ?
                <>
                  <div class="question">
                    <label for="anyField">Any match: </label>
                    <input type="text" name="anyField" id="anyField"/>
                  </div>
                </>
                :
                <></>
              }
              {/* <button onClick={e=>advancedSearch("character")}>Search</button> */}
              </>
              :
              (tableType == "world") ? 
              <>
              <div class="question">
                  <label for="name">Name: </label>
                  <input type="text" name="name" id="name"/>
              </div>
              <div class="question">
                  <label for="landscape">Landscape: </label>
                  <input type="text" name="landscape" id="landscape"/>
              </div>
              <div class="question">
                  <label for="landmarks">Landmarks: </label>
                  <input type="text" name="landmarks" id="landmarks"/>
              </div>              
              { (pageType == advancedSearch) ?
                <>
                  <div class="question">
                    <label for="anyField">Any match: </label>
                    <input type="text" name="anyField" id="anyField"/>
                  </div>
                </>
                :
                <></>
              }
              {/* <button onClick={e=>advancedSearch("world")}>Search</button> */}
              </>
             : (tableType == "all") ? 
              <>
              <div class="question">
                  <label for="name">Name: </label>
                  <input type="text" name="name" id="name"/>
              </div>
              <div class="question">
                  <label for="age">Age: </label>
                  <input type="text" name="age" id="age"/>
              </div>
              <div class="question">
                  <label for="pronouns">Pronouns: </label>
                  <input type="text" name="pronouns" id="pronouns"/>
              </div>
              <div class="question">
                  <label for="gender">Gender: </label>
                  <input type="text" name="gender" id="gender"/>
              </div>
              <div class="question">
                  <label for="sexuality">Sexuality: </label>
                  <input type="text" name="sexuality" id="sexuality"/>
              </div>
              <div class="question">
                  <label for="race">Race: </label>
                  <input type="text" name="race" id="race"/>
              </div>
              <div class="question">
                  <label for="worldName">Home World (for characters): </label>
                  <input type="text" name="worldName" id="worldName"/>
              </div>
              <div class="question">
                  <label for="name">Name: </label>
                  <input type="text" name="name" id="name"/>
              </div>
              <div class="question">
                  <label for="landscape">Landscape: </label>
                  <input type="text" name="landscape" id="landscape"/>
              </div>
              <div class="question">
                  <label for="landmarks">Landmarks: </label>
                  <input type="text" name="landmarks" id="landmarks"/>
              </div>             
              <div class="question">
                  <label for="anyField">Any match: </label>
                  <input type="text" name="anyField" id="anyField"/>
              </div>
              </>
              :<>ERROR: TableType?</>
            }
            { /* Advanced search vs update vs new search checks */
              <>
              {(pageType == "advancedSearch") ? 
                  (tableType == "all") ? <button onClick={e=>advancedSearchAll()}>Search</button>
                  : <button onClick={e=>advancedSearch(tableType)}>Search</button>
                : (pageType == "updateField") ?
                    <>UPDATE FIELD</> 
                : (pageType == "newField") ? 
                <>NEW FIELD</>
                : <>ERROR</>
              }
              </>
            }
            
            </form>
          </div>
        </div>
        <div id="searchResults">
            
        </div>
        <button onClick={e=>setPageType("generalSearch")}>Back</button>
      </>
      )
    } /* else if(pageType == "newField") { 
      return (
        <>
          <div>
              <div class="question">
              <p>Search:</p>
                <input type="radio" id="characterTable" name="tableType" onChange={e=>setTableType("character")}/>
                <label for="characterTable">Character</label>
                <br/>
                <input type="radio" id="worldTable" name="tableType" onChange={e=>setTableType("world")}/>
                <label for="worldTable">World</label>
                <br/>
            </div>
            
            {/* getting form type based on selection dynamically * /}
            <div>
            <form id="newFieldForm" onSubmit={e => e.preventDefault()}>
            {(tableType=="character") ? 
              <>
              <div class="question">
                  <label for="name">*Name: </label>
                  <input type="text" name="name" id="name"/>
              </div>
              <div class="question">
                  <label for="age">Age: </label>
                  <input type="text" name="age" id="age"/>
              </div>
              <div class="question">
                  <label for="pronouns">Pronouns: </label>
                  <input type="text" name="pronouns" id="pronouns"/>
              </div>
              <div class="question">
                  <label for="gender">Gender: </label>
                  <input type="text" name="gender" id="gender"/>
              </div>
              <div class="question">
                  <label for="sexuality">Sexuality: </label>
                  <input type="text" name="sexuality" id="sexuality"/>
              </div>
              <div class="question">
                  <label for="race">Race: </label>
                  <input type="text" name="race" id="race"/>
              </div>
              <div class="question">
                  <label for="worldName">Home World: </label>
                  <input type="text" name="worldName" id="worldName"/>
              </div>
              <button onClick={e=>newField("character")}>Search</button>
              </>
              :
              (tableType == "world") ? 
              <>
              <div class="question">
                  <label for="name">*Name: </label>
                  <input type="text" name="name" id="name"/>
              </div>
              <div class="question">
                  <label for="landscape">Landscape: </label>
                  <input type="text" name="landscape" id="landscape"/>
              </div>
              <div class="question">
                  <label for="landmarks">Landmarks: </label>
                  <input type="text" name="landmarks" id="landmarks"/>
              </div>
              <button onClick={e=>newField("world")}>Search</button>
              </>
            : "ERROR: Search by type not found"  
            }
            </form>
          </div>
          </div>
          <div id="searchResults">
            
          </div>
          <button onClick={e=>setPageType("generalSearch")}>Back</button>
        </>
      )
    }
     else {
        return(
        <>
            <h1>Real type: {pageType}</h1>
        </>
        )
    }*/
  }
export default Internal
