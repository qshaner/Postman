# Postman

## Setup

1. Download [npm](https://www.npmjs.com/) for your system
2. Download and install [Git](https://git-scm.com/) for your system
3. Open up a terminal of your choice, and then run `git clone https://github.com/qshaner/Postman.git`
4. In the new directory, run `npm install`, and then `npm start`

Congrats! You can now see the project at `localhost:3000`

## Design Decisions
### Dynamic rendering
* Chart yAxis and xAxis are determined when a change is made (LineChart)
* YAxis is calculated based on largest yValue
* Zoom/Brush re-renders data as needed

### Interactivity
* Brushing/zoom behavior for Line Chart
* Hover behavior for BarChart
* Checkboxes and filters

### Technology decisions: 
* React
* Typescript
* D3.js

### Separation of Concerns:
* Logic for tables, charts, and filters are broken into different functions
* Display for LineChart and BarChart are different components

### React Hooks:
* useState to manage local state
* useEffect to dynamically update table and filtered data

## Assumptions
* `Mock-request-date.json` has a consistent structure and size
* `Timestamp` is valid date-time string (there is no validation), and for a consistent time zone
* `Status_code` is a standard value, with  standard error codes
* User will input valid status codes
* * There is error handling just in case no data can be found, but no error state for incorrect values
* User will want to sort by ascending order
* Data is always in the correct format for LineChart and BarChart
* There will be no performance issues for rendering charts for individual paths
* No pagination or lazy loading needed
* User only cares about error count, and not type of error for aggregation and reporting

## Future Improvements

### Data Improvements: 
* Apply pagination to data
* Use `React Query` to process data
* Data aggregation for Errors will include the error codes, instead of just the count

### Visual Improvements: 
* More graphs
* Add a dropdown for selecting the specific path, instead of typing it in
* Specific date picker for dates
* Add error codes to error aggregation, and display as a tooltip in the BarChart component
* Error states and validation of inputs

### Functionality Improvements: 
* Allow user to drill down on specific API endpoint for detailed metrics, and have the graph represent this
* Provide insights or predictions based on data, such as problematic endpoints
* Show error-prone endpoints, for a specific error code
* TESTING. So much testing would be added, for all functions and for a smaller data set

### Code Improvements: 
* Make a controller component for processing data
* Separate logic and design more
* Turn filters into their own component
* Retain graph when switching paths
