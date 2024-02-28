const express = require("express");
const app = express();
const userRoute=require("./routes/user")
const mysql = require('mysql');

app.use(express.json());


app.use("",userRoute);

// Connect to mysql
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'auth',
  });
  
  
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL server:', err);
    return;
  }
  console.log('MySQL is connected');
  
  // Start the server only after the MySQL connection is established
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
});
