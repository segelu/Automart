const { Client } = require('pg');
var express = require('express');
var bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const client = new Client({
  connectionString: "postgres://jptbyfzymxpjdi:0f9fe89fddc8e4e6a2d2a7914c3b403478dc86d24c82c16599dff13f87d979c9@ec2-54-197-234-117.compute-1.amazonaws.com:5432/da5836to2svumd",
  ssl: true,
});

client.connect();	

var myapp = express();
const path = require('path');
const router = express.Router();

myapp.use(function(req, res, next){ 
req.headers['content-type'] = "application/json"; 
next();
});

myapp.get('/', function(req, res) {
   res.sendFile( __dirname);
   res.sendFile(path.join(__dirname + '/UI/index.html'));
});
myapp.use(express.static(__dirname + '/UI'));
myapp.use(bodyParser.urlencoded({ extended: true }));
myapp.use(bodyParser.json());


myapp.post('/auth/signup', function (req, res) {
client.connect();	

var datae = {};
var user = {};
var mamail = req.body.email;
var mafirst_name = req.body.first_name;
var malast_name = req.body.last_name;
var mapassword = req.body.password;
var maaddress = req.body.address;
var maphone = req.body.phone;
var isadmin = req.body.is_admin;
var maId = 3;	
	
user['email'] = mamail;
user['secretKey'] = mapassword;
jwt.sign(user, mapassword, { expiresIn: '1h' },(errt, token) => {

if(errt){ 
datae['status'] = 404;
datae['error'] = "Error: Connection Not Secure...";
res.send(datae);
}else{ 
client.query("SELECT id FROM users ORDER BY id DESC;", (errf, respf) => {
if (errf){
	
}else{
var newId = respf.rows[0].id + 1;	
const text = "INSERT INTO users(id,first_name,last_name,password,address,email,phone,is_admin) VALUES('"+ newId +"', '"+ mafirst_name +"', '"+ malast_name +"', '"+ mapassword +"', '"+ maaddress +"', '"+ mamail +"', '"+ maphone +"', '"+ isadmin +"') RETURNING id;";

client.query(text, (err, resp) => {
if (err){
datae['status'] = 404;
datae['error'] = "Error: Problem occur when signing up...";
res.send(datae);
}else{
	
datae['status'] = 200;
var arr = {};
arr['id'] = resp.rows[0].id;
arr['first_name'] = mafirst_name;
arr['last_name'] = malast_name;
arr['email'] = mamail;
arr['token'] = token; 
arr['secretKey'] = mapassword;
arr['is_admin'] = isadmin;

datae['data'] = arr;
res.send(datae);
}
});
}
});
}
});

});

myapp.post('/auth/signin', function (req, res) {
client.connect();	
	
var datae = {};
var user = {};

client.query("SELECT id,first_name,last_name,is_admin FROM users WHERE email = '" + req.body.email + "' AND password = '" + req.body.password + "';", (err, resp) => {
if (err){
datae['status'] = 404;
datae['error'] = "Error: Incorrect Login Credentials...";
res.send(datae);
}else{
	
user['email'] = req.body.email;
user['secretKey'] = req.body.password;
jwt.sign(user, req.body.password, { expiresIn: '1h' },(errt, token) => {
if(errt){ 
datae['status'] = 404;
datae['error'] = "Error: Connection Not Secure...";
res.send(datae);
}else{ 	
var arr = {};
arr['id'] = resp.rows[0].id;
arr['first_name'] = resp.rows[0].first_name;
arr['last_name'] = resp.rows[0].last_name;
arr['is_admin'] = resp.rows[0].is_admin;
arr['email'] = req.body.email;
arr['token'] = token;
arr['secretKey'] = req.body.password;
datae['status'] = 200;
datae['data'] = arr;
res.send(datae);
}
});

} 

});


});

