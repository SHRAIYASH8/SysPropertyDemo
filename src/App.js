import React, { useState, useEffect } from 'react';
import './App.css';
import { forwardRef } from 'react';
import Grid from '@material-ui/core/Grid';
import MaterialTable from "material-table";
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import axios from 'axios'
import Alert from '@material-ui/lab/Alert';

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

const api = axios.create({
  baseURL: `https://reqres.in/api`
})


function validateUrl(url){
    var patt = new RegExp(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-]))?/);
    return patt.test(url);
}

function App() {

  var columns = [
    {title: "Name", field: "first_name"},
    {title: "Value", field: "last_name"},
    {title: "id", field: "id", hidden: true}
  ]
  const [data, setData] = useState([]); 
  const [iserror, setIserror] = useState(false)
  const [errorMessages, setErrorMessages] = useState([])
  const allowedList = ['dih.console.username','dih.console.password','dih.console.url','dih.console.accessmode'];
  useEffect(() => { 
    api.get("/users")
        .then(res => {  
            res.data.data.filter(dt => allowedList.includes(dt.first_name));
            setData();
         })
         .catch(error=>{
             console.log("Error")
         })
  }, []);
  
  const duplicateExists = (val) => {
      return data.find(row => row?.id === val?.id && row?.first_name === val?.first_name && row?.last_name === val?.last_name);
  }

  const getDataSize = () => {
      const len = data ? data.length : 0 ;                   
      return "System Properties("+len+")";
  }
  
  const handleRowUpdate = (newData, oldData, resolve) => {
    let errorList = []
    if(newData.first_name !== undefined && !allowedList.includes(newData.first_name)){
      errorList.push("Property name not allowed")
    } else {
        if(data && duplicateExists(newData)){
            errorList.push("Property already exist")    
        }
        else if(newData.first_name === undefined){
          errorList.push("Empty Name")
        }
        else if(newData.last_name === undefined){
          errorList.push("Empty Value")
        }
        else if(newData.first_name === 'dih.console.url' && !validateUrl(newData.last_name)){
          errorList.push("Invalid value for '"+newData.first_name+"'")    
        }
    }
    if(errorList.length < 1){
      api.patch("/users/"+newData.id, newData)
      .then(res => {
        const dataUpdate = !data ? [] : [...data];
        const index = oldData.tableData.id;
        dataUpdate[index] = newData;
        setData([...dataUpdate]);
        resolve()
        setIserror(false)
        setErrorMessages([])
      })
      .catch(error => {
        setErrorMessages(["Update failed! Server error"])
        setIserror(true)
        resolve()
        
      })
    }else{
      setErrorMessages(errorList)
      setIserror(true)
      resolve()

    }
    
  }

  const handleRowAdd = (newData, resolve) => {
    //validation
    let errorList = [];
    if(newData.first_name !== undefined && !allowedList.includes(newData.first_name)){
      errorList.push("Property name not allowed")
    } else {
        if(data && duplicateExists(newData)){
            errorList.push("Property already exist")    
        }
        else if(newData.first_name === undefined){
          errorList.push("Empty Name")
        }
        else if(newData.last_name === undefined){
          errorList.push("Empty Value")
        }
        else if(newData.first_name === 'dih.console.url' && !validateUrl(newData.last_name)){
          errorList.push("Invalid value for '"+newData.first_name+"'")    
        }
    }
    if(errorList.length < 1){ //no error
      api.post("/users", newData)
      .then(res => {
        let dataToAdd = !data ? [] : [...data];
        dataToAdd.push(newData);
        setData(dataToAdd);
        resolve()
        setErrorMessages([])
        setIserror(false)
      })
      .catch(error => {
        setErrorMessages(["Cannot add data. Server error!"])
        setIserror(true)
        resolve()
      })
    }else{
      setErrorMessages(errorList)
      setIserror(true)
      resolve()
    }

    
  }

  const handleRowDelete = (oldData, resolve) => {
    api.delete("/users/"+oldData.id)
      .then(res => {
        const dataDelete = [...data];
        const index = oldData.tableData.id;
        dataDelete.splice(index, 1);
        setData([...dataDelete]);
        resolve()
      })
      .catch(error => {
        setErrorMessages(["Delete failed! Server error"])
        setIserror(true)
        resolve()
      })
  }


  return (
    <div className="App">
      
      <Grid container spacing={0}>
          <Grid item xs={1}></Grid>
          <Grid item xs={10}>
          {iserror &&
           <div class="errorText"> 
              <Alert severity="error">
                  {errorMessages.map((msg, i) => {
                      return <div key={i}>{msg}</div>
                  })}
              </Alert>
            </div>
           }
            <MaterialTable
              title={getDataSize()}
              columns={columns}
              data={data}
              icons={tableIcons}
              editable={{
                onRowUpdate: (newData, oldData) =>
                  new Promise((resolve) => {
                      handleRowUpdate(newData, oldData, resolve);
                      
                  }),
                onRowAdd: (newData) =>
                  new Promise((resolve) => {
                    handleRowAdd(newData, resolve)
                  }),
                onRowDelete: (oldData) =>
                  new Promise((resolve) => {
                    handleRowDelete(oldData, resolve)
                  }),
              }}
            />
          </Grid>
          <Grid item xs={1}></Grid>
        </Grid>
    </div>
  );
}

export default App;