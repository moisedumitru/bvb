import cheerio from "cheerio";

export const bvbIndexSmall = async (symb = 'BET') => {
	const url = 'https://www.bvb.ro/financialinstruments/indices/indicesprofiles?i=' + symb;
	
	const response = await fetch(url)
		.then(response => {
			if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
			}
			return response.text(); // Retrieve the response body as text
		})
		.then(html => {
			const $ = cheerio.load(html);
			let matrix = [];
			let table = $('.dataTable')[0];
			const lines = $(table).find('tbody tr');
		
			for (let i = 0; i < lines.length; i++) {
				const line = $(lines[i]).find("td");
				const symb = line.eq(0).text();
				const name = line.eq(1).text().toUpperCase();
				const weight = Number(line.eq(7).text().replace(',', '.'));
				let arrLine = [i+1, symb, name, weight];
				matrix[i] = arrLine;
			}
			
			return matrix;
		})
		.catch(error => {
			console.error('Fetch error:', error);
		});
	return response;
  }
  
 export const bvbPriceNow = async (symb) => {
	const url = 'https://www.bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=' + symb;
	
	const response = await fetch(url)
	.then(response => {
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		return response.text(); // Retrieve the response body as text
	})
	.then(html => {
		const $ = cheerio.load(html);
		let price = Number($('strong.value').text().trim());
		return price;
	})
	.catch(error => {
		console.error('Fetch error:', error);
	});
	return response;
  }

export const unitsNextBuy = (
	stockPrices = [78.81,32.19,5.26,6.7,32.49,51.61],
	weights = [29,32,20,7,7,5],
	numberOfUnits = [7,9,56,16,4,2],
	amountToSpend = 1000, 
	minimumOrder = 100,
	fee = 10
   // stockPrices,weights,numberOfUnits,amountToSpend, minimumOrder, fee
	) => {
	// initialize values
	for (let i = 0; i < stockPrices.length; i++) {
	  stockPrices[i] = Number(stockPrices[i])
	  weights[i] = Number(weights[i])
	  numberOfUnits[i] = Number(numberOfUnits[i])
	}
	amountToSpend = Number(amountToSpend)
	minimumOrder = Number(minimumOrder)
	fee = Number(fee)
	let unitsToBuy = []
	let amountToSpendTemp = amountToSpend;
	 stockPrices.forEach((element, index) => {
	  unitsToBuy[index] = 0
	})
	
	while(true) {
	  let unitsPrices = []
	  stockPrices.forEach((element, index) => {
	  unitsPrices[index] = Number((element * (numberOfUnits[index]+ unitsToBuy[index])));
	  })
	  let totalUnitsPrices = unitsPrices.reduce((prev, next) => prev + next, 0);
  
	  let actualWeights = computeActualWeights(unitsPrices, totalUnitsPrices);
	  let diffWeights = subtractArrays(actualWeights, weights);
	  let excludePositions = []
  
	  while (true) {
		let indexOfMinValue = getIndexOfMinValue(diffWeights, excludePositions);
		let amountZeroDiff = getAmountToHaveZeroWeightDiff(weights[indexOfMinValue], unitsPrices[indexOfMinValue], totalUnitsPrices)
		let boughtBefore = unitsToBuy[indexOfMinValue] != 0;
		let actualFee = boughtBefore ? 0 : fee;
		let unitsCanBuy = getUnitsCanBuy(amountZeroDiff, stockPrices[indexOfMinValue], amountToSpendTemp, minimumOrder, actualFee, boughtBefore);
		if(unitsCanBuy > 0 && weights[indexOfMinValue] != 0) { // ideal weight must be > 0
		  unitsToBuy[indexOfMinValue] += unitsCanBuy;
		  amountToSpendTemp -= (unitsCanBuy * stockPrices[indexOfMinValue]);
		  amountToSpendTemp -= actualFee;
		  break;
		}
		else {
		  excludePositions.push(indexOfMinValue);
		}
		if(excludePositions.length == diffWeights.length) {
		  return unitsToBuy;
		}
	  }
	}
  }
  
  function computeActualWeights(unitsPrices, total) {
	let result = []
	unitsPrices.forEach((element, index) => result[index] = Number((element / total * 100)))
	
	return result;
  }
  
  function subtractArrays(arr1, arr2) {
	let result = [];
	arr1.forEach((element, index) => result[index] = Number((element - arr2[index])));
  
	return result;
  }

  function getIndexOfMinValue(arr, excludedPositions) {
	var index = -1;
	var value = Number.MAX_SAFE_INTEGER;
	for (var i = 0; i < arr.length; i++) {
	  if(arr[i] < value && !excludedPositions.includes(i)) {
		value = arr[i];
		index = i;
	  }
	}
	return index;
  }
  
  function getAmountToHaveZeroWeightDiff(weight, unitsPrice, unitsPricesTotal) {
	let result = (unitsPrice - unitsPricesTotal * weight / 100) / (weight / 100 - 1);
	return result;
  }
  
  function getUnitsCanBuy(amountZeroDiff, price, amountToSpend, minimumOrder, fee, boughtBefore) {
	// if bought before dont use minOrder
	let units = 0;
	let unitsPrice = 0;
	if(boughtBefore) {
	  units = 1;
	  unitsPrice = price;
	}
	else {
	  units = Math.floor(minimumOrder / price);
	  unitsPrice = units * price;
	  if(unitsPrice < minimumOrder) {
		units++;
		unitsPrice += price;
	  }
	}
  
	// can't buy minimium amount of units
	if(unitsPrice + fee > amountToSpend) {
	  return -1;
	}
	// can buy only the minimum amount of units
	if(unitsPrice + fee >= amountZeroDiff) {
	  return units;
	}
  
	while (unitsPrice + fee <= amountToSpend && unitsPrice + fee <= amountZeroDiff) {
	  units++;
	  unitsPrice += price;
	}
  
	return units - 1;
  }
  
  unitsNextBuy()