const { Client } = require('pg');
var express = require('express');

const client = new Client({
  connectionString: "postgres://jptbyfzymxpjdi:0f9fe89fddc8e4e6a2d2a7914c3b403478dc86d24c82c16599dff13f87d979c9@ec2-54-197-234-117.compute-1.amazonaws.com:5432/da5836to2svumd",
  ssl: true,
});

client.connect();

var myapp = express();

myapp.get('/UI/index.html', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

myapp.post('/auth/signup', function (req, res) {
var datae = {};
client.query('INSERT INTO users(first_name,last_name,password,address,email,phone,token) VALUES(' + req.first_name + ', ' + req.last_name + ', ' + req.password + ', ' + req.address + ', ' + req.email + ', ' + req.phone + ', ' + req.token + ') RETURNING id;', (err, resp) => {
if (err){
datae['status'] = 404;
datae['error'] = "Error: Problem occur when signing up...";
}else{
datae['status'] = 200;
var arr = [];
arr['token'] = req.token;
arr['id'] = resp.rows.id;
arr['first_name'] = req.first_name;
arr['last_name'] = req.first_name;
arr['email'] = req.email;
datae['data'] = arr;
}

});

res.send( datae);
});

myapp.post('/auth/signin', function (req, res) {
var datae = {};
client.query('SELECT firstname,lastname FROM users WHERE email = ' + req.email + ' AND password = ' + req.password + ';', (err, resp) => {
if (err){
datae['status'] = 404;
datae['error'] = "Error: Incorrect Login Credentials...";
}else{
datae['status'] = 200;
datae['data'] = resp.rows;
} 

});
res.send( datae); 
});

myapp.post('/car/', function (req, res) {
var datae = {};
client.query('INSERT INTO cars(email,created_on,manufacturer,model,price,state,status,body_type) VALUES(' + req.email + ', ' + Date.now() + ', ' + req.manufacturer + ', ' + req.model + ', ' + req.price + ', ' + req.state + ', ' + req.status + ', ' + req.body_type + ') RETURNING id;', (err, resp) => {
if (err){
datae['status'] = 404;
datae['error'] = "Error: Problem occur when creating advert...";
}else{
datae['status'] = 200;
var arr = [];
arr['id'] = resp.rows.id;
arr['email'] = req.email;
arr['created_on'] = Date.now();
arr['manufacturer'] = req.manufacturer;
arr['model'] = req.model;
arr['price'] = req.price;
arr['state'] = req.state;
arr['status'] = req.status;
arr['body_type'] = req.body_type;
datae['data'] = arr;
}

});

res.send( datae);
});

myapp.post('/order/', function (req, res) {
var datae = {};
client.query('SELECT * FROM cars WHERE email = ' + req.email + ' AND id = ' + req.car_id + ';', (err, resp) => {
if (err){
datae['status'] = 404;
datae['error'] = "Error: Can't Order For Car or Car does Not exist...";
}else{
var pending = "pending";
client.query('INSERT INTO orders(car_id,created_on,status,price,price_offered) VALUES(' + resp.rows.car_id + ', ' + Date.now() + ', ' + pending + ', ' + resp.rows.price + ', ' + req.price_offered + ') RETURNING id;', (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Problem Occur When Creating Order...";
}else{
datae['status'] = 200;
var arr = [];
arr['id'] = resp2.rows.id;
arr['car_id'] = resp.rows.id;
arr['created_on'] = Date.now();
arr['status'] = pending;
arr['price'] = resp.rows.price;
arr['price_offered'] = req.price_offered;
arr['body_type'] = resp.rows.body_type;
datae['data'] = arr;
} 

});
}
});
res.send( datae);
});

myapp.patch('/order/:order-id/price', function (req, res) {
var orderid = req.params.order-id;
var datae = {};
client.query('SELECT * FROM orders WHERE id = ' + orderid + ';', (err, resp) => {
if (err){
datae['status'] = 404;
datae['error'] = "Error: Incorrect Order Identity, Can't Update Order Price...";
}else{
if(resp.rows.status == "pending"){
client.query('UPDATE orders SET price_offered = ' + req.price_offered + ' WHERE id = ' + orderid + ';', (err2, resp2) => {
if(err2){
datae['status'] = 404;
datae['error'] = "Error: Can't Update Order Price...";	
}else{
datae['status'] = 200;
var arr = [];
arr['id'] = orderid;
arr['car_id'] = resp.rows.car_id;
arr['created_on'] = Date.now();
arr['status'] = resp.rows.status;
arr['old_price_offered'] = resp.rows.price_offered;
arr['new_price_offered'] = req.price_offered;
arr['body_type'] = resp.rows.body_type;
datae['data'] = arr;	
}
});	
}	

} 

});	
	
res.send(datae);
});

