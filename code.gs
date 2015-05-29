var config = {
  tableId: 'TABLE_ID', //add an id of a google spreadsheet
  categoriesExpenses: [
    'Clothes', 
    'Cosmetics',
    'Groceries',
    'Entertainment',
    'Gifts',
    'Healthcare',
    'Transport',
    'Travelling'       
  ],
  
  categoriesIncomes: [
    'Gift',
    'Salary', 
    'Scolarship' 
  ],
  
  userEmails: [
    'user1@gmail.com', //add your actual email-addresses here
    'user2@gmail.com',
    'user3@gmail.com'
  ]
};

function loadPointsForChartWholeTime() {
 // return [[x1, y1], [x2, y2], ...]
 result = [];
 var data = getTableData();
  var currentTotal = 0;
  for (var i = 1; i < data.length; i++) {
    var value = parseFloat(data[i][3]);
    currentTotal += value;
    result.push([data[i][0].getTime(), currentTotal]);
  }
 return JSON.stringify(result);
}

function getCategories() {
 var result = {};
 result.i = config.categoriesIncomes;
 result.e = config.categoriesExpenses;
 return JSON.stringify(result); 
}

function getContent(filename) {
  return HtmlService.createTemplateFromFile(filename).getRawContent();
}

function formatDate(d) {
  var curr_date = d.getDate();
  var curr_month = d.getMonth();
  var curr_year = d.getFullYear();
  return curr_date + "/" + (curr_month + 1) + "/" + curr_year;
}

function addRowTest() {
  addRow(JSON.stringify({type: 'e', category: 'Education', amount: 1000.0, comment: 'a comment'}));
}

function addRow(data) {
  // data = json{type, category, amount, comment}
  data = JSON.parse(data);
  Logger.log('addRow(): ' + JSON.stringify(data));
  
  var ss = SpreadsheetApp.openById(config.tableId);
  var sheet = ss.getSheetByName("data");
  var cell = sheet.getRange('a1');
  var nextRow = sheet.getLastRow();
  cell.offset(nextRow, 0).setValue(formatDate(new Date()));
  
  var amountAbs = Math.abs(data.amount);
  if (data.type === 'e') {
    cell.offset(nextRow, 3).setValue(-amountAbs);
  } else {
    cell.offset(nextRow, 3).setValue(amountAbs); 
  }
  
  cell.offset(nextRow, 2).setValue(data.category);
  cell.offset(nextRow, 4).setValue(data.comment); 
  cell.offset(nextRow, 1).setValue(getCurrentUser()); 
}

function getTableData() {
  return SpreadsheetApp
    .openById(config.tableId)
    .getDataRange()
    .getValues(); 
}

function getTableTest() {
 var r = getTable(10);
 Logger.log(r);
}

function getTable(nRows) {
 var data = getTableData();
 var cnt = 0;
 var res = [];
 var resIndex = 0;
 for (var i = data.length - 1; i >= 1 && cnt < nRows; i--, cnt++) {
   var t = [];
   for (var j = 0; j < 5; j++) {
     t[j] = data[i][j];
   }
   
   res[resIndex] = t;
   resIndex++;
 }
 return JSON.stringify(res);
}

function getCurrentUser() {
  for (var i = 0; i < config.userEmails.length; i++) {
    if (Session.getActiveUser().getEmail() == config.userEmails[i])
      return config.userEmails[i];
  }
  return null;
}

function doGet() {
  if (getCurrentUser()) {
    return HtmlService
        .createTemplateFromFile('Index')
        .evaluate()
        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  } else {
    return HtmlService
        .createTemplateFromFile('NoAccess')
        .evaluate();
  }
}


function sum(data, col, limit) {
  if (typeof limit == 'undefined')
    limit = 100000000;
  var res = 0;
  for (var i = 1; i < Math.min(data.length, limit + 1); i++) {
    var val = parseInt(data[i][col], 10);
    if (!isNaN(val))
      res += val;
  }
  return res;
}

function calculateSummary() {
  var data = getTableData();
  var totalExpense = 0;
  var totalIncome = 0;
  for (index = 1; index < data.length; index++) {
   if (data[index][3] > 0) 
     totalIncome += data[index][3];
   if (data[index][3] < 0)
     totalExpense += Math.abs(data[index][3]);
  }
  res = JSON.stringify([sum(data, 3), totalExpense, totalIncome]);
  Logger.log(res)
  return res;
}


