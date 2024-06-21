const Router = require("express").Router;
const userController = require("../controllers/user-controller");
const transactionController = require("../controllers/transaction-controller");
const dataController = require("../controllers/data-controller");
const serviceController = require('../controllers/service-controller');
const router = new Router();
const {body} = require("express-validator");
const authMiddleware = require("../middlewares/auth-middleware");
const upload = require("../middlewares/file-middleware");


router.post("/registration",
	body("email").isEmail(),
	body("password").isLength({min: 8, max: 32}),
	userController.registration);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/activate/:link", userController.activate);
router.get("/refresh", userController.refresh);

router.post("/confirmEmail", userController.confirmEmail);
router.post("/changeEmail",
	body("email").isEmail(),
	userController.changeEmail);

router.post("/reset",
	body("email").isEmail(),
	userController.reset);
router.get("/proofUser/:link", userController.proofUser);
router.post("/changePassword",
	body("password").isLength({min: 8, max: 32}),
	userController.changePassword);

router.post("/transactions", authMiddleware, transactionController.getTransactions);
router.post("/createOrder",  upload.single("file"), serviceController.createService); // обрабатывает весь data, а надо чтобы только file

router.get("/services", dataController.getService);
router.get("/products", dataController.getProduct);

module.exports = router;