import fs from "fs";
import path from "path";
const ensureDir = (p) => {
    const dir = path.dirname(p);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
};
export const readJSON = (filePath, fallback) => {
    try {
        if (!fs.existsSync(filePath)) {
            ensureDir(filePath);
            fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), "utf8");
            return fallback;
        }
        const data = fs.readFileSync(filePath, "utf8");
        return data ? JSON.parse(data) : fallback;
    }
    catch {
        return fallback;
    }
};
export const writeJSON = (filePath, data) => {
    ensureDir(filePath);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};
export const clearJSON = (filePath) => {
    ensureDir(filePath);
    fs.writeFileSync(filePath, "", "utf8");
};
export const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath))
            fs.unlinkSync(filePath);
    }
    catch { }
};
