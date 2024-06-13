const mysql = require("mysql2/promise");

async function createConnection() {
	try {
		const connection = await mysql.createConnection({
			host: process.env.DBHost,
			user: process.env.DBUser,
			password: process.env.DBPassword,
			database: "dit",
			port: process.env.DBPort,
		});
		console.log('Подключение к базе данных успешно');
		return connection;
	} catch (e) {
		console.error('Ошибка подключения к базе данных:', e);
		throw e;
	}
}

module.exports = { createConnection };