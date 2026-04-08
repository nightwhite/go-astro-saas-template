import { create } from "zustand";

type NavState = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const useNavStore = create<NavState>((set) => ({
  isOpen: false,
  setIsOpen: (value) => set({ isOpen: value }),
}));

