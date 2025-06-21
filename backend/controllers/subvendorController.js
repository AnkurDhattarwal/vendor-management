const User = require('../models/User');

class SubvendorController {
  // GET /api/subvendor/users
  // Returns [self, ...direct drivers]
  static async listMyDrivers(req, res, next) {
    try {
      const me = req.user;
      const drivers = await User.find({ parentId: me._id, role: 'driver' }).select('_id email role parentId');
      const data = [
        { _id: me._id, email: me.email, role: me.role, parentId: me.parentId },
        ...drivers
      ];
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/subvendor/users/:id
  static async deleteDriver(req, res, next) {
    try {
      const me = req.user;
      const id = req.params.id;

      // Don't allow deleting self
      if (id === me._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You cannot delete yourself.'
        });
      }

      const deleted = await User.findOneAndDelete({ _id: id, parentId: me._id, role: 'driver' });

      if (!deleted) {
        return res.status(403).json({
          success: false,
          message: 'You may only delete your direct drivers.'
        });
      }

      res.json({ success: true, message: 'Driver deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SubvendorController;
