const portfolioModel = require('../model/portfolio.model');
const mongoose = require('mongoose');

/**
 * @name getMyPortfolioController
 * @description get the logged-in editor's own portfolio
 * @route GET /api/portfolio/my
 * @access Private (Editor)
 */
async function getMyPortfolioController(req, res) {
    try {
        const editorId = req.user?._id || req.user?.id;

        if (!editorId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (req.user?.role !== 'editor') {
            return res.status(403).json({ message: "Forbidden: Only editors have a portfolio" });
        }

        const portfolio = await portfolioModel
            .findOne({ editor: editorId })
            .populate('editor', 'name username email profileImage bio skills rating');

        if (!portfolio) {
            return res.status(404).json({ message: "Portfolio not found. You have not created a portfolio yet." });
        }

        return res.status(200).json({ portfolio });
    } catch (err) {
        console.error("Error in getMyPortfolioController:", err);
        return res.status(500).json({
            message: "Internal server error while fetching portfolio",
            error: err.message
        });
    }
}

/**
 * @name createPortfolioController
 * @description create/upload a portfolio for editor
 * @route POST /api/portfolio
 * @access Private (Editor)
 */
async function createPortfolioController(req, res) {
    try {
        const editorId = req.user?._id || req.user?.id;

        if (!editorId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (req.user?.role !== 'editor') {
            return res.status(403).json({ message: "Forbidden: Only editors can create a portfolio" });
        }

        // Check if portfolio already exists for this editor
        const existingPortfolio = await portfolioModel.findOne({ editor: editorId });
        if (existingPortfolio) {
            return res.status(409).json({
                message: "Portfolio already exists for this editor. Use PATCH /api/portfolio/:portfolioId to update it.",
                portfolioId: existingPortfolio._id
            });
        }

        const {
            title,
            bio,
            skills,
            software,
            experience,
            experienceUnit,
            specialization,
            portfolioItems,
            socialLinks,
            hourlyRate,
            availability,
            isPublic
        } = req.body;

        if (!title || typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ message: "Portfolio title is required" });
        }

        const portfolio = await portfolioModel.create({
            editor: editorId,
            title: title.trim(),
            bio: bio ? bio.trim() : '',
            skills: Array.isArray(skills) ? skills : [],
            software: Array.isArray(software) ? software : [],
            experience: experience !== undefined ? Math.max(0, Number(experience)) : 0,
            experienceUnit: experienceUnit || 'years',
            specialization: Array.isArray(specialization) ? specialization : [],
            portfolioItems: Array.isArray(portfolioItems) ? portfolioItems : [],
            socialLinks: socialLinks || {},
            hourlyRate: hourlyRate !== undefined ? Math.max(0, Number(hourlyRate)) : undefined,
            availability: availability || 'available',
            isPublic: isPublic !== undefined ? Boolean(isPublic) : true
        });

        return res.status(201).json({
            message: "Portfolio created successfully",
            portfolio
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "Portfolio already exists for this editor" });
        }
        console.error("Error in createPortfolioController:", err);
        return res.status(500).json({
            message: "Internal server error while creating portfolio",
            error: err.message
        });
    }
}

/**
 * @name updatePortfolioController
 * @description update portfolio by portfolioId
 * @route PATCH /api/portfolio/:portfolioId
 * @access Private (Editor who owns the portfolio)
 */
