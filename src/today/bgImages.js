const modules = import.meta.glob("../assets/wallpapers/*.{png,jpg,jpeg,gif,webp}", { eager: true, import: "default" });

export const bgImages = Object.values(modules);