
import { Notification, NotificationType, CommunityUser } from '../types';

const NOTIFICATIONS_KEY = 'communityNotifications';

const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const saveToStorage = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};

export const notificationService = {
    create(data: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): Notification {
        const allNotifications = getFromStorage<Notification[]>(NOTIFICATIONS_KEY, []);
        const newNotification: Notification = {
            id: `notif_${Date.now()}_${Math.random()}`,
            ...data,
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        // Keep the list from growing indefinitely, cap at 200 per user for this demo
        const userNotifications = allNotifications.filter(n => n.userId === data.userId);
        if(userNotifications.length > 200) {
            // Remove the oldest notification for this user
            const oldestNotifId = userNotifications.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0].id;
            const indexToRemove = allNotifications.findIndex(n => n.id === oldestNotifId);
            if(indexToRemove > -1) {
                allNotifications.splice(indexToRemove, 1);
            }
        }

        allNotifications.push(newNotification);
        saveToStorage(NOTIFICATIONS_KEY, allNotifications);
        return newNotification;
    },

    getNotificationsForUser(userId: string): Notification[] {
        const allNotifications = getFromStorage<Notification[]>(NOTIFICATIONS_KEY, []);
        return allNotifications
            .filter(n => n.userId === userId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    getUnreadCountForUser(userId: string): number {
        const userNotifications = this.getNotificationsForUser(userId);
        return userNotifications.filter(n => !n.isRead).length;
    },

    markAsRead(notificationId: string): void {
        const allNotifications = getFromStorage<Notification[]>(NOTIFICATIONS_KEY, []);
        const notification = allNotifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
            saveToStorage(NOTIFICATIONS_KEY, allNotifications);
        }
    },

    markAllAsRead(userId: string): void {
        const allNotifications = getFromStorage<Notification[]>(NOTIFICATIONS_KEY, []);
        allNotifications.forEach(n => {
            if (n.userId === userId) {
                n.isRead = true;
            }
        });
        saveToStorage(NOTIFICATIONS_KEY, allNotifications);
    },

    deleteNotification(notificationId: string): void {
        let allNotifications = getFromStorage<Notification[]>(NOTIFICATIONS_KEY, []);
        allNotifications = allNotifications.filter(n => n.id !== notificationId);
        saveToStorage(NOTIFICATIONS_KEY, allNotifications);
    },
};
