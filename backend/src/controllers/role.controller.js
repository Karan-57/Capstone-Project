const { FREELANCER_CONTENT_ROLES } = require('../constants/roles.constants');

/**
 * @name getAllRolesController
 * @description Get all available content-creator freelancer roles and categories
 * @route GET /api/roles
 * @access Public / Authenticated
 */
async function getAllRolesController(req, res) {
  try {
    const { category, search } = req.query;

    let roles = [...FREELANCER_CONTENT_ROLES];

    if (category) {
      roles = roles.filter(
        (r) => r.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      roles = roles.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.suggestedSkills.some((s) => s.toLowerCase().includes(q)) ||
          r.suggestedTools.some((t) => t.toLowerCase().includes(q))
      );
    }

    const formattedRoles = roles.map((r) => ({
      ...r,
      title: r.title || r.name,
      name: r.name || r.title,
    }));

    const categories = Array.from(new Set(FREELANCER_CONTENT_ROLES.map((r) => r.category)));

    return res.status(200).json({
      success: true,
      count: formattedRoles.length,
      categories,
      roles: formattedRoles,
    });
  } catch (err) {
    console.error('Error in getAllRolesController:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve freelancer roles',
      error: err.message,
    });
  }
}

/**
 * @name getRoleByIdController
 * @description Get details for a specific role ID
 * @route GET /api/roles/:roleId
 * @access Public / Authenticated
 */
async function getRoleByIdController(req, res) {
  try {
    const { roleId } = req.params;
    const role = FREELANCER_CONTENT_ROLES.find((r) => r.id === roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: `Role with ID '${roleId}' not found`,
      });
    }

    const formattedRole = {
      ...role,
      title: role.title || role.name,
      name: role.name || role.title,
    };

    return res.status(200).json({
      success: true,
      role: formattedRole,
    });
  } catch (err) {
    console.error('Error in getRoleByIdController:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve role',
      error: err.message,
    });
  }
}

module.exports = {
  getAllRolesController,
  getRoleByIdController,
};
