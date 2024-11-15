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

    useEffect(()=> {
        setTableData(data)
    }, []);

console.log("DATA: ", data)

return (
    <div>
      <h2>API Response Table</h2>
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
          {tableData.map((item, index) => (
            <tr key={index}>
              <td>{item.timestamp}</td>
              <td>{item.path}</td>
              <td>{item.response_time}</td>
              <td>{item.status_code}</td>
              <td>{item?.error || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default DataTable