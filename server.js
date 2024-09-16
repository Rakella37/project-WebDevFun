const express = require("express"); //load the express package into
const port = 8080; //define the port
const app = express(); //create the web application
app.use(express.static('public')) //the public directory is static
//create the (default) route
app.get('/', function (req, res) {
  res.send('I am Rakella... :)')
})
//create a new route to send back my CV
app.get('/cv', function(req,res) {
    res.sendFile(_dirname+'/porfolio.html')
})
//listen to the port
app.listen(port, function () {
  console.log(
    "Server up and running, listening on port express" + `${port} ` + "... :)"
  );
});