myapp.post('/car/', function (req, res) {
client.connect();	

var datae = {};
jwt.verify(req.body.token, req.body.secretKey, (errt, authorizedData) => {
if(errt){ 
datae['status'] = 404;
datae['error'] = "Error: Your Connection Token As Expired...";	
res.send(datae);		
}else{

client.query("SELECT id FROM cars ORDER BY id DESC;", (errf, respf) => {
if (errf){
	
}else{

var newId = respf.rows[0].id + 1;	
var timStamp = req.body.date_added;
	
client.query("INSERT INTO cars(id,owner,created_on,manufacturer,model,price,state,status,body_type) VALUES('"+ newId +"', '" + req.body.email + "',  current_timestamp , '" + req.body.manufacturer + "', '" + req.body.model + "', '" + req.body.price + "', '" + req.body.state + "', '" + req.body.status + "', '" + req.body.body_type + "') RETURNING id;", (err, resp) => {
if (err){
datae['status'] = 404;
datae['error'] = err.stack;
res.send(datae);
}else{
datae['status'] = 200;
var arr = {};
arr['id'] = resp.rows[0].id;
arr['email'] = req.body.email;
arr['created_on'] = resp.rows[0].created_on;
arr['manufacturer'] = req.body.manufacturer;
arr['model'] = req.body.model;
arr['price'] = req.body.price;
arr['state'] = req.body.state;
arr['status'] = req.body.status;
arr['body_type'] = req.body.body_type;
datae['data'] = arr;
res.send(datae);
}

});

}

});
}
});

});

myapp.post('/order/', function (req, res) {
client.connect();	

var datae = {};
jwt.verify(req.body.token, req.body.secretKey, (errt, authorizedData) => {
if(errt){ 
datae['status'] = 404;
datae['error'] = "Error: Your Connection Token As Expired...";		
res.send( datae);	
}else{
	
client.query("SELECT id FROM orders ORDER BY id DESC;", (errf, respf) => {
if (errf){
	
}else{	

if(respf.rows[0].id == 0 || respf.rows[0].id == null){
var newId = 1;
}else{
var newId = respf.rows[0].id + 1;	
}
	
client.query("SELECT * FROM cars WHERE owner = '" + req.body.email + "' AND id = '" + req.body.car_id + "';", (err, resp) => {
if (err){
datae['status'] = 404;
datae['error'] = "Error: Can't Order For Car or Car does Not exist...";
res.send( datae);
}else{
var pending = "pending";
client.query("INSERT INTO orders(id,car_id,created_on,status,price,price_offered) VALUES('" + newId + "','" + resp.rows[0].car_id + "', current_timestamp, '" + pending + "', '" + resp.rows[0].price + "', '" + req.body.price_offered + "') RETURNING id;", (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Problem Occur When Creating Order...";
res.send( datae);
}else{
datae['status'] = 200;
var arr = {};
arr['id'] = resp2.rows[0].id;
arr['car_id'] = resp.rows[0].id;
arr['created_on'] = resp2.rows[0].created_on;
arr['status'] = pending;
arr['price'] = resp.rows[0].price;
arr['price_offered'] = req.body.price_offered;
arr['body_type'] = resp.rows[0].body_type;
datae['data'] = arr;
res.send( datae);
} 

});
}
});
}
});
}
});

});

myapp.patch('/order/:order-id/price', function (req, res) {
client.connect();

var orderid = req.params.order-id;
var datae = {};
jwt.verify(req.body.token, req.body.secretKey, (errt, authorizedData) => {
if(errt){ 
datae['status'] = 404;
datae['error'] = "Error: Your Connection Token As Expired...";		
res.send(datae);	
}else{
client.query("SELECT * FROM orders WHERE id = '" + orderid + "';", (err, resp) => {
if (err){
datae['status'] = 404;
datae['error'] = "Error: Incorrect Order Identity, Can't Update Order Price...";
res.send(datae);
}else{
if(resp.rows[0].status == "pending"){
client.query("UPDATE orders SET price_offered = '" + req.body.price_offered + "' WHERE id = '" + orderid + "';", (err2, resp2) => {
if(err2){
datae['status'] = 404;
datae['error'] = "Error: Can't Update Order Price...";
res.send(datae);	
}else{
datae['status'] = 200;
var arr = {};
arr['id'] = orderid;
arr['car_id'] = resp.rows[0].car_id;
arr['created_on'] = resp.rows[0].created_on;
arr['status'] = resp.rows[0].status;
arr['old_price_offered'] = resp.rows[0].price_offered;
arr['new_price_offered'] = req.body.price_offered;
arr['body_type'] = resp.rows[0].body_type;
datae['data'] = arr;	
res.send(datae);
}
});	
}	

} 

});	
}
});	

});

