const {createConnection} = require("../dbConnection");
const TransactionDto = require("../dtos/transaction-dto");

class TransactionService{
	async getTransactions(id){
		try {
			const connection = await createConnection();
			const [userRows] = await connection.execute('SELECT * FROM transactions WHERE user_id = ?', [id]);
			await connection.end();

			return userRows.map(row => new TransactionDto(row));
		}catch (e){
			throw new Error(e.message);
		}
	}
}

module.exports = new TransactionService();