import Approval from '../models/Approval.js';

export const getApprovals = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;

    const list = await Approval.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApprovalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Approval.findByIdAndUpdate(req.params.id, { status, reviewedBy: req.user?.name || 'Admin' }, { new: true });
    return res.json({ success: true, message: `Approval request ${status.toLowerCase()}`, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
