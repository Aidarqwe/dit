const transactionService = require("../service/transaction-service");

class TransactionController{
	async getTransactions(req, res, next){
		try{
			const {id} = req.body;
			const transaction = await transactionService.getTransactions(id);

			return(res.json(transaction));
		}catch (e){
			next(e);
		}
	}
}

module.exports = new TransactionController();