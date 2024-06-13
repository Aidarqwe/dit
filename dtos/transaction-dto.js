module.exports = class TransactionDto {
	transactionId;
	userId;
	type;
	amount;
	time;

	constructor(model) {
		this.transactionId = model.transaction_id;
		this.type = model.type;
		this.userId = model.user_id;
		this.amount = model.amount;
		this.time = model.time;
	}
}