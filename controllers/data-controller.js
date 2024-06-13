const dataService = require("../service/data-service");

class DataController{

	async getService(req, res, next){
		try{
			const services = await dataService.getService();

			return(res.json(services));
		}catch (e){
			next(e);
		}
	}

	async getProduct(req, res, next){
		try{
			const products = await dataService.getProduct();

			return(res.json(products));
		}catch (e){
			next(e);
		}
	}
}

module.exports = new DataController();