myapp.patch('/car/:car-id/status', function (req, res) {
client.connect();
	
var carid = req.params.car-id;
var newstatus = "sold";
var datae = {};
jwt.verify(req.body.token, req.body.secretKey, (errt, authorizedData) => {
if(errt){ 
datae['status'] = 404;
datae['error'] = "Error: Your Connection Token As Expired...";			
res.send(datae);
}else{
client.query("UPDATE cars SET status = '" + newstatus + "' WHERE id = '" + carid + "';", (err, resp) => {
if(err){
datae['status'] = 404;
datae['error'] = "Error: Can't Update Car Status...";	
res.send(datae);
}else{
	
client.query("SELECT * FROM cars WHERE id = '" + carid + "';", (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Try again, server unable to respond...";
res.send(datae);
}else{

datae['status'] = 200;
var arr = {};
arr['id'] = carid;
arr['email'] = resp2.rows[0].owner;
arr['created_on'] = resp2.rows[0].created_on;
arr['status'] = newstatus;
arr['manufacturer'] = resp2.rows[0].manufacturer;
arr['model'] = resp2.rows[0].model;
arr['price'] = resp2.rows[0].price;
arr['state'] = resp2.rows[0].state;

datae['data'] = arr;
res.send(datae);
}	
});	
	
}
});	
}
});		

});

myapp.patch('/car/:car-id/price', function (req, res) {
var carid = req.params.car-id;

var datae = {};
jwt.verify(req.body.token, req.body.secretKey, (errt, authorizedData) => {
if(errt){ 
datae['status'] = 404;
datae['error'] = "Error: Connection Not Secure...";	
res.send(datae);		
}else{
client.query("UPDATE cars SET price = '" + req.body.price + "' WHERE id = '" + carid + "';", (err, resp) => {
if(err){
datae['status'] = 404;
datae['error'] = "Error: Can't Update Car's Price...";	
res.send(datae);
}else{
	
client.query("SELECT * FROM cars WHERE id = '" + carid + "';", (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Try again, server unable to respond...";
res.send(datae);
}else{

datae['status'] = 200;
var arr = {};
arr['id'] = carid;
arr['email'] = resp2.rows[0].owner;
arr['created_on'] = resp2.rows[0].created_on;
arr['status'] = resp2.rows[0].status;
arr['manufacturer'] = resp2.rows[0].manufacturer;
arr['model'] = resp2.rows[0].model;
arr['price'] = resp2.rows[0].price;
arr['state'] = resp2.rows[0].state;

datae['data'] = arr;
res.send(datae);
}	
});	
	
}
});	
}
});		

});

myapp.get('/car/:car-id/', function (req, res) {
var carid = req.params.car-id;

var datae = {};
jwt.verify(req.body.token, req.body.secretKey, (errt, authorizedData) => {
if(errt){ 
datae['status'] = 404;
datae['error'] = "Error: Connection Not Secure...";	
res.send(datae);		
}else{
client.query("SELECT * FROM cars WHERE id = '" + carid + "';", (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Try again, server unable to respond...";
res.send(datae);
}else{

datae['status'] = 200;
var arr = {};
arr['id'] = carid;
arr['owner'] = resp2.rows[0].owner;
arr['created_on'] = resp2.rows[0].created_on;
arr['status'] = resp2.rows[0].status;
arr['manufacturer'] = resp2.rows[0].manufacturer;
arr['model'] = resp2.rows[0].model;
arr['price'] = resp2.rows[0].price;
arr['state'] = resp2.rows[0].state;
arr['body_type'] = resp2.rows[0].body_type;

datae['data'] = arr;
res.send(datae);
}	
});	
}
});		

});


