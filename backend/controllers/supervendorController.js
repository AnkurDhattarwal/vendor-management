// backend/controllers/supervendorController.js
const User = require('../models/User');

class SupervendorController {
  // GET /api/supervendor/users
  // returns [ self, ... direct children ]
  static async listMyTeam(req, res, next) {
    try {
      const me = req.user; // set by auth middleware
      // 1) fetch direct children (subvendors)
      const children = await User.find({ parentId: me._id }).select(
        '_id email role parentId'
      );

      // 2) fetch grandchildren (drivers under your subvendors)
      const childIds = children.map(u => u._id);
      const grandchildren = await User.find({ parentId: { $in: childIds } }).select(
        '_id email role parentId'
      );
      // include self first
      const data = [
        { _id: me._id, email: me.email, role: me.role, parentId: me.parentId },
        ...children,
        ...grandchildren
      ];
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/supervendor/users/:id
 // backend/controllers/supervendorController.js (only the updateMember method)
static async updateMember(req, res, next) {
  try {
    const me = req.user;
    const targetId = req.params.id;
    const { role, parentId } = req.body;

    // 1) Disallow editing yourself
    if (targetId === me._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot change your own role or parent.'
      });
    }

    // 2) Fetch your direct children (subvendors)
    const directChildren = await User.find({ parentId: me._id }).select('_id role');
    const directIds = directChildren.map(u => u._id.toString());

    // 3) Determine if target is a direct child or a grandchild
    let child = null;
    if (directIds.includes(targetId)) {
      // Direct child
      child = await User.findById(targetId);
    } else {
      // Grandchild: driver under one of your subvendors
      child = await User.findOne({
        _id: targetId,
        parentId: { $in: directIds }
      });
    }

    if (!child) {
      return res.status(403).json({
        success: false,
        message: 'You may only update users in your own subtree (your sub‑vendors or their drivers).'
      });
    }

    // 4) Validate parentId & role based on position in the tree
    const underMe    = parentId === me._id.toString();
    const underChild = directIds.includes(parentId);

    if (underMe) {
      // Assigning directly under you: allow subvendor or driver
      if (!['subvendor', 'driver'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Direct children must be assigned role subvendor or driver.'
        });
      }
    } else if (underChild) {
      // Assigning under one of your subvendors: must be driver under a subvendor
      const parentNode = directChildren.find(u => u._id.toString() === parentId);
      if (parentNode.role !== 'subvendor' || role !== 'driver') {
        return res.status(400).json({
          success: false,
          message: 'You may only assign drivers under your sub‑vendors.'
        });
      }
    } else {
      // Any other parentId is invalid
      return res.status(400).json({
        success: false,
        message: 'Parent ID must be either your own ID or one of your sub‑vendors.'
      });
    }

    // 5) Perform the update
    child.role = role;
    child.parentId = parentId;
    await child.save();

    res.json({
      success: true,
      data: {
        _id: child._id,
        email: child.email,
        role: child.role,
        parentId: child.parentId
      }
    });
  } catch (err) {
    next(err);
  }
}


  // DELETE /api/supervendor/users/:id
  static async deleteMember(req, res, next) {
    try {
      const me = req.user;
      const targetId = req.params.id;

      // cannot delete self
      if (targetId === me._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You cannot delete yourself.'
        });
      }

      // ensure the target is a direct child
      const child = await User.findOneAndDelete({
        _id: targetId,
        parentId: me._id
      });
      if (!child) {
        return res.status(403).json({
          success: false,
          message: 'You may only delete your direct sub‑vendors or drivers.'
        });
      }

      res.json({ success: true, message: 'Member deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SupervendorController;
