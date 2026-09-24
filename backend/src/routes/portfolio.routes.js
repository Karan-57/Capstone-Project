const { Router } = require('express');
const portfolioController = require('../controllers/portfolio.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const portfolioRouter = Router();

/**
 * @route GET api/portfolio/my
 * @description Get logged-in editor's portfolio
 * @access Private (Editor)
 */
portfolioRouter.get('/my', authMiddleware, portfolioController.getMyPortfolioController);

/**
 * @route POST api/portfolio
 * @description Create/upload a portfolio for editor
 * @access Private (Editor)
 */
portfolioRouter.post('/', authMiddleware, portfolioController.createPortfolioController);

/**
 * @route PATCH api/portfolio/:portfolioId
 * @description Update portfolio by portfolioId
 * @access Private (Editor)
 */
portfolioRouter.patch('/:portfolioId', authMiddleware, portfolioController.updatePortfolioController);

/**
 * @route DELETE api/portfolio/:portfolioId
 * @description Delete portfolio by portfolioId
 * @access Private (Editor)
 */
portfolioRouter.delete('/:portfolioId', authMiddleware, portfolioController.deletePortfolioController);

/**
 * @route GET api/portfolio/:editorId
 * @description Get portfolio using editor's user ID
 * @access Public
 */
portfolioRouter.get('/:editorId', portfolioController.getPortfolioByEditorIdController);

module.exports = portfolioRouter;