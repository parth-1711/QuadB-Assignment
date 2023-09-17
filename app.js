// QuadB-Assignment01
const express = require("express");
const dotenv=require("dotenv");
const { Pool } = require("pg");


dotenv.config();


const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
})
pool.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("connection successful !");
});


const app = express();
app.use(express.static("public"));

const datafetcher = async () => {
  try {
    let url = "https://api.wazirx.com/api/v2/tickers";
    let response = await fetch(url);
    let recievedData = await response.json();

    let listData = [];
    let count = 0;
    for (prop in recievedData) {
      if (count == 10) break;
      count++;
      // let data={name:name,recievedData[prop]}
      listData.push(recievedData[prop]);
      // console.log(prop);
    }

    let t1=await pool.query("create table if not exists test1( name varchar(20),last varchar(20), buy varchar(20), sell varchar(20),volume varchar(20), base_unit varchar(20));")
    let results = await pool.query("truncate test1");
    for (let i = 0; i < 10; i++) {
    //   console.log(listData[i]["name"]);
      pool.query(
        "insert into test1 (name,last,buy,sell,volume,base_unit) values ($1,$2,$3,$4,$5,$6)",
        [
          listData[i]["name"],
          listData[i]["last"],
          listData[i]["buy"],
          listData[i]["sell"],
          listData[i]["volume"],
          listData[i]["base_unit"],
        ],
        (error, results) => {
          if (error) {
            throw error;
          }
        //   console.log(listData[i]["name"]);
        }
      );
    }
  } catch (error) {
    throw error;
  }
};

datafetcher();

app.get('/data',async (req,res)=>{
    let results=await pool.query('select * from test1');
    res.status(201).json(results.rows);
})

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
  // console.log(typeof(recievedData));
});

app.listen(3000, () => {
  console.log("server is up and running!");
});
