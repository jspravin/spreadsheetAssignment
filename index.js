const { LOCAL_STORAGE_DB } = "./constants.js";

// Initial ROW and COLUMN count
let initialRowCount = 16;
let initialColumnCount = 12;

//////////////////////////////////////////////////////
// START - INITIALIZATION
/////////////////////////////////////////////////////

initializeData = () => {
  const data = [];
  for (let i = 0; i <= initialRowCount; i++) {
    const child = [];
    for (let j = 0; j <= initialColumnCount; j++) {
      child.push("");
    }
    data.push(child);
  }
  return data;
};

// Data from the Local Storage
getData = () => {
  let data = localStorage.getItem(LOCAL_STORAGE_DB);
  if (data === undefined || data === null) {
    return initializeData();
  }
  return JSON.parse(data);
};

saveData = (data) => {
  localStorage.setItem(LOCAL_STORAGE_DB, JSON.stringify(data));
};

resetData = () => {
  localStorage.removeItem(LOCAL_STORAGE_DB);
  this.createSpreadsheet();
};

initializeRowHeader = () => {
  const tr = document.createElement("tr");
  tr.setAttribute("id", "h-0");
  for (let i = 0; i <= initialColumnCount; i++) {
    const th = document.createElement("th");
    th.setAttribute("id", `h-0-${i}`);
    th.setAttribute("class", `${i === 0 ? "" : "column-header"}`);
    if (i !== 0) {
      const span = document.createElement("span");
      span.innerHTML = `${i}`;
      span.setAttribute("class", "column-header-span");
      const dropDownDiv = document.createElement("div");
      dropDownDiv.setAttribute("class", "dropdown");
      dropDownDiv.innerHTML = `<button class="dropdownButton" id="col-dropbtn-${i}">+</button>
        <div id="col-dropdown-${i}" class="dropdown-content">
          <p class="col-insert-left">Add Column - Left</p>
          <p class="col-insert-right">Add Column - Right</p>
          <p class="col-delete">Remove column</p>
        </div>`;
      th.appendChild(span);
      th.appendChild(dropDownDiv);
    }
    tr.appendChild(th);
  }
  return tr;
};

initialTableRowBody = (rowNum) => {
  const tr = document.createElement("tr");
  tr.setAttribute("id", `r-${rowNum}`);
  for (let i = 0; i <= initialColumnCount; i++) {
    const cell = document.createElement(`${i === 0 ? "th" : "td"}`);
    if (i === 0) {
      cell.contentEditable = false;
      const span = document.createElement("span");
      const dropDownDiv = document.createElement("div");
      span.innerHTML = rowNum;
      dropDownDiv.setAttribute("class", "dropdown");
      dropDownDiv.innerHTML = `<button class="dropdownButton" id="row-dropbtn-${rowNum}">+</button>
        <div id="row-dropdown-${rowNum}" class="dropdown-content">
          <p class="row-insert-top">Add Row - Top</p>
          <p class="row-insert-bottom">Add Row - Bottom</p>
          <p class="row-delete">Remove row</p>
        </div>`;
      cell.appendChild(span);
      cell.appendChild(dropDownDiv);
      cell.setAttribute("class", "row-header");
    } else {
      cell.contentEditable = true;
    }
    cell.setAttribute("id", `r-${rowNum}-${i}`);
    tr.appendChild(cell);
  }
  return tr;
};

initialTableBody = (tableBody) => {
  for (let rowNum = 1; rowNum <= initialRowCount; rowNum++) {
    tableBody.appendChild(this.initialTableRowBody(rowNum));
  }
};

//////////////////////////////////////////////////////
// END - INITIALIZATION
/////////////////////////////////////////////////////

// Populate the Data from Local Storage
populateTable = () => {
  const data = this.getData();
  if (data === undefined || data === null) return;

  for (let i = 1; i < data.length; i++) {
    for (let j = 1; j < data[i].length; j++) {
      const cell = document.getElementById(`r-${i}-${j}`);
      cell.innerHTML = data[i][j];
    }
  }
};

