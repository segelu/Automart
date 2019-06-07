const { Client } = require('pg');
var express = require('express');

const client = new Client({
  connectionString: "postgres://jptbyfzymxpjdi:0f9fe89fddc8e4e6a2d2a7914c3b403478dc86d24c82c16599dff13f87d979c9@ec2-54-197-234-117.compute-1.amazonaws.com:5432/da5836to2svumd",
  ssl: true,
});

client.connect();

var app = express();

app.get('/', function (req, res) {

  res.send('hello world');
});

app.post('/auth/signup', function (req, res) {
var datae = {};
client.query('INSERT INTO users(first_name,last_name,password,address,email,phone,token) VALUES(' + req.first_name + ', ' + req.last_name + ', ' + req.password + ', ' + req.address + ', ' + req.email + ', ' + req.phone + ', ' + req.token + ');', (err, resp) => {
  if (err) throw err; 

if(resp){
datae['status'] = 200;
var arr = [];
arr['token'] = req.token;
arr['first_name'] = req.first_name;
arr['last_name'] = req.first_name;
arr['email'] = req.email;
datae['data'] = arr;
}else{
datae['status'] = 404;
datae['error'] = "Error: Incorrect Login Credentials...";
}  
client.end();
});

res.send( datae);
}
});

app.post('/auth/signin', function (req, res) {
var datae = {};
client.query('SELECT firstname,lastname FROM users WHERE email = ' + req.email + ' AND password = ' + req.password + ';', (err, resp) => {
  if (err) throw err; 
if(resp.rows.length > 0){
datae['status'] = 200;
datae['data'] = resp.rows;
}else{
datae['status'] = 404;
datae['error'] = "Error: Incorrect Login Credentials...";
}  
client.end();
});
res.send( datae); 
});

app.post('/car/', function (req, res) {
var datae = {};
client.query('INSERT INTO cars(email,created_on,manufacturer,model,price,state,status,body_type) VALUES(' + req.email + ', ' + req.created_on + ', ' + req.manufacturer + ', ' + req.model + ', ' + req.price + ', ' + req.state + ', ' + req.status + ', ' + req.body_type + ');', (err, resp) => {
  if (err) throw err; 

if(resp){
datae['status'] = 200;
var arr = [];
arr['created_on'] = req.created_on;
arr['manufacturer'] = req.manufacturer;
arr['model'] = req.model;
arr['price'] = req.price;
arr['state'] = req.state;
arr['status'] = req.status;
arr['body_type'] = req.body_type;
datae['data'] = arr;
}else{
datae['status'] = 404;
datae['error'] = "Error: Incorrect Login Credentials...";
}  
client.end();
});

res.send( datae);
}
});


app.put('/', function (req, res) {
  res.send('PUT request to homepage');
});


app.listen(3000);