myapp.get('/car', function (req, res) {
var carStatus = req.query.status;
var min_price = req.query.min_price;
var max_price = req.query.max_price;
var state = req.query.state;
var manufacturer = req.query.manufacturer;
var bodytype = req.query.body_type;

var datae = {};
jwt.verify(req.body.token, req.body.secretKey, (errt, authorizedData) => {
if(errt){ 
datae['status'] = 404;
datae['error'] = "Error: Connection Not Secure...";			
res.send(datae);
}else{
if(min_price == "" && max_price == "" && state == "" && carStatus !=""){
client.query("SELECT * FROM cars WHERE status = '" + carStatus + "';", (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Try again, server unable to respond...";
res.send(datae);
}else{
var arr2 = [];
datae['status'] = 200;
for (var i=0; i < resp2.rows.length; i++){
var arr = [];
arr['id'] = resp2.rows[i].id;
arr['owner'] = resp2.rows[i].owner;
arr['created_on'] = resp2.rows[i].created_on;
arr['status'] = resp2.rows[i].status;
arr['manufacturer'] = resp2[i].rows.manufacturer;
arr['model'] = resp2.rows[i].model;
arr['price'] = resp2.rows[i].price;
arr['state'] = resp2.rows[i].state;
arr['body_type'] = resp2.rows[i].body_type;
arr2.push(arr);
}
datae['data'] = arr2;
res.send(datae);
}	
});	
}else if(min_price != "" && max_price != ""){

client.query("SELECT * FROM cars WHERE status = '" + carStatus + "' AND price > '" + min_price + "' OR status = '" + carStatus + "' AND price = '" + min_price +  "' OR status = '" + carStatus + "' AND price < '" + max_price + "' OR status = '" + carStatus + "' AND price = '" + max_price + "';", (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Try again, server unable to respond...";
res.send(datae);
}else{
var arr2 = [];
datae['status'] = 200;
for (var i=0; i < resp2.rows.length; i++){
var arr = [];
arr['id'] = resp2.rows[i].id;
arr['owner'] = resp2.rows[i].owner;
arr['created_on'] = resp2.rows[i].created_on;
arr['status'] = resp2.rows[i].status;
arr['manufacturer'] = resp2[i].rows.manufacturer;
arr['model'] = resp2.rows[i].model;
arr['price'] = resp2.rows[i].price;
arr['state'] = resp2.rows[i].state;
arr['body_type'] = resp2.rows[i].body_type;
arr2.push(arr);
}
datae['data'] = arr2;
res.send(datae);
}	
});	

}else if(state != "" && carStatus !=""){

client.query("SELECT * FROM cars WHERE status = '" + carStatus + "' AND state = '" + state + "';", (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Try again, server unable to respond...";
res.send(datae);
}else{
var arr2 = [];
datae['status'] = 200;
for (var i=0; i < resp2.rows.length; i++){
var arr = [];
arr['id'] = resp2.rows[i].id;
arr['owner'] = resp2.rows[i].owner;
arr['created_on'] = resp2.rows[i].created_on;
arr['status'] = resp2.rows[i].status;
arr['manufacturer'] = resp2[i].rows.manufacturer;
arr['model'] = resp2.rows[i].model;
arr['price'] = resp2.rows[i].price;
arr['state'] = resp2.rows[i].state;
arr['body_type'] = resp2.rows[i].body_type;
arr2.push(arr);
}
datae['data'] = arr2;
res.send(datae);
}	
});	

}else if( manufacturer != "" && carStatus !=""){

client.query("SELECT * FROM cars WHERE status = '" + carStatus + "' AND manufacturer = '" + manufacturer + "';", (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Try again, server unable to respond...";
res.send(datae);
}else{
var arr2 = [];
datae['status'] = 200;
for (var i=0; i < resp2.rows.length; i++){
var arr = [];
arr['id'] = resp2.rows[i].id;
arr['owner'] = resp2.rows[i].owner;
arr['created_on'] = resp2.rows[i].created_on;
arr['status'] = resp2.rows[i].status;
arr['manufacturer'] = resp2[i].rows.manufacturer;
arr['model'] = resp2.rows[i].model;
arr['price'] = resp2.rows[i].price;
arr['state'] = resp2.rows[i].state;
arr['body_type'] = resp2.rows[i].body_type;
arr2.push(arr);
}
datae['data'] = arr2;
res.send(datae);
}	
});	

}else if( bodytype != "" ){

client.query("SELECT * FROM cars WHERE body_type = '" + bodytype + "';", (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Try again, server unable to respond...";
res.send(datae);
}else{
var arr2 = [];
datae['status'] = 200;
for (var i=0; i < resp2.rows.length; i++){
var arr = [];
arr['id'] = resp2.rows[i].id;
arr['owner'] = resp2.rows[i].owner;
arr['created_on'] = resp2.rows[i].created_on;
arr['status'] = resp2.rows[i].status;
arr['manufacturer'] = resp2[i].rows.manufacturer;
arr['model'] = resp2.rows[i].model;
arr['price'] = resp2.rows[i].price;
arr['state'] = resp2.rows[i].state;
arr['body_type'] = resp2.rows[i].body_type;
arr2.push(arr);
}
datae['data'] = arr2;
res.send(datae);
}	
});	

}
}
});		

});