myapp.patch('/car/:car-id/status', function (req, res) {
var carid = req.params.car-id;
var newstatus = "sold";
var datae = {};

client.query('UPDATE cars SET status = ' + newstatus + ' WHERE id = ' + carid + ';', (err, resp) => {
if(err){
datae['status'] = 404;
datae['error'] = "Error: Can't Update Car Status...";	
}else{
	
client.query('SELECT * FROM cars WHERE id = ' + carid + ';', (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Try again, server unable to respond...";
}else{

datae['status'] = 200;
var arr = [];
arr['id'] = carid;
arr['email'] = resp2.rows.email;
arr['created_on'] = resp2.rows.created_on;
arr['status'] = newstatus;
arr['manufacturer'] = resp2.rows.manufacturer;
arr['model'] = resp2.rows.model;
arr['price'] = resp2.rows.price;
arr['state'] = resp2.rows.state;

datae['data'] = arr;

}	
});	
	
}
});	
	
res.send(datae);
});

myapp.patch('/car/:car-id/price', function (req, res) {
var carid = req.params.car-id;

var datae = {};

client.query('UPDATE cars SET price = ' + req.price + ' WHERE id = ' + carid + ';', (err, resp) => {
if(err){
datae['status'] = 404;
datae['error'] = "Error: Can't Update Car's Price...";	
}else{
	
client.query('SELECT * FROM cars WHERE id = ' + carid + ';', (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Try again, server unable to respond...";
}else{

datae['status'] = 200;
var arr = [];
arr['id'] = carid;
arr['email'] = resp2.rows.email;
arr['created_on'] = resp2.rows.created_on;
arr['status'] = resp2.rows.status;
arr['manufacturer'] = resp2.rows.manufacturer;
arr['model'] = resp2.rows.model;
arr['price'] = resp2.rows.price;
arr['state'] = resp2.rows.state;

datae['data'] = arr;

}	
});	
	
}
});	
	
res.send(datae);
});

myapp.get('/car/:car-id/', function (req, res) {
var carid = req.params.car-id;

var datae = {};

client.query('SELECT * FROM cars WHERE id = ' + carid + ';', (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Try again, server unable to respond...";
}else{

datae['status'] = 200;
var arr = [];
arr['id'] = carid;
arr['owner'] = resp2.rows.email;
arr['created_on'] = resp2.rows.created_on;
arr['status'] = resp2.rows.status;
arr['manufacturer'] = resp2.rows.manufacturer;
arr['model'] = resp2.rows.model;
arr['price'] = resp2.rows.price;
arr['state'] = resp2.rows.state;
arr['body_type'] = resp2.rows.body_type;

datae['data'] = arr;

}	
});	
	
res.send(datae);
});

myapp.get('/car/:car-id/', function (req, res) {
var carid = req.params.car-id;

var datae = {};

client.query('SELECT * FROM cars WHERE id = ' + carid + ';', (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Try again, server unable to respond...";
}else{

datae['status'] = 200;
var arr = [];
arr['id'] = carid;
arr['owner'] = resp2.rows.email;
arr['created_on'] = resp2.rows.created_on;
arr['status'] = resp2.rows.status;
arr['manufacturer'] = resp2.rows.manufacturer;
arr['model'] = resp2.rows.model;
arr['price'] = resp2.rows.price;
arr['state'] = resp2.rows.state;
arr['body_type'] = resp2.rows.body_type;

datae['data'] = arr;

}	
});	
	
res.send(datae);
});

myapp.get('/car?status=available', function (req, res) {
var carStatus = "available";

var datae = {};

client.query('SELECT * FROM cars WHERE status = ' + carStatus + ';', (err2, resp2) => {
if (err2){
datae['status'] = 404;
datae['error'] = "Error: Try again, server unable to respond...";
}else{
var arr2 = [];
datae['status'] = 200;
for (var i=0; i < resp2.rows.length; i++){
var arr = [];
arr['id'] = carid;
arr['owner'] = resp2.rows[i].email;
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
}	
});	
	
res.send(datae);
});

const portr = process.env.PORT || 3000;
client.end();
myapp.listen(portr);
