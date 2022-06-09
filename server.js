const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();
// parse incoming string or array data
app.use(express.urlencoded({ extended: true })); 
// parse incoming JSON data
app.use(express.json()); // <= Middleware function app.use() - Ultimately they allow us to keep our route endpoint callback functions more readable while letting us reuse functionality across routes to keep our code DRY.
const { animals } = require("./data/animals.json")
const fs = require('fs');
const path = require('path');

// This function will take in req.query as an argument and filter through the animals accordingly, returning the new filtered array. 

function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // save animal array as filteredResults 
    let filteredResults = animalsArray;

    if (query.personalityTraits) {
        // Save personalityTraits as a dedicated array
        //  If personalityTraits is a string, place it into a new array and save
        if (typeof query.personalityTraits === "string") {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        // Loop through each trait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
            // Check the trait against each animal in the filteredResults array.
            // Remember, it is initially a copy of the animalsArray,
            // but here we're updating it for each trait in the .forEach() loop.
            // For each trait being targeted by the filter, the filteredResults
            // array will then contain only the entries that contain the trait,
            // so at the end we'll have an array of animals that have every one 
            // of the traits when the .forEach() loop is finished.
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1 
            );
        });
    }
     
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }

    return filteredResults;
}
// takes in the id and array of animals and returns a single animal object
function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
  };
// function that accepts the POST route's req.body value and the array we want to add the data to. 
// In this case, that array will be the animalsArray, because the function is for adding a new animal to the catalog.
  function createNewAnimal(body, animalsArray) {
      const animal = body;
      animalsArray.push(animal);
      fs.writeFileSync(
          path.join(__dirname, "./data/animals.json"),
          JSON.stringify({ animals: animalsArray }, null, 2)
      );
      return animal;
  }

//   Function to validate the incoming data

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== "string") {
        return false;
    }
    if (!animal.species || typeof animal.species !== "string") {
        return false;
    }
    if (!animal.personalityTraits || typeof animal.personalityTraits !== "string") {
        return false;
    }
    return true;
}
  
app.get("/api/animals", (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

// Now that we have multiple routes, we have to pay extra attention to the order of the routes. A param route must come after the other GET route
//  req.query is multifaceted, often combining multiple parameters, whereas req.param is specific to a single property, often intended to retrieve a single record.

app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
      res.json(result);
    } else {
        res.send(404);
    }
  });

//   Add aq POST route for users to enter data from the client side

app.post("/api/animals", (req, res) => {
    // req.body is where our incoming content will be
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();
    // if any data in the req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
        res.status(400).send("The animal is not properly formatted.");
    } else {
    // add animal to json file and animals array in this function
    const animal = createNewAnimal(req.body, animals);
    res.json(req.body);
    }
});


app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
  });

