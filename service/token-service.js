const jwt = require("jsonwebtoken");
const {createConnection} = require("../dbConnection");
class TokenService{

	generateTokens(payload){
		const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: "30m"});
		const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: "30d"});
		return {
			accessToken,
			refreshToken
		}
	}

	validateAccessToken(token) {
		try {
			return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
		} catch (e) {
			return null;
		}
	}

	validateRefreshToken(token) {
		try {
			return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
		} catch (e) {
			return null;
		}
	}

	async saveToken(userId, refreshToken) {
		try {
			const connection = await createConnection();
			const [existingTokens] = await connection.execute('SELECT * FROM tokens WHERE user_id = ?', [userId]);

			if (existingTokens.length > 0) {
				await connection.execute('UPDATE tokens SET refresh_token = ? WHERE user_id = ?', [refreshToken, userId]);
				console.log('Token updated successfully');
			} else {
				await connection.execute('INSERT INTO tokens (user_id, refresh_token) VALUES (?, ?)', [userId, refreshToken]);
				console.log('New token saved successfully');
			}

			await connection.end();
		} catch (error) {
			console.error('Ошибка при сохранении токена:', error);
			throw new Error(error.message);
		}
	}

	async removeToken(refreshToken) {
		const connection = await createConnection();
		const sql = 'DELETE FROM tokens WHERE refresh_token = ?';
		await connection.query(sql, [refreshToken], (error, result) => {
			if (error) {
				throw error;
			}
			console.log('Token removed successfully');
		});
		await connection.end();
	}

	async findToken(refreshToken) {
		try {
			const connection = await createConnection();
			const [tokenRows] = await connection.execute('SELECT * FROM tokens WHERE refresh_token = ?', [refreshToken]);
			await connection.end();

			if (tokenRows.length === 0) {
				return null;
			}

			await connection.end();
			return tokenRows[0];
		} catch (error) {
			console.error('Ошибка при поиске токена:', error);
			throw new Error(error.message);
		}
	}
}

module.exports = new TokenService();