//--------
//GLOBAL DEFINITIONS
//--------
const adminName='rio'
//const adminPassword='1234'
const adminPassword='$2b$12$LuVBEPcJyoAzR4PXHDMBj.x6G/vgie6HwfC5xZRx07.tnXRPoeH4.'

//--------
//PACKAGES
//--------
const express=require('express'); // load the express package into the express variable
const {engine} = require('express-handlebars');
const sqlite3 =require('sqlite3'); // load the sqlite3 package
const session = require('express-session')
const connectSqlite3 =  require('connect-sqlite3') // databases file
     
//--------
//BCRYPT
//-------
const bcrypt = require('bcrypt')
const saltRounds = 12

//-------
//bcrypt.hash(adminPassword, saltRounds, function(err, hash){
    //if(err){
//console.log("---> Error encrypting the password: ", err)
  //}else{
     //  console.log("---> Hashed password (GENERATE only ONCE): ", hash)
   //}
//})

//--------
//PORT
//--------
const port=8080 // define the port

//--------
//APPLICATION
//--------
const app=express() // create the web application/server

//--------
//DATABASES
//--------
const dbFile='my-project-data.sqlite3.db';
db = new sqlite3.Database(dbFile);

//--------
//SESSIONS
//--------
const SQLiteStore = connectSqlite3(session)//store session in teh database

app.use(session({ //define the session 
store: new SQLiteStore({ db: './session-db.d' }),

//ChatGPT i used this block of code  to store session in the database
//I had problems  with the session, so I used the following code to create a new session
//store:new SQLiteStore ({ db:"session-db.d"}), //uncmoment this one 
"saveUninitialized": false,
"resave":false,
"secret": "This123Is@Another#456GreatSecret678%Sentence"
}))

app.use(function (req, res, next) {
console.log("Session passed to response locals..")
res.locals.session = req.session;
next();
});

app.use((req, res, next) => {
    console.log("Session Object: ", req.session);
    next();
});

//--------
//MIDDLEWARES
//--------
app.use(express.static ('public')) //the public directory is static
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
     

//--------
//VIEW ENGINE
//--------
//HANDLEBARS
app.engine('handlebars', engine())//initialize the engine to be handlebars
app.set('view engine', 'handlebars')//set handlebars as the view engine
app.set('views', './views')//define the views directory to be ./views


//--------
//ROUTES
//--------
//HOME PAGE
app.get('/', function (req, res) {
// res.render('index.handlebars');
 const model = {
 isLoggedIn: req.session.isLoggedIn,
 name: req.session.name,
 isAdmin: req.session.isAdmin
}

 console.log("--->Home model: "  + JSON.stringify(model))
 res.render('index.handlebars', model)
});

// ABOUT PAGE 
 app.get('/aboutme', function (req, res) {
    res.render('aboutme.handlebars')
 })

 // PORFOLIO PAGE 
 app.get('/portfolio', function (req, res) {
    res.render('portfolio.handlebars')
 })



// CONTACT PAGE
app.get('/contact', function (req, res) {
    res.render('contact.handlebars')
})

//LOGIN PAGE
app.get('/login',  (req, res) => {
    res.render('login.handlebars')
});

app.get('/logout',(req, res) => {
      req.session.destroy((err)  => {
  if (err) {
      console.log("Error while destroying this session: ", err)
  } else {
      console.log('Logged out...')
      res.redirect('/')
  }
    })
})

//FORM POST LOGIN
app.post('/login', (req, res) => {
 //Alternatve 1
    //const {username, password }  = req.body;
     //Alternatve 
    const username = req.body.username;
    const password = req.body.password;
  //verification steps
  if(!username  || !password){
    //build a model
    model = { error:' Username and password are required.'}
  //send a response
  return res.status(400).render('login.handlebars', model)
  }
  //check if user is
  if (username == adminName){
    console.log('The username is the admin one!')
    // if (password == adminPassword){

        
          bcrypt.compare(password, adminPassword, (err, result) => {
              if (err) {
                  const model = { error: "Error while comapring passwords: " +  err, message: "" }
                  res.render('login.handlebars', model);
              }
             if(result){
                      console.log('The password is the admin one!')
                     //saves the info into the session 
                     req.session.isAdmin = true
                       req.session.isLoggedIn =true
                       req.session.name = username
                      console.log("Session information: " + JSON.stringify(req.session)) 
                 //not to login but...
                   res.redirect("/")
           //you are the admin, build a model 
             } else {
             const model = { error: "Sorry, the password is not correct..", message: ""} 
            //send a response
              res.status(400).render('login.handlebars', model);
          }
       })
    

        console.log('The password is the admin one!')
    //build a model 
    const model = {error: "", message: "You are the admin. Welcome home!"}
    //send a response
    res.render('login.handlebars', model);
    } else {
    //build a model
    const model = { error: `Sorry the username ${username} is not correct...`, message: "" }
    //send a response
    res.status(400).render('login.handlebars', model);
}
})


//const model= {error: "", message: "You are the admin. Welcome home!"}
//send a response
//res.render('login.handlebars', model);
//} else {
    //build a model 
      // const model = { error: "Sorry, the password is not correct..", message: ""} 
        //send a response
       // res.status(400).render('login.handlebars', model);
   // }
//} else {
    //build a model
   // const model = { error: `Sorry the username ${username} is not correct...`, message: "" }
    //send a response
   // res.status(400).render('login.handlebars', model);
