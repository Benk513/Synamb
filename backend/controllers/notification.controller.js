export const listerNotifications = catchAsync(async (req, res,next) => {
  const notifications = await Notification.find({
    destinataire: req.user._id,
  }).sort({ createdAt: -1 }).limit(20);;

  res.status(200).json({
    status: "success",
    results: notifications.length,
    data: notifications,
  });
});
 
export const supprimerNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
    message: "Notification supprimée",
  });
});


export const marquerCommeLue = catchAsync(async (req, res) => {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { lu: true },
      { new: true }
    );
  
    if (!notification) return next(new AppError("Notification introuvable", 404));
  
    res.status(200).json({
      status: "success",
      message: "Notification marquée comme lue",
      data: notification,
    });
  });
  