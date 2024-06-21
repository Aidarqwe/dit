const {createConnection} = require("../dbConnection");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const mailService = require("./mail-service");
const resetMailService = require("./reset-mail-service");
const tokenService = require("./token-service");
const UserDto = require('../dtos/user-dto');
const ApiError = require("../exceptions/api-error");
class UserService{

	async registration(email, password) {
		try {
			const connection = await createConnection();
			const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
			if (existingUser.length > 0) {
				throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
			}

			const hashPassword = await bcrypt.hash(password, 10);
			const activationLink = uuid.v4();

			const [insertResult] = await connection.query('INSERT INTO users (email, password, activation_link) VALUES (?, ?, ?)', [email, hashPassword, activationLink]);
			const id = insertResult.insertId;

			await mailService.sendActivationMail(email, `${process.env.API_URL}/activate/${activationLink}`);

			const userDto = new UserDto({ id, email, is_activated: false, balance: 0.00 });

			const tokens = tokenService.generateTokens({ ...userDto });
			await tokenService.saveToken(userDto.id, tokens.refreshToken);

			await connection.end();
			return { ...tokens, user: userDto };
		} catch (error) {
			throw new Error(error.message);
		}
	}

	async activate(activationLink) {
		try {
			const connection = await createConnection();
			const [userLink] = await connection.execute('SELECT * FROM users WHERE activation_link = ?', [activationLink]);

			if (userLink.length === 0) {
				throw ApiError.BadRequest('Некорректная ссылка активации');
			}

			const user = userLink[0];
			if (user.is_activated === 1) {
				throw ApiError.BadRequest('Пользователь уже активирован');
			}

			await connection.execute('UPDATE users SET is_activated = ? WHERE id = ?', [1, user.id]);
			await connection.end();

			console.log('Пользователь активирован успешно');
		} catch (error) {
			console.error('Ошибка при активации пользователя:', error);
			throw ApiError.BadRequest(error.message);
		}
	}

	async login(email, password) {
		try {
			const connection = await createConnection();
			const [userRows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

			if (userRows.length === 0) {
				throw ApiError.BadRequest('Пользователь с таким email не найден');
			}

			const user = userRows[0];
			const isPassEquals = await bcrypt.compare(password, user.password);

			if (!isPassEquals) {
				throw ApiError.BadRequest('Неверный пароль');
			}

			const userDto = new UserDto(user);
			const tokens = tokenService.generateTokens({...userDto});

			await tokenService.saveToken(userDto.id, tokens.refreshToken);
			await connection.end();

			return {...tokens, user: userDto};
		} catch (error) {
			console.error('Ошибка при входе:', error);
			throw ApiError.BadRequest(error.message);

		}
	}

	async logout(refreshToken){
		const token = await tokenService.removeToken(refreshToken);
		return token;
	}

	async refresh(refreshToken) {
		try {
			if (!refreshToken) {
				throw ApiError.UnauthorizedError('Отсутствует refreshToken');
			}

			const userData = tokenService.validateRefreshToken(refreshToken);
			const tokenFromDb = await tokenService.findToken(refreshToken);
			if (!userData || !tokenFromDb) {
				throw ApiError.UnauthorizedError;
			}

			const userId = userData.id;
			const connection = await createConnection();

			const [userRows] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId]);

			if (userRows.length === 0) {
				throw ApiError.BadRequest('Пользователь не найден');
			}

			const user = userRows[0];
			const userDto = new UserDto(user);
			const tokens = tokenService.generateTokens({...userDto});

			await tokenService.saveToken(userId, tokens.refreshToken);

			await connection.end();

			return {...tokens, user: userDto};
		} catch (error) {
			console.error('Ошибка при обновлении токена:', error);
			throw new Error(error.message);
		}
	}

	async sendResetEmail(email){
		const connection = await createConnection();
		const [userRows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

		if (userRows.length === 0) {
			throw ApiError.BadRequest('Пользователь с таким email не найден');
		}

		const link = userRows[0].activation_link;

		await resetMailService.sendActivationMail(email, `${process.env.API_URL}/proofUser/${link}`);

		await connection.end();

		return { message: 'Письмо для сброса пароля успешно отправлено' };

	}

	async proofUser(activationLink){
		try {
			const connection = await createConnection();
			const [userLink] = await connection.execute('SELECT * FROM users WHERE activation_link = ?', [activationLink]);

			if (userLink.length === 0) {
				throw ApiError.BadRequest('Некорректная ссылка активации');
			}

			await connection.end();
			return { message: "Пароль успешно сброшен" };
		} catch (error) {
			console.error('Ошибка при активации пользователя:', error);
			throw ApiError.BadRequest(error.message);
		}
	}

	async changeEmail(email, id){
		try {
			const connection = await createConnection();
			const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
			if (existingUser.length > 0) {
				throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
			}

			const [updateResult] = await connection.query('UPDATE users SET email = ? WHERE id = ?', [email, id]);
			const [updateResult2] = await connection.query('UPDATE users SET is_activated = ? WHERE id = ?', [0, id]);


			await connection.end();
			return { message: 'Почта успешно изменена' };
		} catch (error) {
			throw new Error(error.message);
		}
	}

	async changePassword(password, activationLink, id) {
		try {
			const connection = await createConnection();
			const hashPassword = await bcrypt.hash(password, 10);
			if(activationLink){
				const [existingUser] = await connection.query('SELECT * FROM users WHERE activation_link = ?', [activationLink]);
				if (existingUser.length === 0) {
					throw new Error('Пользователь с данным activationLink не найден');
				}
				const [updateResult] = await connection.query('UPDATE users SET password = ? WHERE activation_link = ?', [hashPassword, activationLink]);

			}
			if(id){
				const [existingUser] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
				if (existingUser.length === 0) {
					throw new Error('Пользователь с данным id не найден');
				}
				const [updateResult] = await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashPassword, id]);

			}
			await connection.end();
			return { message: 'Пароль успешно изменен' };
		} catch (error) {
			console.error('Ошибка при изменении пароля:', error);
			throw ApiError.BadRequest(error.message);
		}
	}

}

module.exports = new UserService();