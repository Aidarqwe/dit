const userService = require("../service/user-service");
const {validationResult} = require("express-validator");
const ApiError = require("../exceptions/api-error");
const mailService = require("../service/mail-service");
const {createConnection} = require("../dbConnection");

class UserController{
	async registration(req, res, next){
		try{
			const errors = validationResult(req);
			if(!errors.isEmpty()){
				return next(ApiError.BadRequest("Ошибка при валидации", errors.array()));
			}
			const {email, password} = req.body;
			const userData = await userService.registration(email, password);
			res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
			return(res.json(userData));

		}catch (e){
			next(e);
		}
	}

	async login(req, res, next){
		try{
			const {email, password} = req.body;
			const userData = await userService.login(email, password);
			res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
			return(res.json(userData));
		}catch (e){
			next(e);
		}
	}
	async logout(req, res, next){
		try{
			const {refreshToken} = req.cookies;
			const token = await userService.logout(refreshToken);
			res.clearCookie("refreshToken");
			return res.json(token);
		}catch (e){
			next(e);
		}
	}
	async activate(req, res, next){
		try{
			const activationLink = req.params.link;
			await userService.activate(activationLink);
			return res.redirect(process.env.CLIENT_URL);
		}catch (e){
			next(e);
		}
	}
	async refresh(req, res, next){
		try{
			const {refreshToken} = req.cookies;
			const userData = await userService.refresh(refreshToken);
			res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
			return(res.json(userData));
		}catch (e){
			next(e);
		}
	}

	async confirmEmail(req, res, next){
		try{
			const {email} = req.body;
			const connection = await createConnection();
			const [res] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
			const activationLink = res[0].activation_link;
			await mailService.sendActivationMail(email, `${process.env.API_URL}/activate/${activationLink}`);
			return (res("Письмо успщно отправлено на почту " + email));
		}catch (e){
			next(e);
		}
	}

	async reset(req, res, next){
		try {
			const errors = validationResult(req);
			if(!errors.isEmpty()){
				return next(ApiError.BadRequest("Ошибка при валидации", errors.array()));
			}
			const {email} = req.body;
			const result = await userService.sendResetEmail(email);
			return (res.json(result));
		}catch (e){
			next(e);
		}
	}

	async proofUser(req, res, next){
		try{
			const activationLink = req.params.link;

			const currentTime = Date.now();
			const linkExpirationTime = 3600000;

			if (currentTime - activationLink.timestamp > linkExpirationTime) {
				return res.redirect(`${process.env.CLIENT_URL}/reset`);
			}

			await userService.proofUser(activationLink);
			return res.redirect(`${process.env.CLIENT_URL}/reset?activationLink=${activationLink}`);
		}catch (e){
			next(e);
		}
	}

	async changeEmail(req, res, next){
		try {
			const errors = validationResult(req);
			if(!errors.isEmpty()){
				return next(ApiError.BadRequest("Ошибка при валидации", errors.array()));
			}
			const {email, id} = req.body;
			const result = await userService.changeEmail(email, id);
			return (res.json(result))
		}catch (e){
			next(e);
		}
	}

	async changePassword(req, res, next){
		try {
			const errors = validationResult(req);
			if(!errors.isEmpty()){
				return next(ApiError.BadRequest("Ошибка при валидации", errors.array()));
			}
			const {password, activationLink, id} = req.body;
			const result = await userService.changePassword(password, activationLink, id);
			return (res.json(result))
		}catch (e){
			next(e);
		}
	}
}

module.exports = new UserController();