const nodemailer = require("nodemailer");
const path = require("node:path");
class MailService{

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.SMTPHost,
			port: process.env.SMTPPort,
			secure: true,
			auth: {
				user: process.env.SMTPUser,
				pass: process.env.SMTPPassword
			}
		})
	}
	async sendActivationMail(to, link){
		await this.transporter.sendMail({
			from: process.env.SMTPUser,
			to,
			subject: "Активация аккаунта на " + process.env.API_URL,
			text: '',
			html:
				`
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Активация аккаунта</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            color: #000;
                        }
                        .container {
                            max-width: 100%;
                            background-color: #efefef;
                        }
                        .wrapper {
                            max-width: 80%;
                            padding: 20px 15px;
                            background-color: #fff;
                            margin: 0 auto;
                        }
                        .header {
                            background-color: #0D41E1;
                            color: #fff;
                            padding: 10px;
                            text-align: center;
                        }
                        .image{
                            width: 100%;
                        }
                        .content {
                            margin: 20px 0;
                        }
                        h5 {
                            font-size: 16px;
                            margin-bottom: 20px;
                            font-weight: normal;
                        }
                        .btn {
                            display: inline-block;
                            padding: 10px 20px;
                            background-color: #0D41E1;
                            text-decoration: none;
                            border-radius: 5px;
                            color: #fff;
                        }
                       .btn:hover {
                            opacity: .5;
                        }
                        a {
                            color: #fff!important;
                            text-decoration: none;
                        }
                        p{
                            font-size: 14px;
                            margin: 0;
                        }
                        
                        @media screen and (max-width: 768px) {
					        .wrapper {
					            max-width: 100%;
					            padding: 10px;
					        }
					        h5{
					            font-size: 14px;
					        }
					        p{
					            font-size: 12px;
					        }
					    }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="wrapper">
                            <div class="header">
                            <img src="cid:logo" alt="img">
                            </div>
                            <div class="content">
                                <h2>Здравствуйте,</h2>
                                <h5>Чтобы активировать ваш аккаунт, перейдите по ссылке ниже:</h5>
                                <a href="${link}" class="btn">Активировать</a>
                            </div>
                            <p>Если вы не запрашивали активацию аккаунта, проигнорируйте сообщение.</p>
                            <p>Хорошего дня,</p>
                            <p>Команда DIT</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
			attachments: [
				{
					filename: 'logo.png',
					path: path.join(__dirname, '../static/logo.png'),
					cid: 'logo'
				}
			]
		})
	}
}

module.exports = new MailService();