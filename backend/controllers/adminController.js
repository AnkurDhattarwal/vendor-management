// backend/controllers/adminController.js
const User = require('../models/User');
const ApiError = require('../utils/ApiError'); // see note below

/**
 * Helper: valid child roles by parent role
 */
const allowedChild = {
  admin:    'supervendor',
  supervendor: 'subvendor',
  subvendor:   'driver'
};

class AdminController {

  // GET /api/admin/users
  static async listUsers(req, res, next) {
    try {
      const users = await User.find()
        .select('_id email role parentId createdAt')
        .sort({ createdAt: -1 });
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/admin/users/:id
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { role, parentId } = req.body;

      // cannot change the root admin
      if (id === req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Cannot modify the root admin'
        });
      }

      // fetch parent user to verify their role
      const parent = await User.findById(parentId);
      if (!parent) {
        return res.status(400).json({
          success: false,
          message: 'Parent user not found'
        });
      }

      // check that child role matches allowedChild[parent.role]
      const expected = allowedChild[parent.role];
      if (expected !== role) {
        return res.status(400).json({
          success: false,
          message: `Invalid role "${role}" for parent with role "${parent.role}". Expected "${expected}".`
        });
      }

      // update both fields atomically
      const updated = await User.findByIdAndUpdate(
        id,
        { role, parentId },
        { new: true, runValidators: true }
      );
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'User to update not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: updated._id,
          email: updated.email,
          role: updated.role,
          parentId: updated.parentId
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/admin/users/:id
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      // protect root admin
      if (id === req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete the root admin'
        });
      }

      const deleted = await User.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Optionally: you could also unset parentId on any children of this user
      await User.updateMany(
        { parentId: id },
        { parentId: null, role: null }
      );

      res.json({ success: true, message: 'User deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminController;
