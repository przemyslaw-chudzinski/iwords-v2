const {getUserByChromeExtApiKey} = require("./userDAL");
const {WrongApiKeyMessage, InternalServerErrorMessage} = require("../message");

module.exports = {
    async ensureApiKeyIsValid(req, res, next) {
        /* Gets api key from header */
        const apiKey = req.header('x-api-key');
        /* Checks if api key exists */
        if (!apiKey || apiKey === '') {
            return res.json({error: true, message: new WrongApiKeyMessage()});
        }
        /* Find user by api key */
        try {
            const user = await getUserByChromeExtApiKey(apiKey);

            if (!user) {
                res.status(401);
                return res.json({error: true, message: new WrongApiKeyMessage()});
            }

            /* pass user */
            req.user = user;

            return next();

        } catch (e) {
            return res.json({error: true, message: new InternalServerErrorMessage()});
        }
    }
};
