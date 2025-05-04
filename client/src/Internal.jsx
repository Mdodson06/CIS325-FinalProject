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
  
    async function getWorldID(worldName){
      //alert("getWorldID called: " + worldName);
      let urlSubstring = "";
      if(worldName == -1) {
        //alert(`worldName: -1 (${tableType})`);
        urlSubstring = `tableName=${tableType}&name=${worldName}`;
      } else {
        urlSubstring = `tableName=world&name=${worldName}`;
      }
      const url = `http://localhost:8080/api/creation/verify?${urlSubstring}`;
      //alert(url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json'
        },
      })
      .then(result => result.json())
      .then(json => {
        //alert("MESSAGE RESPONSE: " + JSON.stringify(json));
        if(json.length > 1 || json.length < 1) {
          return -1;
        }
        const entry = json[0].id;
        //alert("MESSAGE ID: " + entry);
        return entry;
      })
      .catch(error => {
        //alert("WORLD ID: " + error);
      });
      //alert("WORLD ID AFTER FIRST: " + response);
      return response;
    }

    async function newField(){
      //alert("Called newField");
    var formData = new FormData(document.getElementById('advancedSearchForm'));
    //alert(JSON.stringify(urlData));
    //var urlParams = new URLSearchParams(urlData);
    
    if(formData.get('name').length <= 0) {
      alert("Name must be provided");
      return;
    }

    //TODO: Temporary until colorPallete added
    formData.append("colorPallete","");
    //TODO: Temp until verify worldID 
    if(tableType == "character") {
      if(formData.get("worldName") != "") {
        const worldID = await getWorldID(formData.get("worldName"))
        .then(value => 
          {
            //alert("Done");
            if (value == undefined || value == -1) {
              alert("ERROR: worldID is " + value); //TODO: Replace with notif that there's more than one of that name 
              return -1;
            }
            else {
              //alert("Else: " + value);
              return value;
            }
          });
        //alert("WORLD ID: " + worldID);
        if(worldID == undefined || worldID == -1) return;
        else formData.append("worldID",worldID);
        } else (formData.append("worldID", ""))
        formData.delete("worldName");
    }
    
    
    //formData.append("worldID","");
    var urlData = Object.fromEntries(formData);
  
    const url = `http://localhost:8080/api/creation/${tableType}`;
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
    if(result.message != undefined) {
      alert("Success: " + result.message);
    } else {
      alert("Failure: " + (result.error || "Unknown"));
    }
  
    }

    async function updateField() {
    var formData = new FormData(document.getElementById('advancedSearchForm'));
    var lengthOfForm = 0;
    if(isNaN(formData.get('id'))){
      alert("Not a valid ID number");
      return;
    }
    const realID = parseInt(formData.get('id'));
    formData.append("colorPallete","");
    var tempDelete = new FormData();
    for(const pair of formData.entries()) {
      //console.log("get: " + pair[0]);
      if(pair[1] == "") {
        console.log("Nothing there: " + pair[1]);
        //formData.delete(pair[0]);
        tempDelete.append(pair[0],pair[1]);
      } else {
        lengthOfForm++;
        //console.log("length: " + lengthOfForm);
      }
    }
    //console.log("final length of log: " + lengthOfForm);
    if(lengthOfForm < 2) {
      alert("No fields to update");
      return;
    }
    for(const pair of tempDelete.entries()) {
      formData.delete(pair[0]);
    }
    /* if(tableType == "character") {
      if(formData.get('name') == "" && formData.get('age') == "" && formData.get('pronouns') == "" && 
      formData.get('gender') == "" && formData.get('sexuality') == "" && formData.get('race') == "" &&
      formData.get('backstory') == "" && formData.get('worldID') == ""){
        alert("No fields to update");
        return;
      }
    } else if(tableType == "world") {
      if(formData.get('name') == "" && formData.get('landscape') == "" 
      && formData.get("landscape") == "" && formData.get('landmarks') == "" && formData.get('backstory') == "") {
        alert("No fields to update");
        return;
      }
    } else { //just in case it's set to all
      return;
    } */
            
    if(tableType == "character") {
      if(formData.get("worldName") != undefined) {
      const worldID = await getWorldID(formData.get("worldName"))
      .then(value => 
        {
          //alert("Done");
          if (value == undefined || value == -1) {
            return -1;
          }
          else {
            //alert("Else: " + value);
            return value;
          } //TODO: Some error ikd 
        });
      //alert("WORLD ID: " + worldID);

      if(worldID == undefined || worldID == -1) {
        alert("world does not exist");
        return;
      }
      else formData.append('worldID',worldID);
      } /* else {
        formData.append('worldID',"");
      } */

      //alert("BEFORE worldName");
      //formData.delete("worldName");
      //alert("worldName DELETED");
      
      //alert("tableType: " + tableType);
    }
    var urlData = Object.fromEntries(formData);
    var urlParams = new URLSearchParams(urlData);

    //var urlParams = new URLSearchParams(urlData);
    const url = `http://localhost:8080/api/creation/${tableType}/${realID}?${urlParams}`;
    //alert("ABOUT TO SEND UPDATE");
    //alert(JSON.stringify(urlData));
    //alert(url);

    //alert(formData.get('oldPassword') + " is bigger than length 0");
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
      'Content-Type': 'application/json'
      },
      body:JSON.stringify(urlData)
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
        //alert("MESSAGE: " + message);
        alert(message);
      } else if(json.error != undefined) {
        alert(json.error);
      }else {
        //alert("Message undefined but recieved");
      }
    }).catch(error => {alert("Second error: "); alert(error)});

    //alert("UPDATE FINISHED");
    }
    

    async function deleteField(){
      //alert("Delete field called");
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
        alert(message);
        //alert("Deleted successfully!");
      } else if(json.error != undefined) {
        alert(json.error);
      }else {
        //alert("Message undefined but recieved");
      }
      setPageType("generalSearch");
    }).catch(error => {alert("Second error: "); alert(error)});
    }

    function clearContent() {
      document.getElementById("searchResults").innerHTML = ``;
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
  } else if (pageType=="deleteField"){
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
          </div>
          <div class="question">
          <br/>
          <label for="confirm">Type "DELETE" to confirm: </label>
          <input type="text" name="confirm" id="confirm"/>
          <button onClick={e=>deleteField()}>Submit</button>
        </div>
        
      </form>
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
            { (pageType == "advancedSearch") ?
              <>
                <div class="question">
                  <label for="anyField">Any match: </label>
                  <input type="text" name="anyField" id="anyField"/>
                </div>
              </>
              :
              <>
              <div class="question">
                <label for="backstory">Backstory: </label>
                <input type="text" name="backstory" id="backstory"/>
              </div> 
              </>
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
            { (pageType == "advancedSearch") ?
              <>
                <div class="question">
                  <label for="anyField">Any match: </label>
                  <input type="text" name="anyField" id="anyField"/>
                </div>
              </>
              :
              <>
                <div class="question">
                  <label for="backstory">Backstory: </label>
                  <input type="text" name="backstory" id="backstory"/>
                </div> 
              </>
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
                  <><button onClick={e=>updateField()}>Update</button></> 
              : (pageType == "newField") ? 
              <><button onClick={e=>newField()}>Add</button></>
              : <>ERROR</>
            }
            </>
          }
          
          </form>
        </div>
      </div>
      <div id="searchResults">
          
      </div>
      <button onClick={e=>{
        {clearContent();
        setPageType("generalSearch");}
      }}>Back</button>
    </>
    )
  }
}
export default Internal
