import { useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FollowUpTask } from "@shared/schema";

const NOTIFICATION_CHECK_INTERVAL = 60000; // Check every minute
const NOTIFICATION_STORAGE_KEY = "lifelog_notified_followups";

export function useFollowUpNotifications() {
  const notifiedRef = useRef<Set<string>>(new Set());

  const { data: followUps = [] } = useQuery<FollowUpTask[]>({
    queryKey: ["/api/medical/follow-ups"],
    refetchInterval: NOTIFICATION_CHECK_INTERVAL,
  });

  const getNotifiedIds = useCallback((): Set<string> => {
    try {
      const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch {
    }
    return new Set();
  }, []);

  const saveNotifiedId = useCallback((id: string) => {
    const notified = getNotifiedIds();
    notified.add(id);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(Array.from(notified)));
    notifiedRef.current.add(id);
  }, [getNotifiedIds]);

  const showNotification = useCallback((task: FollowUpTask) => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const timeStr = task.triggerTime ? ` at ${task.triggerTime}` : "";
    const notification = new Notification("LifeLog AI - Medical Follow-up", {
      body: `${task.purpose}${timeStr}`,
      icon: "/favicon.png",
      tag: task.id,
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    saveNotifiedId(task.id);
  }, [saveNotifiedId]);

  const checkNotifications = useCallback(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const now = new Date();
    // Format today as YYYY-MM-DD in local timezone
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const notified = getNotifiedIds();

    followUps.forEach((task) => {
      if (task.status === "completed" || task.notificationsEnabled !== "true") {
        return;
      }

      if (notified.has(task.id) || notifiedRef.current.has(task.id)) {
        return;
      }

      // Extract the date portion (YYYY-MM-DD) from the stored timestamp
      // The triggerDate is stored with the intended calendar date, so we extract just the date part
      const triggerDateValue = task.triggerDate as string | Date;
      const triggerDateStr = typeof triggerDateValue === 'string' 
        ? triggerDateValue.split('T')[0] 
        : new Date(triggerDateValue).toISOString().split('T')[0];
      
      // Compare date strings directly (YYYY-MM-DD format sorts correctly)
      const isToday = triggerDateStr === todayStr;
      const isPast = triggerDateStr < todayStr;
      
      let triggerMinutes = 9 * 60; // Default 9:00 AM
      if (task.triggerTime) {
        const [hours, minutes] = task.triggerTime.split(":").map(Number);
        triggerMinutes = hours * 60 + minutes;
      }

      // Calculate days difference for past-due check
      const taskDate = new Date(triggerDateStr + 'T00:00:00');
      const todayDate = new Date(todayStr + 'T00:00:00');
      const daysDiff = Math.floor((todayDate.getTime() - taskDate.getTime()) / (24 * 60 * 60 * 1000));

      // Show notification if:
      // 1. Task is for today and current time >= trigger time
      // 2. Task is past due (but within last 7 days to avoid old notifications)
      const isTimeReached = isToday && currentTime >= triggerMinutes;
      const isPastDue = isPast && daysDiff <= 7;

      if (isTimeReached || isPastDue) {
        showNotification(task);
      }
    });
  }, [followUps, getNotifiedIds, showNotification]);

  useEffect(() => {
    notifiedRef.current = getNotifiedIds();
    checkNotifications();

    const interval = setInterval(checkNotifications, NOTIFICATION_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [checkNotifications, getNotifiedIds]);

  return {
    requestPermission: async () => {
      if ("Notification" in window) {
        return await Notification.requestPermission();
      }
      return "denied";
    },
    isSupported: "Notification" in window,
    permission: "Notification" in window ? Notification.permission : "denied",
  };
}