myapp.delete('/car/:car-id/', function (req, res) {
var carid = req.params.car-id;

var datae = {};
jwt.verify(req.body.token, req.body.secretKey, (errt, authorizedData) => {
if(errt){ 
datae['status'] = 404;
datae['error'] = "Error: Connection Not Secure...";		
res.send(datae);	
}else{
client.query("DELETE FROM cars WHERE id = '" + carid + "';", (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Try again, server unable to respond...";
res.send(datae);
}else{
datae['status'] = 200;
datae['data'] =  " Successfully Deleted";
res.send(datae);
}	
});	
}
});		

});

myapp.get('/car/', function (req, res) {

var datae = {};
jwt.verify(req.body.token, req.body.secretKey, (errt, authorizedData) => {
if(errt){ 
datae['status'] = 404;
datae['error'] = "Error: Connection Not Secure...";			
res.send(datae);
}else{
client.query('SELECT * FROM cars ;', (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Try again, server unable to respond...";
res.send(datae);
}else{
var arr2 = [];
datae['status'] = 200;
for (var i=0; i < resp2.rows.length; i++){
var arr = [];
arr['id'] = carid;
arr['owner'] = resp2.rows[i].owner;
arr['created_on'] = resp2.rows[i].created_on;
arr['status'] = resp2.rows[i].status;
arr['manufacturer'] = resp2[i].rows.manufacturer;
arr['model'] = resp2.rows[i].model;
arr['price'] = resp2.rows[i].price;
arr['state'] = resp2.rows[i].state;
arr['body_type'] = resp2.rows[i].body_type;
arr2.push(arr);
}
datae['data'] = arr;
res.send(datae);
}	
});	
}
});		

});

myapp.post('/flag/', function (req, res) {
var datae = {};
jwt.verify(req.body.token, req.body.secretKey, (errt, authorizedData) => {
if(errt){ 
datae['status'] = 404;
datae['error'] = "Error: Connection Not Secure...";	
res.send( datae);		
}else{
	
client.query("SELECT id FROM flags ORDER BY id DESC;", (errf, respf) => {
if (errf){
	
}else{	

if(respf.rows[0].id == 0 || respf.rows[0].id == null){
var newId = 1;
}else{
var newId = respf.rows[0].id + 1;	
}
			
client.query("SELECT * FROM cars WHERE email = '" + req.body.email + "' AND id = '" + req.body.car_id + "';", (err, resp) => {
if (err){
datae['status'] = 404;
datae['error'] = "Error: Car does Not exist...";
res.send( datae);
}else{

client.query("INSERT INTO flags(id,car_id,created_on,reason,description) VALUES( '"+ newId +"', '" + req.body.car_id + "', current_timestamp, '" + req.body.reason + "', '" + req.body.description + "') RETURNING id;", (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Can Not Flag Advert...";
res.send( datae);
}else{
datae['status'] = 200;
var arr = {};
arr['id'] = resp2.rows.id;
arr['car_id'] = req.body.car_id;
arr['reason'] = req.body.reason;
arr['description'] = req.body.description;
datae['data'] = arr;
res.send( datae);
} 

});
}
});
}
});	
}
});

});


const portr = process.env.PORT || 3000;

myapp.listen(portr);
