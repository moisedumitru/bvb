import ExcelJS from 'exceljs';
// Create a new Excel workbook and load an existing file

export const getConfig = () => {
	const workbook = new ExcelJS.Workbook();
	return new Promise((resolve, reject) => {
		workbook.xlsx.readFile('C:\\Workspaces\\personal\\tradeville\\src\\existing-file.xlsx')
			.then(function() {
				// Select the sheet you want to insert data into
				const worksheet = workbook.getWorksheet('Tabelle1'); // Replace 'Sheet1' with your sheet name
				
				// Get the 3 datas
				
				const config = {
					moneyToSpend: worksheet.getCell("D24").value,
					minOrder: worksheet.getCell("D25").value,
					feePerOrder: worksheet.getCell("D26").value,
				}
				
				resolve(config);
			})
			.catch(function(error) {
				reject(error);
			})
	});
}

export const writeToExcel = (arrayOfArrays) => {
	const workbook = new ExcelJS.Workbook();
	
	workbook.xlsx.readFile('C:\\Workspaces\\personal\\tradeville\\src\\existing-file.xlsx')
		.then(function() {
			const worksheet = workbook.getWorksheet('Tabelle1'); // Replace 'Sheet1' with your sheet name
			
			const startRow = 2; // Replace with the row number where you want to start overwriting

			// Overwrite the existing rows with the data from the array of arrays
			for (let i = 0; i < arrayOfArrays.length; i++) {
			  const rowData = arrayOfArrays[i];
			  for (let j = 0; j < rowData.length; j++) {
				const cell = worksheet.getCell(startRow + i, j + 1); // Adjust the column number (1-based index)
				cell.value = rowData[j];
			  }
			}

			return workbook.xlsx.writeFile('C:\\Workspaces\\personal\\tradeville\\src\\existing-file.xlsx');
		})
		.then(function() {
			console.log('Data inserted into the Excel file successfully');
		})
		.catch(function(error) {
			console.log(error);
		})
}
// workbook.xlsx.readFile('C:\\Workspaces\\personal\\tradeville\\src\\existing-file.xlsx')
//   .then(function() {
//     // Select the sheet you want to insert data into
//     const worksheet = workbook.getWorksheet('Tabelle1'); // Replace 'Sheet1' with your sheet name
	
// 	// Get the 3 datas
	
// 	const config = {
// 		moneyToSpend: worksheet.getCell("D24").value,
// 		minOrder: worksheet.getCell("D25").value,
// 		feePerOrder: worksheet.getCell("D26").value,
// 	}
	
	
	
	

//     // Define the array of arrays you want to insert
//     const dataToInsert = [
//       ['John', 'Doe', 300],
//       ['Jane', 'Smith', 250],
//       ['Bob', 'Johnson', 350]
//     ];

//    // Specify the starting cell where you want to insert the data
//    const startRow = 2; // Replace with the row number
//    const startColumn = 2; // Replace with the column number (1-based index)

//    // Insert the data at the specified location
//    for (let i = 0; i < dataToInsert.length; i++) {
// 	 const rowData = dataToInsert[i];
// 	 for (let j = 0; j < rowData.length; j++) {
// 	   const cell = worksheet.getCell(startRow + i, startColumn + j);
// 	   cell.value = rowData[j];
// 	 }
//    }
//    const range = "D2:D5";
//    const values = worksheet.getCell(range).value;
   
   
//     // Set the sum result in the target cell
//     worksheet.getCell("D6").value = 3;
   
//     // Save the changes back to the Excel file
//     return workbook.xlsx.writeFile('C:\\Workspaces\\personal\\tradeville\\src\\existing-file.xlsx');
//   })
//   .then(function() {
//     console.log('Data inserted into the Excel file successfully');
//   })
//   .catch(function(error) {
//     console.error('Error:', error);
//   });