import React, { useState, useEffect } from "react";
import data from "../mock-request-data.json";
import * as d3 from "d3";
import { LineChart } from "./LineChart";

type TableData = {
  timestamp: string;
  path: string;
  response_time: number;
  status_code: number;
  error?: string;
};

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

const DataTable = () => {
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [filteredData, setFilteredData] = useState<TableData[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [pathFilter, setPathFilter] = useState<string>("");
  const [sortedOptions, setSortedOptions] = useState<boolean>(false);
  const [sortedStatus, setSortedStatus] = useState<boolean>(false);
  const [avgResponseTimes, setAvgResponseTimes] = useState<Record<string, number>>({});
  const [errorCounts, setErrorCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setTableData(data);
    setFilteredData(data); // Initialize filtered data
    calculateAverageResponseTimes(data); // Calculate averages on load
    calculateErrorCounts(data); // Calculate error counts on load
  }, []);

  const calculateAverageResponseTimes = (data: TableData[]) => {
    const grouped: Record<string, { total: number; count: number }> = {};

    data.forEach((item) => {
      if (!grouped[item.path]) {
        grouped[item.path] = { total: 0, count: 0 };
      }
      grouped[item.path].total += item.response_time;
      grouped[item.path].count += 1;
    });

    // Calculate averages
    const averages: Record<string, number> = {};
    for (const path in grouped) {
      averages[path] = grouped[path].total / grouped[path].count;
    }

    setAvgResponseTimes(averages);
  };

  const calculateErrorCounts = (data: TableData[]) => {
    const errors: Record<string, number> = {};

    data.forEach((item) => {
      const isError =
        (item.status_code >= 400 && item.status_code <= 451) ||
        (item.status_code >= 500 && item.status_code <= 511);

      if (isError) {
        if (!errors[item.path]) {
          errors[item.path] = 0;
        }
        errors[item.path] += 1;
      }
    });

    setErrorCounts(errors);
  };

  const onFilter = () => {
    let filtered = [...tableData];
    filtered = filtered.sort((a,b)=> Date.parse(a.timestamp) - Date.parse(b.timestamp))

    // Apply status code filter
    if (statusFilter) {
      filtered = filtered.filter((item) =>
        item.status_code.toString() === statusFilter
      );
    }

    // Apply path filter
    if (pathFilter) {
      filtered = filtered.filter((item) =>
        item.path.toLowerCase().includes(pathFilter.toLowerCase())
      );
    }

    // Apply sorting by path
    if (sortedOptions) {
      filtered = filtered.sort((a, b) => a.path.localeCompare(b.path));
    }

    // Apply sorting by status
    if (sortedStatus) {
      filtered = filtered.sort((a, b) => a.status_code - b.status_code);
    }


    setFilteredData(filtered);
  };

  useEffect(() => {
    onFilter();
  }, [statusFilter, pathFilter, sortedOptions, sortedStatus]);


  return (
    <div>
      <h2>API Response Table</h2>
      {
        //Ideally, this would keep the last entry up until you filter again, OR have all lines in the same graph. 
      }
      {pathFilter && data.filter((entry)=> entry.path === pathFilter.toLowerCase()).length > 0 &&
      <div>
       <LineChart title="Response Time Over Time" width={800} height={600} data={data.filter((entry)=> entry.path === pathFilter.toLowerCase()).sort((a,b)=> Date.parse(a.timestamp) - Date.parse(b.timestamp)).map((point)=> ({
        x: formatDate(new Date(point.timestamp)),
        y: point.response_time    
  }))} />
  </div>}
  {/* {pathFilter && data.filter((entry)=> entry.path === pathFilter.toLowerCase()).length > 0 &&
      <div>
       <BarChart title="Status Code Over Time" width={800} height={600} data={data.filter((entry)=> entry.path === pathFilter.toLowerCase()).sort((a,b)=> Date.parse(a.timestamp) - Date.parse(b.timestamp)).map((point)=> ({
        x: formatDate(new Date(point.timestamp)),
        y: point.status_code    
  }))} /></div>} */}
      <div>
        <label>
          Status Code:
          <input
            type="text"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Enter status code"
          />
        </label>
      </div>
      <div>
        <label>
          Path:
          <input
            type="text"
            value={pathFilter}
            onChange={(e) => setPathFilter(e.target.value)}
            placeholder="Enter path"
          />
        </label>
      </div>
      <div>
        <label>
          Sort options by path?
          <input
            type="checkbox"
            checked={sortedOptions}
            onChange={(e) => setSortedOptions(e.target.checked)}
          />
        </label>
      </div>
      <div>
        <label>
          Sort options by status?
          <input
            type="checkbox"
            checked={sortedStatus}
            onChange={(e) => setSortedStatus(e.target.checked)}
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
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <tr key={index}>
                <td>{new Date(item.timestamp).toLocaleString()}</td>
                <td>{item.path}</td>
                <td>{item.response_time}</td>
                <td>{item.status_code}</td>
                <td>{item?.error || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>No data returned for search parameters</td>
            </tr>
          )}
        </tbody>
      </table>

      <h3>Average Response Times by Path</h3>
      <table>
        <thead>
          <tr>
            <th>API Endpoint</th>
            <th>Average Response Time (ms)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(avgResponseTimes).map(([path, avgTime]) => (
            <tr key={path}>
              <td>{path}</td>
              <td>{avgTime.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Error Counts by Path</h3>
      <table>
        <thead>
          <tr>
            <th>API Endpoint</th>
            <th>Error Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(errorCounts).map(([path, count]) => (
            <tr key={path}>
              <td>{path}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

};

export default DataTable;
