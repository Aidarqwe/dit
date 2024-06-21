const servicesService = require("../service/services-service");


class ServiceController{
	async createService(req, res, next){
		try{
			const {id, email, serviceName, serviceId, name, number, details} = req.body;
			// console.log(req)
			const file = req.file;

			const serviceData = {
				id,
				email,
				serviceName,
				serviceId,
				name,
				number,
				details: details || "No details",
				file: file ? file.path : null
			};
			console.log(serviceData)
			// const userData = await userService.registration();
			return(res.json(serviceData));
		}catch (e){
			next(e);
		}
	}
}

module.exports = new ServiceController();