//////////////////////////////////////////////////////
// START - MAIN FUNCTION
/////////////////////////////////////////////////////
createSpreadsheet = () => {
  const spreadsheetData = this.getData();
  initialRowCount = spreadsheetData.length - 1 || initialRowCount;
  initialColumnCount = spreadsheetData[0].length - 1 || initialColumnCount;

  const tableHeaderElement = document.getElementById("table-headers");
  const tableBodyElement = document.getElementById("table-body");

  const tableBody = tableBodyElement.cloneNode(true);
  tableBodyElement.parentNode.replaceChild(tableBody, tableBodyElement);
  const tableHeaders = tableHeaderElement.cloneNode(true);
  tableHeaderElement.parentNode.replaceChild(tableHeaders, tableHeaderElement);

  tableHeaders.innerHTML = "";
  tableBody.innerHTML = "";

  tableHeaders.appendChild(initializeRowHeader(initialColumnCount));
  initialTableBody(tableBody, initialRowCount, initialColumnCount);

  populateTable();

  tableBody.addEventListener("focusout", function (e) {
    if (e.target && e.target.nodeName === "TD") {
      let item = e.target;
      const indices = item.id.split("-");
      let spreadsheetData = getData();
      spreadsheetData[indices[1]][indices[2]] = item.innerHTML;
      saveData(spreadsheetData);
    }
  });

  tableBody.addEventListener("click", function (e) {
    if (e.target) {
      if (e.target.className === "dropdownButton") {
        const idArr = e.target.id.split("-");
        document
          .getElementById(`row-dropdown-${idArr[2]}`)
          .classList.toggle("show");
      }
      if (e.target.className === "row-insert-top") {
        const indices = e.target.parentNode.id.split("-");
        insertRow(parseInt(indices[2]), "top");
      }
      if (e.target.className === "row-insert-bottom") {
        const indices = e.target.parentNode.id.split("-");
        insertRow(parseInt(indices[2]), "bottom");
      }
      if (e.target.className === "row-delete") {
        const indices = e.target.parentNode.id.split("-");
        removeRow(parseInt(indices[2]));
      }
    }
  });

  // Attach click event listener to table headers
  tableHeaders.addEventListener("click", function (e) {
    if (e.target) {
      if (e.target.className === "column-header-span") {
        sortColumn(parseInt(e.target.parentNode.id.split("-")[2]));
      }
      if (e.target.className === "dropdownButton") {
        const idArr = e.target.id.split("-");
        document
          .getElementById(`col-dropdown-${idArr[2]}`)
          .classList.toggle("show");
      }
      if (e.target.className === "col-insert-left") {
        const indices = e.target.parentNode.id.split("-");
        insertColumn(parseInt(indices[2]), "left");
      }
      if (e.target.className === "col-insert-right") {
        const indices = e.target.parentNode.id.split("-");
        insertColumn(parseInt(indices[2]), "right");
      }
      if (e.target.className === "col-delete") {
        const indices = e.target.parentNode.id.split("-");
        removeColumn(parseInt(indices[2]));
      }
    }
  });
};

// Main Function Execution
createSpreadsheet();

//////////////////////////////////////////////////////
// END - MAIN FUNCTION
/////////////////////////////////////////////////////

// Handle the Outside click
window.onclick = function (event) {
  if (!event.target.matches(".dropdownButton")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

document.getElementById("reset").addEventListener("click", (e) => {
  if (
    confirm("This will erase all data and set default configs. Are you sure?")
  ) {
    this.resetData();
  }
});

//////////////////////////////////////////////////////
// START - ADD and DELETE FUNCTIONALITY
/////////////////////////////////////////////////////
insertRow = (currentRow, direction) => {
  let data = this.getData();
  const colCount = data[0].length;
  const newRow = new Array(colCount).fill("");
  if (direction === "top") {
    data.splice(currentRow, 0, newRow);
  } else if (direction === "bottom") {
    data.splice(currentRow + 1, 0, newRow);
  }
  initialRowCount++;
  saveData(data);
  this.createSpreadsheet();
};

removeRow = (currentRow) => {
  let data = this.getData();
  data.splice(currentRow, 1);
  initialRowCount++;
  saveData(data);
  this.createSpreadsheet();
};

insertColumn = (currentCol, direction) => {
  let data = this.getData();
  for (let i = 0; i <= initialRowCount; i++) {
    if (direction === "left") {
      data[i].splice(currentCol, 0, "");
    } else if (direction === "right") {
      data[i].splice(currentCol + 1, 0, "");
    }
  }
  initialColumnCount++;
  saveData(data);
  this.createSpreadsheet();
};

removeColumn = (currentCol) => {
  let data = this.getData();
  for (let i = 0; i <= initialRowCount; i++) {
    data[i].splice(currentCol, 1);
  }
  initialColumnCount++;
  saveData(data);
  this.createSpreadsheet();
};

//////////////////////////////////////////////////////
// END - ADD and DELETE FUNCTIONALITY
/////////////////////////////////////////////////////

//////////////////////////////////////////////////////
// START - SORTING FUNCTIONALITY
/////////////////////////////////////////////////////

const sortingHistory = new Map();

// Main function for Sorting
sortColumn = (currentCol) => {
  let spreadSheetData = this.getData();
  let data = spreadSheetData.slice(1);
  if (!data.some((a) => a[currentCol] !== "")) return;
  if (sortingHistory.has(currentCol)) {
    const sortOrder = sortingHistory.get(currentCol);
    switch (sortOrder) {
      case "desc":
        data.sort(ascSort.bind(this, currentCol));
        sortingHistory.set(currentCol, "asc");
        break;
      case "asc":
        data.sort(dscSort.bind(this, currentCol));
        sortingHistory.set(currentCol, "desc");
        break;
    }
  } else {
    data.sort(ascSort.bind(this, currentCol));
    sortingHistory.set(currentCol, "asc");
  }
  data.splice(0, 0, new Array(data[0].length).fill(""));
  saveData(data);
  this.createSpreadsheet();
};

// Ascending
const ascSort = (currentCol, a, b) => {
  let _a = a[currentCol];
  let _b = b[currentCol];
  if (_a === "") return 1;
  if (_b === "") return -1;

  if (isNaN(_a) || isNaN(_b)) {
    _a = _a.toUpperCase();
    _b = _b.toUpperCase();
    if (_a < _b) return -1;
    if (_a > _b) return 1;
    return 0;
  }
  return _a - _b;
};

// Descending
const dscSort = (currentCol, a, b) => {
  let _a = a[currentCol];
  let _b = b[currentCol];
  if (_a === "") return 1;
  if (_b === "") return -1;

  if (isNaN(_a) || isNaN(_b)) {
    _a = _a.toUpperCase();
    _b = _b.toUpperCase();
    if (_a < _b) return 1;
    if (_a > _b) return -1;
    return 0;
  }
  return _b - _a;
};

//////////////////////////////////////////////////////
// END - SORTING FUNCTIONALITY
/////////////////////////////////////////////////////
