var app, express, port, simple_recaptcha, nodemailer, transport;

simple_recaptcha = require("simple-recaptcha");
nodemailer = require("nodemailer");
express = require("express");

app = express();
port = process.env.PORT || 5000;

transport = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
});

app.use(express.bodyParser());

app.use(express.static(__dirname + "/public"));

app.post("/contact", function(req, res) {
	simple_recaptcha(
		process.env.CAPTCHA_API_KEY,
		req.ip,
		req.body.challenge,
		req.body.response,
		function(err){
			if(err){
				res.json({
	    			success: false,
	    			error: err.message
	    		});
	    	}else{
	    		transport.sendMail({
	    			from: "webmaster@richardvanderdys.com",
				    to: process.env.EMAIL,
				    subject: "Personal Website Contact | " + req.body.name,
				    text: req.body.message
	    		});
		    	res.json({
					success: true
	    		});
		    }
    	}
  	);
});

app.listen(port, function(){
	console.log("Listening on port " + port);
});
