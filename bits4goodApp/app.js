const express = require('express')
const app = express()
const port = 3000
app.use(express.json());
const bcrypt = require('bcrypt');
const saltRounds = 10;
// Root route



const mongoose = require('mongoose');

async function connectToDB() {
    const uri = "mongodb+srv://sdhruvemail:73vvioLoZU9cSxcB@dev-asses.gkzf4.mongodb.net/?retryWrites=true&w=majority&appName=dev-asses";
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (e) {
        console.error('Failed to connect to MongoDB', e);
    }
}

connectToDB();
const userSchema = new mongoose.Schema({
    name: String,
    password: String,
    username: String,
    age: Number,
    email: String,
});
const animalSchema = new mongoose.Schema({
    name: String,
    user: String,
    species: String,
});
const trainingSchema = new mongoose.Schema({
    name: String,
    user: String,
    instructions: String,
    species: String,
    animalName: String,
});
const User = mongoose.model('User', userSchema);
const Animal = mongoose.model('animal', animalSchema);
const Training = mongoose.model('training', trainingSchema);


app.post('/api/user', async (req, res) => {
    const { name, username, age, password, email } = req.body;
    if (!name || !username || !age || typeof age !== 'number' || !password) {
        return res.status(400).json({ message: 'Invalid Request' });
    }
    try {
        const hash = await new Promise((resolve, reject) => {
            bcrypt.hash(password, saltRounds, function(err, hash) {
                if (err) reject(err);
                else resolve(hash);
            });
        });
        const userFound = await User.findOne({email: email});

        if (!!userFound) {
            return res.status(400).json({message:"email in use"});
        }

        const user = new User({ name, password: hash, username, age, email });
        await user.save();

        res.status(200).json(user); // Send back the created user object with status 201
    } catch (e) {
        console.error('Error creating user:', e);
        res.status(500).json({ message: 'Error Creating User' });
    }
});

app.post('/api/user/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Invalid Request' });
    }

    try{
        const user = await User.findOne({email: email});
        if (!user) {
            return res.status(403).json({ message: "Failure!" });
        }
        bcrypt.compare(password, user.password, function(err, result) {
            if (result) 
                {
                    res.status(200).json({ message: "Success!" });
                }
            else {
                res.status(403).json({ message: "Failure!" });
            }
        });
    } catch (e) {
        console.error('Error logging in:', e);
        res.status(500).json({ message: 'Error Logging in' });
    }
});

app.post('/api/animal', async (req, res) => {
    const { name, user, species } = req.body;
    if (!name || !user || !species) {
        return res.status(400).json({ message: 'Invalid Request' });
    }
    try {
        const animal = new Animal({ name, user, species });
        await animal.save();
        res.status(200).json(animal); // Send back the created user object with status 201
    } catch (e) {
        console.error('Error creating animal:', e);
        res.status(500).json({ message: 'Error Creating animal' });
    }
});

app.post('/api/training', async (req, res) => {
    const { name, user, instructions, species, animalName } = req.body;
    if (!name || !user || !instructions || !species || !animalName) {
        return res.status(400).json({ message: `Invalid Request` });
    }
    /*
    !ValidateTraining(species, animalName, user).then(validated =>
        {
            if (!validated) {
                res.status(400).json({ message: 'Specified animal does not exist with the specified owner' }) 
                console.log("check");
                return;
            }
            else {
                
            }
        })

        
    if (!ValidateTraining(species, animalName, user)){
        res.status(400).json({ message: 'Specified animal does not exist with the specified owner' }) 
        return;
    }
    */

    try {
        const validated = await ValidateTraining(species, animalName, user);
        if (!validated) {
            return res.status(400).json({ message: 'Specified animal does not exist with the specified owner' });
        }
        const training = new Training({ name, user, instructions, species, animalName });
        await training.save();
        res.status(200).json(training); // Send back the created user object with status 201
    } catch (e) {
        console.error('Error creating training:', e);
        res.status(500).json({ message: 'Error Creating training, e.message' });
    }
});

async function ValidateTraining(species, animalName, user){
    try {
        const animal = await Animal.findOne({name: animalName, user: user, species: species});
        return !!animal;
    }
    catch (e){
        console.log(e.message);
        throw e;
    }
}

app.get('/api/user', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    try {
        const users = await User.find({}).sort({ _id: 1 }).skip((page-1)*10).limit(10);
        res.status(200).json(users);
    } catch (e) {
        console.error('Error retrieving users:', e);
        res.status(500).json({ message: 'Error retrieving users' });
    }

})


app.get('/api/animal', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    try {
        const animals = await Animal.find({}).sort({ _id: 1 }).skip((page-1)*10).limit(10);
        res.status(200).json(animals);
    } catch (e) {
        console.error('Error retrieving animals:', e);
        res.status(500).json({ message: 'Error retrieving animals' });
    }

})


app.get('/api/trainings', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    try {
        const trainings = await Training.find({}).sort({ _id: 1 }).skip((page-1)*10).limit(10);
        res.status(200).json(trainings);
    } catch (e) {
        console.error('Error retrieving trainings:', e);
        res.status(500).json({ message: 'Error retrieving trainings' });
    }

})
app.get('/', (req, res) => {
    res.send('Welcome to this application')
  })
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ healthy: true })
  })


// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log(`Visit at http://localhost:${port}`)
})