//}
//})
    
  

  //PROJECT PAGE 
  app.get('/projects', (req, res) => {
    db.all('SELECT * FROM Projects', (error, projects) => {
        if (error) {
            console.error('Error fetching projects:', error);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('projects.handlebars', { projects });
        }
    });
});

// SKILLS PAGE
app.get('/skills', (req, res) => {
    db.all('SELECT * FROM Skills', (error, skills) => {
        if (error) {
            console.error('Error fetching skills:', error);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('skills.handlebars', { skills });
        }
    });
});




//-------
// FUNCTION
//-------
//dataase

//Table Projects 
function initTableProjects(db){
    //define the array of projects 
    const projects  = [
            {
                "pdate": "03-05-2024",
                "pid": 1,
                "pimage": "/images/img1.png",
                "ptitle": "Project 1"
            },
            {
                "pdate": "23-03-2019",
                "pid": 2,
                "pimage": "/images/img2.png\n",
                "ptitle": "Project 2"
            },
            {
                "pdate": "09-07-2021",
                "pid": 3,
                "pimage": "/images/img3.png",
                "ptitle": "Project 3"
            },
            {
                "pdate": "18-03-2024",
                "pid": 4,
                "pimage": "/images/img4.png",
                "ptitle": "Project 4"
            },
            {
                "pdate": "09-12-2023",
                "pid": 5,
                "pimage": "/images/img5.png",
                "ptitle": "Project 5"
            },
            {
                "pdate": "13-10-2022",
                "pid": 6,
                "pimage": "/images/img6.png\n",
                "ptitle": "Project 6"
            }]

    // Create the table if it doesn't exist, then insert the data
    db.run("CREATE TABLE IF NOT EXISTS projects (pid INTEGER PRIMARY KEY, ptitle TEXT NOT NULL, pimage TEXT, pdate TEXT)", (error) => {
        if (error) {
            console.log("ERROR:", error);
        } else {
            console.log("---> Projects table created (or already exists)");

            // Insert projects data
            projects.forEach((oneProject) => {
                db.run("INSERT INTO projects (pid, ptitle, pimage, pdate) VALUES (?, ?, ?, ?)", 
                [oneProject.pid, oneProject.ptitle, oneProject.pimage, oneProject.pdate], 
                (error) => {
                    if (error) {
                        console.log("ERROR inserting project:", error);
                    } else {
                        console.log("---> Project inserted:", oneProject.ptitle);
                    }
                });
            });
        }
    });

}


//SKILLS Table
function initTableSkills(db) {
    //define the array of skills
    const skills = [
        {
            "sdescription": "Creativity is one of the ways where people express their art story",
            "sid": 1,
            "stitle": "Creativity"
        },
        {
            "sdescription": "Paying attention to detail involves concentration and the ability to look closely at a subject or activity.",
            "sid": 2,
            "stitle": "Attention to details"
        },
        {
            "sdescription": "Design principles are rules that will help guide you and your team while making important decisions throughout your projects.",
            "sid": 3,
            "stitle": "Design Principles"
        },
        {
            "sdescription": "Its the process of enhancing and manipluating the photo, and it can invlove basic cropping, resizing and photoshoping.",
            "sid": 4,
            "stitle": "Photo editing"
        },
        {
            "sdescription": "Graphic communication focuses on the design, development and delivery of visual pieces used to relay specific information, ideas or emotions.",
            "sid": 5,
            "stitle": "Graphic communication"
        },
        {
            "sdescription": "Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed, different tones and styles.",
            "sid": 6,
            "stitle": "Typography"
        }
    ]
   // Create the table if it doesn't exist, then insert the data
   db.run("CREATE TABLE IF NOT EXISTS Skills (sid INTEGER PRIMARY KEY, stitle TEXT NOT NULL, sdescription TEXT)", (error) => {
    if (error) {
        console.log("ERROR:", error);
    } else {
        console.log("---> Skills table created (or already exists)");

        // Insert skills data
       skills.forEach((oneSkill) => {
            db.run("INSERT INTO skills (sid, stitle, sdescription) VALUES (?, ?, ?)", 
            [oneSkill.sid, oneSkill.stitle, oneSkill.sdescription], 
            (error) => {
                if (error) {
                    console.log("ERROR inserting skill:", error);
                } else {
                    console.log("---> Skill inserted:");
                }
            });
        });
    }
}); 

}


// PROJECTS HANDLEBARS
// app.get('/projects', function (req, res){
//     res.render('projects.handlebars')
// })


// listen to the port
app.listen(port, function () {
    // displays a message in the terminal when the server is listening
    //initTableProjects(db);
    //initTableSkills(db);
    console.log('Server is listening on port ' + port +'...');
});

// create a new route to send back infor on one specific project
app.get('/projects/:pid', function (req, res) {
console.log("Project route parameter pid: ", req.params.pid)
// select in the table teh project with the given id
db.get("SELECT * FROM projects WHERE pid = ?", [req.params.pid], (error, theProject) => {
    if (error) {
        console.error("Error fetching project:", error); // Log the error
        return res.status(500).send("Internal Server Error"); // Send a 500 status in case of error
    }
    if (!theProject) {
        return res.status(404).send("Project not found"); // Send a 404 if the project doesn't exist
    }

    // Render the project page with the fetched project data
    res.render('project.handlebars', { project: theProject });
})
})