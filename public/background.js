chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "task-reminder") {
    chrome.storage.local.get(
      ["reminderTask", "reminderSound", "reminderIcon"],
      (result) => {
        chrome.notifications.create({
          type: "basic",
          iconUrl: result.reminderIcon || "favicons/android-chrome-192x192.png",
          title: `Time to ${result.reminderTask || "complete your task"}! ✅`,
          message: "Your reminder session is complete.",
          requireInteraction: true,
          silent: result.reminderSound === false,
        });
        chrome.storage.local.remove([
          "reminderTask",
          "reminderSound",
          "reminderIcon",
        ]);
      },
    );
  }
});
