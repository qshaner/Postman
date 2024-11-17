import React, {useState,useEffect} from "react";
import data from '../mock-request-data.json';
 
type TableData = {
    timestamp: string;
    path: string;
    response_time: number;
    status_code: number;
    error?: string;
}

const DataTable = () => {

    const [tableData, setTableData] = useState<TableData[]>([]);
    const [filteredData, setFilteredData] = useState<TableData[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [pathFilter, setPathFilter] = useState<string>("");
    const [sortedOptions, setSortedOptions] = useState<boolean>(false)
    const [sortedStatus, setSortedStatus] = useState<boolean>(false);

    useEffect(()=> {
        setTableData(data);
        setFilteredData(data);
        }, []);

const onFilter =()=> {
   let filtered = tableData;

   //status code filter
    if(statusFilter){
        filtered = (filteredData.filter(item => item.status_code.toString() === statusFilter))
    }

    //path filter
    if(pathFilter) {
        //fix this so it's exclusive instead of inclusive
        //or make this into a dropdown
        filtered = (filteredData.filter(item => item.path.toLowerCase().includes(pathFilter.toLowerCase())))
    }

    //sort data by path
    if(sortedOptions) {
        filtered = filtered.sort((a,b)=> a.path.localeCompare(b.path))
    } 

    if(sortedStatus) {
        filtered = filtered.sort((a,b)=> a.status_code - b.status_code)
    }

    if(filtered.length > 0 && !sortedStatus && !sortedOptions) {
    setFilteredData(filtered)
    }
   
}

useEffect(()=> {
    onFilter();
}, [statusFilter, pathFilter, sortedOptions, sortedStatus])

return (
    <div>
      <h2>API Response Table</h2>
      <div>
        <label>Status Code:
            <input 
            type="text"
            value={statusFilter}
            onChange={(e)=> setStatusFilter(e.target.value)}
            placeholder="Enter status code"
            />
        </label>
      </div>
      <div>
        <label>Path:
            <input 
            type="text"
            value={pathFilter}
            onChange={(e)=>setPathFilter(e.target.value)}
            placeholder="Enter path"
            />
        </label>
      </div>
      <div>
        <label>Sort options by path? 
            <input
            type="checkbox"
            checked={sortedOptions}
            onChange={(e)=> setSortedOptions(e.target.checked)}
            />
        </label>
      </div>
      <div>
        <label>Sort options by status? 
            <input
            type="checkbox"
            checked={sortedStatus}
            onChange={(e)=> setSortedStatus(e.target.checked)}
            />
        </label>
      </div>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>API Endpoint</th>
            <th>Response Time</th>
            <th>Status</th>
            <th>Error Message</th>
          </tr>
        </thead>
        <tbody>
          {filteredData && filteredData.map((item, index) => (
            <tr key={index}>
              <td>{item.timestamp}</td>
              <td>{item.path}</td>
              <td>{item.response_time}</td>
              <td>{item.status_code}</td>
              <td>{item?.error || 'N/A'}</td>
            </tr>
          ))}
          {filteredData.length === 0 && 
          <div>No data returned for search parameters</div>
          }
        </tbody>
      </table>
    </div>
  );
};


export default DataTable