async function updatePortfolioController(req, res) {
    try {
        const editorId = req.user?._id || req.user?.id;
        const portfolioId = req.params.portfolioId || req.params.id;

        if (!editorId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (req.user?.role !== 'editor') {
            return res.status(403).json({ message: "Forbidden: Only editors can update their portfolio" });
        }

        if (!mongoose.Types.ObjectId.isValid(portfolioId)) {
            return res.status(400).json({ message: "Invalid portfolio ID" });
        }

        const portfolio = await portfolioModel.findById(portfolioId);
        if (!portfolio) {
            return res.status(404).json({ message: "Portfolio not found" });
        }

        if (portfolio.editor.toString() !== editorId.toString()) {
            return res.status(403).json({ message: "Forbidden: You do not own this portfolio" });
        }

        const allowedFields = [
            'title',
            'bio',
            'skills',
            'software',
            'experience',
            'experienceUnit',
            'specialization',
            'portfolioItems',
            'socialLinks',
            'hourlyRate',
            'availability',
            'isPublic'
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                if (field === 'title') {
                    if (typeof req.body.title !== 'string' || req.body.title.trim() === '') {
                        return res.status(400).json({ message: "Title cannot be empty" });
                    }
                    portfolio.title = req.body.title.trim();
                } else if (field === 'experience' || field === 'hourlyRate') {
                    portfolio[field] = Math.max(0, Number(req.body[field]));
                } else {
                    portfolio[field] = req.body[field];
                }
            }
        }

        await portfolio.save();

        return res.status(200).json({
            message: "Portfolio updated successfully",
            portfolio
        });
    } catch (err) {
        console.error("Error in updatePortfolioController:", err);
        return res.status(500).json({
            message: "Internal server error while updating portfolio",
            error: err.message
        });
    }
}

/**
 * @name deletePortfolioController
 * @description delete portfolio by portfolioId
 * @route DELETE /api/portfolio/:portfolioId
 * @access Private (Editor who owns the portfolio)
 */
async function deletePortfolioController(req, res) {
    try {
        const editorId = req.user?._id || req.user?.id;
        const portfolioId = req.params.portfolioId || req.params.id;

        if (!editorId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }

        if (req.user?.role !== 'editor') {
            return res.status(403).json({ message: "Forbidden: Only editors can delete their portfolio" });
        }

        if (!mongoose.Types.ObjectId.isValid(portfolioId)) {
            return res.status(400).json({ message: "Invalid portfolio ID" });
        }

        const portfolio = await portfolioModel.findById(portfolioId);
        if (!portfolio) {
            return res.status(404).json({ message: "Portfolio not found" });
        }

        if (portfolio.editor.toString() !== editorId.toString()) {
            return res.status(403).json({ message: "Forbidden: You do not own this portfolio" });
        }

        await portfolioModel.findByIdAndDelete(portfolioId);

        return res.status(200).json({
            message: "Portfolio deleted successfully"
        });
    } catch (err) {
        console.error("Error in deletePortfolioController:", err);
        return res.status(500).json({
            message: "Internal server error while deleting portfolio",
            error: err.message
        });
    }
}

/**
 * @name getPortfolioByEditorIdController
 * @description get portfolio of an editor using editorId
 * @route GET /api/portfolio/:editorId
 * @access Public
 */
async function getPortfolioByEditorIdController(req, res) {
    try {
        const editorId = req.params.editorId || req.params.id;

        if (!mongoose.Types.ObjectId.isValid(editorId)) {
            return res.status(400).json({ message: "Invalid editor ID" });
        }

        const portfolio = await portfolioModel
            .findOne({ editor: editorId })
            .populate('editor', 'name username email profileImage bio skills rating totalReviews');

        if (!portfolio) {
            return res.status(404).json({ message: "Portfolio not found for this editor" });
        }

        // If portfolio is set to not public, only the owner can view it
        if (!portfolio.isPublic) {
            const currentUserId = req.user?._id || req.user?.id;
            if (!currentUserId || currentUserId.toString() !== editorId.toString()) {
                return res.status(403).json({ message: "This portfolio is set to private" });
            }
        }

        return res.status(200).json({ portfolio });
    } catch (err) {
        console.error("Error in getPortfolioByEditorIdController:", err);
        return res.status(500).json({
            message: "Internal server error while fetching editor portfolio",
            error: err.message
        });
    }
}

module.exports = {
    getMyPortfolioController,
    createPortfolioController,
    updatePortfolioController,
    deletePortfolioController,
    getPortfolioByEditorIdController
};
