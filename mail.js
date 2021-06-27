const nodemailer = require('nodemailer');
const mailGun = require('nodemailer-mailgun-transport');

const auth={
	auth:{
		api_key:'83d0874a8a514988a6e3f666ffd49886-1f1bd6a9-6a98e190',
		domain:'sandbox9aa828ffb3f84587bbf79276bd9f31dc.mailgun.org'
	}
};

const transporter = nodemailer.createTransport(mailGun(auth));

const sendMail = (email,subject,text,cb) =>{
	const mailOption={
	from:'vidhifranciscaandv@gmail.com',
	to:email,
	subject:subject,
	text:text
	};

	transporter.sendMail(mailOption, function(err,data){
	if(err){
		cb(err,null);
	} else{
		cb(null,data);
	}
});
}

module.exports = sendMail;