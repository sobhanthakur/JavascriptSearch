var operation = {
	searchObject:null,
	searchResult:null,
	chunkSize:null,
	limit: null,
	init: function(searchObject) {
		// This method initializes the searchObject data member
		this.searchObject = searchObject;
		this.searchResult = []; //Empty result array. Push the resulting object into this array
		this.chunkSize = 1000;
		this.limit = 20;
	},
	order: function(sortBy, sortOrder) {
		sortBy = sortBy.split(' ');

		// Check if the input contains orderby keyword
		if(sortBy[0].toLowerCase() !== 'orderby') {
			throw "Invalid request for sorting";
		}
		sortBy = sortBy[1];
		var dot = sortBy.split('.');

		// Sort the object in ascending order.
		if(sortOrder === 'desc') {

			this.searchObject.sort(function (a, b) {
			  return a[sortBy] <= b[sortBy] ? 1 : -1;
			});
			
		} else {
			// Sort the object in descending order.
			this.searchObject.sort(function (a, b) {
			  return a[sortBy] >= b[sortBy] ? 1 : -1;
			});
		}
		
		return this;
	},
	select: function(searchField, searchOperator, searchFilter, searchColumns) {
		/*
			Signature of this method
			searchField = Field that you want to search in the object
			searchOperator = Operator that you want to apply
			searchFilter = Matching condition for searchField
			searchColumns = final columns that is to be returned
			*/
		var comma = searchColumns.split(','); //Split the columns to be printed
		let fieldSplit = searchField.split('.'); // Splits the column by dot to check the validity of that object.
		for(let i=0; i< this.searchObject.length; i+=this.chunkSize) {
			myChunk = this.searchObject.slice(i, i+this.chunkSize);
			for(let j=0;j<myChunk.length;j++) {
				var obj = {};
				let str = myChunk[j][searchField];
				if(operation.checkOperation(str,searchFilter,searchOperator)) { // Check if the matching string found
					if(searchColumns === '*') { //If search columns is * then return the full object
						this.searchResult.push(myChunk[j]);

					} else { // Else return the columns that are selected
						for(let k=0; k<comma.length;k++) {
							let dot = comma[k].split('.');
							obj[comma[k]] = myChunk[j][comma[k]];
						}
						this.searchResult.push(obj); // push the resulting object into the array(result[])
					}
				}			
			}			
		}
		return this;
	},
	paginate: function(offset) { 
		//Returns the object that is to be printed(with limit and offset)
		var result = [];

		// Search the object based on pagination(limit & offset)
		for(let i=this.limit*offset; i<(this.limit*offset)+this.limit; i++) {
			if(this.searchResult[i] === undefined) {
				break;
			}
			result.push(this.searchResult[i]);
		}
		this.searchResult = result;
		return this;
	},
	get: function() {
		return JSON.stringify(this.searchResult);
	},
	checkOperation: function(objectValue,valueToBeSearched,operator) {
		try {
			var convert1 = parseFloat(objectValue);
			var convert2 = parseFloat(valueToBeSearched);

			// If the operands are not numbers and using logical operators then the operation is invalid
			if(!convert1 && !convert2 && operator!=='like') {
				throw "Invalid operation";
			}
			if((convert1 || convert2) && operator==='like') {
				throw "Invalid operation";	
			}

			switch(operator) {
				case '>':
				return objectValue>valueToBeSearched? true:false;
				case '<':
				return objectValue<valueToBeSearched? true:false;
				case '>=':
				return objectValue>=valueToBeSearched? true:false;
				case '<=':
				return objectValue<=valueToBeSearched? true:false;
				case '=':
				return objectValue==valueToBeSearched? true:false;
				case 'like':
				return (objectValue.search(new RegExp(valueToBeSearched, "i")) != -1)?true:false;
				default:
					throw "Invalid operator"; //Error for invalid operator input
				}
			} catch(err) {
				throw err;
			}	
		}
	}
//console.log(arrayObject);
// Initialize the object
operation.init(arrayObject);
var output = operation.select("company","like","isot","name,company");
console.log(output.paginate(0).get());