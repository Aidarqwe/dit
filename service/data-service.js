const {createConnection} = require("../dbConnection");


class DataService{
	async getService(){
		try {
			const connection = await createConnection();
			const [dataRows] = await connection.execute('SELECT * FROM services');
			await connection.end();

			return dataRows;
		}catch (e){
			throw new Error(e.message);
		}
	}

	async getProduct(){
		try {
			const connection = await createConnection();
			const [dataRows] = await connection.execute('SELECT * FROM products');
			await connection.end();

			return dataRows;
		}catch (e){
			throw new Error(e.message);
		}
	}

}

module.exports = new DataService();