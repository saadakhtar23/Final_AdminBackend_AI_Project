import Notification from '../models/notification.js';

// Create a notification and emit via Socket.IO
export const createNotification = async (req, res) => {
  try {
    const { recipient, message, link } = req.body;
    const notification = await Notification.create({ recipient, message, link });
    // Emit to recipient via Socket.IO
    const io = req.app.get('io');
    io.to(recipient.toString()).emit('notification', notification);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await Notification.updateMany({ recipient: userId, read: false }, { $set: { read: true } });
    // Optionally notify other sockets for this user
    try {
      const io = req.app.get('io');
      if (io) io.to(userId.toString()).emit('notificationsMarkedRead');
    } catch (e) {
      // ignore socket emit errors
    }
    res.json({ modifiedCount: result.modifiedCount || result.nModified || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};