const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const express = require("express");


const db = require('./db');


const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.send('Running');
});

app.post('/login',(req,res) => {

	const { username, password } = req.body;

	db.query('SELECT * FROM `user_info` WHERE email = ? and pwd = ?',[username,password], (err, results, fields) => {
		if (err) {
		  console.error('Error executing query:', err);
		} else {
		  // Process the results here
		//   res.send(results);
		if(results.length===0){
			// res.send("null");
			res.status(201).json({error:"Invalid email or password"});
		}else{
			res.status(200).json(results[0]);
			// res.status(200).json(results[0].id);
		}
		}
	  });
	// res.json(req.body);
    // res.send("ok");

});

app.post('/update',(req,res)=>{

	const { id,tkn } = req.body;
	db.query('UPDATE `user_info` SET `sockettkn` = ? WHERE `user_info`.`id` = ?;',[tkn,id], (err, results, fields) => {

		if(err){
			console.error('Error executing query:', err);
		}else{
			const affectedRows = results.affectedRows;
			res.json({ affectedRows }); 
		}
	});

});

app.post('/updateinfo', (req,res) =>{
	const { name , email , oldPassword, newPassword } = req.body;

	db.query('SELECT * FROM `user_info` WHERE email = ? and pwd = ?',[email,oldPassword], (err, results, fields) => {
		if (err) {
		  console.error('Error executing query:', err);
		} else {
		if(results.length===0){
			res.status(201).json({error:"Invalid request"});
		}else{
			//db insert query
			const id = results[0].id;
			db.query('UPDATE `user_info` SET `email` = ?, `pwd` = ?, `name` = ? WHERE `user_info`.`id` = ?;',[email,newPassword,name,id],(err,result,fields) =>{
				if(err) {
					console.error('Error executing query:', err);
				} else{
					// const affectedRows = result.affectedRows;
					// res.status(200).json({ affectedRows }); 
					// res.status(200).json(result);
					//new upd
					db.query('SELECT * FROM `user_info` WHERE `id` = ?',[id],(err,result1,fields) =>{
						if(err) {
							console.error('Error executing query:', err);
						} else{
							// const affectedRows = result.affectedRows;
							res.status(200).send(result1[0]); 
							// res.status(200).json(result);
						}
					});
					//new upd end
				}
			});
			//db insert query end
			// res.status(200).json(results[0]);
		}
		}
	  });

});


io.on("connection", (socket) => {
	socket.emit("me", socket.id);

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
