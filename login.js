const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ck243414$",  
    database: "final"
});

connection.connect((error) => {
    if (error) {
        console.error("Error connecting to the database:", error);
        return;
    }
    console.log("Connected to the MySQL database.");
});

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/", (req, res) => {
    const action = req.body.action;
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        res.status(400).send("Username and password are required");
        return;
    }

    if (action === "login") {
        if (username === "chaitanya" && password === "abc") {
            res.sendFile(path.join(__dirname, "landingadmin.html"));
            return;
        }

        console.log("Attempting to log in user:", username);
        connection.query(
            "SELECT * FROM users WHERE username = ? AND password = ?",
            [username, password],
            (error, results) => {
                if (error) {
                    console.error("Error during the query:", error);
                    res.status(500).send("Internal Server Error");
                    return;
                }

                if (results.length > 0) {
                    console.log("Login successful for user:", username);
                    res.sendFile(path.join(__dirname, "landingalt.html"));
                } else {
                    console.log("Invalid credentials for user:", username);
                    res.status(401).send("Invalid credentials");
                }
            }
        );
    } else if (action === "signup") {
        console.log("Attempting to sign up user:", username);
        connection.query(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, password],
            (error, results) => {
                if (error) {
                    if (error.code === 'ER_DUP_ENTRY') {
                        console.error("Signup failed: Username already exists");
                        res.status(409).send("Username already exists");
                    } else {
                        console.error("Error during the query:", error);
                        res.status(500).send("Internal Server Error");
                    }
                    return;
                }

                console.log("Signup successful for user:", username);
                res.sendFile(path.join(__dirname, "welcome.html"));
            }
        );
    } else {
        res.status(400).send("Invalid action");
    }
});


function fetchDataFromMySQL(dagId, tableName) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ${tableName} WHERE dag_id = ?`;
        connection.query(query, [dagId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

app.get('/data', (req, res) => {
    const dagId = req.query.dagId;
    const tableName = req.query.tableName; 
    
    fetchDataFromMySQL(dagId, tableName)
        .then(data => {
            res.json(data); 
        })
        .catch(error => {
            console.error('Error fetching data from MySQL:', error);
            res.status(500).send('Internal Server Error'); 
        });
});

app.get("/landingalt", (req, res) => {
    res.sendFile(path.join(__dirname,public, "landingalt.html"));
});

app.get("/user_info", (req, res) => {
    res.sendFile(path.join(__dirname, "user_info.html"));
});

app.get("/user_list", (req, res) => {
    res.sendFile(path.join(__dirname, "user_list.html"));
});

app.get("/UserInfoSpecification", (req, res) => {
    res.sendFile(path.join(__dirname, "UserInfoSpecification.html"));
});

app.get("/config_dag", (req, res) => {
    res.sendFile(path.join(__dirname, "config_dag.html"));
});

app.get("/datavalidver", (req, res) => {
    res.sendFile(path.join(__dirname, "datavalidver.html"));
});
app.get("/realdagconfig", (req, res) => {
    res.sendFile(path.join(__dirname, "realdagconfig.html"));
});

app.get("/user_data", (req, res) => {
    connection.query("SELECT * FROM users", (error, results) => {
        if (error) {
            console.error("Error fetching user data:", error);
            res.status(500).send("Internal Server Error");
            return;
        }
        res.json(results);
    });
});

app.post('/disable', (req, res) => {
    const username = req.body.username;

    if (!username) {
        return res.status(400).send('Username is required.');
    }

    const getUserSql = 'SELECT id FROM users WHERE username = ?';
    db.query(getUserSql, [username], (err, results) => {
        if (err) {
            console.error('Error fetching user ID:', err);
            return res.status(500).send('Error fetching user ID.');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found.');
        }

        const userId = results[0].id;
        const insertDisableSql = 'INSERT INTO disable (id, username) VALUES (?, ?)';
        db.query(insertDisableSql, [userId, username], (err, result) => {
            if (err) {
                console.error('Error inserting into disable table:', err);
                return res.status(500).send('Error inserting into disable table.');
            }
            res.send('User disabled successfully.');
        });
    });
});
  
app.post('/enable', (req, res) => {
    const username = req.body.username;

    if (!username) {
        return res.status(400).send('Username is required.');
    }

    const getUserSql = 'SELECT id FROM users WHERE username = ?';
    db.query(getUserSql, [username], (err, results) => {
        if (err) {
            console.error('Error fetching user ID:', err);
            return res.status(500).send('Error fetching user ID.');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found.');
        }

        const userId = results[0].id;
        const deleteDisableSql = 'DELETE FROM disable WHERE id = ? AND username = ?';
        db.query(deleteDisableSql, [userId, username], (err, result) => {
            if (err) {
                console.error('Error deleting from disable table:', err);
                return res.status(500).send('Error deleting from disable table.');
            }
            res.send('User enabled successfully.');
        });
    });
});
  
app.get('/user_data', (req, res) => {
    const sqlQuery = `
        SELECT id, username, password FROM users;
    `;
    connection.query(sqlQuery, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/dag_info', (req, res) => {
    const userId = req.query.user_id;
    const sqlQuery = `
        SELECT dag_id FROM dag_info WHERE user_id = ?;
    `;
    connection.query(sqlQuery, [userId], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/dag_status_count', (req, res) => {
    const dagId = req.query.dag_id;
    const sqlQuery = `
        SELECT COUNT(*) AS count FROM dag_status WHERE dag_id = ?;
    `;
    connection.query(sqlQuery, [dagId], (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});




