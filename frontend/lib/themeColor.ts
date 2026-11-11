export function setThemeColor(isDark: boolean) {
    const color = isDark ? "#020617" : "#f8fafc";
    document
        .querySelectorAll('meta[name="theme-color"]')
        .forEach((m) => m.setAttribute("content", color));
}