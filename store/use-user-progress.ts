import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

interface UserProgressState {
    userId: string;
    streak: number;
    hearts: number;
    points: number;
    cashbackBalance: number;
    hasActiveSubscription: boolean;
    completedLessons: number[];
    isGuest: boolean;
    lastSpinDate: string | null; // YYYY-MM-DD format
    treasureAccessToken: string | null; // Token set when widget clicked (YYYY-MM-DD)
    userName?: string;
    isCourseCompleted: boolean; // Add to interface
    login: (userData?: Partial<UserProgressState>) => void;
    setGuest: (userId: string) => void;
    increaseStreak: () => void;
    reduceHeart: () => void;
    refillHearts: () => void;
    addHearts: (amount: number) => void;
    addPoints: (amount: number) => void;
    decreasePoints: (amount: number) => void;
    addCashback: (amount: number) => void;
    spendCashback: (amount: number) => boolean;
    spendPoints: (amount: number) => boolean;
    completeLesson: (id: number) => void;
    completeCourse: () => void; // Add to interface
    upgradeToPro: () => void;
    syncWithDb: () => Promise<void>;
    refreshUserData: () => Promise<void>; // Add fetch function
    setLastSpinDate: (date: string) => void;
    canSpinToday: () => boolean;
    // Paid4link verification
    setTreasureAccess: () => void;
    hasTreasureAccess: () => boolean;
    clearTreasureAccess: () => void;
    logout: () => void;
}

export const useUserProgress = create<UserProgressState>()(
    persist(
        (set, get) => ({
            userId: uuidv4(),
            streak: 1,
            hearts: 3,
            points: 10,
            cashbackBalance: 0,
            hasActiveSubscription: false,
            completedLessons: [],
            isGuest: true,
            lastSpinDate: null,
            treasureAccessToken: null,
            userName: "User",
            isCourseCompleted: false, // Initial State

            login: (userData?: Partial<UserProgressState>) => set({ isGuest: false, ...userData }),
            setGuest: (userId: string) => set({ userId, isGuest: true, hearts: 2, points: 3 }),

            completeCourse: () => {
                const { isCourseCompleted } = get();
                if (isCourseCompleted) return; // Prevent double trigger

                console.log("[UserProgress] Completing Course... (Notification ONLY, No Gems/Pro)");
                set({ isCourseCompleted: true });
                const { userId } = get();

                // Fire and forget notification
                fetch('/api/notify-manager', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        courseId: "english-basic", // Default course
                        timestamp: new Date().toISOString()
                    })
                }).catch(err => console.error("Failed to notify manager:", err));

                get().syncWithDb();
            },

            increaseStreak: () => {
                set((state) => ({ streak: state.streak + 1 }));
                get().syncWithDb();
            },
            reduceHeart: () => {
                const { hearts } = get();
                if (hearts <= 0) return;
                set({ hearts: Math.max(0, hearts - 1) });
            },

            refillHearts: () => {
                set((state) => ({ hearts: state.hearts + 5 })); // Unlimited Stacking
                get().syncWithDb();
            },

            addHearts: (amount: number) => {
                set((state) => ({ hearts: state.hearts + amount }));
                get().syncWithDb();
            },

            addPoints: (amount: number) => {
                set((state) => ({ points: state.points + amount }));
                get().syncWithDb();
            },

            decreasePoints: (amount: number) => {
                set((state) => ({ points: Math.max(0, state.points - amount) }));
                get().syncWithDb();
            },

            addCashback: (amount: number) => {
                set((state) => ({ cashbackBalance: state.cashbackBalance + amount }));
                get().syncWithDb();
            },

            spendCashback: (amount: number) => {
                const { cashbackBalance } = get();
                if (cashbackBalance < amount) return false;
                set({ cashbackBalance: cashbackBalance - amount });
                get().syncWithDb();
                return true;
            },

            spendPoints: (amount: number) => {
                const { points } = get();
                if (points < amount) return false;
                set({ points: points - amount });
                get().syncWithDb();
                return true;
            },

            completeLesson: (id: number) => {
                set((state) => {
                    if (state.completedLessons.includes(id)) return state;
                    return { completedLessons: [...state.completedLessons, id] };
                });
                get().syncWithDb();
            },

            upgradeToPro: () => {
                set((state) => ({
                    hasActiveSubscription: true,
                    points: state.points + 1000, // Upgrade Bonus: 1000 Gems
                    hearts: 5   // Strict Rule: Refill to 5, NOT Unlimited
                }));
                get().syncWithDb();
            },

            syncWithDb: async () => {
                const state = get();
                try {
                    await fetch('/api/user/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: state.userId,
                            hearts: state.hearts,
                            points: state.points,
                            isGuest: state.isGuest,
                            hasActiveSubscription: state.hasActiveSubscription,
                            cashbackBalance: state.cashbackBalance, // Include in sync
                            completedLessons: state.completedLessons,
                            isCourseCompleted: state.isCourseCompleted,
                        }),
                    });
                } catch (error) {
                    console.error("Sync failed:", error);
                }
            },

            refreshUserData: async () => {
                const { userId, isGuest: currentIsGuest } = get();
                if (!userId) return;

                try {
                    const res = await fetch(`/api/user/sync?userId=${userId}`);
                    const data = await res.json();

                    if (data.success && data.user) {
                        // Preserve current isGuest if API returns undefined/null
                        const newIsGuest = data.user.isGuest !== undefined && data.user.isGuest !== null
                            ? Boolean(data.user.isGuest)
                            : currentIsGuest;

                        set({
                            hearts: data.user.hearts ?? get().hearts,
                            points: data.user.points ?? get().points,
                            cashbackBalance: data.user.cashbackBalance ?? get().cashbackBalance,
                            isGuest: newIsGuest,
                            hasActiveSubscription: Boolean(data.user.hasActiveSubscription),
                            completedLessons: data.user.completedLessons || get().completedLessons,
                            isCourseCompleted: Boolean(data.user.isCourseCompleted),
                        });
                    }
                } catch (error) {
                    // Silent fail - keep local state
                }
            },

            setLastSpinDate: (date: string) => {
                set({ lastSpinDate: date });
            },

            canSpinToday: () => {
                const { lastSpinDate } = get();
                const today = new Date().toISOString().split("T")[0];
                return lastSpinDate !== today;
            },

            // Paid4link verification
            setTreasureAccess: () => {
                const today = new Date().toISOString().split("T")[0];
                set({ treasureAccessToken: today });
            },

            hasTreasureAccess: () => {
                const { treasureAccessToken } = get();
                const today = new Date().toISOString().split("T")[0];
                return treasureAccessToken === today;
            },

            clearTreasureAccess: () => {
                set({ treasureAccessToken: null });
            },

            logout: () => {
                set({
                    userId: uuidv4(),
                    isGuest: true,
                    hearts: 5,
                    points: 10,
                    hasActiveSubscription: false,
                    completedLessons: [],
                    isCourseCompleted: false, // RESET FLAG
                    userName: "User"
                });
                // Optional: Call API to clear cookies if needed
            }
        }),
        {
            name: 'user-progress-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
