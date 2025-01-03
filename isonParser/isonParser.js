(async () => {
	// Required modules
	const FranchiseUtils = require('../Utils/FranchiseUtils');
	const ISON_FUNCTIONS = require('./isonFunctions');
	const fs = require('fs');
	const prompt = require('prompt-sync')();

	// Print tool header message
	console.log("This program will read raw ISON entries (typically used for CharacterVisuals data) and allow you to convert between ISON and JSON.\n");
	// Set up franchise file
	const validGames = [
		FranchiseUtils.YEARS.M25
	];
	const franchise = await FranchiseUtils.selectFranchiseFileAsync(FranchiseUtils.YEARS.M25);
	FranchiseUtils.validateGameYears(franchise, validGames);
	const tables = FranchiseUtils.getTablesObject(franchise);
	const characterVisualsTable = franchise.getTableByUniqueId(tables.characterVisualsTable);
	await characterVisualsTable.readRecords();

	let option;
	do
	{
		// Ask the user what they want to do
		console.log("\nPlease select an option:");
		console.log("1 - Convert ISON to JSON (read CharacterVisuals)");
		console.log("2 - Convert JSON to ISON (write CharacterVisuals)");
		console.log("3 - Dump raw ISON entry (advanced)");

		option = parseInt(prompt().trim());

		if(option < 1 || option > 3 || isNaN(option))
		{
			console.log("Invalid option.\n");
		}

	}
	while(option < 1 || option > 3 || isNaN(option));

	if(option === 1)
	{
		let rowNumber;
		do
		{
			// Get the CharacterVisuals row number from the user
			console.log("\nEnter the CharacterVisuals row number to read: ");
			rowNumber = parseInt(prompt().trim());

			if(isNaN(rowNumber) || characterVisualsTable.header.recordCapacity <= rowNumber || rowNumber < 0)
			{
				console.log("Invalid row number. Please enter a valid row number that exists in the table.\n");
			}

			if(characterVisualsTable.records[rowNumber].isEmpty)
			{
				console.log("The selected row is an empty record. Please select a non-empty row.\n");
			}
		}
		while(isNaN(rowNumber) || characterVisualsTable.header.recordCapacity <= rowNumber || characterVisualsTable.records[rowNumber].isEmpty || rowNumber < 0);

		// Convert the ISON for the selected row to JSON
		const json = ISON_FUNCTIONS.isonVisualsToJson(characterVisualsTable, rowNumber);

		// Write the object to a JSON file
		const jsonString = JSON.stringify(json, null, 4);

		// Get the target file path from the user
		console.log("\nEnter the path to write the JSON file: ");
		let newFilePath = prompt().trim().replace(/['"]/g, '');

		if(!newFilePath.endsWith('.json')) {
			newFilePath += '.json';
		}

		fs.writeFileSync(newFilePath, jsonString);

		console.log(`\nSuccessfully wrote JSON to ${newFilePath}.`);
		
	}
	else if(option === 2)
	{
		// Get the target file path from the user
		console.log("\nEnter the path to the JSON file to write to ISON: ");
		let newFilePath = prompt().trim().replace(/['"]/g, '');

		if(!newFilePath.endsWith('.json')) {
			newFilePath += '.json';
		}

		// Read the JSON file
		let json = JSON.parse(fs.readFileSync(newFilePath, 'utf8'));

		const keysToRemove = ['skinToneScale', 'genericHead', 'genericHeadName', 'heightInches', 'assetName', 'containerId']

		for (let key of keysToRemove) 
		{
			if(json.hasOwnProperty(key))
			{
				FranchiseUtils.removeKeyFromJson(json, key);
				console.log(`Removed key ${key} from JSON as it is not supported in ISON and not necessary.`);
			}
			
		}

		// Get the CharacterVisuals row number from the user
		let rowNumber;
		do
		{
			// Get the CharacterVisuals row number from the user
			console.log("\nEnter the CharacterVisuals row number to write to: ");
			rowNumber = parseInt(prompt().trim());

			if(isNaN(rowNumber) || characterVisualsTable.header.recordCapacity <= rowNumber || rowNumber < 0)
			{
				console.log("Invalid row number. Please enter a valid row number that exists in the table.\n");
			}

			if(characterVisualsTable.records[rowNumber].isEmpty)
			{
				console.log("The selected row is an empty record. Please select a non-empty row.\n");
			}
		}
		while(isNaN(rowNumber) || characterVisualsTable.header.recordCapacity <= rowNumber || characterVisualsTable.records[rowNumber].isEmpty || rowNumber < 0);

		// Convert the JSON to ISON
		ISON_FUNCTIONS.jsonVisualsToIson(characterVisualsTable, rowNumber, json);

		console.log(`\nSuccessfully wrote JSON to row ${rowNumber} in CharacterVisuals.`);

		await FranchiseUtils.saveFranchiseFile(franchise);
	}
	else if(option === 3)
	{
		let rowNumber;
		do
		{
			// Get the CharacterVisuals row number from the user
			console.log("\nEnter the CharacterVisuals row number to read: ");
			rowNumber = parseInt(prompt().trim());

			if(isNaN(rowNumber) || characterVisualsTable.header.recordCapacity <= rowNumber || rowNumber < 0)
			{
				console.log("Invalid row number. Please enter a valid row number that exists in the table.\n");
			}

			if(characterVisualsTable.records[rowNumber].isEmpty)
			{
				console.log("The selected row is an empty record. Please select a non-empty row.\n");
			}
		}
		while(isNaN(rowNumber) || characterVisualsTable.header.recordCapacity <= rowNumber || characterVisualsTable.records[rowNumber].isEmpty || rowNumber < 0);

		// Get the ISON data for the selected row
		const isonData = ISON_FUNCTIONS.getTable3IsonData(characterVisualsTable, rowNumber);

		// Get the target file path from the user
		console.log("\nEnter the path to write the ISON file: ");

		let newFilePath = prompt().trim().replace(/['"]/g, '');

		if(!newFilePath.endsWith('.ison')) {
			newFilePath += '.ison';
		}

		fs.writeFileSync(newFilePath, isonData);

		console.log(`\nSuccessfully wrote raw ISON data to ${newFilePath}.`);
	}

	FranchiseUtils.EXIT_PROGRAM();
})();
